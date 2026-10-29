import subprocess
import unittest
from agentos_action import launch


class ActionTests(unittest.TestCase):
    def test_allowlist_and_explicit_launch(self):
        calls = []

        def runner(argv, **_kwargs):
            calls.append(argv)
            return subprocess.CompletedProcess(argv, 0, "", "")

        self.assertEqual(launch(["browser", "editor"], runner)["ok"], True)
        self.assertEqual(calls, [["gtk-launch", "firefox-esr"], ["gtk-launch", "org.kde.kate"]])
        self.assertEqual(launch(["/bin/sh"], runner)["error"], "app_not_allowed")
        self.assertEqual(len(calls), 2)
