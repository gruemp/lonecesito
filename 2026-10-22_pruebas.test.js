import test from 'node:test';
import assert from 'node:assert/strict';
import {normalizeRequest,normalizeProposal,appendProposal,sortProposals,proposalUnitPrice,changeProposal,withdrawProposal,discardProposal,acceptProposal,confirmPartial,requestedRemaining,reopenCanceled,confirmOldProposal,decodeState,persistState,STORAGE_KEY,SUBCATEGORIES,buildDraft,updateLocalRequestStatus,SCREEN_IDS,resolveScreen,applyScreenNavigation} from './2026-10-22_app.js';
import {readFileSync} from 'node:fs';

const req={id:'necesidad-1',title:'Necesito empaques personalizados',city:'Bogotá',category:'bienes',subcategory:'insumos',description:'Necesito empaques con el logo del negocio.',quantity:10,condition:'cualquiera',status:'abierta'};
const offer=(name='Proveedor Uno',price=125000,quantity=5)=>({name,requestId:req.id,description:'Ofrecemos empaques impresos y entrega completa.',price:String(price),quantity:String(quantity)});
const fixture=()=>normalizeRequest(req);
const testImage='data:image/jpeg;base64,Zm9v';

test('valida los campos obligatorios y conserva texto literal sin ejecutarlo',()=>{
  assert.equal(normalizeRequest({...req,title:'   <script>alert(1)</script>   '}).title,'<script>alert(1)</script>');
  assert.throws(()=>normalizeRequest({...req,category:'__proto__'}));
  assert.throws(()=>normalizeRequest({...req,city:' '}));
  assert.throws(()=>normalizeRequest({...req,description:'corto'}));
});
test('diferencia bienes de servicios con fecha y presupuesto opcionales',()=>{
  const goods=normalizeRequest({...req,condition:'usado',budget:'120000',desiredDate:'2026-12-10'});
  assert.equal(goods.quantity,10);assert.equal(goods.condition,'usado');assert.equal(goods.desiredDate,'2026-12-10');
  assert.equal(goods.budget,120000);
  const service=normalizeRequest({...req,category:'servicios',subcategory:'mantenimiento',quantity:'',condition:'',budget:'',desiredDate:''});
  assert.equal(service.quantity,null);assert.equal(service.condition,null);assert.equal(service.budget,null);assert.equal(service.desiredDate,'');
  assert.ok(Object.hasOwn(SUBCATEGORIES.servicios,'mantenimiento'));
});
test('rechaza cantidades y fechas incorrectas',()=>{
  assert.throws(()=>normalizeRequest({...req,quantity:0}),/cantidad/);
  assert.throws(()=>normalizeRequest({...req,quantity:2.5}),/cantidad/);
  assert.throws(()=>normalizeRequest({...req,condition:'otro'}),/condición/);
  assert.throws(()=>normalizeRequest({...req,desiredDate:'2026-02-30'}),/fecha/);
  assert.throws(()=>normalizeRequest({...req,budget:'10.000'}),/presupuesto/);
});
test('las solicitudes no guardan datos de contacto y admiten una sola fotografía',()=>{
  const saved=normalizeRequest({...req,phone:'3200000000',email:'secret@example.com',picture:testImage});
  assert.equal(saved.picture,testImage);
  assert.equal(Object.hasOwn(saved,'phone'),false);assert.equal(Object.hasOwn(saved,'email'),false);
  assert.equal(normalizeRequest({...req,picture:'javascript:alert(1)'}).picture,'');
  assert.equal(normalizeRequest({...req,picture:'data:image/svg+xml;base64,Zm9v'}).picture,'');
});
test('toda nueva propuesta requiere un precio fijo positivo y cantidad',()=>{
  assert.equal(normalizeProposal(offer()).price,125000);
  assert.throws(()=>normalizeProposal({...offer(),price:''}),/precio fijo/);
  assert.throws(()=>normalizeProposal({...offer(),price:'-10'}),/precio/);
  assert.throws(()=>normalizeProposal({...offer(),price:'2.500'}),/precio/);
  assert.throws(()=>normalizeProposal({...offer(),quantity:0}),/cantidad/);
  assert.throws(()=>normalizeProposal({...offer(),price:'101',quantity:'3'}),/unitario/);
});
test('permite un número ilimitado de proveedores diferentes',()=>{
  let proposals=[];
  for(let i=0;i<16;i++)proposals=appendProposal(proposals,offer('Proveedor '+i));
  assert.equal(proposals.length,16);
  assert.throws(()=>appendProposal(proposals,offer('proveedor 0')),/Ya tienes una propuesta/);
  assert.equal(appendProposal(proposals,{...offer('proveedor 0'),requestId:'otra-necesidad'}).length,17);
});
test('una oferta retirada puede sustituirse pero no dos activas del mismo proveedor',()=>{
  let proposals=appendProposal([],offer());
  proposals=withdrawProposal(proposals,proposals[0].id);
  assert.equal(proposals[0].status,'retirada');
  proposals=appendProposal(proposals,offer('Proveedor Uno',115000));
  assert.equal(proposals.length,2);
  assert.equal(proposals[1].status,'activa');
});
test('el proveedor puede cambiar el precio antes de la aceptación con historial',()=>{
  const original=appendProposal([],offer());
  const id=original[0].id;
  const changed=changeProposal(original,id,{price:'100000'});
  assert.equal(changed[0].price,100000);
  assert.equal(changed[0].priceHistory[0].price,125000);
  assert.equal(original[0].price,125000);
  assert.equal(changed[0].updatedAt.length>0,true);
});
test('ordena ofertas por precio unitario para bienes',()=>{
  const offers=[
    normalizeProposal(offer('Proveedor A',120000,4)),
    normalizeProposal(offer('Proveedor B',150000,6)),
    normalizeProposal(offer('Proveedor C',280000,10))
  ];
  assert.equal(proposalUnitPrice(offers[1]),25000);
  assert.deepEqual(sortProposals(offers,'bienes').map(p=>p.name),['Proveedor B','Proveedor C','Proveedor A']);
  assert.deepEqual(sortProposals(offers,'servicios').map(p=>p.name),['Proveedor A','Proveedor B','Proveedor C']);
});
test('aceptar una oferta completa reserva las unidades para ese comprador',()=>{
  const request={...req,quantity:5};
  const ps=appendProposal([],offer());
  const updated=acceptProposal(ps,request,ps[0].id,5);
  assert.equal(updated[0].status,'aceptada');
  assert.equal(updated[0].acceptedQuantity,5);
  assert.equal(requestedRemaining(request,updated),0);
  assert.throws(()=>changeProposal(updated,ps[0].id,{price:'100000'}),/no se puede modificar/);
  assert.throws(()=>withdrawProposal(updated,ps[0].id),/no aceptada/);
});
test('las ventas parciales necesitan confirmación del proveedor',()=>{
  const request={...req,quantity:8};
  const ps=appendProposal([],offer('Tienda Uno',240000,8));
  const pending=acceptProposal(ps,request,ps[0].id,4);
  assert.equal(pending[0].status,'por_confirmar');
  assert.equal(pending[0].pendingQuantity,4);
  assert.equal(requestedRemaining(request,pending),4);
  const confirmed=confirmPartial(pending,ps[0].id);
  assert.equal(confirmed[0].status,'aceptada');
  assert.equal(confirmed[0].acceptedQuantity,4);
  assert.equal(proposalUnitPrice(confirmed[0])*4,120000);
});
test('aceptar cantidades fuera de lo disponible es inválido',()=>{
  const request={...req,quantity:3};
  const ps=appendProposal([],offer());
  assert.throws(()=>acceptProposal(ps,request,ps[0].id,4),/excede/);
  assert.throws(()=>acceptProposal(ps,{...request,status:'cancelada'},ps[0].id,1),/abierta/);
});
test('descartar una oferta no la elimina y se puede recuperar',()=>{
  const ps=appendProposal([],offer()),id=ps[0].id;
  const ignored=discardProposal(ps,id,true);
  assert.equal(ignored[0].discarded,true);
  const recovered=discardProposal(ignored,id,false);
  assert.equal(recovered[0].discarded,false);
});
test('cancelar y reactivar mantiene propuestas y requiere confirmar precios anteriores',()=>{
  const ps=appendProposal([],offer()),request={...req,status:'cancelada'};
  const reactivated=reopenCanceled([request],ps,request.id);
  assert.equal(reactivated.requests[0].status,'abierta');
  assert.equal(reactivated.proposals[0].status,'pendiente_confirmacion');
  const confirmed=confirmOldProposal(reactivated.proposals,ps[0].id);
  assert.equal(confirmed[0].status,'activa');
});
test('reabrir tras un acuerdo fallido no elimina la oferta antigua',()=>{
  const ps=appendProposal([],offer()),accepted=acceptProposal(ps,{...req,quantity:5},ps[0].id,5);
  const reopened=reopenCanceled([{...req,status:'en_proceso'}],accepted,req.id);
  assert.equal(reopened.requests[0].status,'abierta');
  assert.equal(reopened.proposals[0].status,'acuerdo_cancelado');
  assert.equal(reopened.proposals[0].acceptedQuantity,0);
});
test('las solicitudes pueden cerrarse desde abierta o en proceso',()=>{
  const initial=[{...req,status:'abierta'}];
  const inProgress=updateLocalRequestStatus(initial,req.id,'en_proceso');
  const done=updateLocalRequestStatus(inProgress,req.id,'resuelta');
  assert.equal(done[0].status,'resuelta');
  assert.equal(initial[0].status,'abierta');
  assert.throws(()=>updateLocalRequestStatus(done,req.id,'cancelada'),/abiertas o en proceso/);
  assert.throws(()=>updateLocalRequestStatus(initial,'no-existe','resuelta'),/No se encontró/);
});
test('la recuperación admite solicitudes antiguas y precios sin registrar como históricos',()=>{
  const state=decodeState(JSON.stringify({version:1,requests:[{...req,id:'vieja',category:'productos'}],proposals:[{...offer('Proveedor Viejo'),requestId:'vieja',price:null}]}));
  assert.equal(state.requests[0].category,'bienes');
  assert.equal(state.proposals.length,1);
  assert.equal(state.proposals[0].status,'historica');
  assert.equal(state.proposals[0].price,null);
});
test('la recuperación de propuestas antiguas ya no aplica límite de tres',()=>{
  const offers=Array.from({length:7},(_,i)=>offer('Empresa '+i,100000));
  const state=decodeState(JSON.stringify({version:1,requests:[req],proposals:offers}));
  assert.equal(state.proposals.length,7);
});
test('los borradores conservan campos permitidos y descartan contactos privados',()=>{
  const draft=buildDraft({...req,phone:'3000000000',email:'secret@example.com',picture:testImage,unknown:'secreto'});
  assert.equal(draft.picture,testImage);
  assert.equal(draft.title,req.title);
  assert.equal(Object.hasOwn(draft,'phone'),false);
  assert.equal(Object.hasOwn(draft,'email'),false);
  assert.equal(Object.hasOwn(draft,'unknown'),false);
});
test('recupera borradores válidos y elimina referencias a solicitudes cerradas',()=>{
  const saved={...req,id:'local-1'};
  const draft={data:buildDraft(saved),editingRequestId:'local-1'};
  const restored=decodeState(JSON.stringify({version:1,requests:[saved],draft}));
  assert.equal(restored.draft.editingRequestId,'local-1');
  const closed=decodeState(JSON.stringify({version:1,requests:[{...saved,status:'cancelada'}],draft}));
  assert.equal(closed.draft.editingRequestId,null);
});
test('no se pierden favoritos, nombres y contador de ofertas vistas',()=>{
  const timestamp='2026-10-23T20:00:00.000Z';
  const st=decodeState(JSON.stringify({version:1,requests:[req],favorites:[req.id],seen:{[req.id]:timestamp},name:'Ana'}));
  assert.deepEqual(st.favorites,[req.id]);assert.equal(st.seen[req.id],timestamp);assert.equal(st.name,'Ana');
});
test('un fallo de almacenamiento no se presenta como guardado exitoso',()=>{
  const st=decodeState(null);
  assert.equal(persistState(undefined,st),false);
  assert.equal(persistState({setItem(){throw Error('quota');}},st),false);
  const values=new Map();
  assert.equal(persistState({setItem(k,v){values.set(k,v);}},st),true);
  assert.equal(JSON.parse(values.get(STORAGE_KEY)).version,1);
});
test('el HTML contiene formularios, filtros, foto única, controles y textos de demo',()=>{
  const html=readFileSync(new URL('./index.html',import.meta.url),'utf8');
  const ids=[...html.matchAll(/\bid="([^"]+)"/g)].map(x=>x[1]);
  assert.equal(new Set(ids).size,ids.length);
  for(const id of ['hero-form','list-city','request-photo','request-photo-preview','proposal-photo','proposal-price','proposal-quantity','favorites-grid','my-proposals-grid','my-requests-grid','wizard-submit','wizard-next','wizard-back','report-request']){
    assert.ok(html.includes('id="'+id+'"'),'Falta '+id);
  }
  for(const step of [0,1,2])assert.ok(html.includes('data-wizard-step="'+step+'"'));
  assert.ok(html.includes('sin SMS'));
  assert.ok(html.includes('Propuestas sin límite'));
});

test('la navegación compacta admite cinco vistas y recupera inicio ante rutas desconocidas',()=>{
  assert.deepEqual(SCREEN_IDS,['inicio','necesidades','mis-necesidades','mis-propuestas','favoritos']);
  for(const id of SCREEN_IDS)assert.equal(resolveScreen('#'+id),id);
  assert.equal(resolveScreen('#una-pagina-antigua'),'inicio');
  assert.equal(resolveScreen(''),'inicio');
});
test('la portada y las listas no cargan imágenes automáticamente',()=>{
  const html=readFileSync(new URL('./index.html',import.meta.url),'utf8');
  assert.equal(/<img\b/i.test(html),false,'El HTML inicial no debe incluir imágenes visibles');
  assert.equal(/rel="preload"[^>]*as="image"/i.test(html),false);
  assert.ok(html.includes('Ver detalles'));
  assert.ok(html.includes('¿Qué necesitas?'));
  assert.ok(html.includes('Ver necesidades para ofertar'));
  assert.ok(html.includes('href="#necesidades" data-explore'));
});
test('solo una vista está visible al iniciar y todas tienen su navegación correspondiente',()=>{
  const html=readFileSync(new URL('./index.html',import.meta.url),'utf8');
  for(const id of SCREEN_IDS){
    assert.ok(html.includes('id="'+id+'" data-screen="'+id+'"')||html.includes('id="'+id+'"')&&html.includes('data-screen="'+id+'"'));
    assert.ok(html.includes('data-screen-link="'+id+'"'));
  }
  for(const id of SCREEN_IDS.filter(id=>id!=='inicio')){
    const element=new RegExp('<section[^>]*id="'+id+'"[^>]*>');
    const match=html.match(element);
    assert.ok(match&&match[0].includes('hidden'),'La vista '+id+' debe iniciar oculta');
  }
  const screens=[...html.matchAll(/\bdata-screen="([^"]+)"/g)].map(m=>m[1]);
  assert.deepEqual(screens,[...SCREEN_IDS]);
});
test('las fotos se revelan bajo demanda también en formularios y propuestas',()=>{
  const html=readFileSync(new URL('./index.html',import.meta.url),'utf8');
  const js=readFileSync(new URL('./2026-10-22_app.js',import.meta.url),'utf8');
  assert.ok(js.includes("button.addEventListener('click',()=>{"));
  assert.ok(js.includes("const show=frame.hidden;"));
  assert.ok(js.includes("frame.replaceChildren();"));
  assert.ok(js.includes("const image=pictureNode(data,caption)"));
  assert.ok(js.includes("addPictureToggle(box,current,'Fotografía seleccionada')"));
  assert.ok(js.includes("addPictureToggle(photo,request.picture"));
  assert.ok(js.includes("addPictureToggle(reveal,p.picture"));
  assert.ok(html.includes('id="request-photo-preview"')&&html.includes('id="proposal-photo-preview"'));
  assert.ok(html.includes('id="detail-photo"'));
});
test('las secciones adicionales aparecen solo a petición del usuario',()=>{
  const html=readFileSync(new URL('./index.html',import.meta.url),'utf8');
  assert.ok(html.includes('<details class="compact-help">'));
  assert.ok(html.includes('<details class="compact-filters"'));
  assert.ok(html.includes('id="more-filters"'));
  assert.ok(html.includes('id="screen-navigation"'));
});

test('el menú muestra la vista elegida y oculta todas las demás',()=>{
  const screens=SCREEN_IDS.map(id=>({id,hidden:id!=='inicio'}));
  const links=SCREEN_IDS.map(id=>({
    dataset:{screenLink:id},
    attributes:new Map(),
    setAttribute(name,value){this.attributes.set(name,value);},
    removeAttribute(name){this.attributes.delete(name);}
  }));
  const root={
    querySelectorAll(selector){
      if(selector==='.app-screen')return screens;
      if(selector==='[data-screen-link]')return links;
      throw Error('Selector inesperado: '+selector);
    }
  };
  for(const selected of SCREEN_IDS){
    assert.equal(applyScreenNavigation(root,'#'+selected),selected);
    assert.deepEqual(screens.filter(el=>!el.hidden).map(el=>el.id),[selected]);
    assert.deepEqual(links.filter(el=>el.attributes.get('aria-current')==='page').map(el=>el.dataset.screenLink),[selected]);
  }
  assert.equal(applyScreenNavigation(root,'#inexistente'),'inicio');
  assert.deepEqual(screens.filter(el=>!el.hidden).map(el=>el.id),['inicio']);
});
test('la navegación se activa tras los cambios de URL y al cargar la página',()=>{
  const js=readFileSync(new URL('./2026-10-22_app.js',import.meta.url),'utf8');
  const html=readFileSync(new URL('./index.html',import.meta.url),'utf8');
  assert.ok(js.includes("window.addEventListener('hashchange',()=>activateScreen(window.location.hash))"));
  assert.ok(js.includes("activateScreen(window.location.hash)"));
  for(const screen of SCREEN_IDS)assert.ok(html.includes('href="#'+screen+'" data-screen-link="'+screen+'"'));
  assert.equal(/(?:^|[^$])\$\(['"][^'"]+['"]\)\.forEach/m.test(js),false,'No iterar querySelector con forEach');
});
