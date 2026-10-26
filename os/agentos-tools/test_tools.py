import tempfile
import unittest
from pathlib import Path
from agentos_tools import handle


class ToolTests(unittest.TestCase):
    def test_find_and_denied_access(self):
        with tempfile.TemporaryDirectory(dir=Path(__file__).parent) as base:
            root = Path(base)
            allowed = root / "allowed"
            blocked = root / "blocked"
            allowed.mkdir()
            blocked.mkdir()
            (allowed / "report.pdf").write_text("real file")
            (blocked / "secret.pdf").write_text("private")
            try:
                (allowed / "escape").symlink_to(blocked, target_is_directory=True)
            except OSError:
                pass  # Windows test hosts may forbid creating symlinks.
            result = handle({"action": "find", "path": str(allowed), "name": "report"}, [allowed.resolve()])
            self.assertTrue(result["ok"])
            self.assertEqual([x["name"] for x in result["entries"]], ["report.pdf"])
            self.assertEqual(handle({"action": "list", "path": str(blocked)}, [allowed.resolve()])["error"], "permission_denied")
            self.assertNotIn("escape", [x["name"] for x in handle({"action": "list", "path": str(allowed)}, [allowed.resolve()])["entries"]])


if __name__ == "__main__":
    unittest.main()

