import test from 'node:test';
import assert from 'node:assert/strict';
import {normalizeRequest,appendProposal,decodeState,persistState,STORAGE_KEY} from './2026-10-22_app.js';

const request={title:'Necesito empaques personalizados',city:'Bogotá',category:'productos',description:'Busco cien empaques con mi logo para esta semana.'};
const proposal=(name='Proveedor Uno')=>({name,requestId:'empaques',description:'Ofrecemos los cien empaques con entrega en cinco días.'});

test('validates buyer requirements and keeps input as plain text',()=>{
  const normalized=normalizeRequest({...request,title:'  <script>alert(1)</script>  '});
  assert.equal(normalized.title,'<script>alert(1)</script>');
  assert.throws(()=>normalizeRequest({...request,category:'__proto__'}));
  assert.throws(()=>normalizeRequest({...request,city:' '}));
  assert.throws(()=>normalizeRequest({...request,description:'corto'}));
});
test('limits proposals per request to three and prevents duplicates',()=>{
  let proposals=appendProposal([],proposal());
  assert.throws(()=>appendProposal(proposals,proposal('proveedor uno')),/Ya guardaste/);
  proposals=appendProposal(proposals,proposal('Proveedor Dos'));
  proposals=appendProposal(proposals,proposal('Proveedor Tres'));
  assert.throws(()=>appendProposal(proposals,proposal('Proveedor Cuatro')),/tres propuestas/);
  assert.equal(appendProposal(proposals,{...proposal('Otro'),requestId:'uniformes'}).length,4);
});
test('recovers from corrupted, legacy, or malformed local records',()=>{
  assert.deepEqual(decodeState('{broken'),decodeState(null));
  assert.deepEqual(decodeState('{"version":2}'),decodeState(null));
  const recovered=decodeState(JSON.stringify({version:1,requests:[{...request,id:'local-1'},{...request,id:'local-1'},null,{id:'bad'}],proposals:[proposal(),{...proposal(),requestId:'nonexistent'}],provider:{name:8},name:'Ana'}));
  assert.equal(recovered.requests.length,1);assert.equal(recovered.proposals.length,1);assert.equal(recovered.provider,null);assert.equal(recovered.name,'Ana');
});
test('stored proposals cannot bypass limits or target unknown requests',()=>{
  const recovered=decodeState(JSON.stringify({version:1,proposals:['Uno','Dos','Tres','Cuatro'].map(name=>proposal(name))}));
  assert.equal(recovered.proposals.length,3);
});
test('storage failure is reported, and successful saves use the correct key',()=>{
  assert.equal(persistState({setItem(){throw new Error('quota');}},decodeState(null)),false);
  assert.equal(persistState(undefined,decodeState(null)),false);
  const memory=new Map();assert.equal(persistState({setItem:(k,v)=>memory.set(k,v)},decodeState(null)),true);
  assert.equal(JSON.parse(memory.get(STORAGE_KEY)).version,1);
});
