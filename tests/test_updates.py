import sys
import tempfile
import unittest
from pathlib import Path
from unittest.mock import patch

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "scripts"))
import update_data as updater


class UpdatesTest(unittest.TestCase):
    def test_dedup_url_title_and_order(self):
        def article(title, href, date):
            return dict(title=title, href=href, publishedAt=date, source="test")
        items = [
            article("삼성 계약", "https://example.org/1?utm_source=x", "2026-11-20T12:00:00Z"),
            article("삼성 계약", "https://example.org/2", "2026-11-20T11:00:00Z"),
            article("변경 제목", "https://example.org/1", "2026-11-20T10:00:00Z"),
            article("삼성 경기", "https://example.org/3", "2026-11-21T10:00:00Z"),
        ]
        result = updater.dedupe_news(items)
        self.assertEqual(len(result), 2)
        self.assertEqual(result[0]["title"], "삼성 경기")

    def test_failure_preserves_file_and_success_time(self):
        with tempfile.TemporaryDirectory() as temporary:
            output = Path(temporary)
            original = b'{"lastSuccessAt":"2026-11-20T00:00:00Z","items":[]}\n'
            (output / "news.json").write_bytes(original)
            with patch.object(updater, "fetch", side_effect=TimeoutError):
                self.assertFalse(updater.update("news", output))
            self.assertEqual((output / "news.json").read_bytes(), original)
            self.assertFalse(updater.read_json(output / "status.json")["news"]["ok"])

    def test_contract_requires_official_execution_sentence(self):
        self.assertTrue(updater.confirmed_contract("삼성, 내부 FA 홍길동 계약", "삼성은 홍길동과 계약을 체결했다.", "홍길동"))
        self.assertFalse(updater.confirmed_contract("삼성 FA 홍길동 협상", "홍길동과 계약을 체결할 예정이다.", "홍길동"))
        self.assertFalse(updater.confirmed_contract("FA 홍길동 계약", "다른 선수와 계약을 체결했다.", "홍길동"))
        self.assertFalse(updater.confirmed_contract("FA 홍길동 계약", "홍길동과 계약을 체결할 예정이다.", "홍길동"))

    def test_wrong_season_and_unknown_structure_rejected(self):
        with self.assertRaises(ValueError):
            updater.approved_players(b"<html>error</html>", 2027)

    def test_empty_feed_is_not_success(self):
        with patch.object(updater, "fetch", return_value=b"<rss><channel/></rss>"):
            with self.assertRaises(ValueError):
                updater.collect_news()


if __name__ == "__main__":
    unittest.main()
