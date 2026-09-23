# V15 Hardcore

- Mantiene el checkpoint de transcripción `video-v5-5min-selective-resumable`.
- Cambia únicamente la política visual para no reutilizar capturas antiguas dudosas.
- Estado terminal por acción: `verified` o `manual_review`.
- Las acciones agotadas no se vuelven a procesar automáticamente en cada rerun.
- Reintento explícito solo de pendientes manuales.
- La generación Word/PDF continúa cuando la fase visual terminó, usando placeholders honestos en los casos no verificables.
- Separación segura en `settings`, `models`, `engine` y `bootstrap`.
- GitHub Pages sirve una portada estable y embebe la app pública de Streamlit.
- GitHub Actions despliega automáticamente `site/` en Pages.
