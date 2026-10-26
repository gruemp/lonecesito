# Geocodificador Google de LoNecesito

Estado: **proyecto independiente creado, versión 1 desplegada y verificada**.
La URL real está en `location-config.js` y los identificadores públicos en
`deployment.json` / `.clasp.json`. Verificados estado anónimo, respuesta de Google
y JSONP con ubicaciones públicas de prueba. La web se activa al publicar el PR.
La implementación nueva está autorizada por el titular y sustituye la restricción
anterior de no usar Apps Script.

Adaptado de `gruemp/natura`, función `reverseGeocodeCached_` de
`apps-script/coordenadas de visitantes natura/visitantes-servicios.js`:

```js
Maps.newGeocoder().setLanguage('es').setRegion('co').reverseGeocode(lat, lng)
// results[0].formatted_address
```

Proyecto independiente: no cambiar proyectos, implementaciones, secretos,
hojas, registro de visitantes ni avisos de Natura. Este servicio no recibe
teléfono, identidad ni descripción. No registra visitas; solo devuelve geocodificación.
La caché temporal usa coordenadas redondeadas a seis decimales y respuesta
hasta seis horas, o dos minutos sin resultado, siguiendo Natura.

## Despliegue

1. Crear un proyecto independiente en Apps Script con nombre
   **LoNecesito — Geocodificador GPS** en la cuenta autorizada por el titular.
2. Reemplazar el archivo de código por `Code.gs` de esta carpeta.
3. Mostrar el manifiesto en Configuración del proyecto y copiar `appsscript.json`.
   No solicitar permisos a hojas de cálculo, Drive, correo o Telegram.
4. Implementar → Nueva implementación → Aplicación web.
   Ejecutar como propietario de la implementación y permitir acceso anónimo,
   para que los visitantes no deban iniciar sesión. El servicio solo acepta
   consultas públicas de geocodificación y consume la cuota de Maps del propietario.
5. Conservar el ID del proyecto y el ID de la implementación en esta carpeta
   para conservar la identidad real del proyecto; ya están registrados en esta carpeta. Nunca copiar tokens OAuth ni credenciales al repositorio.
6. Abrir la URL `/exec` sin coordenadas. Debe devolver:
   `{"ok":true,"service":"lonecesito-geocoder","status":"ready","version":"1"}`.
7. Probar geocodificación con un punto público, no con coordenadas privadas del
   usuario sin su autorización. Verificar JSON y callback JSONP.
8. Mantener la URL `/exec` real en `location-config.js`, verificar la integración
   y publicar el PR hacia `codex/diseno-original`. En actualizaciones del servicio,
   editar la implementación existente para conservar su URL estable.
9. GitHub Pages no despliega Apps Script ni reglas Firestore. Si se activa
   Firebase, desplegar también las reglas que admiten `location.addressSource`.

## Contrato

`GET /exec?lat=...&lng=...&prefix=lnGeo_<32 caracteres hexadecimales>`.
`prefix` es opcional; sin él se devuelve JSON y con él JavaScript JSONP validado.
No existe API de historial ni escritura. Una consulta se autoriza desde el botón
GPS/Actualizar dirección GPS del editor; nunca al abrir una ficha ni al calcular
distancia del visitante. El cliente cancela consultas antiguas y espera la dirección
antes de guardar. Google usa los componentes administrativos y la dirección
formateada; los plus codes o regiones sin calle no se presentan como dirección postal.

Cuando Google falla o devuelve datos insuficientes, permanecen los respaldos
anteriores Nominatim/BigDataCloud y Photon condicional, anunciados en el consentimiento.
La dirección manual/apartamento prevalece como declaración del autor y nunca se sobrescribe.
La precisión GPS y una dirección de Google no garantizan el portal ni el apartamento.

## Validación

Validación real: `/exec` devuelve `ready`; JSONP válido; un punto público de
Bogotá devuelve administración sin calle y el ejemplo oficial Times Square
devuelve `1560 Broadway #1105, New York, NY 10036, EE. UU.`. No se probaron
coordenadas privadas del usuario. Google responde aproximadamente y puede no
identificar calle o número. El cliente admite 12 s para Google y 25 s en total
con respaldos, antes de conservar la información disponible.


`npm run check` y `npm run test:location`.
Las pruebas locales simulan Maps, caché y transporte; **no demuestran que un
proyecto Google esté desplegado ni que devuelva numeración en el punto del usuario**.
El emulador Firestore se ejecuta por separado con `npm run test:rules`.

Referencias: [Geocoder](https://developers.google.com/apps-script/reference/maps/geocoder),
[ContentService y JSONP](https://developers.google.com/apps-script/guides/content),
[aplicaciones web](https://developers.google.com/apps-script/guides/web).
