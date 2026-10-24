import test from 'node:test';
import assert from 'node:assert/strict';
import {normalizeRequest,normalizeProposal,appendProposal,sortProposals,proposalUnitPrice,changeProposal,withdrawProposal,discardProposal,acceptProposal,confirmPartial,requestedRemaining,reopenCanceled,confirmOldProposal,decodeState,persistState,STORAGE_KEY,SUBCATEGORIES,buildDraft,updateLocalRequestStatus,SCREEN_IDS,resolveScreen,applyScreenNavigation,EXAMPLES,acceptNeedLocally,cityChoice,chosenCity} from './2026-10-22_app.js';
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
test('el HTML incluye formularios solo para quien publica, filtros y aceptación directa',()=>{
  const html=readFileSync(new URL('./index.html',import.meta.url),'utf8');
  const ids=[...html.matchAll(/\bid="([^"]+)"/g)].map(x=>x[1]);
  assert.equal(new Set(ids).size,ids.length);
  for(const id of ['hero-publish','request-city','request-city-other','city-other-fields','list-city','request-photo','request-photo-preview','accepted-grid','my-requests-grid','wizard-submit','wizard-next','wizard-back']){
    assert.ok(html.includes('id="'+id+'"'),'Falta '+id);
  }
  for(const step of [0,1,2])assert.ok(html.includes('data-wizard-step="'+step+'"'));
  assert.ok(html.includes('He revisado los datos de mi necesidad'));
  assert.ok(html.includes('id="request-demo-consent"'));
  assert.ok(html.includes('Aceptar necesidad'));
  assert.ok(!html.includes('id="proposal-form"'));
  assert.ok(!html.includes('id="provider-form"'));
  assert.ok(!html.includes('id="access-form"'));
  assert.deepEqual([...html.matchAll(/<form\b[^>]*\bid="([^"]+)"/g)].map(m=>m[1]),['publish-form']);
});

test('la navegación compacta distingue publicar de aceptar',()=>{
  assert.deepEqual(SCREEN_IDS,['inicio','necesidades','mis-necesidades','aceptadas']);
  for(const id of SCREEN_IDS)assert.equal(resolveScreen('#'+id),id);
  assert.equal(resolveScreen('#una-pagina-antigua'),'inicio');
  assert.equal(resolveScreen(''),'inicio');
  assert.equal(resolveScreen('#mis-propuestas'),'aceptadas');
  assert.equal(resolveScreen('#favoritos'),'necesidades');
});
test('el HTML inicial no añade imágenes antes de entrar a Explorar',()=>{
  const html=readFileSync(new URL('./index.html',import.meta.url),'utf8');
  assert.equal(/<img\b/i.test(html),false,'El HTML inicial no debe incluir imágenes visibles');
  assert.equal(/rel="preload"[^>]*as="image"/i.test(html),false);
  assert.ok(html.includes('Lista de necesidades individualizadas'));
  assert.ok(html.includes('¿Qué necesitas?'));
  assert.ok(html.includes('Soluciona una necesidad y gana dinero por ello'));
  assert.ok(html.includes('Mis necesidades publicadas'));
  assert.ok(html.includes('Necesidades de terceros aceptadas para solucionar'));
  assert.ok(html.includes('id="request-grid"'));
  assert.ok(!html.includes('Ver necesidades para ofertar'));
  assert.ok(html.includes('href="#necesidades" data-explore'));
});
test('solo una vista está visible al iniciar y todas tienen su navegación correspondiente',()=>{
  const html=readFileSync(new URL('./index.html',import.meta.url),'utf8');
  for(const id of SCREEN_IDS){
    assert.ok(html.includes('id="'+id+'" data-screen="'+id+'"')||html.includes('id="'+id+'"')&&html.includes('data-screen="'+id+'"'));
    if(['mis-necesidades','aceptadas'].includes(id))assert.ok(html.includes('data-screen-link="'+id+'"'));
  }
  for(const id of SCREEN_IDS.filter(id=>id!=='inicio')){
    const element=new RegExp('<section[^>]*id="'+id+'"[^>]*>');
    const match=html.match(element);
    assert.ok(match&&match[0].includes('hidden'),'La vista '+id+' debe iniciar oculta');
  }
  const screens=[...html.matchAll(/\bdata-screen="([^"]+)"/g)].map(m=>m[1]);
  assert.deepEqual(screens,[...SCREEN_IDS]);
});
test('las imágenes se muestran solamente al abrir la ficha y dentro del asistente',()=>{
  const html=readFileSync(new URL('./index.html',import.meta.url),'utf8');
  const js=readFileSync(new URL('./2026-10-22_app.js',import.meta.url),'utf8');
  const css=readFileSync(new URL('./2026-10-22_estilos.css',import.meta.url),'utf8');
  assert.ok(js.includes('function showPictureInline(container,data,caption)'));
  assert.ok(js.includes("showPictureInline(box,current,'Fotografía seleccionada')"));
  assert.ok(js.includes("const image=pictureNode(request.picture"));
  assert.ok(js.includes("photo.append(image)"));
  assert.ok(js.includes("overview.append(copy,photo)"));
  assert.ok(html.includes('id="request-photo-preview"'));
  assert.ok(css.includes('.need-card-overview{'));
  assert.equal(html.includes('id="detail-dialog"'),false);
  assert.equal(js.includes('function showRequest('),false);
  assert.equal(js.includes('addPictureToggle'),false);
  assert.equal(js.includes("'Ver foto'"),false);
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
  const links=['mis-necesidades','aceptadas'].map(id=>({
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
    assert.deepEqual(links.filter(el=>el.attributes.get('aria-current')==='page').map(el=>el.dataset.screenLink),links.some(link=>link.dataset.screenLink===selected)?[selected]:[]);
  }
  assert.equal(applyScreenNavigation(root,'#inexistente'),'inicio');
  assert.deepEqual(screens.filter(el=>!el.hidden).map(el=>el.id),['inicio']);
});
test('la navegación se activa tras los cambios de URL y al cargar la página',()=>{
  const js=readFileSync(new URL('./2026-10-22_app.js',import.meta.url),'utf8');
  const html=readFileSync(new URL('./index.html',import.meta.url),'utf8');
  assert.ok(js.includes("window.addEventListener('hashchange',()=>activateScreen(window.location.hash))"));
  assert.ok(js.includes("activateScreen(window.location.hash)"));
  for(const screen of ['mis-necesidades','aceptadas'])assert.ok(html.includes('href="#'+screen+'" data-screen-link="'+screen+'"'));
  assert.ok(html.includes('href="#inicio"'));
  assert.ok(html.includes('href="#necesidades" data-explore'));
  assert.equal(html.includes('data-screen-link="necesidades"'),false);
  assert.equal(/(?:^|[^$])\$\(['"][^'"]+['"]\)\.forEach/m.test(js),false,'No iterar querySelector con forEach');
});

test('aceptar una necesidad requiere un clic, sin oferta ni identidad del proveedor',()=>{
  const request={...EXAMPLES[0],status:'abierta'};
  const initial=decodeState(null);
  const next=acceptNeedLocally(initial,request);
  assert.equal(next.acceptances.length,1);
  assert.equal(next.acceptances[0].requestId,request.id);
  assert.equal(typeof next.acceptances[0].acceptedAt,'string');
  assert.equal(Object.hasOwn(next.acceptances[0],'price'),false);
  assert.equal(Object.hasOwn(next.acceptances[0],'name'),false);
  assert.equal(initial.acceptances.length,0);
  assert.equal(initial.proposals.length,0);
});
test('no permite aceptar dos veces la misma necesidad ni la propia',()=>{
  const request={...EXAMPLES[0],status:'abierta'};
  const accepted=acceptNeedLocally(decodeState(null),request);
  assert.throws(()=>acceptNeedLocally(accepted,request),/Ya aceptaste/);
  assert.throws(()=>acceptNeedLocally({...decodeState(null),requests:[{...req}]},{...req}),/tu propia/);
  assert.throws(()=>acceptNeedLocally(decodeState(null),{...request,status:'cancelada'}),/abiertas/);
  assert.throws(()=>acceptNeedLocally(decodeState(null),{...request,id:'inventada'}),/No se encontró/);
});
test('las aceptaciones locales sobreviven recarga sin duplicados ni entradas inválidas',()=>{
  const acceptedAt='2026-10-23T18:20:00.000Z';
  const valid={requestId:'empaques',acceptedAt};
  const recovered=decodeState(JSON.stringify({version:1,acceptances:[valid,valid,{requestId:'inventada',acceptedAt},{requestId:'filtracion',acceptedAt:'no-fecha'}]}));
  assert.deepEqual(recovered.acceptances,[valid]);
  const original={...req,id:'mia'};
  const owned=decodeState(JSON.stringify({version:1,requests:[original],acceptances:[{requestId:'mia',acceptedAt}]}));
  assert.deepEqual(owned.acceptances,[]);
});
test('aceptar desde la ficha no exige formulario ni ventana de consulta',()=>{
  const html=readFileSync(new URL('./index.html',import.meta.url),'utf8');
  const js=readFileSync(new URL('./2026-10-22_app.js',import.meta.url),'utf8');
  assert.equal(/id="(?:proposal|provider|access)-(?:form|dialog)"/.test(html),false);
  assert.ok(html.includes('id="accepted-grid"'));
  assert.ok(js.includes("makeButton('Aceptar necesidad','accept',true)"));
  assert.ok(js.includes('acceptNeedLocally(state,request)'));
  assert.ok(js.includes("handleNeedAction(button.dataset.action,button.dataset.id)"));
  assert.ok(!js.includes("$('#proposal-form')"));
  assert.ok(!js.includes("$('#provider-form')"));
  assert.ok(!js.includes("function openProposalFor("));
  assert.ok(!js.includes("function proposalAction("));
  assert.ok(!js.includes("showRequest("));
  assert.ok(!js.includes("data-request"));
  assert.equal(/Ver detalles/i.test(html+js),false);
});
test('una sola letra sirve como título de necesidad y no hay límite fijo de longitud',()=>{
  assert.equal(normalizeRequest({...req,title:'A'}).title,'A');
  assert.equal(normalizeRequest({...req,title:' ñ '}).title,'ñ');
  const long='Producto de prueba '.repeat(1000).trim();
  assert.equal(normalizeRequest({...req,title:long}).title,long);
  assert.equal(buildDraft({...req,title:long}).title,long);
  assert.throws(()=>normalizeRequest({...req,title:'   '}),/Escribe/);
});
test('el título del asistente sigue sin imponer longitud mínima ni máxima',()=>{
  const html=readFileSync(new URL('./index.html',import.meta.url),'utf8');
  for(const id of ['request-title']){
    const tag=html.match(new RegExp('<input[^>]+id="'+id+'"[^>]*>'));
    assert.ok(tag,'Falta el campo '+id);
    assert.equal(/(?:minlength|maxlength)=/.test(tag[0]),false,'Hay una restricción de caracteres en '+id);
    assert.ok(tag[0].includes('required'),'Debe impedirse solo el valor vacío');
  }
});
test('las tres vistas usan el mismo listado compacto que abre una ficha al pulsar el nombre',()=>{
  const js=readFileSync(new URL('./2026-10-22_app.js',import.meta.url),'utf8');
  const css=readFileSync(new URL('./2026-10-22_estilos.css',import.meta.url),'utf8');
  assert.ok(js.includes('function needCard(request,context){'));
  assert.ok(js.includes("renderNeedList(grid,records(),'explorar')"));
  assert.ok(js.includes("renderNeedList(container,state.requests,'propias')"));
  assert.ok(js.includes("renderNeedList(list,accepted,'aceptadas')"));
  assert.ok(js.includes('function compactNeedRow(request,context,expanded=false){'));
  assert.ok(js.includes('content.append(needCard(request,context))'));
  for(const marker of ["el('h3','need-card-title',request.title)","el('p','need-card-description',request.description)","el('ul','need-card-meta')","el('div','need-card-overview')","overview.append(copy,photo)","article.append(head,overview,actions)"]){
    assert.ok(js.includes(marker),'Falta '+marker);
  }
  assert.ok(css.includes(':is(#request-grid,#my-requests-grid,#accepted-grid) .need-card{'));
  assert.ok(css.includes('grid-template-columns:minmax(0,1fr) minmax(116px,29%)'));
  assert.ok(css.includes('border-left:5px solid'));
  assert.ok(js.includes("'Sin foto'"));
});
test('los accesos de mis necesidades y aceptadas están centrados bajo Publicar',()=>{
  const html=readFileSync(new URL('./index.html',import.meta.url),'utf8');
  const css=readFileSync(new URL('./2026-10-22_estilos.css',import.meta.url),'utf8');
  for(const name of ['Soluciona una necesidad y gana dinero por ello','Mis necesidades publicadas para que otros ofrezcan solucionarlas','Necesidades de terceros aceptadas para solucionar']){
    assert.ok(html.includes(name),'Falta '+name);
  }
  assert.ok(css.includes('#screen-navigation{'));
  assert.ok(css.includes('width:min(calc(100% - 20px),480px)'));
  assert.ok(css.includes('grid-template-columns:minmax(0,1fr)'));
  assert.ok(css.includes('min-height:70px'));
  assert.ok(css.includes('white-space:normal'));
  assert.ok(css.includes('.hero .publish-cta{margin:18px auto 0'));
  assert.ok(css.includes('.hero .compact-next-step .solve-cta{'));
  assert.equal(/data-screen-link="necesidades"/.test(html),false);
  const heroEnd=html.indexOf('</section>',html.indexOf('id="inicio"'));
  const navPos=html.indexOf('id="screen-navigation"');
  assert.ok(navPos>html.indexOf('id="inicio"')&&navPos<heroEnd,
    'Los accesos deben existir solo dentro de Inicio para ocultarse al cambiar de sección');
  assert.equal([...html.matchAll(/data-screen-link=/g)].length,2);
});
test('un título largo sobrevive al ciclo de almacenamiento y recarga',()=>{
  const title='Necesito '.repeat(800).trim();
  const saved={...req,id:'titulo-largo',title};
  const st=decodeState(JSON.stringify({version:1,requests:[saved]}));
  assert.equal(st.requests.length,1);
  assert.equal(st.requests[0].title,title);
  assert.equal(buildDraft({...req,title}).title,title);
});

test('la portada tiene un solo botón principal y no presenta formularios ni botón en cabecera',()=>{
  const html=readFileSync(new URL('./index.html',import.meta.url),'utf8');
  const js=readFileSync(new URL('./2026-10-22_app.js',import.meta.url),'utf8');
  const css=readFileSync(new URL('./2026-10-22_estilos.css',import.meta.url),'utf8');
  const hero=html.match(/<section class="hero[^>]*>[\s\S]*?<\/section>/);
  const header=html.match(/<header[\s\S]*?<\/header>/);
  assert.ok(hero&&header);
  assert.ok(hero[0].includes('id="hero-publish"'));
  assert.ok(hero[0].includes('Publicar una necesidad'));
  assert.equal([...hero[0].matchAll(/<button\b/g)].length,1);
  assert.equal(/<form\b|<input\b/.test(hero[0]),false);
  assert.equal(/data-open="publish"/.test(header[0]),false);
  assert.ok(js.includes("if(kind==='publish')startPublish();"));
  assert.equal(js.includes("$('#hero-form')"),false);
  assert.ok(css.includes('.hero .publish-cta{'));
});
test('el selector de ciudad ofrece opciones nativas en teléfonos y acepta otros municipios',()=>{
  const html=readFileSync(new URL('./index.html',import.meta.url),'utf8');
  const js=readFileSync(new URL('./2026-10-22_app.js',import.meta.url),'utf8');
  const select=html.match(/<select id="request-city"[\s\S]*?<\/select>/);
  assert.ok(select);
  assert.ok(select[0].includes('<option value="Santa Marta">'));
  assert.ok(select[0].includes('<option value="Bogotá">'));
  assert.ok(select[0].includes('<option value="__otra__">'));
  assert.ok(select[0].includes('required'));
  assert.ok(html.includes('id="request-city-other"'));
  assert.ok(html.includes('id="city-other-fields" hidden'));
  assert.equal(html.includes('<datalist id="cities"'),false);
  assert.equal(/id="request-city"[^>]+list="cities"/.test(html),false);
  assert.ok(js.includes("$('#request-city').addEventListener('change'"));
  assert.ok(js.includes("input.required=other"));
  assert.ok(js.includes("input.disabled=!other"));
});
test('un municipio fuera de la lista se recupera sin pérdida en un borrador',()=>{
  const options=['','Santa Marta','Bogotá','__otra__'];
  assert.deepEqual(cityChoice('Santa Marta',options),{selection:'Santa Marta',custom:''});
  assert.deepEqual(cityChoice('Fundación',options),{selection:'__otra__',custom:'Fundación'});
  assert.deepEqual(cityChoice('  Ciénaga ',options),{selection:'__otra__',custom:'Ciénaga'});
  assert.deepEqual(cityChoice('',options),{selection:'',custom:''});
  assert.equal(chosenCity('__otra__','Ciénaga'),'Ciénaga');
  assert.equal(chosenCity('Santa Marta',''),'Santa Marta');
  assert.equal(chosenCity('', ''),'');
  const draft=buildDraft({...req,city:'Fundación'});
  assert.equal(draft.city,'Fundación');
  const saved=decodeState(JSON.stringify({version:1,draft:{data:draft}}));
  assert.equal(saved.draft.data.city,'Fundación');
  assert.deepEqual(cityChoice(saved.draft.data.city,options),{selection:'__otra__',custom:'Fundación'});
});
test('se sigue exigiendo ciudad válida al guardar la necesidad',()=>{
  const options=['','Santa Marta','Bogotá','__otra__'];
  assert.equal(chosenCity(cityChoice('Santa Marta',options).selection,''),'Santa Marta');
  assert.throws(()=>normalizeRequest({...req,city:''}),/ciudad/);
  assert.throws(()=>normalizeRequest({...req,city:'X'}),/ciudad/);
  assert.equal(normalizeRequest({...req,city:'Fundación'}).city,'Fundación');
});

test('botones de acceso y acciones primarias poseen tamaño cómodo para celular',()=>{
  const css=readFileSync(new URL('./2026-10-22_estilos.css',import.meta.url),'utf8');
  const html=readFileSync(new URL('./index.html',import.meta.url),'utf8');
  assert.ok(css.includes('#screen-navigation a{'));
  assert.ok(css.includes('min-height:70px;'));
  assert.ok(css.includes('min-height:65px;'));
  assert.ok(css.includes('.section-primary-action{display:flex;justify-content:center'));
  assert.ok(css.includes('.filter,.my-action,.card-link{min-height:43px}'));
  assert.equal(html.includes('class="section-primary-action"'),false,
    'No debe aparecer otro botón de navegación dentro de las secciones');
});
test('la ficha expandida conserva información y foto, sin modal adicional',()=>{
  const js=readFileSync(new URL('./2026-10-22_app.js',import.meta.url),'utf8');
  const html=readFileSync(new URL('./index.html',import.meta.url),'utf8');
  const css=readFileSync(new URL('./2026-10-22_estilos.css',import.meta.url),'utf8');
  for(const label of ['Cantidad: ','Condición: ','Presupuesto aproximado: ','Fecha deseada: ','Publicada: '])
    assert.ok(js.includes(label),'Falta el dato '+label);
  assert.ok(js.includes("photo.append(image)"));
  assert.ok(js.includes('copy.append(metadata)'));
  assert.ok(js.includes("el('p','need-card-description',request.description)"));
  assert.ok(css.includes('.need-card-photo img{'));
  assert.ok(!html.includes('id="detail-dialog"'));
  assert.ok(!html.includes('id="detail-title"'));
  assert.equal(/Ver detalles|Mostrar detalles/i.test(js+html),false);
});
test('cada contexto conserva una acción directa y no muestra Detalles',()=>{
  const js=readFileSync(new URL('./2026-10-22_app.js',import.meta.url),'utf8');
  for(const instruction of [
    "makeButton('Aceptar necesidad','accept',true)",
    "makeButton('Necesidad aceptada','accepted',true,true)",
    "makeButton('Marcar como resuelta','resolve',true)",
    "makeButton('Editar necesidad','edit')",
    "makeButton('Cancelar necesidad','cancel')",
    "makeButton('Reactivar necesidad','reopen',true)"
  ])assert.ok(js.includes(instruction),'No existe '+instruction);
  assert.ok(js.includes("for(const list of [grid,$('#my-requests-grid'),$('#accepted-grid')])"));
  assert.ok(js.includes('handleNeedAction(button.dataset.action,button.dataset.id)'));
});
test('la descripción completa no se corta y la foto permanece a la derecha también en celular',()=>{
  const css=readFileSync(new URL('./2026-10-22_estilos.css',import.meta.url),'utf8');
  assert.ok(css.includes('.need-card-overview{'));
  assert.ok(css.includes('grid-template-columns:minmax(0,1fr) minmax(116px,29%)'));
  assert.ok(css.includes('grid-template-columns:minmax(0,1fr) minmax(90px,36%)'));
  assert.ok(css.includes('.need-card-description{'));
  assert.ok(css.includes('white-space:pre-wrap'));
  assert.ok(css.includes('-webkit-line-clamp:unset'));
  assert.ok(css.includes('object-fit:contain'));
  assert.ok(css.includes('overflow-wrap:anywhere'));
});

test('cada línea contraída presenta únicamente el título y no carga la fotografía',()=>{
  const js=readFileSync(new URL('./2026-10-22_app.js',import.meta.url),'utf8');
  const start=js.indexOf('function compactNeedRow(request,context,expanded=false){');
  const end=js.indexOf('function renderNeedList(container,requests,context){',start);
  assert.ok(start>=0&&end>start);
  const body=js.slice(start,end);
  assert.ok(body.includes("const row=el('details','need-list-row')"));
  assert.ok(body.includes("const heading=el('summary','need-list-summary')"));
  assert.ok(body.includes("heading.append(el('span','need-list-title',request.title))"));
  assert.ok(body.includes("row.append(heading,content)"));
  assert.ok(body.includes("row.addEventListener('toggle',show)"));
  assert.ok(body.includes('if(row.open){'));
  assert.ok(body.includes('content.append(needCard(request,context))'));
  assert.ok(body.includes('content.replaceChildren()'));
  assert.ok(body.includes('if(expanded){'));
  assert.equal(body.includes('pictureNode('),false,'Una línea cerrada no crea imágenes');
});
test('las tres listas comparten estilo sin margen, sin huecos entre renglones',()=>{
  const css=readFileSync(new URL('./2026-10-22_estilos.css',import.meta.url),'utf8');
  for(const piece of [
    ':is(#request-grid,#my-requests-grid,#accepted-grid){',
    'grid-template-columns:none',
    'gap:0',
    'border-bottom:1px solid #e2eae2',
    '.need-list-summary{',
    'min-height:37px',
    'text-overflow:ellipsis',
    'white-space:nowrap',
    '.need-list-summary::-webkit-details-marker{display:none}',
    '.need-list-title{'
  ])assert.ok(css.includes(piece),'No está '+piece);
});
test('el nombre abre ficha con teclado y se conservan filas abiertas al actualizar',()=>{
  const js=readFileSync(new URL('./2026-10-22_app.js',import.meta.url),'utf8');
  assert.ok(js.includes("el('summary','need-list-summary')"));
  assert.ok(js.includes("row.addEventListener('toggle',show)"));
  assert.ok(js.includes("new Set([...container.querySelectorAll('.need-list-row[open]')]"));
  assert.ok(js.includes('expanded.has(request.id)'));
  assert.ok(js.includes('row.open=true;'));
  assert.equal(js.includes("addEventListener('mouseover'"),false);
});
test('la lista solo muestra títulos sin fotos inicialmente en las tres secciones',()=>{
  const html=readFileSync(new URL('./index.html',import.meta.url),'utf8');
  const js=readFileSync(new URL('./2026-10-22_app.js',import.meta.url),'utf8');
  for(const id of ['request-grid','my-requests-grid','accepted-grid'])
    assert.ok(html.includes('id="'+id+'"'));
  assert.ok(js.includes('renderNeedList(grid,records()'));
  assert.ok(js.includes('renderNeedList(container,state.requests'));
  assert.ok(js.includes('renderNeedList(list,accepted'));
  assert.ok(html.includes('Toca el nombre de una necesidad para ver su descripción'));
});


test('las cuatro rutas principales usan iconos, colores y explicaciones distintas',()=>{
  const html=readFileSync(new URL('./index.html',import.meta.url),'utf8');
  const css=readFileSync(new URL('./2026-10-22_estilos.css',import.meta.url),'utf8');
  const expected=[
    ['action-cta-publish','write-need','Describe qué necesitas para que otros puedan ayudarte'],
    ['action-cta-solve','help-need','Encuentra a alguien a quien puedas ayudar'],
    ['action-cta-mine','my-needs','Consulta y administra tus publicaciones'],
    ['action-cta-accepted','accepted-needs','Revisa los compromisos que ya aceptaste']
  ];
  for(const [klass,icon,tip] of expected){
    assert.ok(html.includes(klass),'Falta la clase '+klass);
    assert.ok(html.includes('id="'+icon+'"'),'Falta el icono '+icon);
    assert.ok(html.includes('href="#'+icon+'"'),'Falta el uso de '+icon);
    assert.ok(html.includes(tip),'Falta la guía '+tip);
  }
  for(const cssMarker of [
    '.hero .publish-cta.action-cta{background:#174c3e',
    '.hero .compact-next-step .solve-cta.action-cta{background:#e9f6ef',
    '#screen-navigation a.action-cta-mine{background:#eaf2fc',
    '#screen-navigation a.action-cta-accepted{background:#fcf2e1'
  ])assert.ok(css.includes(cssMarker),'Falta color '+cssMarker);
  assert.ok(html.includes('class="action-copy"'));
});
test('las acciones principales conservan textos y destinos acordados sin formularios extra',()=>{
  const html=readFileSync(new URL('./index.html',import.meta.url),'utf8');
  assert.ok(html.includes('Publicar una necesidad'));
  assert.ok(html.includes('Soluciona una necesidad y gana dinero por ello'));
  assert.ok(html.includes('Mis necesidades publicadas para que otros ofrezcan solucionarlas'));
  assert.ok(html.includes('Necesidades de terceros aceptadas para solucionar'));
  assert.ok(html.includes('href="#necesidades" data-explore'));
  assert.ok(html.includes('href="#mis-necesidades" data-screen-link="mis-necesidades"'));
  assert.ok(html.includes('href="#aceptadas" data-screen-link="aceptadas"'));
  assert.equal([...html.matchAll(/data-screen-link="necesidades"/g)].length,0);
  assert.equal([...html.matchAll(/<form\b/g)].length,1);
});
test('el listado compacto muestra fondos alternados y flecha distinta al expandir',()=>{
  const css=readFileSync(new URL('./2026-10-22_estilos.css',import.meta.url),'utf8');
  for(const rule of [
    '.need-list-row:nth-child(odd) > .need-list-summary',
    '.need-list-row:nth-child(even) > .need-list-summary',
    '.need-list-summary::after{',
    '.need-list-row[open] > .need-list-summary::after{',
    '.need-list-row[open] > .need-list-summary{',
    'box-shadow:inset 3px 0 0',
    'text-overflow:ellipsis',
    'white-space:nowrap'
  ])assert.ok(css.includes(rule),'Falta '+rule);
  assert.ok(css.includes('transform:translateY(2px) rotate(225deg)'));
  assert.ok(css.includes('border-bottom:1px solid #e2eae2'));
  assert.ok(css.includes('gap:0'));
});
test('abrir una necesidad cambia el estado visual pero conserva el título como único resumen',()=>{
  const js=readFileSync(new URL('./2026-10-22_app.js',import.meta.url),'utf8');
  const html=readFileSync(new URL('./index.html',import.meta.url),'utf8');
  assert.ok(js.includes("heading.append(el('span','need-list-title',request.title))"));
  assert.ok(js.includes("row.addEventListener('toggle',show)"));
  assert.ok(js.includes("content.append(needCard(request,context))"));
  assert.ok(js.includes("content.replaceChildren()"));
  assert.ok(html.includes('Toca el nombre de una necesidad'));
  assert.ok(html.includes('Toca el nombre para revisar, editar'));
  assert.ok(html.includes('Toca una necesidad para revisar lo que aceptaste.'));
});
test('botón Cancelar aparece diferenciado sin afectar otras acciones',()=>{
  const js=readFileSync(new URL('./2026-10-22_app.js',import.meta.url),'utf8');
  const css=readFileSync(new URL('./2026-10-22_estilos.css',import.meta.url),'utf8');
  assert.ok(js.includes("button.classList.add('need-action-'+action)"));
  assert.ok(js.includes("makeButton('Cancelar necesidad','cancel')"));
  assert.ok(css.includes('.need-card-actions .need-action-cancel{'));
  assert.ok(css.includes('color:#a33a36'));
  assert.ok(css.includes('.need-card-actions .need-action-accepted:disabled{'));
});
test('las ayudas y estilos también se adaptan a teléfonos sin aumentar las filas',()=>{
  const css=readFileSync(new URL('./2026-10-22_estilos.css',import.meta.url),'utf8');
  assert.ok(css.includes('@media(max-width:680px){'));
  assert.ok(css.includes('.hero .publish-cta.action-cta,.hero .compact-next-step .solve-cta.action-cta,'));
  assert.ok(css.includes('min-height:76px'));
  assert.ok(css.includes('.action-cta .action-copy small{font-size:11px}'));
  assert.ok(css.includes('.need-list-summary{min-height:38px}'));
  assert.ok(css.includes('@media(prefers-reduced-motion:reduce)'));
});


test('el pulido visual conserva los cuatro destinos y todo el contenido actual',()=>{
  const html=readFileSync(new URL('./index.html',import.meta.url),'utf8');
  assert.ok(html.includes('2026-10-22_estilos.css?v=20261023-titulos-todas-vistas-1'));
  assert.ok(html.includes('2026-10-22_app.js?v=20261023-didactica-1'));
  for(const marker of [
    'id="hero-publish"','href="#necesidades" data-explore',
    'href="#mis-necesidades" data-screen-link="mis-necesidades"',
    'href="#aceptadas" data-screen-link="aceptadas"',
    'id="request-grid"','id="my-requests-grid"','id="accepted-grid"',
    'id="request-city"','id="publish-form"','id="request-photo-preview"'
  ])assert.ok(html.includes(marker),'Falta el elemento existente '+marker);
});
test('la composición estática mantiene el ancho central de botones y del contenedor',()=>{
  const css=readFileSync(new URL('./2026-10-22_estilos.css',import.meta.url),'utf8');
  const latest=css.slice(css.lastIndexOf('Pulido visual: composición'));
  assert.ok(latest.includes('max-width:480px'));
  assert.ok(latest.includes('width:min(calc(100% - 20px),480px)'));
  assert.ok(latest.includes('grid-template-columns:29px minmax(0,1fr) 20px'));
  assert.ok(latest.includes('.shell{width:calc(100% - 20px)}'));
  assert.equal(/\.shell\s*\{\s*width:\s*min\(/.test(latest),false);
  assert.ok(latest.includes('.compact-header-inner{'));
  assert.ok(latest.includes('.section-heading h2{'));
  assert.ok(latest.includes('.site-footer.compact-footer{'));
});
test('filtros, búsqueda, diálogo y estados se alinean visualmente sin elementos añadidos',()=>{
  const css=readFileSync(new URL('./2026-10-22_estilos.css',import.meta.url),'utf8');
  const latest=css.slice(css.lastIndexOf('Pulido visual: composición'));
  for(const marker of [
    '.filters{','.filter{','.quick-search input{','.compact-filters{',
    '.listing-controls{','.section-primary-action{',
    '.dialog-form label{','.wizard-bars{','.wizard-actions .button',
    '.site-footer.compact-footer{'
  ])assert.ok(latest.includes(marker),'No se ajustó visualmente '+marker);
  assert.ok(latest.includes('grid-template-columns:repeat(2,minmax(0,1fr))'));
});
test('el diseño conserva la lista compacta de una línea, con separación nula',()=>{
  const css=readFileSync(new URL('./2026-10-22_estilos.css',import.meta.url),'utf8');
  const js=readFileSync(new URL('./2026-10-22_app.js',import.meta.url),'utf8');
  assert.ok(css.includes('gap:0'));
  assert.ok(css.includes('.need-list-title{'));
  assert.ok(css.includes('white-space:nowrap'));
  assert.ok(css.includes('text-overflow:ellipsis'));
  assert.ok(css.includes('.need-list-summary::after{'));
  assert.ok(js.includes("heading.append(el('span','need-list-title',request.title))"));
  assert.ok(js.includes("content.append(needCard(request,context))"));
  assert.ok(!js.includes('addPictureToggle'));
});
test('la cascada nueva contiene ajustes para móvil, tableta y escritorio sin desbordar columnas',()=>{
  const css=readFileSync(new URL('./2026-10-22_estilos.css',import.meta.url),'utf8');
  const latest=css.slice(css.lastIndexOf('Pulido visual: composición'));
  for(const marker of [
    '@media(min-width:900px){','@media(max-width:680px){',
    '@media(max-width:480px){','@media(max-width:350px){',
    'grid-template-columns:25px minmax(0,1fr) 18px',
    'grid-template-columns:minmax(0,1fr)',
    '.form-columns{grid-template-columns:minmax(0,1fr)}',
    'min-width:0','overflow-wrap:anywhere'
  ])assert.ok(latest.includes(marker),'No está '+marker);
  const braces=[...css].reduce((n,ch)=>n+(ch==='{')-(ch==='}'),0);
  assert.equal(braces,0);
});

test('los cuatro accesos principales pertenecen exclusivamente a Inicio',()=>{
  const html=readFileSync(new URL('./index.html',import.meta.url),'utf8');
  const first=html.indexOf('<section class="hero shell app-screen"');
  const end=html.indexOf('</section>',first);
  const home=html.slice(first,end);
  assert.ok(first>=0&&end>first);
  assert.ok(home.includes('id="hero-publish"'));
  assert.ok(home.includes('class="button solve-cta action-cta action-cta-solve"'));
  assert.ok(home.includes('id="screen-navigation"'));
  assert.ok(home.includes('href="#mis-necesidades"'));
  assert.ok(home.includes('href="#aceptadas"'));
  assert.equal((html.match(/id="screen-navigation"/g)||[]).length,1);
  assert.ok(html.includes('.app-screen')===false || html.includes('app-screen'));
  const css=readFileSync(new URL('./2026-10-22_estilos.css',import.meta.url),'utf8');
  assert.ok(css.includes('.app-screen[hidden]{display:none!important}'),
    'La navegación incluida en Inicio debe desaparecer al cambiar a otra sección');
});
test('al entrar a cada sección únicamente queda su información, no las otras acciones principales',()=>{
  const html=readFileSync(new URL('./index.html',import.meta.url),'utf8');
  const homeStart=html.indexOf('<section class="hero shell app-screen"');
  const homeEnd=html.indexOf('</section>',homeStart);
  const otherSections=html.slice(homeEnd);
  assert.equal(otherSections.includes('id="screen-navigation"'),false);
  assert.equal(otherSections.includes('action-cta-publish'),false);
  assert.equal(otherSections.includes('action-cta-solve'),false);
  assert.equal(otherSections.includes('action-cta-mine'),false);
  assert.equal(otherSections.includes('action-cta-accepted'),false);
  assert.equal(otherSections.includes('Publicar otra necesidad'),false);
  assert.equal(otherSections.includes('Soluciona otra necesidad'),false);
  for(const id of ['necesidades','mis-necesidades','aceptadas'])
    assert.ok(otherSections.includes('id="'+id+'" data-screen="'+id+'"'));
  assert.ok(html.includes('href="#inicio" aria-label="LoNecesito, inicio"'),
    'La marca permite regresar a Inicio desde cualquier sección');
  assert.ok(otherSections.includes('id="my-empty"'),
    'El estado vacío de publicaciones aún permite crear una necesidad');
});
test('navegar no borra funcionalidades ni modifica el JavaScript existente',()=>{
  const html=readFileSync(new URL('./index.html',import.meta.url),'utf8');
  const js=readFileSync(new URL('./2026-10-22_app.js',import.meta.url),'utf8');
  assert.ok(js.includes('export function applyScreenNavigation(root,screenId)'));
  assert.ok(js.includes('window.addEventListener('+"'hashchange'"+',()=>activateScreen(window.location.hash))'));
  for(const marker of ['id="request-grid"','id="my-requests-grid"','id="accepted-grid"','id="publish-dialog"','id="publish-form"','id="list-city"','id="request-city"'])
    assert.ok(html.includes(marker),'Falta el componente '+marker);
});


test('las tres listas muestran cuatro tonos pastel cíclicos con acentos y flechas coordinados',()=>{
  const css=readFileSync(new URL('./2026-10-22_estilos.css',import.meta.url),'utf8');
  const theme=css.slice(css.lastIndexOf('Listas de necesidades: cuatro tonos pastel'),css.lastIndexOf('FICHAS DESPLEGADAS · Composición visual final'));
  for(const pair of [
    ['4n + 1','#e5f1fc','#3983c6','#173f61'],
    ['4n + 2','#fff1d9','#d99a36','#704a16'],
    ['4n + 3','#f0e9fa','#9874c5','#503777'],
    ['4n)','#e6f5ed','#34896e','#205644']
  ]){
    for(const marker of pair)assert.ok(theme.includes(marker),'Falta color/ciclo '+marker);
  }
  assert.ok(theme.includes(':is(#request-grid,#my-requests-grid,#accepted-grid)'));
  assert.ok(theme.includes('color:var(--row-ink)'));
  assert.ok(theme.includes('box-shadow:inset 5px 0 0 var(--row-accent)'));
  assert.ok(css.includes('.need-list-summary::after{'));
  assert.ok(css.includes('border-right:2px solid currentColor'));
});
test('la ficha abierta mantiene el color de su línea y el listado sigue compacto',()=>{
  const css=readFileSync(new URL('./2026-10-22_estilos.css',import.meta.url),'utf8');
  const theme=css.slice(css.lastIndexOf('Listas de necesidades: cuatro tonos pastel'),css.lastIndexOf('FICHAS DESPLEGADAS · Composición visual final'));
  assert.ok(theme.includes('nth-child(n)[open] > .need-list-summary'));
  assert.ok(theme.includes('background:var(--row-open)'));
  assert.equal(theme.includes('grid-template-columns'),false);
  assert.equal(theme.includes('padding:'),false);
  assert.equal(theme.includes('min-height:'),false);
  assert.equal(theme.includes('gap:'),false);
  assert.ok(css.includes('white-space:nowrap'));
  assert.ok(css.includes('text-overflow:ellipsis'));
  assert.ok(css.includes('gap:0'));
});
test('el contraste de los cuatro colores de texto alcanza WCAG AA',()=>{
  function luminance(hex){
    const numbers=[0,2,4].map(i=>parseInt(hex.slice(i,i+2),16)/255);
    const linear=numbers.map(n=>n<=0.04045?n/12.92:Math.pow((n+0.055)/1.055,2.4));
    return linear[0]*.2126+linear[1]*.7152+linear[2]*.0722;
  }
  function ratio(a,b){
    const x=luminance(a),y=luminance(b);
    return (Math.max(x,y)+.05)/(Math.min(x,y)+.05);
  }
  for(const [name,ink,background,open] of [
    ['azul','173f61','e5f1fc','d3e7f8'],
    ['amarillo','704a16','fff1d9','ffe6bf'],
    ['lavanda','503777','f0e9fa','e5d8f5'],
    ['menta','205644','e6f5ed','d4ebdc']
  ]){
    assert.ok(ratio(ink,background)>=4.5,'Contraste cerrado insuficiente: '+name);
    assert.ok(ratio(ink,open)>=4.5,'Contraste abierto insuficiente: '+name);
  }
});
test('la actualización es solo visual y se sirve sin caché de CSS anterior',()=>{
  const html=readFileSync(new URL('./index.html',import.meta.url),'utf8');
  const js=readFileSync(new URL('./2026-10-22_app.js',import.meta.url),'utf8');
  assert.ok(html.includes('2026-10-22_estilos.css?v=20261023-titulos-todas-vistas-1'));
  assert.ok(html.includes('2026-10-22_app.js?v=20261023-didactica-1'));
  assert.ok(js.includes("const row=el('details','need-list-row')"));
  assert.ok(js.includes("heading.append(el('span','need-list-title',request.title))"));
  assert.ok(js.includes("content.append(needCard(request,context))"));
  assert.ok(html.includes('id="request-grid"'));
  assert.ok(html.includes('id="my-requests-grid"'));
  assert.ok(html.includes('id="accepted-grid"'));
});


test('las fichas desplegadas tienen jerarquía tipográfica y clasificación visible',()=>{
  const css=readFileSync(new URL('./2026-10-22_estilos.css',import.meta.url),'utf8');
  const layer=css.slice(css.lastIndexOf('FICHAS DESPLEGADAS · Composición visual final'),css.lastIndexOf('LO NECESITO / VISUAL V2'));
  for(const item of [
    '.need-list-content .need-card-head{',
    '.need-list-content .need-card-head .category{',
    '.need-list-content .need-card-head .my-state{',
    '.need-list-content .need-card .need-card-title{',
    '.need-list-content .need-card-copy .card-city{',
    'border-bottom:1px solid #e5ede7',
    'font-weight:820'
  ])assert.ok(layer.includes(item),'Falta jerarquía visual: '+item);
  assert.ok(layer.includes('background:#edf5ef'));
  assert.ok(layer.includes('background:#fbf5e5'));
});
test('las fichas ordenan los detalles en bloque legible y descripción sin truncar',()=>{
  const css=readFileSync(new URL('./2026-10-22_estilos.css',import.meta.url),'utf8');
  const layer=css.slice(css.lastIndexOf('FICHAS DESPLEGADAS · Composición visual final'),css.lastIndexOf('LO NECESITO / VISUAL V2'));
  assert.ok(layer.includes('.need-list-content .need-card-meta{'));
  assert.ok(layer.includes('background:#f6f9f6'));
  assert.ok(layer.includes('padding:12px 13px 12px 30px'));
  assert.ok(layer.includes('.need-list-content .need-card-meta li+li{margin-top:5px}'));
  assert.ok(layer.includes('.need-card .need-card-description{'));
  assert.ok(layer.includes('white-space:pre-wrap'));
  assert.ok(layer.includes('overflow-wrap:anywhere'));
  assert.equal(layer.includes('-webkit-line-clamp:2'),false);
  assert.equal(layer.includes('text-overflow:ellipsis'),false);
});
test('las fotografías de ficha se ven proporcionadas a la derecha del texto',()=>{
  const css=readFileSync(new URL('./2026-10-22_estilos.css',import.meta.url),'utf8');
  const app=readFileSync(new URL('./2026-10-22_app.js',import.meta.url),'utf8');
  const layer=css.slice(css.lastIndexOf('FICHAS DESPLEGADAS · Composición visual final'),css.lastIndexOf('LO NECESITO / VISUAL V2'));
  assert.ok(layer.includes('.need-list-content .need-card-overview{'));
  assert.ok(layer.includes('align-items:start'));
  assert.ok(layer.includes('min-width:0'));
  assert.ok(layer.includes('.need-list-content .need-card-photo{'));
  assert.ok(layer.includes('max-height:250px'));
  assert.ok(layer.includes('object-fit:contain'));
  assert.ok(layer.includes('.need-list-content .need-card-photo.no-photo{'));
  assert.ok(app.includes('overview.append(copy,photo)'));
  assert.ok(app.includes("const photo=el('div','need-card-photo'"));
});
test('las acciones de las fichas son simétricas y se diferencian por significado',()=>{
  const css=readFileSync(new URL('./2026-10-22_estilos.css',import.meta.url),'utf8');
  const layer=css.slice(css.lastIndexOf('FICHAS DESPLEGADAS · Composición visual final'),css.lastIndexOf('LO NECESITO / VISUAL V2'));
  for(const marker of [
    '.need-list-content .need-card-actions{',
    'justify-content:center',
    '.need-list-content .need-card-actions .need-card-primary{',
    'flex:1 1 100%',
    '.need-list-content .need-card-actions .need-card-secondary{',
    'flex:1 1 160px',
    '.need-list-content .need-card-actions .need-action-resolve{',
    '.need-list-content .need-card-actions .need-action-reopen{',
    '.need-list-content .need-card-actions .need-action-cancel{',
    '.need-list-content .need-card-actions .need-action-accepted:disabled{'
  ])assert.ok(layer.includes(marker),'Falta acción '+marker);
  assert.ok(layer.includes('text-align:center'));
});
test('las fichas conservan los anchos base de las columnas en escritorio y móvil',()=>{
  const css=readFileSync(new URL('./2026-10-22_estilos.css',import.meta.url),'utf8');
  const layer=css.slice(css.lastIndexOf('FICHAS DESPLEGADAS · Composición visual final'),css.lastIndexOf('LO NECESITO / VISUAL V2'));
  const base=css.slice(0,css.lastIndexOf('FICHAS DESPLEGADAS · Composición visual final'));
  assert.ok(base.includes('grid-template-columns:minmax(0,1fr) minmax(116px,29%)'));
  assert.ok(base.includes('grid-template-columns:minmax(0,1fr) minmax(90px,36%)'));
  assert.ok(base.includes('grid-template-columns:minmax(0,1fr) 82px'));
  assert.equal(/grid-template-columns\s*:/.test(layer),false,'No se deben redimensionar arbitrariamente las columnas base');
  assert.ok(layer.includes('@media(max-width:680px){'));
  assert.ok(layer.includes('@media(max-width:380px){'));
  assert.ok(layer.includes('overflow-wrap:anywhere'));
});
test('las filas cerradas siguen compactas y las fichas se crean únicamente al abrirlas',()=>{
  const app=readFileSync(new URL('./2026-10-22_app.js',import.meta.url),'utf8');
  const css=readFileSync(new URL('./2026-10-22_estilos.css',import.meta.url),'utf8');
  const layer=css.slice(css.lastIndexOf('FICHAS DESPLEGADAS · Composición visual final'),css.lastIndexOf('LO NECESITO / VISUAL V2'));
  assert.ok(app.includes("const row=el('details','need-list-row')"));
  assert.ok(app.includes('if(row.open){'));
  assert.ok(app.includes("content.append(needCard(request,context))"));
  assert.ok(app.includes("content.replaceChildren()"));
  assert.ok(css.includes('.need-list-summary{'));
  assert.equal(layer.includes('.need-list-summary{'),false);
  assert.equal(layer.includes('.need-list-title{'),false);
  assert.ok(css.includes('20261023-colores-1')===false);
});
test('la nueva capa visual mantiene los tres contextos y los controles existentes',()=>{
  const html=readFileSync(new URL('./index.html',import.meta.url),'utf8');
  const app=readFileSync(new URL('./2026-10-22_app.js',import.meta.url),'utf8');
  assert.ok(html.includes('2026-10-22_estilos.css?v=20261023-titulos-todas-vistas-1'));
  assert.ok(html.includes('2026-10-22_app.js?v=20261023-didactica-1'));
  for(const id of ['request-grid','my-requests-grid','accepted-grid','publish-form','request-city','request-photo-preview'])
    assert.ok(html.includes('id="'+id+'"'),'Falta '+id);
  assert.ok(app.includes("needCard(request,'explorar')")===false);
  assert.ok(app.includes("renderNeedList(grid,records(),'explorar')"));
  assert.ok(app.includes("renderNeedList(container,state.requests,'propias')"));
  assert.ok(app.includes("renderNeedList(list,accepted,'aceptadas')"));
  assert.equal(/id="detail-dialog"/.test(html),false);
});


test('el rediseño premium conserva la navegación y las pantallas originales',()=>{
  const html=readFileSync(new URL('./index.html',import.meta.url),'utf8');
  const js=readFileSync(new URL('./2026-10-22_app.js',import.meta.url),'utf8');
  const css=readFileSync(new URL('./2026-10-22_estilos.css',import.meta.url),'utf8');
  assert.ok(html.includes('20261023-titulos-todas-vistas-1'));
  assert.ok(html.includes('2026-10-22_app.js?v=20261023-didactica-1'));
  assert.ok(css.includes('LO NECESITO / VISUAL V2'));
  for(const id of ['inicio','necesidades','mis-necesidades','aceptadas','request-grid','my-requests-grid','accepted-grid','publish-form'])
    assert.ok(html.includes('id="'+id+'"'),id);
  assert.ok(js.includes('export function applyScreenNavigation(root,screenId)'));
});
test('la portada premium usa un panel editorial y cuatro acciones proporcionadas',()=>{
  const css=readFileSync(new URL('./2026-10-22_estilos.css',import.meta.url),'utf8');
  const layer=css.slice(css.lastIndexOf('LO NECESITO / VISUAL V2'));
  for(const item of [
    '.compact-header-inner{','.compact-brand-mark{','.hero-copy{','.hero .eyebrow{',
    '.hero h1{','.hero-description{','.hero .publish-cta.action-cta,',
    '#screen-navigation a.action-cta{','.action-cta .action-copy strong{',
    'border-radius:26px','max-width:480px','grid-template-columns:29px minmax(0,1fr) 20px'
  ])assert.ok(layer.includes(item),'Falta ajuste '+item);
  assert.ok(layer.includes('background:linear-gradient(160deg,#fff'));
});
test('los cuatro botones principales mantienen el mismo ancho en teléfonos',()=>{
  const css=readFileSync(new URL('./2026-10-22_estilos.css',import.meta.url),'utf8');
  const layer=css.slice(css.lastIndexOf('LO NECESITO / VISUAL V2'));
  assert.ok(layer.includes('.hero-copy{\n    width:100%;\n    padding:23px 16px 21px'));
  assert.ok(layer.includes('#screen-navigation{width:min(calc(100% - 32px),480px)'));
  assert.ok(layer.includes('.hero-copy{padding:21px 12px 19px}'));
  assert.ok(layer.includes('#screen-navigation{width:min(calc(100% - 24px),480px)'));
});
test('los listados de nombres siguen compactos y con colores pastel',()=>{
  const css=readFileSync(new URL('./2026-10-22_estilos.css',import.meta.url),'utf8');
  const js=readFileSync(new URL('./2026-10-22_app.js',import.meta.url),'utf8');
  const layer=css.slice(css.lastIndexOf('LO NECESITO / VISUAL V2'));
  assert.ok(layer.includes(':is(#request-grid,#my-requests-grid,#accepted-grid) > .need-list-row:nth-child(n) > .need-list-summary'));
  assert.ok(layer.includes('background:var(--row-bg)'));
  assert.ok(layer.includes('background:var(--row-open)'));
  assert.ok(layer.includes('color:var(--row-ink)'));
  assert.ok(layer.includes('min-height:41px'));
  assert.ok(js.includes("const row=el('details','need-list-row')"));
  assert.ok(js.includes("heading.append(el('span','need-list-title',request.title))"));
  assert.ok(js.includes("content.append(needCard(request,context))"));
});
test('las fichas destacan sus datos en dos columnas amplias y fotos completas',()=>{
  const css=readFileSync(new URL('./2026-10-22_estilos.css',import.meta.url),'utf8');
  const layer=css.slice(css.lastIndexOf('LO NECESITO / VISUAL V2'));
  for(const marker of [
    '.need-list-content .need-card-head{',
    '.need-list-content .need-card .need-card-title{',
    '.need-list-content .need-card-meta{',
    'grid-template-columns:repeat(2,minmax(0,1fr))',
    '.need-list-content .need-card-meta li,',
    '.need-list-content .need-card-photo{',
    'object-fit:contain',
    '.need-list-content .need-card-note{',
    '.need-list-content .need-card-actions{'
  ])assert.ok(layer.includes(marker),'No se rediseñó '+marker);
  assert.ok(layer.includes('.need-list-content .need-card-meta{grid-template-columns:minmax(0,1fr)'));
});
test('el diseño premium conserva las columnas originales en móvil',()=>{
  const css=readFileSync(new URL('./2026-10-22_estilos.css',import.meta.url),'utf8');
  const layer=css.slice(css.lastIndexOf('LO NECESITO / VISUAL V2'));
  const previous=css.slice(0,css.lastIndexOf('LO NECESITO / VISUAL V2'));
  assert.ok(previous.includes('grid-template-columns:minmax(0,1fr) minmax(116px,29%)'));
  assert.ok(previous.includes('grid-template-columns:minmax(0,1fr) minmax(90px,36%)'));
  assert.ok(previous.includes('grid-template-columns:minmax(0,1fr) 82px'));
  assert.equal(layer.includes('.need-card-overview{grid-template-columns:'),false);
  for(const point of ['@media(min-width:900px){','@media(max-width:680px){','@media(max-width:380px){'])
    assert.ok(layer.includes(point));
  assert.ok(layer.includes('min-width:0'));
  assert.ok(layer.includes('overflow-wrap:anywhere'));
});
test('acciones, formulario, búsqueda y footer se rediseñan sin efectos decorativos',()=>{
  const css=readFileSync(new URL('./2026-10-22_estilos.css',import.meta.url),'utf8');
  const layer=css.slice(css.lastIndexOf('LO NECESITO / VISUAL V2'));
  for(const s of [
    '.need-list-content .need-card-actions .need-card-primary{',
    '.need-list-content .need-card-actions .need-card-secondary{',
    '.need-list-content .need-card-actions .need-action-cancel{',
    '.filter{','.quick-search input{','.compact-filters{',
    '.wizard-progress{','.wizard-bars{','.dialog-form input:not([type=checkbox]):not([type=file])',
    '.site-footer.compact-footer{'
  ])assert.ok(layer.includes(s),'No se mejoró '+s);
  assert.equal(layer.includes('transition:'),false);
  assert.equal(layer.includes('animation:'),false);
});
test('las combinaciones nuevas conservan contraste AA',()=>{
  const samples=[
    ['143a2d','ffffff'],['526d5e','ffffff'],
    ['1b5844','eaf6ed'],['234e74','ebf3fd'],
    ['724e20','fff4df'],['3d5847','f4f8f4'],
    ['4d6757','f3f8f3'],['943c36','fff2f0'],
    ['ffffff','195943'],['ffffff','265f87']
  ];
  const lum=hex=>{
    const nums=[0,2,4].map(i=>parseInt(hex.slice(i,i+2),16)/255).map(v=>v<=.04045?v/12.92:((v+.055)/1.055)**2.4);
    return .2126*nums[0]+.7152*nums[1]+.0722*nums[2];
  };
  for(const [fg,bg] of samples){
    const a=lum(fg),b=lum(bg),contrast=(Math.max(a,b)+.05)/(Math.min(a,b)+.05);
    assert.ok(contrast>=4.5,'Contraste bajo '+fg+'/'+bg+' : '+contrast);
  }
});


test('todas las descripciones de necesidades abiertas se justifican sin perder saltos',()=>{
  const css=readFileSync(new URL('./2026-10-22_estilos.css',import.meta.url),'utf8');
  const layer=css.slice(css.lastIndexOf('Descripciones justificadas en las tres vistas'));
  assert.ok(layer.includes(':is(#request-grid,#my-requests-grid,#accepted-grid)'));
  assert.ok(layer.includes('.need-card .need-card-description{'));
  for(const marker of ['text-align:justify','text-align-last:left','text-justify:inter-word','hyphens:auto','white-space:pre-wrap','overflow-wrap:anywhere'])
    assert.ok(layer.includes(marker),'Falta '+marker);
  assert.ok(!layer.includes('grid-template-columns'));
});
test('ninguna ficha añade avisos sobre guardado local o notificaciones',()=>{
  const js=readFileSync(new URL('./2026-10-22_app.js',import.meta.url),'utf8');
  const start=js.indexOf('function needCard(request,context){');
  const end=js.indexOf('function compactNeedRow(request,context,expanded=false){',start);
  const body=js.slice(start,end);
  assert.ok(start>0&&end>start);
  assert.ok(body.includes('article.append(head,overview,actions)'));
  assert.equal(body.includes('contextNote'),false);
  assert.equal(body.includes("el('p','need-card-note'"),false);
  assert.equal(body.includes('este navegador'),false);
  assert.equal(body.includes('Demostración:'),false);
  assert.ok(body.includes("el('p','need-card-description',request.description)"));
});
test('desaparecen los avisos redundantes en secciones, footer y publicación',()=>{
  const html=readFileSync(new URL('./index.html',import.meta.url),'utf8');
  for(const text of [
    'Exploración de prueba',
    'Aceptaciones de prueba en este navegador',
    'Demostración: solo tú podrás ver',
    'Demostración local, sin conexión',
    'la imagen se comprime y guarda solo en este navegador',
    'En la versión real tendrás que identificarte',
    'mi solicitud solo quedará guardada en este navegador'
  ])assert.equal(html.toLowerCase().includes(text.toLowerCase()),false,'Permanece el aviso '+text);
  assert.ok(html.includes('LoNecesito</span></footer>'));
  assert.ok(html.includes('id="request-demo-consent" required'));
  assert.ok(html.includes('No incluyas datos personales ni direcciones exactas.'));
  assert.ok(html.includes('id="request-city"'));
  assert.ok(html.includes('id="publish-form"'));
});
test('los mensajes dinámicos de éxito no incluyen comentarios sobre navegador o modo de prueba',()=>{
  const js=readFileSync(new URL('./2026-10-22_app.js',import.meta.url),'utf8');
  for(const marker of [
    "showToast('Necesidad aceptada.')",
    "previous?'Necesidad actualizada.':'Necesidad guardada.'",
    "'Borrador guardado.'",
    "editingRequestId?'Guardar cambios':'Guardar necesidad'",
    "showToast('Necesidad resuelta.')"
  ])assert.ok(js.includes(marker),'Falta '+marker);
  for(const phrase of [
    'Aceptación de prueba guardada solo aquí',
    'Borrador guardado en este navegador',
    'Necesidad de prueba guardada',
    'Publicada solo en este navegador'
  ])assert.equal(js.includes(phrase),false,'Mensaje anterior todavía presente '+phrase);
});


test('la jerarquía visual se aplica a los títulos de todas las pantallas',()=>{
  const html=readFileSync(new URL('./index.html',import.meta.url),'utf8');
  const css=readFileSync(new URL('./2026-10-22_estilos.css',import.meta.url),'utf8');
  const layer=css.slice(css.lastIndexOf('Jerarquía tipográfica completa'));
  for(const id of ['hero-title','requests-title','my-title','accepted-title','publish-title','wizard-title-1','wizard-title-2','wizard-title-3'])
    assert.ok(html.includes('id="'+id+'"'),'Falta título '+id);
  for(const selector of [
    '.hero h1{',
    '#necesidades>.section-heading h2,',
    '#mis-necesidades>.section-heading h2,',
    '#aceptadas>.section-heading h2{',
    '.dialog-header h2{',
    '.dialog-form .wizard-heading{',
    '.action-cta .action-copy strong{',
    '.compact-brand{',
    '.need-list-title{',
    '.need-card .need-card-title{'
  ])assert.ok(layer.includes(selector),'Falta estilo de título '+selector);
});
test('cada sección tiene un título con escala consistente y color identificable',()=>{
  const css=readFileSync(new URL('./2026-10-22_estilos.css',import.meta.url),'utf8');
  const layer=css.slice(css.lastIndexOf('Jerarquía tipográfica completa'));
  for(const rule of [
    '--heading-primary:#153b30',
    '--heading-blue:#244d73',
    '--heading-amber:#765120',
    'font-size:clamp(23px,3vw,31px)',
    'text-align:left',
    'text-wrap:balance',
    'hyphens:auto',
    '#mis-necesidades>.section-heading h2{color:var(--heading-blue)}',
    '#aceptadas>.section-heading h2{color:var(--heading-amber)}'
  ])assert.ok(layer.includes(rule),'Falta propiedad de jerarquía '+rule);
});
test('el contador de necesidades se distingue sin alterar el título largo',()=>{
  const css=readFileSync(new URL('./2026-10-22_estilos.css',import.meta.url),'utf8');
  const html=readFileSync(new URL('./index.html',import.meta.url),'utf8');
  const layer=css.slice(css.lastIndexOf('Jerarquía tipográfica completa'));
  assert.ok(html.includes('id="my-title"'));
  assert.ok(html.includes('id="my-count"'));
  assert.ok(layer.includes('#my-title .my-count{'));
  assert.ok(layer.includes('vertical-align:middle'));
  assert.ok(layer.includes('background:#e7f0fa'));
  assert.ok(layer.includes('white-space:nowrap'));
  assert.ok(layer.includes('#my-title .my-count:empty{display:none}'));
});
test('cada nombre permanece en una sola línea cerrada y completo al desplegar',()=>{
  const css=readFileSync(new URL('./2026-10-22_estilos.css',import.meta.url),'utf8');
  const js=readFileSync(new URL('./2026-10-22_app.js',import.meta.url),'utf8');
  const layer=css.slice(css.lastIndexOf('Jerarquía tipográfica completa'));
  assert.ok(layer.includes('.need-list-title{'));
  assert.ok(layer.includes('white-space:nowrap'));
  assert.ok(layer.includes('text-overflow:ellipsis'));
  assert.ok(layer.includes('.need-card .need-card-title{'));
  assert.ok(layer.includes('white-space:normal'));
  assert.ok(layer.includes('overflow-wrap:anywhere'));
  assert.ok(js.includes("heading.append(el('span','need-list-title',request.title))"));
  assert.ok(js.includes("copy.append(el('h3','need-card-title',request.title))"));
});
test('los encabezados del formulario conservan los tres pasos y su jerarquía',()=>{
  const html=readFileSync(new URL('./index.html',import.meta.url),'utf8');
  const css=readFileSync(new URL('./2026-10-22_estilos.css',import.meta.url),'utf8');
  const layer=css.slice(css.lastIndexOf('Jerarquía tipográfica completa'));
  for(const n of [0,1,2])assert.ok(html.includes('data-wizard-step="'+n+'"'));
  assert.ok(layer.includes('.dialog-header h2{'));
  assert.ok(layer.includes('.dialog-form .wizard-heading{'));
  assert.ok(layer.includes('border-left:3px solid #46876a'));
  assert.ok(layer.includes('.wizard-progress .wizard-label{'));
  assert.ok(layer.includes('.goods-fields legend{'));
});
test('los títulos se adaptan al móvil sin cambiar las columnas ni la lógica',()=>{
  const css=readFileSync(new URL('./2026-10-22_estilos.css',import.meta.url),'utf8');
  const js=readFileSync(new URL('./2026-10-22_app.js',import.meta.url),'utf8');
  const layer=css.slice(css.lastIndexOf('Jerarquía tipográfica completa'));
  for(const marker of [
    '@media(max-width:680px){',
    '@media(max-width:380px){',
    'font-size:clamp(21px,5.55vw,26px)',
    'font-size:clamp(18px,4.8vw,22px)',
    'font-size:clamp(20px,5.5vw,22px)',
    'font-size:17px',
    'min-width:0',
    'overflow-wrap:anywhere'
  ])assert.ok(layer.includes(marker),'Falta adaptación '+marker);
  assert.equal(/grid-template-columns:/.test(layer),false);
  assert.ok(js.includes("renderNeedList(grid,records(),'explorar')"));
  assert.ok(js.includes("renderNeedList(container,state.requests,'propias')"));
  assert.ok(js.includes("renderNeedList(list,accepted,'aceptadas')"));
});
test('nuevas tonalidades de títulos y fondos alcanzan contraste AA',()=>{
  function lum(hex){
    const channels=[0,2,4].map(i=>parseInt(hex.slice(i,i+2),16)/255);
    const v=channels.map(x=>x<=.04045?x/12.92:((x+.055)/1.055)**2.4);
    return .2126*v[0]+.7152*v[1]+.0722*v[2];
  }
  for(const [fg,bg] of [
    ['153b30','ffffff'],
    ['244d73','ffffff'],
    ['765120','ffffff'],
    ['284f78','e7f0fa'],
    ['23533e','ffffff']
  ]){
    const a=lum(fg),b=lum(bg);
    assert.ok((Math.max(a,b)+.05)/(Math.min(a,b)+.05)>=4.5,'Contraste insuficiente '+fg+'/'+bg);
  }
});
