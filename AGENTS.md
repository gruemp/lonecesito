# Instrucciones permanentes para cualquier IA que trabaje en LoNecesito

Este archivo es la **entrada obligatoria** para agentes e IAs que abran este repositorio. Antes de proponer, editar, revisar o publicar, leer también **[docs/PREFERENCIAS-LO-NECESITO.md](docs/PREFERENCIAS-LO-NECESITO.md)**. Estas son decisiones expresas de la persona responsable del proyecto, no sugerencias genéricas de diseño. Si una nueva instrucción suya las contradice, prevalece la nueva instrucción y se actualizan ambos documentos.

## Reglas vigentes — resumen operativo

1. **Producto sencillo**: un usuario escribe toda su necesidad en **una única caja de texto** y su número en **una única entrada para WhatsApp**. No crear campos separados para título, ciudad, categoría, cantidad, presupuesto, fecha, fotos, etc. El título de la ficha se deriva del comienzo del texto. La información completa se lee en el cuerpo, incluida cualquier ciudad que la persona haya escrito.
2. **Fichas sin metadatos aparte**: **nunca** renderizar ciudad, presupuesto, categoría, fecha u otros detalles como etiquetas, chips, filas o bloques externos al texto de la necesidad. En datos heredados, incorporar esos detalles a un **único texto**, sin perderlos ni repetir información gratuitamente. El teléfono y las acciones de contacto se presentan aparte por ser controles.
3. **Contacto directo con dos iconos**: **no mostrar el número telefónico escrito en ninguna ficha**. Mostrar dos botones compactos e independientes que contengan **solo el icono**, sin texto visible: uno de llamada telefónica, con enlace `tel:+<numero_normalizado>` para abrir el marcador, y otro de WhatsApp con `https://api.whatsapp.com/send?phone=...&text=...` para escribir. Los enlaces tienen etiquetas accesibles (`aria-label`, `title`). No introducir más botones de contacto ni intermediación.
4. **Acciones permitidas**: publicar, consultar, editar y eliminar. **Solo el autor** puede editar o eliminar. No aceptar solicitudes, aplicar, resolver, marcar estados, aprobar personas interesadas ni introducir seguimiento de terceros.
5. **Ejemplos fieles**: las fichas de demostración se generan con el mismo modelo y componente que las reales: descripción + teléfono, mismo formato, colores y distribución. **Nunca** usar los antiguos campos separados en muestras. Mostrar también los dos botones con iconos, pero el icono de llamada de una muestra estará deshabilitado para no marcar un número inventado; el de WhatsApp puede abrirse sin destinatario.
6. **Diseño**: máxima economía **vertical**, nunca a costa de estrechar, truncar u ocultar contenido; prioridad a pantallas pequeñas. Elementos/acciones visualmente separados. Emplear distintos colores sobrios para diferenciar opciones, sin saturar. Textos descriptivos **justificados**, con buena legibilidad y sin huecos exagerados; encabezados **centrados cuando convenga**. Evitar títulos duplicados, espacios y márgenes vacíos.
7. **Pantalla libre de molestias**: no agregar banners sobre pruebas, explicaciones de números ficticios, mensajes redundantes, publicidad ni enlaces de historial en la interfaz. Exponer errores reales solo cuando sean relevantes para realizar una acción.
8. **Versionado obligatorio**: en **cada modificación publicada** incrementar la versión visible **al comienzo de la página**. Mostrar únicamente «Versión X.Y.Z» en una franja discreta. Mantener coherentes index.html, simple-model.js, identificadores de caché y documentación.
9. **Calidad y reversibilidad**: leer el código vigente antes de cambiar; restringir alcance; cambiar en rama nueva; probar sintaxis, regresión móvil, render de ejemplos y flujo de WhatsApp; usar PR, revisar y fusionar en la rama **codex/diseno-original** de GitHub Pages cuando el usuario autorice implementar/publicar. **No modificar main ni cambios ajenos**. Registrar PR, versión y límite de verificaciones.
10. **Hechos operativos**: GitHub Pages es hosting estático. A octubre de 2026, firebase-config.js no tiene configuración operativa; las publicaciones en modo local no son compartidas entre visitantes. **No anunciar un backend público funcional** sin verificar Firebase y reglas. Estas limitaciones técnicas se documentan aquí y en informes, **no en avisos intrusivos de la web**. Mantener tratamiento cuidadoso de teléfonos expuestos, autorización de publicación y enlaces.

## Puntos de entrada

- Sitio: https://gruemp.github.io/lonecesito/
- Repositorio: https://github.com/gruemp/lonecesito
- Rama web: \`codex/diseno-original\`
- Guía detallada: \`docs/PREFERENCIAS-LO-NECESITO.md\`
- Código activo: \`index.html\`, \`simple.js\`, \`simple-model.js\`, \`simple.css\`.
- Código anterior: conservar solo como historia, no reactivarlo accidentalmente.

**Para una IA diferente:** el usuario debe facilitar este repositorio o el archivo de instrucciones. No todas las plataformas consultan GitHub automáticamente; esta guía permite continuar sin depender de la memoria de un chat.
