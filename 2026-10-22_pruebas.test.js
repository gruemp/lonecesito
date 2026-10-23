import test from 'node:test';
import assert from 'node:assert/strict';
import {normalizeRequest,normalizeProposal,appendProposal,decodeState,persistState,STORAGE_KEY,SUBCATEGORIES} from './2026-10-22_app.js';

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

test('normalizes goods and services with category-specific data',()=>{
  const goods=normalizeRequest({...request,category:'bienes',subcategory:'insumos',quantity:'12',condition:'usado',budget:'120000',desiredDate:'2026-12-10',phone:'3005550199'});
  assert.equal(goods.category,'bienes');
  assert.equal(goods.quantity,12);
  assert.equal(goods.condition,'usado');
  assert.equal(goods.budget,120000);
  assert.equal(goods.desiredDate,'2026-12-10');
  assert.equal(Object.hasOwn(goods,'phone'),false);
  assert.ok(Object.hasOwn(SUBCATEGORIES.bienes,'insumos'));
  const service=normalizeRequest({...request,category:'servicios',subcategory:'mantenimiento',budget:'',desiredDate:''});
  assert.equal(service.quantity,null);
  assert.equal(service.budget,null);
  assert.equal(service.subcategory,'mantenimiento');
});
test('rejects invalid quantities, costs, conditions and calendar dates',()=>{
  const goods={...request,category:'bienes',quantity:'1',condition:'nuevo'};
  assert.throws(()=>normalizeRequest({...goods,quantity:'0'}),/cantidad/);
  assert.throws(()=>normalizeRequest({...goods,quantity:'0.2'}),/cantidad/);
  assert.throws(()=>normalizeRequest({...goods,condition:'irrelevante'}),/condición/);
  assert.throws(()=>normalizeRequest({...goods,budget:'1.000'}),/presupuesto/);
  assert.throws(()=>normalizeRequest({...goods,desiredDate:'2026-02-30'}),/fecha/);
  assert.throws(()=>normalizeRequest({...goods,category:'empresa'}),/bien o servicio/);
});
test('migrates older products and business types without dropping them',()=>{
  const migrated=decodeState(JSON.stringify({version:1,requests:[
    {...request,category:'productos',id:'antiguo-1'},
    {...request,category:'negocios',id:'antiguo-2'}
  ]}));
  assert.equal(migrated.requests.length,2);
  assert.deepEqual(migrated.requests.map(item=>item.category),['bienes','bienes']);
  assert.deepEqual(migrated.requests.map(item=>item.status),['abierta','abierta']);
});
test('keeps private fields out of locally stored request records',()=>{
  const next=decodeState(null);
  const clean=normalizeRequest({...request,category:'bienes',quantity:'1',phone:'3005550199'});
  assert.equal(persistState({setItem(k,v){const obj=JSON.parse(v);assert.equal(JSON.stringify(obj).includes('3005550199'),false);}}, {...next,requests:[{...clean,id:'local-private'}]}),true);
});
test('normalizes structured proposals, limits prices and preserves resolved states',()=>{
  const p=normalizeProposal({...proposal(),price:'125000',delivery:'5 días',exclusions:'transporte',warranty:'30 días'});
  assert.equal(p.price,125000);
  assert.equal(p.delivery,'5 días');
  assert.equal(p.exclusions,'transporte');
  assert.equal(p.warranty,'30 días');
  assert.throws(()=>normalizeProposal({...proposal(),price:'-30'}),/precio/);
  const restored=decodeState(JSON.stringify({version:1,requests:[{...request,id:'local-done',category:'bienes',quantity:2,status:'resuelta'}]}));
  assert.equal(restored.requests[0].status,'resuelta');
});
