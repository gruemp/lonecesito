import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {validLocation,locationLines,googleMapsLocationUrl} from '../location-model.js';
import {createLocationActions} from '../location-actions.js';

const source=readFileSync(new URL('../simple.js',import.meta.url),'utf8');
const renderer=source.slice(source.indexOf('function renderCard(record,owner){'),source.indexOf('function visibleItems(){'));
function element(tag,className='',text=''){
  return {tag,className,textContent:text,children:[],attributes:{},events:{},hidden:false,
    classList:{add(){}},append(...nodes){this.children.push(...nodes);},
    setAttribute(k,v){this.attributes[k]=v;},getAttribute(k){return this.attributes[k]??null;},
    removeAttribute(k){delete this.attributes[k];},
    addEventListener(t,fn){this.events[t]=fn;},click(){if(!this.disabled)this.events.click?.({preventDefault(){}});}};
}
function descendants(node){return [node,...node.children.flatMap(descendants)];}
function setup({owner=false,location={latitude:1,longitude:0,accuracy:3},secure=true}={}){
  const requests=[];
  const options={el:element,icon:kind=>element('svg',kind),secure,
    geolocation:{getCurrentPosition(...args){requests.push(args);}}};
  const bindings={el:element,derivedTitle:()=>'',legacyDetails:r=>r.description,
    contactIcon:options.icon,createReadingPanel:()=>element('div','audio-panel'),
    canManage:()=>true,currentUid:()=>'author',validLocation,locationLines,googleMapsLocationUrl,
    createLocationActions:(getLocation,getAddress)=>createLocationActions(getLocation,getAddress,options),
    navigator:{geolocation:options.geolocation},window:{isSecureContext:secure}};
  const render=new Function(...Object.keys(bindings),renderer+';return renderCard;')(...Object.values(bindings));
  const card=render({description:'Necesidad',addressText:'Dirección heredada, apto 2',location},owner);
  const find=name=>descendants(card).find(n=>n.className.split(' ').includes(name));
  return {card,find,requests,options};
}
for(const owner of [false,true]){
  test(`ficha ${owner?'propia':'pública'} ofrece mapa y distancia en la fila sin acciones duplicadas debajo`,()=>{
    const {find,requests}=setup({owner});
    assert.deepEqual(find('audio-panel').children.map(n=>n.className),[
      'audio-action location-map-action','audio-action location-distance-action','audio-action audio-location']);
    assert.equal(find('publication-map-actions'),undefined);
    assert.equal(find('publication-distance-result'),undefined);
    assert.equal(find('location-distance-action').attributes['aria-label'],'Distancia desde mi ubicación actual');
    assert.equal(new URL(find('location-map-action').getAttribute('href')).searchParams.get('query'),'1.000000,0.000000');
    assert.equal(requests.length,0);
    find('audio-location').click();
    assert.equal(find('publication-location').hidden,false);
    assert.match(find('publication-location-lines').textContent,/Dirección heredada, apto 2/);
  });
}
test('la distancia se muestra dentro del botón y se puede medir de nuevo desde otra posición',()=>{
  const {find,requests}=setup();
  const button=find('location-distance-action'),value=find('location-distance-value');
  button.click();button.click();
  assert.equal(requests.length,1);assert.equal(button.disabled,true);assert.equal(value.textContent,'…');
  assert.deepEqual(requests[0][2],{enableHighAccuracy:true,maximumAge:0,timeout:15000});
  requests[0][0]({coords:{latitude:0,longitude:0}});
  assert.equal(button.disabled,false);assert.equal(value.textContent,'111,2 km');
  assert.match(button.attributes['aria-label'],/en línea recta, no por carretera/);
  button.click();requests[1][0]({coords:{latitude:1,longitude:0}});
  assert.equal(value.textContent,'0 m');
});
test('errores aparecen en el botón y permiten volver a intentar sin bloquear Maps',()=>{
  for(const code of [1,2,3]){
    const {find,requests}=setup();const button=find('location-distance-action');
    button.click();requests[0][1]({code});
    assert.equal(button.disabled,false);
    assert.equal(find('location-distance-value').textContent,code===1?'Sin permiso':'Reintentar');
    assert.ok(find('location-map-action').getAttribute('href'));
    button.click();assert.equal(requests.length,2);
  }
});
test('dirección heredada sin GPS permite Maps sin pedir ni inventar distancia',()=>{
  const {find,requests}=setup({location:null});
  assert.equal(find('location-distance-action').disabled,true);
  find('location-distance-action').click();assert.equal(requests.length,0);
  assert.equal(new URL(find('location-map-action').getAttribute('href')).searchParams.get('query'),'Dirección heredada, apto 2');
});
test('contexto inseguro y coordenadas inválidas no muestran una cifra falsa',()=>{
  const {find,requests}=setup({secure:false});find('location-distance-action').click();
  assert.equal(find('location-distance-value').textContent,'Sin GPS');assert.equal(requests.length,0);
  const h=setup();h.find('location-distance-action').click();h.requests[0][0]({coords:{latitude:95,longitude:0}});
  assert.equal(h.find('location-distance-value').textContent,'Reintentar');
});
test('cambiar o quitar el destino invalida lecturas tardías y la cifra anterior',()=>{
  const {options,requests}=setup();let destination={latitude:1,longitude:0,accuracy:3};
  const controls=createLocationActions(()=>destination,()=>'',options);controls.update();
  controls.distance.click();destination={latitude:2,longitude:0,accuracy:3};controls.update();
  requests[0][0]({coords:{latitude:0,longitude:0}});
  assert.equal(controls.distance.children[1].textContent,'');
  controls.distance.click();requests[1][0]({coords:{latitude:0,longitude:0}});
  assert.equal(controls.distance.children[1].textContent,'222,4 km');
  destination=null;controls.update();assert.equal(controls.distance.children[1].textContent,'');
  assert.equal(controls.distance.disabled,true);assert.equal(controls.map.getAttribute('href'),null);
});
test('el editor no contiene campo de dirección, avisos finales ni botones inferiores duplicados',()=>{
  const html=readFileSync(new URL('../index.html',import.meta.url),'utf8');
  assert.doesNotMatch(html,/need-address|gps-disclaimer|gps-refresh|gps-map-link|gps-preview-actions/);
  assert.match(source,/draftReadingPanel.append\(draftLocationActions.map,draftLocationActions.distance\)/);
  assert.match(source,/legacyAddressDraft=cleanAddressText\(record.addressText\|\|''\)/);
  assert.match(source,/const addressText=legacyAddressDraft/);
});
