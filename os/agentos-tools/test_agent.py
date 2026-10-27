import json
import tempfile
import unittest
from pathlib import Path
from agentos_agent import run


class AgentTests(unittest.TestCase):
    def test_model_tool_call_and_permission_denial(self):
        with tempfile.TemporaryDirectory(dir=Path(__file__).parent) as base:
            allowed = Path(base) / "allowed"
            blocked = Path(base) / "blocked"
            allowed.mkdir()
            blocked.mkdir()
            (allowed / "report.pdf").write_text("report")

            def model_for(path):
                replies = iter([
                    {"content": None, "tool_calls": [{"id": "one", "function": {"name": "find_files", "arguments": json.dumps({"path": str(path), "name": "report"})}}]},
                    {"content": "Found report.pdf", "tool_calls": []}
                ])
                return lambda _messages, _tools: next(replies)

            result = run("Find my report", [allowed.resolve()], model_for(allowed))
            self.assertTrue(result["ok"])
            self.assertEqual(result["tool_result"]["entries"][0]["name"], "report.pdf")
            denied = run("Find private files", [allowed.resolve()], model_for(blocked))
            self.assertEqual(denied["error"], "permission_denied")


if __name__ == "__main__":
    unittest.main()
