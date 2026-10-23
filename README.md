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


## Modelo funcional de bienes y servicios (rama de revisión)

La rama `codex/modelo-pagina-2026-10-23` adapta la demostración al esquema de `modelo pagina.xlsx`. El titular autorizó publicar esta actualización el 23-10-2026, integrándola en la rama utilizada por GitHub Pages. Ver [especificación funcional](docs/modelo-funcional-2026-10-23.md).

- Dos tipos de solicitudes: **bienes** y **servicios**, cada uno con categorías específicas.
- Formulario de publicación con ubicación de entrega/ejecución, cantidad y condición para bienes, presupuesto y fecha opcionales.
- Número celular opcional **no almacenado ni transmitido** en esta demostración; nunca se muestra en listados.
- Filtros por tipo, categoría y búsqueda; detalles con propuestas locales comparables y cierre de solicitud local.
- Compatibilidad de solicitudes guardadas con tipos antiguos `productos` y `negocios`, convertidos a `bienes` para su visualización.
- La prueba sigue **sin servidor ni comunicación entre usuarios**; no habilita contratación, pagos ni contactos comerciales.

Se añadieron cinco pruebas a las cinco preexistentes. Las **10 pruebas** se ejecutaron y aprobaron en un entorno JavaScript aislado durante la preparación de la rama; queda pendiente ejecutar `npm run check`, `npm test` y la revisión visual/móvil en un entorno de desarrollo antes de fusionar. La publicación de esta actualización fue autorizada expresamente. Continúa siendo una demostración local; la publicación no equivale a lanzamiento comercial, backend operativo ni recepción de solicitudes reales.
