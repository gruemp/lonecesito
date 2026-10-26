# Preferencias de LoNecesito — diseño y funcionamiento vigentes

**Actualizado: 25 de octubre de 2026.** Este documento reemplaza como guía vigente la acumulación de versiones anteriores. Las decisiones descartadas siguen en el historial Git, pero **no son requisitos actuales**. Consultar también [AGENTS.md](../AGENTS.md) (normas operativas) y [CONTINUIDAD-Y-APRENDIZAJES.md](CONTINUIDAD-Y-APRENDIZAJES.md) (estado técnico).

## A. Concepto exacto del producto

**LoNecesito sirve para publicar necesidades y facilitar que quien pueda atenderlas contacte directamente a su autor.** Puede tratarse de productos, bienes o servicios.

**Recorrido esperado:**
1. Una persona escribe en texto libre qué necesita, deja un teléfono y publica.
2. Otra persona encuentra la necesidad en la lista o el buscador.
3. Usa un icono de llamada o WhatsApp y se comunica **directamente** con quien publicó, fuera de LoNecesito.
4. Quien publicó puede editar o eliminar su registro en cualquier momento.

**No es un mercado de ofertas:** no se publican ofertas del proveedor, no hay aceptar/rechazar, resolver, ofertar, postularse, avisos de interesado, mensajería interna, mediación, tareas de negociación ni estados de seguimiento. El usuario insistió repetidamente en quitar toda interfaz que sugiera ese flujo.

## B. Regla máxima de presentación

**Ahorrar espacio vertical, no horizontal.** En celular, procurar ver tanta información como sea razonable de un vistazo, sin esconder, truncar o estrechar el texto. La claridad se obtiene mediante **opciones separadas y colores contrastados**, no mediante largos mensajes.

- Textos **descriptivos justificados**. La última línea de un párrafo mantiene alineación natural para no crear espacios grotescos.
- En elementos que realmente precisen un título, centrarlo cuando mejore el aspecto. **Dentro de las fichas no debe haber ningún título**.
- Fichas de altura natural, sin altas zonas vacías ni filas repetidas. Espaciado compacto con zonas táctiles accesibles.
- Evitar avisos obvios, párrafos instructivos bajo encabezados, eslóganes grandes, pies redundantes y banners de «esto es una prueba». Mostrar solo errores y estados que ayuden al usuario.
- No mostrar el número de versión. Una numeración puede mantenerse en Git, documentación y código interno, nunca en una barra de la web.
- Usar colores variados y sobrios para reconocer de inmediato acciones distintas. No sobrecargar toda la pantalla de cuadros o etiquetas. Las mejoras UI/UX deben ser **visibles desde la primera carga**: simetría, alineaciones, márgenes, proporciones, tipografía y contraste. No contar efectos de hover, transiciones ni cambios técnicos invisibles como mejoras visuales. Respetar la cuadrícula, los contenedores existentes y toda la lógica interna.

## C. Cuatro pestañas de navegación: una fila en PC y dos en móvil

La página comienza con **cuatro botones**, en el siguiente orden de lectura y de foco: **Inicio → Publicar lo que necesito → Mis publicaciones → Ver necesidades**.

- **PC (ancho superior a 680 px):** una sola fila horizontal con los cuatro botones, alineada en ambos extremos con los márgenes de la imagen de Inicio. Los dos elementos comparten ancho responsivo ajustado también a la altura disponible, para mostrar completa la imagen 1819:865 al 100 % de zoom.
- **Móvil (hasta 680 px):** dos filas, con **Inicio / Publicar lo que necesito** arriba y **Mis publicaciones / Ver necesidades** abajo.

- Mantener la barra arriba y el acceso visible mientras se navega.
- No duplicar pestañas ni ocultarlas; conservar sus cuatro colores e indicación de selección.
- Primera pestaña: **Inicio**. Solo muestra la **primera ilustración aprobada de dos pasos**: «1. Publica lo que necesitas» (licuadora) → «2. Lo ven y te contactan» (llamada o WhatsApp), en **assets/lonecesito-presentacion-dos-pasos.png** (1819 × 865). La versión anterior de tres pasos no está activa y la variante posterior con mayonesa está descartada. Mostrar completa, centrada y sin distorsión, sin añadir otros contenidos.
- Segunda pestaña: **Publicar lo que necesito**. Editor compacto.
- Tercera pestaña: **Mis publicaciones**. Solo registros propios y sus acciones de edición/eliminación.
- Cuarta pestaña: **Ver necesidades**. Buscador y lista de necesidades publicadas **reales**, sin imagen introductoria dentro de esta pestaña.
- No repetir debajo de un botón las otras tres opciones de navegación: el usuario las quitó expresamente para reducir altura.

## D. Entrada de datos: libertad de texto y fila compacta

**No existe formulario de muchos campos.** Son exactamente:
1. **Una caja grande de texto** donde se escribe TODO el requerimiento, incluida la ciudad, cantidad, presupuesto, fecha o condición cuando el autor lo considere relevante.
2. **Una sola caja de teléfono**, con el ejemplo **«Ej: 300 123 4567» dentro**, y un icono de teléfono a la **izquierda** de esa entrada. Nunca escribir la etiqueta visible «Número de WhatsApp».

No pedir un mínimo de caracteres: **un único carácter no vacío es válido**; el máximo ahora es 1.000 caracteres por publicación nueva o texto modificado. Las publicaciones anteriores de mayor longitud no se recortan: pueden conservar íntegra su descripción al editar únicamente teléfono o imagen; para cambiar su texto deben reducirlo a 1.000 caracteres o menos. Teléfono obligatorio y validado. Foto **no obligatoria**.

La fila directamente debajo del editor se presenta, en orden:

**Fila 1:** teléfono, foto, micrófono y enviar (más borrar/cancelar en edición). **Fila 2:** reproducir, pausar, reanudar y reiniciar mediante cuatro botones independientes.

- El icono verde **no lleva la palabra «Publicar»** en su superficie; accesiblemente sí se denomina «Publicar» o «Guardar cambios».
- Enter desde descripción o teléfono activa publicar/guardar por la misma ruta que el icono. **Shift+Enter inserta un salto de línea** en la descripción. Evitar publicar involuntariamente mientras se compone texto con un teclado IME o al repetir una tecla.
- El micrófono ofrece dictado de voz en español, sin bloquear el teclado. Usa reconocimiento del navegador solo si está disponible, con inicio y detención; si falta, un aviso puntual al tocarlo es suficiente.
- El botón de foto permite adjuntar una imagen. Comprimirla y mostrar una miniatura dentro del área de texto, con opción de ampliarla o quitarla.
- **Al editar**, aparecen también, en **la misma fila**, una **papelera roja** para eliminar y una **X** para cancelar. Al crear, ambas desaparecen. Eliminar pide confirmación, verifica que el registro pertenezca al autor y solo tras completar el borrado retorna a Mis publicaciones. Rechazar el borrado deja el texto en su lugar.
- El teléfono conserva semántica y accesibilidad aunque no tenga etiqueta de texto visible.

## E. La ficha ideal (centro de todo el producto)

La ficha presenta **el contenido íntegro que escribió la persona**, sin forzarlo a campos inventados ni crear un título diferente. Esta es la decisión de mayor prioridad visual.

**Texto**
- Un único cuerpo, completamente visible, **justificado**, desde su primera palabra.
- Sin título visual, sin mínimo de longitud, sin chips de ciudad, precio, fecha, tipo, cantidad ni condición.
- Registros del formato viejo: incorporar sus detalles en el cuerpo sin perderlos ni duplicarlos gratuitamente.
- El alto depende de texto, imagen y fila de acciones, nunca de una altura fija innecesaria.

**Fotografía**
- Opcional. Si está, se ve en la **columna derecha** de la ficha, respetando su proporción con ajuste automático sin recorte.
- Al tocar **cualquier parte** de la miniatura debe abrirse la fotografía **completa en primer plano**, con X, Escape y toque fuera para cerrar.
- Si no hay foto, **NO DEBE QUEDAR HUECO**: el párrafo ocupa todo el ancho. No dibujar ninguna caja, borde, icono, aviso, foto de relleno ni marcador.

**Controles en la ficha**
- Una sola fila, de iconos sin palabras visibles; acciones independientes, con **colores distintos** y al menos 44 px de alto en el móvil.
- **Primera fila pública:** llamar, WhatsApp y compartir PNG (3 iconos). **Primera fila del autor:** los anteriores más editar y eliminar (5 iconos). **Segunda fila en todas las fichas:** reproducir, pausar, reanudar y reiniciar voz (4 iconos).
- El dueño ve además dos más, **editar** (lápiz azul claro) y **eliminar** (papelera rojiza). Seis iconos en una sola fila, nunca en dos.
- Compartir es el **símbolo familiar de tres puntos conectados**; se rechazó el anterior icono de flecha hacia arriba.
- Ni la palabra «Contactar» ni etiquetas visibles para los botones. Mantener títulos, semántica, estado de foco y accesibilidad.
- El teléfono no aparece escrito sobre la ficha web, pero sí en el PNG. Los enlaces siguen llamando por teléfono o WhatsApp. El audio utiliza dos botones en la segunda fila, con reanudación por tramos compatible con Android. La dirección opcional y el GPS aparecen aparte del texto de la descripción y se pueden consultar desde la ficha.
- Los botones de editar y borrar están disponibles exclusivamente para el dueño, no para visitantes.

## F. Imagen PNG al compartir

- El icono de compartir genera **una imagen PNG de la ficha**, no solo una URL de la web.
- PNG **sin título añadido**, con toda la descripción justificada y **sin espacio reservado** cuando no hay foto; si hay foto, va a la derecha y completa.
- **El número real del autor sí aparece dentro del PNG**: destacarlo elegantemente en una banda de contacto «TELÉFONO · WHATSAPP» con el número legible y formateado, porque la imagen enviada es estática y sin ese dato el destinatario no podría llamarlo. La ficha web sigue sin imprimirlo.
- Usar las opciones nativas de compartir archivo cuando el navegador las soporte; como respaldo, descargar el PNG. Generarlo en el propio navegador.
- No utilizar teléfonos ficticios en imágenes exportadas ni imprimir mensajes sobre pruebas.

## G. Buscador con coincidencia por tramos

- En **Ver necesidades** debe localizar publicaciones reales por **fragmentos** escritos en cualquier punto de las palabras y por varios términos colocados en distinto orden.
- Tolerar diferencias de mayúsculas, minúsculas y tildes.
- Revisar toda información pública disponible de la ficha, no solamente el principio del texto: descripción, metadatos heredados, ciudad, categoría, cantidad, precio y también **número de teléfono completo o parcial**, sin requerir que se escriba el código de país.
- Permitir encontrar un mismo registro si la consulta mezcla fragmentos del texto y parte del teléfono; todos los fragmentos deben aparecer en algún campo público.
- Sin Gemini, buscadores remotos, costos de IA ni procesamiento de información privada.
- Vacío: mostrar estado breve, **nunca inyectar fichas de ejemplo**.

## H. No mostrar ejemplos ni pruebas

Esta decisión reemplaza por completo varias reglas viejas que pedían fichas de muestra.

- En **ninguna pestaña** deben aparecer necesidades de ejemplo ni números ficticios.
- Tampoco en la página inicial o al comenzar con base de datos vacía.
- Conservar únicamente registros auténticos; ignorar cualquier legado identificado como ejemplo sin eliminar datos reales.
- Los datos de muestra quedan reservados a **pruebas automatizadas internas**, no al público.
- No poner en la propia página avisos de demo, textos de «estos números son ficticios» ni número de versión.

## I. Restricciones y seguridad que no deben olvidarse

- El almacenamiento Firebase **todavía no está configurado** en el proyecto conocido. En modo local, las publicaciones del navegador no se comparten con otros visitantes; no prometer lo contrario ni ocultar esa limitación en respuestas técnicas.
- Al activar Firebase, la identidad de quien publicó y el control de creación/edición/eliminación deben verificarse en reglas de seguridad, **no únicamente en botones ocultos**.
- El número se publica como mecanismo de contacto en enlaces y PNG: solicitar consentimiento explícito y evitar usos secundarios no autorizados.
- La web sirve como tablón informativo, no como sustituto de WhatsApp, marcador de teléfono, sistema de pagos ni registro de contratos.
- Las imágenes comprimidas y datos guardados localmente pueden tener límites de tamaño; para escala real evaluar almacenamiento externo y privacidad antes de implementarlo, sin introducirlo espontáneamente.

## J. Preferencias sobre cómo debe trabajar cualquier IA

- **La fidelidad al producto importa más que inventar mejoras**. El usuario pide cambios concretos; no añadir por iniciativa propia campos, flujos, rótulos o avisos.
- No confundir «propuesta de imagen» con «editar la web». Para cambios visuales, mostrar una maqueta cuando lo solicite. El titular autorizó expresamente el 25-10-2026 publicar inmediatamente toda modificación posterior que solicite, sin pedir una confirmación nueva.
- Si el usuario cambia de opinión (p. ej., espacio vacío sin foto → ahora texto a ancho completo; tres pestañas → ahora cuatro), registrar **solo la decisión nueva como vigente**. No acumular ambas reglas en la misma sección.
- Respetar la selección final entre imágenes distintas; conservar el archivo aprobado, a ancho grande, no sustituirlo por uno nuevo sin orden.
- Crear **rama nueva + PR** hacia **codex/diseno-original**, la rama que alimenta GitHub Pages. No usar main por inercia. Si solicita cambiar la página directamente, fusionar y verificar el despliegue.
- Validar con pruebas y ser claro sobre lo que no se ejecutó (móvil real, emulador Firestore). Un despliegue correcto no confirma una prueba física.
- Mantener siempre actualizados los tres documentos de reglas, preferencias y continuidad para permitir que **cualquier otra IA** continúe el proyecto sin depender de recuerdos del chat.
- Al hacer únicamente **cambios documentales**, no alterar interfaz, assets ni versión interna de la aplicación.
- No reutilizar antiguas especificaciones o textos de README como si superaran esta guía. El historial de experimentos anteriores sigue disponible en commits y PR.

## K. Comprobación rápida antes de aprobar otra modificación

- [ ] ¿La página ofrece las cuatro pestañas en una fila en PC y en cuadrícula 2 × 2 en celular, en el orden establecido?
- [ ] ¿Inicio contiene exclusivamente la ilustración tercera aprobada, grande y sin recortes?
- [ ] ¿La lista muestra solo fichas reales y el buscador incluye teléfono y tramos?
- [ ] ¿La ficha contiene toda la descripción justificada, sin título ni chips?
- [ ] ¿Con foto va a la derecha y amplía completa; sin foto, texto usa todo el ancho?
- [ ] ¿En la ficha ajena hay 4 iconos y en la propia 6, incluido el altavoz, todos en una sola fila?
- [ ] ¿El PNG representa fielmente texto/foto y contiene teléfono real?
- [ ] ¿La descripción y el teléfono son obligatorios, la dirección es opcional, y el editor mantiene las dos filas compactas?
- [ ] ¿Enter envía, Shift+Enter hace salto, micro y foto siguen funcionando?
- [ ] ¿Solo el dueño puede editar/eliminar y el editor muestra papelera más X al editar?
- [ ] ¿Desaparecieron ejemplos, versiones visibles, avisos molestos y controles descartados?
- [ ] ¿Las reglas y la documentación coinciden con la UI real y con el alcance probado?

**Si algún punto falla, corregir o señalarlo expresamente antes de afirmar que se completó.**

---
**Fuentes vigentes:** [AGENTS.md](../AGENTS.md) · [Continuidad técnica](CONTINUIDAD-Y-APRENDIZAJES.md) · [Código GitHub](https://github.com/gruemp/lonecesito/tree/codex/diseno-original).

## Casos de uso responsivos y voz (aprobación 25-10-2026)
- Inicio añade debajo de la portada vigente dos imágenes SVG, una para PC y otra para móvil, mostrando pares «quien necesita → quien puede ayudar»: repartidores, técnicos, profesores, cuidadores e independientes, con necesidades de Medellín, Bogotá, Cali, Barranquilla y Cartagena.
- Mantener navegación de cuatro pestañas, sin agregar botón publicar inferior en móvil.
- La segunda fila de controles del editor incluye dos botones de lectura, caja de dirección opcional y botón GPS; las fichas mantienen dos botones de lectura y un pin que muestra dirección o GPS guardados.

## Actualización aprobada — 2.2.23
- Sustituye la anterior fila de cuatro controles de voz por tres iconos: un botón que cambia de reproducir a pausar y reanudar, un botón de reiniciar y un pin GPS. Mis publicaciones, Ver necesidades y editor respetan el mismo criterio.
- En el editor el pin obtiene GPS únicamente con confirmación expresa de publicación pública y permiso del navegador. **Desde 2.2.25, no se detiene automáticamente ni a los 30 segundos ni al alcanzar ±10 m.** Continúa actualizando en el mismo botón la mejor precisión estimada ±metros hasta que el usuario pulsa **nuevamente el mismo pin** para detener. No añade botón nuevo. La etiqueta informativa muestra la dirección aproximada deducida de la ubicación, sin inventar calles; la caja editable ubicada inmediatamente a la izquierda del pin permite añadir una dirección propia opcional. En las fichas el pin consulta únicamente la ubicación/dirección ya guardadas, nunca la posición del lector.
- La ubicación exacta es pública si se adjunta a la publicación. La traducción geográfica solo muestra datos verificablemente devueltos: país, departamento, ciudad, dirección y barrio o localidad si están disponibles. BigDataCloud recibe las coordenadas actuales e IP para ayudar a resolver ciudad y localidad. PNG muestra los mismos datos en orden descendente y conserva teléfono.

## Aprobación actual 2.2.25 — GPS continuo y dirección opcional
- La segunda fila del editor ordena [reproducir/pausar/reanudar] [reiniciar] [caja de dirección] [pin GPS]. La caja imita el teléfono: icono de ubicación a la izquierda, ejemplo interno, sin rótulo visible y ancho flexible. No se admite una parada GPS automática por tiempo ni por objetivo de precisión; el segundo toque lo detiene y guarda la mejor muestra. Si se abandona el editor, cancelar por privacidad.
- La dirección escrita por el autor es **opcional** (máx. 180 caracteres) y puede usarse sin GPS. Es pública, aparece al consultar la ficha y se incluye en el PNG. La etiqueta de GPS indica además la «Dirección aproximada del GPS», compuesta solo con las partes que devuelve el proveedor; puede no tener calle ni número. Mantener latitud, longitud, precisión, ciudad, departamento y país disponibles. No reemplazar la dirección que escribió el autor por la de un servicio externo.

## Mejora aprobada 2.2.26 — detalle GPS, Google Maps y distancia
- La ventana informativa desplegada mediante el pin **siempre muestra las etiquetas País, Departamento, Ciudad y Barrio o localidad**, con su contenido solo si fue devuelto por el proveedor. Si falta, escribir «No identificado». Mantener las demás partes de dirección, las coordenadas y la precisión, así como la dirección opcional escrita por el autor. No usar Santa Marta como valor predeterminado.
- El cuadro informativo y el editor pueden abrir la ubicación en **Google Maps**. Para GPS usar latitud y longitud; para dirección sin GPS buscar el texto introducido. En el panel de una ficha, ofrecer **Ver en Google Maps**, **Cómo llegar** y, exclusivamente con GPS, **Distancia desde mí**.
- La distancia interior se calcula **aproximadamente en línea recta** al solicitar el visitante su posición con un toque y permiso explícito; no es una ruta por calles. Para la distancia por carretera se pulsa «Cómo llegar» y Google Maps presenta sus rutas. No recordar, publicar ni transmitir las coordenadas del visitante a LoNecesito ni al servicio de geocodificación.

## Ajuste aprobado 2.2.27 — calle y número, sin barrio; Desde mí
- Dentro de la caja de ubicación se muestran País, Departamento, Ciudad, Dirección aproximada en formato calle/número solo si se puede identificar, dirección opcional escrita, latitud/longitud y precisión. **Nunca mostrar el rótulo «Barrio o localidad»**, incluso para registros viejos.
- Renombrar «Cómo llegar» a **«Desde mí»** manteniendo el enlace de rutas a Google Maps. «Distancia desde mí» continúa como herramienta diferente de distancia en línea recta, bajo permiso explícito de la persona que consulta.
- Una dirección postal aproximada es una calle reconocida y número cuando esté disponible, por ejemplo «Calle 10A #20A-06». Para capturas GPS nuevas, consulta puntual de BigDataCloud para país/departamento/ciudad y Nominatim de OSM para calle/número al pulsar por segunda vez el botón GPS. Al no conseguir calle, mostrar explícitamente que no se identificó; **no transformar localidad+ciudad+país en dirección de calle** ni prometer dirección exacta. Mantener caja manual opcional. Advertir autorización para compartir coordenadas con ambos servicios y dar atribución a OpenStreetMap.

## 2.2.28 — Municipio y direcciones: adaptación de Natura
- Combinar los datos de OpenStreetMap y BigDataCloud. Conservar país, departamento, municipio y ciudad identificados, incluso si una API falla; mostrar lo faltante honestamente. La dirección aproximada es exclusivamente una calle/número identificados, no una cadena de regiones.
- Resolver municipio mediante city, town, village, municipality, county del GPS como hace Natura; fallback a locality/city de BigDataCloud. Conservar dirección escrita opcional por el autor. Mostrar el municipio en PNG y la etiqueta cuando exista.
- No usar el endpoint de visitantes de Natura, IP aproximada ni la ubicación del lector sin su permiso. **Apps Script autorizado por la solicitud posterior:** adaptar el mecanismo Google de Natura en un servicio propio de LoNecesito. No usar el endpoint de visitas de Natura.


## 2.2.29 — Recuperar direcciones y completar apartamento sin Apps Script
- País, departamento, municipio y ciudad se muestran según llegan de OSM/BigDataCloud; si falta municipio, indicarlo sin esconder la etiqueta. Los campos vacíos de un proveedor no bloquean los del otro.
- En la edición de una publicación con GPS, **Actualizar dirección GPS** recupera información usando su punto guardado, tras consentimiento, sin tomar la ubicación actual. Guardar conserva los datos recuperados; si el servicio falla, no borrar los conocidos para ese mismo punto. No ejecutar consultas automáticamente al abrir fichas.
- Escribir apartamento, piso o torre en la caja de dirección opcional existente; no deducirlos del GPS ni reemplazarlos con la dirección del mapa. Mantenerlos en ficha y PNG.
- Mostrar un estado breve durante la consulta, esperar antes de guardar e impedir envíos duplicados o un guardado tardío después de salir del editor. Sin Apps Script ni cambios al cálculo local de distancias.

## 2.2.30 — Panel GPS legible en móvil
- El texto de ubicación ocupa su propia fila con ancho flexible completo, reservando únicamente el botón de quitar a la derecha. Los botones Actualizar dirección GPS y Ver en Google Maps se agrupan debajo, con salto de fila según espacio, sin comprimir el texto en una columna estrecha.
- Estado y atribución ocupan filas completas. Mantener todos los datos y acciones existentes; sin cambios a geocodificación, permisos, apartamento, distancias o PNG. Comprobar el panel desplegado, no solo el editor vacío.

## 2.2.31 — Intento adicional de recuperar numeración
- Nominatim consulta layer=address y zoom=18 para priorizar direcciones. Si reconoce calle sin número, el autor puede autorizar en la misma captura/actualización una única consulta condicional a Photon (komoot), que también utiliza OpenStreetMap. No requiere claves ni Apps Script y no garantiza más cobertura ni el portal exacto.
- Aceptar únicamente número registrado con calle coincidente (normalizar solo espacios, tildes y mayúsculas), coordenadas válidas y punto a ≤25 m. Requerir precisión GPS estimada ≤25 m. Elegir el candidato más cercano entre un máximo de cinco; no cambiar de calle ni inventar números. Si falla o no hay candidato, mantener la calle.
- Conservar número conocido de esa misma coordenada/calle si la actualización solo devuelve calle, sin consultar respaldo innecesario. No reemplazar dirección manual ni apartamento. El resultado sigue siendo aproximado y puede corresponder a un portal cercano.
- El consentimiento identifica Nominatim, BigDataCloud y el respaldo condicional Photon (komoot), así como coordenadas/IP y aproximación. No consultar al abrir fichas, en cada muestra GPS ni al calcular la distancia del visitante. Mantener cancelación, límite total de consulta y moderación de uso.

## 2.2.32 — Preferencia actual: implementar Apps Script como Natura
- El titular autorizó implementar Apps Script si es necesario; esta indicación sustituye la anterior de no usarlo. La dirección de Google se obtiene mediante el mismo servicio Maps y formatted_address de Natura, sin integrar su analítica.
- Proyecto independiente con caché temporal, privacidad y consentimiento de envío a Google. Configurar una URL real y comprobada; la URL vacía significa que la función no está activa y siguen los respaldos previos. El servicio independiente ya fue desplegado y verificado; conservar su URL e IDs reales en futuras actualizaciones.
- Conservar toda dirección manual/apartamento. Dar prioridad a Google cuando haya un resultado útil, atribuirlo a Google Maps en panel/ficha/PNG y conservar ubicación conocida si falla. La geocodificación sigue siendo aproximada.
