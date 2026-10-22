export const STORAGE_KEY = 'lonecesito-demo-v1';
export const CATEGORIES = Object.freeze({productos:'Productos',servicios:'Servicios',negocios:'Negocios'});
export const EXAMPLES = Object.freeze([
  {id:'empaques',title:'Necesito 100 empaques personalizados',city:'Bogotá',category:'productos',description:'Busco 100 empaques de cartón para mi negocio. La propuesta debe incluir medidas disponibles, personalización, precio total y plazo de entrega. Solicitud ilustrativa; no corresponde a un comprador real.'},
  {id:'filtracion',title:'Busco reparar una filtración',city:'Medellín',category:'servicios',description:'Necesito revisar una filtración en la instalación de agua de un local. Indica disponibilidad, costo de diagnóstico y qué incluye el servicio. Solicitud ilustrativa; no corresponde a un comprador real.'},
  {id:'uniformes',title:'Necesito uniformes para mi equipo',city:'Cali',category:'negocios',description:'Busco uniformes para mi equipo de trabajo. Indica opciones de tela, tallas, personalización, precio y plazo de entrega. Solicitud ilustrativa; no corresponde a un comprador real.'}
]);

function cleanText(value,min,max,label){
  if(typeof value!=='string')throw new Error(`Revisa ${label}.`);
  const text=value.replace(/\r\n?/g,'\n').trim();
  if(text.length<min||text.length>max)throw new Error(`${label} debe tener entre ${min} y ${max} caracteres.`);
  return text;
}

export function normalizeRequest(input){
  if(!input||!Object.hasOwn(CATEGORIES,input.category))throw new Error('Selecciona un tipo de necesidad válido.');
  return {title:cleanText(input.title,8,120,'La descripción breve'),city:cleanText(input.city,2,80,'La ciudad'),category:input.category,description:cleanText(input.description,15,1500,'Los detalles')};
}

export function normalizeProposal(input){
  return {name:cleanText(input?.name,2,80,'El nombre'),description:cleanText(input?.description,15,1500,'La propuesta'),requestId:cleanText(input?.requestId,1,120,'La solicitud')};
}

export function appendProposal(proposals,input){
  const proposal=normalizeProposal(input);
  const matching=proposals.filter(p=>p.requestId===proposal.requestId);
  if(matching.length>=3)throw new Error('Esta solicitud ya tiene las tres propuestas de prueba permitidas.');
  if(matching.some(p=>p.name.toLocaleLowerCase('es')===proposal.name.toLocaleLowerCase('es')))throw new Error('Ya guardaste una propuesta con este nombre para esta solicitud.');
  return [...proposals,proposal];
}

export function decodeState(raw){
  const state={version:1,requests:[],proposals:[],provider:null,name:''};
  if(!raw)return state;
  let parsed;try{parsed=JSON.parse(raw);}catch{return state;}
  if(!parsed||typeof parsed!=='object'||parsed.version!==1)return state;
  if(Array.isArray(parsed.requests)){
    const ids=new Set(EXAMPLES.map(r=>r.id));
    for(const item of parsed.requests.slice(0,50)){
      try{
        const normalized=normalizeRequest(item);
        const id=cleanText(item.id,1,120,'El identificador');
        if(ids.has(id))continue;
        ids.add(id);state.requests.push({...normalized,id});
      }catch{/* Ignore malformed records without discarding valid records. */}
    }
  }
  const requestIds=new Set([...EXAMPLES,...state.requests].map(r=>r.id));
  if(Array.isArray(parsed.proposals)){
    for(const proposal of parsed.proposals.slice(0,159)){
      try{if(requestIds.has(proposal.requestId))state.proposals=appendProposal(state.proposals,proposal);}catch{/* Ignore invalid or excess proposals. */}
    }
  }
  if(typeof parsed.name==='string'&&parsed.name.trim().length>=2&&parsed.name.length<=40)state.name=parsed.name.trim();
  if(parsed.provider){try{state.provider={name:cleanText(parsed.provider.name,2,80,'El nombre'),specialty:cleanText(parsed.provider.specialty,3,120,'La especialidad'),city:cleanText(parsed.provider.city,2,80,'La ciudad')};}catch{/* Ignore an invalid profile. */}}
  return state;
}

export function persistState(storage,state){
  try{storage.setItem(STORAGE_KEY,JSON.stringify(state));return true;}catch{return false;}
}

function init(){
  const $=selector=>document.querySelector(selector);
  const $$=selector=>[...document.querySelectorAll(selector)];
  let storage;let state=decodeState(null);
  try{storage=window.localStorage;state=decodeState(storage.getItem(STORAGE_KEY));}catch{/* The page remains usable without storage. */}
  let currentCategory='all';let currentRequestId=null;let toastTimeout;
  const grid=$('#request-grid');
  const records=()=>[...state.requests,...EXAMPLES];
  const findRequest=id=>records().find(request=>request.id===id);
  const svg=(name,className='icon')=>{
    const element=document.createElementNS('http://www.w3.org/2000/svg','svg');
    element.setAttribute('class',className);element.setAttribute('aria-hidden','true');
    const use=document.createElementNS('http://www.w3.org/2000/svg','use');use.setAttribute('href',`#${name}`);element.append(use);return element;
  };
  function showToast(message){
    const toast=$('#toast');clearTimeout(toastTimeout);toast.textContent=message;toast.hidden=false;
    toastTimeout=setTimeout(()=>{toast.hidden=true;},6500);
  }
  function openDialog(id){
    $$('.form-error').forEach(error=>{error.hidden=true;error.textContent='';});
    const dialog=$(`#${id}-dialog`);if(dialog.open)return;
    dialog.showModal();
  }
  function save(next,errorId){
    const error=$(`#${errorId}`);
    if(!persistState(storage,next)){
      error.textContent='No se pudo guardar. Revisa si tu navegador permite almacenamiento local e inténtalo de nuevo.';error.hidden=false;return false;
    }
    state=next;error.hidden=true;return true;
  }
  function setError(id,error){const element=$(`#${id}`);element.textContent=error.message||'Revisa los datos e inténtalo de nuevo.';element.hidden=false;}
  function updateAccess(){const button=$('#access-button');button.textContent=state.name?`Hola, ${state.name.split(/\s+/)[0].slice(0,16)}`:'Ingresar';}
  function applyFilter(category=currentCategory){
    currentCategory=category;
    $$('.filter').forEach(button=>{const selected=button.dataset.category===category;button.classList.toggle('is-active',selected);button.setAttribute('aria-pressed',String(selected));});
    let visible=0;
    [...grid.children].forEach(card=>{card.hidden=category!=='all'&&card.dataset.kind!==category;if(!card.hidden)visible++;});
    $('#empty-state').hidden=visible>0;
    $('#filter-status').textContent=`${visible} ${visible===1?'solicitud disponible':'solicitudes disponibles'}.`;
  }
  function addUserCard(request){
    const article=document.createElement('article');article.className='request-card';article.dataset.id=request.id;article.dataset.kind=request.category;article.dataset.userRequest='true';
    const photo=document.createElement('div');photo.className='card-photo new-request-photo';photo.setAttribute('aria-hidden','true');photo.append(svg('box','step-icon'));
    const content=document.createElement('div');content.className='card-content';
    const category=document.createElement('p');category.className='category';category.textContent=CATEGORIES[request.category].toLocaleUpperCase('es');
    const title=document.createElement('h3');title.textContent=request.title;
    const city=document.createElement('p');city.className='card-city';city.append(svg('pin'),document.createTextNode(request.city));
    const button=document.createElement('button');button.className='card-link';button.dataset.request=request.id;button.append(document.createTextNode('Ver solicitud '),svg('arrow'));button.setAttribute('aria-label',`Ver solicitud: ${request.title}`);
    content.append(category,title,city,button);article.append(photo,content);return article;
  }
  function renderOwnRequests(){
    grid.querySelectorAll('[data-user-request]').forEach(card=>card.remove());
    const fragment=document.createDocumentFragment();state.requests.forEach(request=>fragment.append(addUserCard(request)));grid.prepend(fragment);applyFilter();
  }
  function showRequest(id){
    const request=findRequest(id);if(!request)return;currentRequestId=id;
    $('#detail-title').textContent=request.title;$('#detail-category').textContent=CATEGORIES[request.category].toLocaleUpperCase('es');
    $('#detail-city').textContent=request.city;$('#detail-description').textContent=request.description;
    const count=state.proposals.filter(proposal=>proposal.requestId===id).length;
    $('#detail-note').textContent=`${EXAMPLES.some(r=>r.id===id)?'Solicitud de ejemplo.':'Solicitud de prueba guardada en este navegador.'} ${count} de 3 propuestas de prueba guardadas. No hay envío a compradores ni proveedores.`;
    $('#open-proposal').disabled=count>=3;$('#open-proposal').textContent=count>=3?'Tres propuestas de prueba guardadas':'Presentar propuesta de prueba';openDialog('detail');
  }

  $$('[data-open]').forEach(button=>button.addEventListener('click',()=>{
    const kind=button.dataset.open;
    if(kind==='provider'&&state.provider){$('#provider-name').value=state.provider.name;$('#provider-specialty').value=state.provider.specialty;$('#provider-city').value=state.provider.city;}
    if(kind==='access')$('#access-name').value=state.name;
    openDialog(kind);
  }));
  $$('.close-dialog').forEach(button=>button.addEventListener('click',()=>button.closest('dialog').close()));
  $$('dialog').forEach(dialog=>dialog.addEventListener('click',event=>{
    if(event.target!==dialog)return;const bounds=dialog.getBoundingClientRect();
    if(event.clientX<bounds.left||event.clientX>bounds.right||event.clientY<bounds.top||event.clientY>bounds.bottom)dialog.close();
  }));
  $$('.filter').forEach(button=>button.addEventListener('click',()=>applyFilter(button.dataset.category)));
  $$('[data-explore]').forEach(link=>link.addEventListener('click',()=>applyFilter('all')));
  $$('.mobile-nav a,.mobile-nav button').forEach(link=>link.addEventListener('click',()=>{$('.mobile-nav').open=false;}));

  $('#hero-form').addEventListener('submit',event=>{
    event.preventDefault();$('#request-title').value=$('#hero-need').value.trim();$('#request-city').value=$('#hero-city').value.trim();openDialog('publish');
    if($('#request-title').value.length>=8&&$('#request-city').value.length>=2)$('#request-description').focus();
  });
  $('#publish-form').addEventListener('submit',event=>{
    event.preventDefault();
    try{
      if(state.requests.length>=50)throw new Error('Esta demostración admite hasta 50 solicitudes en este navegador.');
      const request=normalizeRequest(Object.fromEntries(new FormData(event.currentTarget)));
      const id=window.crypto?.randomUUID?.()||`local-${Date.now()}-${Math.random().toString(36).slice(2)}`;
      if(!save({...state,requests:[{...request,id},...state.requests]},'publish-error'))return;
      $('#publish-dialog').close();event.currentTarget.reset();$('#hero-form').reset();currentCategory='all';renderOwnRequests();
      $('#necesidades').scrollIntoView({block:'start'});showToast('Solicitud de prueba guardada en este navegador. No se ha enviado a proveedores.');
    }catch(error){setError('publish-error',error);}
  });
  grid.addEventListener('click',event=>{const button=event.target.closest('[data-request]');if(button)showRequest(button.dataset.request);});
  $('#open-proposal').addEventListener('click',()=>{
    const request=findRequest(currentRequestId);if(!request)return;
    $('#detail-dialog').close();$('#proposal-request-title').textContent=request.title;$('#proposal-name').value=state.provider?.name||state.name;openDialog('proposal');
  });
  $('#proposal-form').addEventListener('submit',event=>{
    event.preventDefault();
    try{
      if(!findRequest(currentRequestId))throw new Error('Selecciona una solicitud válida.');
      const proposals=appendProposal(state.proposals,{...Object.fromEntries(new FormData(event.currentTarget)),requestId:currentRequestId});
      if(!save({...state,proposals},'proposal-error'))return;
      $('#proposal-dialog').close();event.currentTarget.reset();showRequest(currentRequestId);showToast('Propuesta de prueba guardada únicamente en este navegador.');
    }catch(error){setError('proposal-error',error);}
  });
  $('#provider-form').addEventListener('submit',event=>{
    event.preventDefault();
    try{
      const values=Object.fromEntries(new FormData(event.currentTarget));
      const provider={name:cleanText(values.name,2,80,'El nombre'),specialty:cleanText(values.specialty,3,120,'La especialidad'),city:cleanText(values.city,2,80,'La ciudad')};
      if(!save({...state,provider},'provider-error'))return;
      $('#provider-dialog').close();showToast('Perfil de prueba guardado en este navegador. Ya puedes explorar las solicitudes.');applyFilter('all');$('#necesidades').scrollIntoView({block:'start'});
    }catch(error){setError('provider-error',error);}
  });
  $('#access-form').addEventListener('submit',event=>{
    event.preventDefault();
    try{
      const name=cleanText(new FormData(event.currentTarget).get('name'),2,40,'El nombre');
      if(!save({...state,name},'access-error'))return;
      updateAccess();$('#access-dialog').close();showToast(`Bienvenido, ${name}. Estás usando una demostración local.`);
    }catch(error){setError('access-error',error);}
  });
  updateAccess();renderOwnRequests();
}

if(typeof document!=='undefined')init();
