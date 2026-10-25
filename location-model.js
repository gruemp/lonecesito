/* Ubicación voluntaria del autor. Nunca geolocalizar a visitantes de fichas. */
const safeText=value=>String(value||'').trim().replace(/\s+/g,' ').slice(0,160);
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
    address:safeText(geocode.address), // El proveedor gratuito no ofrece siempre calle/número.
    neighborhood:safeText(geocode.localityName||geocode.locality||geocode.neighborhood)
  };
}
export function validLocation(location){
  if(!location||typeof location!=='object')return false;
  const lat=location.latitude,lon=location.longitude,accuracy=location.accuracy;
  return typeof lat==='number'&&Number.isFinite(lat)&&lat>= -90&&lat<=90
    &&typeof lon==='number'&&Number.isFinite(lon)&&lon>= -180&&lon<=180
    &&typeof accuracy==='number'&&Number.isFinite(accuracy)&&accuracy>0&&accuracy<=100000;
}
export function locationLines(location){
  if(!validLocation(location))return [];
  const parts=[
    ['País',location.country],['Departamento',location.department],
    ['Ciudad',location.city],['Dirección',location.address],['Barrio o localidad',location.neighborhood]
  ].filter(([,value])=>Boolean(safeText(value))).map(([label,value])=>label+': '+safeText(value));
  parts.push('Latitud: '+location.latitude.toFixed(6)+' · Longitud: '+location.longitude.toFixed(6));
  parts.push('Precisión estimada: ±'+Math.round(location.accuracy)+' m');
  return parts;
}
