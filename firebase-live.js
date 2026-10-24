/* Modo multiusuario: solo activo al conectar Firebase.
   Las reglas de privacidad viven en firestore.rules, no en esta interfaz. */
const firebaseSettings=window.LoNecesitoFirebaseConfig;
if(firebaseSettings?.apiKey&&firebaseSettings?.projectId&&firebaseSettings?.appId){
  launchFirebase().catch(e=>{
    const alert=document.createElement('p');alert.className='live-error shell';
    alert.textContent='Servicio no disponible. No se pueden publicar ni enviar aplicaciones: '+e.message;
    document.querySelector('.compact-main')?.prepend(alert);
  });
}
async function launchFirebase(){
  const [{initializeApp},A,F,model]=await Promise.all([
    import('https://www.gstatic.com/firebasejs/12.4.0/firebase-app.js'),
    import('https://www.gstatic.com/firebasejs/12.4.0/firebase-auth.js'),
    import('https://www.gstatic.com/firebasejs/12.4.0/firebase-firestore.js'),
    import('./2026-10-22_app.js')
  ]);
  const {onAuthStateChanged,getAuth,createUserWithEmailAndPassword,signInWithEmailAndPassword,signInWithPopup,GoogleAuthProvider,signOut}=A;
  const {getFirestore,collection,doc,getDoc,getDocs,setDoc,addDoc,updateDoc,deleteDoc,writeBatch,serverTimestamp,onSnapshot}=F;
  const auth=getAuth(initializeApp(firebaseSettings)),db=getFirestore();
  const {CATEGORIES,SUBCATEGORIES,normalizeRequest}=model;
  const $=q=>document.querySelector(q),$$=q=>[...document.querySelectorAll(q)];
  const el=(tag,cls,value)=>{
    const node=document.createElement(tag);
    if(cls)node.className=cls;
    if(value!==undefined)node.textContent=String(value);
    return node;
  };
  const state={user:null,profile:null,requests:[],applied:new Set(),unsubApplied:null,pending:null,category:'all',subcategory:'all',city:'all',search:'',edit:null,picture:'',step:0};
  const notify=message=>{
    const toast=$('#toast');toast.textContent=message;toast.hidden=false;
    clearTimeout(notify.timeout);notify.timeout=setTimeout(()=>toast.hidden=true,4200);
  };
  const accountDialog=el('dialog','account-dialog');
  accountDialog.id='account-dialog';
  accountDialog.innerHTML='<div class="dialog-header"><h2>Tu cuenta</h2><button type="button" class="close-dialog" id="account-close" aria-label="Cerrar">×</button></div>'+
    '<p class="account-info">Publicar, aplicar y contactar es gratis.</p>'+
    '<form id="account-form" class="dialog-form"><label for="account-mode">Acceso</label>'+
    '<select id="account-mode"><option value="login">Iniciar sesión</option><option value="register">Crear cuenta gratis</option></select>'+
    '<label for="account-email">Correo</label><input id="account-email" type="email" required autocomplete="email">'+
    '<label for="account-password">Contraseña</label><input id="account-password" type="password" required minlength="6" autocomplete="current-password">'+
    '<div id="account-register" class="account-fields" hidden><label for="account-name">Nombre</label><input id="account-name" minlength="2" maxlength="100" autocomplete="name">'+
    '<label for="account-phone">Teléfono de contacto</label><input id="account-phone" type="tel" maxlength="20" autocomplete="tel">'+
    '<label class="consent-line"><input id="account-consent" type="checkbox"> Al aplicar, mi nombre y teléfono serán visibles únicamente para la persona que publicó esa necesidad.</label></div>'+
    '<button type="submit" class="button" id="account-submit">Iniciar sesión</button>'+
    '<button type="button" class="button button-secondary" id="account-google">Entrar con Google</button></form>'+
    '<form id="profile-form" class="dialog-form" hidden>'+
    '<p class="account-info">Completa tus datos una sola vez para que los propietarios puedan contactarte si aplicas.</p>'+
    '<label for="profile-name">Nombre</label><input id="profile-name" required minlength="2" maxlength="100" autocomplete="name">'+
    '<label for="profile-phone">Teléfono</label><input id="profile-phone" required type="tel" maxlength="20" autocomplete="tel">'+
    '<label class="consent-line"><input id="profile-consent" type="checkbox" required> Autorizo mostrar mi nombre y teléfono únicamente a los propietarios de las necesidades a las que aplique.</label>'+
    '<button class="button" type="submit">Guardar mis datos</button></form>'+
    '<button id="account-logout" class="button button-secondary" type="button" hidden>Cerrar sesión</button>'+
    '<p id="account-error" class="form-error" role="alert" hidden></p>';
  document.body.append(accountDialog);
  const accountBtn=el('button','account-header-button','Entrar');
  accountBtn.id='account-button';accountBtn.type='button';$('.compact-header-inner').append(accountBtn);
  const accountError=message=>{const box=$('#account-error');box.textContent=message;box.hidden=!message;};
  function openAccount(){
    accountError('');
    $('#account-form').hidden=!!state.user;
    $('#profile-form').hidden=!state.user||!!state.profile;
    $('#account-logout').hidden=!state.user;
    if(state.user){
      $('#profile-name').value=state.profile?.name||state.user.displayName||'';
      $('#profile-phone').value=state.profile?.phone||'';
      $('#profile-consent').checked=!!state.profile?.discloseConsent;
    }
    if(!accountDialog.open)accountDialog.showModal();
  }
  function validProfile(name,phone,consent){
    const n=String(name||'').trim(),p=String(phone||'').trim();
    if(n.length<2||n.length>100)throw Error('Escribe tu nombre.');
    if(!/^[+0-9 ()-]{7,20}$/.test(p)||p.replace(/\D/g,'').length<7||p.replace(/\D/g,'').length>15)throw Error('Escribe un teléfono válido.');
    if(!consent)throw Error('Confirma que el propietario podrá ver tu nombre y número si aplicas.');
    return {name:n,phone:p,discloseConsent:true};
  }
  async function saveProfile(info){
    if(!state.user)throw Error('Inicia sesión.');
    await setDoc(doc(db,'profiles',state.user.uid),{uid:state.user.uid,email:state.user.email||'',...info,createdAt:serverTimestamp()});
    state.profile=info;
    accountBtn.textContent=info.name;accountDialog.close();
    if(state.pending){const id=state.pending;state.pending=null;await submitApplication(id);}
  }
  $('#account-close').onclick=()=>accountDialog.close();
  accountBtn.onclick=openAccount;
  $('#account-mode').onchange=()=>{
    const isRegister=$('#account-mode').value==='register';
    $('#account-register').hidden=!isRegister;
    for(const id of ['account-name','account-phone','account-consent'])$('#'+id).required=isRegister;
    $('#account-password').autocomplete=isRegister?'new-password':'current-password';
    $('#account-submit').textContent=isRegister?'Crear cuenta gratis':'Iniciar sesión';
  };
  $('#account-form').onsubmit=async e=>{
    e.preventDefault();accountError('');
    try{
      const email=$('#account-email').value.trim(),pass=$('#account-password').value;
      if($('#account-mode').value==='register'){
        const profile=validProfile($('#account-name').value,$('#account-phone').value,$('#account-consent').checked);
        const result=await createUserWithEmailAndPassword(auth,email,pass);
        state.user=result.user;await saveProfile(profile);
      }else{await signInWithEmailAndPassword(auth,email,pass);accountDialog.close();}
    }catch(err){accountError(err.message);}
  };
  $('#account-google').onclick=async()=>{
    accountError('');
    try{await signInWithPopup(auth,new GoogleAuthProvider());}
    catch(e){accountError(e.message);}
  };
  $('#profile-form').onsubmit=async e=>{
    e.preventDefault();accountError('');
    try{await saveProfile(validProfile($('#profile-name').value,$('#profile-phone').value,$('#profile-consent').checked));}
    catch(err){accountError(err.message);}
  };
  $('#account-logout').onclick=async()=>{await signOut(auth);accountDialog.close();};
  async function changeUser(){
    state.profile=null;state.applied.clear();
    if(state.unsubApplied){state.unsubApplied();state.unsubApplied=null;}
    if(state.user){
      try{
        const p=await getDoc(doc(db,'profiles',state.user.uid));
        state.profile=p.exists()?p.data():null;
      }catch(e){notify('No se pudo leer el perfil: '+e.message);}
      state.unsubApplied=onSnapshot(collection(db,'applicationsByUser',state.user.uid,'items'),snapshot=>{
        state.applied=new Set(snapshot.docs.map(x=>x.id));renderAll();
      },e=>notify('Error al consultar aplicaciones: '+e.message));
    }
    accountBtn.textContent=state.profile?.name||(state.user?'Completar perfil':'Entrar');
    if(state.user&&!state.profile)openAccount();
    renderAll();
  }
  onAuthStateChanged(auth,user=>{state.user=user;changeUser().catch(e=>notify(e.message));});

  function activateScreen(){
    const id=location.hash.replace(/^#/,'');
    const current=['inicio','necesidades','mis-necesidades','aceptadas'].includes(id)?id:'inicio';
    $$('.app-screen').forEach(screen=>screen.hidden=screen.id!==current);
    renderAll();
  }
  window.addEventListener('hashchange',activateScreen);
  const money=v=>new Intl.NumberFormat('es-CO',{style:'currency',currency:'COP',maximumFractionDigits:0}).format(v);
  const opened=new Set();
  function requestsFor(id){
    if(id==='my-requests-grid')return state.user?state.requests.filter(r=>r.ownerUid===state.user.uid):[];
    if(id==='accepted-grid')return state.user?state.requests.filter(r=>state.applied.has(r.id)):[];
    return state.requests.filter(r=>r.status==='abierta').filter(r=>{
      if(state.category!=='all'&&r.category!==state.category)return false;
      if(state.subcategory!=='all'&&r.subcategory!==state.subcategory)return false;
      if(state.city!=='all'&&r.city!==state.city)return false;
      if(state.search&&!([r.title,r.description,r.city].join(' ').toLocaleLowerCase('es').includes(state.search)))return false;
      return true;
    });
  }
  function makeButton(label,action,id,primary=false,disabled=false){
    const button=el('button',primary?'button need-card-primary':'my-action need-card-secondary',label);
    button.type='button';button.disabled=disabled;
    button.dataset.realAction=action;button.dataset.id=id;button.classList.add('need-action-'+action);
    return button;
  }
  async function showApplicants(id,container){
    try{
      // La colección NO es legible públicamente; Firestore comprueba al propietario.
      const snap=await getDocs(collection(db,'requests',id,'applications'));
      container.replaceChildren();
      if(snap.empty){container.textContent='Nadie ha aplicado todavía.';return;}
      container.append(el('p','applicants-count',snap.size+' personas aplicaron'));
      for(const result of snap.docs){
        const entry=el('div','applicant-entry'),applicant=result.data();
        entry.append(el('strong','',applicant.name));
        const phone=el('a','applicant-phone',applicant.phone);
        phone.href='tel:'+String(applicant.phone||'').replace(/[^0-9+]/g,'');
        entry.append(phone);container.append(entry);
      }
    }catch(e){container.textContent='No fue posible consultar los interesados: '+e.message;}
  }
  function makeCard(req,listId){
    const own=state.user?.uid===req.ownerUid,applied=state.applied.has(req.id);
    const article=el('article','need-card request-card');article.dataset.id=req.id;article.dataset.kind=req.category;
    const head=el('div','need-card-head');
    head.append(el('p','category',(CATEGORIES[req.category]||req.category)+' · '+(SUBCATEGORIES[req.category]?.[req.subcategory]||'Otra categoría')));
    if(listId!=='request-grid')head.append(el('span','my-state',listId==='accepted-grid'?'Aplicaste':req.status));
    const overview=el('div','need-card-overview'),copy=el('div','need-card-copy');
    copy.append(el('h3','need-card-title',req.title));
    copy.append(el('p','card-city',req.city));
    const meta=el('ul','need-card-meta');
    if(req.category==='bienes'){
      if(req.quantity)meta.append(el('li','','Cantidad: '+req.quantity));
      meta.append(el('li','','Condición: '+({nuevo:'Nuevo',usado:'Segunda mano',cualquiera:'Cualquiera'}[req.condition]||'No indicada')));
    }
    if(req.budget!==null&&req.budget!==undefined)meta.append(el('li','','Presupuesto: '+money(req.budget)));
    if(req.desiredDate)meta.append(el('li','','Fecha deseada: '+req.desiredDate));
    if(meta.children.length)copy.append(meta);
    copy.append(el('p','need-card-description',req.description));
    const photo=el('div','need-card-photo '+(req.picture?'has-photo':'no-photo'));
    if(req.picture){const image=el('img');image.src=req.picture;image.alt='Fotografía de '+req.title;image.loading='lazy';photo.append(image);}
    else photo.append(el('span','no-photo-label','Sin foto'));
    overview.append(copy,photo);article.append(head,overview);
    if(own){
      const block=el('section','applicants-panel');
      block.append(el('h4','applicants-title','Personas que aplicaron'));
      const result=el('div','applicants-results','Cargando interesados…');
      block.append(result);article.append(block);showApplicants(req.id,result);
    }
    const actions=el('div','need-card-actions');
    if(own){
      if(req.status==='abierta'){
        actions.append(makeButton('Editar necesidad','edit',req.id));
        actions.append(makeButton('Marcar como resuelta','resolve',req.id,true));
        actions.append(makeButton('Cancelar','cancel',req.id));
      }else if(req.status==='en_proceso'){
        actions.append(makeButton('Marcar como resuelta','resolve',req.id,true));
        actions.append(makeButton('Cancelar','cancel',req.id));
      }else if(req.status==='cancelada')actions.append(makeButton('Reactivar necesidad','reopen',req.id,true));
      else actions.append(el('p','need-card-finished','Necesidad resuelta'));
    }else if(applied)actions.append(makeButton('Ya aplicaste a esta necesidad','accepted',req.id,true,true));
    else if(req.status==='abierta')actions.append(makeButton('Aceptar necesidad','apply',req.id,true));
    article.append(actions);return article;
  }
  function renderList(id){
    const grid=$('#'+id);
    grid.querySelectorAll('.need-list-row[open]').forEach(row=>opened.add(id+':'+row.dataset.id));
    grid.replaceChildren();
    const list=requestsFor(id);
    for(const req of list){
      const row=el('details','need-list-row'),summary=el('summary','need-list-summary');
      row.dataset.id=req.id;summary.append(el('span','need-list-title',req.title));row.append(summary);
      row.addEventListener('toggle',()=>{
        const key=id+':'+req.id;
        if(!row.open){opened.delete(key);row.querySelector('.need-list-content')?.remove();return;}
        opened.add(key);
        if(!row.querySelector('.need-list-content')){
          const content=el('div','need-list-content');content.append(makeCard(req,id));row.append(content);
        }
      });
      grid.append(row);
      if(opened.has(id+':'+req.id)){
        row.open=true;
        const content=el('div','need-list-content');content.append(makeCard(req,id));row.append(content);
      }
    }
    if(id==='request-grid'){
      $('#empty-state').hidden=!!list.length;
      $('#filter-status').textContent=list.length+' necesidades disponibles.';
    }
  }
  function renderAll(){
    renderList('request-grid');renderList('my-requests-grid');renderList('accepted-grid');
    const own=requestsFor('my-requests-grid'),accepted=requestsFor('accepted-grid');
    $('#my-count').textContent=own.length?'('+own.length+')':'';
    $('#my-empty').hidden=!!own.length;
    $('#my-empty').querySelector('p').textContent=state.user?'Aún no has creado ninguna necesidad.':'Inicia sesión para consultar tus publicaciones.';
    $('#accepted-empty').hidden=!!accepted.length;
    $('#accepted-empty').textContent=state.user?'Todavía no has aplicado a ninguna necesidad.':'Inicia sesión para consultar tus aplicaciones.';
  }
  function populateFilters(){
    const cat=$('#list-subcategory'),previous=state.subcategory;
    cat.replaceChildren(new Option('Todas las categorías','all'));
    const kinds=state.category==='all'?['bienes','servicios']:[state.category];
    for(const kind of kinds){
      const group=document.createElement('optgroup');group.label=CATEGORIES[kind];
      for(const [id,name] of Object.entries(SUBCATEGORIES[kind]))group.append(new Option(name,id));
      cat.append(group);
    }
    state.subcategory=kinds.some(k=>Object.hasOwn(SUBCATEGORIES[k],previous))?previous:'all';
    cat.value=state.subcategory;
    const city=$('#list-city'),current=state.city;
    const cities=[...new Set(state.requests.filter(r=>r.status==='abierta').map(r=>r.city))].sort((a,b)=>a.localeCompare(b,'es'));
    city.replaceChildren(new Option('Todas las ciudades','all'),...cities.map(c=>new Option(c,c)));
    state.city=cities.includes(current)?current:'all';city.value=state.city;
  }
  $$('.filter').forEach(b=>b.onclick=()=>{
    state.category=b.dataset.category;state.subcategory='all';populateFilters();
    $$('.filter').forEach(x=>{x.classList.toggle('is-active',x===b);x.setAttribute('aria-pressed',String(x===b));});
    renderList('request-grid');
  });
  $('#list-subcategory').onchange=e=>{state.subcategory=e.target.value;renderList('request-grid');};
  $('#list-city').onchange=e=>{state.city=e.target.value;renderList('request-grid');};
  $('#request-search').oninput=e=>{state.search=e.target.value.trim().toLocaleLowerCase('es');renderList('request-grid');};
  $$('[data-explore]').forEach(a=>a.onclick=()=>{
    state.category='all';state.subcategory='all';state.city='all';state.search='';$('#request-search').value='';
    $$('.filter').forEach(b=>{b.classList.toggle('is-active',b.dataset.category==='all');b.setAttribute('aria-pressed',String(b.dataset.category==='all'));});
    populateFilters();
  });
  onSnapshot(collection(db,'requests'),snapshot=>{
    state.requests=snapshot.docs.map(d=>({id:d.id,...d.data()}))
      .sort((a,b)=>(b.createdAt?.seconds||0)-(a.createdAt?.seconds||0));
    populateFilters();renderAll();
  },e=>{
    notify('Error al cargar necesidades: '+e.message);
    $('#empty-state').hidden=false;$('#empty-state').textContent='No se pudieron consultar las necesidades.';
  });
