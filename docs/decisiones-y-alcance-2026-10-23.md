# LoNecesito — decisiones de diseño y alcance de la etapa actual

Actualizado: 23 de octubre de 2026. Documento de referencia de la rama de cambios; no representa autorización para lanzamiento comercial.

## Decisiones acordadas

### Inicio, publicación y perfiles
- El campo principal «¿Qué necesitas?» **inicia una publicación**, no una búsqueda de catálogo. Conserva el texto escrito y la ciudad si se indicó.
- Formularios diferenciados para **bienes** (cantidad, condición y características) y **servicios** (trabajo, ubicación y detalles). Presupuesto y fecha deseada **opcionales**.
- Ciudad o municipio obligatorio; no se pide dirección exacta en el formulario público.
- Una fotografía **opcional** por necesidad, mostrada en el listado y en el detalle; una fotografía opcional también en cada propuesta. El chat futuro podrá compartir imágenes.
- Los compradores completan la necesidad sin registro y se identifican **al final** antes de publicarla realmente. Acceso futuro mediante Google o correo electrónico, **sin SMS**. No se piden documentos de identidad.
- Cualquier proveedor registrado podrá ofertar en cualquier categoría. Su nombre personal o comercial será visible, pero no su celular o correo.

### Propuestas, comparación y privacidad
- **Número ilimitado de proveedores** por necesidad; máximo **una propuesta activa por proveedor** y necesidad.
- Precio fijo **obligatorio**, positivo, sin cotizaciones abiertas y con costos totales incluidos.
- Orden ascendente por **precio total**; para bienes con distintas cantidades, ascendente por **precio unitario** (se muestra además precio total).
- Cada proveedor puede modificar su oferta y precio mientras no esté aceptada, conservando el historial de precios.
- Puede retirar una oferta no aceptada y posteriormente enviar otra si la necesidad está abierta.
- El comprador puede descartar y recuperar propuestas, sin avisar al proveedor.
- Las ofertas y chats de diferentes proveedores serán privados; solo el comprador conocerá todas las ofertas. Esto requiere permisos de backend antes de funcionar realmente.
- No habrá estrellas, reseñas ni calificaciones.

### Estados y acuerdos
- No hay vencimiento automático de las necesidades abiertas.
- El comprador puede editarlas mientras estén abiertas; **por ahora no** se enviarán alertas de edición a proveedores.
- Las resueltas y canceladas desaparecen del listado público, pero permanecen en el historial privado.
- Se pueden reactivar las canceladas y reabrir las que estaban en proceso si falla un acuerdo; las ofertas antiguas requieren confirmación del proveedor para volver a ser elegibles.
- Aceptar una oferta **no** marca automáticamente la necesidad como resuelta.
- Una vez cubierto el total o aceptado el servicio, la necesidad pasa a «En proceso» y deja de recibir ofertas. El comprador confirma «Resuelta» al recibir el bien o finalizar el trabajo.
- Para bienes se permiten varios proveedores y cantidades parciales. La venta de menos unidades de las ofertadas exige confirmación del proveedor; se conserva el precio por unidad.

### Administración y seguridad
- «Mis propuestas», favoritos, borradores de necesidades y propuestas, filtros por ciudad/categoría/tipo y contador de ofertas nuevas.
- Confirmación antes de aceptar una oferta.
- Reporte de publicaciones, propuestas y mensajes inapropiados; sin sistema de reseñas.
- Chat privado entre cada proveedor y comprador, con preguntas, respuestas y fotografías; notificaciones de mensajes.
- No se exige identificación documental al proveedor.

## Implementado ahora, **solo para demostración local**

- Interfaz de publicación guiada, prellenado desde portada, formularios específicos y controles de validación.
- Filtro por ciudad, tipo y categoría; búsqueda de necesidades de ejemplo/locales.
- Fotografía opcional local de necesidad y propuesta, comprimida en el navegador y guardada únicamente en localStorage. La imagen de la necesidad aparece en listado y detalle.
- Precio fijo obligatorio; propuestas sin tope de negocio; orden total o unitario, historial y modificación, retiro, confirmación de precios reactivados.
- Aceptación de ofertas y cantidades parciales (incluida confirmación del proveedor), estados, cancelación, reactivación y conservación de historial locales.
- Favoritos locales, «Mis propuestas», borradores de propuesta, contador local de ofertas nuevas y reportes locales **que no se transmiten a nadie**.
- Vista preparatoria del chat: los controles de envío están deshabilitados para evitar simular comunicación real.

**Limitaciones:** la misma persona puede manipular los datos locales o cambiar su nombre de demostración, porque no existe autenticación. Por tanto, el sistema no garantiza privacidad entre personas, integridad de ofertas, reportes reales ni mensajes entregados. No debe utilizarse para operaciones reales. La capacidad local depende del espacio de almacenamiento disponible del navegador.

## Pendiente de integrar Firebase, según instrucción expresa

Firebase queda para la etapa final, cuando la interfaz esté acordada y antes de poner LoNecesito en funcionamiento real:

1. **Firebase Authentication:** registro e inicio de sesión con Google o correo, sin SMS ni verificación documental; protección de perfiles.
2. **Cloud Firestore:** usuarios, necesidades, propuestas, precios, historial, favoritos, estados, autorizaciones de propietario y reglas de acceso.
3. **Chat real:** mensajes privados y fotografías con reglas de seguridad; avisos de mensajes y nuevas propuestas según lo aprobado.
4. **Cloud Storage:** fotografías sujetas a la facturación/cuotas vigentes.
5. **Moderación de reportes:** envío seguro a responsables, revisión y gestión de abuso.
6. **Pruebas reales de roles, concurrencia, aceptación y precios:** no confiar en los controles que actualmente solo están en JavaScript del navegador.

**No se ha configurado Firebase.** Esta rama no debe publicarse ni utilizarse como servicio real sin revisión y autorización de despliegue.
