"""Browser regression checks; board API is mocked (no public test posts)."""
import argparse
import json
from pathlib import Path
from playwright.sync_api import sync_playwright


def run(base, chrome):
    with sync_playwright() as playwright:
        browser = playwright.chromium.launch(executable_path=chrome, headless=True)
        context = browser.new_context(viewport={"width": 1440, "height": 1000})
        issues = []
        errors = []
        context.route("https://api.github.com/repos/vamoslions/lionsfan/issues*",
                      lambda route: route.fulfill(json=issues))
        magazine, dashboard = context.new_page(), context.new_page()
        for page in (magazine, dashboard):
            page.on("pageerror", lambda error: errors.append(str(error)))
            page.clock.install()
        magazine.goto(base + "/magazine.html", wait_until="networkidle")
        dashboard.goto(base + "/", wait_until="networkidle")
        for text in ("첫 번째 테스트", "최신 테스트"):
            magazine.locator("#cheerName").fill("두탭확인")
            magazine.locator("#cheerMsg").fill(text)
            magazine.locator("#cheerForm button[type=submit]").click()
            dashboard.wait_for_function(
                "(text) => document.querySelector('#cheerList').textContent.includes(text)", arg=text)
        assert dashboard.locator("#cheerList .cheer-line").count() == 2
        assert "최신 테스트" in dashboard.locator("#cheerList li").first.inner_text()
        latest = magazine.evaluate("LIONS_BOARD.posts()[0]")
        issues.extend([{
            "number": 999, "title": "[팬보드] 두탭확인",
            "body": f"최신 테스트\n\n---\n<!-- vamos-post:{latest['id']} -->",
            "labels": [{"name": "fanboard"}], "created_at": latest["at"],
            "html_url": "https://github.com/vamoslions/lionsfan/issues/999",
        }] * 2)
        dashboard.clock.fast_forward(61000)
        dashboard.evaluate("LIONS_BOARD.refresh(true)")
        dashboard.wait_for_function(
            "LIONS_BOARD.posts().some(post => post.scope === 'public')")
        assert dashboard.locator("#cheerList .cheer-line").count() == 2
        magazine.wait_for_function(
            "LIONS_BOARD.posts().some(post => post.scope === 'public')")
        assert magazine.locator("#cheerList .cheer-item").count() == 2
        print("PASS: two tabs, latest first, public/draft ID dedup, duplicate API records")
        dashboard.wait_for_function("LIONS_LIVE.news && LIONS_LIVE.fa")
        before = dashboard.locator("#newsFeature").inner_text()
        stamp = dashboard.evaluate("LIONS_LIVE.news.lastSuccessAt")
        context.route("**/data/*.json", lambda route: route.abort())
        dashboard.evaluate("LIONS_LIVE_REFRESH()")
        dashboard.wait_for_function("LIONS_LIVE.offline")
        assert dashboard.locator("#newsFeature").inner_text() == before
        assert dashboard.evaluate("LIONS_LIVE.news.lastSuccessAt") == stamp
        assert "기존 데이터 유지" in dashboard.locator("#newsUpdated").inner_text()
        context.unroute("**/data/*.json")
        print("PASS: fetched real news/FA rendered; network failure keeps content/success timestamp")
        assert dashboard.locator('#dashRoster img:not([src$="default.svg"])').count() == 0
        simulation = dashboard.evaluate("""() => {
          const cfg = LIONS_DATA.simulation;
          const options = {lineup: cfg.expectedLineup.batters, pitcher: cfg.expectedLineup.pitcher,
            opponent: cfg.opponents[0], iterations: 1000};
          const a = LIONS_SIM.simulate(options), b = LIONS_SIM.simulate(options);
          return {same: a.winRate === b.winRate && a.avgFor === b.avgFor,
            countedRuns: a.batters.reduce((sum, row) => sum + row.runsPerGame, 0),
            runs: a.avgFor,
            paGap: (Math.max(...a.batters.map(row => row.pa)) -
              Math.min(...a.batters.map(row => row.pa))) / 1000};
        }""")
        assert simulation["same"]
        assert abs(simulation["countedRuns"] - simulation["runs"]) < 1e-8
        assert simulation["paGap"] <= 1
        print("PASS: simulation reproducibility, runner accounting and continuous batting order")
        for width in (1440, 768, 390, 320):
            for route in ("", "magazine.html"):
                page = context.new_page()
                page.set_viewport_size({"width": width, "height": 900})
                page.on("pageerror", lambda error: errors.append(str(error)))
                page.goto(base + "/" + route, wait_until="networkidle")
                assert page.evaluate("document.documentElement.scrollWidth <= document.documentElement.clientWidth"), (width, route)
                assert page.locator(".home-shortcuts a").count() == 4
                if not route:
                    page.locator("#squadLoadExpected").click()
                    assert page.locator("#squadCount").inner_text() == "10 / 10"
                    page.locator("#squadSave").click()
                    page.reload(wait_until="networkidle")
                    assert page.locator("#squadCount").inner_text() == "10 / 10"
                    page.locator("[data-schedule-view='list']").click()
                    assert page.locator("#dashSchedule").is_visible()
                    page.locator(".topbar [data-theme-toggle]").click()
                page.close()
        assert not errors, errors
        print("PASS: 1440/768/390/320px, menus, squad persistence, schedule, theme, no page errors")
        browser.close()


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--base", default="http://localhost:8080")
    parser.add_argument("--chrome", default="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome")
    args = parser.parse_args()
    run(args.base.rstrip("/"), args.chrome)
