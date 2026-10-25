/* Ubicación voluntaria del autor. Nunca geolocalizar a visitantes de fichas. */
const safeText=value=>String(value||'').trim().replace(/\s+/g,' ').slice(0,160);
export function cleanAddressText(value){
  const text=String(value||'').trim().replace(/\s+/g,' ');
  if(text.length>180)throw new Error('La dirección no debe superar 180 caracteres.');
  return text;
}
export function locationFromGps(coords,geocode={}){
  const latitude=Number(coords?.latitude),longitude=Number(coords?.longitude),
    accuracy=Number(coords?.accuracy);
  if(!Number.isFinite(latitude)||latitude< -90||latitude>90||
     !Number.isFinite(longitude)||longitude< -180||longitude>180||
     !Number.isFinite(accuracy)||accuracy<=0||accuracy>100000)
    throw new Error('El GPS devolvió una posición o precisión inválida.');
  return {
    latitude:Number(latitude.toFixed(6)),
    longitude:Number(longitude.toFixed(6)),
    accuracy:Math.max(1,Math.round(accuracy)),
    country:safeText(geocode.countryName||geocode.country),
    department:safeText(geocode.principalSubdivision||geocode.department),
    city:safeText(geocode.city),
    municipality:safeText(geocode.municipality),
    address:safeText(geocode.address) // Calle/número si los devuelve el mapa, nunca inventados
  };
}
export function validLocation(location){
  if(!location||typeof location!=='object')return false;
  const lat=location.latitude,lon=location.longitude,accuracy=location.accuracy;
  return typeof lat==='number'&&Number.isFinite(lat)&&lat>= -90&&lat<=90
    &&typeof lon==='number'&&Number.isFinite(lon)&&lon>= -180&&lon<=180
    &&typeof accuracy==='number'&&Number.isFinite(accuracy)&&accuracy>0&&accuracy<=100000;
}
export function locationLines(location,addressText='',showUnavailable=false){
  const hasGps=validLocation(location);
  const declared=cleanAddressText(addressText);
  if(!hasGps)return declared?['Dirección indicada por el autor: '+declared]:[];
  // Mostrar país, departamento y ciudad si existen, sin confundirlos
  // con una calle postal. Los barrios heredados dejan de mostrarse.
  const parts=[
    ['País',location.country],['Departamento',location.department],
    ['Municipio',location.municipality],['Ciudad',location.city]
  ].filter(([,value])=>Boolean(safeText(value))||showUnavailable)
    .map(([label,value])=>label+': '+(safeText(value)||'No identificado'));
  if(declared)parts.push('Dirección indicada por el autor: '+declared);
  // Una dirección aproximada debe ser una calle/numeración, NO una lista de
  // ciudad/municipio/departamento que simule ser una dirección postal.
  parts.push('Dirección aproximada: '+(safeText(location.address)||'Calle y número no identificados'));
  parts.push('Latitud: '+location.latitude.toFixed(6)+' · Longitud: '+location.longitude.toFixed(6));
  parts.push('Precisión estimada: ±'+Math.round(location.accuracy)+' m');
  return parts;
}


/* Enlaces de Maps sin clave API y sin geolocalizar al visitante. */
function mapsDestination(location,addressText=''){
  if(validLocation(location)){
    return location.latitude.toFixed(6)+','+location.longitude.toFixed(6);
  }
  return cleanAddressText(addressText);
}
export function googleMapsLocationUrl(location,addressText=''){
  const destination=mapsDestination(location,addressText);
  if(!destination)return '';
  return 'https://www.google.com/maps/search/?api=1&query='+encodeURIComponent(destination);
}
export function googleMapsDirectionsUrl(location,addressText=''){
  const destination=mapsDestination(location,addressText);
  if(!destination)return '';
  // Google Maps solicita o detecta el punto de partida bajo sus permisos.
  return 'https://www.google.com/maps/dir/?api=1&destination='+encodeURIComponent(destination);
}
export function distanceKmBetween(lat1,lon1,lat2,lon2){
  const vals=[lat1,lon1,lat2,lon2].map(Number);
  if(vals.some(v=>!Number.isFinite(v))||Math.abs(vals[0])>90||
    Math.abs(vals[2])>90||Math.abs(vals[1])>180||Math.abs(vals[3])>180)
    throw new Error('Coordenadas inválidas para calcular distancia.');
  const radians=degrees=>degrees*Math.PI/180;
  const latDelta=radians(vals[2]-vals[0]),lonDelta=radians(vals[3]-vals[1]);
  const h=Math.sin(latDelta/2)**2+
    Math.cos(radians(vals[0]))*Math.cos(radians(vals[2]))*
    Math.sin(lonDelta/2)**2;
  const arc=2*Math.atan2(Math.sqrt(Math.min(1,h)),Math.sqrt(Math.max(0,1-h)));
  return 6371.0088*arc; // kilómetros sobre superficie esférica, no ruta por carretera.
}
export function distanceLabel(km){
  if(!Number.isFinite(km)||km<0)throw new Error('Distancia inválida.');
  return km<1?Math.round(km*1000)+' m':km.toLocaleString('es-CO',{minimumFractionDigits:1,maximumFractionDigits:1})+' km';
}


/* El GPS por sí solo no detecta nomenclatura de calles. Nominatim devuelve
   atributos de calle/número de OSM cuando existen; nunca inventar números. */
export function streetAddressFromOsm(response){
  const a=response&&typeof response==='object'?response.address:null;
  if(!a||typeof a!=='object')return '';
  const road=firstText(a.road,a.pedestrian,a.residential,a.street,a.living_street,a.footway,a.path);
  if(!road)return '';
  const house=safeText(a.house_number).replace(/^#\s*/,'');
  return safeText(house?road+' #'+house:road);
}


/* Estrategia adaptada de Natura:
 * Nominatim permite leer ciudad/town/village/municipality/county/estado,
 * y BigDataCloud es respaldo de los campos administrativos. No debe usarse
 * la ubicación por IP: una publicación necesita coordenadas consentidas.
 */
const osmText=v=>safeText(v).replace(/^Per[ií]metro Urbano\s+/i,'');
const firstText=(...values)=>values.map(osmText).find(Boolean)||'';
function municipalityFromOsm(address){
  const raw=firstText(address.municipality,address.county);
  return raw.replace(/^(?:Municipio|Distrito)(?:\s+(?:de|del))?\s+/i,'').trim();
}
export function locationFromNaturaGeocoders(coords,osmResponse={},bigResponse={}){
  const a=osmResponse&&typeof osmResponse.address==='object'&&osmResponse.address?
    osmResponse.address:{};
  const big=bigResponse&&typeof bigResponse==='object'?bigResponse:{};
  // Natura prueba city/town/village/municipality/county antes de rendirse.
  const osmCity=firstText(a.city,a.town,a.village,a.municipality,a.county)
    .replace(/^(?:Municipio|Distrito)(?:\s+(?:de|del))?\s+/i,'').trim();
  const osmMunicipality=municipalityFromOsm(a);
  // La API de respaldo puede poner la ciudad en «locality», no en «city».
  const bigCity=firstText(big.city,big.locality,big.municipality);
  const municipality=osmMunicipality||firstText(big.municipality,big.city)||
    (osmCity&&!a.county?osmCity:'');
  return locationFromGps(coords,{
    countryName:firstText(a.country,a.country_code,big.countryName,big.country),
    principalSubdivision:firstText(a.state,a.region,big.principalSubdivision,big.department),
    municipality,
    city:osmCity||bigCity||municipality,
    address:streetAddressFromOsm(osmResponse)
  });
}

