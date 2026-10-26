# LoNecesito — estado vigente, aprendizajes y continuidad

**Revisión de documentación:** 25 de octubre de 2026  
**Versión del código:** 2.2.32 (no visible al público)
**Apps Script:** proyecto independiente desplegado, versión 1, URL verificada y configurada
**Sitio:** https://gruemp.github.io/lonecesito/  
**Repositorio:** https://github.com/gruemp/lonecesito  
**Rama desplegada por GitHub Pages:** **codex/diseno-original**.

Este documento permite que una nueva IA retome el proyecto con contexto real y sin depender de esta conversación. **Obligatorio leer [AGENTS.md](../AGENTS.md) y [PREFERENCIAS-LO-NECESITO.md](PREFERENCIAS-LO-NECESITO.md)** antes de intervenir. Ambos recogen las instrucciones vigentes; este archivo añade estado técnico, aprendizajes y protocolo.

## Cambios aprobados e implementados el 25-10-2026

- Mensaje contextual de WhatsApp: «Hola, vi tu publicación en LoNecesito: *«[resumen]»*. ¿Aún lo necesitas? Puedo ayudarte.». Se destaca solo la necesidad.
- Lectura en voz alta del texto completo desde el icono de altavoz en todas las fichas. Un segundo toque pausa la voz; el siguiente reanuda desde el punto donde quedó. Control en dos filas: 3 iconos para visitantes y 5 para el dueño en la primera; cuatro independientes de voz en la segunda. Si el navegador no soporta voz, muestra aviso puntual.
- No cambia la portada ni el editor ni la configuración pendiente de Firebase. Verificación en celular físico y comprobación independiente de GitHub Pages pendientes si no se puede acceder al dispositivo externo.

## Cambio 2.2.22 — 25 de octubre de 2026

- Se añadieron dos imágenes SVG de casos de uso bajo la portada original, una PC y una móvil, con parejas entre personas solicitantes y posibles ayudantes. Incluyen ciudades Medellín, Bogotá, Cali, Barranquilla y Cartagena. No se puso botón adicional al final de Inicio.
- Primera fila de cada ficha: contacto, compartir y, si es el autor, editar y eliminar. Segunda fila independiente: cuatro botones de voz para reproducir, pausar, reanudar y reiniciar; también disponible en el editor.
- No se implementó ubicación. Consentimiento, geocodificación inversa, precisión y datos compartidos se siguen discutiendo.
- Las ilustraciones son informativas, no casos reales publicados. Verificación física móvil y navegador externo pendientes.

## Cambio 2.2.21 — 25 de octubre de 2026

- Aprobación expresa: mantener pulsado un segundo el icono de voz para reiniciar desde el principio, esté reproduciéndose o pausado. Se aplica tanto a publicaciones como al borrador del editor; sin añadir iconos ni filas.
- Implementado con eventos Pointer Events (`pointerdown` y cancelación con `pointerup`, `pointercancel` y `pointerleave`), un temporizador de 1.000 ms y supresión del clic posterior a la pulsación prolongada; se evita el menú contextual del botón. Los clics cortos siguen alternando reproducir/pausar/reanudar. Los estados tienen etiquetas accesibles que describen el gesto.
- Verificar en móvil real (Android/iOS) que la pulsación larga no activa menú contextual ni pausa involuntaria; las pruebas simuladas no reemplazan dispositivo físico.

## Cambio 2.2.20 — 25 de octubre de 2026

- Nuevo límite editorial de 1.000 caracteres para descripciones nuevas o modificadas. No hay mínimo aparte de no estar vacía; se cuentan los espacios.
- Fichas históricas de más de 1.000 y hasta 4.000 caracteres se preservan íntegramente; se permite modificar teléfono o fotografía sin alterar descripción. Para editar su texto se exige ajustarlo a 1.000, nunca truncarlo automáticamente.
- Editar implica longitud del textarea según texto histórico para evitar que el navegador corte la información al mostrarla; el dictado respeta el límite activo. Validación actualizada en modelo, editor y firestore.rules, con excepciones explícitas para actualizaciones de datos heredados.
- Las reglas de Firestore en GitHub NO se despliegan solas; realizar su despliegue por separado al configurar el proyecto Firebase. Tests de Firestore agregados para emulador, aún pendientes de ejecutarse si no está activo.
- La petición de reiniciar audio mientras se reproduce o pausa quedó aprobada e implementada posteriormente en la versión 2.2.21 con pulsación prolongada de un segundo sobre el mismo icono.

## Corrección 2.2.19 — 25 de octubre de 2026

- Motivo: el botón «Reanudar» dejaba de producir sonido en navegadores Android. `speechSynthesis.pause()` puede terminar la locución en vez de pausarla; `resume()` no restablece la voz.
- Solución: cortar el texto en tramos breves (hasta 155 caracteres); al pulsar Pausa cancelar la voz y conservar tramo/desplazamiento obtenido mediante `onboundary`; al pulsar Reanudar crear una locución nueva con el texto restante. Si el navegador no informa progreso de palabra, repetir solo el tramo actual, no todo el texto. Ignorar eventos de cancelación antiguos para evitar saltos.
- Comprobación: simulación de fallo Android con eventos `end` y `error` de cancelación; se verificó audio nuevo al reanudar y continuidad del resto de tramos. Prueba física Android pendiente.
- Instrucción operativa vigente del titular: cada modificación solicitada debe publicarse inmediatamente en GitHub Pages, sin pedir permiso adicional. Mantener ramas y pruebas.

## Actualización 2.2.18 — 25 de octubre de 2026

- Reproducción de voz con estados visibles: altavoz (iniciar), pausa (detener temporalmente) y reanudar (continuar desde el punto anterior); un único audio activo.
- Botón para escuchar el texto de la nueva publicación en el editor, en la misma fila compacta de teléfono, foto, micrófono y envío; también funciona durante edición.
- PNG compartido con número telefónico visible, formateado y destacado en una banda de contacto. No se imprime el número dentro de la ficha pública.
- Desde 2.2.19 se evita pausa y reanudación nativas problemáticas; la continuidad se reproduce mediante nuevas locuciones cortas. Aún requiere verificación en dispositivos físicos.

## 1. Qué problema resuelve la web

**LoNecesito es un tablón de necesidades**, no un portal de ofertas ni una plataforma de intermediación. Una persona redacta lo que necesita y agrega su teléfono. Otra ve su necesidad y la contacta directamente mediante **llamada telefónica** o **WhatsApp**. El dueño puede editarla y eliminarla. No hay propuestas, interesados, aceptar, rechazar, resolver, pagos, negociación propia de la web ni Gemini.

## 2. Interfaz actual, no negociable salvo instrucción nueva

- **Navegación:** cuatro pestañas en orden **Inicio → Publicar lo que necesito → Mis publicaciones → Ver necesidades**, en **una fila en PC** y **cuadrícula 2 × 2 en móvil**, persistentes al navegar. En PC están alineadas por ambos extremos con la imagen de Inicio.
- **Inicio:** solo la **imagen aprobada de dos pasos**: «1. Publica lo que necesitas» (licuadora) → «2. Lo ven y te contactan» (llamada o WhatsApp). Archivo: **assets/lonecesito-presentacion-dos-pasos.png**, 1819 × 865. Se ajusta al viewport para aparecer completa al 100 % de zoom, alineada con la navegación, sin recortes ni deformaciones. La imagen anterior queda como respaldo y la variante con mayonesa fue descartada.
- **Ver necesidades:** buscador en vivo, con coincidencias parciales por varios términos, sin tildes/mayúsculas, indexando campos públicos históricos y números telefónicos completos/parciales. Solo necesidades **reales**.
- **Mis publicaciones:** solo las publicaciones creadas por el dueño.
- **Publicar:** dos entradas obligatorias (descripción completa y teléfono) más una tercera caja de **dirección opcional**, junto al botón GPS en la segunda fila. No pedir título, ciudad ni presupuesto aparte. La descripción admite cualquier longitud no vacía (máximo de 1.000 para nuevas publicaciones o cambios de descripción; texto histórico >1.000 sin modificaciones se conserva hasta su tamaño previo máximo de 4.000).
- **Controles del editor:** una fila con teléfono e icono a su izquierda y marcador «Ej: 300 123 4567» dentro; foto, micrófono y envío por avión de papel, **sin texto visible en el botón verde**. Enter envía; Shift+Enter salta de línea. En edición aparecen además papelera y X para cancelar, en esa fila.
- **Fichas:** sin título visual; todo el texto justificado y visible, alto según contenido. **Con foto:** derecha, ajuste sin cortes, pulsar para ver completa y cerrar con X/Escape/toque fuera. **Sin foto:** texto a todo el ancho, sin huecos ni marcadores.
- **Acciones de ficha:** primera fila, llamar/WhatsApp/compartir (visitantes); más editar/eliminar (autor). Segunda fila fija de voz: reproducir, pausar, reanudar y reiniciar. Sin geolocalización todavía.
- **Compartir:** generar PNG local fiel al contenido sin título visual, foto solo si existe y **teléfono real dentro del PNG en banda elegante de contacto**; usar compartir nativo o descargar. El número no se imprime sobre la ficha web.
- **No mostrar ejemplos ni versión:** no hay necesidades ficticias, números de prueba ni barra «Versión X.Y.Z» en ninguna pantalla. Tampoco avisos de demo que estorben.
- **Diseño:** máxima economía vertical **sin sacrificar ancho ni claridad**; colores diferenciados, opciones independientes, texto descriptivo justificado con última línea natural; mantener misma experiencia esencial en PC y celular.

**Cambios de opinión registrados y resueltos:** se prefirió finalmente **texto a todo el ancho cuando no hay imagen**, no reserva vacía. Se terminó con **cuatro pestañas**, no tres. **La versión dejó de ser visible** aunque antes se había pedido lo contrario. **Todos los ejemplos se eliminaron** aunque antes habían sido deseados para revisar el diseño. **La ilustración aprobada de dos pasos** es la elegida actualmente y vive solo en Inicio. Estas elecciones nuevas sustituyen las viejas.

## 3. Archivos activos del repositorio

| Archivo | Rol actual |
| --- | --- |
| **index.html** | Cuatro vistas, navegación, editor de dos campos, controles por icono, miniatura y visor, autenticación cuando esté configurada |
| **simple.css** | Diseño compacto responsive, navegación horizontal en PC y 2×2 en móvil, fichas, colores, imagen y editor |
| **simple.js** | Navegación, publicación/edición/borrado, lectura, DOM seguro, contactos, audio, foto, zoom y modo local/Firebase |
| **simple-model.js** | Versión **interna**, normalización y validación telefónica, límites de contenido y permisos |
| **simple-search.js** | Búsqueda por tramos de datos públicos, metadatos históricos y teléfono; sin Gemini |
| **card-png.js** | Representación PNG compartible y descarga, sin servidor |
| **firebase-config.js** | Configuración web de Firebase; **al cierre de esta revisión sus campos están vacíos** |
| **firestore.rules** | Reglas para futura infraestructura Firebase; **no desplegadas automáticamente por GitHub Pages** |
| **tests/simple-publicaciones.test.mjs** | Pruebas y contratos del cliente y de la interfaz |
| **tests/simple-search.test.mjs** | Pruebas de búsqueda de texto, tildes, fragmentos y teléfono |
| **tests/firestore.rules.test.mjs** | Contratos de permiso para el emulador Firestore |
| **AGENTS.md** | Normas operativas vigentes y protocolo para cualquier IA |
| **docs/PREFERENCIAS-LO-NECESITO.md** | Guía detallada de criterios visuales, funcionalidades y aceptación |

**No reactivar automáticamente los archivos históricos de código** o README antiguos: describen prototipos distintos, a veces con ofertas, ejemplos, estados, formularios complejos y navegación ya descartada.

## 4. Lo que está pendiente realmente

1. **Persistencia entre visitantes.** El archivo de configuración Firebase tiene campos vacíos. En ese estado las necesidades creadas se guardan en **localStorage en el navegador donde se publican**, no en una base de datos común a todos. Las pruebas y publicaciones locales no prueban que el producto ya sea un tablón público multiusuario.
2. **Firebase real:** configurar un proyecto autorizado, Authentication si procede, Firestore, permisos de autor, reglas desplegadas, proveedores de inicio de sesión y prueba de creación/lectura pública/edición propia y bloqueo de edición ajena. **Nunca afirmar éxito sin verificar.**
3. **Almacenamiento de fotografías:** por ahora se comprimen y se almacenan como imágenes codificadas en el propio registro. Para crecimiento real evaluar límites, Firebase Storage u otra solución, sus permisos, costos y privacidad; no implementarla sin una petición.
4. **Prueba visual con dispositivos físicos**: ancho y navegación 2×2 en móvil/PC, micrófono del navegador, teclado Enter y Shift+Enter, fotos, ampliación, llamadas, WhatsApp, compartir archivo PNG, iconos y confirmación de borrado.
5. **Pruebas de reglas** mediante Firebase Emulator/Java/CLI, no asumidas a partir de tests de cliente.
6. **Accesibilidad:** revisar orden de foco, contraste, lector de pantalla, botones solo-icono, avisos puntuales y zoom del navegador.

## 5. Lecciones aprendidas de la colaboración

- El usuario prefiere **hacer la modificación exactamente solicitada**, no mejoras genéricas o cambios innecesarios. La fidelidad es más importante que introducir complejidad.
- **Compacto significa sobre todo reducir altura**. No equivale a aplastar el ancho ni ocultar contenidos. Los celulares deben permitir comprender el mayor número de necesidades posible de un vistazo.
- Los **colores distintos** ayudan a percibir acciones independientes; cada botón debe comunicar inmediatamente su propósito. Los iconos deben ser reconocibles, especialmente compartir mediante **tres nodos unidos**, no una flecha genérica.
- **La ficha es la pieza central del diseño.** Sin títulos, justificación de todo el cuerpo, foto a la derecha solo si existe y acciones en una sola fila. No crear cajas de ciudad, categoría, presupuesto ni fecha.
- Cuando alguien habla de buscar «por tramos» quiere **fragmentos de palabras y coincidencias parciales de teléfono**, no un formulario de filtros restrictivo ni Gemini.
- El editor tiene **dos campos obligatorios** (descripción libre y teléfono) y **una dirección opcional**, ubicada al lado del GPS; micrófono y foto siguen siendo opciones.
- Evitar los **mensajes que fastidian**, incluso si son técnicamente precisos: documentar límites del prototipo y pruebas en GitHub y en las respuestas de desarrollo, no ocupar constantemente la UI con ello. Mostrar solo información útil para una acción.
- El usuario cambia y afina preferencias **a partir de imágenes y capturas**. Actualizar reglas cuando cambie de opinión y **retirar órdenes anteriores**. No conservar dos interpretaciones contradictorias.
- La ilustración vigente es **la primera de dos pasos aprobada por el usuario**: ejemplo con licuadora, no con mayonesa; refleja publicación y contacto directo, sin ofertas ni negociación dentro de la web.
- La continuidad **debe poder viajar entre distintas IA**: no depender de memoria de chat, mantener Markdown estructurado, enlaces y estado de lo no implementado.
- Un PR fusionado y un workflow verde **no sustituyen la revisión física** de la experiencia. Informar claramente límites de pruebas.

## 6. Protocolo para otra IA

1. Leer [AGENTS.md](../AGENTS.md) y [preferencias](PREFERENCIAS-LO-NECESITO.md) **antes de tocar código**.
2. Inspeccionar siempre el estado actual de **codex/diseno-original**, los PR recientes y el asset de la imagen. No asumir que main se despliega.
3. Detectar si el cambio solicitado contradice una regla; entonces modificar la **regla vigente**, no agregar al final un mandato que deje ambos activos.
4. Crear una rama nueva, limitar el diff, añadir pruebas relevantes y PR con base **codex/diseno-original**. Fusionar y publicar inmediatamente después de realizar los cambios solicitados, sin pedir nueva confirmación; informar las verificaciones pendientes.
5. Comprobar build/despliegue GitHub Pages, pruebas del cliente, navegación, permisos, búsqueda y ausencia de ejemplos. No anunciar pruebas de navegador/dispositivos/Firestore Emulator no realizadas.
6. Actualizar los **tres archivos de documentación** en cada cambio que altere preferencias; conservar el historial en commits/PR. Una petición **solo documental** no necesita alterar index.html ni incrementar versión interna.
7. Informar lo implementado y lo pendiente, sin mensajes invasivos en la web.

## 7. Cómo interpretar el historial

El historial de Git y el README registran un proceso iterativo desde formularios, muestras y versiones visibles hasta esta experiencia simplificada. **Ese historial no es una segunda especificación activa.** Si una indicación histórica choca con las secciones anteriores, seguir la decisión reciente. Referencias: [commits y PR del repositorio](https://github.com/gruemp/lonecesito/pulls), incluido PR #42 para la navegación actual.

**El estado de la interfaz está cerrado por ahora, no la infraestructura.** Cualquier IA que retome debe verificar de nuevo la configuración real de Firebase, el deployment y los datos antes de afirmar que existe un servicio compartido.

## Cambio 2.2.23 — 25-10-2026
- Voz simplificada: dos botones, uno dinámico reproducir/pausar/reanudar y otro reiniciar; se conserva la reanudación por tramos sin dependencia de la pausa nativa Android.
- GPS opcional en la segunda fila: icono pin. Solo al crear/editar, pulsando el botón y confirmando difusión pública, el navegador HTTPS solicita geolocalización de alta precisión (maximumAge=0, timeout 18 s). Muestra latitud/longitud y precisión estimada, nunca editable manualmente. Permite quitar GPS.
- Consulta de localidad a BigDataCloud desde el dispositivo en el momento de captura; no hay IP fallback ni seguimiento. Solo se guardan campos efectivamente devueltos; no inventar dirección o barrio. El proveedor recibe coordenadas e IP según su política.
- Las fichas muestran la ubicación guardada por el autor. Sus visitantes no comparten su ubicación ni se les pregunta por GPS.
- PNG incluye país, departamento, ciudad, dirección, barrio/localidad disponibles, luego latitud/longitud y precisión, así como teléfono.
- location es un campo opcional persistido en modo local y definido en firestore.rules para modo nube. Las reglas requieren despliegue separado cuando haya Firebase activo; GitHub Pages solo publica código estático.
- Pendiente probar GPS real, denegación de permisos, diseño táctil y reverse geocoding en dispositivos.

## Cambio 2.2.24 — 25-10-2026
- Se mejoró solo el comportamiento/apariencia del **mismo botón GPS** del editor, sin añadir controles ni modificar la estructura de filas. Al pulsar, se solicita confirmación de publicación de coordenadas y permiso del navegador como antes, ahora con geolocalización de varias mediciones `watchPosition` de alta precisión (sin usar ubicación en caché).
- El propio pin cambia a estado animado «Midiendo GPS» y muestra la mejor precisión ±metros en tiempo real, sin mostrar una medición peor posterior. Al volverlo a pulsar, se corta el observador y se conserva la mejor ubicación registrada. También se detiene automáticamente al llegar a ±10 m o después de 30 segundos, lo primero que ocurra. ±10 m es objetivo estimado, nunca garantía física.
- Tras detenerse se solicita **una única** consulta de dirección a BigDataCloud con la mejor coordenada final. Los puntos intermedios no se envían. Se mantienen sin cambios la etiqueta de ubicación, publicación del GPS de autor y PNG, y la indicación de precisión con metros. Si no llega ninguna posición, no reemplazar una ubicación ya guardada.
- Al cancelar GPS, quitar ubicación, abandonar una edición, cambiar de vista o guardar, detener seguimiento y limpiar temporizadores. Solo botón GPS controla inicio/parada. En las fichas públicas **no se activa watchPosition ni se solicita permiso**.
- Pruebas de dispositivo real para precisión, permisos, geocodificación y actualización visual pendientes.

## Cambio 2.2.25 — 25 de octubre de 2026 (vigente)
- El autor solicitó expresamente que el GPS **no se detenga automáticamente** por haber alcanzado ±10 m ni por 30 segundos. El observador de precisión continúa indefinidamente en el editor hasta pulsar por segunda vez el pin. Mientras mide conserva la mejor muestra y el mismo pin muestra ±metros. Por privacidad, abandonar el editor, quitar GPS o cancelar detiene el observador; intentar publicar durante medición pide que se detenga desde el pin antes de guardar.
- En la misma segunda fila, **inmediatamente a la izquierda del botón GPS**, se incorporó una caja de dirección opcional `need-address` con icono a la izquierda y placeholder dentro, replicando criterios de la caja del teléfono. Los dos botones de voz permanecen a su izquierda. No se añadió otra fila. Límite 180 caracteres, campo opcional y público.
- Las publicaciones conservan `addressText` separado de `location`: se puede escribir sin GPS, editar o quitar. Al pulsar pin de la ficha se muestra «Dirección indicada por el autor» y, cuando hay coordenadas, «Dirección aproximada del GPS» sintetizada de los componentes que devuelve BigDataCloud, además de latitud, longitud, precisión y detalles administrativos. Nunca se inventan calles ni números.
- PNG incluye la dirección del autor con o sin GPS; si hay GPS incluye ambos tipos de dirección, ciudad, departamento, país y precisión, y conserva el número de teléfono. Las reglas Firestore admiten `addressText` opcional, con longitud validada y permisos del autor, pero requieren despliegue separado a Firebase.
- Pruebas simuladas y prueba física posterior de GPS continuo/dirección pendientes de registrar; el GPS prolongado puede consumir batería y la precisión reportada nunca garantiza exactitud.

## Cambio 2.2.26 — 25-10-2026
- Se restablece en el cuadro de ubicación el desglose país/departamento/ciudad/barrio cuando están disponibles, y etiquetas «No identificado» cuando faltan. No inventar valores ni rellenar con una ciudad fija. Se mantienen campo libre del autor, dirección GPS aproximada, coordenadas y precisión; el formato PNG existente sigue intacto.
- `location-model.js` incorpora helpers puros de **Google Maps URLs** de búsqueda y ruta, con coordenadas del GPS del autor preferidas sobre la dirección de texto, o búsqueda textual si solo se publicó una dirección; no hace falta API key. En el editor se puede abrir Google Maps desde la propia caja informativa cuando hay ubicación/dirección.
- En las fichas, dentro del panel que abre el pin, hay **Ver en Google Maps** y **Cómo llegar**. Si hay GPS, aparece además el botón **Distancia desde mí**. Únicamente tras pulsarlo se pide `navigator.geolocation.getCurrentPosition` con alta precisión y permiso del visitante. Distancia calculada localmente con fórmula de Haversine y rotulada «en línea recta; no es distancia por carretera». No guardar ni transmitir posición del visitante. Si deniega permiso, ofrecer Maps sin bloquear.
- La consulta Maps Directions usa solo el destino del autor; Google Maps solicita/identifica origen conforme a sus controles. Con solo dirección manual, mostrar vínculos de Maps pero no una cifra de kilómetros local, porque no hay coordenadas del destino. Mapas, rutas y distancias NO se agregaron al PNG, porque allí no son interactivos ni representan una ubicación de visitante fija.
- Se conservan GPS manual del autor hasta segundo toque, dirección opcional pública, controles de voz, layout e imágenes de Inicio. Pruebas de dispositivo real y emulador Firestore pendientes. Las reglas Firestore no cambiaron con esta actualización.

## Cambio 2.2.27 — 25 de octubre de 2026
- «Cómo llegar» pasa a llamarse **«Desde mí»** en el enlace de rutas de Google Maps; se mantiene «Distancia desde mí» como cálculo de distancia geográfica en línea recta independiente.
- El desglose GPS sigue mostrando país, departamento, ciudad, dirección indicada por autor, coordenadas y precisión, pero **elimina la etiqueta barrio/localidad** de editor/fichas/PNG; en capturas nuevas ya no almacena ese atributo, aunque se aceptan publicaciones históricas que lo traigan.
- «Dirección aproximada» ahora debe ser calle/número real si lo proporciona OpenStreetMap Nominatim al consultar las coordenadas finales de una captura VOLUNTARIA, p. ej. «Calle 10A #20A-06». Si se devuelve solo calle, no inventar número; si tampoco hay calle, presentar «Calle y número no identificados». Sin falsa «dirección» concatenando ciudad, departamento, país. No se pueden garantizar nomenclatura y número con GPS solo.
- Al terminar la captura del GPS, se realizan hasta dos consultas puntuales desde el teléfono: BigDataCloud para región/ciudad y Nominatim para calle/número, no en cada medición, y solo tras consentimiento específico de divulgación de coordenadas. Datos OSM con atribución en la ficha/editor y PNG; las consultas al servicio público se limitan a una por segundo por navegador y deben migrarse a proveedor administrado si el uso escala. Los puntos del visitante que consulta distancia siguen siendo privados, sin geocodificación remota.
- Versiones JS/CSS con caché actualizada. Pruebas de GPS real, política de cuota OSM, emulador Firestore y navegador físico pendientes. Las reglas Firestore mantienen compatibilidad con datos heredados.

## Cambio 2.2.28 — 25-10-2026
- Se estudió gruemp/natura: analytics-visitas.js obtiene administración y calle mediante reverse Nominatim y usa BigDataCloud como respaldo; el backend Apps Script utiliza Maps.newGeocoder().reverseGeocode con caché para obtener formatted_address.
- LoNecesito ahora combina respuestas OSM y BigDataCloud en locationFromNaturaGeocoders. Antes descartaba país/departamento/ciudad de OSM, dependiendo exclusivamente de BigDataCloud: fallo de proveedor producía campos vacíos. Ahora extrae city/town/village/municipality/county/state/country de OSM y locality/city/principalSubdivision/countryName del respaldo.
- Se añade municipality opcional (validado en firestore.rules) y rótulo Municipio a detalle y PNG. No copiar departamento como ciudad. Si calle/número no están, informar sin inventar nomenclatura. Se conserva mapa Desde mí, distancia por permiso, GPS continuo hasta segundo toque, ausencia del rótulo Barrio o localidad y dirección opcional.
- No reutilizar endpoint de captura de visitas de Natura; no hay geocodificación al mostrar registros históricos por privacidad. Si faltan campos históricos, el autor puede editar y actualizar voluntariamente la dirección del punto guardado (2.2.29), o volver a captar GPS en el lugar de la necesidad. La restricción inicial fue sustituida por autorización posterior para Apps Script; ver preparación 2.2.32. No reutilizar el backend de visitantes.
- GitHub Pages publica solo la web; las reglas Firestore necesitan despliegue adicional. Pruebas de GPS reales, proveedores y emulador Firestore pendientes.


## Cambio 2.2.29 — 25 de octubre de 2026
- Confirmado en Natura analytics-visitas.js el flujo Nominatim con respaldo BigDataCloud. La adaptación 2.2.28 ya estaba fusionada al empezar esta revisión. Se mantiene exclusivamente resolución directa desde navegador, **sin Apps Script**.
- Corregida la espera conjunta de proveedores: cada respuesta actualiza país/departamento/municipio/ciudad/calle inmediatamente; fallo o lentitud del otro no retrasa lo ya disponible. Las actualizaciones de la misma coordenada conservan valores conocidos si la nueva respuesta está vacía. Estado breve mientras resuelve.
- El panel del editor incorpora Actualizar dirección GPS para recuperar ubicaciones antiguas con campos vacíos desde el punto guardado, bajo consentimiento explícito a OSM/BigDataCloud y sin geolocalizar al autor. Debe guardar después. Nunca geocodificar fichas automáticamente ni geocodificar al visitante que consulta distancias.
- Municipio faltante queda visible como No identificado. Extracción tolera cadenas en blanco y Perimetro/Perímetro Urbano; vías OSM footway/path como Natura. Apartamento/piso/torre se indica manualmente en la misma caja opcional y se conserva sin sobrescribir.
- Guardar espera la consulta con bloqueo previo de doble envío; salir/cancelar invalida respuestas tardías y guardados pendientes. Se conservan Maps Desde mí, Haversine y privacidad de la distancia del visitante. Sin cambios en Firestore ni Firebase.
- Pruebas: nueva suite de 10 casos de flujo con proveedores simulados, consentimiento, punto histórico, fallos parciales/totales, cancelación, persistencia y doble envío; reparados dos arneses GPS existentes incompletos. Sintaxis de módulos verificada. La suite completa ya presentaba 53 fallos antes del cambio (38 del prototipo histórico y 15 de pruebas activas desactualizadas). Resultado final: 146/197 aprobadas, 51 fallos previos, ninguno nuevo; los dos arneses GPS reparados pasan. Las 20 comprobaciones seleccionadas de ubicación pasan. Prueba física de GPS, disponibilidad real de geocodificadores y Firestore Emulator pendientes.

## Cambio 2.2.30 — Panel GPS móvil (25-10-2026)
- Captura del titular: el texto del panel GPS se dividía en fragmentos de pocas letras y producía una columna excesivamente alta. Causa: gps-label con flex:1 y min-width:0 compartía fila con dos acciones de ancho intrínseco; flex-wrap permitía encoger el texto antes de mover los botones.
- Sustituir únicamente la distribución del panel por grid de texto y botón quitar. Agrupar Actualizar dirección GPS y Maps en gps-preview-actions, en una fila independiente con flex-wrap; estado y atribución ocupan ancho completo. Los ID/eventos no cambian y el texto sigue íntegro.
- Versión/caché 2.2.30. Sin cambios al PNG, datos, geocodificación, GPS continuo, permisos, distancias, Firebase o Firestore. Pruebas físicas de GPS y Firestore Emulator no realizadas.

## Cambio 2.2.31 — Numeración aproximada con respaldo (25-10-2026)
- Petición del titular: intentar recuperar automáticamente la nomenclatura completa. No se incorporan Apps Script, claves de pago ni backend. Nominatim usa layer=address y se añade una sola consulta Photon cuando hay calle sin número y precisión GPS ≤25 m. Photon usa el mismo origen OSM: mejora potencial de selección/índice, no promesa de nueva cobertura.
- Validar candidatos por calle coincidente, número registrado, geometría Point válida y distancia ≤25 m. No inferir número por interpolación ni adoptar otra calle. Mantener datos previos y dirección manual/apartamento; esperar respaldo antes de guardar y abortarlo al salir/quitar GPS. No degradar número conocido del mismo punto/calle.
- Consentimiento actualizado con los tres destinatarios y aproximación de portal cercano. La atribución OSM del panel y PNG sigue siendo válida. Los servicios públicos no garantizan disponibilidad; moderar consultas y sustituir por servicio administrado si el proyecto escala.
- Prueba HTTP real del endpoint Photon: 200 y CORS permisivo. Caso público Unter den Linden 2, Berlín: búsqueda pública y consulta inversa producen dos candidatos; el selector recupera Unter den Linden #2. No se enviaron a terceros las coordenadas de las capturas del usuario.
- Nuevas regresiones sobre selección, distancia/calle/precisión, numeración faltante, respaldo condicional, fallos, cancelación, persistencia, preservación de número y consentimiento. GPS físico del usuario y Firestore Emulator siguen pendientes; no se afirma recuperación de número en su ubicación concreta.
- Referencias primarias: https://nominatim.org/release-docs/latest/api/Reverse/ · https://github.com/komoot/photon/blob/master/docs/api-v1.md · https://github.com/komoot/photon#demo-server .

## Cambio 2.2.32 — Google Apps Script como Natura (25-10-2026)
- Se comprobó Natura/visitantes-servicios.js: reverseGeocodeCached_ usa Google Maps, español, región co y primer formatted_address con caché de seis horas y dos minutos vacía. Se replicó únicamente ese mecanismo en apps-script/geocodificador/Code.gs, con manifiesto independiente; no se modificó Natura.
- El usuario autorizó Apps Script expresamente y revocó la prohibición inicial. Servicio solo de geocodificación, sin identidad, teléfono, registros de visitas o Telegram. Validación de entradas, JSONP con callback aleatorio limitado, salida escapada y endpoint de estado.
- google-geocoder.js consume el servicio por JSONP con URL de Apps Script /exec validada, timeout, cancelación y descarte de respuestas tardías. location-config.js tiene la URL real de la implementación 1 devuelta por Google, con estado anónimo y JSONP comprobados.
- Cliente preparado para priorizar Google y su dirección formateada; conservar apartamento/manual, respaldos anteriores y datos conocidos del mismo punto. Campo addressSource opcional en reglas Firestore y atribución correcta en panel/ficha/PNG. El PR se completa después de configurar el endpoint real y se publica mediante Pages.
- Pruebas locales: 35 casos de flujo, servidor Maps/caché simulado, JSONP, validación, selección, cancelación, persistencia y PNG aprobados; 7 regresiones seleccionadas adicionales. No son pruebas de Google real ni del GPS físico. Emulador Firestore no ejecutado.
- Acceso a Google completado por el formulario seguro del navegador y cuenta elegida por el titular. Se creó LoNecesito — Geocodificador GPS y se desplegó versión 1 como propietario con acceso anónimo. Los IDs/URL están en deployment.json y .clasp.json. No se accedió ni copió CLASPRC_JSON de Natura ni se alteraron sus proyectos/workflows.
- Verificación real HTTP sin sesión: estado ready; JSONP válido; muestra pública de Bogotá con datos administrativos sin calle y ejemplo oficial Times Square con dirección 1560 Broadway #1105, New York, NY 10036, EE. UU. (aprox. 7,65 s). No se probaron coordenadas privadas del usuario. Se amplió el timeout de Google a 12 s y el total con respaldos a 25 s por la latencia observada. Guía exacta: apps-script/geocodificador/README.md. Verificar Pages del commit final.
