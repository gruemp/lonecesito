# Activación segura de Firebase para LoNecesito

El modo multiusuario está preparado, pero todavía no está conectado: el repositorio no contiene la configuración de un proyecto Firebase. GitHub Pages solo publica archivos estáticos; no instala reglas de Firestore. Sin conexión, se mantiene la demostración local anterior.

## Pasos de activación (en este orden)

1. Crear un proyecto en https://console.firebase.google.com/ y registrar una aplicación Web. Copiar los valores públicos apiKey, authDomain, projectId y appId. Nunca incluir claves de servicio administrativas.
2. En Authentication, habilitar Correo electrónico/contraseña y Google. Añadir gruemp.github.io en dominios autorizados. No es necesario usar SMS.
3. Crear Cloud Firestore e instalar las herramientas de desarrollo: `npm install` y `npm install -g firebase-tools`. Ejecutar **primero** `npm run test:rules` para probar `firestore.rules` en Firestore Emulator con usuarios simulados, incluidos propietarios, interesados y terceros. No usar reglas públicas.
4. Solo **después de aprobar las pruebas de privacidad**, iniciar sesión con `firebase login` y publicar las reglas mediante `firebase deploy --only firestore:rules --project TU_PROJECT_ID`. Revisar además App Check, tratamiento de datos y cuotas antes del lanzamiento.
5. Completar firebase-config.js con los valores exactos de la aplicación Web, y publicar la rama codex/diseno-original en GitHub Pages. La página activará firebase-live.js en lugar del modo local cuando la configuración sea completa.
6. Probar publicación y aplicación en dos navegadores o sesiones independientes.

## Lo implementado

- 40 subcategorías: 20 para Bienes y 20 para Servicios. Se mantienen todos los identificadores anteriores para evitar pérdida de registros.
- Registro con correo o Google y perfil de nombre y teléfono. Los datos se piden una vez y pueden editarse en Tu cuenta. No se verifica el número con SMS.
- Aplicación con un clic cuando hay sesión y perfil. Se crea en un lote atómico el documento de aplicación y su índice privado. Sin límite preestablecido de interesados. No se permiten aplicaciones repetidas o a solicitudes propias.
- En las fichas privadas del propietario aparecen automáticamente nombres y teléfonos de quienes aplicaron. No tiene que aprobar previamente a nadie; puede llamar directamente.
- Privacidad: profiles/{uid} solo lo lee ese usuario; requests/{id} es público sin datos de los interesados; requests/{id}/applications/{uid} solo lo leen el propietario del anuncio o el interesado sobre su propia aplicación; applicationsByUser/{uid}/items/{id} solo lo lee el interesado.
- Las solicitudes se publican, editan, cierran y consultan en Firestore. Se conservan los tres pasos del asistente, fotografías opcionales comprimidas, filtros y listas desplegables.
- No hay cargos, comisiones, pagos ni suscripciones para usuarios de LoNecesito. La operación de Firebase por el propietario está sujeta a cuotas y posibles costes: https://firebase.google.com/pricing .

## Pruebas de privacidad imprescindibles antes de abrir el servicio

1. Un visitante anónimo puede ver las necesidades, pero no los perfiles ni aplicaciones.
2. Propietario A publica; B crea cuenta, consiente y aplica; A ve el nombre y el teléfono de B sin aprobarle previamente.
3. C no puede leer ni enumerar las aplicaciones de B; B solo puede leer la suya.
4. B no puede suplantar a C al aplicar, inventar otro número ni editar una necesidad ajena.
5. B no puede aplicar dos veces, ni a necesidades cerradas; varios interesados distintos sí pueden aplicar.
6. Una solicitud sin foto o con foto comprimida se publica correctamente. El propietario puede actualizar su solicitud sin perder interesados.
7. Al cerrar sesión desaparece el acceso a los datos privados. Google exige perfil y consentimiento la primera vez.
8. Revisar medidas contra abuso, borrado y rectificación de datos antes del lanzamiento.

## Limitaciones

- Hasta que se configure un proyecto Firebase y se publiquen estas reglas, NO hay almacenamiento multiusuario en producción.
- No se ha verificado la titularidad de los números; no hay chat ni pagos.
- Los registros antiguos del modo local no migran automáticamente a Firebase.
- Se incluyen pruebas automáticas para Firebase Emulator, pero no se han ejecutado con el emulador en este entorno. Las pruebas estáticas del código no sustituyen esa ejecución.
