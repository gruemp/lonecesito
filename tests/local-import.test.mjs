import test from 'node:test';
import assert from 'node:assert/strict';
import {localImportCandidates,localImportId,prepareLocalImport,importLocalPublications} from '../local-import.js';
const record={id:'local-1',ownerUid:'demo-browser',description:'Necesito reparar una nevera',contactPhone:'3001234567',contactConsent:true,
  addressText:'Calle 10 #5-20, apto 2',picture:'data:image/jpeg;base64,AAAA',
  location:{latitude:11,longitude:-74,accuracy:3,country:'Colombia',addressSource:'google',address:'Calle 10 #5-20'}};
function harness(){
  const docs=new Map(),completed=[];
  const api={auth:{currentUser:{uid:'author'}},db:{},serverTimestamp:()=>123,
    doc:(db,collection,id)=>collection+'/'+id,
    async runTransaction(db,work){return work({
      async get(ref){return {exists:()=>docs.has(ref),data:()=>docs.get(ref)};},
      set(ref,data){docs.set(ref,data);}
    });}};
  return {api,docs,completed,run:items=>importLocalPublications(items,{uid:'author',api,onComplete:id=>completed.push(id)})};
}
test('selección local excluye ejemplos, otros propietarios, falta de consentimiento y duplicados',()=>{
  assert.deepEqual(localImportCandidates([record,record,{...record,id:'other',ownerUid:'foreign'},
    {...record,id:'example',example:true},{...record,id:'no-consent',contactConsent:false}]).map(r=>r.id),['local-1']);
  assert.deepEqual(localImportCandidates([record],new Set(['local-1'])),[]);
});
test('IDs estables por autor y publicación impiden duplicar reintentos y no exponen valores locales',async()=>{
  const first=await localImportId('author','local-1');
  assert.match(first,/^import-[a-f0-9]{64}$/);
  assert.equal(first,await localImportId('author','local-1'));
  assert.notEqual(first,await localImportId('other-author','local-1'));
});
test('preparación conserva teléfono, foto, GPS y dirección histórica, excluyendo datos privados',()=>{
  const input={...record,email:'private@example.com',location:{...record.location,email:'private@example.com'}};
  const copy=structuredClone(input),data=prepareLocalImport(input,'author',123);
  assert.deepEqual(input,copy);
  assert.equal(data.contactPhone,'573001234567');assert.equal(data.picture,record.picture);
  assert.deepEqual(data.location,record.location);assert.equal(data.addressText,record.addressText);
  assert.equal(data.ownerUid,'author');assert.equal(data.createdAt,123);
  assert.equal(data.email,undefined);assert.equal(data.id,undefined);assert.equal(data.location.email,undefined);
});
test('registros incompatibles fallan sin cortar texto ni borrar datos originales',()=>{
  for(const input of [{...record,description:'A'.repeat(1001)},{...record,picture:'x'.repeat(400001)},
    {...record,location:{...record.location,latitude:95}},{...record,addressText:'a'.repeat(181)}]){
    const copy=structuredClone(input);assert.throws(()=>prepareLocalImport(input,'author',123));assert.deepEqual(input,copy);
  }
});
test('importación explícita es idempotente y no sobrescribe una publicación editada en Firebase',async()=>{
  const h=harness(),copy=structuredClone(record);let result=await h.run([record]);
  assert.equal(result.created,1);assert.equal(h.docs.size,1);assert.deepEqual(record,copy);
  const id=[...h.docs.keys()][0];h.docs.get(id).description='Texto editado en Firebase';
  result=await h.run([record]);assert.equal(result.created,0);assert.equal(result.existing,1);
  assert.equal(h.docs.get(id).description,'Texto editado en Firebase');
});
test('errores parciales no marcan los registros fallidos y permiten reintentar',async()=>{
  const h=harness(),bad={...record,id:'bad',description:'x'.repeat(1001)};
  const result=await h.run([record,bad]);assert.equal(result.created,1);assert.equal(result.failed.length,1);
  assert.deepEqual(h.completed,['local-1']);assert.equal(bad.description.length,1001);
  bad.description='Descripción corregida';assert.equal((await h.run([bad])).created,1);
});
test('sin sesión y al cambiar de cuenta se detiene la recuperación',async()=>{
  const h=harness();h.api.auth.currentUser=null;await assert.rejects(h.run([record]),/Inicia sesión/);
  h.api.auth.currentUser={uid:'author'};
  await assert.rejects(importLocalPublications([record,{...record,id:'second'}],{
    uid:'author',api:h.api,onComplete:()=>{h.api.auth.currentUser={uid:'other'};}}),/cuenta cambió/);
  assert.equal(h.docs.size,1);
});
test('un destino con propietario ajeno nunca se sobrescribe',async()=>{
  const h=harness(),id=await localImportId('author',record.id);
  h.docs.set('requests/'+id,{ownerUid:'other'});const result=await h.run([record]);
  assert.equal(result.failed.length,1);assert.deepEqual(h.docs.get('requests/'+id),{ownerUid:'other'});
});
