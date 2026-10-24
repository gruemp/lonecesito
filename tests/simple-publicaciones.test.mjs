import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {APP_VERSION,APP_VERSION_DATE,EXAMPLE_PUBLICATIONS,normalizeWhatsApp,whatsappUrl,cleanPublication,canManage} from '../simple-model.js';

const sample={
  title:'Necesito reparar una nevera',category:'servicios',city:'Santa Marta',
  description:'Busco alguien que repare una nevera que dejó de enfriar.',
  contactPhone:'300 123 4567',contactConsent:true,budget:'',picture:''
};

test('celular colombiano sin indicativo se normaliza a +57',()=>{
  assert.equal(normalizeWhatsApp('300 123 4567'),'573001234567');
  assert.equal(normalizeWhatsApp('+57 300 123 4567'),'573001234567');
});
test('WhatsApp codifica un mensaje por solicitud sin inventar un contacto',()=>{
  const link=whatsappUrl('3001234567','Reparar nevera');
  assert.ok(link.startsWith('https://wa.me/573001234567?text='));
  assert.ok(decodeURIComponent(link).includes('Reparar nevera'));
});
test('no se admiten teléfonos peligrosos o incompletos',()=>{
  for(const value of ['javascript:alert(1)','1234','+57001','300<script>','00 123 45']){
    assert.throws(()=>normalizeWhatsApp(value));
  }
});
test('para publicar se exige autorización expresa del WhatsApp público',()=>{
  assert.throws(()=>cleanPublication({...sample,contactConsent:false}),/Autoriza/);
  const need=cleanPublication(sample);
  assert.equal(need.contactPhone,'573001234567');
  assert.equal(need.contactConsent,true);
  assert.equal(need.budget,null);
});
test('el autor puede administrar y los visitantes ajenos no',()=>{
  const record={ownerUid:'usuario-1'};
  assert.equal(canManage(record,'usuario-1'),true);
  assert.equal(canManage(record,'usuario-2'),false);
  assert.equal(canManage(record,null),false);
});
test('el HTML implementa navegación sencilla, sin aceptación de terceros',()=>{
  const html=readFileSync(new URL('../index.html',import.meta.url),'utf8');
  assert.match(html,/id="browse-list"/);
  assert.match(html,/id="mine-list"/);
  assert.match(html,/id="need-phone"/);
  assert.match(html,/id="need-consent"/);
  assert.doesNotMatch(html,/Aceptar necesidad|Mostrar interés|Solicitudes de interés/);
});
test('interfaz conecta cada teléfono con WhatsApp y limita edición al propietario',()=>{
  const code=readFileSync(new URL('../simple.js',import.meta.url),'utf8');
  assert.match(code,/whatsappUrl\(record\.contactPhone,record\.title\)/);
  assert.match(code,/canManage\(record,currentUid\(\)\)/);
  assert.match(code,/deleteDoc\(/);
  assert.match(code,/textContent/);
});

test('la publicación muestra versión en lo más alto de la página',()=>{
  const html=readFileSync(new URL('../index.html',import.meta.url),'utf8');
  assert.equal(APP_VERSION,'2.0.0');
  assert.equal(APP_VERSION_DATE,'24/10/2026');
  assert.ok(html.indexOf('class="release-bar"') < html.indexOf('<header class="site-header">'));
  assert.match(html,/Versión de publicación 2\.0\.0/);
});
test('todos los ejemplos incluyen contacto ficticio, categoría y descripción',()=>{
  assert.ok(EXAMPLE_PUBLICATIONS.length>=3);
  for(const row of EXAMPLE_PUBLICATIONS){
    assert.equal(row.example,true);
    assert.ok(row.contactPhone);
    assert.ok(row.city && row.title && row.description);
    assert.ok(['bienes','servicios'].includes(row.category));
  }
});
test('las fichas incluyen todos los campos, incluso valores opcionales',()=>{
  const code=readFileSync(new URL('../simple.js',import.meta.url),'utf8');
  for(const field of ['subcategory','quantity','condition','budget','desiredDate','picture','contactPhone']){
    assert.ok(code.includes('record.'+field),'Campo faltante en ficha: '+field);
  }
  assert.match(code,/whatsappLink\(record,number,'contact-phone'\)/);
  assert.match(code,/whatsappLink\(record,'Contactar por WhatsApp ↗','whatsapp-button'\)/);
  assert.match(code,/example-card/);
  assert.doesNotMatch(code,/makeButton\('Aceptar necesidad'/);
});
