# LoNecesito — estado vigente, aprendizajes y continuidad

**Revisión de documentación:** 24 de octubre de 2026  
**Versión interna del código de interfaz:** 2.2.16 (no visible al público)  
**Sitio:** https://gruemp.github.io/lonecesito/  
**Repositorio:** https://github.com/gruemp/lonecesito  
**Rama desplegada por GitHub Pages:** **codex/diseno-original**.

Este documento permite que una nueva IA retome el proyecto con contexto real y sin depender de esta conversación. **Obligatorio leer [AGENTS.md](../AGENTS.md) y [PREFERENCIAS-LO-NECESITO.md](PREFERENCIAS-LO-NECESITO.md)** antes de intervenir. Ambos recogen las instrucciones vigentes; este archivo añade estado técnico, aprendizajes y protocolo.

## 1. Qué problema resuelve la web

**LoNecesito es un tablón de necesidades**, no un portal de ofertas ni una plataforma de intermediación. Una persona redacta lo que necesita y agrega su teléfono. Otra ve su necesidad y la contacta directamente mediante **llamada telefónica** o **WhatsApp**. El dueño puede editarla y eliminarla. No hay propuestas, interesados, aceptar, rechazar, resolver, pagos, negociación propia de la web ni Gemini.

## 2. Interfaz actual, no negociable salvo instrucción nueva

- **Navegación:** cuatro pestañas en orden **Inicio → Publicar lo que necesito → Mis publicaciones → Ver necesidades**, en **una fila en PC** y **cuadrícula 2 × 2 en móvil**, persistentes al navegar. En PC están alineadas por ambos extremos con la imagen de Inicio.
- **Inicio:** solo la **imagen aprobada de dos pasos**: «1. Publica lo que necesitas» (licuadora) → «2. Lo ven y te contactan» (llamada o WhatsApp). Archivo: **assets/lonecesito-presentacion-dos-pasos.png**, 1819 × 865. Se ajusta al viewport para aparecer completa al 100 % de zoom, alineada con la navegación, sin recortes ni deformaciones. La imagen anterior queda como respaldo y la variante con mayonesa fue descartada.
- **Ver necesidades:** buscador en vivo, con coincidencias parciales por varios términos, sin tildes/mayúsculas, indexando campos públicos históricos y números telefónicos completos/parciales. Solo necesidades **reales**.
- **Mis publicaciones:** solo las publicaciones creadas por el dueño.
- **Publicar:** **dos entradas**: una descripción completa libre y teléfono. No pedir título, ciudad ni presupuesto aparte. La descripción admite cualquier longitud no vacía (máximo técnico actual 4.000).
- **Controles del editor:** una fila con teléfono e icono a su izquierda y marcador «Ej: 300 123 4567» dentro; foto, micrófono y envío por avión de papel, **sin texto visible en el botón verde**. Enter envía; Shift+Enter salta de línea. En edición aparecen además papelera y X para cancelar, en esa fila.
- **Fichas:** sin título visual; todo el texto justificado y visible, alto según contenido. **Con foto:** derecha, ajuste sin cortes, pulsar para ver completa y cerrar con X/Escape/toque fuera. **Sin foto:** texto a todo el ancho, sin huecos ni marcadores.
- **Acciones de ficha:** una sola fila de **3 iconos** para visitantes (marcador telefónico azul, WhatsApp verde, compartir PNG morado de tres puntos conectados); **5 iconos** para dueño (+ lápiz y papelera). No imprimir el número sobre la ficha, no escribir «Contactar».
- **Compartir:** generar PNG local fiel al contenido sin título visual, foto solo si existe y **teléfono real dentro del PNG**; usar compartir nativo o descargar. El número no se imprime sobre la ficha web.
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
- El editor usa **solo dos campos**: libertad total al describir la necesidad y un número para contactar. Micrófono y foto son opciones, no campos obligatorios.
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
