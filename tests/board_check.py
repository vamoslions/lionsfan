"""Independent A/B browser contexts, using a simulated authenticated GitHub server.

This does NOT claim access to two real GitHub accounts and creates no public
test issues (which could expose a personal GitHub identity).
"""
import argparse
import html
from urllib.parse import urlsplit, parse_qs
from playwright.sync_api import sync_playwright


def run(base, chrome):
    with sync_playwright() as playwright:
        browser = playwright.chromium.launch(executable_path=chrome, headless=True)
        issues, errors, queries = [], [], []
        api_state = {"status": 200}
        sessions = {}

        def make_context(account):
            context = browser.new_context(viewport={"width": 1440, "height": 1000})
            context.add_cookies([dict(name="mock-account", value=account, domain="github.com", path="/")])

            def api(route):
                query = parse_qs(urlsplit(route.request.url).query)
                assert "creator" not in query and "assignee" not in query
                queries.append((account, query))
                if api_state["status"] != 200:
                    route.fulfill(status=api_state["status"], json={"message": "simulated failure"})
                    return
                # Include duplicates and unrelated content to exercise filtering.
                route.fulfill(json=issues + issues[:1] + [
                    dict(number=77, title="unrelated", labels=[], body="not board"),
                    dict(number=78, title="[팬보드] PR", labels=[], pull_request={}),
                ])

            def editor(route):
                request = route.request
                if request.method == "POST":
                    assert f"mock-account={account}" in request.headers.get("cookie", "")
                    fields = parse_qs(request.post_data)
                    number = len(issues) + 1
                    issues.append(dict(number=number, title=fields["title"][0],
                        body=fields["body"][0], labels=[dict(name="fanboard")],
                        created_at=f"2026-11-21T12:00:{number:02d}Z",
                        html_url=f"https://github.com/vamoslions/lionsfan/issues/{number}",
                        user=dict(login=account)))
                    route.fulfill(content_type="text/html", body="<p>Server save successful</p>")
                    return
                fields = parse_qs(urlsplit(request.url).query)
                route.fulfill(content_type="text/html", body=f"""
                    <meta charset="utf-8">
                    <p>Simulated GitHub editor: {account}</p>
                    <form method="post" action="/vamoslions/lionsfan/issues/mock-save">
                      <input name="title" value="{html.escape(fields['title'][0], quote=True)}">
                      <textarea name="body">{html.escape(fields['body'][0])}</textarea>
                      <button>Submit new issue</button>
                    </form>""")

            context.route("https://api.github.com/repos/vamoslions/lionsfan/issues*", api)
            context.route("https://github.com/vamoslions/lionsfan/issues/**", editor)
            pages = {}
            for view, path in (("board", "magazine.html"), ("dashboard", "")):
                page = context.new_page()
                page.clock.install()
                page.on("pageerror", lambda error: errors.append(str(error)))
                page.goto(base + "/" + path, wait_until="networkidle")
                pages[view] = page
            return context, pages

        for account in ("account-A", "account-B"):
            sessions[account] = make_context(account)
        a = sessions["account-A"][1]
        b = sessions["account-B"][1]
        # Old private browser data must never leak into the public feed.
        a["board"].evaluate("""localStorage.setItem('vamos-lions-cheers-v1',
            JSON.stringify([{id:'old-private',name:'private',message:'PRIVATE DRAFT',at:'2026-11-20T00:00:00Z'}]))""")
        a["board"].reload(wait_until="networkidle")
        assert "PRIVATE DRAFT" not in b["board"].locator("#cheerList").inner_text()
        assert "PRIVATE DRAFT" not in a["board"].locator("#cheerList").inner_text()
        assert a["board"].locator(".board-legacy").is_visible()

        def publish(page, name, message):
            page.locator("#cheerName").fill(name)
            page.locator("#cheerMsg").fill(message)
            before = len(issues)
            with page.expect_popup() as opened:
                page.locator("#cheerForm button[type=submit]").click()
            popup = opened.value
            popup.wait_for_load_state()
            assert len(issues) == before
            assert message not in page.locator("#cheerList").inner_text()
            assert "아직 게시 전" in page.locator("#boardStatus").inner_text()
            popup.get_by_role("button", name="Submit new issue").click()
            assert len(issues) == before + 1
            popup.close()

        def advance_all():
            for _, pages in sessions.values():
                for page in pages.values():
                    page.clock.fast_forward(181000)

        publish(a["board"], "팬 A", "A의 공개 응원")
        advance_all()
        for pages in (a, b):
            for page in pages.values():
                page.wait_for_function("document.querySelector('#cheerList').textContent.includes('A의 공개 응원')",
                                       polling=100, timeout=10000)
                assert "A의 공개 응원" in page.locator("[data-home-posts]").inner_text()
        publish(b["board"], "팬 B", "B의 공개 응원")
        advance_all()
        for pages in (a, b):
            for page in pages.values():
                page.wait_for_function("LIONS_BOARD.posts().length === 2")
                assert "B의 공개 응원" in page.locator("#cheerList li").first.inner_text()
                assert [post["authorLogin"] for post in page.evaluate("LIONS_BOARD.posts()")] == ["account-B", "account-A"]
                page.reload(wait_until="networkidle")
                page.wait_for_function("LIONS_BOARD.posts().length === 2")
                assert "A의 공개 응원" in page.locator("#cheerList").inner_text()
                assert "B의 공개 응원" in page.locator("#cheerList").inner_text()
        assert queries and not errors, errors
        print("PASS (mock server): independent authenticated A/B contexts, reciprocal automatic public updates")
        print("PASS: board + dashboard + home preview, newest first, duplicate/PR filtering, reload persistence")
        print("PASS: browser-only legacy data excluded; editor opening is NOT reported as server save")
        # Pop-up failure must not be misreported as saved, or create a local post.
        blocked = a["board"]
        blocked.evaluate("window.open = () => null")
        blocked.locator("#cheerName").fill("차단")
        blocked.locator("#cheerMsg").fill("저장되지 않은 글")
        blocked.locator("#cheerForm button[type=submit]").click()
        assert "아직 공개되지 않았습니다" in blocked.locator("#boardStatus").inner_text()
        assert len(issues) == 2
        assert blocked.evaluate("LIONS_BOARD.posts().length") == 2
        print("PASS: blocked editor never reports publication or inserts a private 'public' post")
        api_state["status"] = 503
        advance_all()
        for page in (a["dashboard"], b["dashboard"]):
            page.wait_for_function("document.querySelector('#boardStatus').textContent.includes('연결 지연')")
            assert page.evaluate("LIONS_BOARD.posts().length") == 2
        print("PASS: server failure preserves last public snapshot")
        api_state["status"] = 200
        no_storage = browser.new_context()
        no_storage.add_init_script("""Object.defineProperty(window, 'localStorage', {
          get() { throw new DOMException('Storage disabled', 'SecurityError'); }
        });""")
        no_storage.route("https://api.github.com/repos/vamoslions/lionsfan/issues*",
                         lambda route: route.fulfill(json=issues))
        guest = no_storage.new_page()
        guest.on("pageerror", lambda error: errors.append(str(error)))
        guest.goto(base + "/", wait_until="networkidle")
        guest.wait_for_function("LIONS_BOARD.posts().length === 2")
        assert not errors, errors
        print("PASS: anonymous session with browser storage disabled still reads both public posts")
        print("NOT TESTED: two real GitHub account logins / actual public issue creation")
        browser.close()


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--base", default="http://localhost:8080")
    parser.add_argument("--chrome", default="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome")
    args = parser.parse_args()
    run(args.base.rstrip("/"), args.chrome)
