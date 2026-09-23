from pathlib import Path
import ast

ROOT = Path(__file__).resolve().parents[1]

def test_entrypoint_and_modules_exist():
    for rel in ["app.py", "bot_core/engine.py", "bot_core/models.py", "bot_core/settings.py"]:
        assert (ROOT / rel).exists(), rel

def test_python_files_compile():
    for rel in ["app.py", "bot_core/engine.py", "bot_core/models.py", "bot_core/settings.py", "bot_core/bootstrap.py"]:
        source = (ROOT / rel).read_text(encoding="utf-8")
        ast.parse(source)

def test_visual_versions_are_v15():
    source = (ROOT / "bot_core/settings.py").read_text(encoding="utf-8")
    assert "visual-v15-terminal-bounded-ultra-precise" in source
    assert "semantic-alignment-v7-terminal-bounded-exact-frame" in source

def test_pages_uses_streamlit_embed():
    html = (ROOT / "site/index.html").read_text(encoding="utf-8")
    assert "embed=true" in html
    assert "streamlit.app" in html
