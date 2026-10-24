import test,{before,after} from 'node:test';
import {readFileSync} from 'node:fs';
import {initializeTestEnvironment,assertFails,assertSucceeds} from '@firebase/rules-unit-testing';
import {collection,doc,setDoc,getDoc,getDocs,updateDoc,deleteDoc,serverTimestamp} from 'firebase/firestore';

let env;
const OWNER='owner-a',OTHER='other-b';
const data=(owner=OWNER)=>({
  ownerUid:owner,title:'Necesito reparar una nevera',category:'servicios',city:'Santa Marta',
  description:'Busco una reparación de mi nevera porque dejó de enfriar.',
  contactPhone:'573001234567',contactConsent:true,budget:null,quantity:null,condition:null,
  picture:'',createdAt:serverTimestamp()
});
const db=uid=>env.authenticatedContext(uid).firestore();

before(async()=>{
  if(!process.env.FIRESTORE_EMULATOR_HOST)throw Error('Ejecuta las pruebas con Firebase Emulator: npm run test:rules.');
  env=await initializeTestEnvironment({
    projectId:'demo-lonecesito-privacidad',
    firestore:{rules:readFileSync(new URL('../firestore.rules',import.meta.url),'utf8')}
  });
  await env.withSecurityRulesDisabled(async c=>{
    await setDoc(doc(c.firestore(),'requests','public-existing'),data(OWNER));
  });
});
after(async()=>{if(env)await env.cleanup();});

test('todos pueden ver publicaciones y teléfonos autorizados',async()=>{
  const anonymous=env.unauthenticatedContext().firestore();
  await assertSucceeds(getDoc(doc(anonymous,'requests','public-existing')));
  await assertSucceeds(getDocs(collection(anonymous,'requests')));
});
test('solo un usuario autenticado puede publicar a su nombre',async()=>{
  await assertSucceeds(setDoc(doc(db(OWNER),'requests','valid-new'),data(OWNER)));
  await assertFails(setDoc(doc(db(OTHER),'requests','impersonated'),data(OWNER)));
  await assertFails(setDoc(doc(env.unauthenticatedContext().firestore(),'requests','anonymous'),data(OWNER)));
});
test('WhatsApp y consentimiento son obligatorios',async()=>{
  await assertFails(setDoc(doc(db(OWNER),'requests','without-phone'),{...data(OWNER),contactPhone:''}));
  await assertFails(setDoc(doc(db(OWNER),'requests','without-consent'),{...data(OWNER),contactConsent:false}));
  await assertFails(setDoc(doc(db(OWNER),'requests','bad-phone'),{...data(OWNER),contactPhone:'123'}));
  await assertFails(setDoc(doc(db(OWNER),'requests','extra'),{...data(OWNER),privateEmail:'secreto@ejemplo.test'}));
});
test('solo el propietario puede editar o eliminar',async()=>{
  const path='public-existing';
  await assertFails(updateDoc(doc(db(OTHER),'requests',path),{title:'Alterado por tercero'}));
  await assertFails(deleteDoc(doc(db(OTHER),'requests',path)));
  await assertFails(updateDoc(doc(db(OWNER),'requests',path),{ownerUid:OTHER}));
  await assertSucceeds(updateDoc(doc(db(OWNER),'requests',path),{title:'Necesito reparar una nevera pronto'}));
  await assertSucceeds(deleteDoc(doc(db(OWNER),'requests',path)));
});
test('no se pueden crear aplicaciones, propuestas ni perfiles',async()=>{
  await assertFails(setDoc(doc(db(OTHER),'requests','valid-new','applications',OTHER),{uid:OTHER}));
  await assertFails(setDoc(doc(db(OWNER),'profiles',OWNER),{name:'Persona'}));
});
