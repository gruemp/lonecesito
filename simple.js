import {cleanPublication,whatsappUrl,derivedTitle,canManage,normalizeWhatsApp} from './simple-model.js?v=20261025-v2234';
import {publicationMatchesQuery} from './simple-search.js?v=20261024-v2213';
import {makeCardPng} from './card-png.js?v=20261025-v2232';
import {locationFromGps,validLocation,locationLines,cleanAddressText,
  googleMapsLocationUrl,distanceKmBetween,distanceLabel,
  streetAddressFromOsm,locationFromNaturaGeocoders,streetAddressFromPhoton,
  preserveStreetNumber,locationFromGoogleGeocoder} from './location-model.js?v=20261025-v2232';
import {googleGeocoderUrl,requestGoogleGeocode} from './google-geocoder.js?v=20261025-v2232';

const $=id=>document.getElementById(id);
const pages=['inicio','mis-publicaciones','necesidades','publicar'];
const STORAGE='lonecesito-publicaciones-demo-v1';
const state={mode:'loading',user:null,items:[],editingId:null,firebase:null,waitingForAuth:false,saving:false};
const el=(tag,cls,value)=>{
  const node=document.createElement(tag);
  if(cls)node.className=cls;
  if(value!==undefined)node.textContent=String(value);
  return node;
};
let toastTimer;
function toast(message){
  const box=$('toast');box.textContent=message;box.hidden=false;
  clearTimeout(toastTimer);toastTimer=setTimeout(()=>{box.hidden=true;},4500);
}
function feedback(id,message){
  const box=$(id);box.textContent=message||'';box.hidden=!message;
}
const currentUid=()=>state.mode==='demo'?'demo-browser':state.user?.uid||null;
function readLocal(){
  try{const stored=JSON.parse(localStorage.getItem(STORAGE)||'[]');return Array.isArray(stored)?stored.slice(0,300):[];}
  catch{return [];}
}
function saveLocal(items){
  localStorage.setItem(STORAGE,JSON.stringify(items));
  state.items=items;render();
}
function showView(){
  if(activeReading)stopReading();
  const page=window.location.hash.slice(1);
  const screen=pages.includes(page)?page:'inicio';
  if(screen==='publicar'&&state.mode==='cloud'&&!state.user){
    state.waitingForAuth=true;showAuth();window.location.hash='#inicio';return;
  }
  if(screen!=='publicar'&&(capturingLocation||gpsGeocoding))cancelGpsTasks();
  if(screen!=='publicar'&&state.editingId)resetForm();
  for(const name of pages)$(name).hidden=name!==screen;
  document.querySelectorAll('[data-nav]').forEach(node=>{
    if(node.dataset.nav===screen)node.setAttribute('aria-current','page');
    else node.removeAttribute('aria-current');
  });
  window.scrollTo({top:0,behavior:'auto'});
  if(screen==='publicar'&&!state.editingId)resetForm();
}
window.addEventListener('hashchange',showView);

function legacyDetails(record,{forCard=false}={}){
  // Los campos de versiones anteriores se mantienen en un solo texto;
  // no volver a mostrar etiquetas de ciudad, presupuesto, etc. fuera del párrafo.
  const original=String(record.description||'').trim();
  const lines=[];
  const normalized=original.toLocaleLowerCase('es');
  const add=(label,value)=>{
    if(value===null||value===undefined||String(value).trim()==='')return;
    const str=String(value).trim();
    // Evita repetir un dato que el autor ya escribió en su descripción.
    if(normalized.includes(str.toLocaleLowerCase('es')))return;
    lines.push(label+': '+str);
  };
  if(record.title&&record.title!==derivedTitle(original))add('Necesidad',record.title);
  if(record.category)add('Tipo',record.category==='bienes'?'Producto':'Servicio');
  add('Categoría',record.subcategory);
  add('Ciudad',record.city);
  add('Cantidad',record.quantity);
  if(record.condition)add('Estado',({nuevo:'Nuevo',usado:'Segunda mano',cualquiera:'Cualquiera'}[record.condition]||record.condition));
  if(record.budget!==null&&record.budget!==undefined){
    const formatted=new Intl.NumberFormat('es-CO',{style:'currency',currency:'COP',maximumFractionDigits:0}).format(record.budget);
    add('Presupuesto',formatted);
  }
  add('Fecha',record.desiredDate);
  return lines.length?[original,lines.join(' · ')].filter(Boolean).join('\n'):original;
}
function contactIcon(kind){
  const ns='http://www.w3.org/2000/svg';
  const svg=document.createElementNS(ns,'svg');
  svg.setAttribute('viewBox','0 0 24 24');
  svg.setAttribute('width','24');
  svg.setAttribute('height','24');
  svg.setAttribute('fill','none');
  svg.setAttribute('stroke','currentColor');
  svg.setAttribute('stroke-width','1.8');
  svg.setAttribute('stroke-linecap','round');
  svg.setAttribute('stroke-linejoin','round');
  svg.setAttribute('aria-hidden','true');
  svg.classList.add('contact-icon');
  const paths=kind==='call'?
    ['M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.37 1.9.7 2.8a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.9.33 1.84.57 2.8.7A2 2 0 0 1 22 16.92z']:
    kind==='share'?
    ['M18 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6z','M6 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z','M18 22a3 3 0 1 0 0-6 3 3 0 0 0 0 6z','m8.7 13.3 6.6 4.4','m15.3 6.3-6.6 4.4']:
    kind==='listen'?
    ['M11 5 6 9H2v6h4l5 4V5z','M15.5 8.5a5 5 0 0 1 0 7','M18.7 5.3a9.5 9.5 0 0 1 0 13.4']:
    kind==='location'?
    ['M20 10c0 5-8 12-8 12S4 15 4 10a8 8 0 1 1 16 0z','M12 7a3 3 0 1 0 0 6 3 3 0 0 0 0-6z']:
    kind==='play'?
    ['M7 4v16l13-8z']:
    kind==='restart'?
    ['M3 10a9 9 0 1 1 1 7','M3 4v6h6']:
    kind==='pause'?
    ['M7 5v14','M17 5v14']:
    kind==='resume'?
    ['M8 5v14l10-7z','M3 8a9 9 0 0 1 5-5','m3 1-3-1 1-3']:
    kind==='edit'?
    ['M12 20h9','M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4z']:
    kind==='delete'?
    ['M3 6h18','M8 6V4c0-1.1.9-2 2-2h4c1.1 0 2 .9 2 2v2','m19 6-1 14H6L5 6','M10 11v6','M14 11v6']:
    kind==='photo'?
    ['M3 4h18v16H3z','M8 8.5h.01','m3 18 5-6 4 4 3-3 4 5']:
    ['M20.5 11.8a8.5 8.5 0 0 1-12.2 7.6L3 21l1.6-5.2a8.5 8.5 0 1 1 15.9-4z',
     'M8.2 8.3c.3-.6.9-.8 1.4-.3l1 1.2-.7 1.1c.7 1.5 1.9 2.7 3.4 3.4l1.1-.7 1.2 1c.5.5.3 1.1-.3 1.4-.8.4-1.7.5-2.6.1a9.3 9.3 0 0 1-4.6-4.6c-.4-.9-.3-1.8.1-2.6z'];
  for(const d of paths){
    const path=document.createElementNS(ns,'path');
    path.setAttribute('d',d);
    svg.append(path);
  }
  return svg;
}
function contactLink(href,kind,label){
  const a=el('a','contact-action '+(kind==='call'?'call-action':'whatsapp-action'));
  a.href=href;
  a.title=label;
  a.setAttribute('aria-label',label);
  if(kind==='whatsapp'){
    a.target='_blank';
    a.rel='noopener noreferrer';
  }
  a.append(contactIcon(kind));
  return a;
}
/* Visor modal compartido por todas las fotos: permite cerrar, tocar fuera o Escape. */
function openImageViewer(src,title){
  if(!/^data:image\/(?:jpeg|png|webp);base64,[a-zA-Z0-9+/=]+$/.test(src))return;
  const dialog=$('image-dialog');
  const img=$('image-dialog-photo');
  img.src=src;
  img.alt='Fotografía completa de '+String(title||'la necesidad');
  if(!dialog.open)dialog.showModal();
}
$('close-image').addEventListener('click',()=>$('image-dialog').close());
$('image-dialog').addEventListener('click',event=>{
  if(event.target===$('image-dialog'))$('image-dialog').close();
});
$('image-dialog').addEventListener('close',()=>{
  $('image-dialog-photo').removeAttribute('src');
});
async function sharePublicationPng(record){
  const description=legacyDetails(record,{forCard:true})||String(record.description||'');
  try{
    const number='+'+normalizeWhatsApp(record.contactPhone);
    const blob=await makeCardPng({
      description,picture:record.picture||'',
      contactPhone:number,location:record.location||null,addressText:record.addressText||'',example:false
    });
    const filename='lonecesito-necesidad.png';
    if(typeof File==='function'&&typeof navigator.share==='function'){
      const file=new File([blob],filename,{type:'image/png'});
      const canUseFiles=typeof navigator.canShare==='function'&&navigator.canShare({files:[file]});
      if(canUseFiles){
        try{
          await navigator.share({files:[file],title:'LoNecesito'});
          return;
        }catch(error){
          if(error.name==='AbortError')return;
          // Si el sistema no permite compartir, ofrecer la descarga del mismo PNG.
        }
      }
    }
    const url=URL.createObjectURL(blob);
    const download=el('a');
    download.href=url;
    download.download=filename;
    document.body.append(download);
    download.click();
    download.remove();
    setTimeout(()=>URL.revokeObjectURL(url),15000);
    toast('Ficha preparada en formato PNG.');
  }catch(error){
    toast('No se pudo compartir la ficha como imagen.');
  }
}
let activeReading=null;
function readingChunks(text){
  const words=String(text||'').trim().match(/\S+\s*/g)||[];
  const chunks=[],limit=155;
  let part='';
  for(const word of words){
    if(part&&part.length+word.length>limit){chunks.push(part.trim());part='';}
    if(word.length>limit){
      for(let i=0;i<word.length;i+=limit){
        const fragment=word.slice(i,i+limit).trim();
        if(fragment)chunks.push(fragment);
      }
    }else part+=word;
  }
  if(part.trim())chunks.push(part.trim());
  return chunks;
}
// Cada acción tiene su propio botón. Los estados se sincronizan en la
// publicación activa y se restauran al cambiar de ficha o terminar la voz.
function setReadingButtons(panel,status){
  if(!panel)return;
  const controls=panel.readingButtons;
  if(!controls)return;
  const action=status==='playing'?'Pausar lectura':status==='paused'?'Reanudar lectura':'Reproducir lectura';
  controls.main.disabled=false;
  controls.main.title=action;
  controls.main.setAttribute('aria-label',action);
  controls.main.replaceChildren(contactIcon(status==='playing'?'pause':'play'));
  controls.restart.disabled=false;
  panel.dataset.readingState=status;
}
function stopReading(){
  const previous=activeReading;
  activeReading=null;
  if(previous)setReadingButtons(previous.panel,'idle');
  if('speechSynthesis' in window)window.speechSynthesis.cancel();
}
function speakReading(current){
  if(activeReading!==current||current.status!=='playing')return;
  while(current.chunkIndex<current.chunks.length &&
    !current.chunks[current.chunkIndex].slice(current.charOffset).trim()){
    current.chunkIndex++;current.charOffset=0;
  }
  if(current.chunkIndex>=current.chunks.length){stopReading();return;}
  const synth=window.speechSynthesis;
  const content=current.chunks[current.chunkIndex].slice(current.charOffset);
  const baseOffset=current.charOffset;
  const utterance=new SpeechSynthesisUtterance(content);
  current.utterance=utterance;
  utterance.lang='es-CO';
  utterance.rate=1;
  const voices=synth.getVoices();
  const selected=voices.find(voice=>voice.lang.toLowerCase()==='es-co')
    ||voices.find(voice=>voice.lang.toLowerCase().startsWith('es'));
  if(selected){utterance.voice=selected;utterance.lang=selected.lang;}
  utterance.onboundary=event=>{
    if(activeReading!==current||current.utterance!==utterance||current.status!=='playing')return;
    if(Number.isFinite(event.charIndex)){
      const offset=Math.max(0,Math.min(content.length,event.charIndex));
      current.charOffset=Math.max(current.charOffset,baseOffset+offset);
    }
  };
  utterance.onend=()=>{
    if(activeReading!==current||current.utterance!==utterance||current.status!=='playing')return;
    current.utterance=null;
    current.chunkIndex++;current.charOffset=0;
    speakReading(current);
  };
  utterance.onerror=event=>{
    if(activeReading!==current||current.utterance!==utterance||current.status!=='playing')return;
    stopReading();
    if(event.error!=='canceled'&&event.error!=='interrupted')toast('No se pudo leer la publicación.');
  };
  try{synth.speak(utterance);}
  catch{stopReading();toast('No se pudo iniciar la lectura.');}
}
function readingAction(panel,getText,action){
  const synth=window.speechSynthesis;
  if(action==='toggle'){
    const current=activeReading;
    action=current?.panel===panel?(current.status==='playing'?'pause':'resume'):'play';
  }
  if(action==='pause'){
    const current=activeReading;
    if(current?.panel!==panel||current.status!=='playing')return;
    current.status='paused';
    current.utterance=null;
    setReadingButtons(panel,'paused');
    try{synth.cancel();}
    catch{stopReading();toast('No se pudo pausar la lectura.');}
    return;
  }
  if(action==='resume'){
    const current=activeReading;
    if(current?.panel!==panel||current.status!=='paused')return;
    current.status='playing';
    setReadingButtons(panel,'playing');
    try{
      synth.cancel();
      if(synth.paused)synth.resume();
      speakReading(current);
    }catch{stopReading();toast('No se pudo reanudar la lectura.');}
    return;
  }
  // Reproducir e iniciar de nuevo empiezan desde el primer carácter.
  stopReading();
  if(!synth||typeof SpeechSynthesisUtterance!=='function'){
    toast('La lectura en voz alta no está disponible en este navegador.');
    return;
  }
  const chunks=readingChunks(getText());
  if(!chunks.length){toast('Escribe primero el contenido que deseas escuchar.');return;}
  if(recognition)stopDictation();
  const current={panel,chunks,chunkIndex:0,charOffset:0,utterance:null,status:'playing'};
  activeReading=current;
  setReadingButtons(panel,'playing');
  speakReading(current);
}
function createReadingPanel(getText){
  const panel=el('div','audio-control-row');
  panel.setAttribute('role','group');
  panel.setAttribute('aria-label','Controles de lectura en voz alta');
  const controls={};
  for(const [action,label,icon] of [
    ['main','Reproducir lectura','play'],
    ['restart','Reiniciar lectura desde el principio','restart']
  ]){
    const button=el('button','audio-action audio-'+action);
    button.type='button';
    button.title=label;
    button.setAttribute('aria-label',label);
    button.append(contactIcon(icon));
    button.addEventListener('click',()=>readingAction(panel,getText,action==='main'?'toggle':action));
    controls[action]=button;
    panel.append(button);
  }
  panel.readingButtons=controls;
  setReadingButtons(panel,'idle');
  return panel;
}
function renderCard(record,owner){
  const article=el('article','publication-card '+(record.category==='bienes'?'card-goods':record.category==='servicios'?'card-services':'card-general'));
  const description=String(record.description||'').trim();
  const accessibleLabel=String(record.title||derivedTitle(description)).trim()||'Necesidad publicada';
  const main=el('div','publication-main');
  const copy=el('div','publication-copy');

  // Ficha sin título ni bloques de datos: todo el requerimiento en un único párrafo.
  const fullText=legacyDetails(record,{forCard:true})||description;
  copy.append(el('p','publication-description',fullText));
  main.append(copy);

  // Si existe foto, colocarla a la derecha. Sin ella, el texto ocupa todo el ancho.
  const photo=String(record.picture||'');
  if(/^data:image\/(?:jpeg|png|webp);base64,[a-zA-Z0-9+/=]+$/.test(photo)){
    main.classList.add('has-photo');
    const media=el('div','publication-media');
    media.setAttribute('aria-label','Imagen del producto o servicio');
    const img=el('img','publication-photo');
    img.src=photo;
    img.alt='Fotografía de '+accessibleLabel;
    img.loading='lazy';
    const enlarge=el('button','publication-photo-button');
    enlarge.type='button';
    enlarge.title='Ver fotografía completa';
    enlarge.setAttribute('aria-label','Ampliar fotografía de '+accessibleLabel);
    enlarge.append(img);
    enlarge.addEventListener('click',()=>openImageViewer(photo,accessibleLabel));
    media.append(enlarge);
    main.append(media);
  }
  article.append(main);

  const contact=el('div','contact-box');
  let contactNumber='';
  try{
    if(record.contactConsent===true)contactNumber='+'+normalizeWhatsApp(record.contactPhone);
  }catch{contactNumber='';}
  if(contactNumber){
    contact.append(contactLink('tel:'+contactNumber,'call','Llamar por teléfono'));
    contact.append(contactLink(whatsappUrl(contactNumber,record.description||record.title),'whatsapp','Escribir por WhatsApp'));
  }else{
    contact.append(el('span','contact-label','Actualiza el teléfono de esta publicación.'));
  }
  // Todas las fichas pueden compartirse como una imagen PNG, sin intermediarios.
  const share=el('button','contact-action share-action');
  share.type='button';
  share.title='Compartir ficha como imagen PNG';
  share.setAttribute('aria-label','Compartir ficha en formato PNG');
  share.append(contactIcon('share'));
  share.addEventListener('click',()=>sharePublicationPng(record));
  contact.append(share);
  // Primera fila: acciones generales (tres para visitantes, cinco para autor).
  // La segunda fila contiene exclusivamente controles de lectura en voz alta.
  if(owner&&canManage(record,currentUid())){
    contact.classList.add('has-owner-actions');
    const edit=el('button','contact-action edit-action');
    edit.type='button';
    edit.title='Editar publicación';
    edit.setAttribute('aria-label','Editar publicación');
    edit.append(contactIcon('edit'));
    edit.addEventListener('click',()=>editRecord(record));

    const remove=el('button','contact-action delete-action');
    remove.type='button';
    remove.title='Eliminar publicación';
    remove.setAttribute('aria-label','Eliminar publicación');
    remove.append(contactIcon('delete'));
    remove.addEventListener('click',()=>deleteRecord(record));
    contact.append(edit,remove);
  }
  article.append(contact);
  const tools=createReadingPanel(()=>fullText);
  const pin=el('button','audio-action audio-location');
  pin.type='button';
  const location=validLocation(record.location)?record.location:null;
  const addressText=String(record.addressText||'').trim();
  pin.title=location?'Ver ubicación y dirección de la publicación':
    addressText?'Ver dirección indicada por el autor':'Sin ubicación ni dirección registrada';
  pin.setAttribute('aria-label',pin.title);
  pin.disabled=!(location||addressText);
  pin.append(contactIcon('location'));
  tools.append(pin);
  article.append(tools);
  if(location||addressText){
    const details=el('div','publication-location');
    details.hidden=true;
    details.setAttribute('aria-label','Dirección y ubicación guardadas por el autor');
    const lines=el('div','publication-location-lines',
      locationLines(location,addressText,true).join('\n'));
    details.append(lines);
    const actions=el('div','publication-map-actions');
    {
      const distanceButton=el('button','publication-distance-button','Distancia desde mi ubicación actual');
      distanceButton.type='button';
      distanceButton.title='Consultar distancia aproximada en línea recta desde tu ubicación actual';
      distanceButton.setAttribute('aria-label',distanceButton.title);
      const distanceInfo=el('p','publication-distance-result');
      distanceInfo.hidden=true;
      distanceInfo.setAttribute('role','status');
      distanceInfo.setAttribute('aria-live','polite');
      distanceButton.addEventListener('click',()=>{
        distanceInfo.hidden=false;
        if(!location){
          distanceInfo.textContent='Esta publicación no tiene coordenadas GPS para calcular la distancia. Puedes consultar la dirección en Google Maps.';
          return;
        }
        if(!navigator.geolocation||!window.isSecureContext){
          distanceInfo.textContent='La distancia requiere permiso de ubicación en un navegador HTTPS.';
          return;
        }
        distanceButton.disabled=true;
        distanceInfo.textContent='Consultando tu ubicación para calcular la distancia…';
        // Obtener UNA sola lectura por petición del visitante, sin guardarla
        // de forma persistente, compartirla ni comunicarla a LoNecesito.
        navigator.geolocation.getCurrentPosition(position=>{
          distanceButton.disabled=false;
          try{
            const km=distanceKmBetween(
              position.coords.latitude,position.coords.longitude,
              location.latitude,location.longitude);
            distanceInfo.textContent='Distancia aproximada en línea recta: '+
              distanceLabel(km)+'. No es la distancia por carretera.';
          }catch{
            distanceInfo.textContent='No se pudo calcular la distancia con estas coordenadas.';
          }
        },error=>{
          distanceButton.disabled=false;
          distanceInfo.textContent=error?.code===1?
            'Permiso de ubicación denegado. Puedes ver la ruta en Google Maps.':
            'No se pudo obtener tu ubicación. Puedes consultar la ruta en Google Maps.';
        },{enableHighAccuracy:true,maximumAge:0,timeout:15000});
      });
      actions.append(distanceButton,distanceInfo);
    }
    const maps=el('a','publication-map-link','Ver en Google Maps');
    maps.href=googleMapsLocationUrl(location,addressText);
    maps.target='_blank';
    maps.rel='noopener noreferrer';
    maps.setAttribute('aria-label','Ver ubicación de esta necesidad en Google Maps');
    actions.append(maps);
    details.append(actions);
    if(location?.address){
      const google=location.addressSource==='google';
      const attribution=el('a','publication-osm-credit',google?'Dirección: Google Maps':'Datos de calles © OpenStreetMap');
      attribution.href=google?googleMapsLocationUrl(location,addressText):'https://www.openstreetmap.org/copyright';
      attribution.target='_blank';
      attribution.rel='noopener noreferrer';
      details.append(attribution);
    }
    pin.setAttribute('aria-expanded','false');
    pin.addEventListener('click',()=>{
      details.hidden=!details.hidden;
      pin.setAttribute('aria-expanded',String(!details.hidden));
    });
    article.append(details);
  }
  return article;
}
function visibleItems(){
  return state.items.filter(item=>{
    if(!item||item.example===true||item.contactConsent!==true)return false;
    try{return Boolean(normalizeWhatsApp(item.contactPhone));}catch{return false;}
  });
}
function render(){
  if(activeReading)stopReading();
  const query=$('search').value.trim();
  const visible=visibleItems().filter(item=>publicationMatchesQuery(item,query));
  $('browse-list').replaceChildren(...visible.map(item=>renderCard(item,false)));
  $('browse-empty').hidden=visible.length!==0;
  const own=state.items.filter(item=>item&&item.example!==true&&canManage(item,currentUid()));
  $('mine-list').replaceChildren(...own.map(item=>renderCard(item,true)));
  $('mine-empty').hidden=own.length!==0;
  $('mine-empty').textContent=state.mode==='cloud'&&!state.user?'Inicia sesión para consultar tus publicaciones.':'Aún no tienes publicaciones. Crea la primera cuando lo necesites.';
}
$('search').addEventListener('input',render);
const draftReadingPanel=createReadingPanel(()=>$('need-description').value);
draftReadingPanel.setAttribute('aria-label','Lectura, dirección opcional y GPS');
// Dos iconos de audio, después una caja de dirección análoga a la de teléfono,
// y el pin GPS en el extremo derecho de la misma fila.
draftReadingPanel.append($('need-address-field'));
const locateButton=el('button','audio-action audio-location');
locateButton.type='button';
locateButton.title='Obtener ubicación GPS con permiso';
locateButton.setAttribute('aria-label','Obtener ubicación GPS de esta publicación');
locateButton.append(contactIcon('location'));
draftReadingPanel.append(locateButton);
$('draft-audio-row').append(draftReadingPanel);
$('need-description').addEventListener('input',()=>{
  if(activeReading?.panel===draftReadingPanel)stopReading();
});
/* Dictado opcional mediante el navegador; el teclado sigue disponible siempre. */
let recognition=null;
let pictureDraft='';
let pictureLoading=false;
let locationDraft=null,locationRequestId=0,capturingLocation=false;
let gpsWatchId=null,gpsBestCoords=null,gpsGeocoding=null,gpsGeocodeController=null;
let lastStreetLookupAt=0;
function updateGpsButton(){
  const hasFix=validLocation(locationDraft);
  const precision=capturingLocation
    ?(gpsBestCoords?Math.max(1,Math.round(gpsBestCoords.accuracy)):null)
    :(hasFix?Math.round(locationDraft.accuracy):null);
  locateButton.classList.toggle('gps-measuring',capturingLocation);
  locateButton.classList.toggle('gps-fixed',hasFix&&!capturingLocation);
  const label=capturingLocation
    ?'Midiendo GPS'+(precision===null?'…':': ±'+precision+' m')+'. Pulsa otra vez para detener y conservar la mejor posición.'
    :hasFix?'GPS guardado: precisión estimada ±'+precision+' m. Pulsa para mejorar.':
      'Obtener ubicación GPS con permiso';
  locateButton.title=label;
  locateButton.setAttribute('aria-label',label);
  locateButton.setAttribute('aria-pressed',String(capturingLocation));
  locateButton.replaceChildren(contactIcon('location'));
  if(capturingLocation||hasFix){
    const hint=el('span','gps-button-reading',
      precision===null?'…':'±'+precision+'m');
    hint.setAttribute('aria-hidden','true');
    locateButton.append(hint);
  }
}
function showLocationDraft(){
  const preview=$('gps-preview');
  const gpsExists=validLocation(locationDraft);
  const declared=cleanAddressText($('need-address').value);
  preview.hidden=!(gpsExists||declared);
  $('gps-remove').hidden=!gpsExists;
  const refreshing=Boolean(gpsGeocodeController);
  $('gps-refresh').hidden=!gpsExists;
  $('gps-refresh').disabled=capturingLocation||refreshing;
  $('gps-status').hidden=!refreshing;
  preview.setAttribute('aria-busy',String(refreshing));
  $('gps-label').textContent=locationLines(locationDraft,declared,true).join('\n');
  const credit=$('gps-osm-credit');
  credit.hidden=!(gpsExists&&locationDraft.address);
  const google=gpsExists&&locationDraft.addressSource==='google';
  credit.textContent=google?'Dirección: Google Maps':'Calles: © OpenStreetMap';
  credit.href=google?googleMapsLocationUrl(locationDraft):'https://www.openstreetmap.org/copyright';
  const maps=$('gps-map-link');
  const url=googleMapsLocationUrl(locationDraft,declared);
  maps.hidden=!url;
  if(url)maps.href=url;
  else maps.removeAttribute('href');
  updateGpsButton();
}
function stopGpsWatch(){
  if(gpsWatchId!==null){
    navigator.geolocation?.clearWatch(gpsWatchId);
    gpsWatchId=null;
  }
  capturingLocation=false;
}
function cancelGpsTasks(){
  locationRequestId++;
  stopGpsWatch();
  if(gpsGeocodeController){gpsGeocodeController.abort();gpsGeocodeController=null;}
  gpsGeocoding=null;
  gpsBestCoords=null;
  showLocationDraft();
}
// Solo geocodificar la mejor posición final. No enviar las mediciones intermedias.
function resolveGpsAddress(coords,requestId){
  const controller=new AbortController();
  gpsGeocodeController=controller;
  // En una actualización de coordenadas guardadas, conservar cada campo
  // conocido si los proveedores no pueden recuperarlo esta vez.
  const previous=locationDraft?{...locationDraft}:{};
  let geo={},osm={},photonAddress='',googleLocation=null;
  const isCurrent=()=>requestId===locationRequestId&&
    gpsGeocodeController===controller&&!controller.signal.aborted;
  const applyResult=()=>{
    if(!isCurrent())return;
    const resolved=locationFromNaturaGeocoders(coords,osm,geo);
    if(photonAddress)resolved.address=photonAddress;
    if(googleLocation){
      for(const field of ['country','department','municipality','city','address'])
        if(googleLocation[field])resolved[field]=googleLocation[field];
      if(googleLocation.address)resolved.addressSource='google';
    }
    if(previous.latitude===resolved.latitude&&previous.longitude===resolved.longitude){
      if(previous.addressSource==='google'&&previous.address&&!googleLocation?.address){
        resolved.address=previous.address;resolved.addressSource='google';
      }
      resolved.address=preserveStreetNumber(resolved.address,previous.address||'');
      for(const field of ['country','department','municipality','city','address']){
        if(!resolved[field])resolved[field]=previous[field]||'';
      }
      if(resolved.address===previous.address&&previous.addressSource)
        resolved.addressSource=previous.addressSource;
    }
    locationDraft=resolved;
    showLocationDraft();
  };
  showLocationDraft();
  const work=(async()=>{
    const deadline=setTimeout(()=>controller.abort(),googleGeocoderUrl()?25000:13000);
    try{
      if(googleGeocoderUrl()){
        try{
          const payload=await requestGoogleGeocode(coords,{signal:controller.signal});
          if(!isCurrent())return;
          googleLocation=locationFromGoogleGeocoder(coords,payload);applyResult();
          if(googleLocation.address&&googleLocation.country&&googleLocation.department&&googleLocation.city)return;
        }catch{/* Si Google no responde, mantener los respaldos existentes. */}
        if(!isCurrent())return;
      }
      // Se consultan solo las coordenadas finales autorizadas por el autor.
      // Igual que en Natura, OSM aporta calle y también datos administrativos
      // (city/town/village/municipality/state/country); BigDataCloud respalda
      // ciudad/localidad, departamento y país. Se usa solo la muestra final.
      const cityUrl='https://api.bigdatacloud.net/data/reverse-geocode-client?latitude='
        +encodeURIComponent(coords.latitude)+'&longitude='+encodeURIComponent(coords.longitude)
        +'&localityLanguage=es';
      const streetUrl='https://nominatim.openstreetmap.org/reverse?format=jsonv2&addressdetails=1&zoom=18&layer=address'
        +'&accept-language=es&lat='+encodeURIComponent(coords.latitude)
        +'&lon='+encodeURIComponent(coords.longitude);
      const cityRequest=fetch(cityUrl,{signal:controller.signal}).then(async response=>{
        if(!response.ok)throw Error('Localidad no disponible');
        return response.json();
      }).then(data=>{geo=data;applyResult();});
      // Una sola consulta inversa por medición final, nunca en el bucle GPS.
      const streetRequest=(async()=>{
        // Máximo una consulta por segundo desde este navegador.
        // Respetar los límites de Nominatim; un solo GPS final por acción.
        const delay=Math.max(0,1100-(Date.now()-lastStreetLookupAt));
        if(delay)await new Promise(resolve=>setTimeout(resolve,delay));
        if(controller.signal.aborted)throw Error('Consulta cancelada');
        lastStreetLookupAt=Date.now();
        const response=await fetch(streetUrl,{signal:controller.signal});
        if(!response.ok)throw Error('Calle no disponible');
        return response.json();
      })().then(async data=>{
        osm=data;applyResult();
        // Un solo respaldo por acción, únicamente si falta número en una
        // calle identificada. No consultar durante mediciones ni visitas.
        if(!isCurrent())return;
        const street=streetAddressFromOsm(data);
        const knownNumber=previous.latitude===locationDraft.latitude&&previous.longitude===locationDraft.longitude&&
          preserveStreetNumber(street,previous.address||'')!==street;
        if(!street||coords.accuracy>25||String(data?.address?.house_number||'').trim()||knownNumber)return;
        try{
          const url='https://photon.komoot.io/reverse?radius=0.025&limit=5&lat='
            +encodeURIComponent(coords.latitude)+'&lon='+encodeURIComponent(coords.longitude);
          const response=await fetch(url,{signal:controller.signal});
          if(!response.ok)return;
          photonAddress=streetAddressFromPhoton(coords,await response.json(),osm);
          applyResult();
        }catch{/* Conservar la calle y demás datos si el respaldo no responde. */}
      });
      await Promise.allSettled([cityRequest,streetRequest]);
      if(requestId!==locationRequestId||gpsGeocodeController!==controller)return;
      if(!locationDraft.address){
        toast('GPS guardado. La calle o el número no se identificaron; puedes indicarlos en Dirección (opcional).');
      }
      if(!locationDraft.city||!locationDraft.department||!locationDraft.country){
        toast('GPS guardado. Faltan datos administrativos del mapa; puedes volver a medir el GPS.');
      }
    }catch{
      if(requestId===locationRequestId)
        toast('GPS guardado. No se pudo consultar la dirección.');
    }finally{
      clearTimeout(deadline);
      if(gpsGeocodeController===controller){
        gpsGeocodeController=null;
        showLocationDraft();
      }
    }
  })();
  gpsGeocoding=work;
  work.finally(()=>{if(gpsGeocoding===work)gpsGeocoding=null;});
}
function finishGpsMeasurement(){
  if(!capturingLocation)return;
  const best=gpsBestCoords,requestId=locationRequestId;
  stopGpsWatch();
  gpsBestCoords=null;
  if(best){
    locationDraft=locationFromGps(best);
    showLocationDraft();
    resolveGpsAddress(best,requestId);
  }else{
    showLocationDraft();
    toast('No se recibió una posición GPS. Inténtalo de nuevo al aire libre.');
  }
}
$('need-address').addEventListener('input',showLocationDraft);
$('gps-refresh').addEventListener('click',()=>{
  if(state.saving||capturingLocation||gpsGeocoding||!validLocation(locationDraft))return;
  const google=googleGeocoderUrl()?'Se enviarán primero a Google mediante el Apps Script de LoNecesito. Si no hay resultado suficiente, se consultarán ':'Se enviarán a ';
  if(!window.confirm('¿Actualizar la dirección usando las coordenadas GPS guardadas de esta publicación? '+google+'Nominatim (OpenStreetMap) y BigDataCloud; si falta el número, también a Photon (komoot). Estos servicios pueden recibir tu IP. El servicio de Google usa caché de hasta seis horas para ahorrar consultas. La dirección encontrada será aproximada y puede corresponder a un portal cercano. No se medirá tu ubicación actual.'))return;
  const coords={...locationDraft};
  resolveGpsAddress(coords,++locationRequestId);
});
$('gps-remove').addEventListener('click',()=>{
  if(state.saving)return;
  locationRequestId++;
  cancelGpsTasks();
  locationDraft=null;
  showLocationDraft();
});
function gpsErrorMessage(error){
  if(error?.code===1)return 'Permiso de ubicación denegado. Actívalo en el navegador si deseas adjuntar GPS.';
  if(error?.code===2)return 'No se pudo determinar la ubicación del dispositivo.';
  if(error?.code===3)return 'El GPS tardó demasiado. Vuelve a intentarlo en un lugar con mejor señal.';
  return 'No se pudo obtener la ubicación GPS.';
}
locateButton.addEventListener('click',()=>{
  if(state.saving)return;
  if(capturingLocation){finishGpsMeasurement();return;}
  if(!navigator.geolocation||!window.isSecureContext){
    toast('El GPS requiere un navegador con ubicación y una conexión HTTPS.');return;
  }
  const google=googleGeocoderUrl()?'Google mediante el Apps Script de LoNecesito; si no hay resultado suficiente, se consultarán ':' ';
  if(!window.confirm('¿Quieres publicar tus coordenadas GPS y precisión reales? Serán visibles para todos y aparecerán en el PNG. Al detener el GPS, se enviará la mejor coordenada final a '+google+'Nominatim (OpenStreetMap) y BigDataCloud; si falta el número, también a Photon (komoot). Estos servicios pueden recibir tu IP. El servicio de Google usa caché de hasta seis horas para ahorrar consultas. La dirección encontrada será aproximada y puede corresponder a un portal cercano.')){
    return;
  }
  cancelGpsTasks();
  const requestId=++locationRequestId;
  capturingLocation=true;
  gpsBestCoords=null;
  showLocationDraft();
  try{
    gpsWatchId=navigator.geolocation.watchPosition(position=>{
      if(requestId!==locationRequestId||!capturingLocation)return;
      const coords=position.coords;
      try{locationFromGps(coords);}catch{return;}
      if(!gpsBestCoords||coords.accuracy<gpsBestCoords.accuracy){
        gpsBestCoords=coords;
        locationDraft=locationFromGps(coords);
        showLocationDraft();
      }
     },error=>{
      if(requestId!==locationRequestId||!capturingLocation)return;
      // El dispositivo puede mejorar en la siguiente medición. Solo la
      // denegación de permiso detiene el proceso inmediatamente.
      if(error?.code===1){
        stopGpsWatch();
        gpsBestCoords=null;
        showLocationDraft();
        toast(gpsErrorMessage(error));
      }
    },{enableHighAccuracy:true,maximumAge:0,timeout:12000});
   }catch(error){
    stopGpsWatch();
    gpsBestCoords=null;
    showLocationDraft();
    toast(gpsErrorMessage(error));
  }
});
function setMicState(active){
  const button=$('voice-button');
  button.classList.toggle('listening',active);
  button.setAttribute('aria-pressed',String(active));
  button.setAttribute('aria-label',active?'Detener dictado':'Dictar necesidad por voz');
  button.title=active?'Detener dictado':'Dictar necesidad';
}
function stopDictation(){
  const current=recognition;
  recognition=null;
  if(current)try{current.abort();}catch{}
  setMicState(false);
}
$('voice-button').addEventListener('click',()=>{
  if(recognition){stopDictation();return;}
  const Constructor=window.SpeechRecognition||window.webkitSpeechRecognition;
  if(!Constructor){
    toast('Este navegador no admite dictado en la página. Puedes usar el micrófono del teclado.');
    return;
  }
  try{
    const instance=new Constructor();
    recognition=instance;
    instance.lang='es-CO';
    instance.continuous=false;
    instance.interimResults=false;
    instance.maxAlternatives=1;
    instance.onresult=event=>{
      let transcript='';
      for(let i=0;i<event.results.length;i++){
        if(event.results[i].isFinal)transcript+=event.results[i][0].transcript+' ';
      }
      transcript=transcript.trim();
      if(!transcript)return;
      const textarea=$('need-description');
      const join=textarea.value&&!/\s$/.test(textarea.value)?' ':'';
      textarea.value=(textarea.value+join+transcript).slice(0,textarea.maxLength);
      textarea.dispatchEvent(new Event('input',{bubbles:true}));
    };
    instance.onerror=event=>{
      if(event.error==='not-allowed'||event.error==='service-not-allowed')toast('Permite el uso del micrófono para dictar.');
      else if(event.error==='network')toast('El dictado necesita conexión en este navegador.');
      else if(event.error!=='aborted'&&event.error!=='no-speech')toast('No se pudo reconocer la voz.');
    };
    instance.onend=()=>{
      if(recognition===instance){recognition=null;setMicState(false);}
    };
    instance.start();
    setMicState(true);
  }catch{
    recognition=null;setMicState(false);
    toast('No se pudo iniciar el micrófono.');
  }
});
function updatePhotoPreview(){
  const preview=$('photo-preview');
  preview.hidden=!pictureDraft;
  $('need-description').parentElement.classList.toggle('has-photo-preview',Boolean(pictureDraft));
  $('photo-preview-image').src=pictureDraft||'';
  $('photo-picker').value='';
}
$('preview-photo').addEventListener('click',()=>{
  if(pictureDraft)openImageViewer(pictureDraft,'la publicación');
});
$('add-photo').addEventListener('click',()=>$('photo-picker').click());
$('remove-photo').addEventListener('click',()=>{
  pictureDraft='';updatePhotoPreview();
});
function loadPhotoBitmap(file){
  if(typeof createImageBitmap==='function')return createImageBitmap(file);
  return new Promise((resolve,reject)=>{
    const url=URL.createObjectURL(file);
    const img=new Image();
    img.onload=()=>{URL.revokeObjectURL(url);resolve(img);};
    img.onerror=()=>{URL.revokeObjectURL(url);reject(Error('No se pudo leer la imagen.'));};
    img.src=url;
  });
}
async function encodePhoto(file){
  if(!['image/jpeg','image/png','image/webp'].includes(file.type))throw Error('Selecciona una foto JPG, PNG o WebP.');
  if(file.size>12000000)throw Error('La foto es demasiado grande. Selecciona una de menos de 12 MB.');
  const img=await loadPhotoBitmap(file);
  try{
    const width=img.width||img.naturalWidth,height=img.height||img.naturalHeight;
    if(!width||!height)throw Error('No se pudo leer la foto.');
    const canvas=document.createElement('canvas');
    const context=canvas.getContext('2d');
    if(!context)throw Error('Este navegador no puede procesar fotos.');
    for(const maxSide of [960,800,640,480,320]){
      const ratio=Math.min(1,maxSide/Math.max(width,height));
      canvas.width=Math.max(1,Math.round(width*ratio));
      canvas.height=Math.max(1,Math.round(height*ratio));
      context.fillStyle='#ffffff';context.fillRect(0,0,canvas.width,canvas.height);
      context.drawImage(img,0,0,canvas.width,canvas.height);
      for(const quality of [.78,.66,.52]){
        const encoded=canvas.toDataURL('image/jpeg',quality);
        if(encoded.length<380000)return encoded;
      }
    }
    throw Error('La imagen no se pudo comprimir. Elige una foto más pequeña.');
  }finally{
    if(typeof img.close==='function')img.close();
  }
}
$('photo-picker').addEventListener('change',async()=>{
  const file=$('photo-picker').files?.[0];
  if(!file)return;
  pictureLoading=true;$('add-photo').disabled=true;
  try{
    pictureDraft=await encodePhoto(file);
    updatePhotoPreview();
  }catch(error){toast(error.message||'No se pudo adjuntar la foto.');}
  finally{pictureLoading=false;$('add-photo').disabled=false;$('photo-picker').value='';}
});
function resetForm(){
  stopReading();
  stopDictation();
  locationRequestId++;
  cancelGpsTasks();
  locationDraft=null;
  pictureDraft='';updatePhotoPreview();
  $('publish-form').reset();state.editingId=null;
  showLocationDraft();
  $('need-description').maxLength=1000;
  $('save-button').setAttribute('aria-label','Publicar');
  $('save-button').title='Publicar';
  $('cancel-edit').hidden=true;
  $('delete-edit').hidden=true;
  document.querySelector('.publish-controls').classList.remove('editing');
  feedback('form-feedback','');
}
function editRecord(record){
  if(!canManage(record,currentUid()))return;
  resetForm();
  state.editingId=record.id;
  $('need-description').value=legacyDetails(record);
  // Las fichas anteriores de más de 1.000 caracteres se conservan íntegras.
  $('need-description').maxLength=$('need-description').value.length>1000?4000:1000;
  $('need-phone').value=record.contactPhone||'';
  $('need-address').value=record.addressText||'';
  pictureDraft=record.picture||'';updatePhotoPreview();
  locationDraft=validLocation(record.location)?{...record.location}:null;
  showLocationDraft();
  $('save-button').setAttribute('aria-label','Guardar cambios');
  $('save-button').title='Guardar cambios';
  $('cancel-edit').hidden=false;
  $('delete-edit').hidden=false;
  document.querySelector('.publish-controls').classList.add('editing');
  window.location.hash='#publicar';
  showView();
}
$('cancel-edit').addEventListener('click',()=>{if(state.saving)return;resetForm();window.location.hash='#mis-publicaciones';});
$('delete-edit').addEventListener('click',async()=>{
  if(state.saving||!state.editingId)return;
  const record=state.items.find(item=>item.id===state.editingId);
  if(!record||!canManage(record,currentUid())){
    feedback('form-feedback','Solo puedes eliminar tus propias publicaciones.');
    return;
  }
  state.saving=true;
  $('save-button').disabled=true;
  $('delete-edit').disabled=true;
  try{
    const deleted=await deleteRecord(record);
    if(deleted){
      resetForm();
      window.location.hash='#mis-publicaciones';
      showView();
    }
  }finally{
    state.saving=false;
    $('save-button').disabled=false;
    $('delete-edit').disabled=false;
  }
});

// Enter publica con la misma validación que el botón de envío; Shift+Enter crea una nueva línea.
// No se envía durante la composición del teclado (acentos, IME) ni por teclas mantenidas.
function publishOnEnter(event){
  if(event.key!=='Enter'||event.shiftKey||event.isComposing||event.keyCode===229||event.repeat)return;
  if(event.ctrlKey||event.altKey||event.metaKey)return;
  event.preventDefault();
  if(state.saving)return;
  const form=$('publish-form');
  if(typeof form.requestSubmit==='function')form.requestSubmit($('save-button'));
  else $('save-button').click();
}
$('need-description').addEventListener('keydown',publishOnEnter);
$('need-phone').addEventListener('keydown',publishOnEnter);
$('need-address').addEventListener('keydown',publishOnEnter);
async function deleteRecord(record){
  if(!canManage(record,currentUid()))return false;
  if(!window.confirm('¿Eliminar definitivamente esta publicación?'))return false;
  try{
    if(state.mode==='demo')saveLocal(state.items.filter(item=>item.id!==record.id));
    else if(state.mode==='cloud'){
      const api=state.firebase;await api.deleteDoc(api.doc(api.db,'requests',record.id));
    }else throw Error('No fue posible eliminar.');
    toast('Publicación eliminada.');
    return true;
  }catch(error){
    toast('No fue posible eliminar la publicación.');
    return false;
  }
}
$('publish-form').addEventListener('submit',async event=>{
  event.preventDefault();
  if(state.saving)return;
  if(pictureLoading){toast('La imagen aún se está preparando.');return;}
  if(state.mode==='cloud'&&!state.user){state.waitingForAuth=true;showAuth();return;}
  let current=null;
  try{
    if(capturingLocation){
      feedback('form-feedback','Pulsa nuevamente el botón GPS para detener la medición antes de publicar.');
      return;
    }
    const requestId=locationRequestId;
    state.saving=true;$('save-button').disabled=true;
    if(gpsGeocoding){
      feedback('form-feedback','Identificando dirección antes de guardar…');
      await gpsGeocoding;
    }
    // Cancelar o salir del editor invalida también un envío que estaba
    // esperando al geocodificador; no publicar un borrador diferente.
    if(requestId!==locationRequestId)return;
    current=state.items.find(item=>item.id===state.editingId);
    if(state.editingId&&!canManage(current,currentUid()))throw Error('Solo puedes editar tus propias publicaciones.');
    const data=cleanPublication({
      description:$('need-description').value,
      contactPhone:$('need-phone').value
    },{originalDescription:current?legacyDetails(current):null});
    if(pictureDraft)data.picture=pictureDraft;
    const addressText=cleanAddressText($('need-address').value);
    if(addressText)data.addressText=addressText;
    if(validLocation(locationDraft))data.location={...locationDraft};
    if(!['demo','cloud'].includes(state.mode))throw Error('No se puede guardar en este momento.');
    if(state.mode==='demo'){
      const base=current?{id:current.id,ownerUid:current.ownerUid,createdAt:current.createdAt}
        :{id:'local-'+Date.now()+'-'+Math.random().toString(36).slice(2),ownerUid:currentUid(),createdAt:Date.now()};
      const item={...base,...data};
      saveLocal(current?state.items.map(x=>x.id===current.id?item:x):[item,...state.items]);
    }else{
      const api=state.firebase;
      if(current){
        const updated={...data};
        if(current.picture&&!pictureDraft)updated.picture=api.deleteField();
        if(current.location&&!locationDraft)updated.location=api.deleteField();
        if(current.addressText&&!addressText)updated.addressText=api.deleteField();
        // Retirar campos de formularios anteriores; sus datos ya están en la descripción.
        for(const key of ['category','city','subcategory','quantity','condition','budget','desiredDate','status']){
          if(Object.prototype.hasOwnProperty.call(current,key))updated[key]=api.deleteField();
        }
        await api.updateDoc(api.doc(api.db,'requests',current.id),updated);
      }else{
        await api.addDoc(api.collection(api.db,'requests'),{
          ...data,ownerUid:state.user.uid,createdAt:api.serverTimestamp()
        });
      }
    }
    resetForm();
    window.location.hash='#mis-publicaciones';showView();
    toast(current?'Publicación actualizada.':'Publicación guardada.');
  }catch(error){
    feedback('form-feedback',error.message||'No fue posible guardar.');
  }finally{state.saving=false;$('save-button').disabled=false;}
});
function showAuth(){
  if(state.mode!=='cloud')return;
  feedback('auth-feedback','');
  $('auth-form').hidden=Boolean(state.user);
  $('auth-logout').hidden=!state.user;
  if(!$('auth-dialog').open)$('auth-dialog').showModal();
}
$('account-button').addEventListener('click',showAuth);
$('close-auth').addEventListener('click',()=>$('auth-dialog').close());
$('auth-mode').addEventListener('change',()=>{
  const register=$('auth-mode').value==='register';
  $('auth-submit').textContent=register?'Crear cuenta':'Iniciar sesión';
  $('auth-password').autocomplete=register?'new-password':'current-password';
});
$('auth-form').addEventListener('submit',async event=>{
  event.preventDefault();feedback('auth-feedback','');
  if(!state.firebase)return;
  try{
    const email=$('auth-email').value.trim(),password=$('auth-password').value;
    const api=state.firebase;
    if($('auth-mode').value==='register')await api.createUserWithEmailAndPassword(api.auth,email,password);
    else await api.signInWithEmailAndPassword(api.auth,email,password);
    $('auth-dialog').close();
  }catch(error){feedback('auth-feedback',authError(error));}
});
$('auth-google').addEventListener('click',async()=>{
  try{const api=state.firebase;await api.signInWithPopup(api.auth,new api.GoogleAuthProvider());$('auth-dialog').close();}
  catch(error){feedback('auth-feedback',authError(error));}
});
$('auth-logout').addEventListener('click',async()=>{
  if(!state.firebase)return;
  try{await state.firebase.signOut(state.firebase.auth);$('auth-dialog').close();window.location.hash='#inicio';}
  catch(error){feedback('auth-feedback',authError(error));}
});
function authError(error){
  const code=error?.code||'';
  if(code.includes('email-already-in-use'))return 'Ese correo ya tiene una cuenta.';
  if(code.includes('invalid-credential')||code.includes('wrong-password'))return 'Revisa el correo y la contraseña.';
  if(code.includes('weak-password'))return 'La contraseña debe tener al menos seis caracteres.';
  if(code.includes('popup-closed-by-user'))return 'Se cerró la ventana de acceso.';
  return 'No se pudo acceder: '+String(error.message||'revisa tus datos.');
}
async function boot(){
  const config=window.LoNecesitoFirebaseConfig||{};
  const configured=['apiKey','authDomain','projectId','appId'].every(key=>Boolean(config[key]));
  if(!configured){
    state.mode='demo';state.items=readLocal();
    render();showView();return;
  }
  try{
    const [appLib,authLib,dbLib]=await Promise.all([
      import('https://www.gstatic.com/firebasejs/12.4.0/firebase-app.js'),
      import('https://www.gstatic.com/firebasejs/12.4.0/firebase-auth.js'),
      import('https://www.gstatic.com/firebasejs/12.4.0/firebase-firestore.js')
    ]);
    const app=appLib.initializeApp(config),auth=authLib.getAuth(app),db=dbLib.getFirestore(app);
    state.firebase={auth,db,...authLib,...dbLib};state.mode='cloud';
    $('account-button').hidden=false;
    authLib.onAuthStateChanged(auth,user=>{
      state.user=user||null;
      const b=$('account-button');b.textContent=user?(user.email||'Mi cuenta'):'Iniciar sesión';
      if(user&&state.waitingForAuth){state.waitingForAuth=false;window.location.hash='#publicar';}
      render();showView();
    },()=>toast('No se pudo iniciar la sesión.'));
    dbLib.onSnapshot(dbLib.collection(db,'requests'),snapshot=>{
      state.items=snapshot.docs.map(d=>({id:d.id,...d.data()}))
        .sort((a,b)=>(b.createdAt?.seconds||0)-(a.createdAt?.seconds||0));
      render();
    },()=>toast('No se pudieron cargar las publicaciones.'));
    render();showView();
  }catch(error){
    state.mode='error';$('save-button').disabled=true;
    feedback('form-feedback','No se puede guardar en este momento.');
    render();showView();
  }
}
boot();

