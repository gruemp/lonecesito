# LoNecesito — versión simplificada de publicaciones y WhatsApp

Esta rama implementa una interfaz **sin aceptar necesidades, sin aplicaciones de terceros, sin propuestas ni estados de resolución**.

## Qué permite
1. Publicar una necesidad de producto o servicio, con WhatsApp visible mediante autorización explícita.
2. Consultar y filtrar publicaciones sin iniciar sesión.
3. Abrir WhatsApp directamente al tocar el teléfono o el botón de contacto.
4. Editar y eliminar únicamente las publicaciones propias.

La portada, los listados y el formulario usan títulos centrados cuando favorecen la legibilidad, párrafos justificados y componentes adaptados al celular. Las fichas mantienen el nombre a la izquierda para facilitar el recorrido visual.

## Estado técnico y alcance de esta rama

- Archivos nuevos: index.html, simple.css, simple-model.js y simple.js.
- El código anterior permanece en el repositorio como antecedente, pero ya no se carga.
- El archivo firebase-config.js está actualmente **sin configurar**. En ese estado la página muestra explícitamente **modo de prueba** y guarda publicaciones solo en el navegador mediante localStorage. No las comparten otros usuarios ni dispositivos.
- Para ofrecer publicaciones públicas reales, configurar Firebase, habilitar Authentication (correo/contraseña y Google si se desea) y desplegar firestore.rules en ese proyecto.
- Las reglas del repositorio **no se despliegan automáticamente** en Firebase al modificar GitHub.
- Cada cuenta de Firebase solo puede editar o eliminar sus publicaciones. Sin Firebase, el modo de prueba simula propiedad local al navegador.
- El número de WhatsApp se publica abiertamente con consentimiento específico. No se crea un registro de interesados.
- Los móviles colombianos de 10 dígitos que empiezan en 3 se convierten al formato internacional con 57.
- Documentos antiguos sin WhatsApp autorizado pueden seguir visibles con un aviso de que el autor debe actualizar su contacto. Solicitudes antiguas canceladas o resueltas no aparecen en el listado público, pero sí en la sección del autor.
- La revisión jurídica de privacidad y tratamiento de contactos sigue pendiente antes de abrir al público.

## Pruebas

Con Node.js:
- node --check simple-model.js
- node --check simple.js
- node --test tests/simple-publicaciones.test.mjs

Con dependencias y Java instalados: npm run test:rules (emulador Firestore).

Antes de un despliegue real verificar en celular:
- publicación con consentimiento y teléfono;
- lectura pública desde otro dispositivo;
- apertura de WhatsApp desde número y botón;
- edición y eliminación solo del autor;
- filtros, párrafos justificados y títulos centrados;
- rechazo de publicaciones sin autorización de teléfono público;
- que otro usuario no pueda alterar publicaciones ajenas.

**Esta rama no debe fusionarse ni desplegarse sin autorización específica de publicación.**
