# Conectar Firebase a LoNecesito

## Decisión vigente

Firebase Authentication identifica al autor y Cloud Firestore guarda las publicaciones compartidas. GitHub Pages conserva la web. El Apps Script independiente existente se mantiene exclusivamente para resolver direcciones GPS, sin base de publicaciones en Sheets ni fotografías en Drive.

La configuración pública en `firebase-config.js` sigue vacía: el servicio multiusuario **todavía no está activado**. En ese estado, `simple.js` guarda publicaciones en el navegador. No asumir que la conexión existe por tener el código preparado.

## Configuración del servicio

1. Conectar la integración oficial de Firebase para acceder a la cuenta del titular y verificar si ya existe un proyecto destinado a LoNecesito. No reutilizar recursos de Natura ni inventar IDs o configuración.
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

Conectar Firebase no sube automáticamente las publicaciones guardadas en otros navegadores. No borrar `localStorage`, no presentar las fichas locales como públicas y no atribuir todos los registros a una cuenta nueva de forma automática. Antes de activar la conexión para usuarios que ya tengan datos, preparar un procedimiento explícito de importación de sus propias publicaciones y verificar descripción, teléfono, fotografía, GPS y direcciones históricas. El navegador original debe conservar una copia hasta comprobar el resultado.

## Comprobaciones de seguridad

- Visitante anónimo: puede leer publicaciones públicas; no puede crear, modificar o borrar.
- Autor A: puede crear con su UID; B no puede suplantar a A, editar sus publicaciones, cambiar el propietario ni eliminarlas.
- Validar descripción, teléfono, tamaño de fotografía, coordenadas, precisión y fuente de dirección. No permitir campos privados extra.
- Conservar publicaciones antiguas, incluidas descripciones largas sin cambios y `addressText` histórico. No recuperar campo manual de dirección, avisos finales, perfiles, interesados, postulaciones, estados de contratación ni formularios descartados.
- Verificar permisos desde el servidor; ocultar botones no es una regla de seguridad.
- Registrar por separado pruebas del emulador y pruebas reales de producción. Ninguna sustituye a la otra.
