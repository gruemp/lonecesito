# Modelo funcional LoNecesito — especificación de pantallas (23-10-2026)

**Fuentes:** `modelo pagina.xlsx` (Hoja1, vistas 1, 2 y la segunda «Vista 2») y contraste con el código de `codex/diseno-original`. **Estado:** propuesta de interfaz / demostración, no autorización de lanzamiento, promesa de cobertura ni modelo de monetización aprobado.

## Objetivo
Un visitante puede (1) publicar qué bien o servicio necesita, (2) explorar necesidades por tipo y categoría y (3) presentar y comparar propuestas. El negocio gira alrededor de las necesidades publicadas, no de un catálogo de vendedores. «Hogares» y «empresas» son posibles usuarios, **no un tercer tipo** de necesidad.

## Pantallas y criterios

### Vista 1. Inicio
- Titular y campo simple «¿Qué necesitas?» y ubicación «¿Dónde necesitas recibirlo o realizarlo?».
- Acción primaria «Publicar necesidad gratis» y secundaria «Explorar necesidades».
- Aclaración visible: **sitio de demostración**; no hay envíos reales.
- La publicación abre la vista/formulario de la necesidad con el título y zona precargados.

### Vista 2. Publicar una necesidad
- Tipo obligatorio: **Bien** o **Servicio**. Categoría específica, distinta del tipo; opción «Otra categoría».
- Comunes: descripción breve, alcance/detalles, ubicación de entrega o ejecución, fecha deseada (opcional) y presupuesto aproximado (opcional), con «Prefiero recibir cotizaciones» como alternativa al importe.
- Si **Bien**: cantidad (>0), condición (nuevo / usado / cualquiera), y detalles de especificación o referencia en la descripción. La fecha corresponde a entrega.
- Si **Servicio**: descripción del trabajo, alcance, disponibilidad o necesidad de diagnóstico en la descripción. La fecha corresponde a ejecución/visita.
- Teléfono: el Excel lo pide, pero **no se debe publicar**. En la demostración se puede mostrar como campo opcional para explicar el flujo, pero **no se guarda ni se transmite**; deberá habilitarse únicamente con tratamiento seguro, consentimiento y verificación en backend.
- Validación clara, texto escapado de forma segura y aviso de que los datos se almacenan solo en el navegador.
- No inventar datos reales, testimonios ni captación exitosa.

### Vista 3. Explorar necesidades
- Filtros por Todos / Bienes / Servicios, más categoría específica y búsqueda.
- Fichas con tipo, título, categoría, zona de atención y estado, sin nombres, direcciones precisas ni teléfonos.
- Detalle con características del bien o servicio y presupuesto solo cuando haya sido indicado.
- Propuestas privadas y comparables por alcance, precio, plazo, exclusiones y garantía cuando el proveedor los diligencia.
- Máximo **tres propuestas** por solicitud. Registro local de demostración; no implica conexión real.
- El creador local puede marcar una solicitud de prueba como resuelta y visualizar las propuestas de ese mismo navegador.

## Modelo de datos de demostración
Solicitud: `id`, `title`, `city`, `category` (bienes/servicios), `subcategory`, `description`, `budget` (número en COP o null), `quantity` (bienes), `condition` (bienes), `desiredDate` (opcional), `status` (abierta/resuelta). **No almacenar teléfono en localStorage ni representarlo en las fichas**. Propuesta: `requestId`, `name`, `description`, `price` (opcional), `delivery` (opcional), `exclusions` y `warranty` (opcionales).

## Compatibilidad y límites
- Preservar y normalizar registros locales anteriores: las categorías heredadas `productos` y `negocios` se visualizan como **bienes**; `servicios` se conserva. No borrar silenciosamente solicitudes antiguas.
- El frontend continúa sin backend, cuentas reales, verificación de teléfonos, mensajería, pagos ni servicio de contratación. El listado compartido entre usuarios, la privacidad efectiva y la verificación real **dependen de infraestructura adicional y aprobación específica**.
- No fusionar con `main` ni modificar el despliegue de GitHub Pages como consecuencia de esta especificación.

## Comprobaciones antes de fusionar o publicar
1. Filtrado por bien, servicio, categoría y texto.
2. El formulario muestra condiciones/cantidad solo para bienes y rechaza datos inválidos.
3. El teléfono no queda guardado ni aparece en HTML dinámico.
4. Migración local de tipos antiguos, límite de tres propuestas y rechazo de duplicados.
5. Visualización del estado resuelta y cierre de propuestas en esa solicitud.
6. Validación en móvil real y revisión de accesibilidad.
7. Verificación de seguridad/privacidad y decisión sobre backend antes de captación comercial.

**Documentación de cambio:** registrar rama, commit, archivos modificados y pruebas verificadas. La aprobación de esta especificación no supone lanzamiento comercial.