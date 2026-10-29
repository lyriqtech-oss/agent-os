import tempfile
import unittest
from pathlib import Path
from agentos_automation import THRESHOLD, review


class AutomationTests(unittest.TestCase):
    def test_large_files_only_inside_authorized_root(self):
        with tempfile.TemporaryDirectory(dir=Path(__file__).parent) as base:
            root = Path(base)
            allowed = root / "allowed"
            blocked = root / "blocked"
            allowed.mkdir()
            blocked.mkdir()
            large = allowed / "large.bin"
            with large.open("wb") as stream:
                stream.truncate(THRESHOLD)
            (blocked / "private.bin").write_bytes(b"x")
            result = review([allowed.resolve()])
            self.assertEqual([item["path"] for item in result["large_files"]], [str(large)])
            self.assertNotIn(str(blocked), str(result))


if __name__ == "__main__":
    unittest.main()
