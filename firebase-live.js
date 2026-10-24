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
