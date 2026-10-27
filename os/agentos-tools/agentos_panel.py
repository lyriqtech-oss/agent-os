#!/usr/bin/env python3
"""Minimal native GTK entry point for the optional AgentOS text agent."""
import json
import subprocess
import sys
import threading

import gi

gi.require_version("Gtk", "3.0")
from gi.repository import GLib, Gtk


class Panel(Gtk.Window):
    def __init__(self):
        super().__init__(title="Lyriq AgentOS — Assistente")
        self.set_default_size(620, 420)
        self.process = None
        self.cancelled = False
        self.pending_apps = None
        box = Gtk.Box(orientation=Gtk.Orientation.VERTICAL, spacing=12)
        box.set_border_width(16)
        self.add(box)
        box.pack_start(Gtk.Label(label="Peça ajuda com seus arquivos autorizados."), False, False, 0)
        self.entry = Gtk.Entry()
        self.entry.set_placeholder_text("Ex.: Encontre o relatório PDF")
        self.entry.connect("activate", self.submit)
        box.pack_start(self.entry, False, False, 0)
        buttons = Gtk.Box(spacing=8)
        self.go = Gtk.Button(label="Enviar")
        self.go.connect("clicked", self.submit)
        buttons.pack_start(self.go, False, False, 0)
        stop = Gtk.Button(label="Cancelar")
        stop.connect("clicked", self.cancel)
        buttons.pack_start(stop, False, False, 0)
        self.approve = Gtk.Button(label="Confirmar abertura")
        self.approve.set_sensitive(False)
        self.approve.connect("clicked", self.confirm_apps)
        buttons.pack_start(self.approve, False, False, 0)
        box.pack_start(buttons, False, False, 0)
        scroll = Gtk.ScrolledWindow()
        self.output = Gtk.TextView()
        self.output.set_editable(False)
        self.output.set_wrap_mode(Gtk.WrapMode.WORD)
        scroll.add(self.output)
        box.pack_start(scroll, True, True, 0)
        box.pack_start(Gtk.Label(label="Pedidos a provedores externos enviam o texto ao provedor configurado."), False, False, 0)
        self.connect("destroy", lambda *_: (self.cancel(), Gtk.main_quit()))

    def show_result(self, value, pending=None):
        self.output.get_buffer().set_text(value)
        self.pending_apps = pending
        self.approve.set_sensitive(bool(pending))
        self.go.set_sensitive(True)

    def confirm_apps(self, *_):
        apps = self.pending_apps
        if not apps:
            return
        self.pending_apps = None
        self.approve.set_sensitive(False)
        self.show_result("Solicitando abertura dos aplicativos…")

        def work():
            pending = None
            try:
                completed = subprocess.run([sys.executable, "/usr/local/lib/agentos/agentos_action.py", *apps],
                                           capture_output=True, text=True, timeout=70)
                result = json.loads(completed.stdout)
                message = json.dumps(result, ensure_ascii=False, indent=2)
            except (OSError, ValueError, subprocess.TimeoutExpired) as exc:
                message = f"Falha: {exc}"
            GLib.idle_add(self.show_result, message)

        threading.Thread(target=work, daemon=True).start()

    def submit(self, *_):
        prompt = self.entry.get_text().strip()
        if not prompt or self.process:
            return
        self.cancelled = False
        self.pending_apps = None
        self.approve.set_sensitive(False)
        self.go.set_sensitive(False)
        self.show_result("Executando…")
        self.go.set_sensitive(False)

        def work():
            try:
                self.process = subprocess.Popen(
                    [sys.executable, "/usr/local/lib/agentos/agentos_agent.py", prompt],
                    stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)
                out, err = self.process.communicate(timeout=90)
                try:
                    result = json.loads(out)
                    pending = result.get("preview", {}).get("app_ids") if result.get("approval_required") else None
                    if pending:
                        message = "Prévia: abrir " + ", ".join(pending) + ". Clique em Confirmar abertura para executar."
                    else:
                        message = (result.get("answer") or "") if result.get("ok") else f"Falha: {result.get('error')}"
                    if result.get("ok") and not result.get("verified") and not pending:
                        message = "Resposta do modelo sem verificação por ferramenta:\n" + message
                    if result.get("tool_result"):
                        message += "\n\nResultado real: " + json.dumps(result["tool_result"], ensure_ascii=False, indent=2)
                except json.JSONDecodeError:
                    message = err.strip() or "Falha sem resposta do agente."
            except subprocess.TimeoutExpired:
                self.process.kill()
                message = "Tempo esgotado."
                pending = None
            except Exception as exc:
                message = f"Falha: {exc}"
                pending = None
            finally:
                self.process = None
            if self.cancelled:
                message = "Cancelado."
                pending = None
            GLib.idle_add(self.show_result, message, pending)

        threading.Thread(target=work, daemon=True).start()

    def cancel(self, *_):
        self.pending_apps = None
        self.approve.set_sensitive(False)
        if self.process and self.process.poll() is None:
            self.cancelled = True
            self.process.terminate()
            self.show_result("Cancelado.")


if __name__ == "__main__":
    panel = Panel()
    panel.show_all()
    Gtk.main()
