import subprocess
import unittest
from agentos_status import COMMANDS, status


class StatusTests(unittest.TestCase):
    def test_only_fixed_read_only_commands(self):
        calls = []

        def runner(argv, **_kwargs):
            calls.append(argv)
            return subprocess.CompletedProcess(argv, 0, "real state", "")

        result = status(runner)
        self.assertEqual(calls, list(COMMANDS.values()))
        self.assertEqual(set(result), {"network", "bluetooth", "clock"})
        self.assertTrue(all(item["available"] for item in result.values()))

    def test_unavailable_service_is_not_reported_as_working(self):
        def runner(argv, **_kwargs):
            return subprocess.CompletedProcess(argv, 1, "", "service unavailable")

        self.assertFalse(status(runner)["bluetooth"]["available"])


if __name__ == "__main__":
    unittest.main()
