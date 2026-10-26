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

function harness({confirm=true,google=null}={}){
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
    googleGeocoderUrl:()=>google?'https://script.google.com/macros/s/TEST/exec':'',
    requestGoogleGeocode:google,
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

test('flujo de ubicación no reutiliza analítica de Natura ni ubicación por IP',()=>{
  assert.doesNotMatch(gps,/GPS_LOG_ENDPOINT|ipapi|ipwho|TELEGRAM/);
});

const streetOnly={address:{...osm.address,house_number:''}};
const numberedFeature=(house='20A-06',street='Calle 10A',lon=coords.longitude,lat=coords.latitude)=>({
  type:'Feature',geometry:{type:'Point',coordinates:[lon,lat]},properties:{street,housenumber:house}
});
const photon=(...features)=>({type:'FeatureCollection',features});

test('Photon solo admite un número registrado en la misma calle a menos de 25 m',()=>{
  assert.equal(model.streetAddressFromPhoton(coords,photon(numberedFeature()),streetOnly),
    'Calle 10A #20A-06');
  for(const feature of [numberedFeature('20A-06','Carrera 20D'),
    numberedFeature('20A-06','Calle 10A',coords.longitude+0.01),
    numberedFeature(''),numberedFeature('sin número'),numberedFeature('20A-06;20A-08'),
    numberedFeature('20A-06','Calle 10A',null)]){
    assert.equal(model.streetAddressFromPhoton(coords,photon(feature),streetOnly),'');
  }
  assert.equal(model.streetAddressFromPhoton(coords,photon(numberedFeature()),{address:{}}),'');
  assert.equal(model.streetAddressFromPhoton({...coords,accuracy:50},photon(numberedFeature()),streetOnly),'');
});

test('Photon escoge el candidato más próximo de la misma calle',()=>{
  const result=model.streetAddressFromPhoton(coords,photon(
    numberedFeature('20A-08','Calle 10A',coords.longitude+0.0001),
    numberedFeature('20A-06')
  ),streetOnly);
  assert.equal(result,'Calle 10A #20A-06');
});

test('consulta enfocada a direcciones y un único respaldo cuando OSM devuelve solo calle',async()=>{
  const h=harness();h.instance.seed(model.locationFromGps(coords));
  const work=h.instance.resolve();
  const osmRequest=h.requests.find(r=>r.url.includes('nominatim'));
  assert.equal(new URL(osmRequest.url).searchParams.get('layer'),'address');
  assert.equal(h.requests.length,2);
  h.requests.find(r=>r.url.includes('bigdatacloud')).ok(big);
  osmRequest.ok(streetOnly);await flush();
  assert.equal(h.instance.location.address,'Calle 10A');
  const extra=h.requests.filter(r=>r.url.includes('photon.komoot.io'));
  assert.equal(extra.length,1);
  assert.equal(new URL(extra[0].url).searchParams.get('radius'),'0.025');
  assert.equal(new URL(extra[0].url).searchParams.get('limit'),'5');
  extra[0].ok(photon(numberedFeature()));await work;
  assert.equal(h.instance.location.address,'Calle 10A #20A-06');
  assert.equal(h.node('need-address').value,'Calle 10A #20A-06, apartamento 302');
});

test('no consulta Photon si Nominatim ya devuelve número',async()=>{
  const h=harness();h.instance.seed(model.locationFromGps(coords));const work=h.instance.resolve();
  h.requests.forEach(r=>r.ok(r.url.includes('nominatim')?osm:big));await work;
  assert.equal(h.requests.length,2);
});

test('un fallo de Photon conserva calle y campos administrativos',async()=>{
  const h=harness();h.instance.seed(model.locationFromGps(coords));const work=h.instance.resolve();
  h.requests.forEach(r=>r.ok(r.url.includes('nominatim')?streetOnly:big));await flush();
  h.requests.find(r=>r.url.includes('photon')).fail();await work;
  assert.equal(h.instance.location.address,'Calle 10A');
  assert.equal(h.instance.location.department,'Magdalena');
});

test('cancelar durante Photon impide aplicar la numeración tardía',async()=>{
  const h=harness();h.instance.seed(model.locationFromGps(coords));const work=h.instance.resolve();
  h.requests.forEach(r=>r.ok(r.url.includes('nominatim')?streetOnly:big));await flush();
  const extra=h.requests.find(r=>r.url.includes('photon'));
  h.instance.cancel();extra.ok(photon(numberedFeature()));await work;
  assert.equal(extra.signal.aborted,true);
  assert.equal(h.instance.location.address,'Calle 10A');
});

test('la consulta sin número no degrada un número conocido del mismo punto y calle',async()=>{
  const h=harness();h.instance.seed(model.locationFromNaturaGeocoders(coords,osm,big));
  const work=h.instance.resolve();h.requests.forEach(r=>r.ok(r.url.includes('nominatim')?streetOnly:big));
  await work;assert.equal(h.instance.location.address,'Calle 10A #20A-06');
  assert.equal(h.requests.length,2);
  assert.equal(model.preserveStreetNumber('Carrera 20D','Calle 10A #20A-06'),'Carrera 20D');
});

test('guardar espera Photon y conserva el número recuperado y el apartamento escrito',async()=>{
  const h=harness();h.instance.seed(model.locationFromGps(coords));h.instance.resolve();
  const saving=h.node('publish-form').submit({preventDefault(){}});
  h.requests.forEach(r=>r.ok(r.url.includes('nominatim')?streetOnly:big));await flush();
  assert.equal(h.saved.length,0);
  h.requests.find(r=>r.url.includes('photon')).ok(photon(numberedFeature()));await saving;
  assert.equal(h.saved[0][0].location.address,'Calle 10A #20A-06');
  assert.match(h.saved[0][0].addressText,/apartamento 302/);
});

test('el consentimiento anuncia Photon y la aproximación antes de transmitir coordenadas',()=>{
  const h=harness();h.instance.seed(model.locationFromGps(coords));
  h.node('gps-refresh').click();
  assert.match(h.confirmations[0],/Photon \(komoot\)/);
  assert.match(h.confirmations[0],/portal cercano/);
  h.instance.cancel();
});

const googlePayload={ok:true,service:'lonecesito-geocoder',status:'OK',result:{
  country:'Colombia',department:'Magdalena',municipality:'Santa Marta',city:'Santa Marta',
  address:'Calle 10A #20A-06, Santa Marta, Magdalena, Colombia'
}};
test('Google configurado tiene prioridad y guarda la dirección formateada como Natura',async()=>{
  const h=harness({google:async()=>googlePayload});
  h.instance.seed(model.locationFromGps(coords));const work=h.instance.resolve();
  const saved=h.node('publish-form').submit({preventDefault(){}});await work;await saved;
  assert.equal(h.requests.length,0);
  assert.equal(h.saved[0][0].location.address,googlePayload.result.address);
  assert.equal(h.saved[0][0].location.addressSource,'google');
  assert.match(h.saved[0][0].addressText,/apartamento 302/);
});
test('un fallo de Google mantiene el respaldo OSM sin bloquear la publicación',async()=>{
  const h=harness({google:async()=>{throw new Error('offline');}});
  h.instance.seed(model.locationFromGps(coords));const work=h.instance.resolve();await flush();
  h.requests.forEach(r=>r.ok(r.url.includes('nominatim')?osm:big));await work;
  assert.equal(h.instance.location.address,'Calle 10A #20A-06');
  assert.notEqual(h.instance.location.addressSource,'google');
});
test('cancelar Google no aplica su dirección ni activa proveedores después de salir',async()=>{
  const h=harness({google:(coords,{signal})=>new Promise((resolve,reject)=>{
    signal.addEventListener('abort',()=>reject(new Error('cancelled')),{once:true});
  })});
  h.instance.seed(model.locationFromGps(coords));const work=h.instance.resolve();
  h.instance.cancel();await work;assert.equal(h.requests.length,0);
  assert.equal(h.instance.location.address,'');
});
test('Google fallido no degrada una dirección Google ya guardada del mismo punto',async()=>{
  const h=harness({google:async()=>{throw new Error('offline');}});
  h.instance.seed(model.locationFromGoogleGeocoder(coords,googlePayload));
  const work=h.instance.resolve();await flush();
  h.requests.forEach(r=>r.ok(r.url.includes('nominatim')?streetOnly:big));await work;
  assert.equal(h.instance.location.address,googlePayload.result.address);
  assert.equal(h.instance.location.addressSource,'google');
  assert.equal(h.requests.length,2);
  assert.equal(h.node('gps-osm-credit').textContent,'Dirección: Google Maps');
});
test('actualizar con Google anuncia Apps Script antes de consultar el punto guardado',async()=>{
  const h=harness({google:async()=>googlePayload});h.instance.seed(model.locationFromGps(coords));
  h.node('gps-refresh').click();await h.instance.pending;
  assert.match(h.confirmations[0],/Google mediante el Apps Script de LoNecesito/);
  assert.equal(h.geo.watches,0);
});
