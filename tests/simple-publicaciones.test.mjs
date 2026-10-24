import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {APP_VERSION,EXAMPLE_PUBLICATIONS,cleanPublication,normalizeWhatsApp,whatsappUrl,exampleWhatsappUrl,derivedTitle,canManage} from '../simple-model.js';

const input={
  description:'Necesito que reparen una nevera que dejó de enfriar. Estoy en Santa Marta. Mi presupuesto es de 150.000 pesos.',
  contactPhone:'300 123 4567'
};
test('la interfaz muestra exactamente dos entradas de publicación',()=>{
  const html=readFileSync(new URL('../index.html',import.meta.url),'utf8');
  const form=html.split('<form id="publish-form"')[1].split('</form>')[0];
  assert.match(form,/id="need-description"/);
  assert.match(form,/id="need-phone"/);
  assert.equal([...form.matchAll(/<(?:textarea|input|select)\b/g)].length,2);
  for(const old of ['need-category','need-city','need-title','need-budget','need-picture','need-quantity','need-condition','need-consent'])assert.doesNotMatch(form,new RegExp(old));
});
test('se conserva la versión visible y sin avisos de pruebas',()=>{
  const html=readFileSync(new URL('../index.html',import.meta.url),'utf8');
  assert.equal(APP_VERSION,'2.2.2');
  assert.match(html,/<span id="release-version">Versión 2\.2\.2<\/span>/);
  assert.ok(html.indexOf('class="release-bar"')<html.indexOf('<header class="site-header">'));
  assert.doesNotMatch(html,/mode-notice|example-note|Ver cambios/);
});
test('el modelo almacena únicamente la necesidad, teléfono y título derivado',()=>{
  const need=cleanPublication(input);
  assert.deepEqual(Object.keys(need).sort(),['contactConsent','contactPhone','description','title']);
  assert.equal(need.description,input.description);
  assert.equal(need.contactPhone,'573001234567');
  assert.equal(need.contactConsent,true);
  assert.equal(need.title,derivedTitle(input.description));
});
test('se admite un texto largo y se rechazan necesidades vacías',()=>{
  const need=cleanPublication({...input,description:'Necesito '+ 'detalles '.repeat(150)});
  assert.ok(need.description.length>1000);
  assert.throws(()=>cleanPublication({...input,description:'abc'}));
  assert.throws(()=>cleanPublication({...input,description:'a'.repeat(4001)}));
});
test('WhatsApp real abre el número de la ficha',()=>{
  const href=whatsappUrl('+57 300 123 4567',input.description);
  assert.match(href,/^https:\/\/api\.whatsapp\.com\/send\?phone=573001234567&text=/);
  assert.match(decodeURIComponent(href),/reparen una nevera/);
});
test('teléfonos de ejemplo abren WhatsApp sin apuntar a un tercero',()=>{
  assert.ok(EXAMPLE_PUBLICATIONS.length>0);
  const url=exampleWhatsappUrl(EXAMPLE_PUBLICATIONS[0].description);
  assert.match(url,/^https:\/\/api\.whatsapp\.com\/send\?text=/);
  assert.doesNotMatch(url,/3000000000/);
});
test('validar indicativo y proteger publicaciones propias',()=>{
  assert.equal(normalizeWhatsApp('3001234567'),'573001234567');
  assert.throws(()=>normalizeWhatsApp('javascript:alert(1)'));
  assert.equal(canManage({ownerUid:'a'},'a'),true);
  assert.equal(canManage({ownerUid:'a'},'b'),false);
});
test('las fichas tienen teléfono enlazado y sin acciones de aceptar o resolver',()=>{
  const js=readFileSync(new URL('../simple.js',import.meta.url),'utf8');
  assert.match(js,/phoneLink\(record,contactNumber,'contact-phone'\)/);
  assert.match(js,/whatsappUrl\(number,record.description\|\|record.title\)/);
  assert.match(js,/exampleWhatsappUrl\(record.description\|\|record.title\)/);
  assert.match(js,/editRecord\(record\)/);
  assert.match(js,/deleteRecord\(record\)/);
  assert.doesNotMatch(js,/Aceptar necesidad|Marcar como resuelta|Me interesa atender/);
});
test('los registros antiguos conservan sus detalles al editarse',()=>{
  const js=readFileSync(new URL('../simple.js',import.meta.url),'utf8');
  assert.match(js,/function legacyDetails\(record,\{forCard=false\}=\{\}\)/);
  for(const field of ['city','subcategory','quantity','condition','budget','desiredDate'])assert.ok(js.includes('record.'+field));
  assert.match(js,/deleteField\(\)/);
});

test('las fichas ahorran altura sin esconder texto ni apretar el ancho',()=>{
  const css=readFileSync(new URL('../simple.css',import.meta.url),'utf8');
  const html=readFileSync(new URL('../index.html',import.meta.url),'utf8');
  const js=readFileSync(new URL('../simple.js',import.meta.url),'utf8');
  assert.doesNotMatch(css,/\.publication-facts|\.publication-fact\b|\.publication-kind/);
  assert.match(css,/\.contact-box\{display:grid;grid-template-columns:minmax\(0,1fr\) minmax\(0,1fr\)/);
  assert.match(css,/\.owner-actions\{display:grid;grid-template-columns:repeat\(2,minmax\(0,1fr\)\)/);
  assert.match(css,/\.publication-description\{font-size:13\.5px;line-height:1\.46;/);
  assert.match(css,/\.publication-card:nth-child\(4n\+2\)/);
  assert.match(css,/\.publication-card:nth-child\(4n\+3\)/);
  assert.match(css,/\.publication-card:nth-child\(4n\)/);
  assert.match(css,/#need-description\{min-height:148px;/);
  assert.match(js,/legacyDetails\(record,\{forCard:true\}\)/);
  assert.match(html,/Versión 2\.2\.2/);
  assert.doesNotMatch(html,/mode-notice|example-note/);
});
test('número y acción de WhatsApp están separados y apuntan al endpoint API',()=>{
  const js=readFileSync(new URL('../simple.js',import.meta.url),'utf8');
  assert.match(js,/phoneLink\(record,contactNumber,'contact-phone'\)/);
  assert.match(js,/phoneLink\(record,'Abrir WhatsApp ↗','whatsapp-button'\)/);
  const url=whatsappUrl('3001234567','Reparación de nevera');
  const parsed=new URL(url);
  assert.equal(parsed.hostname,'api.whatsapp.com');
  assert.equal(parsed.pathname,'/send');
  assert.equal(parsed.searchParams.get('phone'),'573001234567');
  assert.match(parsed.searchParams.get('text'),/Reparación de nevera/);
});


test('las fichas ilustrativas se generan mediante el mismo modelo de los dos campos',()=>{
  assert.equal(EXAMPLE_PUBLICATIONS.length,3);
  for(const sample of EXAMPLE_PUBLICATIONS){
    assert.equal(sample.example,true);
    assert.deepEqual(
      Object.keys(sample).sort(),
      ['id','example','description','title','contactPhone','contactConsent'].sort()
    );
    const rebuilt=cleanPublication({description:sample.description,contactPhone:sample.contactPhone});
    assert.equal(sample.title,rebuilt.title);
    assert.equal(sample.description,rebuilt.description);
    assert.equal(sample.contactPhone,rebuilt.contactPhone);
    assert.equal(sample.contactConsent,true);
    assert.match(sample.description,/\n/);
    assert.ok(sample.description.length>90);
    for(const oldField of ['city','category','subcategory','budget','quantity','desiredDate','picture','condition']){
      assert.equal(Object.hasOwn(sample,oldField),false,oldField);
    }
  }
});
test('el diseño de ejemplos y fichas reales es idéntico salvo el destino seguro de WhatsApp',()=>{
  const code=readFileSync(new URL('../simple.js',import.meta.url),'utf8');
  const html=readFileSync(new URL('../index.html',import.meta.url),'utf8');
  assert.match(code,/function renderCard\(record,owner\)/);
  assert.match(code,/visible\.map\(item=>renderCard\(item,false\)\)/);
  assert.match(code,/if\(record.example===true\|\|record.contactConsent===true\)contactNumber='\+'\+normalizeWhatsApp\(record.contactPhone\)/);
  assert.match(code,/record\.example===true\s*\?exampleWhatsappUrl/);
  assert.doesNotMatch(code,/EJEMPLO FICTICIO|Teléfono de ejemplo|Esta es una ficha ilustrativa/);
  assert.doesNotMatch(html,/mode-notice|example-note/);
  assert.match(html,/Versión 2\.2\.2/);
});


test('ninguna ficha contiene bloques separados de ciudad, categoría, presupuesto o fecha',()=>{
  const js=readFileSync(new URL('../simple.js',import.meta.url),'utf8');
  const css=readFileSync(new URL('../simple.css',import.meta.url),'utf8');
  const start=js.indexOf('function renderCard(record,owner){');
  const end=js.indexOf('\nfunction visibleItems(){',start);
  assert.ok(start>=0&&end>start);
  const card=js.slice(start,end);
  assert.doesNotMatch(card,/publication-facts|publication-fact|publication-kind|el\('dl'/);
  assert.match(card,/legacyDetails\(record,\{forCard:true\}\)/);
  assert.match(card,/const rest=fullText\.startsWith\(title\)/);
  assert.doesNotMatch(css,/\.publication-facts|\.publication-fact\b|\.publication-kind/);
});
test('datos heredados pasan al texto único y ejemplos no crean campos separados',()=>{
  const js=readFileSync(new URL('../simple.js',import.meta.url),'utf8');
  const start=js.indexOf('function legacyDetails(record,');
  const end=js.indexOf('\nfunction phoneLink(',start);
  assert.ok(start>=0&&end>start);
  const legacyDetails=new Function('derivedTitle',js.slice(start,end)+';return legacyDetails;')(derivedTitle);
  const previous={
    title:'Busco repuesto de una máquina',
    description:'Busco un repuesto compatible que se pueda enviar.',
    city:'Santa Marta',
    category:'bienes',
    subcategory:'Maquinaria',
    quantity:2,
    budget:150000,
    desiredDate:'2026-11-01'
  };
  const display=legacyDetails(previous,{forCard:true});
  assert.match(display,/Santa Marta/);
  assert.match(display,/Maquinaria/);
  assert.match(display,/Cantidad: 2/);
  assert.match(display,/Presupuesto: /);
  assert.match(display,/Fecha: 2026-11-01/);
  assert.doesNotMatch(display,/Necesidad: Busco repuesto/);
  for(const sample of EXAMPLE_PUBLICATIONS){
    assert.equal(legacyDetails(sample,{forCard:true}),sample.description);
    assert.equal(Object.hasOwn(sample,'city'),false);
  }
});
test('un dato escrito en el texto no se vuelve a agregar al final',()=>{
  const js=readFileSync(new URL('../simple.js',import.meta.url),'utf8');
  const start=js.indexOf('function legacyDetails(record,');
  const end=js.indexOf('\nfunction phoneLink(',start);
  const legacyDetails=new Function('derivedTitle',js.slice(start,end)+';return legacyDetails;')(derivedTitle);
  const description='Necesito una nevera en Santa Marta. Busco reparador para esta semana.';
  const result=legacyDetails({description,city:'Santa Marta'},{forCard:true});
  assert.equal(result,description);
});
test('la guía portátil está enlazada desde README y AGENTS',()=>{
  const readme=readFileSync(new URL('../README.md',import.meta.url),'utf8');
  const agents=readFileSync(new URL('../AGENTS.md',import.meta.url),'utf8');
  const guide=readFileSync(new URL('../docs/PREFERENCIAS-LO-NECESITO.md',import.meta.url),'utf8');
  assert.match(readme,/\[AGENTS\.md\]\(AGENTS\.md\)/);
  assert.match(readme,/docs\/PREFERENCIAS-LO-NECESITO\.md/);
  assert.match(agents,/docs\/PREFERENCIAS-LO-NECESITO\.md/);
  assert.match(guide,/No.*crear recuadros separados/i);
  assert.match(guide,/una.*caja de texto/i);
});
