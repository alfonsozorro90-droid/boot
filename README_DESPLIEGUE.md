# Bot documental V15 — Streamlit + GitHub Pages

## Arquitectura

- `app.py`: entrada mínima de Streamlit.
- `bot_core/engine.py`: motor documental, video, Gemini, Drive, capturas y exportación.
- `bot_core/models.py`: modelos Pydantic.
- `bot_core/settings.py`: configuración central.
- `bot_core/bootstrap.py`: barrera final de errores.
- `site/`: portada estática para GitHub Pages que incrusta la app pública de Streamlit.
- `.github/workflows/pages.yml`: despliegue automático de GitHub Pages.

## 1. Probar

```bash
python -m py_compile app.py bot_core/*.py
python PRUEBAS_V15.py
```

## 2. Desplegar el backend Streamlit

En Streamlit Community Cloud usa:

- repositorio: este repositorio
- rama: `main`
- archivo principal: `app.py`

Configura los Secrets desde la interfaz de Streamlit. Nunca subas `secrets.toml`.

## 3. Conectar GitHub Pages con Streamlit

Obtén la URL pública de Streamlit, por ejemplo:

`https://mi-generador.streamlit.app`

Edita `site/config.js`:

```js
window.BOT_CONFIG = {
  streamlitUrl: "https://mi-generador.streamlit.app",
  title: "Generador documental",
  subtitle: "Instructivos a partir de guías, documentos y videos"
};
```

Haz commit y push.

## 4. Activar GitHub Pages

En GitHub:

`Settings -> Pages -> Build and deployment -> Source: GitHub Actions`

El workflow `Deploy GitHub Pages` publicará la carpeta `site/` y GitHub mostrará la URL final.

## Importante sobre “siempre activo”

GitHub Pages sirve la portada estática de forma independiente, pero no ejecuta Python.
La aplicación real sigue ejecutándose en Streamlit Community Cloud. Si Streamlit la
hiberna por inactividad, la portada de Pages seguirá disponible, pero el iframe puede
mostrar la pantalla de reactivación de Streamlit. Para backend 24/7 real se necesita
un hosting de backend que no hiberne.

## Flujo visual V15

Una acción termina en uno de dos estados:

1. `verified`: captura exacta aprobada y utilizable.
2. `manual_review`: la búsqueda segura se agotó y se inserta una lámina de revisión.

No existe fallback a la imagen cronológicamente más cercana ni a la captura de otro paso.
El motor no repite automáticamente una búsqueda ya agotada en cada rerun. El usuario
puede reintentar explícitamente solo las acciones de revisión manual.
