import test,{before,after} from 'node:test';
import {readFileSync} from 'node:fs';
import {initializeTestEnvironment,assertFails,assertSucceeds} from '@firebase/rules-unit-testing';
import {collection,doc,setDoc,getDoc,getDocs,writeBatch,updateDoc,serverTimestamp} from 'firebase/firestore';

let env;
const A='owner-a',B='applicant-b',C='outsider-c',D='no-consent-d';
const requestData=(owner=A,status='abierta')=>({
  ownerUid:owner,title:'Necesito apoyo',city:'Santa Marta',category:'servicios',
  subcategory:'mantenimiento',description:'Necesito ayuda para una reparación en mi hogar.',
  budget:null,desiredDate:'',quantity:null,condition:null,picture:'',
  createdAt:serverTimestamp(),status
});
const profile=(uid,name,phone,consent=true)=>({
  uid,name,phone,email:uid+'@example.test',discloseConsent:consent,createdAt:serverTimestamp()
});
const db=uid=>env.authenticatedContext(uid).firestore();

before(async()=>{
  if(!process.env.FIRESTORE_EMULATOR_HOST)throw Error('Este test requiere Firestore Emulator. Ejecuta npm run test:rules.');
  env=await initializeTestEnvironment({
    projectId:'demo-lonecesito-privacidad',
    firestore:{rules:readFileSync(new URL('../firestore.rules',import.meta.url),'utf8')}
  });
  await env.withSecurityRulesDisabled(async context=>{
    const root=context.firestore();
    for(const [id,name,phone,consent] of [
      [A,'Publicador','3001112233',true],
      [B,'Interesado B','3002223344',true],
      [C,'Persona C','3003334455',true],
      [D,'Persona D','3004445566',false]
    ])await setDoc(doc(root,'profiles',id),profile(id,name,phone,consent));
    for(const name of ['sample','fresh','closed','spoof','duplicate'])
      await setDoc(doc(root,'requests',name),requestData(A,name==='closed'?'cancelada':'abierta'));
    await setDoc(doc(root,'requests','sample','applications',B),{
      uid:B,name:'Interesado B',phone:'3002223344',appliedAt:serverTimestamp()
    });
    await setDoc(doc(root,'applicationsByUser',B,'items','sample'),{requestId:'sample',appliedAt:serverTimestamp()});
    await setDoc(doc(root,'requests','duplicate','applications',B),{
      uid:B,name:'Interesado B',phone:'3002223344',appliedAt:serverTimestamp()
    });
    await setDoc(doc(root,'applicationsByUser',B,'items','duplicate'),{requestId:'duplicate',appliedAt:serverTimestamp()});
  });
});
after(async()=>{if(env)await env.cleanup();});

test('la necesidad es pública pero los perfiles no',async()=>{
  const anon=env.unauthenticatedContext().firestore();
  await assertSucceeds(getDoc(doc(anon,'requests','sample')));
  await assertSucceeds(getDocs(collection(anon,'requests')));
  await assertFails(getDoc(doc(anon,'profiles',B)));
  await assertFails(getDoc(doc(db(C),'profiles',B)));
  await assertSucceeds(getDoc(doc(db(B),'profiles',B)));
});

test('solo el propietario ve la lista de todos los interesados',async()=>{
  await assertSucceeds(getDocs(collection(db(A),'requests','sample','applications')));
  await assertSucceeds(getDoc(doc(db(B),'requests','sample','applications',B)));
  await assertFails(getDocs(collection(db(B),'requests','sample','applications')));
  await assertFails(getDocs(collection(db(C),'requests','sample','applications')));
  await assertFails(getDoc(doc(db(C),'requests','sample','applications',B)));
  await assertFails(getDoc(doc(env.unauthenticatedContext().firestore(),'requests','sample','applications',B)));
});

test('el interesado solo ve su índice privado',async()=>{
  await assertSucceeds(getDocs(collection(db(B),'applicationsByUser',B,'items')));
  await assertFails(getDocs(collection(db(C),'applicationsByUser',B,'items')));
  await assertFails(getDoc(doc(db(A),'applicationsByUser',B,'items','sample')));
});

test('aplicación directa válida: datos personales privados e índice atómicos',async()=>{
  const firestore=db(B),batch=writeBatch(firestore);
  batch.set(doc(firestore,'requests','fresh','applications',B),{
    uid:B,name:'Interesado B',phone:'3002223344',appliedAt:serverTimestamp()
  });
  batch.set(doc(firestore,'applicationsByUser',B,'items','fresh'),{
    requestId:'fresh',appliedAt:serverTimestamp()
  });
  await assertSucceeds(batch.commit());
  await assertSucceeds(getDoc(doc(db(A),'requests','fresh','applications',B)));
  await assertFails(getDoc(doc(db(C),'requests','fresh','applications',B)));
});

test('no es posible aplicar dos veces, cambiar el teléfono ni suplantar a otra cuenta',async()=>{
  const firestore=db(B),dup=writeBatch(firestore);
  dup.set(doc(firestore,'requests','duplicate','applications',B),{
    uid:B,name:'Interesado B',phone:'3002223344',appliedAt:serverTimestamp()
  });
  dup.set(doc(firestore,'applicationsByUser',B,'items','duplicate'),{
    requestId:'duplicate',appliedAt:serverTimestamp()
  });
  await assertFails(dup.commit());

  const fake=writeBatch(firestore);
  fake.set(doc(firestore,'requests','spoof','applications',B),{
    uid:B,name:'Interesado B',phone:'9999999999',appliedAt:serverTimestamp()
  });
  fake.set(doc(firestore,'applicationsByUser',B,'items','spoof'),{
    requestId:'spoof',appliedAt:serverTimestamp()
  });
  await assertFails(fake.commit());
  await assertFails(setDoc(doc(firestore,'requests','spoof','applications',C),{
    uid:C,name:'Persona C',phone:'3003334455',appliedAt:serverTimestamp()
  }));
});

test('no se aplica a necesidades cerradas ni sin consentimiento',async()=>{
  const blockedDb=db(B),blocked=writeBatch(blockedDb);
  blocked.set(doc(blockedDb,'requests','closed','applications',B),{
    uid:B,name:'Interesado B',phone:'3002223344',appliedAt:serverTimestamp()
  });
  blocked.set(doc(blockedDb,'applicationsByUser',B,'items','closed'),{
    requestId:'closed',appliedAt:serverTimestamp()
  });
  await assertFails(blocked.commit());

  const notConsentedDb=db(D),notConsented=writeBatch(notConsentedDb);
  notConsented.set(doc(notConsentedDb,'requests','spoof','applications',D),{
    uid:D,name:'Persona D',phone:'3004445566',appliedAt:serverTimestamp()
  });
  notConsented.set(doc(notConsentedDb,'applicationsByUser',D,'items','spoof'),{
    requestId:'spoof',appliedAt:serverTimestamp()
  });
  await assertFails(notConsented.commit());
});

test('nadie modifica necesidades ajenas ni agrega teléfonos a sus campos públicos',async()=>{
  await assertFails(updateDoc(doc(db(B),'requests','sample'),{title:'Manipulado'}));
  await assertFails(updateDoc(doc(db(A),'requests','sample'),{phone:'3000000000'}));
  await assertFails(updateDoc(doc(db(A),'requests','sample'),{ownerUid:B}));
  await assertSucceeds(updateDoc(doc(db(A),'requests','sample'),{status:'resuelta'}));
});
