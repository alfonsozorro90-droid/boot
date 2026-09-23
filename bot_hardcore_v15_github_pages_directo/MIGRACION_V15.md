# Mapa de migración V15 → GitHub Pages

| V15 Python / Streamlit | GitHub Pages directo |
|---|---|
| Streamlit UI | SPA HTML/CSS/JS |
| `st.file_uploader` | File API / drag & drop |
| `pdfplumber` | PDF.js |
| `python-docx` para leer | Mammoth.js |
| `google-genai` Python | `@google/genai` JavaScript |
| Gemini Files API | Gemini Files API con `Blob/File` |
| `st.session_state` | Estado JS + IndexedDB |
| checkpoints en disco | IndexedDB |
| Drive service account | Google Identity Services OAuth + Drive API |
| FFmpeg nativo | `<video>` + canvas para fotogramas compatibles |
| Pydantic structured output | JSON estricto + normalización local |
| edición Streamlit | editores HTML con autoguardado |
| `python-docx` export | OOXML + JSZip |
| LibreOffice/reportlab | jsPDF |
| descarga Streamlit | Blob URL nativa |
| `site/` iframe a Streamlit | eliminado |

La carpeta `legacy_v15_python` conserva la implementación anterior como referencia técnica. No forma parte de la ejecución de GitHub Pages.
