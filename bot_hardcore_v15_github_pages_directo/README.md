# BOT HARDCORE V15 · GitHub Pages directo

Esta carpeta reemplaza el despliegue anterior **GitHub → Streamlit** por una aplicación que se ejecuta directamente en **GitHub Pages**.

No hay `iframe`, no hay redirección a `streamlit.app` y el `app.py` no participa en la ejecución pública. La interfaz, la lectura de archivos, el flujo de análisis, la edición, la generación de documentos y las llamadas a Gemini ocurren desde el navegador.

## Funciones incluidas

- Hasta **8 guías** PDF, DOCX o TXT.
- Origen PDF, DOCX, TXT o video.
- Lectura PDF con PDF.js y DOCX con Mammoth.js.
- Análisis de guías y selección de la guía aplicable con Gemini.
- Conservación de títulos, orden, criterios, pasos y brechas.
- Preguntas críticas por información faltante.
- Generación del borrador estructurado.
- Edición manual de párrafos, pasos, viñetas, tablas y sustento.
- Regeneración de una sección sin rehacer todo el documento.
- Auditoría final contra guía + origen.
- Video mediante Gemini Files API desde un `File/Blob` del navegador.
- Inventario exhaustivo `ACC-0001`, `ACC-0002`, etc.
- Captura de fotogramas reales alrededor de las marcas de tiempo.
- Verificación de fotogramas con Gemini y revisión manual de casos dudosos.
- Word `.docx` y PDF.
- Si la guía principal es DOCX, el generador reutiliza el paquete de esa guía y conserva sus relaciones de encabezado/pie/sección mientras sustituye el cuerpo.
- Checkpoints de transcripción y evidencia visual en IndexedDB.
- Acceso opcional a videos de Google Drive mediante OAuth 2.0 de navegador.
- Copia de la V15 Python original en `legacy_v15_python/` únicamente como referencia.

## 1. Configurar Gemini

Abre `config.js` y pega la clave:

```js
GEMINI_API_KEY: "TU_CLAVE"
```

También puedes dejarla vacía. Al abrir la web, entra en **Configuración** y pega la clave; se guardará en `localStorage` de ese navegador.

Los modelos por defecto conservan los nombres usados por la V15:

```js
GEMINI_MODEL: "gemini-flash-latest"
GEMINI_VIDEO_MODEL: "gemini-3.5-flash"
GEMINI_VISUAL_MODEL: "gemini-3.5-flash"
```

Si tu proyecto de Gemini usa otros modelos, cámbialos en `config.js` o en la interfaz.

## 2. Google Drive opcional

Los archivos locales **no necesitan Drive**.

Para pegar un enlace/ID de un video de Drive:

1. En Google Cloud habilita **Google Drive API**.
2. Crea un **OAuth 2.0 Client ID** de tipo **Web application**.
3. Añade como origen JavaScript autorizado la URL de tu Pages, por ejemplo:
   `https://TU-USUARIO.github.io`
4. Copia el Client ID en:

```js
GOOGLE_OAUTH_CLIENT_ID: "TU_CLIENT_ID.apps.googleusercontent.com"
```

La aplicación solicita `drive.readonly` y descarga el archivo seleccionado desde el navegador.

## 3. Reemplazar el repositorio

Borra el contenido actual del proyecto y copia **todo el contenido de esta carpeta en la raíz** del repositorio.

Ejemplo desde PowerShell, estando dentro de la carpeta nueva:

```powershell
git add -A
git commit -m "feat: migrar bot V15 a GitHub Pages directo"
git push origin main
```

Si tu rama principal es `master`, el workflow también la admite.

## 4. Activar GitHub Pages

En GitHub:

**Settings → Pages → Build and deployment → Source → GitHub Actions**

El archivo `.github/workflows/pages.yml` publicará automáticamente la raíz del repositorio.

La URL quedará con esta forma:

```text
https://TU-USUARIO.github.io/TU-REPOSITORIO/
```

## Estructura

```text
/
├── index.html
├── config.js
├── .nojekyll
├── 404.html
├── css/
│   └── styles.css
├── js/
│   ├── app.js
│   ├── gemini.js
│   ├── file-reader.js
│   ├── video.js
│   ├── drive.js
│   ├── documents.js
│   ├── storage.js
│   └── utils.js
├── .github/workflows/pages.yml
└── legacy_v15_python/     # respaldo; no se ejecuta
```

## Diferencias técnicas respecto a la V15 Streamlit

### Drive

La V15 Python podía usar una **cuenta de servicio**. Una página estática no tiene un proceso servidor permanente, por lo que esta versión usa OAuth 2.0 del usuario en el navegador. El objetivo funcional —leer un video de Drive— se mantiene, pero cambia el mecanismo de autenticación.

### Videos muy grandes

Gemini Files API admite subir un `Blob/File` desde navegador, pero un video obtenido desde Drive debe convertirse primero en un `Blob` local antes de entregarlo al SDK. Por eso el límite práctico depende de la RAM del navegador/dispositivo. Un archivo cercano a 1.9 GB puede no ser viable en equipos con poca memoria aunque la V15 Python sí pudiera descargarlo por bloques a disco.

### Formatos de video no reproducibles por el navegador

Gemini puede recibir varios formatos, pero la fase de **capturas visuales** usa `<video>` + `<canvas>`. MP4/H.264 y WebM son los formatos más interoperables. AVI/FLV/WMV u otros pueden transcribirse mediante Gemini, pero el navegador puede impedir extraer fotogramas si no tiene códec para reproducirlos. En ese caso usa MP4/WebM para conservar la evidencia visual automática.

### Conversión Word → PDF

No existe LibreOffice de servidor en GitHub Pages. El Word se construye como OOXML y el PDF se genera directamente con jsPDF. Ambos contienen el contenido final auditado; si la guía principal es DOCX, el Word intenta conservar encabezados, pies, sección y recursos del archivo guía.

## Dependencias cargadas desde CDN

- Google Gen AI JavaScript SDK
- PDF.js
- Mammoth.js
- JSZip
- jsPDF
- Google Identity Services (solo Drive)

La aplicación necesita conexión a Internet para Gemini y estas librerías.
