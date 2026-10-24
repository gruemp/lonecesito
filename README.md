# lonecesito
## Diseño actual: acciones principales centradas y fotografías automáticas

- **No hay botón «Ver foto»**: en Explorar, la imagen adjunta sigue apareciendo a la derecha del resumen de cada solicitud; en el detalle, la foto se muestra automáticamente en una segunda columna; y al subir una foto en el formulario se ve la vista previa de inmediato.
- El acceso **«Soluciona una necesidad y gana dinero por ello»** se conserva únicamente debajo del botón de publicación, y se retira del antiguo menú superior redundante.
- Dos accesos principales pasan a un área **centrada y de botones grandes** debajo de las acciones de portada: **«Mis necesidades publicadas para que otros ofrezcan solucionarlas»** y **«Necesidades de terceros aceptadas para solucionar»**. La marca LoNecesito sigue permitiendo volver a Inicio.
- En PC y celular, los accesos se organizan en una columna con el mismo ancho máximo de «Publicar una necesidad»; el resto de las acciones principales también gana espacio para pulsarlas.
- Se conservan el selector nativo de ciudades, la publicación con título desde una sola letra, las aceptaciones sin formularios y los datos históricos del navegador.

Validación: **45 pruebas** de lógica y estructura superadas; HTML sin IDs duplicados ni referencias inexistentes. No se ejecutaron pruebas visuales en dispositivos físicos.

**Limitaciones:** continúa siendo una demostración local sin Firebase ni comunicación real entre personas.

Los apartados inferiores del README son registros históricos y pueden describir estados previos de la interfaz.

---
## Portada actual: un botón de publicación y ciudad móvil compatible

- La portada solo presenta **«Publicar una necesidad»** como botón de acción principal. Se eliminó el formulario previo de título/ciudad y el botón redundante de la cabecera. Al pulsar se abre directamente el asistente de tres pasos.
- En el asistente, el municipio se selecciona mediante un **`select` nativo de HTML**, compatible con Android, iOS y PC, en lugar de depender de `datalist` y las sugerencias del teclado.
- La opción **«Otra ciudad o municipio…»** muestra un campo para escribir manualmente el nombre. Se mantiene la validación de ciudad obligatoria y los valores se recuperan correctamente del borrador o de una necesidad en edición.
- Se conserva la aceptación directa sin formularios para los usuarios que ayudan, los títulos desde un solo carácter y las tarjetas individuales con foto lateral en la sección de exploración.
- Validación: **43 pruebas** de lógica y estructura ejecutadas en JavaScript aislado, HTML sin identificadores duplicados y CSS estructuralmente válido. Pruebas visuales en dispositivos reales no incluidas.

**Nota:** la plataforma continúa siendo una demostración local; Firebase, perfiles reales y comunicación entre usuarios siguen pendientes.

Las instrucciones de secciones históricas relativas al antiguo formulario de portada ya no están vigentes.

---
## Diseño vigente — títulos libres, fotos laterales y necesidades separadas

Interfaz ajustada en octubre de 2026:

- El campo inicial **«¿Qué necesitas?»** y el título del asistente no tienen `minlength` ni `maxlength`: **una letra es suficiente**, y el texto completo se conserva en el borrador y la solicitud. Sigue siendo obligatorio escribir algo distinto de espacios. Los detalles, ciudad y demás datos continúan con sus validaciones propias.
- Menú con los nombres solicitados: **Inicio**, **Soluciona una necesidad y gana dinero por ello**, **Mis necesidades publicadas** y **Necesidades aceptadas**. En pantallas pequeñas se muestra en dos columnas para que los nombres sean legibles.
- La vista de necesidades genera **una ficha por solicitud**. Cada ficha muestra título, resumen, ciudad, acciones y, en la **misma fila a la derecha**, la foto adjunta cuando existe. No hay que abrirla para verla en esta sección.
- Si una solicitud no incluye fotografía, su espacio indica **«Sin foto»**; las solicitudes ilustrativas de ejemplo no contienen fotos reales. No se atribuyen imágenes arbitrarias a personas o anuncios.
- Los anuncios están individualizados mediante separación entre tarjetas, borde, una franja lateral diferente para bienes/servicios y subtítulos legibles.
- El flujo de aceptación continúa **sin formularios para quienes ayudan**. Los ejemplos pueden aceptarse en modo de prueba; no se establece un acuerdo real ni se intercambian datos entre usuarios.

**Estado técnico:** 39 pruebas de funciones y estructura aprobadas. La verificación visual en dispositivos reales sigue siendo un paso separado. Las funciones multiusuario siguen dependiendo de Firebase, que no está conectado.

Las secciones siguientes se mantienen como **historial del desarrollo**; las indicaciones anteriores sobre fotos ocultas y nombres antiguos del menú ya no corresponden al diseño vigente.

---
## Flujo simplificado: aceptar necesidades, sin propuestas ni formularios de proveedor

Desde esta actualización, **las personas que necesitan ayuda publican** mediante el formulario guiado; **quienes pueden resolverla únicamente exploran y pulsan «Aceptar necesidad»**. Se eliminan de la interfaz la redacción de cotizaciones, precios de proveedores, perfiles de proveedor, propuestas y sus formularios.

- Menú compacto: Inicio, Explorar, Necesidades y Aceptadas.
- Aceptación de prueba con un solo clic, sin precio, nombre, descripción ni registro solicitado al ayudante.
- Un navegador no puede aceptar dos veces una misma necesidad ni aceptar una que creó él mismo.
- Las solicitudes ilustrativas permiten probar este comportamiento. Las solicitudes publicadas desde el navegador propio siguen siendo invisibles para otras personas hasta que exista Firebase.
- «Aceptadas» conserva las acciones de prueba localmente. Las propuestas de versiones anteriores siguen conservadas en el almacenamiento local para no borrar historial, pero ya no pueden crearse desde la interfaz.
- Las fotos se muestran solo al pulsar «Ver foto». El formulario de publicación continúa disponible exclusivamente para quien quiera crear una necesidad.

**Limitación crítica:** la aceptación no llega a un comprador real y no crea contratos ni reservas. No hay usuarios múltiples ni identidades verificadas. El control de roles y la aceptación real dependen de Firebase, todavía pendiente de integración.

**Pruebas:** 34 casos de lógica y estructura verificados, incluida la prohibición de autoaceptación, duplicados y los formularios de proveedor eliminados.

---
## Rediseño compacto — rama para revisión

Rama: `codex/interfaz-compacta-sin-imagenes-2026-10-23`.

Objetivo: **que cada pantalla muestre únicamente lo necesario para el siguiente paso**, en escritorio y celular, sin imágenes visibles de inicio. Se conserva la misma lógica local de necesidades y propuestas.

- **Inicio reducido:** pregunta «¿Qué necesitas?», ciudad opcional en este paso, botón «Continuar» y ruta para quien quiere ofrecer.
- **Cinco vistas independientes:** Inicio, Explorar, Necesidades, Ofertas y Guardadas. Solo una vista aparece cada vez; se abren mediante enlaces con hash para mantener la navegación directa.
- **Navegación móvil completa:** cinco enlaces visibles simultáneamente sin desplazamiento lateral del menú.
- **Exploración compacta:** fichas de texto sin miniaturas; búsqueda y filtros de tipo visibles; filtros avanzados de ciudad/categoría tras pulsar «Más filtros».
- **Acciones progresivas:** «Ver detalles» abre una solicitud; «Más opciones», «Más acciones» y «Condiciones e historial» evitan mostrar controles secundarios inicialmente.
- **Imágenes solo bajo demanda:** ni el HTML inicial ni las tarjetas crean imágenes de inmediato. Si hay foto, «Ver foto» crea la imagen al pulsar y la retira al ocultarla. Aplica a necesidades, propuestas y vistas previas de los formularios.
- **Reglas de negocio preservadas:** precios fijos, ofertas ilimitadas, estados, compras parciales, favoritos, borradores y almacenamiento local.
- **Pruebas:** 28 escenarios de lógica y estructura comprobados en ejecución JavaScript aislada, junto con IDs HTML únicos, referencias de elementos válidas y CSS con llaves equilibradas. Quedan pendientes la validación visual en navegadores y dispositivos reales.

Firebase, autenticación real, ofertas compartidas y chat entre usuarios **siguen aplazados**. Este rediseño no habilita transacciones reales. La rama está destinada a revisión antes de fusionarse con GitHub Pages.

---

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
