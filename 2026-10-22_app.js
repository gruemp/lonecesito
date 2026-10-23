export const STORAGE_KEY = 'lonecesito-demo-v1';
export const CATEGORIES = Object.freeze({bienes:'Bienes',servicios:'Servicios'});
export const SUBCATEGORIES = Object.freeze({
  bienes:Object.freeze({insumos:'Insumos y materiales',vestuario:'Ropa y uniformes',repuestos:'Tecnología y repuestos',otros:'Otros bienes'}),
  servicios:Object.freeze({mantenimiento:'Mantenimiento y reparaciones',profesionales:'Servicios profesionales',tecnologia:'Tecnología y soporte',otros:'Otros servicios'})
});
export const EXAMPLES = Object.freeze([
  {id:'empaques',title:'Necesito 100 empaques personalizados',city:'Bogotá',category:'bienes',subcategory:'insumos',quantity:100,condition:'cualquiera',description:'Busco 100 empaques de cartón para mi negocio. La propuesta debe incluir medidas disponibles, personalización, precio total y plazo de entrega. Solicitud ilustrativa; no corresponde a un comprador real.'},
  {id:'filtracion',title:'Busco reparar una filtración',city:'Medellín',category:'servicios',subcategory:'mantenimiento',description:'Necesito revisar una filtración en la instalación de agua de un local. Indica disponibilidad, costo de diagnóstico y qué incluye el servicio. Solicitud ilustrativa; no corresponde a un comprador real.'},
  {id:'uniformes',title:'Necesito uniformes para mi equipo',city:'Cali',category:'bienes',subcategory:'vestuario',description:'Busco uniformes para mi equipo de trabajo. Indica opciones de tela, tallas, personalización, precio y plazo de entrega. Solicitud ilustrativa; no corresponde a un comprador real.'}
]);

function cleanText(value,min,max,label){
  if(typeof value!=='string')throw new Error(`Revisa ${label}.`);
  const text=value.replace(/\r\n?/g,'\n').trim();
  if(text.length<min||text.length>max)throw new Error(`${label} debe tener entre ${min} y ${max} caracteres.`);
  return text;
}

function optionalText(value,max,label){
  if(value==null||value==='')return '';
  if(typeof value!=='string')throw new Error(`Revisa ${label}.`);
  const text=value.trim();
  if(text.length>max)throw new Error(`${label} no puede superar ${max} caracteres.`);
  return text;
}
function optionalAmount(value,label){
  if(value==null||value==='')return null;
  const text=String(value).trim();
  if(!/^[0-9]+$/.test(text))throw new Error(`Revisa ${label}: usa pesos colombianos sin puntos ni comas.`);
  const number=Number(text);
  if(!Number.isSafeInteger(number)||number<0||number>1000000000000)throw new Error(`Revisa ${label}.`);
  return number;
}
const MAX_PICTURE_LENGTH=1400000;
const REQUEST_STATES=['abierta','en_proceso','resuelta','cancelada'];
const PROPOSAL_STATES=['activa','retirada','aceptada','por_confirmar','pendiente_confirmacion','historica','acuerdo_cancelado'];
const ISO_DATE=/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/;
function pictureOrEmpty(value){
  return typeof value==='string'&&value.length<=MAX_PICTURE_LENGTH&&/^data:image\/(?:jpeg|png|webp);base64,[a-zA-Z0-9+/=]+$/.test(value)?value:'';
}
function validTimestamp(value){return typeof value==='string'&&ISO_DATE.test(value)&&!Number.isNaN(Date.parse(value))?value:'';}
function positiveQuantity(value,label){
  const quantity=Number(value);
  if(!Number.isSafeInteger(quantity)||quantity<1||quantity>1000000)throw new Error('Indica una '+label+' válida.');
  return quantity;
}
function requiredPrice(value){
  const amount=optionalAmount(value,'el precio fijo');
  if(amount===null||amount<1)throw new Error('El precio fijo total es obligatorio y debe ser mayor que cero.');
  return amount;
}
export function normalizeRequest(input){
  const legacy=input?.category==='productos'||input?.category==='negocios';
  const category=legacy?'bienes':input?.category;
  if(!Object.hasOwn(CATEGORIES,category))throw new Error('Selecciona bien o servicio.');
  const subcategory=Object.hasOwn(SUBCATEGORIES[category],input?.subcategory)?input.subcategory:'otros';
  const budget=optionalAmount(input?.budget,'el presupuesto');
  const desiredDate=optionalText(input?.desiredDate,10,'la fecha deseada');
  if(desiredDate){const parsed=new Date(desiredDate+'T00:00:00Z');if(!/^\d{4}-\d{2}-\d{2}$/.test(desiredDate)||Number.isNaN(parsed.getTime())||parsed.toISOString().slice(0,10)!==desiredDate)throw new Error('Revisa la fecha deseada.');}
  let quantity=null,condition=null;
  if(category==='bienes'){
    if(input?.quantity!=null&&input.quantity!=='')quantity=positiveQuantity(input.quantity,'cantidad');
    else if(!legacy)throw new Error('Indica la cantidad de bienes.');
    condition=input?.condition||'cualquiera';
    if(!['nuevo','usado','cualquiera'].includes(condition))throw new Error('Selecciona la condición del bien.');
  }
  return {
    title:cleanText(input?.title,8,120,'La descripción breve'),
    city:cleanText(input?.city,2,80,'La ciudad o municipio'),
    category,subcategory,description:cleanText(input?.description,15,1500,'Los detalles'),
    budget,desiredDate,quantity,condition,picture:pictureOrEmpty(input?.picture),
    createdAt:validTimestamp(input?.createdAt),status:REQUEST_STATES.includes(input?.status)?input.status:'abierta'
  };
}
export function normalizeProposal(input,{legacy=false}={}){
  const price=input?.price==null||input.price===''?legacy?null:requiredPrice(input?.price):requiredPrice(input.price);
  const quantity=positiveQuantity(input?.quantity==null||input.quantity===''?1:input.quantity,'cantidad ofrecida');
  if(price!=null&&price%quantity!==0)throw new Error('El precio total debe permitir un precio unitario en pesos enteros.');
  let status=PROPOSAL_STATES.includes(input?.status)?input.status:'activa';
  if(price===null)status='historica';
  return {
    id:typeof input?.id==='string'&&input.id.length<=120?input.id:'',
    name:cleanText(input?.name,2,80,'El nombre'),
    description:cleanText(input?.description,15,1500,'La propuesta'),
    requestId:cleanText(input?.requestId,1,120,'La solicitud'),
    price,quantity,delivery:optionalText(input?.delivery,120,'el plazo'),
    exclusions:optionalText(input?.exclusions,300,'las exclusiones'),
    warranty:optionalText(input?.warranty,300,'la garantía'),
    picture:pictureOrEmpty(input?.picture),
    status,discarded:input?.discarded===true,
    createdAt:validTimestamp(input?.createdAt),updatedAt:validTimestamp(input?.updatedAt),
    acceptedQuantity:Number.isSafeInteger(input?.acceptedQuantity)&&input.acceptedQuantity>0?input.acceptedQuantity:0,
    pendingQuantity:Number.isSafeInteger(input?.pendingQuantity)&&input.pendingQuantity>0?input.pendingQuantity:0,
    priceHistory:Array.isArray(input?.priceHistory)?input.priceHistory.slice(-30).filter(v=>Number.isSafeInteger(v.price)&&v.price>0&&validTimestamp(v.at)).map(v=>({price:v.price,at:v.at})):[]
  };
}
export const proposalUnitPrice=proposal=>proposal.price==null?Number.POSITIVE_INFINITY:proposal.price/proposal.quantity;
export function sortProposals(proposals,category){
  return [...proposals].sort((a,b)=>{
    const aPrice=category==='bienes'?proposalUnitPrice(a):a.price??Number.POSITIVE_INFINITY;
    const bPrice=category==='bienes'?proposalUnitPrice(b):b.price??Number.POSITIVE_INFINITY;
    return aPrice-bPrice||String(a.createdAt||'').localeCompare(String(b.createdAt||''))||a.name.localeCompare(b.name,'es');
  });
}
function newId(prefix){return prefix+'-'+(globalThis.crypto?.randomUUID?.()||Date.now()+'-'+Math.random().toString(36).slice(2));}
export function appendProposal(proposals,input){
  const proposal=normalizeProposal(input);
  const reserved=['activa','por_confirmar','pendiente_confirmacion','aceptada'];
  if(proposals.some(p=>p.requestId===proposal.requestId&&p.name.toLocaleLowerCase('es')===proposal.name.toLocaleLowerCase('es')&&reserved.includes(p.status||'activa')))
    throw new Error('Ya tienes una propuesta para esta necesidad. Puedes modificarla o retirarla.');
  return [...proposals,{...proposal,id:newId('propuesta'),status:'activa',createdAt:new Date().toISOString(),updatedAt:new Date().toISOString()}];
}
export function changeProposal(proposals,id,changes){
  const original=proposals.find(p=>p.id===id);
  if(!original||original.status!=='activa')throw new Error('Esta propuesta no se puede modificar.');
  const next=normalizeProposal({...original,...changes,id:original.id});
  const at=new Date().toISOString();
  const priceHistory=original.price!==next.price&&original.price!=null?[...original.priceHistory,{price:original.price,at}].slice(-30):original.priceHistory;
  return proposals.map(p=>p.id===id?{...next,priceHistory,createdAt:original.createdAt,updatedAt:at}:p);
}
export function withdrawProposal(proposals,id){
  const found=proposals.find(p=>p.id===id);
  if(!found||!['activa','por_confirmar','pendiente_confirmacion'].includes(found.status))throw new Error('Solo se puede retirar una propuesta no aceptada.');
  return proposals.map(p=>p.id===id?{...p,status:'retirada',pendingQuantity:0}:p);
}
export function discardProposal(proposals,id,discarded){
  if(!proposals.some(p=>p.id===id))throw new Error('La propuesta no existe.');
  return proposals.map(p=>p.id===id?{...p,discarded:!!discarded}:p);
}
export function requestedRemaining(request,proposals){
  if(request.category!=='bienes')return proposals.some(p=>p.requestId===request.id&&p.status==='aceptada')?0:1;
  const committed=proposals.filter(p=>p.requestId===request.id&&['aceptada','por_confirmar'].includes(p.status))
    .reduce((sum,p)=>sum+(p.status==='aceptada'?p.acceptedQuantity:p.pendingQuantity),0);
  return Math.max(0,(request.quantity||1)-committed);
}
export function acceptProposal(proposals,request,id,quantity){
  if(request.status!=='abierta')throw new Error('La necesidad no está abierta.');
  const found=proposals.find(p=>p.id===id&&p.requestId===request.id);
  if(!found||found.status!=='activa'||found.price==null)throw new Error('Selecciona una propuesta activa con precio confirmado.');
  const remaining=requestedRemaining(request,proposals);
  const selected=request.category==='bienes'?positiveQuantity(quantity,'cantidad a aceptar'):1;
  if(selected>remaining||selected>found.quantity)throw new Error('La cantidad excede las unidades disponibles.');
  const partial=request.category==='bienes'&&selected<found.quantity;
  return proposals.map(p=>p.id===id?{...p,status:partial?'por_confirmar':'aceptada',acceptedQuantity:partial?0:selected,pendingQuantity:partial?selected:0}:p);
}
export function confirmPartial(proposals,id){
  const found=proposals.find(p=>p.id===id);
  if(!found||found.status!=='por_confirmar')throw new Error('La venta parcial no está pendiente.');
  return proposals.map(p=>p.id===id?{...p,status:'aceptada',acceptedQuantity:found.pendingQuantity,pendingQuantity:0}:p);
}
export function reopenCanceled(requests,proposals,id){
  const found=requests.find(r=>r.id===id);
  if(!found||!['cancelada','en_proceso'].includes(found.status))throw new Error('Esta necesidad no se puede reabrir.');
  return {
    requests:requests.map(r=>r.id===id?{...r,status:'abierta'}:r),
    proposals:proposals.map(p=>p.requestId===id&&p.status==='activa'?{...p,status:'pendiente_confirmacion'}:
      p.requestId===id&&['aceptada','por_confirmar'].includes(p.status)?{...p,status:'acuerdo_cancelado',acceptedQuantity:0,pendingQuantity:0}:p)
  };
}
export function confirmOldProposal(proposals,id){
  const found=proposals.find(p=>p.id===id);
  if(!found||found.status!=='pendiente_confirmacion')throw new Error('La propuesta no necesita confirmación.');
  return proposals.map(p=>p.id===id?{...p,status:'activa',updatedAt:new Date().toISOString()}:p);
}
const DRAFT_FIELDS=Object.freeze({title:120,city:80,category:24,subcategory:40,description:1500,budget:20,quantity:12,condition:24,desiredDate:10});
export function buildDraft(input){
  const draft={};
  for(const [key,max] of Object.entries(DRAFT_FIELDS)){
    const value=input?.[key];
    draft[key]=typeof value==='string'?value.slice(0,max):(value==null?'':String(value).slice(0,max));
  }
  if(!Object.hasOwn(CATEGORIES,draft.category))draft.category='bienes';
  if(!Object.hasOwn(SUBCATEGORIES[draft.category],draft.subcategory))draft.subcategory='otros';
  if(!['nuevo','usado','cualquiera'].includes(draft.condition))draft.condition='cualquiera';
  draft.picture=pictureOrEmpty(input?.picture);
  return draft;
}
export function updateLocalRequestStatus(requests,id,status){
  if(!['resuelta','cancelada','en_proceso'].includes(status))throw new Error('Estado no válido.');
  const found=requests.find(r=>r.id===id);
  if(!found)throw new Error('No se encontró la solicitud.');
  if(!['abierta','en_proceso'].includes(found.status)||found.status==='en_proceso'&&status==='en_proceso')throw new Error('Solo se pueden cerrar solicitudes abiertas o en proceso.');
  return requests.map(r=>r.id===id?{...r,status}:r);
}
export function decodeState(raw){
  const state={version:1,requests:[],proposals:[],provider:null,name:'',draft:null,proposalDraft:null,favorites:[],seen:{},reports:[]};
  if(!raw)return state;
  let parsed;try{parsed=JSON.parse(raw);}catch{return state;}
  if(!parsed||typeof parsed!=='object'||parsed.version!==1)return state;
  if(Array.isArray(parsed.requests)){
    const ids=new Set(EXAMPLES.map(r=>r.id));
    for(const item of parsed.requests.slice(0,50)){
      try{const normalized=normalizeRequest(item),id=cleanText(item.id,1,120,'El identificador');if(ids.has(id))continue;ids.add(id);state.requests.push({...normalized,id});}catch{}
    }
  }
  const requestIds=new Set([...EXAMPLES,...state.requests].map(r=>r.id));
  if(Array.isArray(parsed.proposals)){
    for(const item of parsed.proposals.slice(0,900)){
      try{
        if(!requestIds.has(item.requestId))continue;
        const proposal=normalizeProposal(item,{legacy:true});
        const id=proposal.id||'legacy-'+state.proposals.length+'-'+proposal.requestId;
        state.proposals.push({...proposal,id});
      }catch{}
    }
  }
  if(parsed.draft&&typeof parsed.draft==='object'&&parsed.draft.data&&typeof parsed.draft.data==='object'){
    const editingRequestId=typeof parsed.draft.editingRequestId==='string'&&state.requests.some(r=>r.id===parsed.draft.editingRequestId&&r.status==='abierta')?parsed.draft.editingRequestId:null;
    state.draft={data:buildDraft(parsed.draft.data),editingRequestId};
  }
  if(parsed.proposalDraft&&typeof parsed.proposalDraft==='object'){
    const draft=parsed.proposalDraft;
    if(typeof draft.requestId==='string'&&requestIds.has(draft.requestId)){
      state.proposalDraft={requestId:draft.requestId,name:typeof draft.name==='string'?draft.name.slice(0,80):'',description:typeof draft.description==='string'?draft.description.slice(0,1500):'',price:typeof draft.price==='string'?draft.price.slice(0,20):'',quantity:typeof draft.quantity==='string'?draft.quantity.slice(0,10):'',delivery:typeof draft.delivery==='string'?draft.delivery.slice(0,120):'',warranty:typeof draft.warranty==='string'?draft.warranty.slice(0,300):'',exclusions:typeof draft.exclusions==='string'?draft.exclusions.slice(0,300):'',picture:pictureOrEmpty(draft.picture)};
    }
  }
  if(typeof parsed.name==='string'&&parsed.name.trim().length>=2&&parsed.name.length<=40)state.name=parsed.name.trim();
  if(parsed.provider){try{state.provider={name:cleanText(parsed.provider.name,2,80,'El nombre'),specialty:cleanText(parsed.provider.specialty,3,120,'La especialidad'),city:cleanText(parsed.provider.city,2,80,'La ciudad')};}catch{}}
  if(Array.isArray(parsed.favorites))state.favorites=[...new Set(parsed.favorites.filter(id=>requestIds.has(id)))].slice(0,200);
  if(parsed.seen&&typeof parsed.seen==='object'&&!Array.isArray(parsed.seen))for(const [id,at] of Object.entries(parsed.seen))if(requestIds.has(id)&&validTimestamp(at))state.seen[id]=at;
  if(Array.isArray(parsed.reports))state.reports=parsed.reports.slice(-30).filter(v=>v&&typeof v==='object').map(v=>({requestId:String(v.requestId||'').slice(0,120),reason:String(v.reason||'').slice(0,300),at:validTimestamp(v.at)}));
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
  let currentCategory='all';let currentSubcategory='all';let currentCity='all';let searchQuery='';let wizardPicture='';let proposalPicture='';let editingProposalId=null;let currentRequestId=null;let toastTimeout;let wizardStep=0;let editingRequestId=null;let draftTimer;let wizardSubmitted=false;
  const grid=$('#request-grid');
  const records=()=>[...state.requests,...EXAMPLES.map(example=>({...example,status:'abierta'}))];
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
    [...grid.children].forEach(card=>{
      const request=findRequest(card.dataset.id);
      const text=`${request?.title||''} ${request?.description||''} ${request?.city||''}`.toLocaleLowerCase('es');
      card.hidden=!request||request.status!=='abierta'||(currentCity!=='all'&&request.city.toLocaleLowerCase('es')!==currentCity.toLocaleLowerCase('es'))||(category!=='all'&&request.category!==category)||(currentSubcategory!=='all'&&request.subcategory!==currentSubcategory)||(searchQuery&&!text.includes(searchQuery));
      if(!card.hidden)visible++;
    });
    $('#empty-state').hidden=visible>0;
    $('#filter-status').textContent=`${visible} ${visible===1?'solicitud disponible':'solicitudes disponibles'}.`;
  }
  function populateCities(){
    const select=$('#list-city');const cities=[...new Set(records().filter(r=>r.status==='abierta').map(r=>r.city))].sort((a,b)=>a.localeCompare(b,'es'));
    select.replaceChildren(new Option('Todas las ciudades','all'),...cities.map(city=>new Option(city,city)));
    if(cities.includes(currentCity))select.value=currentCity;else currentCity='all';
  }
  function populateSubcategories(){
    const select=$('#list-subcategory');
    const values=currentCategory==='all'?Object.entries(SUBCATEGORIES).flatMap(([,items])=>Object.entries(items)):Object.entries(SUBCATEGORIES[currentCategory]);
    const options=[new Option('Todas las categorías','all')];
    for(const [value,label] of values)if(!options.some(item=>item.value===value))options.push(new Option(label,value));
    select.replaceChildren(...options);
    if(options.some(option=>option.value===currentSubcategory))select.value=currentSubcategory;
    else currentSubcategory='all';
  }
  function populatePublishSubcategories(){
    const kind=$('#request-category').value;
    const choices=Object.entries(SUBCATEGORIES[kind]);
    const select=$('#request-subcategory');
    select.replaceChildren(...choices.map(([value,label])=>new Option(label,value)));
    const goods=kind==='bienes';
    $('#goods-fields').hidden=!goods;
    for(const element of $('#goods-fields').querySelectorAll('input,select')){
      element.disabled=!goods;
      element.required=goods;
    }
  }

  const money=value=>new Intl.NumberFormat('es-CO',{style:'currency',currency:'COP',maximumFractionDigits:0}).format(value);
  const formatDate=value=>validTimestamp(value)?new Date(value).toLocaleDateString('es-CO',{year:'numeric',month:'short',day:'numeric'}):'Sin fecha registrada';
  const el=(tag,className,textValue)=>{
    const node=document.createElement(tag);
    if(className)node.className=className;
    if(textValue!=null)node.textContent=String(textValue);
    return node;
  };
  function pictureNode(data,caption){
    if(!data)return null;
    const img=document.createElement('img');
    img.src=data;img.alt=caption;img.loading='lazy';img.className='uploaded-picture';
    return img;
  }
  function addUserCard(request){
    const article=el('article','request-card');article.dataset.id=request.id;article.dataset.kind=request.category;article.dataset.userRequest='true';
    const photo=el('div','card-photo new-request-photo');
    const image=pictureNode(request.picture,'Fotografía de la necesidad');
    if(image)photo.append(image);else{photo.setAttribute('aria-hidden','true');photo.append(svg('box','step-icon'));}
    const content=el('div','card-content');
    const category=el('p','category',CATEGORIES[request.category]+' · '+(SUBCATEGORIES[request.category]?.[request.subcategory]||'Otra categoría'));
    const title=el('h3','',request.title),city=el('p','card-city');city.append(svg('pin'),document.createTextNode(request.city));
    const date=el('p','card-published',request.createdAt?'Publicada: '+formatDate(request.createdAt):'');
    const btn=el('button','card-link','Ver solicitud ');btn.dataset.request=request.id;btn.append(svg('arrow'));
    const fav=el('button','my-action favorite-toggle',state.favorites.includes(request.id)?'★ Guardada':'☆ Guardar');
    fav.type='button';fav.dataset.favorite=request.id;fav.setAttribute('aria-pressed',String(state.favorites.includes(request.id)));
    content.append(category,title,city,date,btn,fav);article.append(photo,content);return article;
  }
  function renderOwnRequests(){
    grid.querySelectorAll('[data-user-request]').forEach(card=>card.remove());
    const fragment=document.createDocumentFragment();state.requests.forEach(request=>fragment.append(addUserCard(request)));grid.prepend(fragment);
    populateCities();applyFilter();renderMyRequests();renderMyProposals();renderFavorites();
  }
  function renderMyRequests(){
    const container=$('#my-requests-grid'),requests=state.requests;
    $('#my-count').textContent=requests.length?'('+requests.length+')':'';
    $('#my-empty').hidden=requests.length>0;
    container.replaceChildren(...requests.map(request=>{
      const article=el('article','my-card'),top=el('div','my-card-top');
      const title=el('h3','',request.title),status=el('span','my-state my-state-'+request.status,
        ({resuelta:'Resuelta',cancelada:'Cancelada',en_proceso:'En proceso',abierta:'Abierta'})[request.status]);
      top.append(title,status);
      const offers=state.proposals.filter(p=>p.requestId===request.id&&!['retirada','historica','acuerdo_cancelado'].includes(p.status));
      const unread=offers.filter(p=>p.createdAt&&!state.seen[request.id]||p.createdAt&&state.seen[request.id]&&p.createdAt>state.seen[request.id]).length;
      const info=el('p','my-card-info',request.city+' · '+CATEGORIES[request.category]+' · '+offers.length+' propuestas'+(unread?' · '+unread+' nuevas':''));
      const actions=el('div','my-card-actions');
      const choices=[['view','Ver detalles'],...(request.status==='abierta'?[['edit','Editar'],['resolve','Marcar resuelta'],['cancel','Cancelar']]:[]),...(request.status==='en_proceso'?[['resolve','Marcar resuelta'],['reopen','Reabrir ofertas'],['cancel','Cancelar']]:[]),...(request.status==='cancelada'?[['reopen','Reactivar']]:[])];
      for(const [action,label] of choices){const button=el('button','my-action',label);button.type='button';button.dataset.action=action;button.dataset.id=request.id;actions.append(button);}
      article.append(top,info,actions);return article;
    }));
  }
  function renderFavorites(){
    const list=$('#favorites-grid');
    list.replaceChildren(...state.favorites.map(id=>findRequest(id)).filter(r=>r&&r.status==='abierta').map(r=>{
      const item=el('article','my-card'),title=el('h3','',r.title),city=el('p','my-card-info',r.city);
      const view=el('button','my-action','Ver solicitud');view.dataset.request=r.id;
      const remove=el('button','my-action','Quitar de favoritos');remove.dataset.favorite=r.id;
      item.append(title,city,view,remove);return item;
    }));
    $('#favorites-empty').hidden=list.children.length>0;
  }
  function renderMyProposals(){
    const list=$('#my-proposals-grid'),name=state.provider?.name||state.name;
    const mine=state.proposals.filter(p=>name&&p.name.toLocaleLowerCase('es')===name.toLocaleLowerCase('es'));
    list.replaceChildren(...mine.map(p=>{
      const req=findRequest(p.requestId),item=el('article','my-card'),header=el('h3','',req?.title||'Necesidad');
      const status=el('p','my-card-info','Estado: '+labelProposal(p.status)+' · '+(p.price==null?'Sin precio registrado':money(p.price)));
      const actions=el('div','my-card-actions');
      for(const [action,text] of [['view','Ver necesidad'],...(['activa','pendiente_confirmacion','por_confirmar'].includes(p.status)?[['edit','Modificar'],['withdraw','Retirar']]:[]),...(p.status==='pendiente_confirmacion'?[['confirm-old','Confirmar precio']]:[]),...(p.status==='por_confirmar'?[['confirm-partial','Confirmar venta parcial']]:[])]){
        const button=el('button','my-action',text);
        button.dataset.proposalAction=action;button.dataset.id=p.id;actions.append(button);
      }
      item.append(header,status,actions);return item;
    }));
    $('#my-proposals-empty').hidden=mine.length>0;
  }
  function changeOwnStatus(id,status){
    try{
      const requests=updateLocalRequestStatus(state.requests,id,status);
      const proposals=status==='cancelada'?state.proposals.map(p=>p.requestId===id&&p.status==='activa'?{...p,status:'pendiente_confirmacion'}:p):state.proposals;
      const next={...state,requests,proposals,draft:state.draft?.editingRequestId===id?null:state.draft};
      if(!save(next,'detail-error'))return false;
      renderOwnRequests();return true;
    }catch(e){showToast(e.message);return false;}
  }
  function labelProposal(status){
    return ({activa:'Disponible',retirada:'Retirada',aceptada:'Aceptada',por_confirmar:'Venta parcial pendiente',pendiente_confirmacion:'Precio por confirmar',historica:'Oferta antigua sin precio',acuerdo_cancelado:'Acuerdo cancelado'})[status]||status;
  }
  function showRequest(id){
    const request=findRequest(id);if(!request)return;currentRequestId=id;
    const mine=state.requests.some(r=>r.id===id);
    $('#detail-title').textContent=request.title;
    $('#detail-category').textContent=(CATEGORIES[request.category]+' · '+(SUBCATEGORIES[request.category]?.[request.subcategory]||'Otra categoría')).toLocaleUpperCase('es');
    $('#detail-city').textContent=request.city;
    $('#detail-description').textContent=request.description;
    const photo=$('#detail-photo');photo.replaceChildren();
    const image=pictureNode(request.picture,'Imagen proporcionada por el comprador');if(image)photo.append(image);
    photo.hidden=!image;
    const meta=[];
    if(request.category==='bienes'){if(request.quantity)meta.push('Cantidad solicitada: '+request.quantity);meta.push('Condición: '+({nuevo:'Nuevo',usado:'Segunda mano',cualquiera:'Cualquiera'})[request.condition]);}
    meta.push(request.budget!=null?'Presupuesto máximo orientativo: '+money(request.budget):'Presupuesto: sin indicar');
    if(request.desiredDate)meta.push('Fecha deseada: '+request.desiredDate);
    if(request.createdAt)meta.push('Publicada: '+formatDate(request.createdAt));
    if(request.status!=='abierta')meta.push('Estado: '+({resuelta:'Resuelta',cancelada:'Cancelada',en_proceso:'En proceso'})[request.status]);
    if(mine&&request.category==='bienes')meta.push('Unidades pendientes: '+requestedRemaining(request,state.proposals));
    $('#detail-meta').replaceChildren(...meta.map(t=>el('li','',t)));
    const all=state.proposals.filter(p=>p.requestId===id);
    const name=state.provider?.name||state.name;
    const visible=mine?all:all.filter(p=>name&&p.name.toLocaleLowerCase('es')===name.toLocaleLowerCase('es'));
    const sorted=sortProposals(visible,request.category).sort((a,b)=>Number(a.discarded)-Number(b.discarded));
    const list=$('#detail-proposals');
    list.replaceChildren(...sorted.map(p=>{
      const item=el('li','proposal-summary'+(p.discarded?' is-discarded':''));
      const h=el('strong','',p.name+' · '+labelProposal(p.status));item.append(h);
      const price=el('p','proposal-price',p.price!=null?money(p.price)+' total'+(request.category==='bienes'?' · '+money(proposalUnitPrice(p))+' / unidad':''):'Precio sin registrar (oferta heredada)');
      const desc=el('p','',p.description+' · Cantidad: '+(request.category==='bienes'?p.quantity:'Servicio')+
        (p.delivery?' · Plazo: '+p.delivery:'')+(p.warranty?' · Garantía: '+p.warranty:'')+(p.exclusions?' · Exclusiones: '+p.exclusions:''));
      item.append(price,desc);
      if(p.picture){const image=pictureNode(p.picture,'Imagen de la propuesta');item.append(image);}
      if(p.createdAt)item.append(el('p','card-published','Presentada: '+formatDate(p.createdAt)+(p.updatedAt&&p.updatedAt!==p.createdAt?' · Modificada':'') ));
      if(p.priceHistory.length)item.append(el('p','card-published','Precios anteriores: '+p.priceHistory.map(v=>money(v.price)).join(', ')));
      const actions=el('div','proposal-actions');
      const buttons=mine?[
        ...(p.status==='activa'&&request.status==='abierta'?[['accept','Aceptar'],...(request.category==='bienes'?[['partial','Aceptar menos unidades']]:[])]:[]),
        ['chat','Conversar (próximamente)'],['report','Reportar (prueba)'],
        ['discard',p.discarded?'Recuperar':'Descartar']
      ]:p.status==='activa'?[['chat','Conversar (próximamente)'],['edit','Modificar mi oferta'],['withdraw','Retirar']]:p.status==='pendiente_confirmacion'?[['confirm-old','Confirmar precio']]:p.status==='por_confirmar'?[['confirm-partial','Confirmar cantidad']]:[];
      for(const [action,label] of buttons){const button=el('button','my-action',label);button.type='button';button.dataset.proposalAction=action;button.dataset.id=p.id;actions.append(button);}
      if(actions.children.length)item.append(actions);
      return item;
    }));
    $('#proposals-empty').hidden=visible.length>0;
    $('#detail-note').textContent=mine?
      'Comparación de prueba visible únicamente en este navegador. El acceso privado real se implementará con Firebase. '+all.length+' propuestas registradas.':
      'Solicitud ilustrativa o ajena. Solo se muestran las propuestas del perfil de prueba seleccionado en este navegador. No existe comunicación real.';
    const open=request.status==='abierta';
    $('#open-proposal').disabled=!open;
    $('#open-proposal').textContent=open?'Presentar propuesta de prueba':'No recibe nuevas propuestas';
    $('#resolve-request').hidden=!mine||!['abierta','en_proceso'].includes(request.status);
    $('#report-request').hidden=false;
    if(mine){
      const at=new Date().toISOString();
      state={...state,seen:{...state.seen,[id]:at}};
      persistState(storage,state);renderMyRequests();
    }
    openDialog('detail');
  }

  const wizardTitles=['¿Qué necesitas?','Detalles de la necesidad','Revisar y confirmar'];
  const draftFields=['title','city','category','subcategory','description','budget','quantity','condition','desiredDate'];
  function wizardData(){
    const input={};
    for(const key of draftFields){
      const item=$('#publish-form').elements.namedItem(key);
      input[key]=item&&!item.disabled?item.value:'';
    }
    input.picture=wizardPicture;
    return input;
  }
  function reviewWizard(){
    const values=wizardData();
    const rows=[
      ['Necesito',CATEGORIES[values.category]+' · '+(SUBCATEGORIES[values.category]?.[values.subcategory]||'Otra categoría')],
      ['Solicitud',values.title],
      ['Lugar',values.city],
      ['Detalles',values.description],
      ...(values.category==='bienes'?[['Cantidad',values.quantity],['Condición',values.condition]]:[]),
      ['Presupuesto',values.budget!==''?values.budget+' COP':'Prefiero recibir cotizaciones'],
      ['Fecha deseada',values.desiredDate||'Por definir'],
      ['Fotografía',values.picture?'Una fotografía adjunta':'Sin fotografía']
    ];
    const box=$('#wizard-review');
    box.replaceChildren(...rows.map(([label,value])=>{
      const row=document.createElement('p');row.className='review-row';
      const strong=document.createElement('strong');strong.textContent=label+': ';
      row.append(strong,document.createTextNode(value));return row;
    }));
  }
  function setWizardStep(step){
    wizardStep=Math.min(2,Math.max(0,step));
    $('.wizard-step').forEach((element,i)=>{element.hidden=i!==wizardStep;});
    $('#wizard-status').textContent='Paso '+(wizardStep+1)+' de 3: '+wizardTitles[wizardStep];
    $('.wizard-bars span').forEach((element,i)=>element.classList.toggle('is-complete',i<=wizardStep));
    $('#wizard-back').hidden=wizardStep===0;
    $('#wizard-next').hidden=wizardStep===2;
    $('#wizard-submit').hidden=wizardStep!==2;
    if(wizardStep===2)reviewWizard();
    const heading=$('.wizard-step[data-wizard-step="'+wizardStep+'"] .wizard-heading');
    if(heading){heading.setAttribute('tabindex','-1');heading.focus({preventScroll:true});}
  }
  function validateWizardStep(){
    const group=$('.wizard-step[data-wizard-step="'+wizardStep+'"]');
    for(const field of group.querySelectorAll('input,select,textarea')){
      if(!field.disabled&&!field.checkValidity()){field.reportValidity();return false;}
    }
    return true;
  }
  function startPublish(request=null,overrides=null,ignoreDraft=false){
    clearTimeout(draftTimer);
    wizardSubmitted=false;
    const activeDraft=!request&&!ignoreDraft&&state.draft;
    const editing=activeDraft?.editingRequestId&&state.requests.find(r=>r.id===activeDraft.editingRequestId&&r.status==='abierta');
    const values=request||activeDraft?.data||{};
    wizardPicture=pictureOrEmpty(values.picture);refreshPhotoPreview('request');
    editingRequestId=request?.id||editing?.id||null;
    const form=$('#publish-form');form.reset();
    const kind=values.category==='servicios'?'servicios':'bienes';
    $('#request-category').value=kind;populatePublishSubcategories();
    for(const key of draftFields){
      if(key==='category')continue;
      const item=form.elements.namedItem(key);
      if(item&&values[key]!=null&&values[key]!=='')item.value=String(values[key]);
    }
    if(overrides?.title)$('#request-title').value=overrides.title;
    if(overrides?.city)$('#request-city').value=overrides.city;
    $('#publish-title').textContent=editingRequestId?'Edita tu necesidad':'Publica lo que necesitas';
    $('#wizard-submit').textContent=editingRequestId?'Guardar cambios de prueba':'Guardar solicitud de prueba';
    $('#publish-error').hidden=true;$('#publish-error').textContent='';
    $('#draft-status').textContent=activeDraft&&!request?'Borrador local recuperado. Puedes continuarlo o editarlo.':'';
    $('#wizard-clear').hidden=!activeDraft||!!request;
    openDialog('publish');setWizardStep(0);
  }
  function saveWizardDraft(closeDialog=false){
    const next={...state,draft:{data:buildDraft(wizardData()),editingRequestId}};
    if(!persistState(storage,next)){
      setError('publish-error',new Error('No fue posible guardar el borrador en este navegador.'));return false;
    }
    state=next;
    $('#draft-status').textContent='Borrador guardado en este navegador.';
    if(closeDialog){clearTimeout(draftTimer);$('#publish-dialog').close();showToast('Borrador guardado. Puedes continuarlo cuando vuelvas a publicar.');}
    return true;
  }
  function scheduleDraftSave(){
    clearTimeout(draftTimer);
    draftTimer=setTimeout(()=>{
      if($('#publish-dialog').open)saveWizardDraft(false);
    },600);
  }


  function refreshPhotoPreview(kind){
    const current=kind==='request'?wizardPicture:proposalPicture;
    const box=$('#'+kind+'-photo-preview');
    box.replaceChildren();
    if(current){const image=pictureNode(current,'Fotografía seleccionada');box.append(image);}
    $('#'+kind+'-photo-remove').hidden=!current;
  }
  async function compressImage(file){
    if(!file||!['image/jpeg','image/png','image/webp'].includes(file.type)||file.size>6000000)throw new Error('Selecciona una foto JPG, PNG o WebP de hasta 6 MB.');
    return new Promise((resolve,reject)=>{
      const image=new Image();
      const reader=new FileReader();
      reader.onerror=()=>reject(new Error('No fue posible leer la fotografía.'));
      reader.onload=()=>{
        image.onerror=()=>reject(new Error('No se pudo abrir la fotografía.'));
        image.onload=()=>{
          try{
            const max=960,scale=Math.min(1,max/Math.max(image.width,image.height));
            const canvas=document.createElement('canvas');canvas.width=Math.max(1,Math.round(image.width*scale));canvas.height=Math.max(1,Math.round(image.height*scale));
            const ctx=canvas.getContext('2d');
            ctx.fillStyle='#ffffff';ctx.fillRect(0,0,canvas.width,canvas.height);ctx.drawImage(image,0,0,canvas.width,canvas.height);
            const data=canvas.toDataURL('image/jpeg',0.72);
            if(data.length>MAX_PICTURE_LENGTH)throw new Error('La imagen sigue siendo demasiado grande. Intenta otra fotografía.');
            resolve(data);
          }catch(error){reject(error);}
        };
        image.src=String(reader.result);
      };
      reader.readAsDataURL(file);
    });
  }
  for(const kind of ['request','proposal']){
    $('#'+kind+'-photo').addEventListener('change',async e=>{
      const input=e.currentTarget;
      if(!input.files?.[0])return;
      try{
        const data=await compressImage(input.files[0]);
        if(kind==='request'){wizardPicture=data;scheduleDraftSave();}
        else proposalPicture=data;
        refreshPhotoPreview(kind);
      }catch(error){showToast(error.message);}
      input.value='';
    });
    $('#'+kind+'-photo-remove').addEventListener('click',()=>{
      if(kind==='request'){wizardPicture='';scheduleDraftSave();}
      else proposalPicture='';
      refreshPhotoPreview(kind);
    });
  }
  function openProposalFor(request,proposal=null){
    currentRequestId=request.id;editingProposalId=proposal?.id||null;
    const form=$('#proposal-form');form.reset();
    $('#proposal-title').textContent=proposal?'Modificar propuesta de prueba':'Presenta una propuesta';
    $('#proposal-request-title').textContent=request.title;
    $('#proposal-name').value=proposal?.name||state.provider?.name||state.name;
    $('#proposal-name').readOnly=!!proposal;
    $('#proposal-description').value=proposal?.description||'';
    $('#proposal-price').value=proposal?.price??'';
    $('#proposal-quantity').value=proposal?.quantity||Math.min(1,request.quantity||1);
    $('#proposal-quantity-wrap').hidden=request.category!=='bienes';
    $('#proposal-quantity').disabled=request.category!=='bienes';
    $('#proposal-delivery').value=proposal?.delivery||'';
    $('#proposal-exclusions').value=proposal?.exclusions||'';
    $('#proposal-warranty').value=proposal?.warranty||'';
    proposalPicture=proposal?.picture||'';
    const draft=state.proposalDraft;
    if(!proposal&&draft?.requestId===request.id){
      $('#proposal-name').value=draft.name||$('#proposal-name').value;
      proposalPicture=draft.picture||'';
      $('#proposal-description').value=draft.description||'';
      $('#proposal-price').value=draft.price||'';
      $('#proposal-quantity').value=draft.quantity||1;
      $('#proposal-delivery').value=draft.delivery||'';
      $('#proposal-warranty').value=draft.warranty||'';
      $('#proposal-exclusions').value=draft.exclusions||'';
    }
    refreshPhotoPreview('proposal');
    openDialog('proposal');
  }
  function proposalAction(action,id){
    const proposal=state.proposals.find(p=>p.id===id);
    if(!proposal)return;
    const request=findRequest(proposal.requestId);
    if(!request)return;
    const mine=state.requests.some(r=>r.id===request.id);
    const identity=state.provider?.name||state.name;
    try{
      if(['edit','withdraw','confirm-old','confirm-partial'].includes(action)&&(!identity||identity.toLocaleLowerCase('es')!==proposal.name.toLocaleLowerCase('es'))){
        throw new Error('Selecciona el perfil local de este proveedor para administrar su propuesta.');
      }
      if(action==='chat'){
        $('#chat-context').textContent='Necesidad: '+request.title+' · Proveedor: '+proposal.name+' · Precio fijo: '+(proposal.price==null?'No registrado':money(proposal.price));
        openDialog('chat');return;
      }
      if(action==='report'){
        if(!mine)throw new Error('Este reporte de propuesta corresponde al comprador de la necesidad.');
        const reason=window.prompt('Describe el problema con esta propuesta. El reporte será una prueba local, no será enviado.');
        if(!reason?.trim())return;
        const reports=[...state.reports,{requestId:request.id,reason:('Propuesta '+proposal.name+': '+reason.trim()).slice(0,300),at:new Date().toISOString()}].slice(-30);
        if(save({...state,reports},'detail-error'))showToast('Reporte guardado localmente. Nadie ha sido notificado.');
        return;
      }
      if(action==='view'){showRequest(request.id);return;}
      if(action==='edit'){if(proposal.status!=='activa')throw new Error('Solo puedes modificar una propuesta activa.');$('#detail-dialog').close();openProposalFor(request,proposal);return;}
      if(action==='withdraw'){
        if(!window.confirm('¿Retirar esta propuesta? Se conservará en el historial.'))return;
        state={...state,proposals:withdrawProposal(state.proposals,id)};
      }else if(action==='confirm-old'){
        if(request.status!=='abierta')throw new Error('Primero debe reactivarse la necesidad.');
        if(!window.confirm('¿Confirmas que el precio fijo '+money(proposal.price)+' sigue vigente?'))return;
        state={...state,proposals:confirmOldProposal(state.proposals,id)};
      }else if(action==='confirm-partial'){
        if(!window.confirm('¿Aceptas vender '+proposal.pendingQuantity+' unidades al precio unitario de '+money(proposalUnitPrice(proposal))+'?'))return;
        const proposals=confirmPartial(state.proposals,id);
        const requests=request.status==='abierta'&&requestedRemaining(request,proposals)===0?updateLocalRequestStatus(state.requests,request.id,'en_proceso'):state.requests;
        state={...state,proposals,requests};
      }else if(action==='discard'){
        if(!mine)throw new Error('Solo el comprador puede organizar las propuestas de su necesidad.');
        state={...state,proposals:discardProposal(state.proposals,id,!proposal.discarded)};
      }else if(action==='accept'||action==='partial'){
        if(!mine)throw new Error('Solo el comprador de esta necesidad puede aceptar una propuesta.');
        if(request.status!=='abierta')throw new Error('La necesidad ya no recibe ofertas.');
        const remaining=requestedRemaining(request,state.proposals);
        let qty=request.category==='bienes'?Math.min(proposal.quantity,remaining):1;
        if(action==='partial'){
          const answer=window.prompt('¿Cuántas unidades deseas aceptar de esta propuesta? (máximo '+Math.min(proposal.quantity,remaining)+')',String(qty));
          if(answer==null)return;
          qty=positiveQuantity(answer,'cantidad');
        }
        const summary='Proveedor: '+proposal.name+'\nCantidad: '+qty+'\nPrecio total: '+money(proposalUnitPrice(proposal)*qty)+'\n'+(qty<proposal.quantity?'Necesita confirmación del proveedor.':'La propuesta quedará aceptada.')+'\n¿Continuar?';
        if(!window.confirm(summary))return;
        const proposals=acceptProposal(state.proposals,request,id,qty);
        let requests=state.requests;
        if(requestedRemaining(request,proposals)===0&&!proposals.some(p=>p.requestId===id&&p.status==='por_confirmar')){
          requests=updateLocalRequestStatus(state.requests,request.id,'en_proceso');
        }
        state={...state,proposals,requests};
      }else return;
      if(!persistState(storage,state))throw new Error('No se pudo guardar el cambio.');
      renderOwnRequests();if($('#detail-dialog').open)showRequest(request.id);
      showToast('Cambio guardado en esta demostración local.');
    }catch(error){showToast(error.message);}
  }
  $('[data-open]').forEach(button=>button.addEventListener('click',()=>{
    const kind=button.dataset.open;
    if(kind==='provider'&&state.provider){$('#provider-name').value=state.provider.name;$('#provider-specialty').value=state.provider.specialty;$('#provider-city').value=state.provider.city;}
    if(kind==='access')$('#access-name').value=state.name;
    if(kind==='publish')startPublish();else openDialog(kind);
  }));
  $$('.close-dialog').forEach(button=>button.addEventListener('click',()=>button.closest('dialog').close()));
  $$('dialog').forEach(dialog=>dialog.addEventListener('click',event=>{
    if(event.target!==dialog)return;const bounds=dialog.getBoundingClientRect();
    if(event.clientX<bounds.left||event.clientX>bounds.right||event.clientY<bounds.top||event.clientY>bounds.bottom)dialog.close();
  }));
  $$('.filter').forEach(button=>button.addEventListener('click',()=>{currentCategory=button.dataset.category;currentSubcategory='all';populateSubcategories();applyFilter();}));
  $('#list-subcategory').addEventListener('change',e=>{currentSubcategory=e.target.value;applyFilter();});
  $('#list-city').addEventListener('change',e=>{currentCity=e.target.value;applyFilter();});
  $('#request-search').addEventListener('input',e=>{searchQuery=e.target.value.trim().toLocaleLowerCase('es').slice(0,120);applyFilter();});
  $('#request-category').addEventListener('change',populatePublishSubcategories);
  $('#resolve-request').addEventListener('click',()=>{
    const request=state.requests.find(r=>r.id===currentRequestId);
    if(!request||!['abierta','en_proceso'].includes(request.status))return;
    if(!window.confirm('¿Confirmas que ya recibiste el producto o se completó el servicio?'))return;
    if(!changeOwnStatus(request.id,'resuelta'))return;
    $('#detail-dialog').close();showToast('Necesidad resuelta. Se conserva en tu historial local.');
  });
  $('#report-request').addEventListener('click',()=>{
    const reason=window.prompt('Describe qué quieres reportar. Esta prueba guarda el reporte solo en tu navegador: nadie lo recibirá.');
    if(!reason?.trim())return;
    const reports=[...state.reports,{requestId:currentRequestId,reason:reason.trim().slice(0,300),at:new Date().toISOString()}].slice(-30);
    if(save({...state,reports},'detail-error'))showToast('Reporte de prueba guardado localmente. NO ha sido enviado a ningún equipo.');
  });
  $$('[data-explore]').forEach(link=>link.addEventListener('click',()=>{currentCategory='all';currentSubcategory='all';currentCity='all';searchQuery='';$('#request-search').value='';populateSubcategories();populateCities();applyFilter();}));
  $$('.mobile-nav a,.mobile-nav button').forEach(link=>link.addEventListener('click',()=>{$('.mobile-nav').open=false;}));
  $('#hero-form').addEventListener('submit',event=>{
    event.preventDefault();
    startPublish(null,{title:$('#hero-need').value.trim(),city:$('#hero-city').value.trim()});
  });
  $('#wizard-next').addEventListener('click',()=>{
    if(validateWizardStep()){saveWizardDraft(false);setWizardStep(wizardStep+1);}
  });
  $('#wizard-back').addEventListener('click',()=>setWizardStep(wizardStep-1));
  $('#wizard-draft').addEventListener('click',()=>saveWizardDraft(true));
  $('#wizard-clear').addEventListener('click',()=>{
    if(!window.confirm('¿Descartar el borrador guardado y comenzar una nueva solicitud?'))return;
    clearTimeout(draftTimer);
    const next={...state,draft:null};
    if(!persistState(storage,next)){setError('publish-error',new Error('No se pudo borrar el borrador.'));return;}
    state=next;startPublish(null,null,true);
  });
  $('#publish-dialog').addEventListener('close',()=>{
    clearTimeout(draftTimer);
    if(wizardSubmitted){wizardSubmitted=false;return;}
    const data=buildDraft(wizardData());
    if(data.title.trim()||data.city.trim()||data.description.trim()||data.picture)saveWizardDraft(false);
  });
  $('#publish-form').addEventListener('keydown',event=>{
    if(event.key==='Enter'&&wizardStep<2&&event.target.matches('input:not([type=checkbox]):not([type=file])')){
      event.preventDefault();$('#wizard-next').click();
    }
  });
  $('#publish-form').addEventListener('input',scheduleDraftSave);
  $('#publish-form').addEventListener('change',scheduleDraftSave);
  $('#publish-form').addEventListener('submit',event=>{
    event.preventDefault();
    if(wizardStep!==2||!validateWizardStep())return;
    try{
      const previous=editingRequestId?state.requests.find(item=>item.id===editingRequestId):null;
      if(editingRequestId&&!previous)throw new Error('La solicitud que editabas ya no está disponible.');
      if(previous&&previous.status!=='abierta')throw new Error('Una solicitud cerrada no puede editarse.');
      if(!previous&&state.requests.length>=50)throw new Error('Esta demostración admite hasta 50 solicitudes en este navegador.');
      const request=normalizeRequest({...wizardData(),createdAt:previous?.createdAt||new Date().toISOString(),status:previous?.status||'abierta'});
      const id=previous?.id||newId('local');
      const requests=previous?state.requests.map(item=>item.id===id?{...request,id}:item):[{...request,id},...state.requests];
      if(!save({...state,requests,draft:null},'publish-error'))return;
      clearTimeout(draftTimer);editingRequestId=null;wizardSubmitted=true;
      $('#publish-dialog').close();event.currentTarget.reset();populatePublishSubcategories();$('#hero-form').reset();setWizardStep(0);
      currentCategory='all';currentSubcategory='all';currentCity='all';populateSubcategories();renderOwnRequests();
      $('#mis-necesidades').scrollIntoView({block:'start'});
      showToast(previous?'Necesidad de prueba actualizada.':'Necesidad de prueba guardada. La publicación real requerirá identificarte con Firebase.');
    }catch(error){setError('publish-error',error);}
  });
  $('#my-requests-grid').addEventListener('click',event=>{
    const button=event.target.closest('[data-action][data-id]');if(!button)return;
    const id=button.dataset.id,request=state.requests.find(r=>r.id===id);if(!request)return;
    const action=button.dataset.action;
    if(action==='view'){showRequest(id);return;}
    if(action==='edit'&&request.status==='abierta'){startPublish(request);return;}
    if(action==='resolve'&&window.confirm('¿Confirmas que el producto fue entregado o el servicio terminó?')){
      if(changeOwnStatus(id,'resuelta'))showToast('Necesidad resuelta.');
    }else if(action==='cancel'&&window.confirm('¿Cancelar esta necesidad de prueba? Se conservará en tu historial.')){
      if(changeOwnStatus(id,'cancelada'))showToast('Necesidad cancelada.');
    }else if(action==='reopen'&&window.confirm('¿Reabrir la necesidad? Los precios anteriores necesitarán confirmación del proveedor.')){
      try{
        const next=reopenCanceled(state.requests,state.proposals,id);
        if(save({...state,...next},'detail-error')){renderOwnRequests();showToast('Necesidad reactivada. Precios anteriores pendientes de confirmación.');}
      }catch(error){showToast(error.message);}
    }
  });
  grid.addEventListener('click',event=>{
    const fav=event.target.closest('[data-favorite]');if(fav){event.preventDefault();toggleFavorite(fav.dataset.favorite);return;}
    const button=event.target.closest('[data-request]');if(button)showRequest(button.dataset.request);
  });
  function toggleFavorite(id){
    const favorites=state.favorites.includes(id)?state.favorites.filter(v=>v!==id):[...state.favorites,id];
    if(persistState(storage,{...state,favorites})){state={...state,favorites};renderOwnRequests();}
    else showToast('No se pudieron guardar los favoritos.');
  }
  $('#favorites-grid').addEventListener('click',e=>{
    const fav=e.target.closest('[data-favorite]');if(fav){toggleFavorite(fav.dataset.favorite);return;}
    const view=e.target.closest('[data-request]');if(view)showRequest(view.dataset.request);
  });
  $('#my-proposals-grid').addEventListener('click',e=>{const btn=e.target.closest('[data-proposal-action]');if(btn)proposalAction(btn.dataset.proposalAction,btn.dataset.id);});
  $('#detail-proposals').addEventListener('click',e=>{const btn=e.target.closest('[data-proposal-action]');if(btn)proposalAction(btn.dataset.proposalAction,btn.dataset.id);});
  $('#open-proposal').addEventListener('click',()=>{
    const request=findRequest(currentRequestId);if(!request||request.status!=='abierta')return;
    $('#detail-dialog').close();openProposalFor(request);
  });
  $('#proposal-save-draft').addEventListener('click',()=>{
    const form=$('#proposal-form');
    const data=Object.fromEntries(new FormData(form));
    const draft={...data,requestId:currentRequestId,picture:proposalPicture};
    if(persistState(storage,{...state,proposalDraft:draft})){
      state={...state,proposalDraft:draft};$('#proposal-dialog').close();showToast('Borrador de propuesta guardado solo en este navegador.');
    }else showToast('No se pudo guardar el borrador de propuesta.');
  });
  $('#proposal-form').addEventListener('submit',event=>{
    event.preventDefault();
    try{
      const request=findRequest(currentRequestId);
      if(!request)throw new Error('Selecciona una solicitud válida.');
      if(request.status!=='abierta')throw new Error('Esta necesidad no recibe nuevas propuestas.');
      const values={...Object.fromEntries(new FormData(event.currentTarget)),requestId:currentRequestId,picture:proposalPicture,quantity:request.category==='bienes'?$('#proposal-quantity').value:'1'};
      const proposals=editingProposalId?changeProposal(state.proposals,editingProposalId,values):appendProposal(state.proposals,values);
      const profile=state.provider||{name:values.name,specialty:'Ofertas de prueba',city:request.city};
      if(!save({...state,proposals,provider:profile,proposalDraft:null},'proposal-error'))return;
      editingProposalId=null;$('#proposal-dialog').close();event.currentTarget.reset();renderOwnRequests();showRequest(currentRequestId);
      showToast('Propuesta de prueba guardada localmente. No se ha enviado a ningún comprador.');
    }catch(error){setError('proposal-error',error);}
  });
  $('#provider-form').addEventListener('submit',event=>{
    event.preventDefault();
    try{
      const values=Object.fromEntries(new FormData(event.currentTarget));
      const provider={name:cleanText(values.name,2,80,'El nombre'),specialty:cleanText(values.specialty,3,120,'La especialidad'),city:cleanText(values.city,2,80,'La ciudad')};
      if(!save({...state,provider},'provider-error'))return;
      $('#provider-dialog').close();renderMyProposals();showToast('Perfil de proveedor de prueba guardado en este navegador. No verifica tu identidad.');
      $('#necesidades').scrollIntoView({block:'start'});
    }catch(error){setError('provider-error',error);}
  });
  $('#access-form').addEventListener('submit',event=>{
    event.preventDefault();
    try{
      const name=cleanText(new FormData(event.currentTarget).get('name'),2,40,'El nombre');
      if(!save({...state,name},'access-error'))return;
      updateAccess();renderMyProposals();$('#access-dialog').close();showToast('Bienvenido, '+name+'. Este acceso es una simulación local, no una cuenta real.');
    }catch(error){setError('access-error',error);}
  });
  populatePublishSubcategories();populateSubcategories();populateCities();updateAccess();renderOwnRequests();

}

if(typeof document!=='undefined')init();
