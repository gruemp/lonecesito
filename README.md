# lonecesito
Portal de necesidades LoNecesito: publica lo que buscas y recibe propuestas de proveedores.

## Etapa de mejoras acordadas — 23 de octubre de 2026 (rama en revisión)

**Estado:** cambios desarrollados en `codex/mejoras-acordadas-2026-10-23`; todavía **no publicados**. No existe backend ni conexión entre usuarios.

**Especificación y alcance completo:** [Decisiones acordadas y pendientes de Firebase](docs/decisiones-y-alcance-2026-10-23.md).

La rama incluye:
- Publicación guiada con prellenado desde «¿Qué necesitas?», bienes y servicios, fecha opcional, ciudad obligatoria y **una fotografía opcional** por necesidad visible en ficha y detalle.
- **Propuestas ilimitadas**, pero una activa por nombre de proveedor y necesidad; precios **fijos y obligatorios**; orden por precio total o unitario, cantidades diferentes, cambios, historial, retiro y reoferta.
- Aceptación de propuestas, cantidades parciales con confirmación del proveedor, estado «En proceso», cancelación, resolución, reapertura e historial; ofertas antiguas pendientes de confirmar después de reactivar.
- Perfil de proveedor local, panel «Mis propuestas», favoritos, borradores de necesidades y propuestas, filtro por ciudad, contador de ofertas nuevas y reportes locales (que **no se envían**).
- Vista preparatoria para conversaciones privadas con botones de envío **deshabilitados** hasta implementar el backend.

**Seguridad y realismo:** no hay identificación real, privacidad entre usuarios, chat que conecte personas, moderación efectiva ni notificaciones push. Todos los registros quedan en un único navegador y el nombre de proveedor no verifica ninguna identidad. No usar para comercializar ni contratar servicios.

**Firebase sigue pendiente** para la etapa final, por decisión del propietario. Registro mediante Google o correo, **sin SMS**; Cloud Firestore, chat seguro, permisos, fotos, notificaciones, reportes y sincronización real se integrarán antes de operar.

**Pruebas:** 23 escenarios de lógica y estructura verificados mediante ejecución aislada de funciones; se mantiene pendiente ejecutar `npm run check && npm test` y las pruebas completas en navegador y móvil. La publicación requiere autorización expresa.

---


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


## Etapa 1 de usabilidad — revisión preparada el 23-10-2026

Rama propuesta: `codex/usabilidad-etapa1-2026-10-23`. Se apoya en el diseño y en el modelo de bienes/servicios ya presentes en `codex/diseno-original`.

- **Inicio:** dos rutas explícitas («Necesito algo» y «Puedo ofrecerlo»).
- **Publicación:** asistente de tres pasos (tipo/título/categoría; lugar/detalles; revisión/confirmación), validación de campos y navegación anterior/siguiente con teclado.
- **Borradores:** guardado automático y manual en el mismo navegador, recuperación al reabrir y opción para descartarlos. No se guarda teléfono ni se establece cuenta de usuario.
- **Mis necesidades:** muestra solo solicitudes locales; permite consultar, editar las abiertas, marcar como resueltas o cancelarlas. Los ejemplos ilustrativos no aparecen como solicitudes propias.
- **Diseño:** acciones y fichas adaptadas a pantallas pequeñas; se mantiene el aspecto visual original.
- **Compatibilidad:** conserva la clave de almacenamiento local `lonecesito-demo-v1`, los registros de prueba ya guardados y los tipos heredados.

**Alcance:** no existen cuentas reales, servidor compartido, mensajería entre usuarios, verificación, pagos ni contratación real. El usuario no debe introducir datos personales sensibles. Esta etapa no añade backend ni autoriza explotación comercial.

**Pruebas:** ampliadas de 10 a 16. Se ejecutaron con éxito en un entorno JavaScript aislado usando las funciones reales y comprobaciones estructurales de HTML. Quedan pendientes la ejecución con Node mediante `npm run check && npm test`, pruebas visuales en navegador real, accesibilidad y comprobaciones móviles. No afirmar que estas últimas se realizaron.

**Despliegue:** esta rama está destinada a revisión en Pull Request, no fusionada ni publicada automáticamente.
