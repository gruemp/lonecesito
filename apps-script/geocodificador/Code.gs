/* Geocodificador independiente de LoNecesito, adaptado de Natura.
   Solo lectura: sin hojas de visitas, identidad, teléfono ni Telegram. */
const SERVICE_NAME_='lonecesito-geocoder';
const CACHE_SECONDS_=21600;
const EMPTY_CACHE_SECONDS_=120;

function doGet(e){
  const p=e&&e.parameter||{};
  const prefix=String(p.prefix||'');
  if(prefix&&!/^lnGeo_[a-f0-9]{32}$/.test(prefix))
    return output_({ok:false,service:SERVICE_NAME_,status:'INVALID_CALLBACK'},'');
  if(p.lat===undefined&&p.lng===undefined)
    return output_({ok:true,service:SERVICE_NAME_,status:'ready',version:'1'},prefix);
  try{
    const lat=coordinate_(p.lat,-90,90),lng=coordinate_(p.lng,-180,180);
    const result=reverseGeocodeCached_(lat,lng);
    return output_({ok:result.status==='OK',service:SERVICE_NAME_,...result},prefix);
  }catch(error){
    return output_({ok:false,service:SERVICE_NAME_,status:'UNAVAILABLE'},prefix);
  }
}

function coordinate_(value,min,max){
  if(typeof value!=='string'||!/^[-+]?\d{1,3}(?:\.\d{1,8})?$/.test(value.trim()))
    throw new Error('Coordenada inválida');
  const n=Number(value);
  if(!Number.isFinite(n)||n<min||n>max)throw new Error('Fuera de rango');
  return n;
}

function reverseGeocodeCached_(lat,lng){
  const cache=CacheService.getScriptCache();
  const key='ln_geo_v1_'+lat.toFixed(6)+'_'+lng.toFixed(6);
  const cached=cache.get(key);
  if(cached){try{return JSON.parse(cached);}catch(error){/* Recuperar caché inválida. */}}
  // La misma cadena de Natura, incluido idioma español y región Colombia.
  const response=Maps.newGeocoder().setLanguage('es').setRegion('co').reverseGeocode(lat,lng);
  const status=String(response&&response.status||'UNAVAILABLE');
  const first=status==='OK'&&Array.isArray(response.results)?response.results[0]:null;
  const result={status:first?'OK':status==='OK'?'ZERO_RESULTS':status,result:first?place_(first):null};
  try{cache.put(key,JSON.stringify(result),first?CACHE_SECONDS_:EMPTY_CACHE_SECONDS_);}catch(error){}
  return result;
}

function place_(first){
  const parts=Array.isArray(first.address_components)?first.address_components:[];
  const component=type=>{
    const part=parts.find(p=>Array.isArray(p.types)&&p.types.indexOf(type)>=0);
    return text_(part&&part.long_name);
  };
  const city=component('locality')||component('postal_town')||component('administrative_area_level_2');
  const route=component('route');
  // Natura toma results[0].formatted_address. Evitar presentar un plus code
  // o una región como calle cuando Google solo identifica administración.
  const address=route||Array.isArray(first.types)&&first.types.indexOf('street_address')>=0
    ?text_(first.formatted_address):'';
  return {country:component('country'),department:component('administrative_area_level_1'),
    municipality:component('administrative_area_level_2')||city,city,address};
}

function text_(value){return String(value||'').trim().replace(/\s+/g,' ').slice(0,160);}
function output_(payload,prefix){
  const json=JSON.stringify(payload).replace(/</g,'\\u003c')
    .replace(/\u2028/g,'\\u2028').replace(/\u2029/g,'\\u2029');
  return ContentService.createTextOutput(prefix?prefix+'('+json+');':json)
    .setMimeType(prefix?ContentService.MimeType.JAVASCRIPT:ContentService.MimeType.JSON);
}
