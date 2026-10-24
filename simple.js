import {APP_VERSION,EXAMPLE_PUBLICATIONS,cleanPublication,whatsappUrl,exampleWhatsappUrl,derivedTitle,canManage,normalizeWhatsApp} from './simple-model.js';

const $=id=>document.getElementById(id);
const pages=['inicio','necesidades','mis-publicaciones','publicar'];
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
  const page=window.location.hash.slice(1);
  const screen=pages.includes(page)?page:'inicio';
  if(screen==='publicar'&&state.mode==='cloud'&&!state.user){
    state.waitingForAuth=true;showAuth();window.location.hash='#inicio';return;
  }
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

function legacyDetails(record){
  // Antiguas publicaciones conservan sus datos al editarse mediante la caja única.
  const original=String(record.description||'').trim();
  const lines=[];
  if(record.title&&record.title!==derivedTitle(original))lines.push('Necesidad: '+record.title);
  if(record.category)lines.push('Tipo: '+(record.category==='bienes'?'Producto':'Servicio'));
  if(record.subcategory)lines.push('Categoría: '+record.subcategory);
  if(record.city)lines.push('Ciudad o municipio: '+record.city);
  if(record.quantity)lines.push('Cantidad: '+record.quantity);
  if(record.condition)lines.push('Estado del producto: '+({nuevo:'Nuevo',usado:'Segunda mano',cualquiera:'Cualquiera'}[record.condition]||record.condition));
  if(record.budget!==null&&record.budget!==undefined)lines.push('Presupuesto aproximado (COP): '+record.budget);
  if(record.desiredDate)lines.push('Fecha deseada: '+record.desiredDate);
  return lines.length?[original,...lines].filter(Boolean).join('\n\n'):original;
}
function phoneLink(record,label,cls){
  const number=record.contactPhone;
  let href='';
  try{
    href=record.example===true
      ?exampleWhatsappUrl(record.description||record.title)
      :whatsappUrl(number,record.description||record.title);
  }catch{return null;}
  const a=el('a',cls,label);
  a.href=href;a.target='_blank';a.rel='noopener noreferrer';
  a.setAttribute('aria-label','Abrir WhatsApp desde esta necesidad');
  return a;
}
function renderCard(record,owner){
  const article=el('article','publication-card');
  const description=String(record.description||'').trim();
  const title=String(record.title||derivedTitle(description)).trim()||'Necesidad publicada';
  article.append(el('h3','',title));
  article.append(el('p','publication-description',description));
  // Se respetan los datos de las fichas antiguas y de los ejemplos.
  const facts=el('dl','publication-facts');
  function fact(name,value){
    if(value===undefined||value===null||String(value).trim()==='')return;
    facts.append(el('dt','',name),el('dd','',value));
  }
  if(record.category)fact('Tipo',record.category==='bienes'?'Producto':'Servicio');
  fact('Categoría',record.subcategory);
  fact('Ciudad o municipio',record.city);
  fact('Cantidad',record.quantity);
  if(record.condition)fact('Estado del producto',({nuevo:'Nuevo',usado:'Segunda mano',cualquiera:'Cualquiera'}[record.condition]||record.condition));
  if(record.budget!==undefined&&record.budget!==null){
    fact('Presupuesto aproximado',new Intl.NumberFormat('es-CO',{style:'currency',currency:'COP',maximumFractionDigits:0}).format(record.budget));
  }
  fact('Fecha deseada',record.desiredDate);
  if(facts.children.length)article.append(facts);
  const photo=String(record.picture||'');
  if(/^data:image\/(?:jpeg|png|webp);base64,[a-zA-Z0-9+/=]+$/.test(photo)){
    const img=el('img','publication-photo');
    img.src=photo;img.alt='Fotografía de '+title;img.loading='lazy';article.append(img);
  }
  const contact=el('div','contact-box');
  // El número visible se enlaza a WhatsApp; las muestras abren WhatsApp sin destinatario.
  let contactNumber='';
  try{
    if(record.example===true)contactNumber=String(record.contactPhone||'');
    else if(record.contactConsent===true)contactNumber='+'+normalizeWhatsApp(record.contactPhone);
  }catch{contactNumber='';}
  if(contactNumber){
    contact.append(el('span','contact-label','WhatsApp de contacto'));
    const linked=phoneLink(record,contactNumber,'contact-phone');
    const action=phoneLink(record,'Contactar por WhatsApp ↗','whatsapp-button');
    if(linked)contact.append(linked);
    if(action)contact.append(action);
  }else{
    // Un dato antiguo inválido solo se muestra al dueño para corregirlo.
    contact.append(el('span','contact-label','Actualiza el WhatsApp de esta publicación.'));
  }
  article.append(contact);
  if(owner&&record.example!==true&&canManage(record,currentUid())){
    const actions=el('div','owner-actions');
    const edit=el('button','button outline-button','Editar');edit.type='button';
    edit.addEventListener('click',()=>editRecord(record));
    const remove=el('button','button danger-button','Eliminar');remove.type='button';
    remove.addEventListener('click',()=>deleteRecord(record));
    actions.append(edit,remove);article.append(actions);
  }
  return article;
}
function visibleItems(){
  const real=state.items.filter(item=>{
    try{return item.contactConsent===true&&Boolean(normalizeWhatsApp(item.contactPhone));}catch{return false;}
  });
  return state.mode==='demo'?[...real,...EXAMPLE_PUBLICATIONS]:real;
}
function render(){
  const search=$('search').value.toLocaleLowerCase('es').trim();
  const visible=visibleItems().filter(item=>!search||[item.title,item.description,item.city,item.subcategory].join(' ').toLocaleLowerCase('es').includes(search));
  $('browse-list').replaceChildren(...visible.map(item=>renderCard(item,false)));
  $('browse-empty').hidden=visible.length!==0;
  const own=state.items.filter(item=>canManage(item,currentUid()));
  $('mine-list').replaceChildren(...own.map(item=>renderCard(item,true)));
  $('mine-empty').hidden=own.length!==0;
  $('mine-empty').textContent=state.mode==='cloud'&&!state.user?'Inicia sesión para consultar tus publicaciones.':'Aún no tienes publicaciones. Crea la primera cuando lo necesites.';
}
$('search').addEventListener('input',render);
function resetForm(){
  $('publish-form').reset();state.editingId=null;
  $('publish-title').textContent='Publica lo que necesitas';
  $('save-button').textContent='Publicar necesidad';
  $('cancel-edit').hidden=true;
  feedback('form-feedback','');
}
function editRecord(record){
  if(!canManage(record,currentUid()))return;
  resetForm();
  state.editingId=record.id;
  $('need-description').value=legacyDetails(record);
  $('need-phone').value=record.contactPhone||'';
  $('publish-title').textContent='Edita tu publicación';
  $('save-button').textContent='Guardar cambios';
  $('cancel-edit').hidden=false;
  window.location.hash='#publicar';
  showView();
}
$('cancel-edit').addEventListener('click',()=>{resetForm();window.location.hash='#mis-publicaciones';});
async function deleteRecord(record){
  if(!canManage(record,currentUid()))return;
  if(!window.confirm('¿Eliminar definitivamente esta publicación?'))return;
  try{
    if(state.mode==='demo')saveLocal(state.items.filter(item=>item.id!==record.id));
    else if(state.mode==='cloud'){
      const api=state.firebase;await api.deleteDoc(api.doc(api.db,'requests',record.id));
    }else throw Error('No fue posible eliminar.');
    toast('Publicación eliminada.');
  }catch(error){toast('No fue posible eliminar la publicación.');}
}
$('publish-form').addEventListener('submit',async event=>{
  event.preventDefault();
  if(state.saving)return;
  if(state.mode==='cloud'&&!state.user){state.waitingForAuth=true;showAuth();return;}
  let current=null;
  try{
    const data=cleanPublication({
      description:$('need-description').value,
      contactPhone:$('need-phone').value
    });
    current=state.items.find(item=>item.id===state.editingId);
    if(state.editingId&&!canManage(current,currentUid()))throw Error('Solo puedes editar tus propias publicaciones.');
    if(!['demo','cloud'].includes(state.mode))throw Error('No se puede guardar en este momento.');
    state.saving=true;$('save-button').disabled=true;
    if(state.mode==='demo'){
      const base=current?{id:current.id,ownerUid:current.ownerUid,createdAt:current.createdAt,...(current.picture?{picture:current.picture}:{})}
        :{id:'local-'+Date.now()+'-'+Math.random().toString(36).slice(2),ownerUid:currentUid(),createdAt:Date.now()};
      const item={...base,...data};
      saveLocal(current?state.items.map(x=>x.id===current.id?item:x):[item,...state.items]);
    }else{
      const api=state.firebase;
      if(current){
        const updated={...data};
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
  $('release-version').textContent='Versión '+APP_VERSION;
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
