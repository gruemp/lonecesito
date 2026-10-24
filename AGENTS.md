# LoNecesito — reglas actuales para cualquier IA

**Vigencia: 24 de octubre de 2026.** Este documento es la **fuente de verdad operativa**. Leer también [Preferencias detalladas](docs/PREFERENCIAS-LO-NECESITO.md) y [Continuidad técnica](docs/CONTINUIDAD-Y-APRENDIZAJES.md) antes de editar. **La instrucción expresa más reciente del usuario prevalece** sobre mensajes antiguos, versiones y requisitos históricos.

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

## 3. Editor: exclusivamente dos campos y una fila

- **Solo dos entradas visibles:** una caja amplia para la **descripción íntegra de la necesidad** y una caja de **teléfono**. No crear casillas de título, ciudad, categoría, cantidad, presupuesto, precio, fecha ni condición. Esa información, si importa, va en el único texto.
- Descripción **no vacía**, sin mínimo artificial de caracteres (límite técnico actual de 4.000). **La foto es opcional**.
- Bajo el texto, **una única fila horizontal**: caja de teléfono **con icono telefónico a su izquierda** y ejemplo **«Ej: 300 123 4567» dentro de la caja**, después icono de fotografía, icono de micrófono y **botón verde con solo el icono de envío (avión de papel)**. No escribir «Número de WhatsApp», «Publicar» ni «Publicar necesidad» como rótulos visibles en esa fila. Sí conservar etiquetas accesibles.
- **Enter publica o guarda** desde la descripción o el teléfono usando el mismo formulario validado; **Shift+Enter** inserta salto de línea en la descripción. Respetar composición IME, teclas repetidas y protección ante doble envío.
- Micrófono de dictado en español (preferiblemente **es-CO**) mediante reconocimiento del navegador disponible, con inicio/detención por interacción. El teclado sigue siempre disponible; en navegadores sin dictado, informar solo al intentar usarlo. No integrar Gemini.
- Icono de foto: elegir **una foto**, comprimir antes de almacenar; miniatura dentro del editor, pulsable para ampliación y con opción de quitar, sin desplazar la fila.
- **En edición**, añadir en esa misma fila **papelera roja** y **X de cancelar** después del icono de envío; **en creación ambas están ocultas**. Guardar conserva icono y cambia nombre accesible. Papelera valida autoría, pide confirmación y solo al borrar exitosamente vuelve a Mis publicaciones; cancelar el borrado **no pierde texto ni imagen**.

## 4. Fichas: núcleo de la experiencia

- **Nunca mostrar títulos de ficha**. Presentar **todo el texto desde la primera palabra**, justificado, última línea de alineación normal, sin truncar ni esconder. Los campos heredados se incorporan al texto, **no** en chips, cajas separadas ni etiquetas de ciudad, presupuesto, categoría o fecha.
- **Altura natural según contenido**, máxima economía **vertical**, sin estrechar horizontalmente ni reducir la comprensión. La ficha debe leerse de un vistazo en móviles siempre que el contenido lo permita.
- **Con imagen:** ponerla **a la derecha**, ajustando proporción automáticamente **sin recortar ni deformar** (contain). Tocar **cualquier punto** de la imagen abre una vista completa en primer plano, con cierre X, Escape o toque exterior.
- **Sin imagen:** el texto **ocupa todo el ancho**; no reservar columna, recuadro, marcador gráfico, icono ni aviso de ausencia.
- **Una única fila de iconos** por ficha y opciones bien separadas:
  - **Otros usuarios:** tres iconos: **llamar (azul)**, **WhatsApp (verde)** y **compartir PNG (morado)** con símbolo habitual de **tres puntos conectados**.
  - **Autor:** los tres anteriores y después **editar (lápiz azul claro)** y **eliminar (papelera rojo claro)**: cinco en una sola fila.
- Nada de palabras visibles dentro de esos botones, encabezado «Contactar» ni segunda fila «Editar / Eliminar». Mantener tamaño táctil mínimo de **44 px** en móvil, estados de foco y títulos/etiquetas accesibles.
- **Llamada:** enlace de marcador tipo **tel:+número_normalizado**. **WhatsApp:** enlace **https://api.whatsapp.com/send** con teléfono y mensaje contextual. **No imprimir el teléfono en la ficha web**; estará en sus enlaces. No convertir el icono de teléfono en un atajo a WhatsApp.

## 5. Compartir ficha en PNG

- Botón morado con icono de **tres puntos conectados**. Generar **PNG local** fiel a la ficha: **sin título adicional**, texto completo justificado, altura natural, foto a la derecha si existe; sin foto, el texto ocupa todo el ancho.
- En **el PNG sí incluir el teléfono real** del autor, porque una imagen estática compartida debe permitir contactarlo. En **la ficha web, no**. No insertar teléfonos de prueba.
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
3. Usar **rama nueva** desde codex/diseno-original, cambios verificables y PR dirigido a esa rama. Al completar un cambio solicitado, **publicarlo inmediatamente** mediante PR y fusión en la rama de GitHub Pages, sin pedir otra autorización; verificar el resultado disponible e informar las pruebas no realizadas. No afectar main.
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
