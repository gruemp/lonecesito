# LoNecesito — entrega, aprendizajes y continuidad

**Fecha del cierre de interfaz:** 24 de octubre de 2026  
**Versión:** 2.2.7  
**Web:** https://gruemp.github.io/lonecesito/  
**Repositorio:** https://github.com/gruemp/lonecesito  
**Rama que alimenta GitHub Pages:** \`codex/diseno-original\` (la rama \`main\` no es la interfaz publicada).

Este documento es el **punto de entrega** para continuar el proyecto, con otra IA o con una persona. Es una fotografía de decisiones y del estado técnico, no una promesa de que el servicio multiusuario está en producción. Leer primero [AGENTS.md](../AGENTS.md) y [PREFERENCIAS-LO-NECESITO.md](PREFERENCIAS-LO-NECESITO.md): allí están los criterios vinculantes del usuario.

## 1. Qué quedó cerrado visual y funcionalmente

- Sitio minimalista, legible en celulares y con el menor alto posible, sin ocultar texto ni quitar anchura útil.
- Encabezado siempre visible con **solo tres accesos**: **Publicar lo que necesito** (verde), **Ver necesidades** (azul) y **Mis publicaciones** (ámbar). Sin botones repetidos en portada.
- La ruta inicial abre el listado. Se eliminaron el titular grande anterior de la portada y el texto redundante del pie.
- Publicación mediante **dos campos de texto**: una descripción libre de la necesidad y el número de WhatsApp. Ningún formulario separado de ciudad, categoría, cantidad, precio o fecha.
- En la misma caja se encuentran el **micrófono** para dictar en español (API de reconocimiento del navegador cuando esté disponible) y el botón para adjuntar **una imagen opcional**, comprimida antes de guardarse. El teclado siempre funciona.
- Fichas compactas: texto único, título derivado de la primera línea y detalles redactados dentro del mismo cuerpo. Los campos históricos se incorporan al texto, no en chips o recuadros.
- Cada ficha reserva un bloque a la **derecha** para la foto. Si no existe, queda en blanco, sin ningún marcador, borde ni recuadro.
- **Nuevo en 2.2.6:** al pulsar **cualquier parte de una fotografía real** de la ficha, se abre un visor en primer plano con el archivo completo, ajustado sin recortes (\`object-fit: contain\`). Se puede cerrar con la **X**, tocando fuera de la imagen o pulsando **Escape**. También se puede ampliar la miniatura del editor. Si no hay imagen, no se muestra marcador ni área interactiva.
- Dos botones con **solo iconos** en cada ficha: llamada por enlace \`tel:\` (azul) y conversación de WhatsApp por \`https://api.whatsapp.com/send\` (verde). El teléfono no se escribe en la ficha, pero puede leerse de la URL de contacto.
- Solo el autor puede **Editar** o **Eliminar**. No existen aceptaciones, interesados, marcados como resueltos ni intermediación.
- Las muestras de publicación utilizan el **mismo modelo y renderizado** que las reales y conservan la zona de imagen. Una muestra sin fotografía deja el espacio vacío; la llamada está deshabilitada para no marcar un teléfono ficticio y WhatsApp abre sin destinatario. No mostrar avisos repetitivos de prueba.
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
- Prueba manual sugerida del visor: cargar una publicación con foto y comprobar clic en miniatura derecha, visualización íntegra, X, Escape y clic exterior; repetir al editar, y confirmar que el marcador de las fichas sin foto no abre nada.

Las verificaciones de un PR anterior **no sustituyen** ejecutar las pruebas de una nueva versión. Cuando una prueba no se ejecutó, anotarlo expresamente.

## 6. Aprendizajes del diseño con el usuario

- «Compacto» significa **reducir espacio vertical**, pero **no** estrechar la lectura horizontal, truncar texto ni ocultar información.
- Las opciones separadas y los colores diferenciados hacen que cada acción se comprenda de un vistazo, especialmente en un celular.
- Cuando el formulario cambia, los ejemplos deben cambiar **a la vez** y verse como fichas reales; no dejar campos obsoletos como ciudad o presupuesto en bloques aparte.
- Dos campos bastan para comunicar una necesidad. El teléfono es un mecanismo de contacto, no motivo para crear una negociación dentro del sitio.
- No llenar la pantalla de explicaciones obvias: la interfaz lleva **solo** la versión discreta arriba; documentación extensa queda en GitHub.
- La foto debe estar a la **derecha de la ficha**, no debajo, y su ampliación debe mostrarse completa, sin recortes. Si falta, reservar el espacio derecho vacío, sin marcador ni recuadro.
- La página debe ofrecer **hablar o escribir**, según lo que permita el navegador, sin integrar IA externa innecesaria.
- El usuario valora mantener sus decisiones **portables entre distintas IA**. No depender exclusivamente de memoria conversacional: conservar las reglas y decisiones en Markdown legible en el repositorio.

## 7. Estado de entrega y alcance del «cierre»

**Se actualiza la iteración de diseño y funcionamiento de la interfaz a la versión 2.2.7**, con visor de imágenes y exportación PNG de las fichas. No significa que Firebase, las reglas de seguridad ni las pruebas móviles reales estén completadas. Esos son pasos de infraestructura y validación independientes para convertir el prototipo en un servicio compartido.

**Para dar continuidad desde otra IA:** proporcionar este enlace:
\`https://github.com/gruemp/lonecesito/blob/codex/diseno-original/docs/CONTINUIDAD-Y-APRENDIZAJES.md\`
y los de \`AGENTS.md\` y \`docs/PREFERENCIAS-LO-NECESITO.md\`. Una IA sin acceso a GitHub necesitará recibir el contenido de los archivos.

## Actualización 2.2.7 — compartir ficha PNG

La ficha mantiene título y texto descriptivo justificado, imagen adaptada automáticamente sin deformar, y una columna derecha reservada incluso cuando no hay imagen. Sin foto, esa columna queda **vacía, sin marco, fondo, icono ni aviso**. Al lado de los iconos de llamada y WhatsApp, el icono de compartir genera un PNG local con el contenido de la ficha. Usa Web Share API para enviar la imagen si el navegador lo admite; si no, descarga el PNG. El PNG real incluye el teléfono para que quien reciba una imagen estática pueda contactar, mientras que la ficha web no lo imprime. Los ejemplos nunca incluyen un número ficticio en los PNG.

Esta mejora no configura Firebase, autenticación ni Firestore, que permanecen pendientes de trabajo independiente. También hay que verificar la función de compartir archivos en un teléfono real.
