"""Modelos estructurados compartidos por el motor documental y visual."""

from typing import Literal
from pydantic import BaseModel, ConfigDict, Field

# =========================================================
# MODELOS DE DATOS PARA RESPUESTAS ESTRUCTURADAS DE GEMINI
# =========================================================


class MissingQuestion(BaseModel):
    model_config = ConfigDict(extra="forbid")

    category: str = Field(
        default="Información del proceso",
        description=(
            "Categoría breve para agrupar la pregunta, por ejemplo: "
            "Datos operativos, Responsables, Fechas y periodos o Control documental."
        ),
    )
    question: str = Field(
        description=(
            "Pregunta específica que debe responder el usuario. "
            "No debe ser genérica ni repetir otra pregunta."
        )
    )
    why_needed: str = Field(
        description="Razón breve por la cual el dato es necesario."
    )
    required: bool = Field(
        description="Indica si la respuesta es indispensable para generar el documento."
    )


class SectionAssessment(BaseModel):
    model_config = ConfigDict(extra="forbid")

    order: int = Field(ge=1)
    title: str
    guide_instruction: str = Field(
        description=(
            "Instrucción normativa interpretada desde la guía. "
            "No es contenido final del documento."
        )
    )
    criteria: list[str]
    required: bool
    status: Literal["completo", "parcial", "faltante"]
    evidence: list[str] = Field(
        description=(
            "Fragmentos o referencias breves del documento de origen "
            "que sustentan la sección."
        )
    )
    draft_content: str = Field(
        description=(
            "Borrador construido únicamente con información sustentada. "
            "Debe quedar vacío cuando no sea posible redactar sin inventar."
        )
    )
    output_format: Literal["parrafo", "lista", "tabla", "mixto"]
    missing_questions: list[MissingQuestion]


class GuideAnalysis(BaseModel):
    model_config = ConfigDict(extra="forbid")

    detected_process: str
    selected_guide_index: int = Field(ge=0)
    selected_guide_name: str
    supporting_guide_indices: list[int]
    selection_reason: str
    proposed_document_title: str
    general_requirements: list[str]
    sections: list[SectionAssessment]
    warnings: list[str]


class UserAnswer(BaseModel):
    model_config = ConfigDict(extra="forbid")

    section_title: str
    question: str
    answer: str


class FinalTable(BaseModel):
    model_config = ConfigDict(extra="forbid")

    title: str
    headers: list[str]
    rows: list[list[str]]


class FinalSection(BaseModel):
    model_config = ConfigDict(extra="forbid")

    order: int = Field(ge=1)
    title: str
    paragraphs: list[str]
    bullets: list[str]
    numbered_items: list[str] = Field(
        default_factory=list,
        description=(
            "Pasos o actividades que deben presentarse como lista numerada. "
            "No deben incluir viñetas ni el número dentro del texto."
        ),
    )
    tables: list[FinalTable]
    source_basis: list[str]


class ValidationItem(BaseModel):
    model_config = ConfigDict(extra="forbid")

    section_title: str
    criterion: str
    status: Literal["cumple", "parcial", "no_aplica"]
    note: str


class FinalDocument(BaseModel):
    model_config = ConfigDict(extra="forbid")

    title: str
    subtitle: str
    introductory_note: str
    sections: list[FinalSection]
    validation: list[ValidationItem]
    warnings: list[str]


class AuditReport(BaseModel):
    model_config = ConfigDict(extra="forbid")

    validation: list[ValidationItem]
    warnings: list[str]
    editorial_summary: str = Field(
        description=(
            "Resumen breve de la calidad de redacción, coherencia, trazabilidad "
            "y cumplimiento del documento revisado."
        )
    )




class VideoAction(BaseModel):
    """Acción operativa atómica identificada en el documento o video."""

    model_config = ConfigDict(extra="ignore")

    action_id: str = Field(
        default="",
        description="Identificador secuencial. Se normaliza localmente como ACC-0001.",
    )
    timestamp_start: str = Field(
        default="",
        description="Hora de inicio absoluta en formato HH:MM:SS.",
    )
    timestamp_end: str = Field(
        default="",
        description="Hora de finalización absoluta cuando pueda determinarse.",
    )
    actor: str = Field(
        default="",
        description="Cargo, rol o hablante que ejecuta la acción.",
    )
    system: str = Field(
        default="",
        description="Aplicación, sistema o plataforma utilizada.",
    )
    location_path: str = Field(
        default="",
        description="Módulo, menú, pestaña, pantalla o ruta de navegación.",
    )
    action: str = Field(
        description=(
            "Una sola acción operativa, concreta y verificable. No debe contener "
            "una secuencia completa ni fusionar acciones diferentes."
        )
    )
    interface_element: str = Field(
        default="",
        description="Botón, enlace, campo, filtro, lista, casilla o archivo utilizado.",
    )
    data_handled: str = Field(
        default="",
        description="Dato consultado, registrado, modificado, cargado o descargado.",
    )
    validation: str = Field(
        default="",
        description="Validación, condición o comprobación realizada antes de continuar.",
    )
    result: str = Field(
        default="",
        description="Mensaje, estado, registro o resultado que confirma la acción.",
    )
    evidence: str = Field(
        default="",
        description="Evidencia visual o auditiva que sustenta la acción.",
    )
    uncertainty: str = Field(
        default="",
        description="Dato dudoso o no legible que requiere confirmación.",
    )


class VideoActionBatch(BaseModel):
    """Inventario de acciones de un tramo de video."""

    model_config = ConfigDict(extra="ignore")

    actions: list[VideoAction] = Field(
        default_factory=list,
        description=(
            "Todas las acciones operativas atómicas del tramo, en orden "
            "cronológico y sin fusionar acciones diferentes."
        ),
    )


class VideoTranscript(BaseModel):
    """Transcripción estructurada producida a partir de un video."""

    model_config = ConfigDict(extra="ignore")

    detected_language: str = Field(
        default="",
        description="Idioma principal detectado en el video.",
    )
    duration_estimate: str = Field(
        default="",
        description=(
            "Duración aproximada observada, por ejemplo 08:35. "
            "Déjala vacía si no puede determinarse con seguridad."
        ),
    )
    speakers: list[str] = Field(
        default_factory=list,
        description=(
            "Etiquetas de hablantes detectados, por ejemplo Hablante 1, "
            "Hablante 2 o nombres propios solo cuando sean explícitos."
        ),
    )
    full_transcript: str = Field(
        default="",
        description=(
            "Transcripción completa y cronológica. Debe incluir marcas de "
            "tiempo y no resumir intervenciones relevantes."
        ),
    )
    actions: list[VideoAction] = Field(
        default_factory=list,
        description=(
            "Inventario exhaustivo de acciones operativas atómicas. Cada clic, "
            "selección, navegación, diligenciamiento, carga, validación o resultado "
            "diferenciable debe aparecer como un elemento independiente."
        ),
    )
    visual_evidence: list[str] = Field(
        default_factory=list,
        description=(
            "Información visual relevante con marca de tiempo: textos, tablas, "
            "formularios, sistemas, acciones, rutas y evidencias."
        ),
    )
    key_facts: list[str] = Field(
        default_factory=list,
        description="Hechos verificables mencionados o mostrados en el video.",
    )
    uncertainties: list[str] = Field(
        default_factory=list,
        description=(
            "Fragmentos inaudibles, nombres dudosos, textos ilegibles o "
            "información que requiere confirmación humana."
        ),
    )

class VisualAlignmentItem(BaseModel):
    """Resultado semántico para relacionar una acción con un instante del video."""

    model_config = ConfigDict(extra="ignore")

    action_id: str
    matched: bool = False
    timestamp_seconds: float | str = Field(default=0.0)
    confidence: float = Field(default=0.0, ge=0.0, le=1.0)
    observed_system: str = ""
    observed_element: str = ""
    evidence_summary: str = ""
    reject_reason: str = ""
    application_match: bool = False
    element_match: bool = False
    shared_screen_visible: bool = False
    shared_screen_left: float = Field(default=0.0, ge=0.0, le=1.0)
    shared_screen_top: float = Field(default=0.0, ge=0.0, le=1.0)
    shared_screen_right: float = Field(default=1.0, ge=0.0, le=1.0)
    shared_screen_bottom: float = Field(default=1.0, ge=0.0, le=1.0)
    meeting_chrome_visible: bool = False
    meeting_only_or_recursive: bool = False
    task_switcher_visible: bool = False
    transition_frame: bool = False


class VisualAlignmentBatch(BaseModel):
    """Alineación visual de varias acciones dentro de un intervalo del video."""

    model_config = ConfigDict(extra="ignore")

    items: list[VisualAlignmentItem] = Field(default_factory=list)


class VisualCandidateChoice(BaseModel):
    """Elección de un fotograma real entre candidatos numerados."""

    model_config = ConfigDict(extra="ignore")

    action_id: str
    matched: bool = False
    candidate_index: int = Field(default=-1, ge=-1)
    confidence: float = Field(default=0.0, ge=0.0, le=1.0)
    observed_system: str = ""
    observed_element: str = ""
    evidence_summary: str = ""
    reject_reason: str = ""
    application_match: bool = False
    element_match: bool = False
    shared_screen_visible: bool = False
    shared_screen_left: float = Field(default=0.0, ge=0.0, le=1.0)
    shared_screen_top: float = Field(default=0.0, ge=0.0, le=1.0)
    shared_screen_right: float = Field(default=1.0, ge=0.0, le=1.0)
    shared_screen_bottom: float = Field(default=1.0, ge=0.0, le=1.0)
    meeting_chrome_visible: bool = False
    meeting_only_or_recursive: bool = False
    task_switcher_visible: bool = False
    transition_frame: bool = False


class VisualFrameVerificationItem(BaseModel):
    """Verificación de la imagen exacta que se insertará en el documento."""

    model_config = ConfigDict(extra="ignore")

    action_id: str
    matched: bool = False
    confidence: float = Field(default=0.0, ge=0.0, le=1.0)
    observed_system: str = ""
    observed_element: str = ""
    evidence_summary: str = ""
    reject_reason: str = ""
    application_match: bool = False
    element_match: bool = False
    shared_screen_visible: bool = False
    meeting_only_or_recursive: bool = False
    task_switcher_visible: bool = False
    transition_frame: bool = False


class VisualFrameVerificationBatch(BaseModel):
    model_config = ConfigDict(extra="ignore")

    items: list[VisualFrameVerificationItem] = Field(default_factory=list)


class AppError(Exception):
    """Error controlado que puede mostrarse al usuario."""


