import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {validLocation,locationLines,googleMapsLocationUrl,googleMapsDirectionsUrl,
  distanceKmBetween,distanceLabel} from '../location-model.js';

// Exercise the actual renderer shared by Mis publicaciones and Ver necesidades.
const source=readFileSync(new URL('../simple.js',import.meta.url),'utf8');
const renderer=source.slice(source.indexOf('function renderCard(record,owner){'),
  source.indexOf('function visibleItems(){'));
function element(tag,className='',text=''){
  return {tag,className,textContent:text,children:[],attributes:{},events:{},hidden:false,
    classList:{add(){}},append(...nodes){this.children.push(...nodes);},
    setAttribute(key,value){this.attributes[key]=value;},
    addEventListener(type,handler){this.events[type]=handler;},
    click(){if(!this.disabled)this.events.click?.();}};
}
function descendants(node){return [node,...node.children.flatMap(descendants)];}
function setup({owner=false,location={latitude:1,longitude:0,accuracy:3},secure=true}={}){
  const requests=[];
  const bindings={el:element,derivedTitle:()=>'',legacyDetails:r=>r.description,
    contactIcon:()=>element('svg'),createReadingPanel:()=>element('div','audio-panel'),
    canManage:()=>true,currentUid:()=>'author',validLocation,locationLines,
    googleMapsLocationUrl,googleMapsDirectionsUrl,distanceKmBetween,distanceLabel,
    navigator:{geolocation:{getCurrentPosition(...args){requests.push(args);}}},
    window:{isSecureContext:secure}};
  const render=new Function(...Object.keys(bindings),renderer+';return renderCard;')(...Object.values(bindings));
  const card=render({description:'Necesidad',addressText:'Dirección escrita, apto 2',location},owner);
  const find=className=>descendants(card).find(n=>n.className.split(' ').includes(className));
  return {card,find,requests};
}
for(const owner of [false,true]){
  test(`panel ${owner?'propio':'público'} conserva datos y prioriza distancia sin pedir GPS al abrir`,()=>{
    const {find,requests}=setup({owner});
    const panel=find('publication-location');
    assert.equal(panel.hidden,true);
    find('audio-location').click();
    assert.equal(panel.hidden,false);
    assert.match(find('publication-location-lines').textContent,/Dirección escrita, apto 2/);
    assert.deepEqual(find('publication-map-actions').children.map(n=>n.className),[
      'publication-distance-button','publication-distance-result','publication-map-link']);
    assert.equal(find('publication-distance-result').hidden,true);
    assert.equal(find('publication-distance-button').textContent,'Distancia desde mi ubicación actual');
    assert.equal(requests.length,0);
    assert.equal(find('publication-route-link'),undefined);
    find('audio-location').click();
    assert.equal(panel.hidden,true);
  });
}
test('distancia usa una lectura actual por toque y permite volver a medir desde otra posición',()=>{
  const {find,requests}=setup();
  const button=find('publication-distance-button'),result=find('publication-distance-result');
  button.click();button.click();
  assert.equal(requests.length,1);
  assert.equal(button.disabled,true);
  assert.equal(result.hidden,false);
  assert.deepEqual(requests[0][2],{enableHighAccuracy:true,maximumAge:0,timeout:15000});
  requests[0][0]({coords:{latitude:0,longitude:0}});
  assert.equal(button.disabled,false);
  assert.equal(result.textContent,'Distancia aproximada en línea recta: 111,2 km. No es la distancia por carretera.');
  button.click();
  assert.equal(requests.length,2);
  requests[1][0]({coords:{latitude:1,longitude:0}});
  assert.equal(result.textContent,'Distancia aproximada en línea recta: 0 m. No es la distancia por carretera.');
});
test('permiso denegado y GPS no disponible permiten reintentar y conservan Maps',()=>{
  for(const code of [1,2,3]){
    const {find,requests}=setup();
    find('publication-distance-button').click();
    requests[0][1]({code});
    assert.equal(find('publication-distance-button').disabled,false);
    assert.match(find('publication-distance-result').textContent,/Google Maps/);
    assert.ok(find('publication-map-link').href);
    find('publication-distance-button').click();
    assert.equal(requests.length,2);
  }
});
test('dirección sin GPS conserva botón y orienta hacia Maps sin solicitar posición',()=>{
  const {find,requests}=setup({location:null});
  find('publication-distance-button').click();
  assert.match(find('publication-distance-result').textContent,/no tiene coordenadas GPS/);
  assert.equal(requests.length,0);
  assert.match(find('publication-distance-result').textContent,/Google Maps/);
  assert.equal(new URL(find('publication-map-link').href).searchParams.get('query'),'Dirección escrita, apto 2');
});
test('navegador sin contexto seguro explica requisito sin solicitar GPS',()=>{
  const {find,requests}=setup({secure:false});
  find('publication-distance-button').click();
  assert.match(find('publication-distance-result').textContent,/HTTPS/);
  assert.equal(requests.length,0);
});
test('coordenada inválida del visitante no produce distancia engañosa',()=>{
  const {find,requests}=setup();
  find('publication-distance-button').click();
  requests[0][0]({coords:{latitude:95,longitude:0}});
  assert.match(find('publication-distance-result').textContent,/No se pudo calcular/);
  assert.equal(find('publication-distance-button').disabled,false);
});
