# Reglas vigentes para continuar LoNecesito

**Leer antes de modificar el proyecto:** [AGENTS.md](AGENTS.md) · [Preferencias actuales](docs/PREFERENCIAS-LO-NECESITO.md) · [Estado y aprendizajes de continuidad](docs/CONTINUIDAD-Y-APRENDIZAJES.md).

Estos archivos se consolidaron el **24 de octubre de 2026**. Contienen la **única especificación vigente**: cuatro pestañas en una fila en PC y dos en móvil, ilustración vigente de dos pasos solo en Inicio, fichas reales sin títulos ni ejemplos, buscador por fragmentos/teléfono, controles directos, sin versión visible. **Las entradas de versiones y prototipos que aparecen más abajo son exclusivamente históricas** y pueden estar contradichas por decisiones posteriores. No adoptarlas como requisitos actuales.

**Estado técnico que no cambia con esta revisión:** Firebase sigue sin configurar en el repositorio; en modo local las publicaciones no se comparten entre navegadores. La actualización de diseño 2.2.15 conserva la funcionalidad técnica y Firebase sigue sin configurar.

---

# Versión técnica 2.2.16 — imagen de dos pasos elegida para Inicio

Se instala la **primera ilustración de dos pasos aprobada por el usuario**, «Publica lo que necesitas» (licuadora) → «Lo ven y te contactan» (llamada o WhatsApp). Archivo vigente **assets/lonecesito-presentacion-dos-pasos.png**, 1819 × 865. La ilustración anterior queda preservada como respaldo; **la variante posterior con mayonesa no se utiliza**. El banner usa su proporción exacta, manteniendo los márgenes compartidos con la navegación. No se cambia la lógica de publicación, búsqueda ni Firebase.

---

# Versión técnica 2.2.15 — alineación y portada completa al 100 %

En PC, los cuatro botones comparten los márgenes izquierdo y derecho de la imagen de Inicio. El ancho de la ilustración 16:9 se adapta a la altura útil del navegador para verse íntegra a zoom 100 %. Se mejoran superficies, proporciones, color y espacio de encabezado, buscador, fichas y editor, sin alterar su lógica. En celular se conservan dos filas de pestañas. Las modificaciones futuras deben publicarse inmediatamente al completarse.

---

# Versión técnica 2.2.14 — navegación en PC e imagen íntegra de Inicio

Las pestañas siguen el orden **Inicio → Publicar lo que necesito → Mis publicaciones → Ver necesidades**. En **PC** aparecen en una sola fila; en **móvil**, en dos filas de dos. La imagen seleccionada de Inicio permanece intacta, se centra y se limita al espacio disponible del navegador sin recortarse. Las fichas, el buscador y el funcionamiento de publicación no cambian.

---

# Versión técnica 2.2.13 — Inicio independiente, cuatro pestañas y búsqueda por tramos

La web empieza en **Inicio**, con la **tercera ilustración elegida** (`assets/lonecesito-presentacion.webp`) y ningún buscador ni ficha. La navegación se presenta **en dos filas de dos botones**, tanto en móviles como en computadores: **Inicio**, **Mis publicaciones**, **Ver necesidades**, **Publicar lo que necesito**. Se eliminan por completo las fichas ficticias y la barra de versión visible.

El buscador de **Ver necesidades** compara fragmentos de palabras sin tildes, varios términos en cualquier orden, teléfono total o parcial y metadatos públicos históricos. Las fichas de los usuarios y sus acciones se mantienen iguales. **Firebase sigue sin configurar**, por lo que las necesidades locales todavía no son públicas entre distintos navegadores.

Las decisiones nuevas prevalecen sobre las instrucciones históricas siguientes. Ver [AGENTS.md](AGENTS.md), [Preferencias](docs/PREFERENCIAS-LO-NECESITO.md) y [Continuidad](docs/CONTINUIDAD-Y-APRENDIZAJES.md).

---

# Versión 2.2.12 — imagen elegida en la primera pestaña

Se incorporó **la imagen panorámica escogida por el usuario** en la vista inicial «Ver necesidades», debajo de los tres accesos superiores y antes del buscador. El archivo se guarda de manera independiente en el repositorio, en `assets/lonecesito-presentacion.webp`, para que funcione como recurso propio de GitHub Pages. Ocupa todo el ancho disponible, se adapta a móviles y se muestra sin recortes. La secuencia es «Publica → La ven → Te contactan» mediante llamada o WhatsApp.

No se alteran las fichas ni el formulario. Se actualizan las preferencias permanentes y el documento de continuidad. Firebase sigue sin configurar.

---

# Versión 2.2.11 — eliminar desde el editor

Ahora, mientras se edita una publicación propia, aparece un **botón de papelera** junto al icono de guardar y la X para cancelar, **en la misma fila**. La papelera pide confirmación; al cancelar la eliminación conserva la edición y al completarla vuelve a «Mis publicaciones». Al crear, papelera y X permanecen ocultos. También se sigue pudiendo eliminar desde el icono de la ficha. El diseño mantiene botones compactos y accesibles, con versión visible incrementada a 2.2.11.

---

# Versión 2.2.10 — envío sin texto y teléfono en fila única

El área «¿Qué necesitas?» mantiene una sola caja. Inmediatamente debajo hay **una fila horizontal** con icono de teléfono, una caja que muestra **«Ej: 300 123 4567»** dentro, icono para imagen, icono para dictar y botón verde con **solo un icono de avión de papel**. No se muestra «Número de WhatsApp» ni «Publicar necesidad» en esa fila. Enter publica; Shift+Enter añade una línea cuando se está escribiendo en la descripción. Editar usa el mismo icono con nombre accesible «Guardar cambios» y permite cancelar mediante X.

La guía para otras IA se actualizó en [AGENTS.md](AGENTS.md), [preferencias](docs/PREFERENCIAS-LO-NECESITO.md) y [documento de continuidad](docs/CONTINUIDAD-Y-APRENDIZAJES.md). Firebase aún no está configurado.

---

# Versión 2.2.9 — acciones compactas en una fila

La ficha de «Mis publicaciones» muestra **cinco botones con solo iconos en una fila**: llamar, WhatsApp, compartir PNG (símbolo de tres puntos conectados), editar y eliminar. Los visitantes ven únicamente los tres primeros iconos. No se repiten acciones en otra fila. Permisos y confirmación de eliminación siguen intactos. Diseño adaptado a pantallas pequeñas con botones táctiles y colores diferenciados.

Esta decisión se añadió a [AGENTS.md](AGENTS.md), [preferencias](docs/PREFERENCIAS-LO-NECESITO.md) y [continuidad](docs/CONTINUIDAD-Y-APRENDIZAJES.md). Firebase sigue pendiente de configuración; las publicaciones aún no se comparten entre visitantes.

---

# Versión 2.2.8 — fichas sin título y sin espacios vacíos

Se retiraron los textos explicativos y encabezados grandes de **Publicar**, **Ver necesidades** y **Mis publicaciones**. Las fichas no muestran títulos: presentan todo el texto de la necesidad justificado, con una altura que depende del contenido. Las descripciones pueden contener desde un solo carácter (no se aceptan vacías).

Si hay foto, aparece a la derecha; si no la hay, el texto se extiende por todo el ancho. La exportación PNG utiliza la misma distribución. Los botones de llamada, WhatsApp, compartir, editar y eliminar no cambian. Se actualizaron [AGENTS.md](AGENTS.md), [preferencias](docs/PREFERENCIAS-LO-NECESITO.md) y [documento de continuidad](docs/CONTINUIDAD-Y-APRENDIZAJES.md).

La interfaz está publicada mediante GitHub Pages; la configuración de Firebase y el servicio compartido siguen pendientes.

---

# Versión 2.2.7 — foto opcional y compartir fichas como PNG

Cada ficha reserva una zona a la derecha: si hay foto, se ajusta sin recortes; si no hay, queda completamente vacía, sin borde, fondo ni icono. El texto de la necesidad permanece justificado y no invade esa columna. No aparece el título «Contactar».

Además de llamar y WhatsApp, ahora existe un tercer icono para **compartir la ficha como PNG**. En dispositivos compatibles abre la hoja nativa de compartir; de lo contrario descarga el PNG. La imagen exportada contiene título, descripción, foto opcional y el número de contacto real cuando corresponde. Los ejemplos no exportan números ficticios.

Se han actualizado las preferencias permanentes y los tests. **Firebase sigue sin configurar:** las publicaciones solo se guardan localmente en este entorno.

---

# LoNecesito — versión 2.2.6 · cierre de la interfaz

La edición de la **interfaz** queda consolidada con fotografías ampliables: al tocar una fotografía en cualquier punto de la ficha o su miniatura en el editor, se abre un visor en primer plano que permite verla **completa sin recortes** y cerrarla con X, Escape o toque fuera.

**Documentación principal para continuar sin perder preferencias:**
- **[Instrucciones para cualquier IA](AGENTS.md)**.
- **[Preferencias y decisiones de LoNecesito](docs/PREFERENCIAS-LO-NECESITO.md)**.
- **[Entrega, aprendizajes, estado técnico y pasos pendientes](docs/CONTINUIDAD-Y-APRENDIZAJES.md)**.

**Estado:** GitHub Pages distribuye la interfaz. Firebase aún no tiene configuración de proyecto en `firebase-config.js`: en modo local **las publicaciones no se comparten entre visitantes**. Configurar autenticación, Firestore y desplegar reglas es un paso posterior de infraestructura. También siguen pendientes la prueba visual en dispositivos físicos y la ejecución del emulador de Firestore.

La información histórica de versiones anteriores que aparece más abajo no prevalece sobre estos tres documentos.

---

# Versión 2.2.5 — dictado, fotografía lateral y portada sin textos redundantes

- Eliminados exactamente los textos grandes de portada y del pie señalados en las capturas; la URL principal abre directamente el listado «Ver necesidades», manteniendo los tres botones permanentes.
- Dentro del campo único de descripción hay un botón de micrófono para dictar en español mediante el navegador, sin Gemini. Se conserva el teclado, un estado de escucha y una notificación breve solo si falla o no está disponible. El dictado depende del navegador y puede usar servicios externos.
- Se añade un icono para **adjuntar una foto opcional** dentro del mismo campo; no hay un tercer campo visible. La imagen se comprime en el dispositivo antes de guardarse; puede cambiarse o eliminarse.
- Toda ficha, incluidos los ejemplos, reserva un espacio a la **derecha para la imagen**. Las publicaciones sin foto muestran un marcador visual; las que incluyen foto muestran la imagen a la derecha, sin ocultar información.
- Las reglas Firestore permiten actualizar o quitar `picture` exclusivamente al autor. Deben desplegarse en el proyecto Firebase una vez configurado; GitHub Pages no despliega reglas.
- Se siguen mostrando solamente los iconos de llamar y WhatsApp, y en la parte superior solamente «Versión 2.2.5».
- Las preferencias se conservaron en `AGENTS.md` y `docs/PREFERENCIAS-LO-NECESITO.md`.

---

# Versión 2.2.4 — tres botones permanentes de navegación

La barra superior concentra los únicos tres accesos principales, siempre visibles al desplazarse: **Publicar lo que necesito** (verde), **Ver necesidades** (azul) y **Mis publicaciones** (ámbar).

La portada ya no repite esos accesos, ni «Mis publicaciones» añade un botón «Crear publicación» innecesario. Los botones mantienen colores distintos, resaltan la pantalla actual y se adaptan a celulares pequeños.

La búsqueda continúa funcionando sin Gemini ni otras integraciones de inteligencia artificial, conforme a la decisión vigente.

Se actualizaron [AGENTS.md](AGENTS.md) y [Preferencias de LoNecesito](docs/PREFERENCIAS-LO-NECESITO.md) para que otras IA respeten estas reglas.

---

# Versión 2.2.3 — iconos de llamada y WhatsApp

- Cada ficha presenta **dos botones compactos con iconos y sin texto visible**: teléfono (azul) y WhatsApp (verde). **El número ya no aparece escrito** en la ficha.
- El icono de llamada usa un enlace \`tel:+<numero>\` para abrir el marcador del dispositivo. El icono de WhatsApp conserva \`https://api.whatsapp.com/send\` con el número y mensaje contextual.
- Los botones son accesibles con \`aria-label\` y \`title\`; su diseño es igual en todas las fichas.
- Las fichas de ejemplo mantienen ambos iconos: **llamada deshabilitada** para impedir que se marque un número ficticio; WhatsApp abre sin destinatario.
- Que no se muestre el número como texto **no lo vuelve privado**: está disponible en las direcciones de los enlaces. El formulario informa de esa exposición.
- Se mantienen dos campos de publicación, texto completo de necesidad, fichas compactas, separación visual, Editar/Eliminar solo del autor y versión discreta al principio.
- Actualizadas las preferencias permanentes de \`AGENTS.md\` y \`docs/PREFERENCIAS-LO-NECESITO.md\`.

---

# LoNecesito — instrucciones para continuar el proyecto

**Toda IA o persona que continúe el desarrollo debe leer antes de editar:**
- [AGENTS.md](AGENTS.md) — reglas obligatorias resumidas.
- [Preferencias y decisiones de LoNecesito](docs/PREFERENCIAS-LO-NECESITO.md) — guía completa de funcionalidad, diseño, ejemplos, versión y publicación.

**Versión 2.2.2:** todas las necesidades (incluidos registros de formatos anteriores) se presentan en **un solo texto**. Ciudad, presupuesto, categoría y detalles no aparecen en casillas separadas; se conserva el contacto por WhatsApp y el diseño compacto. La versión visible se actualiza en la parte superior.

La documentación histórica debajo de esta sección describe decisiones anteriores y **no sustituye las reglas vigentes** de los documentos enlazados. La documentación persiste en GitHub y puede ser compartida con otras IA; no es memoria automática de plataformas ajenas.

---

# Versión 2.1.0 · 24/10/2026

- Para publicar se utilizan **solo dos campos**: descripción completa de la necesidad y número de WhatsApp.
- Se elimina la captura individual de título, categoría, ciudad, presupuesto, fecha, cantidad y fotografía. El encabezado de la ficha se genera a partir de la primera línea de la descripción.
- En las fichas el número es pulsable y abre WhatsApp. En ejemplos sin destinatario real, WhatsApp se abre sin número asignado.
- Las publicaciones anteriores pueden editarse; sus detalles existentes pasan al texto único y se conservan las fotografías ya almacenadas.
- La versión visible se actualiza a 2.1.0 y siguen sin aparecer avisos repetitivos sobre pruebas.
- Los controles del autor siguen siendo únicamente Editar y Eliminar.

**Pendiente operativo:** Firebase sigue sin configurar en el repositorio. La página puede desplegarse, pero todavía no comparte publicaciones entre navegadores diferentes. Se requiere revisión de privacidad antes de operar con contactos reales.

---

# Versión 2.0.1 · 24/10/2026

- Solo se muestra el número de versión en la franja superior.
- Se retiraron de la interfaz los avisos de modo de prueba, la explicación de los ejemplos, las etiquetas adicionales y el enlace «Ver cambios».
- Se mantienen las fichas completas y los números de contacto; los números de muestra no generan enlaces hacia terceros.
- El funcionamiento de almacenamiento local, cuando Firebase no está configurado, **no cambia**. Su limitación sigue documentada para la operación del sitio.

---

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


## 2.2.29 — Direcciones de Natura sin Apps Script
País, departamento, municipio, ciudad y calle se completan directamente desde OpenStreetMap/BigDataCloud conforme llega cada respuesta. En una publicación con GPS, editar → Actualizar dirección GPS → autorizar → guardar permite recuperar nombres faltantes desde el punto guardado, sin medir la ubicación actual. Una consulta fallida no borra datos conocidos de ese punto. Apartamento o complemento se escribe en la caja de dirección opcional; no se detecta por GPS. Se mantienen PNG, Maps y distancia local bajo permiso.

Validación del flujo: `npm run test:location`. Sin Apps Script, backend de visitantes de Natura ni consultas automáticas al abrir fichas.

## Preparación 2.2.32 — Geocodificador Google como Natura
El titular autorizó Apps Script. Se prepara un servicio independiente que utiliza Maps.newGeocoder y formatted_address, y un cliente con consentimiento, validación y cancelación. **Aún no está activo:** falta crear/desplegar el proyecto Google y configurar su URL /exec. Mientras la URL de location-config.js esté vacía, permanecen los respaldos anteriores.

[Servicio, contrato y despliegue](apps-script/geocodificador/README.md). La integración permanece en PR borrador hasta comprobar la URL real; no se modifica la analítica ni los proyectos Google de Natura. GitHub Pages no despliega Apps Script ni reglas Firestore.
