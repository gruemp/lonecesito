import {cleanPublication, whatsappUrl, canManage, normalizeWhatsApp} from './simple-model.js';

const $ = id => document.getElementById(id);
const pages = ['inicio', 'necesidades', 'mis-publicaciones', 'publicar'];
const STORAGE = 'lonecesito-publicaciones-demo-v1';
const state = {
  mode:'loading', user:null, uid:null, items:[], editingId:null, picture:'',
  firebase:null, waitingForAuth:false, saving:false, imageBusy:false
};
const el = (tag, cls, value) => {
  const node = document.createElement(tag);
  if(cls) node.className = cls;
  if(value !== undefined) node.textContent = String(value);
  return node;
};
const fmt = value => new Intl.NumberFormat('es-CO', {style:'currency',currency:'COP',maximumFractionDigits:0}).format(value);
let toastTimer;
function toast(message){
  const box = $('toast');
  box.textContent = message;
  box.hidden = false;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {box.hidden=true;}, 4800);
}
function feedback(id, message){
  const node = $(id);
  node.textContent = message || '';
  node.hidden = !message;
}
function currentUid(){return state.mode === 'demo' ? 'demo-browser' : state.user?.uid || null;}
function readLocal(){
  try {
    const data=JSON.parse(localStorage.getItem(STORAGE) || '[]');
    return Array.isArray(data) ? data.slice(0,300) : [];
  }catch {return [];}
}
function saveLocal(items){
  localStorage.setItem(STORAGE,JSON.stringify(items));
  state.items=items;
  render();
}
function readablePhone(phone){try{return '+'+normalizeWhatsApp(phone);}catch{return '';}}
function showView(){
  const hash=window.location.hash.replace(/^#/,'');
  const screen=pages.includes(hash)?hash:'inicio';
  if(screen==='publicar'&&state.mode==='cloud'&&!state.user){
    state.waitingForAuth=true;
    showAuth();
    window.location.hash='#inicio';
    return;
  }
  for(const name of pages)$(name).hidden=name!==screen;
  for(const link of document.querySelectorAll('[data-nav]')){
    const active=link.dataset.nav===screen;
    if(active)link.setAttribute('aria-current','page');
    else link.removeAttribute('aria-current');
  }
  window.scrollTo({top:0,behavior:'instant'});
  if(screen==='publicar'&&!state.editingId)resetForm();
}
window.addEventListener('hashchange',showView);

function photoNode(record){
  const image=String(record.picture||'');
  if(!/^data:image\/(?:jpeg|png|webp);base64,[a-zA-Z0-9+/=]+$/.test(image))return null;
  const img=el('img','publication-photo');
  img.src=image;
  img.alt='Fotografía de la publicación: '+record.title;
  img.loading='lazy';
  return img;
}
function whatsappLink(record,label,className){
  let href;
  try{href=whatsappUrl(record.contactPhone,record.title);}catch{return null;}
  const a=el('a',className,label);
  a.href=href;
  a.target='_blank';
  a.rel='noopener noreferrer';
  a.setAttribute('aria-label',label+' para: '+record.title);
  return a;
}
function renderCard(record,owner){
  const article=el('article','publication-card');
  const tag=el('span','publication-kind',record.category==='bienes'?'PRODUCTO':'SERVICIO');
  article.append(tag,el('h3','',record.title||'Sin título'));
  const city=el('p','publication-city','⌖  '+String(record.city||'Sin ciudad'));
  article.append(city);
  const detail=el('p','publication-description',record.description||'');
  article.append(detail);
  const extra=el('ul','publication-details');
  if(record.quantity)extra.append(el('li','','Cantidad: '+record.quantity));
  if(record.condition&&record.category==='bienes')extra.append(el('li','','Estado: '+({nuevo:'Nuevo',usado:'Segunda mano',cualquiera:'Cualquiera'}[record.condition]||'No indicado')));
  if(record.budget!==null&&record.budget!==undefined)extra.append(el('li','','Presupuesto aproximado: '+fmt(record.budget)));
  if(extra.children.length)article.append(extra);
  const picture=photoNode(record);
  if(picture)article.append(picture);
  const contact=el('div','contact-box');
  const number=readablePhone(record.contactPhone);
  if(number&&record.contactConsent===true){
    contact.append(el('span','contact-label','WhatsApp de contacto'));
    const phoneLink=whatsappLink(record,number,'contact-phone');
    const button=whatsappLink(record,'Contactar por WhatsApp ↗','whatsapp-button');
    if(phoneLink)contact.append(phoneLink);
    if(button)contact.append(button);
  }else{
    contact.append(el('p','field-help','Esta publicación aún no tiene un WhatsApp público válido. Su autor puede actualizarla.'));
  }
  article.append(contact);
  if(owner&&canManage(record,currentUid())){
    const actions=el('div','owner-actions');
    const edit=el('button','button outline-button','Editar');
    edit.type='button';
    edit.addEventListener('click',()=>editRecord(record));
    const remove=el('button','button danger-button','Eliminar');
    remove.type='button';
    remove.addEventListener('click',()=>deleteRecord(record));
    actions.append(edit,remove);article.append(actions);
  }
  return article;
}
function fillCityFilter(){
  const select=$('city-filter');
  const selected=select.value;
  const cities=[...new Set(state.items.map(v=>String(v.city||'').trim()).filter(Boolean))].sort((a,b)=>a.localeCompare(b,'es'));
  select.replaceChildren(new Option('Todas las ciudades','all'),...cities.map(city=>new Option(city,city)));
  select.value=cities.includes(selected)?selected:'all';
}
function render(){
  fillCityFilter();
  const kind=$('type-filter').value;
  const city=$('city-filter').value;
  const search=$('search').value.toLocaleLowerCase('es').trim();
  const visible=state.items.filter(item=>{
    if(item.status&&item.status!=='abierta')return false; // Los estados del sistema anterior no se promueven.
    if(kind!=='all'&&item.category!==kind)return false;
    if(city!=='all'&&item.city!==city)return false;
    return !search || [item.title,item.city,item.description].join(' ').toLocaleLowerCase('es').includes(search);
  });
  const list=$('browse-list');
  list.replaceChildren(...visible.map(item=>renderCard(item,false)));
  $('browse-empty').hidden=visible.length!==0;
  const own=state.items.filter(item=>canManage(item,currentUid()));
  $('mine-list').replaceChildren(...own.map(item=>renderCard(item,true)));
  $('mine-empty').hidden=own.length!==0;
  if(!state.user&&state.mode==='cloud')$('mine-empty').textContent='Inicia sesión para consultar y administrar tus publicaciones.';
  else $('mine-empty').textContent='Aún no tienes publicaciones. Crea la primera cuando lo necesites.';
}
$('search').addEventListener('input',render);
$('type-filter').addEventListener('change',render);
$('city-filter').addEventListener('change',render);
function toggleGoods(){
  const isGoods=$('need-category').value==='bienes';
  $('goods-fields').hidden=!isGoods;
  $('need-quantity').disabled=!isGoods;
  $('need-condition').disabled=!isGoods;
}
$('need-category').addEventListener('change',toggleGoods);

function showPicture(){
  const preview=$('picture-preview');
  preview.replaceChildren();
  if(state.picture){
    const img=el('img','');
    img.src=state.picture;img.alt='Vista previa de la fotografía';
    preview.append(img);
  }
  $('remove-picture').hidden=!state.picture;
}
function resetForm(){
  $('publish-form').reset();
  state.editingId=null;
  state.picture='';
  $('publish-title').textContent='Publica lo que necesitas';
  $('save-button').textContent='Publicar necesidad';
  $('edit-info').hidden=true;
  $('cancel-edit').hidden=true;
  feedback('form-feedback','');
  $('need-picture').value='';
  toggleGoods();showPicture();
}
function editRecord(record){
  if(!canManage(record,currentUid()))return toast('Solo puedes editar tus propias publicaciones.');
  resetForm();
  state.editingId=record.id;
  $('need-category').value=record.category||'bienes';
  $('need-title').value=record.title||'';
  $('need-city').value=record.city||'';
  $('need-description').value=record.description||'';
  $('need-phone').value=record.contactPhone||'';
  $('need-budget').value=record.budget??'';
  $('need-quantity').value=record.quantity??'';
  $('need-condition').value=record.condition||'cualquiera';
  $('need-consent').checked=record.contactConsent===true;
  state.picture=record.picture||'';
  $('publish-title').textContent='Edita tu publicación';
  $('save-button').textContent='Guardar cambios';
  $('edit-info').hidden=false;
  $('cancel-edit').hidden=false;
  toggleGoods();showPicture();
  window.location.hash='#publicar';
  showView();
}
$('cancel-edit').addEventListener('click',()=>{resetForm();window.location.hash='#mis-publicaciones';});

async function deleteRecord(record){
  if(!canManage(record,currentUid()))return toast('No puedes eliminar una publicación de otra persona.');
  if(!window.confirm('¿Eliminar definitivamente esta publicación? Esta acción no se puede deshacer.'))return;
  try{
    if(state.mode==='demo'){
      saveLocal(state.items.filter(item=>item.id!==record.id));
    }else if(state.mode==='cloud'){
      const api=state.firebase;
      await api.deleteDoc(api.doc(api.db,'requests',record.id));
    }else throw new Error('El servicio no está disponible.');
    toast('Publicación eliminada.');
  }catch(error){toast('No se pudo eliminar: '+error.message);}
}
function compressPicture(file){
  return new Promise((resolve,reject)=>{
    if(!['image/jpeg','image/png','image/webp'].includes(file.type))return reject(new Error('Selecciona una fotografía JPG, PNG o WebP.'));
    if(file.size>10000000)return reject(new Error('La fotografía original no puede superar 10 MB.'));
    const url=URL.createObjectURL(file);
    const image=new Image();
    image.onload=()=>{
      URL.revokeObjectURL(url);
      const scale=Math.min(1,850/Math.max(image.naturalWidth,image.naturalHeight));
      const canvas=document.createElement('canvas');
      canvas.width=Math.max(1,Math.round(image.naturalWidth*scale));
      canvas.height=Math.max(1,Math.round(image.naturalHeight*scale));
      const ctx=canvas.getContext('2d');
      if(!ctx)return reject(new Error('No se pudo procesar la fotografía.'));
      ctx.fillStyle='#fff';ctx.fillRect(0,0,canvas.width,canvas.height);
      ctx.drawImage(image,0,0,canvas.width,canvas.height);
      const encoded=canvas.toDataURL('image/jpeg',0.66);
      if(encoded.length>400000)return reject(new Error('La fotografía es demasiado grande. Selecciona una más pequeña.'));
      resolve(encoded);
    };
    image.onerror=()=>{URL.revokeObjectURL(url);reject(new Error('No se pudo leer la fotografía.'));};
    image.src=url;
  });
}
$('need-picture').addEventListener('change',async event=>{
  const file=event.target.files[0];
  if(!file)return;
  state.imageBusy=true;$('save-button').disabled=true;
  try{state.picture=await compressPicture(file);feedback('form-feedback','');showPicture();}
  catch(error){feedback('form-feedback',error.message);}
  finally{state.imageBusy=false;$('save-button').disabled=false;event.target.value='';}
});
$('remove-picture').addEventListener('click',()=>{state.picture='';showPicture();});
$('publish-form').addEventListener('submit',async event=>{
  event.preventDefault();
  if(state.saving||state.imageBusy)return;
  if(state.mode==='cloud'&&!state.user){state.waitingForAuth=true;showAuth();return;}
  const input={
    category:$('need-category').value,
    title:$('need-title').value,
    city:$('need-city').value,
    description:$('need-description').value,
    quantity:$('need-quantity').value,
    condition:$('need-condition').value,
    budget:$('need-budget').value,
    contactPhone:$('need-phone').value,
    contactConsent:$('need-consent').checked,
    picture:state.picture
  };
  try{
    const data=cleanPublication(input);
    const current=state.items.find(item=>item.id===state.editingId);
    if(state.editingId&&!canManage(current,currentUid()))throw new Error('Solo puedes editar tus propias publicaciones.');
    if(!['demo','cloud'].includes(state.mode))throw new Error('El servicio de publicaciones no está disponible.');
    state.saving=true;$('save-button').disabled=true;
    if(state.mode==='demo'){
      const payload=current?{...current,...data}:{...data,id:'local-'+Date.now()+'-'+Math.random().toString(36).slice(2),ownerUid:currentUid(),createdAt:Date.now()};
      const items=current?state.items.map(x=>x.id===current.id?payload:x):[payload,...state.items];
      saveLocal(items);
    }else{
      const api=state.firebase;
      if(current)await api.updateDoc(api.doc(api.db,'requests',current.id),data);
      else await api.addDoc(api.collection(api.db,'requests'),{...data,ownerUid:state.user.uid,createdAt:api.serverTimestamp()});
    }
    resetForm();
    window.location.hash='#mis-publicaciones';
    showView();
    toast(current?'Publicación actualizada.':'Publicación guardada.');
  }catch(error){feedback('form-feedback',error.message||'No se pudo guardar la publicación.');}
  finally{state.saving=false;$('save-button').disabled=false;}
});
function showAuth(){
  if(state.mode!=='cloud')return;
  $('auth-feedback').hidden=true;
  $('auth-form').hidden=!!state.user;
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
  try{
    const api=state.firebase;
    await api.signInWithPopup(api.auth,new api.GoogleAuthProvider());
    $('auth-dialog').close();
  }catch(error){feedback('auth-feedback',authError(error));}
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
  toggleGoods();
  const config=window.LoNecesitoFirebaseConfig||{};
  const configured=['apiKey','authDomain','projectId','appId'].every(key=>Boolean(config[key]));
  if(!configured){
    state.mode='demo';state.items=readLocal();
    const notice=$('mode-notice');
    notice.textContent='Modo de prueba: las publicaciones se guardan únicamente en este navegador y no son visibles para otras personas. Para que el portal funcione públicamente hace falta configurar Firebase.';
    notice.hidden=false;
    render();showView();
    return;
  }
  try{
    const [appLib,authLib,dbLib]=await Promise.all([
      import('https://www.gstatic.com/firebasejs/12.4.0/firebase-app.js'),
      import('https://www.gstatic.com/firebasejs/12.4.0/firebase-auth.js'),
      import('https://www.gstatic.com/firebasejs/12.4.0/firebase-firestore.js')
    ]);
    const app=appLib.initializeApp(config);
    const auth=authLib.getAuth(app);
    const db=dbLib.getFirestore(app);
    state.firebase={auth,db,...authLib,...dbLib};
    state.mode='cloud';
    $('account-button').hidden=false;
    authLib.onAuthStateChanged(auth,user=>{
      state.user=user||null;
      const button=$('account-button');
      button.textContent=user?(user.email||'Mi cuenta'):'Iniciar sesión';
      button.title=user?(user.email||'Mi cuenta'):'Iniciar sesión';
      if(user&&state.waitingForAuth){state.waitingForAuth=false;window.location.hash='#publicar';}
      render();showView();
    },error=>toast('No se pudo comprobar el acceso: '+authError(error)));
    dbLib.onSnapshot(dbLib.collection(db,'requests'),snap=>{
      state.items=snap.docs.map(d=>({id:d.id,...d.data()}))
        .sort((a,b)=>(b.createdAt?.seconds||0)-(a.createdAt?.seconds||0));
      render();
    },error=>{
      const n=$('mode-notice');n.hidden=false;
      n.textContent='No se pueden consultar las publicaciones: '+error.message;
      toast('Error de conexión con el servicio.');
    });
    render();showView();
  }catch(error){
    state.mode='error';
    const notice=$('mode-notice');
    notice.textContent='La conexión con el servicio no está disponible. No se guardarán publicaciones: '+error.message;
    notice.hidden=false;
    $('save-button').disabled=true;
    render();showView();
  }
}
boot();
