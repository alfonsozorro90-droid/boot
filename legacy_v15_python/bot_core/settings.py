"""Configuración central del bot. Ajustes seguros para Streamlit Community Cloud."""

# =========================================================
# CONFIGURACIÓN GENERAL
# =========================================================

GUIDE_EXTENSIONS = ["docx", "pdf", "txt"]
VIDEO_EXTENSIONS = [
    "mp4",
    "mpeg",
    "mov",
    "avi",
    "flv",
    "mpg",
    "webm",
    "wmv",
    "3gp",
    "3gpp",
]
SOURCE_EXTENSIONS = GUIDE_EXTENSIONS + VIDEO_EXTENSIONS
ALLOWED_EXTENSIONS = GUIDE_EXTENSIONS

MODEL_DEFAULT = "gemini-flash-latest"
VIDEO_MODEL_DEFAULT = "gemini-3.5-flash"
MAX_FILE_SIZE_MB = 20
MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024
# Los videos grandes deben entrar por Google Drive para no llenar la memoria
# de Streamlit. El cargador directo queda limitado a archivos pequeños.
MAX_VIDEO_SIZE_MB = 250
MAX_VIDEO_SIZE_BYTES = MAX_VIDEO_SIZE_MB * 1024 * 1024
MAX_DRIVE_VIDEO_SIZE_MB = 1900
MAX_DRIVE_VIDEO_SIZE_BYTES = MAX_DRIVE_VIDEO_SIZE_MB * 1024 * 1024
VIDEO_PROCESSING_TIMEOUT_SECONDS = 3600
# Se inicia directamente en cinco minutos. La versión anterior intentaba diez
# minutos y, al fallar, repetía el mismo contenido en dos tramos de cinco.
VIDEO_CHUNK_SECONDS = 300
VIDEO_MIN_CHUNK_SECONDS = 120  # respaldo mínimo de 2 minutos
VIDEO_LONG_THRESHOLD_SECONDS = 1  # todo video con duración conocida usa tramos
VIDEO_MAX_OUTPUT_TOKENS = 32768
VIDEO_ACTION_AUDIT_ENABLED = True
VIDEO_ACTION_AUDIT_MODE = "selective"
VIDEO_MAX_PARALLEL_CHUNKS = 2
VIDEO_CHECKPOINT_ENABLED = True
VIDEO_CHECKPOINT_VERSION = "video-v5-5min-selective-resumable"
VIDEO_CHECKPOINT_LOCAL_DIR = ".video_checkpoints"
# Evidencia visual del instructivo. Las capturas se extraen del video real,
# se relacionan con acciones ACC-XXXX y se reutilizan mediante checkpoints.
VIDEO_VISUAL_EVIDENCE_ENABLED = True
VIDEO_VISUAL_CHECKPOINT_VERSION = "visual-v15-terminal-bounded-ultra-precise"
VIDEO_VISUAL_ALIGNMENT_VERSION = "semantic-alignment-v7-terminal-bounded-exact-frame"
VIDEO_VISUAL_ALIGNMENT_FILENAME = "semantic_alignment.json"
VIDEO_VISUAL_DIR_NAME = "visuals"
VIDEO_VISUAL_BUNDLE_NAME = "visuals_bundle.zip"
VIDEO_VISUAL_MAX_CAPTURES = 600
VIDEO_VISUAL_MIN_GAP_SECONDS = 0
VIDEO_VISUAL_FORCE_GAP_SECONDS = 60
VIDEO_VISUAL_CAPTURE_OFFSET_SECONDS = 1.10
VIDEO_VISUAL_WIDTH_PX = 1280
VIDEO_VISUAL_FFMPEG_WORKERS = 2
# Una evidencia por cada acción/subpaso. El límite es de seguridad y nunca se
# usa para muestrear silenciosamente: si se supera, la aplicación informa.
VIDEO_VISUAL_REQUIRE_EVERY_STEP = True
VIDEO_VISUAL_SMART_CROP_ENABLED = True
VIDEO_VISUAL_MAX_SAFE_ACTIONS = 600
VIDEO_VISUAL_CANDIDATE_RETRIES = 9
VIDEO_VISUAL_EARLY_ACCEPT_SCORE = 52.0
VIDEO_VISUAL_HASH_SIZE = 16
VIDEO_VISUAL_DUPLICATE_HASH_DISTANCE = 2
VIDEO_VISUAL_GLOBAL_DUPLICATE_HASH_DISTANCE = 0
VIDEO_VISUAL_REPAIR_DUPLICATES = True
VIDEO_VISUAL_STRICT_EXACT_MATCH = True
VIDEO_VISUAL_DUPLICATE_TIME_TOLERANCE_SECONDS = 4.0
VIDEO_ACTION_DUPLICATE_LOOKBACK = 5
VIDEO_VISUAL_ALIGNMENT_ENABLED = True
VIDEO_VISUAL_ALIGNMENT_MIN_CONFIDENCE = 0.74
VIDEO_VISUAL_ALIGNMENT_BATCH_ACTIONS = 8
VIDEO_VISUAL_ALIGNMENT_CONTEXT_SECONDS = 24
VIDEO_VISUAL_ALIGNMENT_TIME_TOLERANCE_SECONDS = 3.0
VIDEO_VISUAL_ALIGNMENT_SECOND_PASS_CONTEXT_SECONDS = 45
VIDEO_VISUAL_ALIGNMENT_MAX_OUTPUT_TOKENS = 16384
# Rescate adaptativo para acciones que el análisis directo del video no ubica.
# Se extraen fotogramas reales del intervalo y Gemini elige entre imágenes
# numeradas; así se evita depender de un timestamp ambiguo o de muestreo del video.
VIDEO_VISUAL_ALIGNMENT_INDIVIDUAL_CONTEXT_SECONDS = 75
VIDEO_VISUAL_CANDIDATE_RESCUE_ENABLED = True
VIDEO_VISUAL_CANDIDATE_RESCUE_MAX_FRAMES = 12
VIDEO_VISUAL_CANDIDATE_RESCUE_BATCH_FRAMES = 6
VIDEO_VISUAL_CANDIDATE_RESCUE_MIN_CONFIDENCE = 0.74
VIDEO_VISUAL_SCENE_RESCUE_ENABLED = True
VIDEO_VISUAL_SCENE_RESCUE_MAX_POINTS = 8
VIDEO_VISUAL_FRAME_VERIFICATION_ENABLED = True
VIDEO_VISUAL_FRAME_VERIFICATION_BATCH_SIZE = 6
VIDEO_VISUAL_FRAME_VERIFICATION_MIN_CONFIDENCE = 0.74
# V14: la precisión visual es estricta, pero las búsquedas tienen límites para
# que Streamlit no permanezca horas atrapado en una acción difícil.
VIDEO_VISUAL_ENABLE_SECOND_VIDEO_PASS = False
VIDEO_VISUAL_DIRECT_FRAME_RESCUE_THRESHOLD = 12
VIDEO_VISUAL_RESCUE_EARLY_ACCEPT_CONFIDENCE = 0.84
VIDEO_VISUAL_ALLOW_EXPORT_PLACEHOLDER = True
VIDEO_VISUAL_PLACEHOLDER_WIDTH = 1280
VIDEO_VISUAL_PLACEHOLDER_HEIGHT = 720
# V15: después de una búsqueda visual completa, una acción sin fotograma exacto
# queda en estado terminal de revisión manual. Así Streamlit no repite la misma
# búsqueda costosa en cada rerun ni bloquea la generación del documento.
VIDEO_VISUAL_RESOLUTION_FILENAME = "visual_resolution.json"
VIDEO_VISUAL_RESOLUTION_VERSION = "visual-resolution-v1"
VIDEO_VISUAL_TERMINAL_REVIEW_ENABLED = True
VIDEO_VISUAL_ALIGNMENT_DRIVE_SYNC_EVERY = 3
# Política de cobertura: una pantalla estática puede demostrar varias acciones
# consecutivas. Cuando Gemini comprobó semánticamente cada acción, una imagen
# idéntica no se elimina solo por repetirse; primero se valida que corresponda al
# mismo sistema y que no sea reunión, Alt+Tab ni transición.
VIDEO_VISUAL_ALLOW_SHARED_SEMANTIC_EVIDENCE = True
VIDEO_VISUAL_SHARED_STATE_MAX_DELTA_SECONDS = 12.0
VIDEO_VISUAL_SEMANTIC_FALLBACK_LEVELS = 3
VIDEO_VISUAL_EXTRACTION_POLICY_VERSION = "semantic-coverage-v6-terminal-exact-frame"
VIDEO_VISUAL_DRIVE_SYNC_EVERY = 20
VIDEO_VISUAL_MANIFEST_SYNC_EVERY = 4
VIDEO_VISUAL_PREVIEW_LIMIT = 8
VIDEO_VISUAL_KEEP_BYTES_IN_SESSION = False
VIDEO_VISUAL_CACHE_DIRECT_UPLOAD = True
# Caché persistente del video de Drive dentro del checkpoint local. Evita volver
# a descargar cientos de MB en cada rerun mientras la instancia siga activa.
DRIVE_VIDEO_CACHE_ENABLED = True
DRIVE_VIDEO_CACHE_METADATA_FILENAME = "drive_source_cache.json"
DRIVE_VIDEO_CACHE_BASENAME = "drive_source_video"
DRIVE_VIDEO_CACHE_MAX_FILES = 2
# Reutiliza temporalmente el archivo ya procesado por Gemini durante la auditoría
# visual. Si Gemini ya no lo conserva o no está ACTIVE, se vuelve a subir.
GEMINI_VISUAL_FILE_CACHE_ENABLED = True
GEMINI_VISUAL_FILE_CACHE_FILENAME = "gemini_visual_file.json"
VIDEO_POLL_INTERVAL_SECONDS = 5
DRIVE_DOWNLOAD_TIMEOUT_SECONDS = 3600
DRIVE_DOWNLOAD_CHUNK_MB = 8
DRIVE_DOWNLOAD_CHUNK_BYTES = DRIVE_DOWNLOAD_CHUNK_MB * 1024 * 1024
DRIVE_READONLY_SCOPE = "https://www.googleapis.com/auth/drive.readonly"
DRIVE_FILE_SCOPE = "https://www.googleapis.com/auth/drive.file"
MAX_GUIDES = 8
MAX_TEXT_CHARS_PER_FILE = 80_000
MAX_VIDEO_SOURCE_CHARS = 1_200_000
MAX_TOTAL_TEXT_CHARS = 1_400_000
MIN_ACTION_TEXT_CHARS = 12
MAX_TOTAL_UPLOAD_MB = 300
MAX_TOTAL_UPLOAD_BYTES = MAX_TOTAL_UPLOAD_MB * 1024 * 1024
# Límite conservador para una sola carga a Gemini Files API. Los videos más
# grandes deben dividirse o comprimirse antes de enviarse; el bot informa el
# límite de manera controlada y conserva los checkpoints existentes.
GEMINI_FILE_API_MAX_BYTES = 1_950_000_000
GEMINI_UPLOAD_RETRIES = 2
VIDEO_MEDIA_PREFLIGHT_ENABLED = True
VIDEO_LARGE_FILE_THRESHOLD_BYTES = 1024 * 1024 * 1024
VIDEO_LARGE_FILE_PROCESSING_TIMEOUT_SECONDS = 7200
DRIVE_LARGE_FILE_DOWNLOAD_TIMEOUT_SECONDS = 7200

STATUS_LABELS = {
    "completo": "Completo",
    "parcial": "Parcial",
    "faltante": "Faltante",
}

MIME_TYPES = {
    "pdf": "application/pdf",
    "docx": (
        "application/vnd.openxmlformats-officedocument."
        "wordprocessingml.document"
    ),
    "txt": "text/plain",
    "mp4": "video/mp4",
    "mpeg": "video/mpeg",
    "mov": "video/quicktime",
    "avi": "video/x-msvideo",
    "flv": "video/x-flv",
    "mpg": "video/mpeg",
    "webm": "video/webm",
    "wmv": "video/wmv",
    "3gp": "video/3gpp",
    "3gpp": "video/3gpp",
}


