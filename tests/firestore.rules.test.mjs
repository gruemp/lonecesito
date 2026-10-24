import test,{before,after} from 'node:test';
import {readFileSync} from 'node:fs';
import {initializeTestEnvironment,assertFails,assertSucceeds} from '@firebase/rules-unit-testing';
import {collection,doc,setDoc,getDoc,getDocs,updateDoc,deleteDoc,deleteField,serverTimestamp} from 'firebase/firestore';

let env;
const A='usuario-a',B='usuario-b';
const publication=(owner=A)=>({
  ownerUid:owner,
  title:'Necesito reparar una nevera',
  description:'Necesito reparar una nevera que no está enfriando y estoy en Santa Marta.',
  contactPhone:'573001234567',
  contactConsent:true,
  createdAt:serverTimestamp()
});
const db=uid=>env.authenticatedContext(uid).firestore();

before(async()=>{
  if(!process.env.FIRESTORE_EMULATOR_HOST)throw Error('Ejecuta npm run test:rules.');
  env=await initializeTestEnvironment({
    projectId:'demo-lonecesito-privacidad',
    firestore:{rules:readFileSync(new URL('../firestore.rules',import.meta.url),'utf8')}
  });
  await env.withSecurityRulesDisabled(async ctx=>{
    await setDoc(doc(ctx.firestore(),'requests','existente'),publication(A));
    await setDoc(doc(ctx.firestore(),'requests','antigua'),{
      ...publication(A),category:'bienes',city:'Santa Marta',
      subcategory:'Electrodomésticos',quantity:1,
      condition:'usado',budget:null,desiredDate:'',status:'abierta',picture:''
    });
  });
});
after(async()=>{if(env)await env.cleanup();});

test('las publicaciones se pueden leer sin iniciar sesión',async()=>{
  const anon=env.unauthenticatedContext().firestore();
  await assertSucceeds(getDoc(doc(anon,'requests','existente')));
  await assertSucceeds(getDocs(collection(anon,'requests')));
});
test('solo el autor autenticado puede publicar',async()=>{
  await assertSucceeds(setDoc(doc(db(A),'requests','nueva'),publication(A)));
  await assertFails(setDoc(doc(db(B),'requests','suplantada'),publication(A)));
  await assertFails(setDoc(doc(env.unauthenticatedContext().firestore(),'requests','anonima'),publication(A)));
});
test('se rechazan números inválidos, campos innecesarios y solicitudes vacías',async()=>{
  await assertFails(setDoc(doc(db(A),'requests','sintelefono'),{...publication(A),contactPhone:''}));
  await assertFails(setDoc(doc(db(A),'requests','sinconsentimiento'),{...publication(A),contactConsent:false}));
  await assertFails(setDoc(doc(db(A),'requests','informacionextra'),{...publication(A),email:'usuario@ejemplo.com'}));
  await assertFails(setDoc(doc(db(A),'requests','textoinsuficiente'),{...publication(A),description:'abc'}));
});
test('solo el propietario modifica o elimina sus solicitudes',async()=>{
  await assertFails(updateDoc(doc(db(B),'requests','existente'),{description:'Texto modificado por otra cuenta.'}));
  await assertFails(deleteDoc(doc(db(B),'requests','existente')));
  await assertFails(updateDoc(doc(db(A),'requests','existente'),{ownerUid:B}));
  await assertSucceeds(updateDoc(doc(db(A),'requests','existente'),{description:'Necesito reparar la nevera; contactarme por WhatsApp.'}));
  await assertSucceeds(deleteDoc(doc(db(A),'requests','existente')));
});
test('una publicación antigua puede migrar al texto único preservando su dueño',async()=>{
  await assertSucceeds(updateDoc(doc(db(A),'requests','antigua'),{
    description:'Necesito reparar una nevera. Ciudad: Santa Marta. Cantidad: 1. Estado: usado.',
    title:'Necesito reparar una nevera',
    category:deleteField(),city:deleteField(),subcategory:deleteField(),
    quantity:deleteField(),condition:deleteField(),budget:deleteField(),
    desiredDate:deleteField(),status:deleteField()
  }));
  await assertFails(updateDoc(doc(db(B),'requests','antigua'),{description:'Cambio ilegal desde otra cuenta.'}));
});
test('no se permite registrar interesados ni datos de terceros',async()=>{
  await assertFails(setDoc(doc(db(B),'requests','nueva','applications',B),{uid:B}));
  await assertFails(setDoc(doc(db(A),'profiles',A),{phone:'573001234567'}));
});


test('foto opcional: solo el autor puede añadir, cambiar o quitar una imagen',async()=>{
  const image='data:image/jpeg;base64,AAAA';
  await assertSucceeds(setDoc(doc(db(A),'requests','con-foto'),{
    ...publication(A),picture:image
  }));
  await assertSucceeds(updateDoc(doc(db(A),'requests','con-foto'),{
    picture:'data:image/jpeg;base64,BBBB'
  }));
  await assertFails(updateDoc(doc(db(B),'requests','con-foto'),{
    picture:image
  }));
  await assertSucceeds(updateDoc(doc(db(A),'requests','con-foto'),{
    picture:deleteField()
  }));
  await assertFails(setDoc(doc(db(A),'requests','foto-excesiva'),{
    ...publication(A),picture:'x'.repeat(400001)
  }));
});
