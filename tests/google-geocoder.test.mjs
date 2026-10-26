import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFileSync} from 'node:fs';
import {validLocation,locationFromGoogleGeocoder} from '../location-model.js';

const coords={latitude:11.24,longitude:-74.21,accuracy:12};
const code=readFileSync(new URL('../apps-script/geocodificador/Code.gs',import.meta.url),'utf8');
const response={status:'OK',results:[{
  formatted_address:'Calle 10A #20A-06, Santa Marta, Magdalena, Colombia',types:['street_address'],
  address_components:[['Colombia','country'],['Magdalena','administrative_area_level_1'],
    ['Santa Marta','administrative_area_level_2'],['Santa Marta','locality'],
    ['Calle 10A','route'],['20A-06','street_number']].map(([long_name,type])=>({long_name,types:[type]}))
}]};
function server(result=response){
  const cache=new Map(),puts=[],calls=[];
  const geocoder={setLanguage(v){calls.push(['language',v]);return this;},
    setRegion(v){calls.push(['region',v]);return this;},
    reverseGeocode(lat,lng){calls.push(['reverse',lat,lng]);if(result instanceof Error)throw result;return result;}};
  const context={Maps:{newGeocoder:()=>geocoder},CacheService:{getScriptCache:()=>({
    get:k=>cache.get(k),put(k,value,seconds){cache.set(k,value);puts.push({k,seconds});}
  })},ContentService:{MimeType:{JSON:'JSON',JAVASCRIPT:'JS'},createTextOutput:body=>({
    body,setMimeType(mime){return {body,mime};}
  })}};
  vm.createContext(context);vm.runInContext(code,context);
  return {request:parameter=>context.doGet({parameter}),calls,puts};
}

test('Apps Script reproduce idioma, región, formatted_address y caché de Natura',()=>{
  const s=server();const input={lat:'11.240000',lng:'-74.210000'};
  const payload=JSON.parse(s.request(input).body);
  assert.equal(payload.service,'lonecesito-geocoder');assert.equal(payload.ok,true);
  assert.equal(payload.result.address,response.results[0].formatted_address);
  assert.equal(payload.result.municipality,'Santa Marta');
  assert.deepEqual(s.calls,[['language','es'],['region','co'],['reverse',11.24,-74.21]]);
  assert.equal(s.puts[0].seconds,21600);
  s.request(input);assert.equal(s.calls.length,3);
});
test('estado y entradas inválidas no ejecutan Maps ni registran visitas',()=>{
  const s=server();assert.equal(JSON.parse(s.request({}).body).status,'ready');
  for(const p of [{lat:'',lng:'0'},{lat:'91',lng:'0'},{lat:'0',lng:'181'},
    {lat:'NaN',lng:'0'},{lat:'0;alert(1)',lng:'0'},{lat:'0'}])
    assert.equal(JSON.parse(s.request(p).body).ok,false);
  assert.equal(s.calls.length,0);
  assert.doesNotMatch(code,/SpreadsheetApp\.|sendTelegram|Logger\.|console\.|user_id/);
});
test('JSONP valida el callback y escapa etiquetas sin ejecutar texto recibido',()=>{
  const s=server();const prefix='lnGeo_'+'a'.repeat(32);
  const out=s.request({lat:'11.24',lng:'-74.21',prefix});
  assert.equal(out.mime,'JS');assert.ok(out.body.startsWith(prefix+'('));
  const bad=s.request({lat:'11.24',lng:'-74.21',prefix:'alert(1)//'});
  assert.equal(bad.mime,'JSON');assert.equal(JSON.parse(bad.body).status,'INVALID_CALLBACK');
  const unsafe=structuredClone(response);unsafe.results[0].formatted_address='<script>alert(1)</script>';
  const escaped=server(unsafe).request({lat:'11.24',lng:'-74.21',prefix});
  assert.doesNotMatch(escaped.body,/<script>/);assert.match(escaped.body,/\\u003c/);
});
test('Google sin resultados usa caché breve y fallo del servicio devuelve UNAVAILABLE',()=>{
  const s=server({status:'OK',results:[]});
  assert.equal(JSON.parse(s.request({lat:'0',lng:'0'}).body).ok,false);
  assert.equal(s.puts[0].seconds,120);
  assert.equal(JSON.parse(server(new Error('quota')).request({lat:'0',lng:'0'}).body).status,'UNAVAILABLE');
});
test('un plus code sin calle no se presenta como dirección postal',()=>{
  const s=server({status:'OK',results:[{formatted_address:'8Q5X+RR, Santa Marta',types:['plus_code'],
    address_components:[{long_name:'Santa Marta',types:['locality']}]}]});
  assert.equal(JSON.parse(s.request({lat:'11.24',lng:'-74.21'}).body).result.address,'');
});
test('modelo reconoce únicamente la respuesta del geocodificador independiente',()=>{
  const payload=JSON.parse(server().request({lat:'11.24',lng:'-74.21'}).body);
  const location=locationFromGoogleGeocoder(coords,payload);
  assert.equal(location.addressSource,'google');assert.equal(location.department,'Magdalena');
  assert.equal(location.address,response.results[0].formatted_address);
  assert.throws(()=>locationFromGoogleGeocoder(coords,{...payload,service:'visitas-natura'}));
});
test('PNG conserva dirección Google y atribuye a Google en lugar de OpenStreetMap',async()=>{
  const payload=JSON.parse(server().request({lat:'11.24',lng:'-74.21'}).body);
  const location=locationFromGoogleGeocoder(coords,payload),drawn=[];
  const ctx={beginPath(){},moveTo(){},lineTo(){},quadraticCurveTo(){},closePath(){},
    fill(){},stroke(){},fillRect(){},save(){},restore(){},clip(){},drawImage(){},
    fillText:t=>drawn.push(t),measureText:t=>({width:String(t).length*8})};
  const png=readFileSync(new URL('../card-png.js',import.meta.url),'utf8').replace(/^export /gm,'');
  const generate=new Function('document','Image',png+';return makeCardPng;')({
    createElement:()=>({getContext:()=>ctx,toBlob:fn=>fn({type:'image/png'})})
  },undefined);
  await generate({description:'Necesito electricista',contactPhone:'573001234567',
    addressText:'Apartamento 302',location,example:false});
  assert.ok(drawn.includes('Dirección: Google Maps'));
  assert.ok(drawn.includes('Dirección aproximada: '+payload.result.address));
  assert.ok(drawn.includes('Dirección indicada por el autor: Apartamento 302'));
  assert.ok(!drawn.some(t=>/OpenStreetMap/.test(t)));
});

const client=readFileSync(new URL('../google-geocoder.js',import.meta.url),'utf8')
  .replace(/^import .*\n/,'').replace(/^export /gm,'');
function transport(){
  const host={},scripts=[],timers=new Map();let next=0;
  const doc={createElement:()=>({remove(){this.removed=true;}}),head:{append:s=>scripts.push(s)}};
  const timer=(fn,ms)=>{const id=++next;timers.set(id,{fn,ms});return id;};
  const f=new Function('validLocation','document','window','crypto','setTimeout','clearTimeout',client+
    ';return {requestGoogleGeocode,googleGeocoderUrl};')(
    validLocation,doc,host,{getRandomValues:bytes=>bytes.fill(1)},timer,id=>timers.delete(id));
  const endpoint='https://script.google.com/macros/s/TEST/exec';
  return {...f,endpoint,host,scripts,timers};
}
test('configuración solo admite URL /exec de Apps Script, sin inventar endpoint activo',()=>{
  const t=transport();assert.equal(t.googleGeocoderUrl(), '');
  for(const value of ['https://evil.example/exec','https://script.google.com/macros/s/TEST/dev',
    'javascript:alert(1)','https://script.google.com/macros/s/TEST/exec?x=1'])
    assert.equal(t.googleGeocoderUrl({googleGeocoderUrl:value}),'');
  assert.equal(t.googleGeocoderUrl({googleGeocoderUrl:t.endpoint}),t.endpoint);
});
test('cliente envía únicamente coordenadas y callback, sin identidad, teléfono ni descripción',async()=>{
  const t=transport();const work=t.requestGoogleGeocode(coords,{endpoint:t.endpoint});
  const script=t.scripts[0],url=new URL(script.src),callback=url.searchParams.get('prefix');
  assert.deepEqual([...url.searchParams.keys()],['lat','lng','prefix']);
  assert.match(callback,/^lnGeo_[a-f0-9]{32}$/);assert.equal(script.referrerPolicy,'no-referrer');
  const payload=JSON.parse(server().request({lat:'11.24',lng:'-74.21'}).body);
  t.host[callback](payload);assert.equal(await work,payload);
  assert.equal(script.removed,true);assert.equal(t.host[callback],undefined);
});
test('cancelación y timeout ignoran respuestas tardías y liberan callbacks',async()=>{
  for(const abort of [true,false]){
    const t=transport(),controller=new AbortController();
    const work=t.requestGoogleGeocode(coords,{endpoint:t.endpoint,signal:controller.signal});
    const callback=new URL(t.scripts[0].src).searchParams.get('prefix');
    const rejected=assert.rejects(work,/cancelada|demasiado/);
    if(abort)controller.abort();else [...t.timers.values()].find(t=>t.ms===8000).fn();
    await rejected;
    assert.equal(t.scripts[0].removed,true);t.host[callback]({ok:true});
    [...t.timers.values()].forEach(t=>t.fn());assert.equal(t.host[callback],undefined);
  }
});
test('cliente rechaza respuestas ajenas al servicio previsto',async()=>{
  const t=transport(),work=t.requestGoogleGeocode(coords,{endpoint:t.endpoint});
  const callback=new URL(t.scripts[0].src).searchParams.get('prefix');
  t.host[callback]({ok:true,service:'visitas-natura'});await assert.rejects(work,/no devolvió/);
});
