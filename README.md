# lonecesito
Portal de necesidades LoNecesito: publica lo que buscas y recibe propuestas de proveedores.

## Primera versión

Implementación de la imagen de diseño aprobada, con portada, categorías, solicitudes, proceso y sección para proveedores. HTML, CSS y JavaScript sin dependencias de ejecución. Incluye adaptación móvil e interacciones de demostración.

- Rama de trabajo: `codex/diseno-original`.
- Entrada web: [`index.html`](index.html).
- Guía y límites: [`2026-10-22_LEEME.md`](2026-10-22_LEEME.md).
- Referencia original: [`assets/2026-10-22_diseno-original.png`](assets/2026-10-22_diseno-original.png).
- Comprobaciones: `npm run check` y `npm test`.

Los formularios guardan datos solo en el navegador. No hay autenticación real, base de datos compartida, pagos ni envío de solicitudes a terceros. Los límites se explican en los propios formularios.

Web publicada en GitHub Pages: https://gruemp.github.io/lonecesito/ . Se despliega desde la raíz de `codex/diseno-original`.

Verificación: cinco pruebas de lógica aprobadas, sintaxis y recursos locales comprobados. Portada revisada en el navegador en la nube; filtros, detalles y guardado local de propuestas comprobados. Los formularios de publicación, proveedores e ingreso se abren correctamente. La revisión móvil en un dispositivo real queda pendiente. No se afirma coincidencia exacta de píxeles con la imagen generada.
