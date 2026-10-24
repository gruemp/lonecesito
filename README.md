# LoNecesito — propuesta de interfaz simplificada con WhatsApp

**Versión preparada: 2.0.0 · 24/10/2026.** La página de esta rama contiene exclusivamente: publicar necesidades, consultar publicaciones, contactar directamente al autor por WhatsApp, y editar o eliminar las publicaciones propias. No incluye aceptaciones ni registro de interesados.

**Advertencia:** Firebase todavía no está configurado en este repositorio. Sin él, el sitio muestra **modo de prueba**, con datos almacenados únicamente en el navegador; no sirve todavía como portal público compartido. También queda por desplegar y verificar la versión nueva de las reglas de Firestore y revisar la privacidad antes de publicar.

La versión aparece encima del encabezado en la página. En cada nueva publicación deberá incrementarse el número de versión y registrarse el cambio.

Consulta [la documentación de esta versión](docs/VERSION-SIMPLE-WHATSAPP.md) para sus requisitos, pruebas y límites.

---

# Historial técnico de implementaciones anteriores (no activo en esta interfaz)

## Categorías ampliadas y preparación del modo multiusuario

- **40 categorías específicas**, distribuidas en 20 para Bienes y 20 para Servicios, incluidas construcción, electrodomésticos, educación, transporte, mascotas, hogar y muchas más. Los valores antiguos se conservan. Aparecen en el formulario y en los filtros.
- Se incorporó el módulo **firebase-live.js**, que cuando exista una configuración Firebase válida permitirá registrar usuarios con correo o Google, guardar nombre y teléfono en un perfil no público y aplicar con un clic.
- Solo el **propietario** de una necesidad podrá consultar la lista completa con los nombres y teléfonos de quienes aplicaron. Cada interesado podrá consultar su propia aplicación. Nadie debe aprobar la aplicación antes de ver los contactos. Sin límites preestablecidos de interesados.
- Publicar, aplicar y contactar no cuesta dinero al usuario: no se han añadido suscripciones, pagos ni comisiones. **Firebase puede generar costes de infraestructura para quien opera el servicio según sus cuotas**.
- Los datos de contacto se separan de la necesidad pública; las reglas de acceso están en **firestore.rules** y el despliegue configurado en **firebase.json**. El cliente requiere autorización expresa para compartir el nombre y número con cada propietario.
- Se conserva la UI anterior, los listados, fotografía a la derecha, navegación en cuatro pantallas y el modo de demostración para cuando no hay configuración de Firebase.
- **IMPORTANTE — PENDIENTE DE ACTIVACIÓN:** no hay proyecto ni configuración Firebase en este repositorio. Los valores de **firebase-config.js** están vacíos; GitHub Pages no despliega Firestore ni sus reglas. Se debe configurar un proyecto Firebase real, desplegar sus reglas y validar seguridad antes de ofrecer conexión entre personas. Consulta **docs/firebase-setup.md**.
- **Verificación:** 111 pruebas de lógica, categorías y estructuras superadas; suite adicional de Firestore Emulator preparada pero aún no ejecutada. **No** se ha ejecutado el emulador de Firestore ni se han probado permisos sobre cuentas reales. No se afirma que Firebase esté operativo en producción.

---

## Jerarquía visual uniforme para todos los títulos (octubre de 2026)

- Los títulos de **Inicio**, **Explorar**, **Mis necesidades publicadas** y **Necesidades de terceros aceptadas** comparten escala tipográfica, márgenes y alineación coherentes. Los títulos interiores conservan un tono identificador de su sección, sin perder contraste ni cambiar sus nombres.
- El contador junto al título de Mis necesidades se diferencia visualmente con una etiqueta azul que desaparece cuando no hay publicaciones.
- En las tres listas, los nombres permanecen en **una sola línea** y siguen abriendo la ficha al pulsarlos. En la ficha abierta, el título completo tiene jerarquía superior a ubicación, estado y características; no se cambia la columna de fotografía.
- El diálogo para publicar usa una escala coherente para su **título y los tres subtítulos de pasos**, así como en las leyendas de campos y el progreso.
- Los cuatro accesos principales de Inicio mantienen sus colores, posiciones y funciones, con títulos tipográficamente uniformes.
- El cambio visual se limita a CSS y al identificador de caché de CSS en HTML; **el archivo JS, los datos, la navegación, la publicación y la aceptación no se modifican**.

**Comprobación:** 95 pruebas de lógica y estructura completadas; los ajustes móviles usan los puntos de ruptura existentes (680 px y 380 px) y no sustituyen las cuadrículas originales. La revisión visual en dispositivos físicos sigue pendiente.

---
## Diseño actual: descripciones justificadas y avisos discretos

- Las descripciones dentro de las fichas expandidas se muestran con **alineación justificada**, preservando los saltos de línea del autor y usando `hyphens:auto` en español para favorecer el ajuste móvil.
- Se eliminó la nota repetitiva en cada necesidad acerca de guardado en este navegador, ausencia de notificaciones y modo demostración. La ficha termina directamente en sus acciones o estado.
- Se retiraron los avisos de demostración redundantes de las secciones, del panel inicial de publicación y del footer; el encabezado de Explorar se concentra en su función. El footer queda con la marca LoNecesito.
- Se conservó la **confirmación obligatoria del asistente**, ahora redactada de forma breve sin repetir el aviso local, así como el consejo para no subir información sensible en fotografías.
- Los textos de confirmación tras guardar, aceptar, recuperar borrador o resolver se expresan de forma concisa. El comportamiento, los datos guardados, la aceptación y los filtros no se modificaron.
- Se conservan los ejemplos ilustrativos de necesidades, que no son publicaciones de compradores reales; eliminar avisos visuales no significa que exista un backend.

**Importante:** La aplicación sigue siendo una demostración local sin Firebase ni comunicación real entre usuarios; únicamente se redujo el texto repetido dentro de la interfaz.

**Verificación:** 88 pruebas de lógica y estructura aprobadas; los identificadores HTML siguen siendo únicos, los selectores JS están presentes y el CSS es válido estructuralmente. Pruebas en teléfonos físicos pendientes.

---
## Rediseño visual premium v2 (octubre de 2026)

- Nueva composición de **portada** con encabezado equilibrado, logo centrado, título más legible, superficie blanca y cuatro acciones diferenciadas por color, tamaño y jerarquía. Las acciones siguen apareciendo **solo en Inicio**.
- Las vistas interiores obtienen encabezados en superficie clara, filtros, campo de búsqueda y lista pastel con proporciones coherentes. **Los nombres de las necesidades continúan en una sola línea**, sin espacios entre filas.
- Las fichas abiertas se presentan en capas: categoría/estado, título y ubicación, detalles en celdas bien delimitadas, descripción, fotografía completa a la derecha, aviso y acciones grandes. Se conserva el **ancho base de dos columnas** del detalle y la ficha solo se construye al abrir su fila.
- Mejoras de presentación en el asistente de publicación: tipografía, campos, barra de progreso, avisos y acciones. El footer sigue compacto.
- Adaptación en pantallas de 320 px a escritorio, con controles especiales para ancho de los cuatro accesos en móviles y metadatos en una columna cuando la ficha es estrecha.
- Cambios limitados al CSS y al identificador de caché del CSS en HTML; **JavaScript y lógica interna intactos**.

**Pruebas:** 84 casos de lógica y estructura aprobados mediante ejecución aislada, sin IDs duplicados ni referencias a elementos eliminados, CSS equilibrado y contrastes AA de texto y botones verificados. La comprobación visual manual en distintos navegadores/teléfonos sigue pendiente.

El lenguaje «300 % mejor» se interpreta como una petición de mejora visual sustancial, no como un indicador cuantitativo verificable.

**Estado:** sigue siendo una demostración local sin Firebase ni comunicación real entre usuarios.

---
## Fichas desplegables: composición visual mejorada (octubre de 2026)

- Las fichas completas que se abren al pulsar una necesidad ahora muestran una jerarquía más clara: encabezado de categoría y estado, título, ubicación, características, descripción, fotografía lateral, aviso y botones de acción.
- La clasificación se diferencia con una etiqueta legible y las características se agrupan en una superficie discreta; las notas y las acciones tienen separaciones uniformes.
- Se conserva íntegra la estructura de **dos columnas** de las fichas (texto a la izquierda, foto a la derecha), con los anchos base de escritorio y móvil existentes. No se modifica el número de columnas ni se añaden componentes al HTML.
- La imagen utiliza `object-fit: contain` para mostrarla completa. Las solicitudes sin foto conservan su indicador «Sin foto». Los botones para aceptar, resolver, reactivar, editar o cancelar mantienen sus funciones.
- La misma mejora se aplica a **Explorar**, **Mis necesidades publicadas** y **Necesidades aceptadas** sin modificar el listado cerrado de nombres compactos y colores pastel.
- El ajuste fue exclusivamente CSS y la actualización de versión de CSS en `index.html`; el archivo JavaScript y las reglas de negocio permanecen sin cambios.

**Verificación:** 76 pruebas de lógica y estructura aprobadas, contraste calculado superior a 4,5:1 en los textos clave y botones de las fichas. Las pruebas manuales de disposición en distintos navegadores y teléfonos siguen pendientes.

---
## Paleta pastel de las listas de necesidades

- Las tres vistas (**Soluciona una necesidad**, **Mis necesidades publicadas** y **Necesidades de terceros aceptadas**) utilizan un ciclo visual de cuatro tonos pastel: azul suave, amarillo cálido, lavanda y verde menta.
- Cada fila mantiene **solo el nombre de la necesidad** y un chevrón, con el texto y la flecha del tono correspondiente. Una franja interior de 5 px aporta separación visual sin modificar alturas ni ancho.
- Al abrir una fila, su encabezado adopta una versión ligeramente más intensa del mismo tono; la ficha con fotografía y acciones aparece debajo como antes.
- Los colores se repiten cada cuatro necesidades, independientemente de la categoría y el estado. No se añaden imágenes o controles al listado cerrado.
- Solo cambia el CSS, el identificador de caché de la hoja en HTML, las pruebas y este texto. JavaScript y flujos se conservan.

**Verificación:** 69 pruebas de lógica y estructura aprobadas. Contrastes de texto de los cuatro tonos superiores a 4,5:1 tanto en filas abiertas como cerradas. Sin pruebas visuales en dispositivos físicos.

---
## Navegación actual: botones principales solo en Inicio

- Los **cuatro accesos principales** (Publicar, Solucionar, Mis necesidades publicadas y Necesidades aceptadas) aparecen **únicamente en Inicio**.
- Los dos botones de navegación «Mis necesidades...» y «Necesidades aceptadas...» ahora están dentro de la sección HTML `#inicio.app-screen`. Cuando el usuario cambia de vista, la navegación existente oculta toda la portada, incluidos esos accesos, sin modificar JavaScript.
- Dentro de **Explorar**, **Mis necesidades** y **Aceptadas** se muestra exclusivamente su título, información, filtros o listado y las acciones específicas de la vista. Se retiran los accesos secundarios duplicados «Publicar otra necesidad» y «Soluciona otra necesidad». Los controles de cada necesidad y el estado vacío siguen disponibles.
- El logotipo **LoNecesito** permanece visible para volver al Inicio en cualquier momento. Se conservan las rutas existentes y toda la lógica.
- Verificación: **65 pruebas** de lógica y estructura aprobadas; CSS y JavaScript sin cambios. Sin backend Firebase, la plataforma sigue siendo demostración local.

Los apartados inferiores registran etapas anteriores del proyecto.

---
## Interfaz didáctica: opciones diferenciadas (diseño vigente)

- Las **cuatro acciones principales** conservan sus destinos y etiquetas, con colores, símbolos y ayudas breves: publicar (verde oscuro), solucionar una necesidad (verde claro), administrar publicaciones propias (azul) y revisar necesidades aceptadas (ámbar). Se mantienen en la misma columna central en PC y celular.
- La diferencia no depende únicamente del color: cada opción tiene **icono específico, título y explicación**, con estados de foco visibles.
- En las tres listas, las necesidades siguen mostrando **solo su nombre en una línea**. Las filas alternan blanco/gris muy claro, una flecha indica si están abiertas, y el renglón abierto recibe un fondo resaltado; la ficha completa con fotografía sigue apareciendo solamente al pulsar el título.
- Textos breves en cada sección explican qué acción realizar, sin instrucciones extensas ni nuevos formularios.
- El rojo se reserva para acciones como «Cancelar necesidad»; las necesidades ya aceptadas mantienen un tratamiento ámbar, con texto de estado.
- Se respetan la navegación, filtros, publicación guiada, aceptación local y las restricciones actuales de Firebase pendiente.

**Validación:** 57 pruebas de lógica y estructura aprobadas en ejecución JavaScript aislada; HTML con IDs únicos, selectores existentes y CSS equilibrado. No equivale a pruebas visuales con dispositivos físicos.

La aplicación continúa en **demostración local**: no hay publicaciones ni aceptaciones compartidas entre personas hasta que se integre Firebase.

Las secciones inferiores del README documentan versiones históricas de la interfaz.

---
## Interfaz vigente: listas compactas de títulos expandibles

- En **Soluciona una necesidad y gana dinero por ello**, **Mis necesidades publicadas para que otros ofrezcan solucionarlas** y **Necesidades de terceros aceptadas para solucionar**, cada necesidad aparece inicialmente como **una sola línea clicable con su nombre**, sin imagen, fecha, descripción, botones ni espacios entre renglones.
- Para consultar información, tocar el nombre abre debajo la ficha de esa necesidad **en la propia lista**, sin abrir otra página ni ventana emergente.
- Al desplegarla se muestran título completo, ciudad, categoría, cantidad, condición, presupuesto/fecha cuando corresponden, descripción, fotografía y acciones aplicables. Al cerrarla desaparece el contenido adicional.
- **Las imágenes no se construyen ni se muestran mientras la fila está cerrada.** Esto permite recorrer más nombres rápidamente y ahorrar recursos al cargar listas.
- El comportamiento es idéntico en computadora y celular. Se usan `<details>` y `<summary>` nativos para accesibilidad mediante teclado y compatibilidad móvil.
- Cada renglón conserva bordes divisores muy finos, sin huecos entre filas, y los títulos excesivamente largos muestran puntos suspensivos en la lista; el título íntegro aparece al expandir.
- Se conservan la publicación guiada, selección de ciudad, filtros, historial, aceptación sin formulario y datos en el almacenamiento local.

**Validación:** 51 pruebas de lógica y estructura aprobadas en ejecución aislada, sin selectores HTML faltantes. Pendiente validar el aspecto visual en navegadores y teléfonos físicos.

**Todavía es una demostración local:** no existen publicaciones compartidas ni aceptaciones transmitidas entre usuarios, hasta integrar Firebase.

Las secciones antiguas de este README describen etapas ya sustituidas.

---
## Fichas completas directamente en las listas (diseño actual)

- Las secciones **Soluciona una necesidad y gana dinero por ello**, **Mis necesidades publicadas para que otros ofrezcan solucionarlas** y **Necesidades de terceros aceptadas para solucionar** utilizan el **mismo modelo de ficha**.
- Cada ficha identifica de manera independiente categoría, título completo, ciudad, cantidad/condición para bienes, presupuesto y fecha deseada cuando se proporcionan, fecha de publicación cuando existe, descripción íntegra y foto lateral automática (o «Sin foto»).
- **Se eliminó el botón «Ver detalles» y el diálogo/modal de detalles.** Los datos son visibles sin pulsar ninguna opción. Las fotografías no requieren interacción.
- Los botones para aceptar, editar, marcar como resuelta, cancelar o reactivar se muestran al pie de la misma ficha de acuerdo con el contexto y estado. Las necesidades aceptadas muestran una confirmación sin añadir formularios.
- El mismo diseño y un único código de renderizado mantienen la coherencia entre las tres secciones en computador y celular.
- Se conservan los filtros de exploración, el asistente de publicación de tres pasos, las aceptaciones de demostración y la información almacenada en el navegador.

**Validación:** 47 pruebas de lógica y estructura aprobadas en ejecución aislada; sin referencias a botones o diálogos eliminados. Pendiente comprobar visualmente en dispositivos físicos.

**Alcance:** demostración local. No hay contacto ni notificaciones reales entre personas hasta implementar Firebase.

Los apartados inferiores son históricos y pueden describir interfaces sustituidas por este diseño.

---
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
