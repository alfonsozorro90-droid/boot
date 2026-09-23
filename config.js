window.BOT_CONFIG = {
  // =========================================================
  // INFORMACIÓN DEL BOT
  // =========================================================

  title: "Generador documental inteligente",

  subtitle:
    "Guías + documentos + video + Gemini · ejecución directa en GitHub Pages",


  // =========================================================
  // GEMINI
  // =========================================================

  // Tu API Key de Gemini.
  GEMINI_API_KEY: "AQ.Ab8RN6IuyFXz9Y4UEPzE5UMd0BLWxd7s_9Dwr2EX7v1Q81sVPw",

  // Modelo principal para:
  // - analizar guías
  // - comparar documentos
  // - generar borradores
  // - regenerar secciones
  // - auditoría documental
  GEMINI_MODEL: "gemini-3.5-flash",

  // Modelo utilizado para:
  // - subir videos
  // - transcribir
  // - detectar acciones ACC-XXXX
  // - analizar procedimientos
  GEMINI_VIDEO_MODEL: "gemini-3.5-flash",

  // Modelo utilizado para verificar fotogramas/evidencias visuales.
  GEMINI_VISUAL_MODEL: "gemini-3.5-flash",


  // =========================================================
  // GOOGLE DRIVE
  // =========================================================

  /*
   * IMPORTANTE:
   *
   * Aquí NO sirve el client_id que venía dentro de:
   *
   * DRIVE_SERVICE_ACCOUNT_JSON
   *
   * Ese ID pertenece a una Service Account.
   *
   * La nueva versión GitHub Pages necesita un:
   *
   * OAuth 2.0 Client ID
   * Tipo: Web application
   *
   * Cuando lo creemos en Google Cloud tendrá una forma similar a:
   *
   * 123456789-xxxxxxxxxxxxxxxx.apps.googleusercontent.com
   *
   * Por ahora puede quedar vacío.
   */
  GOOGLE_OAUTH_CLIENT_ID: "",


  // Carpeta que utilizabas en la versión Python.
  //
  // Se conserva aquí como referencia/configuración,
  // aunque la versión web actual usa IndexedDB
  // para sus checkpoints locales.
  DRIVE_CHECKPOINT_FOLDER_ID:
    "14jxURP2guWGt0xFE4L4jv9RLs52Ji4zD",


  // =========================================================
  // ARCHIVOS Y GUÍAS
  // =========================================================

  // Máximo de guías simultáneas.
  MAX_GUIDES: 8,

  // Tamaño máximo recomendado para documentos normales.
  MAX_FILE_MB: 50,

  // Máximo admitido por la interfaz para video.
  MAX_VIDEO_MB: 1900,


  // =========================================================
  // AUDITORÍA VISUAL DE VIDEO
  // =========================================================

  // Cantidad de fotogramas candidatos que se buscan
  // alrededor de cada acción ACC-XXXX.
  VISUAL_CANDIDATES_PER_ACTION: 3,

  // Cantidad de acciones procesadas por grupo durante
  // la revisión visual.
  VISUAL_VERIFY_BATCH: 5
};