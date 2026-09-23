from __future__ import annotations
import ast
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent
files = [
    ROOT / "app.py",
    ROOT / "bot_core/engine.py",
    ROOT / "bot_core/models.py",
    ROOT / "bot_core/settings.py",
    ROOT / "bot_core/bootstrap.py",
]

for path in files:
    ast.parse(path.read_text(encoding="utf-8"))
    print(f"[OK] Sintaxis: {path.relative_to(ROOT)}")

engine = (ROOT / "bot_core/engine.py").read_text(encoding="utf-8")
settings = (ROOT / "bot_core/settings.py").read_text(encoding="utf-8")
assert "_visual_completion_report" in engine
assert "force_retry_pending" in engine
assert "manual_review" in engine
assert "VIDEO_VISUAL_RESOLUTION_FILENAME" in settings
assert "visual-v15-terminal-bounded-ultra-precise" in settings
print("[OK] Política visual terminal V15")

page = (ROOT / "site/index.html").read_text(encoding="utf-8")
workflow = (ROOT / ".github/workflows/pages.yml").read_text(encoding="utf-8")
assert "?embed=true" in page
assert "actions/deploy-pages@v4" in workflow
print("[OK] Frontend GitHub Pages y workflow")

config = (ROOT / ".streamlit/config.toml").read_text(encoding="utf-8")
assert 'fastReruns = false' in config
assert 'fileWatcherType = "none"' in config
print("[OK] Configuración Streamlit estable")

print("\nTODAS LAS PRUEBAS V15 TERMINARON CORRECTAMENTE.")
