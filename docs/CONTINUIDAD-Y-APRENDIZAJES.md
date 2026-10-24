# LoNecesito — entrega, aprendizajes y continuidad

**Fecha del cierre de interfaz:** 24 de octubre de 2026  
**Versión técnica interna:** 2.2.13 (no visible en la interfaz)  
**Web:** https://gruemp.github.io/lonecesito/  
**Repositorio:** https://github.com/gruemp/lonecesito  
**Rama que alimenta GitHub Pages:** \`codex/diseno-original\` (la rama \`main\` no es la interfaz publicada).

Este documento es el **punto de entrega** para continuar el proyecto, con otra IA o con una persona. Es una fotografía de decisiones y del estado técnico, no una promesa de que el servicio multiusuario está en producción. Leer primero [AGENTS.md](../AGENTS.md) y [PREFERENCIAS-LO-NECESITO.md](PREFERENCIAS-LO-NECESITO.md): allí están los criterios vinculantes del usuario.

## 1. Qué quedó cerrado visual y funcionalmente

- Sitio minimalista, legible en celulares y con el menor alto posible, sin ocultar texto ni quitar anchura útil.
- Encabezado con **cuatro accesos en dos filas** en PC y móvil: Inicio, Mis publicaciones, Ver necesidades y Publicar lo que necesito. Sin botones repetidos en portada.
- La ruta inicial abre el listado. Se eliminaron el titular grande anterior de la portada y el texto redundante del pie.
- Publicación mediante **dos campos de texto**: una descripción libre de la necesidad y el número de WhatsApp. Ningún formulario separado de ciudad, categoría, cantidad, precio o fecha.
- En la misma caja se encuentran el **micrófono** para dictar en español (API de reconocimiento del navegador cuando esté disponible) y el botón para adjuntar **una imagen opcional**, comprimida antes de guardarse. El teclado siempre funciona.
- Fichas compactas: texto único y **sin título visual** y detalles redactados dentro del mismo cuerpo. Los campos históricos se incorporan al texto, no en chips o recuadros.
- Cada ficha reserva un bloque a la **derecha** para la foto. Si no existe, la descripción ocupa todo el ancho y no se crea espacio lateral.
- **Nuevo en 2.2.6:** al pulsar **cualquier parte de una fotografía real** de la ficha, se abre un visor en primer plano con el archivo completo, ajustado sin recortes (\`object-fit: contain\`). Se puede cerrar con la **X**, tocando fuera de la imagen o pulsando **Escape**. También se puede ampliar la miniatura del editor. Si no hay imagen, no se muestra marcador ni área interactiva.
- Dos botones con **solo iconos** en cada ficha: llamada por enlace \`tel:\` (azul) y conversación de WhatsApp por \`https://api.whatsapp.com/send\` (verde). El teléfono no se escribe en la ficha, pero puede leerse de la URL de contacto.
- Solo el autor puede **Editar** o **Eliminar**. No existen aceptaciones, interesados, marcados como resueltos ni intermediación.
- Las muestras de publicación utilizan el **mismo modelo y renderizado** que las reales y conservan la zona de imagen. Una muestra sin fotografía ocupa el ancho completo con su descripción; la llamada está deshabilitada para no marcar un teléfono ficticio y WhatsApp abre sin destinatario. No mostrar avisos repetitivos de prueba.
- Versionado visible discreto «Versión X.Y.Z» arriba de todas las pantallas, actualizado en cada entrega.
- Buscador local sencillo, sin Gemini ni reconocimiento semántico por IA.

## 2. Archivos activos y responsabilidad de cada uno

| Archivo | Responsabilidad |
| --- | --- |
| \`index.html\` | Pantallas, navegación, dos campos, micrófono y adjunto, modal para foto, ventana de acceso y número de versión visible |
| \`simple.css\` | Diseño móvil, contraste, economía vertical, foto derecha, dos iconos y visor superpuesto |
| \`simple.js\` | Publicaciones, búsqueda, DOM seguro, teléfonos, dictado, compresión, visor, almacenamiento demo/Firebase |
| \`simple-model.js\` | Versión de publicación, validación del teléfono, texto, enlaces de WhatsApp y ejemplos |
| \`firebase-config.js\` | Configuración pública del proyecto Firebase; **actualmente vacía** |
| \`firestore.rules\` | Acceso a datos: lectura pública y edición/eliminación solo del dueño; reglas de foto opcional |
| \`tests/simple-publicaciones.test.mjs\` | Pruebas del cliente, ejemplos, controles y contratos visuales |
| \`tests/firestore.rules.test.mjs\` | Pruebas diseñadas para el emulador de seguridad de Firestore |
| \`AGENTS.md\` | Reglas de trabajo para cualquier IA |
| \`docs/PREFERENCIAS-LO-NECESITO.md\` | Decisiones de interfaz y comportamiento expresadas por el usuario |
| \`README.md\` | Guía inicial y registro histórico de versiones |

El repositorio conserva algunos archivos históricos de la aplicación original. **No reactivarlos** sin una instrucción específica.

## 3. Lo que NO está listo todavía

1. **Backend compartido.** \`firebase-config.js\` contiene claves vacías. Por eso, salvo nueva configuración verificada, las necesidades que una persona publica solo se almacenan en su **navegador local** mediante \`localStorage\`, y **no** aparecen en los navegadores de otras personas. No decir que LoNecesito ya opera como tablón público multiusuario.
2. **Autenticación real y reglas desplegadas.** Firebase Authentication (correo/Google), Cloud Firestore y \`firestore.rules\` necesitan configuración y despliegue en un proyecto autorizado. GitHub Pages **no** despliega reglas Firestore.
3. **Pruebas de privacidad y producción.** Verificar lectura pública, edición propia, protección ante edición ajena, cambios de imagen, límites del tamaño de las fotos, exposición del teléfono en enlaces y configuración de proveedores OAuth.
4. **Pruebas móviles reales.** Ejecutar en Android/Edge/Chrome y, si es posible, Safari/iPhone: dictado, permisos, apertura de WhatsApp/marcador, selección y compresión de fotografías, ampliación en pantalla completa, orientación vertical/horizontal, botón de cierre, toque fuera, gesto atrás y lectores de pantalla. El reconocimiento de voz integrado puede no estar soportado o necesitar un servicio remoto del fabricante; no prometer disponibilidad universal.
5. **Almacenamiento de imágenes.** Actualmente las fotos comprimidas se guardan como pequeñas cadenas base64 junto con la publicación. Esta solución es suficiente para un prototipo; reconsiderar Firebase Storage, costos y límites si crecen el tráfico y el volumen de imágenes.

## 4. Cómo continuar sin perder decisiones

1. Abrir la rama **\`codex/diseno-original\`**, leer \`AGENTS.md\`, la guía de preferencias y este documento. La rama predeterminada \`main\` no representa necesariamente la web activa.
2. Verificar el estado del código y el historial de los últimos PR antes de tocar archivos.
3. **Priorizar una sola solicitud** del usuario y no reintroducir funciones descartadas. Si cambia un requisito, actualizar \`AGENTS.md\` y la guía detallada al mismo tiempo.
4. Crear una **rama nueva** desde \`codex/diseno-original\`. Hacer cambios pequeños, ejecutar comprobaciones, revisar los **ejemplos** junto con las fichas reales, abrir PR a \`codex/diseno-original\` y fusionar cuando esté autorizada la publicación.
5. Incrementar versión en \`simple-model.js\` y \`index.html\`; actualizar parámetros de caché CSS y JS para que los celulares muestren cambios.
6. Verificar el resultado del despliegue de GitHub Pages. Un build correcto **no demuestra** que el micrófono, la foto o el diseño funcionan en un dispositivo físico.
7. Registrar lo que se hizo, lo probado y lo pendiente. No introducir advertencias técnicas molestas en la propia interfaz pública.

## 5. Comprobaciones técnicas reproducibles

Con un entorno que tenga Node y acceso al repositorio:

- \`npm install\` — dependencias de pruebas.
- \`npm run check\` — sintaxis de módulos.
- \`npm test\` — pruebas del cliente y compatibilidad.
- \`npm run test:rules\` — **requiere** Firebase CLI, Java y emulador Firestore; confirma permisos reales en el entorno de pruebas.
- Prueba manual sugerida del visor: cargar una publicación con foto y comprobar clic en miniatura derecha, visualización íntegra, X, Escape y clic exterior; repetir al editar, y confirmar que no existe zona de foto cuando falta.

Las verificaciones de un PR anterior **no sustituyen** ejecutar las pruebas de una nueva versión. Cuando una prueba no se ejecutó, anotarlo expresamente.

## 6. Aprendizajes del diseño con el usuario

- «Compacto» significa **reducir espacio vertical**, pero **no** estrechar la lectura horizontal, truncar texto ni ocultar información.
- Las opciones separadas y los colores diferenciados hacen que cada acción se comprenda de un vistazo, especialmente en un celular.
- Cuando el formulario cambia, los ejemplos deben cambiar **a la vez** y verse como fichas reales; no dejar campos obsoletos como ciudad o presupuesto en bloques aparte.
- Dos campos bastan para comunicar una necesidad. El teléfono es un mecanismo de contacto, no motivo para crear una negociación dentro del sitio.
- No llenar la pantalla de explicaciones obvias: la interfaz lleva **solo** la versión discreta arriba; documentación extensa queda en GitHub.
- La foto debe estar a la **derecha de la ficha**, no debajo, y su ampliación debe mostrarse completa, sin recortes. Si falta, el texto ocupa todo el ancho y no existe zona de foto.
- La página debe ofrecer **hablar o escribir**, según lo que permita el navegador, sin integrar IA externa innecesaria.
- El usuario valora mantener sus decisiones **portables entre distintas IA**. No depender exclusivamente de memoria conversacional: conservar las reglas y decisiones en Markdown legible en el repositorio.

## 7. Estado de entrega y alcance del «cierre»

**Se actualiza la iteración de diseño y funcionamiento de la interfaz a la versión 2.2.8**, con visor de imágenes y exportación PNG de las fichas. No significa que Firebase, las reglas de seguridad ni las pruebas móviles reales estén completadas. Esos son pasos de infraestructura y validación independientes para convertir el prototipo en un servicio compartido.

**Para dar continuidad desde otra IA:** proporcionar este enlace:
\`https://github.com/gruemp/lonecesito/blob/codex/diseno-original/docs/CONTINUIDAD-Y-APRENDIZAJES.md\`
y los de \`AGENTS.md\` y \`docs/PREFERENCIAS-LO-NECESITO.md\`. Una IA sin acceso a GitHub necesitará recibir el contenido de los archivos.

## Actualización 2.2.7 — compartir ficha PNG

La ficha mantiene el texto descriptivo justificado, sin título visible, imagen adaptada automáticamente sin deformar, y columna derecha solamente cuando hay imagen. Sin foto, **la descripción ocupa todo el ancho**. Al lado de los iconos de llamada y WhatsApp, el icono de compartir genera un PNG local con el contenido de la ficha. Usa Web Share API para enviar la imagen si el navegador lo admite; si no, descarga el PNG. El PNG real incluye el teléfono para que quien reciba una imagen estática pueda contactar, mientras que la ficha web no lo imprime. Los ejemplos nunca incluyen un número ficticio en los PNG.

Esta mejora no configura Firebase, autenticación ni Firestore, que permanecen pendientes de trabajo independiente. También hay que verificar la función de compartir archivos en un teléfono real.

## Estado actualizado — versión 2.2.8

Esta edición reemplaza explícitamente el diseño anterior: las fichas **no muestran títulos**, su altura depende del contenido, no hay mínimo de caracteres para la necesidad más allá de requerir texto no vacío, y las imágenes siguen a la derecha **solamente cuando existen**. Si no hay foto, el texto justificado ocupa todo el ancho. Se retiraron los encabezados y descripciones superiores de las tres secciones, manteniendo los botones de navegación. El PNG compartido respeta las mismas reglas.

Firebase sigue sin configuración operativa en este repositorio; las publicaciones locales no se comparten entre visitantes. Pendientes prueba visual móvil y ejecución de las reglas en el emulador de Firestore.

## Actualización 2.2.9 — fila única de acciones

En la ficha del propio autor hay **cinco iconos en una sola fila**: teléfono, WhatsApp, compartir mediante símbolo de tres puntos conectados, editar (lápiz) y eliminar (papelera). En las fichas que ven otras personas solo aparecen los tres primeros. Los controles de editar y eliminar no tienen palabras visibles y mantienen nombres accesibles, permisos de propietario y confirmación de borrado. La barra conserva la altura compacta en celulares, con controles táctiles de al menos 44 píxeles. El diseño y los ejemplos deben seguir esta regla en cambios futuros.

El cierre de interfaz no implica backend completo: Firebase sigue sin configuración operativa; la publicación multiusuario y las pruebas de emulador y dispositivo real permanecen pendientes.

## Actualización 2.2.10 — fila de publicación y teclado

La caja de necesidad conserva un único texto libre. Inmediatamente debajo, y siempre en una sola fila, hay un campo telefónico con el icono de teléfono a su izquierda y el marcador `Ej: 300 123 4567` dentro; después aparecen el botón de imagen, el micrófono y el **botón verde solo con el icono de avión de papel**, sin texto. La etiqueta telefónica es accesible pero invisible. Para publicar basta tocar el icono o pulsar Enter desde el teléfono o el área de necesidad; Shift+Enter permite saltos de línea en la descripción. Si está editando, el envío se interpreta como guardar y existe un botón X para cancelar, también en la misma fila. La vista previa de imagen se aloja dentro del cuadro de necesidad y no reduce la anchura de la caja de teléfono.

Verificar específicamente los anchos estrechos de celulares, teclados de composición (IME), inserción de saltos de línea, envío nativo y prevención de duplicados. El servicio Firebase sigue pendiente: no dar por finalizado el backend.

## Actualización 2.2.11 — papelera en la edición

Al editar una necesidad propia, además de poder eliminarla desde su ficha, aparece un **icono de papelera rojo** en la misma fila de teléfono, fotografía, micrófono, enviar/guardar y X para cancelar. Solo se ve al editar; confirma antes de borrar y únicamente el dueño puede hacerlo. Cancelar la eliminación conserva la edición; terminarla correctamente retorna a «Mis publicaciones». La fila permanece compacta en móviles. Hay que revisar visualmente la anchura de la caja de teléfono en pantallas estrechas. Firebase sigue sin configurar.

## Actualización 2.2.12 — imagen de bienvenida aprobada

La pantalla inicial `#necesidades` muestra, debajo de la barra de tres botones y antes del buscador, el banner panorámico seleccionado por el usuario: `assets/lonecesito-presentacion.webp` (1440×810). Presenta tres personajes y explica visualmente las tres etapas **Publica → La ven → Te contactan** por llamada o WhatsApp. No representa ofertas ni intercambios internos. Se visualiza completo, ancho 100 %, con altura automática y sin recortes, exclusivamente en la primera pestaña. Los demás flujos de publicación y fichas no cambian. El archivo original generado está asociado a esta conversación como `lonecesito_publica_y_conecta.png`; se subió una copia WebP optimizada al repositorio para que GitHub Pages la sirva sin depender de ChatGPT.

Firebase sigue sin configurar; la existencia de esta imagen no implica que las publicaciones se compartan entre navegadores.

## Actualización 2.2.13 — nueva portada, cero ejemplos y búsqueda avanzada

La pantalla predeterminada es **Inicio**, con el banner **tercero** ya aprobado, en formato WebP alojado en el repositorio y a ancho completo sin recortes. No contiene fichas ni buscador. Las **cuatro pestañas** están ordenadas Inicio, Mis publicaciones, Ver necesidades y Publicar lo que necesito y forman un 2×2 tanto en móvil como en PC. Ningún título o número de versión aparece como barra de cabecera. El número técnico sigue dentro del código. No hay fichas ficticias ni generadores de ejemplos: Ver necesidades muestra únicamente registros reales públicos y Mis publicaciones, solo registros del autor. Los registros locales etiquetados `example:true` se ignoran sin borrar datos reales.

El buscador se ha separado en `simple-search.js` y compara por tramos (subcadenas), sin tildes ni sensibilidad a mayúsculas, múltiples palabras en cualquier lugar de los campos públicos, metadatos heredados y teléfono total/parcial. No rastrea el identificador privado del dueño ni depende de IA remota.

**Advertencia técnica constante:** Firebase no está configurado en `firebase-config.js`, así que en el modo actual los registros locales no son compartidos entre distintos visitantes. Verificar en navegador real la cuadrícula 2×2 de PC/móvil y la búsqueda. GitHub Pages no publica reglas de Firestore.
