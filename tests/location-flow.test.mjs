import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import * as model from '../location-model.js';
import {cleanPublication,canManage} from '../simple-model.js';

const js=readFileSync(new URL('../simple.js',import.meta.url),'utf8');
const gps=js.slice(js.indexOf('let locationDraft=null,'),js.indexOf('function setMicState(active){'));
const submit=js.slice(js.indexOf("$('publish-form').addEventListener('submit'"),js.indexOf('function showAuth(){'));
const coords={latitude:11.24,longitude:-74.21,accuracy:12};
const osm={address:{road:'Calle 10A',house_number:'20A-06',city:'Santa Marta',
  municipality:'Municipio de Santa Marta',state:'Magdalena',country:'Colombia'}};
const big={city:'Santa Marta',principalSubdivision:'Magdalena',countryName:'Colombia'};
const flush=()=>new Promise(resolve=>setImmediate(resolve));

function harness({confirm=true}={}){
  const nodes=new Map();
  const node=id=>{
    if(!nodes.has(id))nodes.set(id,{value:'',hidden:false,disabled:false,textContent:'',
      classList:{toggle(){}},setAttribute(){},removeAttribute(){},
      replaceChildren(){},append(){},addEventListener(t,fn){this[t]=fn;}});
    return nodes.get(id);
  };
  const requests=[],notices=[],confirmations=[],saved=[];
  const state={mode:'demo',items:[],editingId:null,saving:false};
  const browser={isSecureContext:true,location:{hash:'#publicar'},confirm(message){
    confirmations.push(message);return confirm;
  }};
  const geo={watches:0,clears:0,watchPosition(success){this.watches++;this.fix=success;return 0;},
    clearWatch(){this.clears++;}};
  const fetch=(url,{signal})=>new Promise((resolve,reject)=>{
    signal.addEventListener('abort',()=>reject(new Error('aborted')),{once:true});
    requests.push({url,signal,ok(data){resolve({ok:true,json:async()=>data});},fail(){reject(new Error('offline'));}});
  });
  const args={...model,coords,state,window:browser,navigator:{geolocation:geo},fetch,AbortController,
    setTimeout:(fn,ms)=>ms===13000?setTimeout(fn,ms):(queueMicrotask(fn),0),clearTimeout,
    $:node,locateButton:node('pin'),el:()=>node(Symbol()),contactIcon:()=>({}),
    toast:m=>notices.push(m),feedback:(id,m)=>{node(id).textContent=m;},
    cleanPublication,canManage,currentUid:()=> 'demo-browser',legacyDetails:r=>r.description,
    saveLocal:items=>{saved.push(JSON.parse(JSON.stringify(items)));state.items=items;},
    showView(){},showAuth(){}};
  const instance=new Function(...Object.keys(args),`
    let pictureLoading=false,pictureDraft='';
    ${gps}
    function resetForm(){cancelGpsTasks();locationDraft=null;}
    ${submit}
    return {
      seed(value){locationDraft=value;showLocationDraft();},
      get location(){return locationDraft;},
      get pending(){return gpsGeocoding;},
      resolve(){resolveGpsAddress(coords,locationRequestId);return gpsGeocoding;},
      cancel:cancelGpsTasks
    };
  `)(...Object.values(args));
  node('need-description').value='Necesito un electricista';
  node('need-phone').value='3001234567';
  node('need-address').value='Calle 10A #20A-06, apartamento 302';
  return {instance,node,requests,notices,confirmations,saved,state,geo};
}

test('los nombres aparecen con el primer proveedor y se completan con el segundo',async()=>{
  const h=harness();h.instance.seed(model.locationFromGps(coords));
  const work=h.instance.resolve();
  assert.equal(h.node('gps-status').hidden,false);
  h.requests.find(r=>r.url.includes('bigdatacloud')).ok(big);
  await flush();
  assert.equal(h.instance.location.city,'Santa Marta');
  assert.equal(h.instance.location.municipality,'Santa Marta');
  assert.match(h.node('gps-label').textContent,/Departamento: Magdalena/);
  assert.equal(h.node('gps-status').hidden,false);
  h.requests.find(r=>r.url.includes('nominatim')).ok(osm);
  await work;
  assert.equal(h.instance.location.address,'Calle 10A #20A-06');
  assert.equal(h.node('gps-status').hidden,true);
  assert.equal(h.node('gps-refresh').disabled,false);
});

test('OSM conserva país, municipio, ciudad y dirección aunque BigDataCloud falle',async()=>{
  const h=harness();h.instance.seed(model.locationFromGps(coords));
  const work=h.instance.resolve();
  h.requests.find(r=>r.url.includes('nominatim')).ok(osm);
  await flush();
  assert.equal(h.instance.location.department,'Magdalena');
  assert.equal(h.instance.location.address,'Calle 10A #20A-06');
  h.requests.find(r=>r.url.includes('bigdatacloud')).fail();
  await work;
  assert.equal(h.instance.location.city,'Santa Marta');
});

test('actualizar GPS histórico consulta sus coordenadas con consentimiento, sin medir al autor',async()=>{
  const h=harness();h.instance.seed(model.locationFromGps(coords));
  h.node('gps-refresh').click();
  const work=h.instance.pending;
  assert.match(h.confirmations[0],/coordenadas GPS guardadas/);
  assert.equal(h.geo.watches,0);
  assert.equal(h.requests.length,2);
  for(const request of h.requests){
    const url=new URL(request.url);
    assert.equal(url.searchParams.get('latitude')||url.searchParams.get('lat'),'11.24');
    assert.equal(url.searchParams.get('longitude')||url.searchParams.get('lon'),'-74.21');
    request.ok(url.hostname.includes('nominatim')?osm:big);
  }
  await work;
  assert.equal(h.instance.location.city,'Santa Marta');
  assert.equal(h.node('need-address').value,'Calle 10A #20A-06, apartamento 302');
});

test('rechazar la actualización no consulta proveedores ni GPS',()=>{
  const h=harness({confirm:false});h.instance.seed(model.locationFromGps(coords));
  h.node('gps-refresh').click();
  assert.equal(h.requests.length,0);
  assert.equal(h.geo.watches,0);
});

test('un fallo de ambos proveedores no borra dirección ni administración guardadas',async()=>{
  const h=harness();const known=model.locationFromNaturaGeocoders(coords,osm,big);
  h.instance.seed(known);const work=h.instance.resolve();
  h.requests.forEach(r=>r.fail());await work;
  assert.deepEqual(h.instance.location,known);
  assert.match(h.node('gps-label').textContent,/apartamento 302/);
});

test('salir cancela las consultas e impide que una respuesta tardía cambie el borrador',async()=>{
  const h=harness();const known=model.locationFromGps(coords);
  h.instance.seed(known);const work=h.instance.resolve();
  const old=[...h.requests];h.instance.cancel();
  assert.ok(old.every(r=>r.signal.aborted));
  old.forEach(r=>r.ok(osm));await work;
  assert.deepEqual(h.instance.location,known);
  assert.equal(h.node('gps-status').hidden,true);
});

test('publicar espera la dirección, evita doble envío y persiste apartamento y nombres',async()=>{
  const h=harness();h.instance.seed(model.locationFromGps(coords));h.instance.resolve();
  const event={preventDefault(){}};
  const saving=h.node('publish-form').submit(event);
  assert.equal(h.state.saving,true);
  assert.equal(h.node('save-button').disabled,true);
  await h.node('publish-form').submit(event);
  assert.equal(h.saved.length,0);
  h.requests.forEach(r=>r.ok(r.url.includes('nominatim')?osm:big));
  await saving;
  assert.equal(h.saved.length,1);
  const [record]=h.saved[0];
  assert.equal(record.addressText,'Calle 10A #20A-06, apartamento 302');
  assert.equal(record.location.city,'Santa Marta');
  assert.equal(record.location.municipality,'Santa Marta');
  assert.equal(record.location.department,'Magdalena');
  assert.equal(record.location.country,'Colombia');
  assert.equal(record.location.address,'Calle 10A #20A-06');
  assert.equal(h.state.saving,false);
});

test('cancelar mientras publicar espera no guarda otro borrador',async()=>{
  const h=harness();h.instance.seed(model.locationFromGps(coords));h.instance.resolve();
  const saving=h.node('publish-form').submit({preventDefault(){}});
  h.instance.cancel();await saving;
  assert.equal(h.saved.length,0);
  assert.equal(h.state.saving,false);
});

test('campos vacíos no bloquean alternativas de Natura y municipio faltante queda explícito',()=>{
  const result=model.locationFromNaturaGeocoders(coords,{address:{
    city:'  ',town:'Perimetro Urbano Ciénaga',state:' ',country:' ',footway:'Sendero 1'
  }},big);
  assert.equal(result.city,'Ciénaga');
  assert.equal(result.country,'Colombia');
  assert.equal(result.department,'Magdalena');
  assert.equal(result.address,'Sendero 1');
  assert.ok(model.locationLines(model.locationFromGps(coords),'',true)
    .includes('Municipio: No identificado'));
});

test('flujo de ubicación no depende de Apps Script ni de analítica de Natura',()=>{
  assert.doesNotMatch(gps,/script\.google\.com|Maps\.newGeocoder|GPS_LOG_ENDPOINT|ipapi|ipwho/);
});
