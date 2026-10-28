#!/usr/bin/env python3
"""Native Qt assistant panel. Model output never becomes a shell command."""
import json
import subprocess
import sys

from PyQt6.QtCore import QProcess
from PyQt6.QtWidgets import (
    QApplication, QHBoxLayout, QLabel, QLineEdit, QMainWindow,
    QPushButton, QPlainTextEdit, QVBoxLayout, QWidget,
)

BASE = "/usr/local/lib/agentos/"


class Panel(QMainWindow):
    def __init__(self):
        super().__init__()
        self.setWindowTitle("Lyriq Assistente")
        self.resize(760, 560)
        self.pending_apps = None
        self.process = None
        self.cancelled = False
        root = QWidget()
        self.setCentralWidget(root)
        layout = QVBoxLayout(root)
        layout.setContentsMargins(28, 28, 28, 24)
        layout.setSpacing(16)
        title = QLabel("Lyriq Assistente")
        title.setObjectName("title")
        layout.addWidget(title)
        layout.addWidget(QLabel("Encontre arquivos autorizados e abra aplicativos com sua confirmação."))
        self.entry = QLineEdit()
        self.entry.setPlaceholderText("O que você gostaria de fazer?")
        self.entry.returnPressed.connect(self.submit)
        layout.addWidget(self.entry)
        buttons = QHBoxLayout()
        self.go = QPushButton("Enviar")
        self.go.setObjectName("primary")
        self.go.clicked.connect(self.submit)
        buttons.addWidget(self.go)
        self.approve = QPushButton("Confirmar abertura")
        self.approve.setEnabled(False)
        self.approve.clicked.connect(self.confirm_apps)
        buttons.addWidget(self.approve)
        stop = QPushButton("Cancelar")
        stop.clicked.connect(self.cancel)
        buttons.addWidget(stop)
        buttons.addStretch()
        layout.addLayout(buttons)
        self.output = QPlainTextEdit()
        self.output.setReadOnly(True)
        self.output.setPlaceholderText("Os resultados reais aparecerão aqui.")
        layout.addWidget(self.output)
        privacy = QLabel("Ao usar um provedor externo, o texto do pedido é enviado a ele.")
        privacy.setObjectName("privacy")
        layout.addWidget(privacy)
        self.setStyleSheet("""
            QWidget { background: #111522; color: #e9edf8; font-size: 14px; }
            QLabel#title { font-size: 27px; font-weight: 700; }
            QLabel#privacy { color: #a4acc3; font-size: 12px; }
            QLineEdit, QPlainTextEdit { background: #1a2031; border: 1px solid #363f58;
                border-radius: 10px; padding: 12px; selection-background-color: #675be9; }
            QLineEdit:focus { border-color: #a398ff; }
            QPushButton { background: #283047; border: 1px solid #404b68; border-radius: 9px;
                padding: 9px 16px; font-weight: 600; }
            QPushButton:hover { background: #374260; }
            QPushButton:disabled { color: #71798d; background: #242a38; }
            QPushButton#primary { background: #695be8; border-color: #867aff; color: white; }
            QPushButton#primary:hover { background: #7b6df5; }
        """)

    def show_result(self, message, pending=None):
        self.output.setPlainText(message)
        self.pending_apps = pending
        self.approve.setEnabled(bool(pending))
        self.go.setEnabled(True)

    def run_process(self, script, args, done):
        self.process = QProcess(self)
        process = self.process
        process.setProgram(sys.executable)
        process.setArguments([BASE + script, *args])
        process.finished.connect(lambda _code, _status: self.finished(process, done))
        process.errorOccurred.connect(lambda _error: self.finished(process, done))
        process.start()

    def finished(self, process, done):
        if process is not self.process:
            return
        self.process = None
        if self.cancelled:
            self.show_result("Cancelado.")
        else:
            out = bytes(process.readAllStandardOutput()).decode("utf-8", "replace")
            err = bytes(process.readAllStandardError()).decode("utf-8", "replace")
            try:
                done(json.loads(out))
            except ValueError:
                self.show_result("Falha: " + (err.strip() or "resposta inválida"))
        process.deleteLater()

    def submit(self):
        prompt = self.entry.text().strip()
        if not prompt or self.process:
            return
        self.cancelled = False
        self.pending_apps = None
        self.approve.setEnabled(False)
        self.go.setEnabled(False)
        self.output.setPlainText("Executando…")
        self.run_process("agentos_agent.py", [prompt], self.agent_result)

    def agent_result(self, result):
        pending = result.get("preview", {}).get("app_ids") if result.get("approval_required") else None
        if pending:
            message = "Prévia: abrir " + ", ".join(pending) + ". Confirme para executar."
        else:
            message = result.get("answer", "") if result.get("ok") else "Falha: " + str(result.get("error"))
        if result.get("ok") and not result.get("verified") and not pending:
            message = "Resposta sem verificação por ferramenta:\n" + message
        if result.get("tool_results"):
            message += "\n\nResultados reais: " + json.dumps(result["tool_results"], ensure_ascii=False, indent=2)
        self.show_result(message, pending)

    def confirm_apps(self):
        apps = self.pending_apps
        if not apps or self.process:
            return
        self.pending_apps = None
        self.approve.setEnabled(False)
        self.go.setEnabled(False)
        self.output.setPlainText("Solicitando abertura…")
        self.run_process("agentos_action.py", apps, lambda result: self.show_result(json.dumps(result, ensure_ascii=False, indent=2)))

    def cancel(self):
        self.pending_apps = None
        self.approve.setEnabled(False)
        if self.process:
            self.cancelled = True
            self.process.kill()
            self.show_result("Cancelado.")


if __name__ == "__main__":
    app = QApplication(sys.argv)
    panel = Panel()
    panel.show()
    sys.exit(app.exec())
