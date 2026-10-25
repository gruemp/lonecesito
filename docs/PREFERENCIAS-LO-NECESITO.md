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

No pedir un mínimo de caracteres: **un único carácter no vacío es válido**; permanece el límite técnico máximo de 4.000 caracteres de la implementación vigente. Teléfono obligatorio y validado. Foto **no obligatoria**.

La fila directamente debajo del editor se presenta, en orden:

**[icono teléfono + caja Ej: 300 123 4567] [foto] [micrófono] [escuchar / pausar / reanudar] [icono verde de avión de papel]**

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
- Todos ven cuatro: **llamar** (azul, abre marcador), **WhatsApp** (verde, abre conversación por API de WhatsApp), **compartir** (morado) y **escuchar publicación** (ocre, altavoz).
- El dueño ve además dos más, **editar** (lápiz azul claro) y **eliminar** (papelera rojiza). Seis iconos en una sola fila, nunca en dos.
- Compartir es el **símbolo familiar de tres puntos conectados**; se rechazó el anterior icono de flecha hacia arriba.
- Ni la palabra «Contactar» ni etiquetas visibles para los botones. Mantener títulos, semántica, estado de foco y accesibilidad.
- El número telefónico **no se escribe sobre la ficha**. El icono azul utiliza el marcador nativo por enlace telefónico y el verde dirige a **api.whatsapp.com/send** con mensaje aprobado: «Hola, vi tu publicación en LoNecesito: *«[resumen]»*. ¿Aún lo necesitas? Puedo ayudarte.». Solo el resumen entre asteriscos se presenta en negrita en WhatsApp. El altavoz lee el contenido completo en español usando la voz del navegador (preferir es-CO), permite pausar al pulsar de nuevo y reanudar en otro toque sin volver al inicio del texto. Como algunos navegadores Android silencian SpeechSynthesis tras pausa nativa, dividir en tramos cortos (hasta 155 caracteres), guardar progreso de palabra cuando el navegador lo reporte, cancelar el audio para pausar y crear una locución nueva al reanudar. Si no hay eventos de palabra se repite como máximo el tramo corto actual; no usar pause()/resume() nativos. El ícono alterna entre altavoz (listo), pausa (reproduciendo) y reanudar (pausado). Está en todas las fichas, propias y ajenas, y en el formulario para oír el texto escrito antes de publicar. No hacer que ambos iconos abran WhatsApp.
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
- [ ] ¿En el editor solo hay dos campos y una fila de controles con ejemplo telefónico interior?
- [ ] ¿Enter envía, Shift+Enter hace salto, micro y foto siguen funcionando?
- [ ] ¿Solo el dueño puede editar/eliminar y el editor muestra papelera más X al editar?
- [ ] ¿Desaparecieron ejemplos, versiones visibles, avisos molestos y controles descartados?
- [ ] ¿Las reglas y la documentación coinciden con la UI real y con el alcance probado?

**Si algún punto falla, corregir o señalarlo expresamente antes de afirmar que se completó.**

---
**Fuentes vigentes:** [AGENTS.md](../AGENTS.md) · [Continuidad técnica](CONTINUIDAD-Y-APRENDIZAJES.md) · [Código GitHub](https://github.com/gruemp/lonecesito/tree/codex/diseno-original).
