# LoNecesito — reglas actuales para cualquier IA

**Vigencia: 25 de octubre de 2026.** Este documento es la **fuente de verdad operativa**. Leer también [Preferencias detalladas](docs/PREFERENCIAS-LO-NECESITO.md) y [Continuidad técnica](docs/CONTINUIDAD-Y-APRENDIZAJES.md) antes de editar. **La instrucción expresa más reciente del usuario prevalece** sobre mensajes antiguos, versiones y requisitos históricos.

**Prohibido recuperar funciones descartadas basándose en documentación vieja.** No mostrar publicaciones ficticias, versión visible, ofertas de proveedores ni avisos de prueba. La historia permanece consultable en Git.

## 1. Propósito y límites del producto

- Una persona publica **lo que necesita** (bien, producto o servicio) en un **único texto libre** y deja un **número telefónico** de contacto.
- Otras personas ven y buscan las necesidades, y **contactan directamente al autor por teléfono o WhatsApp**. No existe intermediación, chat propio, propuesta ni negociación dentro de LoNecesito.
- El autor puede **publicar, consultar, editar y eliminar**. Solo él puede editar o eliminar y el borrado exige confirmación.
- **NO** crear ofertas de proveedores, botones Aceptar/Rechazar/Resuelto, postulaciones, listas de interesados, seguimiento, aprobaciones, estados de contratación, ni búsquedas con Gemini/IA externa sin una solicitud nueva.

## 2. Navegación e Inicio

- Barra superior permanente con **exactamente cuatro pestañas** en orden de lectura: **Inicio → Publicar lo que necesito → Mis publicaciones → Ver necesidades**.
- En **PC** (más de 680 px), disponer las cuatro pestañas en **una única fila horizontal**. En **celular** (hasta 680 px), conservar dos filas de dos botones. Colores diferenciados y pestaña activa identificable.
- En PC, los cuatro botones y la imagen de Inicio comparten **los mismos márgenes laterales**. Ajustar el ancho de la imagen 1819:865 a la altura útil de la ventana para mostrarla completa a zoom 100 %, sin recortes ni desplazamiento en escritorios habituales.
- Al abrir sin hash, mostrar **Inicio**. Únicamente allí va **la imagen nueva de dos pasos aprobada por el usuario**: «1. Publica lo que necesitas» (ejemplo de licuadora) → «2. Lo ven y te contactan» (llamada o WhatsApp). Su recurso vigente es **assets/lonecesito-presentacion-dos-pasos.png** (1819 × 865). La imagen anterior de tres pasos queda como respaldo histórico, fuera de la web; **no usar la variante con mayonesa**. Mostrarla completa, centrada y sin recortes o deformaciones. No añadir buscador, fichas ni controles redundantes en Inicio.
- **Ver necesidades** contiene **buscador y fichas reales**; **Mis publicaciones**, solo publicaciones del autor; **Publicar**, editor. El banner no aparece en estas pestañas.

## 3. Editor: dos campos obligatorios y dirección opcional, dos filas de controles

- **Tres entradas visibles:** descripción de la necesidad y teléfono (obligatorios) más **dirección opcional** (máximo 180 caracteres). No crear casillas de título, ciudad, categoría, cantidad, presupuesto, precio, fecha ni condición. La dirección no forma parte del texto de descripción y se conserva al editar.
- Descripción **no vacía**, sin mínimo artificial de caracteres (límite actual de 1.000 para nuevas publicaciones y descripciones modificadas). **La foto es opcional**. Al editar registros anteriores cuyo texto supera 1.000 caracteres, conservarlo íntegro sin cortar ni sobrescribir: permitir guardar cambios de contacto/fotografía si el texto permanece sin cambios; si se modifica la descripción, exigir que el nuevo texto no supere 1.000 caracteres. Mantener compatibilidad de datos históricos de hasta 4.000 caracteres.
- Bajo la descripción, primera fila: teléfono, fotografía, micrófono y publicar (más eliminar/cancelar en edición). **Segunda fila única**: botón dinámico reproducir/pausar/reanudar, botón reiniciar, **caja de dirección opcional (icono a la izquierda, ejemplo dentro)** y **botón GPS a la derecha**, todos en una misma línea incluso en móvil. No añadir botones separados para detener GPS.
- **Enter publica o guarda** desde la descripción o el teléfono usando el mismo formulario validado; **Shift+Enter** inserta salto de línea en la descripción. Respetar composición IME, teclas repetidas y protección ante doble envío.
- Micrófono de dictado en español (preferiblemente **es-CO**) mediante reconocimiento del navegador disponible, con inicio/detención por interacción. El teclado sigue siempre disponible; en navegadores sin dictado, informar solo al intentar usarlo. No integrar Gemini.
- Icono de foto: elegir **una foto**, comprimir antes de almacenar; miniatura dentro del editor, pulsable para ampliación y con opción de quitar, sin desplazar la fila.
- **En edición**, añadir en esa misma fila **papelera roja** y **X de cancelar** después del icono de envío; **en creación ambas están ocultas**. Guardar conserva icono y cambia nombre accesible. Papelera valida autoría, pide confirmación y solo al borrar exitosamente vuelve a Mis publicaciones; cancelar el borrado **no pierde texto ni imagen**.

## 4. Fichas: núcleo de la experiencia

- **Nunca mostrar títulos de ficha**. Presentar **todo el texto desde la primera palabra**, justificado, última línea de alineación normal, sin truncar ni esconder. Los campos heredados se incorporan al texto, **no** en chips, cajas separadas ni etiquetas de ciudad, presupuesto, categoría o fecha.
- **Altura natural según contenido**, máxima economía **vertical**, sin estrechar horizontalmente ni reducir la comprensión. La ficha debe leerse de un vistazo en móviles siempre que el contenido lo permita.
- **Con imagen:** ponerla **a la derecha**, ajustando proporción automáticamente **sin recortar ni deformar** (contain). Tocar **cualquier punto** de la imagen abre una vista completa en primer plano, con cierre X, Escape o toque exterior.
- **Sin imagen:** el texto **ocupa todo el ancho**; no reservar columna, recuadro, marcador gráfico, icono ni aviso de ausencia.
- **Dos filas por ficha:** primera fila, 3 iconos para visitantes (llamar, WhatsApp y compartir PNG), 5 para el autor (más editar y borrar); segunda fila, 2 botones de voz (el primero alterna reproducir/pausar/reanudar y el otro reinicia) más el pin para consultar GPS o la dirección del autor. Sin palabras visibles dentro de los iconos; altura táctil mínima 44 px.
- **Llamada** y **WhatsApp** enlazan directamente, con el resumen de necesidad en negrita en WhatsApp. La voz utiliza dos botones y tramos de hasta 155 caracteres compatibles con Android; una lectura activa a la vez. La ubicación GPS es opcional, y la dirección editable también.

## 5. Compartir ficha en PNG

- Botón morado con icono de **tres puntos conectados**. Generar **PNG local** fiel a la ficha: **sin título adicional**, texto completo justificado, altura natural, foto a la derecha si existe; sin foto, el texto ocupa todo el ancho.
- En **el PNG sí incluir el teléfono real** del autor, destacado y legible en una banda de contacto elegante («TELÉFONO · WHATSAPP»), porque una imagen estática compartida debe permitir contactarlo. En **la ficha web, no**. No insertar teléfonos de prueba.
- Usar **navigator.share con archivo PNG** si está disponible; en caso contrario, **descargar el PNG**. No enviar el contenido a servidores para generar la imagen.

## 6. Buscador inteligente, pero sin IA externa

- El buscador existe únicamente en **Ver necesidades** y filtra **mientras se escribe**.
- Encontrar **fragmentos de palabras**, varios términos en cualquier orden y en distintos campos, **sin distinguir mayúsculas ni tildes**. Todos los términos ingresados deben coincidir.
- Indexar **todos los datos públicos de la ficha**: descripción completa, título técnico, ciudad, categorías y demás metadatos públicos heredados, y **número de teléfono completo o parcial**, con o sin indicativo y con separadores.
- Nunca indexar IDs internos, ownerUid, credenciales ni datos no públicos. No emplear Gemini, búsqueda semántica remota ni enviar consultas a servicios externos. Sin coincidencias, mostrar un estado vacío discreto.

## 7. Diseño, textos e iconografía

- **Ahorrar el máximo espacio vertical posible, no horizontal**. Interfaz muy compacta pero legible, sin truncar contenido. Mantener las mismas acciones y el mismo orden, aunque la presentación sea una fila en PC y dos en móvil.
- **Párrafos de descripción justificados**, última línea alineada naturalmente; títulos centrados cuando convengan en lugares que **sí** tengan título, pero **las fichas no llevan ninguno**.
- **Colores sobrios y distintos** para diferenciar controles; cada icono es una acción independiente. Usar símbolos habituales reconocibles (marcador, WhatsApp, compartir de tres nodos, lápiz, papelera, foto, micrófono, avión de papel).
- **Cero ruido**: sin carteles obvios de pruebas/demo, frases explicativas redundantes, eslóganes grandes, avisos repetitivos, números ficticios, títulos de sección superfluos ni pie promocional. Los errores reales y estados necesarios sí se pueden mostrar discretamente.
- **Nunca mostrar una franja o número de versión en la interfaz**. El identificador de versión puede mantenerse **internamente** para trazabilidad y caché, pero no como texto público.
- **No mostrar fichas de ejemplo en ninguna pestaña**. No inyectar muestras cuando esté vacío. Filtrar registros heredados marcados como ficticios, sin borrar publicaciones auténticas. Se permiten fixtures únicamente en las **pruebas del repositorio**, nunca en la UI.
- **Maquetas e imágenes propuestas deben reflejar estrictamente la aplicación real**: no inventar campos, cajas independientes de ciudad, acciones de aceptar/resolver, etiquetas adicionales ni flujos no implementados.

## 8. Datos, seguridad y estado real del servicio

- **Firebase no estaba configurado** en el archivo de configuración del repositorio al establecer estas reglas. GitHub Pages hospeda una web estática; en modo local cada navegador ve sus propios datos, **no un tablón multiusuario compartido**. Nunca afirmar que Firebase o el servicio público están operativos sin verificarlo.
- Cuando se active Firebase: autenticar donde corresponda, comprobar lectura pública y **editar/eliminar solo por el propietario** tanto en cliente como en reglas Firestore reales; ejecutar pruebas del emulador. GitHub Pages **no despliega las reglas**.
- Publicar teléfono requiere consentimiento informado: el teléfono se usa públicamente en enlaces y PNG. Proteger datos privados y evitar incluir llaves secretas o datos de sesión en HTML, capturas y búsquedas.
- No borrar registros genuinos por quitar ejemplos, cambiar navegación o versionar. No introducir migraciones destructivas sin permiso.

## 9. Forma de trabajar — aprendizaje transversal

1. **Leer código vigente** de la rama **codex/diseno-original**, no asumir que main ni los archivos de versiones anteriores representan la web. Leer antes AGENTS.md, las preferencias y continuidad.
2. **Hacer solo lo pedido**. No agregar mensajes didácticos o cambios de estilo espontáneos. Si hay conflicto con una regla anterior, actualizarla; **no apilar normas incompatibles**.
3. Usar **rama nueva** desde codex/diseno-original, cambios verificables y PR dirigido a esa rama. **Instrucción permanente explícita del titular (25-10-2026): publicar inmediatamente todo cambio solicitado en el proyecto** mediante PR y fusión en la rama de GitHub Pages, sin pedir otra autorización; verificar el resultado disponible e informar las pruebas no realizadas. No afectar main.
4. Probar sintaxis, comportamiento, regresiones, búsqueda, acciones, versión oculta, ausencia de ejemplos, y responsive **móvil y PC**. Decir expresamente qué pruebas físicas/Firestore no se realizaron.
5. Mantener **reglas portables para otra IA**, en **AGENTS.md**, **docs/PREFERENCIAS-LO-NECESITO.md** y **docs/CONTINUIDAD-Y-APRENDIZAJES.md**. Alinear la documentación y pruebas con la decisión reciente; el historial queda en Git.
6. Evitar modificar la interfaz cuando la solicitud sea solo de documentación. Los cambios exclusivamente documentales no requieren incrementar la versión técnica.

## Referencias

- Sitio: https://gruemp.github.io/lonecesito/
- Repositorio: https://github.com/gruemp/lonecesito
- Rama publicada: **codex/diseno-original**
- Preferencias detalladas: [docs/PREFERENCIAS-LO-NECESITO.md](docs/PREFERENCIAS-LO-NECESITO.md)
- Estado y pasos pendientes: [docs/CONTINUIDAD-Y-APRENDIZAJES.md](docs/CONTINUIDAD-Y-APRENDIZAJES.md)
- Archivos activos: **index.html, simple.css, simple.js, simple-model.js, simple-search.js, card-png.js, firebase-config.js, firestore.rules**.

## 2.2.22 — Inicio con casos de uso
- Conservar arriba la portada existente de dos pasos. Bajo ella, mostrar una ilustración independiente para PC y otra para celular, en el formato de dos lados «¿Necesitas algo? → ¿Puedes ayudar?», con pares de ejemplos en Medellín, Bogotá, Cali, Barranquilla y Cartagena. Son imágenes explicativas, no publicaciones reales.
- No añadir botón extra «Publicar lo que necesito» bajo las imágenes.
- **Ubicación no autorizada para implementar todavía**: no pedir geolocalización ni colocar coordenadas en fichas/PNG en esta versión.

## Reglas vigentes 2.2.23 — voz de dos botones y GPS opcional
- Este apartado sustituye las referencias anteriores a cuatro controles de voz y a ubicación pendiente. Primera fila de fichas: llamada, WhatsApp, compartir, y en las propias editar y eliminar. Segunda fila: botón dinámico reproducir/pausar/reanudar, botón reiniciar y botón GPS. También en el editor.
- Únicamente el autor puede capturar GPS al crear o editar, mediante consentimiento de que las coordenadas serán públicas y permiso del navegador. **Versión vigente 2.2.25:** `watchPosition()` sigue obteniendo y mostrando mediciones más precisas en el mismo botón GPS **sin límite automático de 30 s ni objetivo de ±10 m**; solo el **segundo toque del propio botón GPS** detiene voluntariamente y conserva la mejor coordenada. Al abandonar/cancelar el formulario o quitar el GPS, se cancela el observador por seguridad. Si se intenta publicar mientras está midiendo, indicar que pulse el GPS para detener antes de guardar. Los visitantes no se geolocalizan.
- Guardar latitud, longitud y precisión estimada en metros. **Solo la mejor coordenada final** se consulta una vez en BigDataCloud desde el dispositivo para los componentes geográficos disponibles (país, departamento, ciudad y localidad); si no se obtiene calle, dirección o barrio, no inventarlos. Avisar de que BigDataCloud recibe las coordenadas y dirección IP del dispositivo.
- La ubicación es opcional y se presenta como etiqueta no editable, con opción de quitarla. En PNG orden: país, departamento, ciudad, dirección, barrio/localidad, coordenadas y precisión, únicamente para datos existentes. El teléfono continúa en su banda independiente.
- El modo local persiste GPS; el modo nube requiere además despliegue de firestore.rules en Firebase (GitHub Pages no despliega reglas).

## Versión 2.2.25 — dirección opcional y precisión GPS manual
- En el editor, la segunda fila se distribuye como [leer/pausar] [reiniciar] [dirección opcional, editable] [GPS]; la caja está inmediatamente a la izquierda del pin, tiene icono interior y cumple los criterios de la caja del teléfono. No añadir tercera fila.
- `addressText` es texto público opcional (máx. 180 caracteres), editable o retirable sin GPS. Debe guardarse en publicaciones, restaurarse al editar y aparecer en ficha y PNG incluso si no hay coordenadas. Solo el autor lo modifica y Firestore debe validar el campo. La vista del GPS muestra tanto «Dirección indicada por el autor» como «Dirección aproximada del GPS» deducida únicamente de campos administrativos devueltos, sin inventar calles. El proveedor BigDataCloud no garantiza calle/número.
- PNG: preservar el número de teléfono y añadir la dirección indicada por el autor junto a la dirección aproximada y demás datos GPS existentes. La dirección exacta puede revelar un domicilio: el editor advierte que se comparte públicamente.

## Versión 2.2.26 — Google Maps, campos GPS y distancia bajo demanda (25-10-2026)
- En **el cuadro de ubicación del editor** y en **las fichas publicadas**, conservar el desglose GPS país → departamento → ciudad → dirección detectada (si existe) → barrio/localidad (si existe), dirección indicada por el autor y aproximación derivada de coordenadas, latitud/longitud y precisión en metros. Si el servicio no devuelve país/departamento/ciudad/barrio, **mostrar la etiqueta «No identificado»** en vez de ocultarla o inventar el valor.
- El GPS del autor y la dirección de texto se pueden abrir con el enlace **Ver en Google Maps**. Usar el formato oficial de Maps URLs `https://www.google.com/maps/search/?api=1&query=...`: coordenadas si se dispone de GPS; si solo existe dirección textual, consultar la dirección declarada sin fingir que es un pin GPS preciso. La opción **Cómo llegar** usa Maps URLs Directions y deja a Google Maps establecer el origen del visitante; no crear rutas ficticias dentro de LoNecesito.
- Dentro del panel de ubicación de la ficha con coordenadas GPS añadir **Distancia desde mí**, que solicita permiso de geolocalización del visitante **solo cuando se pulsa**. Calcular con Haversine una distancia aproximada **en línea recta**, indicarlo expresamente y aclarar que no son kilómetros por carretera. **No almacenar, persistir, enviar a BigDataCloud ni compartir** coordenadas del visitante; solo se usan en la memoria local de la función de cálculo para mostrar el resultado, y pueden solicitarse nuevamente si se vuelve a pulsar. Permisos denegados producen texto de ayuda, sin bloquear consulta de Google Maps.
- Una ficha que tenga solo dirección manual puede enlazar a Maps y solicitar ruta, pero **no dar una cifra de distancia dentro de la página** por no tener coordenadas verificadas. La distancia por carretera y tiempos de recorrido quedan a cargo de Google Maps.
- Conservar intactos teléfono, WhatsApp, audio de dos botones, GPS continuo del autor hasta segundo toque, ubicación pública y PNG, imágenes de Inicio y reglas existentes de Firestore. No meter la opción de distancia en Inicio ni pedir permiso a visitantes mientras solo navegan.

## Versión 2.2.27 — ajustes actuales a GPS, dirección y Maps (25-10-2026)
- Sustituir la etiqueta del vínculo de Google Maps «Cómo llegar» por **«Desde mí»**, en exactamente la misma posición y con el mismo destino; Google Maps obtiene o solicita su origen conforme a sus propios permisos. **No volver a mostrar «Cómo llegar»**. La opción independiente «Distancia desde mí» sigue calculando distancia en línea recta a petición del visitante.
- **Quitar «Barrio o localidad»** de la información GPS visible en editor, ficha y PNG. Conservar país, departamento, ciudad, la dirección opcional indicada por el autor, coordenadas y precisión. En registros anteriores el campo `neighborhood` puede seguir existiendo por compatibilidad pero nunca se representa; la app ya no lo añade en capturas nuevas.
- «**Dirección aproximada**» significa calle y número (p. ej., «Calle 10A #20A-06»), no una concatenación de ciudad/departamento/país. Para capturas GPS NUEVAS terminadas voluntariamente mediante segundo toque, consultar **una sola vez** la posición final con BigDataCloud para componentes administrativos y con OpenStreetMap Nominatim para calle y número si existen, previo permiso explícito de GPS y divulgación de los dos proveedores. Nominatim puede identificar objetos cercanos, no necesariamente el portal correcto, por lo que el resultado SIEMPRE es aproximado.
- Si Nominatim solo devuelve la calle, mostrar solo la calle (no inventar número); si no devuelve calle, mostrar «Calle y número no identificados» y permitir usar el campo «Dirección (opcional)». Nunca obtener calle a partir de localidades inventadas. Mantener enlaces Maps apuntando a las coordenadas del autor.
- Respetar uso moderado de Nominatim, máximo una consulta por segundo desde el navegador y atribución «© OpenStreetMap» visible en la ficha/editor y en PNG cuando se usa dirección de OSM. Es un servicio público con capacidad limitada, no apto para alto volumen sin cambiar proveedor.

## 2.2.28 — GPS y direcciones adaptados de Natura
- Replicar de gruemp/natura/analytics-visitas.js la extracción flexible de campos GPS: city, town, village, municipality, county, state, country de OpenStreetMap. Respaldar los campos administrativos faltantes con BigDataCloud, incluidos locality, city, principalSubdivision y countryName. No transmitir GPS a los endpoints de analíticas/visitantes de Natura ni usar IP para calcular necesidades.
- Cada captura del autor concluye solo al segundo toque GPS. Consultar dos geocodificadores una vez con la mejor posición final y COMBINAR sus respuestas; los fallos parciales no pueden borrar país, departamento, municipio ni ciudad encontrados por el otro. No confundir departamento con ciudad cuando el municipio es desconocido.
- Ubicación pública: país, departamento, municipio (si identificado), ciudad, dirección aproximada de calle/número si existe, coordenadas y precisión. El PNG también incluye municipio. Modelo opcional municipality (máximo 160 caracteres) sujeto a reglas Firestore; conservar publicaciones antiguas.
- Natura tiene adicionalmente Google Apps Script Maps.newGeocoder en el backend de visitantes. Es específico del proyecto y NO se reutiliza. Para igualar ese respaldo en LoNecesito haría falta configurar un servicio independiente.
- Publicaciones históricas con nombres geográficos vacíos no se geocodifican al ser vistas para evitar transmitir a terceros el GPS almacenado. Solo el autor puede volver a medirlo voluntariamente. Se mantiene el botón Desde mí y distancia local del visitante con permiso.
