# LoNecesito — preferencias, decisiones y protocolo para continuar el proyecto

**Propósito:** documento transportable y explícito para cualquier desarrollador o IA que reciba el repositorio. Refleja las decisiones indicadas durante las iteraciones de octubre de 2026. Leer junto a [AGENTS.md](../AGENTS.md).

## 1. Qué es LoNecesito

Es un tablón sencillo de necesidades de bienes y servicios. Una persona publica lo que está buscando; otra lo lee y, si puede venderle el producto o prestarle el servicio, se comunica **directamente por WhatsApp**. La página **no** media ni administra la negociación, la contratación o el resultado.

Flujos aprobados:
- Publicar una necesidad, indicando su descripción completa y WhatsApp.
- Ver/buscar publicaciones, llamar al autor con el icono del teléfono o escribirle usando el icono de WhatsApp.
- Consultar **Mis publicaciones** y editar o eliminar **únicamente las propias**.

Funciones descartadas, no reintroducir:
- «Aceptar necesidad», «Mostrar interés», «Aplicar», «Solicitudes de interés».
- «Personas interesadas», «Marcar como resuelta», «Reactivar» o estados de tramitación.
- Formularios de propuestas, notificaciones de aceptación, asignación de proveedores o perfiles de interesados.

## 2. Captura de datos — exactamente dos entradas

La pantalla Publicar debe tener:
1. **Una caja grande de texto**: «¿Qué necesitas?». Allí el autor redacta todo: nombre o tipo de producto/servicio, lugar, características, cantidad, presupuesto, condición, fecha, observaciones. **No se deben extraer esos datos a campos separados**.
2. **Una entrada para «Número de WhatsApp»**. El teléfono no aparece como texto en las fichas, pero estará expuesto en los enlaces públicos para llamadas y WhatsApp. El usuario debe conocerlo antes de publicar.

El guardado puede derivar datos internos imprescindibles (identificador, autor, fecha técnica de creación y un título calculado de la primera línea), pero **no debe solicitar más campos** al usuario. Mantener las reglas de validación y acceso, y la protección de datos personales.

## 3. Composición exacta de una ficha

- **Título**: primera frase/línea derivada de lo que el usuario escribió, visualmente diferenciado, sin volver a repetirla en el cuerpo.
- **Cuerpo único y completo**: todo el resto del texto del requerimiento. **No** crear recuadros separados, chips, filas, badges ni columnas para ciudad, ubicación, presupuesto, cantidad, condición, categoría o fecha. Si existen campos históricos, incorporarlos a este mismo cuerpo de texto, legibles y sin perder información.
- **Contacto**: la ficha muestra **solo dos botones con iconos, sin números escritos ni textos visibles**. Icono de teléfono: enlace `tel:+<numero_normalizado>`, abre la aplicación de marcado del celular. Icono de WhatsApp: enlace `https://api.whatsapp.com/send?phone=<numero_normalizado>&text=<mensaje_codificado>`, abre la conversación. Cada icono necesita `aria-label` y `title` explicativos para accesibilidad. Mantener ambos botones compactos, próximos y diferenciados por color.
- **Administración**: botones «Editar» y «Eliminar» únicamente cuando el visitante es autor. No mostrar acciones de aceptación, resolución, aplicación o seguimiento.
- **Ejemplos**: mismos datos de entrada, transformación, render y CSS que una ficha real. Deben verse idénticos y mostrar los dos iconos. El de llamada se ve **deshabilitado**, porque no debe marcar un número ficticio ni de terceros; el de WhatsApp abre la aplicación sin destinatario preseleccionado. No contener campos antiguos.
- Evitar ruido visual, textos repetidos y carteles que expliquen que los ejemplos son pruebas.

Nota de seguridad: el esquema `tel:` solicita al sistema operativo abrir la aplicación de marcado; **no garantiza ni ejecuta una llamada automática**. El formato `api.whatsapp.com/send` es un enlace de apertura de WhatsApp, **no** la Cloud API de mensajería empresarial. Que el número no aparezca escrito **no significa que sea secreto**: un visitante puede inspeccionar la URL `tel:` o el enlace de WhatsApp. El formulario debe informar esa exposición. Los ejemplos no deben usar números de terceros.

## 4. Preferencias de presentación

**Máxima prioridad: que se comprenda de un vistazo en la pantalla de un celular.**

- Ahorrar **espacio vertical**, no ancho útil: reducir márgenes, huecos, filas innecesarias, paddings y bloques repetitivos; nunca hacer párrafos demasiado estrechos para ganar altura.
- Mostrar toda la información: sin truncamiento arbitrario, «ver más» obligatorio ni pérdida de campos existentes.
- Diferenciar claramente unas opciones de otras: cada ficha y cada acción con fondo, borde, separación y/o color propio. Mantener una identidad verde, con variaciones discretas de azul, ámbar y otros colores cuando mejoren la distinción. No saturar.
- Todos los **párrafos y textos explicativos/descriptivos deben verse justificados**; ajustar interlineado, guiones y el último renglón para evitar espacios antiestéticos.
- **Títulos preferiblemente centrados**, salvo cuando la lectura de fichas o listados resulte más clara a la izquierda. Jerarquía uniforme, separación equilibrada y tamaño moderado.
- Botones/etiquetas/números: no justificar artificialmente textos cortos; centrar o alinear según legibilidad y zonas táctiles cómodas.
- Acciones vinculadas a un mismo elemento: visualmente independientes pero próximas, p. ej. icono de llamada / icono de WhatsApp y Editar / Eliminar.
- Evitar banners, avisos, mensajes y explicaciones redundantes que distraigan. Solo errores o confirmaciones funcionales pertinentes y discretos.
- **Navegación persistente**: exactamente tres botones visibles en la barra superior, en este orden: «Publicar lo que necesito» (verde), «Ver necesidades» (azul) y «Mis publicaciones» (ámbar). Mantener la cabecera fija al desplazarse y permitir navegar siempre entre las tres pantallas.
- **Sin enlaces duplicados**: la portada contiene solamente el texto principal y su descripción, **sin tarjetas ni botones repetidos de publicar, ver necesidades o mis publicaciones**. Tampoco repetir «Crear publicación» dentro de «Mis publicaciones», porque publicar ya está disponible arriba.
- Diseñar la barra para celulares estrechos sin cortes horizontales: botones compactos, texto legible que puede ocupar dos líneas, altura ajustada, foco y selección visibles.
- **No añadir Gemini ni búsqueda con inteligencia artificial**. Esa idea se consideró y se descartó; mantener la búsqueda de texto existente salvo nueva autorización expresa.
- Mantener buen contraste, lectura accesible, adaptación a distintos anchos y sin desbordamiento horizontal.

## 5. Versión de publicación visible

Al inicio de **todas** las pantallas hay una barra discreta que muestra **solo «Versión X.Y.Z»**, sin fecha, enlaces, avisos ni notas adicionales. Aumentar en **cada modificación que se publique**, incluso si es solo visual o textual. Sincronizar:
- \`APP_VERSION\` en \`simple-model.js\`.
- \`#release-version\` inicial en \`index.html\`.
- Versión en parámetros de caché de CSS y JS en \`index.html\`.
- Registro de cambios en el repositorio, nunca como un banner en la página.

## 6. Ejemplos y cambios futuros

**Toda modificación visual o del modelo requiere revisar inmediatamente las publicaciones de ejemplo.** Deben reflejar cómo se vería una ficha real escrita en la versión actual, incluida la información redactada en una sola entrada y los dos iconos de contacto. Probar muestras que incluyan lugar, cantidad y presupuesto dentro del texto, para detectar si aparecen por error recuadros de datos estructurados.

No hacer cambios solo en la ficha real dejando los ejemplos atrás ni usar fixtures con estructuras abandonadas.

## 7. Flujo responsable de trabajo en GitHub

- Leer el código vigente, este documento y \`AGENTS.md\` antes de actuar.
- Proponer planes sin editar si esa es la autorización. Cuando haya autorización de ejecutar, crear **rama de prueba** basada en \`codex/diseno-original\` y mantener \`main\` intacta.
- Cambiar lo mínimo; no reactivar \`2026-10-22_app.js\` ni \`firebase-live.js\` sin necesidad explícita, pues el cliente activo es \`simple.js\`.
- Probar sintaxis JS, validación de teléfonos, permisos de autor, enlaces WhatsApp, cantidad exacta de campos, fidelidad de ejemplos, lectura completa y diseño móvil. Cuando se pueda, probar visualmente en navegador y con datos reales de demostración.
- Antes de fusionar, comparar rama con la publicada y revisar que los cambios estén limitados al objetivo. Usar PR; fusionar solo cuando esté autorizado publicar. Verificar el resultado de GitHub Pages; no confundir compilación exitosa con revisión visual real.
- Documentar con transparencia las pruebas que no se ejecutaron y conservar un camino reversible.
- Los fallos y limitaciones técnicas pertenecen a la documentación y al informe del trabajo, no a advertencias intrusivas en la portada.

## 8. Estado técnico conocido y aspectos por resolver

- Repositorio: https://github.com/gruemp/lonecesito
- Sitio: https://gruemp.github.io/lonecesito/
- Rama que activa GitHub Pages: \`codex/diseno-original\`.
- Archivos de interfaz: \`index.html\`, \`simple.css\`, \`simple.js\`, \`simple-model.js\`.
- \`firebase-config.js\` estaba vacío a octubre de 2026; con esa configuración, las publicaciones se guardan localmente en ese navegador, **no se comparten** entre todos los visitantes. Comprobar el estado nuevamente antes de declarar que existe un servicio público multiusuario.
- Las reglas de \`firestore.rules\` requieren despliegue y pruebas en Firestore aparte de GitHub Pages. Revisar seguridad, autorización del autor y privacidad de teléfonos antes de usar personas reales.
- Los módulos viejos y el historial técnico pueden contener textos/funciones descartados; no son fuente de verdad del diseño actual.

## 9. Prioridad y resolución de conflictos

1. La instrucción nueva y expresa del usuario prevalece sobre este documento.
2. Este documento refleja la intención vigente y prevalece sobre archivos históricos, pruebas viejas o decisiones no solicitadas de otra IA.
3. La implementación y los ejemplos deben actualizarse juntos.
4. Ante una limitación de seguridad o técnica, comunicarla con claridad, sin inventar funcionalidades.
5. Actualizar esta guía y \`AGENTS.md\` cuando el usuario cambie una preferencia; **no confiar únicamente en recordar el chat**.

## 10. Portabilidad a otras herramientas de IA

El documento es Markdown estándar, legible en cualquier plataforma con acceso a archivos. Otra IA **no** lo leerá automáticamente si no tiene acceso al repositorio: compartirle el enlace al archivo o copiarle su contenido. No guardar aquí datos privados del propietario ni información sensible de usuarios.
