import {validLocation,googleMapsLocationUrl,distanceKmBetween,distanceLabel} from './location-model.js?v=20261025-v2232';

// Shared by the editor and both lists. A visitor's position stays in this closure.
export function createLocationActions(getLocation,getAddress,{el,icon,geolocation,secure}){
  const map=el('a','audio-action location-map-action');
  map.target='_blank';map.rel='noopener noreferrer';
  map.setAttribute('aria-label','Ver ubicación en Google Maps');
  map.title='Ver ubicación en Google Maps';
  map.append(icon('map'));
  const distance=el('button','audio-action location-distance-action');
  distance.type='button';
  distance.setAttribute('aria-live','polite');
  const value=el('span','location-distance-value');
  value.setAttribute('aria-hidden','true');
  distance.append(icon('distance'),value);
  let key=null,requestId=0;
  const show=(text,label)=>{
    value.textContent=text;
    distance.title=label;
    distance.setAttribute('aria-label',label);
  };
  show('','Distancia desde mi ubicación actual');
  map.addEventListener('click',event=>{if(!map.getAttribute('href'))event.preventDefault();});
  function update(){
    const location=getLocation(),address=getAddress();
    const url=googleMapsLocationUrl(location,address);
    if(url)map.setAttribute('href',url);else map.removeAttribute('href');
    map.setAttribute('aria-disabled',String(!url));
    map.tabIndex=url?0:-1;
    const nextKey=validLocation(location)?location.latitude+','+location.longitude:'';
    if(nextKey!==key){
      key=nextKey;requestId++;
      show('','Distancia desde mi ubicación actual');
      distance.disabled=!key;
    }
    if(!key)distance.title='La distancia necesita una ubicación GPS guardada';
  }
  distance.addEventListener('click',()=>{
    const destination=getLocation();
    if(!validLocation(destination))return;
    if(!geolocation||!secure){
      show('Sin GPS','La distancia necesita ubicación del navegador y conexión HTTPS');return;
    }
    const token=++requestId;
    const latitude=destination.latitude,longitude=destination.longitude;
    distance.disabled=true;
    show('…','Consultando tu ubicación actual para calcular la distancia');
    const fail=error=>{
      if(token!==requestId)return;
      distance.disabled=false;
      show(error?.code===1?'Sin permiso':'Reintentar',error?.code===1?
        'Permiso de ubicación denegado. Pulsa para volver a intentar.':
        'No se pudo obtener tu ubicación. Pulsa para volver a intentar.');
    };
    try{
      geolocation.getCurrentPosition(position=>{
        if(token!==requestId)return;
        distance.disabled=false;
        try{
          const label=distanceLabel(distanceKmBetween(position.coords.latitude,position.coords.longitude,latitude,longitude));
          show(label,'Distancia desde mi ubicación actual: '+label+' aproximadamente en línea recta, no por carretera. Pulsa para volver a medir.');
        }catch{fail();}
      },fail,{enableHighAccuracy:true,maximumAge:0,timeout:15000});
    }catch(error){fail(error);}
  });
  return {map,distance,update};
}
