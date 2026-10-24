/* Modo multiusuario: solo activo al conectar Firebase.
   Las reglas de privacidad viven en firestore.rules, no en esta interfaz. */
const firebaseSettings=window.LoNecesitoFirebaseConfig;
if(firebaseSettings?.apiKey&&firebaseSettings?.authDomain&&firebaseSettings?.projectId&&firebaseSettings?.appId){
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
    '<p class="account-info">Accede a tu cuenta para publicar solicitudes y expresar interés en las oportunidades disponibles.</p>'+
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
    $('#profile-form').hidden=!state.user;
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
    const uid=state.user.uid,ref=doc(db,'profiles',uid);
    const saved=await getDoc(ref);
    await setDoc(ref,{uid,email:state.user.email||'',...info,
      createdAt:saved.exists()?saved.data().createdAt:serverTimestamp()});
    state.profile=info;
    accountBtn.textContent=info.name;accountDialog.close();
    if(state.pending){const id=state.pending;state.pending=null;await submitApplication(id,info);}
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
        if(p.exists())state.profile=p.data();
      }catch(e){notify('No se pudo leer el perfil: '+e.message);}
      state.unsubApplied=onSnapshot(collection(db,'applicationsByUser',state.user.uid,'items'),snapshot=>{
        state.applied=new Set(snapshot.docs.map(x=>x.id));renderAll();
      },e=>notify('Error al consultar aplicaciones: '+e.message));
    }
    accountBtn.textContent=state.profile?.name||(state.user?'Completar perfil':'Entrar');
    if(state.user&&!state.profile)openAccount();
    if(state.user&&state.profile&&accountDialog.open)accountDialog.close();
    renderAll();
    // Si la persona pulsó «Aceptar» antes de iniciar sesión, se completa
    // automáticamente la aplicación cuando ya tiene perfil y consentimiento.
    if(state.user&&state.profile?.discloseConsent&&state.pending){
      const pending=state.pending;state.pending=null;
      try{await submitApplication(pending);}
      catch(error){notify(error.message);}
    }
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
        actions.append(makeButton('Editar solicitud','edit',req.id));
        actions.append(makeButton('Marcar como resuelta','resolve',req.id,true));
        actions.append(makeButton('Cancelar','cancel',req.id));
      }else if(req.status==='en_proceso'){
        actions.append(makeButton('Marcar como resuelta','resolve',req.id,true));
        actions.append(makeButton('Cancelar','cancel',req.id));
      }else if(req.status==='cancelada')actions.append(makeButton('Reactivar solicitud','reopen',req.id,true));
      else actions.append(el('p','need-card-finished','Necesidad resuelta'));
    }else if(applied)actions.append(makeButton('Solicitud seleccionada','accepted',req.id,true,true));
    else if(req.status==='abierta')actions.append(makeButton('Me interesa atender esta solicitud','apply',req.id,true));
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
    $('#my-empty').querySelector('p').textContent=state.user?'Aún no has publicado ninguna necesidad. Crea tu primera solicitud para dar a conocer lo que buscas.':'Inicia sesión para consultar tus publicaciones.';
    $('#accepted-empty').hidden=!!accepted.length;
    $('#accepted-empty').textContent=state.user?'Todavía no has seleccionado ninguna solicitud. Explora las oportunidades disponibles.':'Inicia sesión para consultar tus solicitudes de interés.';
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
    $('#empty-state').hidden=false;$('#empty-state').textContent='No se pudieron consultar las solicitudes disponibles.';
  });

  async function submitApplication(id,profileOverride=null){
    const req=state.requests.find(r=>r.id===id);
    if(!req||req.status!=='abierta')throw Error('Esta necesidad ya no está disponible.');
    const currentProfile=profileOverride||state.profile;
    if(!state.user||!currentProfile?.discloseConsent)throw Error('Completa tu perfil antes de aplicar.');
    if(req.ownerUid===state.user.uid)throw Error('No puedes aplicar a tu propia necesidad.');
    if(state.applied.has(id)){notify('Ya registraste tu interés en esta solicitud.');return;}
    const uid=state.user.uid,batch=writeBatch(db);
    batch.set(doc(db,'requests',id,'applications',uid),{
      uid,name:currentProfile.name,phone:currentProfile.phone,appliedAt:serverTimestamp()
    });
    batch.set(doc(db,'applicationsByUser',uid,'items',id),{
      requestId:id,appliedAt:serverTimestamp()
    });
    await batch.commit();
    state.applied.add(id);renderAll();notify('Ya registraste tu interés en esta solicitud.');
  }
  async function clickAction(button){
    if(button.disabled)return;
    const id=button.dataset.id,action=button.dataset.realAction;
    button.disabled=true;
    try{
      if(action==='apply'){
        if(!state.user||!state.profile?.discloseConsent){
          state.pending=id;openAccount();return;
        }
        await submitApplication(id);return;
      }
      const request=state.requests.find(x=>x.id===id);
      if(!request||request.ownerUid!==state.user?.uid)throw Error('Acceso no autorizado.');
      if(action==='edit'){await openPublish(request);return;}
      if(action==='resolve'&&!confirm('¿Marcar esta necesidad como resuelta?'))return;
      if(action==='cancel'&&!confirm('¿Cancelar esta necesidad?'))return;
      const status={resolve:'resuelta',cancel:'cancelada',reopen:'abierta'}[action];
      if(!status)return;
      await updateDoc(doc(db,'requests',id),{status});
      notify('Estado actualizado.');
    }catch(e){notify(e.message);}
    finally{button.disabled=false;}
  }
  for(const id of ['request-grid','my-requests-grid','accepted-grid']){
    $('#'+id).onclick=e=>{
      const button=e.target.closest('button[data-real-action][data-id]');
      if(button)clickAction(button);
    };
  }
  function fillCategories(){
    const kind=$('#request-category').value;
    $('#request-subcategory').replaceChildren(...Object.entries(SUBCATEGORIES[kind]||SUBCATEGORIES.bienes).map(([id,label])=>new Option(label,id)));
    const goods=kind==='bienes';$('#goods-fields').hidden=!goods;
    $('#goods-fields').querySelectorAll('input,select').forEach(x=>{x.disabled=!goods;x.required=goods;});
  }
  $('#request-category').onchange=fillCategories;
  function chooseCity(){
    const other=$('#request-city').value==='__otra__';
    $('#city-other-fields').hidden=!other;
    $('#request-city-other').disabled=!other;$('#request-city-other').required=other;
  }
  $('#request-city').onchange=chooseCity;
  const wizardSteps=$$('.wizard-step');
  function wizardData(){
    const read=id=>$('#'+id).value;
    return {
      title:read('request-title'),category:read('request-category'),
      subcategory:read('request-subcategory'),
      city:read('request-city')==='__otra__'?read('request-city-other'):read('request-city'),
      quantity:read('request-quantity'),condition:read('request-condition'),
      description:read('request-description'),budget:read('request-budget'),
      desiredDate:read('request-date'),picture:state.picture
    };
  }
  function wizardStep(n){
    state.step=Math.max(0,Math.min(2,n));
    wizardSteps.forEach((x,i)=>x.hidden=i!==state.step);
    $('#wizard-status').textContent='Paso '+(state.step+1)+' de 3';
    $$('.wizard-bars span').forEach((x,i)=>x.classList.toggle('is-complete',i<=state.step));
    $('#wizard-back').hidden=state.step===0;
    $('#wizard-next').hidden=state.step===2;
    $('#wizard-submit').hidden=state.step!==2;
    if(state.step===2){
      const data=wizardData(),box=$('#wizard-review');box.replaceChildren();
      for(const [k,value] of [
        ['Tipo',CATEGORIES[data.category]],
        ['Categoría',SUBCATEGORIES[data.category]?.[data.subcategory]],
        ['Solicitud',data.title],
        ['Ciudad',data.city],
        ['Descripción',data.description]
      ]){
        const row=el('p','review-row');row.append(el('strong','',k+': '),document.createTextNode(value||''));box.append(row);
      }
    }
  }
  function validateStep(){
    const step=wizardSteps[state.step];
    for(const input of step.querySelectorAll('input,select,textarea')){
      if(!input.disabled&&!input.checkValidity()){input.reportValidity();return false;}
    }
    return true;
  }
  function setPicture(data){
    state.picture=data;
    const preview=$('#request-photo-preview');preview.replaceChildren();
    if(data){const img=el('img','uploaded-picture');img.src=data;img.alt='Fotografía seleccionada';preview.append(img);}
    $('#request-photo-remove').hidden=!data;
  }
  $('#request-photo').onchange=async e=>{
    const file=e.target.files?.[0];if(!file)return;
    try{
      if(!['image/jpeg','image/png','image/webp'].includes(file.type)||file.size>6000000)
        throw Error('Selecciona una fotografía JPG, PNG o WebP de hasta 6 MB.');
      const uri=await new Promise((resolve,reject)=>{
        const reader=new FileReader();reader.onload=()=>resolve(reader.result);
        reader.onerror=()=>reject(Error('No se pudo leer la fotografía.'));reader.readAsDataURL(file);
      });
      const img=await new Promise((resolve,reject)=>{
        const node=new Image();node.onload=()=>resolve(node);node.onerror=()=>reject(Error('No se pudo abrir la fotografía.'));node.src=uri;
      });
      const scale=Math.min(1,700/Math.max(img.width,img.height));
      const canvas=document.createElement('canvas');
      canvas.width=Math.max(1,Math.round(img.width*scale));
      canvas.height=Math.max(1,Math.round(img.height*scale));
      const ctx=canvas.getContext('2d');ctx.fillStyle='#fff';ctx.fillRect(0,0,canvas.width,canvas.height);ctx.drawImage(img,0,0,canvas.width,canvas.height);
      const picture=canvas.toDataURL('image/jpeg',.67);
      if(picture.length>400000)throw Error('La fotografía es demasiado grande. Selecciona otra más pequeña.');
      setPicture(picture);
    }catch(error){notify(error.message);}
    finally{e.target.value='';}
  };
  $('#request-photo-remove').onclick=()=>setPicture('');
  async function openPublish(request=null){
    if(!state.user){openAccount();notify('Inicia sesión para publicar.');return;}
    if(!state.profile){openAccount();return;}
    state.edit=request?.id||null;
    $('#publish-form').reset();setPicture('');fillCategories();chooseCity();
    let data=request;
    if(!request){
      try{const draft=await getDoc(doc(db,'drafts',state.user.uid));if(draft.exists())data=draft.data().data;}
      catch(e){notify('No se pudo recuperar el borrador: '+e.message);}
    }
    if(data){
      $('#request-category').value=data.category==='servicios'?'servicios':'bienes';fillCategories();
      for(const [key,id] of Object.entries({
        subcategory:'request-subcategory',title:'request-title',description:'request-description',
        quantity:'request-quantity',condition:'request-condition',budget:'request-budget',desiredDate:'request-date'
      }))if(data[key]!==null&&data[key]!==undefined)$('#'+id).value=String(data[key]);
      const cityIsListed=[...$('#request-city').options].some(x=>x.value===data.city);
      $('#request-city').value=cityIsListed?data.city:'__otra__';
      $('#request-city-other').value=cityIsListed?'':data.city||'';
      chooseCity();setPicture(data.picture||'');
    }
    $('#publish-title').textContent=request?'Edita tu necesidad':'Publica lo que necesitas';
    $('#wizard-submit').textContent=request?'Guardar cambios':'Guardar necesidad';
    $('#publish-error').hidden=true;$('#publish-error').textContent='';
    $('#wizard-clear').hidden=true;
    wizardStep(0);$('#publish-dialog').showModal();
  }
  $$('[data-open="publish"]').forEach(x=>x.onclick=()=>openPublish());
  $('.close-dialog').onclick=()=>$('#publish-dialog').close();
  $('#wizard-next').onclick=()=>{if(validateStep())wizardStep(state.step+1);};
  $('#wizard-back').onclick=()=>wizardStep(state.step-1);
  $('#wizard-draft').onclick=async()=>{
    if(!state.user){openAccount();return;}
    try{
      await setDoc(doc(db,'drafts',state.user.uid),{
        data:wizardData(),editingRequestId:state.edit||'',updatedAt:serverTimestamp()
      });
      $('#publish-dialog').close();notify('Borrador guardado.');
    }catch(e){notify('No se pudo guardar el borrador: '+e.message);}
  };
  $('#publish-form').onsubmit=async e=>{
    e.preventDefault();if(!validateStep())return;
    const error=$('#publish-error');error.hidden=true;
    try{
      if(!state.user||!state.profile)throw Error('Inicia sesión y completa tu perfil.');
      const normalized=normalizeRequest(wizardData());
      const data={...normalized};delete data.createdAt;
      if(state.edit){
        const own=state.requests.find(x=>x.id===state.edit);
        if(own?.ownerUid!==state.user.uid)throw Error('Solo puedes editar tus propias necesidades.');
        await updateDoc(doc(db,'requests',state.edit),data);
      }else{
        await addDoc(collection(db,'requests'),{...data,ownerUid:state.user.uid,createdAt:serverTimestamp()});
      }
      try{await deleteDoc(doc(db,'drafts',state.user.uid));}catch{}
      $('#publish-dialog').close();state.edit=null;setPicture('');
      location.hash='#mis-necesidades';notify('Tu solicitud se ha guardado correctamente.');
    }catch(ex){error.textContent=ex.message;error.hidden=false;}
  };
  // Solo se muestran los cuatro accesos originales de Inicio.
  fillCategories();populateFilters();renderAll();activateScreen();
}
