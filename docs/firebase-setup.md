# Conectar Firebase a LoNecesito

## Decisión vigente

Firebase Authentication identifica al autor y Cloud Firestore guarda las publicaciones compartidas. GitHub Pages conserva la web. El Apps Script independiente existente se mantiene exclusivamente para resolver direcciones GPS, sin base de publicaciones en Sheets ni fotografías en Drive.

## Estado real (26-10-2026)

- Proyecto creado desde la consola con la cuenta elegida por el titular: **lonecesito-4c42e**, nombre LoNecesito, plan Spark sin facturación.
- Aplicación web registrada: **LoNecesito web**, app ID **1:18685710241:web:468014c5e9bc7b8054c5e0**. Configuración pública real incluida en el cliente 2.2.37; nunca usar credenciales administrativas.
- Firestore Standard **(default)** creado en **nam5 (United States)**, modo de producción. Las reglas efectivas son las de `firestore.rules`: lectura pública de requests, crear solo por su autor autenticado y editar/borrar solo por su propietario. Verificadas completas desde el editor tras recargar; lectura anónima HTTP 200 y escritura anónima HTTP 403 PERMISSION_DENIED. No se crearon fichas de prueba.
- **Autorización expresa recibida y aplicada:** Google y correo/contraseña habilitados; dominio `gruemp.github.io` agregado. Nombre público de acceso Google: LoNecesito, asistencia: la cuenta del titular seleccionada en consola. El rechazo inicial de revisión se resolvió solicitando el alcance concreto; no requiere otro permiso. El despliegue de Pages del commit final se verifica por separado.
- No se aceptaron términos nuevos, no se vinculó facturación ni se habilitaron Storage, Analytics o servicios de IA adicionales.
- Despliegue web 2.2.37 verificado (PR #71, Pages 40277786416), acceso real con Google y publicación auténtica visible en listas propia/pública. Consulta REST anónima devuelve esa publicación; sin errores propios de la web observados. Correo/contraseña está habilitado pero no se ensayó con una cuenta real de ese método.
- Proyecto verificable: https://console.firebase.google.com/project/lonecesito-4c42e/firestore/databases/-default-/security/rules

## Configuración del servicio

1. Usar la integración oficial si está disponible o la consola web conforme a la autorización de navegador otorgada por el titular. El proyecto real ya existe: lonecesito-4c42e. No reutilizar recursos de Natura ni inventar IDs o configuración.
2. Empezar con el plan Spark sin habilitar facturación. Crear o seleccionar un proyecto autorizado y registrar una aplicación web. Copiar su configuración pública exacta: `apiKey`, `authDomain`, `projectId` y `appId`. No incluir cuentas de servicio, tokens administrativos ni claves privadas en GitHub.
3. Habilitar Authentication con Google y correo/contraseña, que son los métodos contemplados por la interfaz actual. Autorizar `gruemp.github.io`. Lectura pública de publicaciones sin iniciar sesión; sesión obligatoria para crear, editar y eliminar.
4. Crear Firestore en modo de producción, inicialmente sin acceso de clientes. Registrar la ubicación elegida; no modificar bases existentes de otros proyectos. No activar reglas temporales que permitan escribir a cualquiera.
5. Ejecutar `npm install` y `npm run test:rules`. El SDK de pruebas usa Firebase 12.4.0 y rules-unit-testing 5.0.0, compatibles entre sí. La CLI del comando está fijada en 14.18.0 para que las pruebas no cambien por instalar una versión distinta. El emulador requiere un Java compatible y usa únicamente `demo-lonecesito-privacidad`, sin datos de producción.
6. Desplegar `firestore.rules` en el proyecto real mediante la integración o CLI autorizada después de aprobar las pruebas. Lectura pública solo en `requests`; creación por su propietario autenticado; editar/borrar solo por el autor; resto de colecciones denegadas. GitHub Pages **no despliega las reglas**.
7. Completar `firebase-config.js` y publicar mediante PR a `codex/diseno-original`. El cliente activo es `simple.js`; `firebase-live.js` pertenece al prototipo histórico y no debe reactivarse.
8. Verificar acceso, lectura en dos sesiones, creación/edición/borrado del autor y rechazo de cambios ajenos. Las comprobaciones contra producción deben usar datos expresamente autorizados; no mostrar publicaciones ficticias en la web.

## Fotografías y coste

El cliente actual comprime la foto y la guarda como `picture` dentro del documento de Firestore, con un máximo de 400.000 caracteres validado por las reglas. Esto permite empezar sin Cloud Storage, pero consume la capacidad de Firestore y la transferencia de cada lectura. Conservar los límites existentes y medir el uso.

Cloud Storage for Firebase requiere el plan Blaze con facturación. No habilitarlo, vincular medios de pago ni aceptar costes sin una autorización concreta del titular. Si se decide usarlo más adelante, preparar reglas de propietario, subida, sustitución, borrado y compatibilidad con las fotos existentes antes de activar la opción.

Referencias oficiales:
- https://firebase.google.com/docs/firestore/quickstart
- https://firebase.google.com/docs/firestore/quotas
- https://firebase.google.com/docs/auth/web/google-signin
- https://firebase.google.com/docs/storage/faqs-storage-changes-announced-sept-2024

## Publicaciones locales existentes

Conectar Firebase no sube automáticamente las publicaciones guardadas en otros navegadores. El cambio preparado incluye `local-import.js` y un botón condicional **Recuperar mis publicaciones de este navegador** en Mis publicaciones.

- Solo se ofrecen registros del propietario local `demo-browser`, con consentimiento original y sin marca de ejemplo.
- Antes de transferir se exige sesión y confirmación de cantidad, cuenta y datos públicos (texto, teléfono, foto y GPS). No hay importación al entrar ni al abrir el listado.
- Cada registro usa un ID derivado de SHA-256 de usuario/origen. Una transacción crea el documento solo si no existe; repetir o ejecutar concurrentemente no duplica ni sobrescribe una publicación editada en Firebase.
- Se conservan teléfono, imagen comprimida, coordenadas, fuente de dirección y dirección histórica. No enviar otros campos privados.
- No se borra la copia local. Marcar completado solo después de confirmar creación/existencia válida en servidor. Fallos individuales se conservan y pueden reintentarse. Un cambio de cuenta detiene la operación.
- Los registros que excedan límites (por ejemplo descripciones >1.000 en una creación) se mantienen intactos localmente: no truncarlos ni relajar reglas. Indicar la causa antes de cualquier traslado manual posterior.

## Comprobaciones de seguridad

- Visitante anónimo: puede leer publicaciones públicas; no puede crear, modificar o borrar.
- Autor A: puede crear con su UID; B no puede suplantar a A, editar sus publicaciones, cambiar el propietario ni eliminarlas.
- Validar descripción, teléfono, tamaño de fotografía, coordenadas, precisión y fuente de dirección. No permitir campos privados extra.
- Conservar publicaciones antiguas, incluidas descripciones largas sin cambios y `addressText` histórico. No recuperar campo manual de dirección, avisos finales, perfiles, interesados, postulaciones, estados de contratación ni formularios descartados.
- Verificar permisos desde el servidor; ocultar botones no es una regla de seguridad.
- Registrar por separado pruebas del emulador y pruebas reales de producción. Ninguna sustituye a la otra.
