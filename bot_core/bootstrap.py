"""Punto de arranque y barrera final de errores para Streamlit."""
from __future__ import annotations

import shutil
import streamlit as st

from .engine import AppError, _unicode_safe_text, main


def runtime_health() -> dict[str, bool]:
    return {
        "ffmpeg": bool(shutil.which("ffmpeg")),
        "ffprobe": bool(shutil.which("ffprobe")),
        "libreoffice": bool(shutil.which("libreoffice") or shutil.which("soffice")),
    }


def run_app() -> None:
    try:
        main()
    except AppError as error:
        st.error(_unicode_safe_text(error))
    except UnicodeError as error:
        st.error(
            "Se detectó un problema de codificación Unicode. El avance guardado se "
            "conserva. Detalle controlado: " + _unicode_safe_text(error)[:350]
        )
    except Exception as error:
        st.error(
            "El proceso se detuvo de forma controlada y conservará los checkpoints. "
            f"Tipo: {type(error).__name__}. Detalle: {_unicode_safe_text(error)[:500]}"
        )
