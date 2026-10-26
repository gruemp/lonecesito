import {validLocation} from './location-model.js?v=20261025-v2232';

export function googleGeocoderUrl(config=typeof window==='undefined'?{}:window.LoNecesitoLocationConfig){
  const value=String(config?.googleGeocoderUrl||'').trim();
  return /^https:\/\/script\.google\.com\/macros\/s\/[A-Za-z0-9_-]+\/exec$/.test(value)?value:'';
}

// ContentService de Apps Script redirige su salida. JSONP permite consumirla
// desde Pages sin proxy ni claves; solo se manda el punto consentido del autor.
export function requestGoogleGeocode(coords,{signal,endpoint=googleGeocoderUrl(),
  timeoutMs=12000,doc=document,host=window,cryptoApi=crypto}={}){
  return new Promise((resolve,reject)=>{
    if(!validLocation(coords)||!googleGeocoderUrl({googleGeocoderUrl:endpoint})){
      reject(new Error('Geocodificador Google no configurado.'));return;
    }
    if(signal?.aborted){reject(new Error('Consulta cancelada.'));return;}
    const nonce=Array.from(cryptoApi.getRandomValues(new Uint8Array(16)),
      n=>n.toString(16).padStart(2,'0')).join('');
    const callback='lnGeo_'+nonce;
    const script=doc.createElement('script');
    let settled=false,timer;
    const cleanup=()=>{
      clearTimeout(timer);signal?.removeEventListener('abort',abort);
      script.remove();delete host[callback];
    };
    const finish=(error,payload)=>{
      if(settled)return;
      settled=true;cleanup();
      if(error){
        // Una descarga que ya terminó puede ejecutar una respuesta tardía.
        // No permitir que escriba en otro borrador ni dejar una excepción.
        host[callback]=()=>{};
        setTimeout(()=>{delete host[callback];},30000);
        reject(error);
      }else resolve(payload);
    };
    const abort=()=>finish(new Error('Consulta cancelada.'));
    host[callback]=payload=>{
      if(payload?.ok!==true||payload?.service!=='lonecesito-geocoder')
        finish(new Error('Google no devolvió una dirección disponible.'));
      else finish(null,payload);
    };
    script.async=true;script.referrerPolicy='no-referrer';
    script.onerror=()=>finish(new Error('No se pudo consultar Google.'));
    const url=new URL(endpoint);
    url.searchParams.set('lat',coords.latitude.toFixed(6));
    url.searchParams.set('lng',coords.longitude.toFixed(6));
    url.searchParams.set('prefix',callback);
    script.src=url.toString();
    signal?.addEventListener('abort',abort,{once:true});
    timer=setTimeout(()=>finish(new Error('Google tardó demasiado.')),timeoutMs);
    try{doc.head.append(script);}catch(error){finish(error);}
  });
}
