import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {APP_VERSION,cleanPublication,normalizeWhatsApp,whatsappUrl,derivedTitle,canManage} from '../simple-model.js';

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
test('la versión solo existe en el modelo interno y no aparece en pantalla',()=>{
  const html=readFileSync(new URL('../index.html',import.meta.url),'utf8');
  const js=readFileSync(new URL('../simple.js',import.meta.url),'utf8');
  assert.equal(APP_VERSION,'2.2.24');
  assert.doesNotMatch(html,/Versión 2|release-version|release-bar/);
  assert.doesNotMatch(js,/\$\('release-version'\)/);
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
  const need=cleanPublication({...input,description:'x'.repeat(1000)});
  assert.equal(need.description.length,1000);
  assert.throws(()=>cleanPublication({...input,description:'x'.repeat(1001)}),/1.000/);
  assert.equal(cleanPublication({...input,description:'a'}).description,'a');
  assert.equal(cleanPublication({...input,description:'abc'}).description,'abc');
  assert.throws(()=>cleanPublication({...input,description:'   '}));
  assert.throws(()=>cleanPublication({...input,description:'a'.repeat(4001)}));
});
test('WhatsApp real abre el número de la ficha',()=>{
  const href=whatsappUrl('+57 300 123 4567',input.description);
  assert.match(href,/^https:\/\/api\.whatsapp\.com\/send\?phone=573001234567&text=/);
  assert.match(decodeURIComponent(href),/reparen una nevera/);
});
test('validar indicativo y proteger publicaciones propias',()=>{
  assert.equal(normalizeWhatsApp('3001234567'),'573001234567');
  assert.throws(()=>normalizeWhatsApp('javascript:alert(1)'));
  assert.equal(canManage({ownerUid:'a'},'a'),true);
  assert.equal(canManage({ownerUid:'a'},'b'),false);
});
test('las fichas tienen teléfono enlazado y sin acciones de aceptar o resolver',()=>{
  const js=readFileSync(new URL('../simple.js',import.meta.url),'utf8');
  assert.match(js,/contactLink\('tel:'\+contactNumber,'call','Llamar por teléfono'\)/);
  assert.match(js,/whatsappUrl\(contactNumber,record.description\|\|record.title\)/);
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
  assert.doesNotMatch(html,/Versión 2|release-version/);
  assert.doesNotMatch(html,/mode-notice|example-note/);
});
test('dos iconos independientes: llamada con tel y WhatsApp con endpoint API',()=>{
  const js=readFileSync(new URL('../simple.js',import.meta.url),'utf8');
  assert.match(js,/contactLink\('tel:'\+contactNumber,'call','Llamar por teléfono'\)/);
  assert.match(js,/contactLink\(whatsappUrl\(contactNumber,record.description\|\|record.title\),'whatsapp','Escribir por WhatsApp'\)/);
  const url=whatsappUrl('3001234567','Reparación de nevera');
  const parsed=new URL(url);
  assert.equal(parsed.hostname,'api.whatsapp.com');
  assert.equal(parsed.pathname,'/send');
  assert.equal(parsed.searchParams.get('phone'),'573001234567');
  assert.match(parsed.searchParams.get('text'),/Reparación de nevera/);
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
  assert.match(card,/copy\.append\(el\('p','publication-description',fullText\)\)/);
  assert.doesNotMatch(css,/\.publication-facts|\.publication-fact\b|\.publication-kind/);
});
test('datos heredados pasan al texto único y ejemplos no crean campos separados',()=>{
  const js=readFileSync(new URL('../simple.js',import.meta.url),'utf8');
  const start=js.indexOf('function legacyDetails(record,');
  const end=js.indexOf('\nfunction contactIcon(',start);
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
  assert.match(display,/Necesidad: Busco repuesto/);

});
test('un dato escrito en el texto no se vuelve a agregar al final',()=>{
  const js=readFileSync(new URL('../simple.js',import.meta.url),'utf8');
  const start=js.indexOf('function legacyDetails(record,');
  const end=js.indexOf('\nfunction contactIcon(',start);
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
  assert.match(guide,/(?:caja grande de texto|una sola caja de texto)/i);
});


test('los contactos en fichas son botones únicamente con iconos',()=>{
  const js=readFileSync(new URL('../simple.js',import.meta.url),'utf8');
  const css=readFileSync(new URL('../simple.css',import.meta.url),'utf8');
  assert.match(js,/function contactIcon\(kind\)/);
  assert.match(js,/document\.createElementNS\(ns,'svg'\)/);
  assert.match(js,/a\.append\(contactIcon\(kind\)\)/);
  assert.match(js,/contactLink\('tel:'\+contactNumber,'call','Llamar por teléfono'\)/);
  assert.match(js,/contactLink\(whatsappUrl\(contactNumber,record.description\|\|record.title\),'whatsapp','Escribir por WhatsApp'\)/);
  assert.match(js,/a\.setAttribute\('aria-label',label\)/);
  assert.match(js,/a\.title=label/);
  assert.doesNotMatch(js,/phoneLink\(|contact\.append\(el\('span','contact-phone/);
  assert.doesNotMatch(css,/\.contact-phone\b|\.whatsapp-button\b/);
  assert.match(css,/\.contact-action\{display:flex;/);
  assert.match(css,/\.call-action\{background:#236b96/);
  assert.match(css,/\.whatsapp-action\{background:#16844e/);
  assert.match(css,/\.contact-action\{[^}]*min-height:46px/);
});
test('el formulario informa del destino público del teléfono aunque la ficha no lo escriba',()=>{
  const html=readFileSync(new URL('../index.html',import.meta.url),'utf8');
  assert.match(html,/Tu número quedará disponible en los enlaces públicos de llamada y WhatsApp/);
  assert.doesNotMatch(html,/Versión 2|release-version/);
});
test('AGENTS y la guía documentan el marcador de llamada y los iconos sin número',()=>{
  const agents=readFileSync(new URL('../AGENTS.md',import.meta.url),'utf8');
  const guide=readFileSync(new URL('../docs/PREFERENCIAS-LO-NECESITO.md',import.meta.url),'utf8');
  for(const content of [agents,guide]){
    assert.match(content,/tel:\+/);
    assert.match(content,/no mostrar el número|no aparece como texto|sin números escritos/i);
    assert.match(content,/icono.*WhatsApp/i);
  }
});


test('solo dos campos de publicación con micrófono y foto dentro del editor',()=>{
  const html=readFileSync(new URL('../index.html',import.meta.url),'utf8');
  const editor=html.split('<form id="publish-form"')[1].split('</form>')[0];
  assert.equal([...editor.matchAll(/<(?:textarea|input|select)\b/g)].length,2);
  assert.match(editor,/id="voice-button"/);
  assert.match(editor,/id="add-photo"/);
  assert.match(editor,/id="photo-preview"/);
  assert.match(html,/id="photo-picker" type="file"[^>]* hidden /);
  const css=readFileSync(new URL('../simple.css',import.meta.url),'utf8');
  assert.match(css,/#publish-form \.publish-controls\{\s*display:grid;/);
  assert.match(css,/\.voice-tool\.listening\{/);
  assert.match(css,/\.photo-preview\[hidden\]\{display:none!important\}/);
});
test('dictado del navegador en español con permiso, detener y teclado convencional',()=>{
  const js=readFileSync(new URL('../simple.js',import.meta.url),'utf8');
  assert.match(js,/window\.SpeechRecognition\|\|window\.webkitSpeechRecognition/);
  assert.match(js,/instance\.lang='es-CO'/);
  assert.match(js,/instance\.interimResults=false/);
  assert.match(js,/instance\.start\(\)/);
  assert.match(js,/function stopDictation\(\)/);
  assert.match(js,/current\.abort\(\)/);
  assert.match(js,/setMicState\(true\)/);
  assert.match(js,/textarea\.value=\(textarea\.value\+join\+transcript\)\.slice\(0,textarea\.maxLength\)/);
  assert.match(js,/micrófono del teclado/);
});
test('las fichas reservan imagen derecha y dejan vacío el espacio si falta fotografía',()=>{
  const js=readFileSync(new URL('../simple.js',import.meta.url),'utf8');
  const css=readFileSync(new URL('../simple.css',import.meta.url),'utf8');
  assert.match(js,/const main=el\('div','publication-main'\)/);
  assert.match(js,/const copy=el\('div','publication-copy'\)/);
  assert.match(js,/const media=el\('div','publication-media'\)/);
  assert.match(js,/main\.append\(copy\)/);
  assert.doesNotMatch(js,/placeholder\.append\(contactIcon\('photo'\)\)/);
  assert.match(js,/img\.loading='lazy'/);
  assert.match(css,/\.publication-main\.has-photo\{display:grid;grid-template-columns:minmax\(0,1fr\) clamp\(90px,25vw,180px\)/);
  assert.match(css,/\.publication-media\{[^}]*aspect-ratio:4\/3/);
  assert.match(css,/\.publication-media \.publication-photo\{[^}]*object-fit:cover/);
});
test('fotografía opcional comprimida y editable; reglas admiten cambios del dueño',()=>{
  const js=readFileSync(new URL('../simple.js',import.meta.url),'utf8');
  const rules=readFileSync(new URL('../firestore.rules',import.meta.url),'utf8');
  assert.match(js,/async function encodePhoto\(file\)/);
  assert.match(js,/canvas\.toDataURL\('image\/jpeg',quality\)/);
  assert.match(js,/encoded\.length<380000/);
  assert.match(js,/if\(pictureDraft\)data\.picture=pictureDraft/);
  assert.match(js,/if\(current\.picture&&!pictureDraft\)updated\.picture=api\.deleteField\(\)/);
  assert.match(rules,/data\.picture\.size\(\) <= 400000/);
  assert.match(rules,/'contactConsent','picture'/);
});
test('preferencias permanentes actualizadas con dictado, imagen y eliminación de textos',()=>{
  const agents=readFileSync(new URL('../AGENTS.md',import.meta.url),'utf8');
  const guide=readFileSync(new URL('../docs/PREFERENCIAS-LO-NECESITO.md',import.meta.url),'utf8');
  for(const content of [agents,guide]){
    assert.match(content,/micrófono/i);
    assert.match(content,/imagen.*derecha|derecha.*imagen|foto.*derecha/i);
    assert.match(content,/no.*portada|portada.*no|quitar los textos/i);
  }
});


test('al tocar cualquier punto de una fotografía de la ficha se abre el visor completo',()=>{
  const js=readFileSync(new URL('../simple.js',import.meta.url),'utf8');
  const css=readFileSync(new URL('../simple.css',import.meta.url),'utf8');
  const card=js.slice(js.indexOf('function renderCard(record,owner){'),js.indexOf('\nfunction visibleItems(){'));
  assert.match(card,/const enlarge=el\('button','publication-photo-button'\)/);
  assert.match(card,/enlarge\.append\(img\)/);
  assert.match(card,/enlarge\.addEventListener\('click',\(\)=>openImageViewer\(photo,accessibleLabel\)\)/);
  assert.match(card,/media\.append\(enlarge\)/);
  assert.doesNotMatch(card,/photo-placeholder|placeholder\.append/);
  assert.doesNotMatch(card,/placeholder\.addEventListener\('click'/);
  assert.match(css,/\.publication-photo-button\{[^}]*width:100%;height:100%/);
});
test('visor muestra imagen sin recortes y permite cerrar con X, fondo o Escape',()=>{
  const html=readFileSync(new URL('../index.html',import.meta.url),'utf8');
  const js=readFileSync(new URL('../simple.js',import.meta.url),'utf8');
  const css=readFileSync(new URL('../simple.css',import.meta.url),'utf8');
  assert.match(html,/<dialog id="image-dialog" class="image-dialog" aria-labelledby="image-dialog-title">/);
  assert.match(html,/id="close-image"[^>]*aria-label="Cerrar fotografía"/);
  assert.match(html,/id="image-dialog-photo" alt=""/);
  assert.match(js,/function openImageViewer\(src,title\)/);
  assert.match(js,/if\(!dialog\.open\)dialog\.showModal\(\)/);
  assert.match(js,/\$\('close-image'\)\.addEventListener\('click',\(\)=>\$\('image-dialog'\)\.close\(\)\)/);
  assert.match(js,/if\(event\.target===\$\('image-dialog'\)\)\$\('image-dialog'\)\.close\(\)/);
  assert.match(js,/image-dialog'\)\.addEventListener\('close'/);
  assert.match(css,/#image-dialog-photo\{[^}]*object-fit:contain/);
  assert.match(css,/\.image-dialog::backdrop\{/);
  assert.match(css,/@media\(max-width:600px\)\{\.image-dialog\{/);
  // El elemento dialog admite Escape sin añadir un atajo propio.
});
test('la miniatura del editor también permite ampliar sin cambiar los dos campos',()=>{
  const html=readFileSync(new URL('../index.html',import.meta.url),'utf8');
  const js=readFileSync(new URL('../simple.js',import.meta.url),'utf8');
  assert.match(html,/id="preview-photo" type="button"[^>]*aria-label="Ampliar la fotografía seleccionada"/);
  assert.match(html,/<img id="photo-preview-image" alt="Foto seleccionada">/);
  assert.match(js,/\$\('preview-photo'\)\.addEventListener\('click',\(\)=>\{/);
  assert.match(js,/if\(pictureDraft\)openImageViewer\(pictureDraft,'la publicación'\)/);
  const form=html.split('<form id="publish-form"')[1].split('</form>')[0];
  assert.equal([...form.matchAll(/<(?:input|textarea|select)\b/g)].length,2);
});
test('queda entrega transportable con estado Firebase y aprendizajes sin prometer producción',()=>{
  const agents=readFileSync(new URL('../AGENTS.md',import.meta.url),'utf8');
  const guide=readFileSync(new URL('../docs/PREFERENCIAS-LO-NECESITO.md',import.meta.url),'utf8');
  const handoff=readFileSync(new URL('../docs/CONTINUIDAD-Y-APRENDIZAJES.md',import.meta.url),'utf8');
  const readme=readFileSync(new URL('../README.md',import.meta.url),'utf8');
  for(const file of [agents,readme])assert.match(file,/CONTINUIDAD-Y-APRENDIZAJES\.md/);
  assert.match(guide,/object-fit: contain/);
  assert.match(handoff,/2\.2\.13/);
  assert.match(handoff,/Firebase.*vacía|firebase-config\.js.*vacía|firebase-config\.js.*vacías/i);
  assert.match(handoff,/Aprendizajes del diseño/);
  assert.match(handoff,/No.*comparten|no se comparten|no.*aparecen en los navegadores/i);
  assert.match(handoff,/Escape/);
});


test('la descripción está justificada y la columna vacía no tiene marco ni marcador',()=>{
  const js=readFileSync(new URL('../simple.js',import.meta.url),'utf8');
  const css=readFileSync(new URL('../simple.css',import.meta.url),'utf8');
  const card=js.slice(js.indexOf('function renderCard(record,owner){'),js.indexOf('\nfunction visibleItems(){'));
  assert.match(card,/main\.append\(copy\)/);
  assert.match(card,/const media=el\('div','publication-media'\)/);
  assert.doesNotMatch(card,/placeholder|photo-placeholder|contactIcon\('photo'\)/);
  assert.match(css,/\.publication-main:not\(\.has-photo\) \.publication-description\{width:100%\}/);
  assert.match(css,/\.publication-main \.publication-description\{white-space:pre-wrap;text-align:justify;text-align-last:left;hyphens:auto/);
  assert.match(css,/\.publication-media \.publication-photo,\.publication-photo-button \.publication-photo\{object-fit:contain/);
});
test('todas las fichas tienen tercer botón para compartir PNG sin palabra Contactar',()=>{
  const js=readFileSync(new URL('../simple.js',import.meta.url),'utf8');
  const css=readFileSync(new URL('../simple.css',import.meta.url),'utf8');
  const card=js.slice(js.indexOf('function renderCard(record,owner){'),js.indexOf('\nfunction visibleItems(){'));
  assert.match(card,/const share=el\('button','contact-action share-action'\)/);
  assert.match(card,/share\.append\(contactIcon\('share'\)\)/);
  assert.match(card,/share\.addEventListener\('click',\(\)=>sharePublicationPng\(record\)\)/);
  assert.match(card,/contact\.append\(share\)/);
  assert.match(css,/\.contact-box\{grid-template-columns:repeat\(3,minmax\(0,1fr\)\)/);
  assert.match(css,/\.share-action\{background:#565c93/);
  assert.doesNotMatch(card,/Contactar/);
});
test('la exportación PNG usa canvas, hoja nativa de compartir o descarga',()=>{
  const js=readFileSync(new URL('../simple.js',import.meta.url),'utf8');
  const png=readFileSync(new URL('../card-png.js',import.meta.url),'utf8');
  assert.match(js,/import \{makeCardPng\} from '.\/card-png\.js\?v=20261025-v2218'/);
  assert.match(js,/async function sharePublicationPng\(record\)/);
  assert.match(js,/navigator\.share\(\{files:\[file\],title:/);
  assert.match(js,/new File\(\[blob\],filename,\{type:'image\/png'\}\)/);
  assert.match(js,/download\.download=filename/);
  assert.match(png,/drawing\.toBlob\(blob=>blob\?resolve\(blob\)/);
  assert.match(png,/drawWrapped\(ctx,bodyLines,left,bodyY\+32,bodyWidth,lineHeight,true\)/);
  assert.match(png,/const bodyHeight=Math\.max\(paragraphHeight,photoHeight\)/);
  assert.match(png,/if\(hasPhone\)/);
  assert.match(png,/const hasPhone=!example&&Boolean\(contactPhone\)/);
  assert.match(png,/const img=await photoImage\(picture\)/);
});
test('las preferencias portables reflejan compartir PNG y espacio en blanco sin imagen',()=>{
  const agents=readFileSync(new URL('../AGENTS.md',import.meta.url),'utf8');
  const guide=readFileSync(new URL('../docs/PREFERENCIAS-LO-NECESITO.md',import.meta.url),'utf8');
  const handoff=readFileSync(new URL('../docs/CONTINUIDAD-Y-APRENDIZAJES.md',import.meta.url),'utf8');
  for(const file of [agents,guide,handoff]){
    assert.match(file,/PNG/);
    assert.match(file,/vacío|vacía/);
  }
});


test('se eliminaron los encabezados y párrafos de las tres secciones',()=>{
  const html=readFileSync(new URL('../index.html',import.meta.url),'utf8');
  const js=readFileSync(new URL('../simple.js',import.meta.url),'utf8');
  for(const phrase of [
    '<h2 id="browse-title">Necesidades publicadas</h2>',
    'Encuentra necesidades y contacta directamente por WhatsApp.',
    '<h2 id="mine-title">Mis publicaciones</h2>',
    'Edita o elimina tus publicaciones cuando lo necesites.',
    '<h2 id="publish-title">Publica lo que necesitas</h2>',
    'Describe tu necesidad y deja tu WhatsApp.'
  ])assert.equal(html.includes(phrase),false,phrase);
  assert.doesNotMatch(html,/class="page-heading"/);
  assert.doesNotMatch(js,/\$\('publish-title'\)/);
  assert.match(html,/id="necesidades"[^>]*aria-label="Necesidades publicadas"/);
  assert.match(html,/id="publicar"[^>]*aria-label="Publicar necesidad"/);
});
test('fichas sin títulos y mostrando toda la necesidad desde la primera palabra',()=>{
  const js=readFileSync(new URL('../simple.js',import.meta.url),'utf8');
  const card=js.slice(js.indexOf('function renderCard(record,owner){'),js.indexOf('\nfunction visibleItems(){'));
  assert.doesNotMatch(card,/el\('h3'|publication-heading|append\(heading\)|const rest=/);
  assert.match(card,/const fullText=legacyDetails\(record,\{forCard:true\}\)\|\|description/);
  assert.match(card,/copy\.append\(el\('p','publication-description',fullText\)\)/);
  const png=readFileSync(new URL('../card-png.js',import.meta.url),'utf8');
  assert.doesNotMatch(png,/titleLines|fillText\(title|drawWrapped\(ctx,titleLines/);
});
test('fichas con altura natural y descripción a ancho completo sin foto',()=>{
  const js=readFileSync(new URL('../simple.js',import.meta.url),'utf8');
  const css=readFileSync(new URL('../simple.css',import.meta.url),'utf8');
  const card=js.slice(js.indexOf('function renderCard(record,owner){'),js.indexOf('\nfunction visibleItems(){'));
  assert.match(card,/main\.append\(copy\)/);
  assert.match(card,/main\.classList\.add\('has-photo'\)/);
  assert.match(card,/main\.append\(media\)/);
  assert.doesNotMatch(card,/main\.append\(copy,media\)/);
  assert.match(css,/\.publication-main\{display:block;min-width:0\}/);
  assert.match(css,/\.publication-main\.has-photo\{display:grid;/);
  assert.match(css,/\.publication-main:not\(\.has-photo\) \.publication-description\{width:100%\}/);
  assert.match(css,/\.publication-card\{height:auto;min-height:0;/);
  assert.match(css,/\.publication-main \.publication-description\{margin:0;/);
});
test('se aceptan necesidades de una sola letra sin mínimo artificial',()=>{
  const html=readFileSync(new URL('../index.html',import.meta.url),'utf8');
  const model=readFileSync(new URL('../simple-model.js',import.meta.url),'utf8');
  const rules=readFileSync(new URL('../firestore.rules',import.meta.url),'utf8');
  assert.doesNotMatch(html,/id="need-description"[^>]*minlength=/);
  assert.doesNotMatch(model,/description\.length<10/);
  assert.match(rules,/data\.description\.size\(\) >= 1/);
  assert.equal(cleanPublication({description:'X',contactPhone:'3001234567'}).description,'X');
  assert.throws(()=>cleanPublication({description:'  ',contactPhone:'3001234567'}));
});
test('el PNG no genera título y adapta el ancho y el alto si falta imagen',()=>{
  const png=readFileSync(new URL('../card-png.js',import.meta.url),'utf8');
  const js=readFileSync(new URL('../simple.js',import.meta.url),'utf8');
  assert.match(png,/const hasPhoto=Boolean\(img\)/);
  assert.match(png,/const bodyWidth=hasPhoto\?available-imageWidth-imageGap:available/);
  assert.match(png,/const photoHeight=hasPhoto\?/);
  assert.match(png,/const bodyHeight=Math\.max\(paragraphHeight,photoHeight\)/);
  assert.match(js,/const description=legacyDetails\(record,\{forCard:true\}\)/);
  assert.doesNotMatch(png,/const titleLines=|titleHeight=/);
});


test('la ficha propia conserva contacto y edición en la primera fila',()=>{
  const js=readFileSync(new URL('../simple.js',import.meta.url),'utf8');
  const css=readFileSync(new URL('../simple.css',import.meta.url),'utf8');
  const card=js.slice(js.indexOf('function renderCard(record,owner){'),js.indexOf('\nfunction visibleItems(){'));
  assert.match(card,/contact\.classList\.add\('has-owner-actions'\)/);
  assert.match(card,/const edit=el\('button','contact-action edit-action'\)/);
  assert.match(card,/const remove=el\('button','contact-action delete-action'\)/);
  assert.match(card,/edit\.append\(contactIcon\('edit'\)\)/);
  assert.match(card,/remove\.append\(contactIcon\('delete'\)\)/);
  assert.match(card,/edit\.addEventListener\('click',\(\)=>editRecord\(record\)\)/);
  assert.match(card,/remove\.addEventListener\('click',\(\)=>deleteRecord\(record\)\)/);
  assert.match(card,/contact\.append\(edit,remove\)/);
  assert.doesNotMatch(card,/el\('div','owner-actions'\)|outline-button','Editar'|danger-button','Eliminar'/);
  assert.equal((card.match(/article\.append\(contact\)/g)||[]).length,1);
  assert.match(css,/\.publication-card \.contact-box\.has-owner-actions\{grid-template-columns:repeat\(5,minmax\(0,1fr\)\)\}/);
  assert.match(css,/\.publication-card \.contact-box\{grid-template-columns:repeat\(3,minmax\(0,1fr\)\)\}/);
});
test('los iconos de contacto son accesibles y conservan sus colores',()=>{
  const js=readFileSync(new URL('../simple.js',import.meta.url),'utf8');
  const css=readFileSync(new URL('../simple.css',import.meta.url),'utf8');
  const card=js.slice(js.indexOf('function renderCard(record,owner){'),js.indexOf('\nfunction visibleItems(){'));
  assert.match(card,/edit\.setAttribute\('aria-label','Editar publicación'\)/);
  assert.match(card,/remove\.setAttribute\('aria-label','Eliminar publicación'\)/);
  assert.match(card,/edit\.title='Editar publicación'/);
  assert.match(card,/remove\.title='Eliminar publicación'/);
  assert.match(css,/\.publication-card \.edit-action\{background:#dcedfb/);
  assert.match(css,/\.publication-card \.delete-action\{background:#fde6e5/);
  assert.match(css,/\.publication-card \.contact-action\{[^}]*min-height:46px/);
  assert.match(css,/@media\(max-width:420px\)[\s\S]*?\.publication-card \.contact-action\{min-height:44px/);
});
test('compartir usa icono de tres puntos conectados y no flecha hacia arriba',()=>{
  const js=readFileSync(new URL('../simple.js',import.meta.url),'utf8');
  const icon=js.slice(js.indexOf("kind==='share'?"),js.indexOf("kind==='edit'?"));
  assert.match(icon,/M18 8a3 3/);
  assert.match(icon,/M6 15a3 3/);
  assert.match(icon,/M18 22a3 3/);
  assert.match(icon,/m8\.7 13\.3 6\.6 4\.4/);
  assert.doesNotMatch(icon,/M12 16V3/);
});
test('las reglas actuales describen las dos filas de voz y contacto',()=>{
  const agents=readFileSync(new URL('../AGENTS.md',import.meta.url),'utf8');
  const guide=readFileSync(new URL('../docs/PREFERENCIAS-LO-NECESITO.md',import.meta.url),'utf8');
  const handoff=readFileSync(new URL('../docs/CONTINUIDAD-Y-APRENDIZAJES.md',import.meta.url),'utf8');
  for(const content of [agents,guide,handoff]){
    assert.match(content,/2\.2\.13/);
    assert.match(content,/segunda fila|dos filas/i);
    assert.match(content,/reanudar/i);
  }
});


test('fila única: teléfono con icono a la izquierda, imagen, micrófono y enviar',()=>{
  const html=readFileSync(new URL('../index.html',import.meta.url),'utf8');
  const form=html.split('<form id="publish-form"')[1].split('</form>')[0];
  const controls=form.match(/<div class="publish-controls">([\s\S]*?)<\/div>\s*<div id="draft-audio-row"/);
  assert.ok(controls,'No está la fila de publicación');
  const part=controls[1];
  const ordered=['class="phone-field"','class="phone-field-icon"','id="need-phone"','id="add-photo"','id="voice-button"','id="save-button"'];
  let last=-1;
  for(const name of ordered){
    const position=part.indexOf(name);
    assert.ok(position>last,'Orden incorrecto en la fila: '+name);
    last=position;
  }
  assert.match(part,/id="need-phone"[^>]*placeholder="Ej: 300 123 4567"/);
  assert.match(part,/id="save-button" type="submit"[^>]*aria-label="Publicar"/);
  assert.match(part,/id="save-button"[\s\S]*?<svg[\s\S]*?<path d="m22 2-7 20-4-9-9-4Z"/);
  assert.doesNotMatch(part,/Publicar necesidad|>Publicar</);
  assert.doesNotMatch(form,/Número de WhatsApp|class="field-help"/);
  assert.match(part,/for="need-phone" class="visually-hidden"/);
});
test('CSS conserva una sola fila en móvil y usa el ancho restante para el teléfono',()=>{
  const css=readFileSync(new URL('../simple.css',import.meta.url),'utf8');
  assert.match(css,/#publish-form \.publish-controls\{\s*display:grid;grid-template-columns:minmax\(0,1fr\) 44px 44px 52px;/);
  assert.match(css,/#publish-form \.phone-field\{display:flex;align-items:center;/);
  assert.match(css,/#publish-form \.phone-field-icon\{[^}]*flex:0 0 20px/);
  assert.match(css,/#publish-form \.phone-field #need-phone\{[^}]*width:100%;min-width:0/);
  assert.match(css,/@media\(max-width:450px\)[\s\S]*?\.publish-controls\{grid-template-columns:minmax\(0,1fr\) 42px 42px 45px/);
  assert.match(css,/@media\(max-width:345px\)[\s\S]*?\.publish-controls\{grid-template-columns:minmax\(0,1fr\) repeat\(3,38px\)/);
  assert.match(css,/#publish-form \.need-entry\.has-photo-preview #need-description\{padding-bottom:60px\}/);
});
test('Enter activa el mismo envío del botón sin duplicarlo, Shift Enter inserta línea',()=>{
  const js=readFileSync(new URL('../simple.js',import.meta.url),'utf8');
  assert.match(js,/function publishOnEnter\(event\)/);
  assert.match(js,/event\.key!=='Enter'\|\|event\.shiftKey\|\|event\.isComposing\|\|event\.keyCode===229\|\|event\.repeat/);
  assert.match(js,/event\.preventDefault\(\)/);
  assert.match(js,/if\(state\.saving\)return/);
  assert.match(js,/form\.requestSubmit\(\$\('save-button'\)\)/);
  assert.match(js,/\$\('need-description'\)\.addEventListener\('keydown',publishOnEnter\)/);
  assert.match(js,/\$\('need-phone'\)\.addEventListener\('keydown',publishOnEnter\)/);
  assert.match(js,/\$\('publish-form'\)\.addEventListener\('submit',async event=>\{/);
});
test('el icono de envío permanece al crear y al guardar cambios',()=>{
  const js=readFileSync(new URL('../simple.js',import.meta.url),'utf8');
  const html=readFileSync(new URL('../index.html',import.meta.url),'utf8');
  assert.match(js,/\$\('save-button'\)\.setAttribute\('aria-label','Publicar'\)/);
  assert.match(js,/\$\('save-button'\)\.setAttribute\('aria-label','Guardar cambios'\)/);
  assert.doesNotMatch(js,/\$\('save-button'\)\.textContent=/);
  assert.match(html,/id="cancel-edit"[^>]*aria-label="Cancelar edición" hidden/);
});
test('las instrucciones para futuras IA describen la nueva fila y el teclado',()=>{
  for(const path of ['../AGENTS.md','../docs/PREFERENCIAS-LO-NECESITO.md','../docs/CONTINUIDAD-Y-APRENDIZAJES.md']){
    const content=readFileSync(new URL(path,import.meta.url),'utf8');
    assert.match(content,/2\.2\.13/);
    assert.match(content,/Shift\+Enter|Shift \+ Enter/);
    assert.match(content,/Ej: 300 123 4567/);
  }
});


test('el editor muestra papelera y X en la misma fila únicamente en edición',()=>{
  const html=readFileSync(new URL('../index.html',import.meta.url),'utf8');
  const js=readFileSync(new URL('../simple.js',import.meta.url),'utf8');
  const controls=html.split('<div class="publish-controls">')[1].split('</div>\n      <p id="form-feedback"')[0];
  assert.match(controls,/id="delete-edit" type="button"[^>]*aria-label="Eliminar publicación" hidden/);
  assert.match(controls,/id="delete-edit"[\s\S]*?<svg[\s\S]*?<path d="M3 6h18"/);
  assert.ok(controls.indexOf('id="save-button"')<controls.indexOf('id="delete-edit"'));
  assert.ok(controls.indexOf('id="delete-edit"')<controls.indexOf('id="cancel-edit"'));
  assert.match(js,/\$\('delete-edit'\)\.hidden=true/);
  assert.match(js,/\$\('delete-edit'\)\.hidden=false/);
  assert.match(js,/\$\('delete-edit'\)\.addEventListener\('click',async\(\)=>\{/);
});
test('el icono de eliminación del editor confirma, protege al dueño y vuelve al listado al terminar',()=>{
  const js=readFileSync(new URL('../simple.js',import.meta.url),'utf8');
  assert.match(js,/const record=state\.items\.find\(item=>item\.id===state\.editingId\)/);
  assert.match(js,/if\(!record\|\|!canManage\(record,currentUid\(\)\)\)/);
  assert.match(js,/const deleted=await deleteRecord\(record\)/);
  assert.match(js,/if\(deleted\)\{\s*resetForm\(\);\s*window\.location\.hash='#mis-publicaciones';\s*showView\(\)/);
  assert.match(js,/if\(!window\.confirm\('¿Eliminar definitivamente esta publicación\?'\)\)return false/);
  assert.match(js,/return true/);
  assert.match(js,/state\.saving=true/);
  assert.match(js,/\$\('delete-edit'\)\.disabled=true/);
});
test('el editor mantiene una única fila responsive con espacio para la papelera',()=>{
  const css=readFileSync(new URL('../simple.css',import.meta.url),'utf8');
  assert.match(css,/#publish-form \.publish-controls\.editing\{grid-template-columns:minmax\(0,1fr\) repeat\(5,44px\)\}/);
  assert.match(css,/@media\(max-width:450px\)[\s\S]*?\.publish-controls\.editing\{grid-template-columns:minmax\(0,1fr\) repeat\(5,37px\)\}/);
  assert.match(css,/@media\(max-width:345px\)[\s\S]*?\.publish-controls\.editing\{grid-template-columns:minmax\(0,1fr\) repeat\(5,32px\);gap:3px\}/);
  assert.match(css,/#publish-form \.delete-edit-button\{[^}]*min-height:46px/);
  assert.match(css,/#publish-form \.delete-edit-button:disabled/);
});
test('las instrucciones de continuidad incluyen la papelera adicional',()=>{
  const agents=readFileSync(new URL('../AGENTS.md',import.meta.url),'utf8');
  const guide=readFileSync(new URL('../docs/PREFERENCIAS-LO-NECESITO.md',import.meta.url),'utf8');
  const handoff=readFileSync(new URL('../docs/CONTINUIDAD-Y-APRENDIZAJES.md',import.meta.url),'utf8');
  for(const file of [agents,guide,handoff]){
    assert.match(file,/2\.2\.13/);
    assert.match(file,/papelera/i);
    assert.match(file,/mis publicaciones/i);
  }
});




test('cuatro pestañas: una fila en PC y dos en móvil, en orden lógico',()=>{
 const html=readFileSync(new URL('../index.html',import.meta.url),'utf8');
 const css=readFileSync(new URL('../simple.css',import.meta.url),'utf8');
 const nav=html.match(/<nav class="top-nav"[^>]*>([\s\S]*?)<\/nav>/);
 assert.ok(nav);
 const links=[...nav[1].matchAll(/data-nav="([^"]+)"/g)].map(x=>x[1]);
 assert.deepEqual(links,['inicio','publicar','mis-publicaciones','necesidades']);
 assert.match(css,/\.site-header \.top-nav\{[^}]*grid-template-columns:repeat\(4,minmax\(0,1fr\)\)/);
 assert.match(css,/@media\(max-width:680px\)\{[\s\S]*?\.site-header \.top-nav\{[^}]*grid-template-columns:repeat\(2,minmax\(0,1fr\)\)/);
  assert.match(css,/--home-frame-width:min\(calc\(100% - 32px\),1440px/);
 assert.match(css,/\.home-visual-screen \.welcome-banner img\{[^}]*object-fit:contain/);
  assert.match(css,/\.home-visual-screen\{[^}]*width:var\(--home-frame-width\)/);
  assert.match(css,/aspect-ratio:1819 \/ 865;object-fit:contain/);
  assert.match(css,/\.site-header \.header-layout\{[^}]*width:var\(--home-frame-width\)/);
  assert.match(css,/@media\(max-width:680px\)\{[\s\S]*?--home-frame-width:min\(calc\(100% - 20px\)/);
});
test('imagen aprobada de dos pasos ocupa solo Inicio, sin fichas ni buscador',()=>{
 const html=readFileSync(new URL('../index.html',import.meta.url),'utf8');
 const js=readFileSync(new URL('../simple.js',import.meta.url),'utf8');
 const inicio=html.split('<section id="inicio"')[1].split('</section>')[0];
 const browse=html.split('<section id="necesidades"')[1].split('</section>')[0];
 assert.match(inicio,/src="assets\/lonecesito-presentacion-dos-pasos\.png"/);
 assert.doesNotMatch(inicio,/id="search"|id="browse-list"/);
 assert.doesNotMatch(browse,/welcome-banner|presentacion\.webp/);
 assert.match(browse,/id="search"/);
 assert.match(js,/const screen=pages\.includes\(page\)\?page:'inicio'/);
 assert.equal((html.match(/lonecesito-presentacion-dos-pasos\.png/g)||[]).length,1);
});
test('no existe versión visible ni necesidades de ejemplo',()=>{
 const html=readFileSync(new URL('../index.html',import.meta.url),'utf8');
 const js=readFileSync(new URL('../simple.js',import.meta.url),'utf8');
 const model=readFileSync(new URL('../simple-model.js',import.meta.url),'utf8');
 assert.doesNotMatch(html,/release-version|release-bar|Versión 2\./);
 assert.doesNotMatch(model,/EXAMPLE_PUBLICATIONS|samplePublication|exampleWhatsappUrl/);
 assert.doesNotMatch(js,/EXAMPLE_PUBLICATIONS|exampleWhatsappUrl|sampleCall/);
 assert.match(js,/item\.example===true/); // Registros ficticios antiguos también se ocultan.
 assert.match(js,/return state\.items\.filter/);
});
test('buscador por tramos e índice de campos públicos y teléfono',()=>{
 const js=readFileSync(new URL('../simple.js',import.meta.url),'utf8');
 const search=readFileSync(new URL('../simple-search.js',import.meta.url),'utf8');
 assert.match(js,/publicationMatchesQuery\(item,query\)/);
 assert.match(js,/\$\('search'\)\.addEventListener\('input',render\)/);
 assert.match(search,/contactPhone/);
 assert.match(search,/city','category','subcategory'/);
 assert.match(search,/terms\.every\(term=>index\.includes\(term\)\)/);
 assert.match(search,/normalize\('NFD'\)/);
 assert.doesNotMatch(search,/['"](?:ownerUid|ownerEmail|apiKey)['"]/);
});

test('WhatsApp destaca únicamente la necesidad y usa el texto aprobado',()=>{
  const url=new URL(whatsappUrl('3001234567','Busco repuesto de ventilador'));
  assert.equal(url.searchParams.get('text'),
    'Hola, vi tu publicación en LoNecesito: *«Busco repuesto de ventilador»*. ¿Aún lo necesitas? Puedo ayudarte.');
  const long='Necesito '+ 'ventilador '.repeat(30);
  const content=new URL(whatsappUrl('3001234567',long)).searchParams.get('text');
  assert.match(content,/^Hola, vi tu publicación en LoNecesito: \*«/);
  assert.match(content,/»\*\. ¿Aún lo necesitas\? Puedo ayudarte\.$/);
});
test('dos botones de voz, pin GPS y ninguna geolocalización de visitantes',()=>{
  const js=readFileSync(new URL('../simple.js',import.meta.url),'utf8');
  const css=readFileSync(new URL('../simple.css',import.meta.url),'utf8');
  const card=js.slice(js.indexOf('function renderCard(record,owner){'),js.indexOf('function visibleItems(){'));
  assert.match(js,/const panel=el\('div','audio-control-row'\)/);
  assert.match(js,/controls\.main\.replaceChildren\(contactIcon\(status==='playing'\?'pause':'play'\)\)/);
  assert.match(card,/pin\.disabled=!location/);
  assert.match(card,/locationLines\(location\)\.join\('\\n'\)/);
  assert.match(card,/pin\.addEventListener\('click'/);
  assert.match(css,/\.audio-control-row\{grid-template-columns:repeat\(3,minmax\(0,1fr\)\)\}/);
  assert.match(js,/new SpeechSynthesisUtterance\(content\)/);
  assert.doesNotMatch(card,/getCurrentPosition/);
});
test('dos botones reproducen, pausan, reanudan y reinician',()=>{
  const js=readFileSync(new URL('../simple.js',import.meta.url),'utf8');
  const a=js.indexOf('let activeReading=null;');
  const b=js.indexOf('function renderCard(record,owner){',a);
  const spoken=[];
  const synth={paused:false,current:null,getVoices:()=>[],
    speak(u){spoken.push(u.text);this.current=u;},
    cancel(){const old=this.current;this.current=null;old?.onerror?.({error:'canceled'});}
  };
  const dom=(tag,klass)=>({tag,klass,children:[],dataset:{},disabled:false,
    append(...nodes){this.children.push(...nodes);},setAttribute(){},
    replaceChildren(...nodes){this.children=nodes;},
    addEventListener(event,fn){this[event]=fn;}});
  const ctrl=new Function('window','SpeechSynthesisUtterance','contactIcon','toast','recognition','stopDictation','el',
    js.slice(a,b)+';return {createReadingPanel,stopReading};')(
      {speechSynthesis:synth},function Utterance(text){this.text=text;},
      kind=>({kind}),()=>{},null,()=>{},dom);
  const text='Necesito un ventilador Samurai Air Pro. '.repeat(10);
  const panel=ctrl.createReadingPanel(()=>text),buttons=panel.readingButtons;
  assert.deepEqual(Object.keys(buttons),['main','restart']);
  buttons.main.click();
  assert.equal(panel.dataset.readingState,'playing');
  assert.equal(buttons.main.attributes,undefined);
  assert.equal(buttons.main.children[0].kind,'pause');
  synth.current.onboundary({charIndex:23});
  buttons.main.click();
  assert.equal(panel.dataset.readingState,'paused');
  assert.equal(buttons.main.children[0].kind,'play');
  buttons.main.click();
  assert.equal(panel.dataset.readingState,'playing');
  assert.equal(spoken[1],spoken[0].slice(23));
  buttons.restart.click();
  assert.equal(spoken[2],spoken[0]);
  ctrl.stopReading();
  assert.equal(panel.dataset.readingState,'idle');
});
test('GPS opcional en el editor: consentimiento explícito y precisión GPS',()=>{
  const html=readFileSync(new URL('../index.html',import.meta.url),'utf8');
  const js=readFileSync(new URL('../simple.js',import.meta.url),'utf8');
  const rules=readFileSync(new URL('../firestore.rules',import.meta.url),'utf8');
  assert.match(html,/id="draft-audio-row"/);
  assert.match(html,/id="gps-preview"/);
  assert.match(html,/id="gps-remove"/);
  assert.match(js,/navigator\.geolocation\.watchPosition/);
  assert.match(js,/enableHighAccuracy:true,maximumAge:0,timeout:12000/);
  assert.match(js,/window\.confirm\('¿Quieres adjuntar/);
  assert.match(js,/https:\/\/api\.bigdatacloud\.net\/data\/reverse-geocode-client/);
  assert.match(js,/locationDraft=locationFromGps\(coords,geo\)/);
  assert.match(js,/if\(capturingLocation\)\{finishGpsMeasurement\(\);return;\}/);
  assert.match(js,/if\(current\.location&&!locationDraft\)updated\.location=api\.deleteField\(\)/);
  assert.match(rules,/validLocation\(data\.location\)/);
  assert.match(rules,/'picture','location'/);
});
test('coordenadas, precisión y dirección jerárquica sin inventar calle',async()=>{
  const src=readFileSync(new URL('../location-model.js',import.meta.url),'utf8');
  const f=new Function(src.replace(/^export /gm,'')+
    ';return {locationFromGps,locationLines,validLocation};')();
  const loc=f.locationFromGps({latitude:11.23999965,longitude:-74.21567842,accuracy:18.6},
    {countryName:'Colombia',principalSubdivision:'Magdalena',city:'Santa Marta',localityName:'El Rodadero'});
  assert.equal(loc.latitude,11.24);
  assert.equal(loc.longitude,-74.215678);
  assert.equal(loc.accuracy,19);
  assert.equal(loc.address,'');
  assert.ok(f.validLocation(loc));
  assert.deepEqual(f.locationLines(loc),[
    'País: Colombia','Departamento: Magdalena','Ciudad: Santa Marta',
    'Barrio o localidad: El Rodadero',
    'Latitud: 11.240000 · Longitud: -74.215678','Precisión estimada: ±19 m'
  ]);
  assert.throws(()=>f.locationFromGps({latitude:120,longitude:0,accuracy:10}),/GPS/);
  const png=readFileSync(new URL('../card-png.js',import.meta.url),'utf8');
  const labels=[];
  const ctx={beginPath(){},moveTo(){},lineTo(){},quadraticCurveTo(){},closePath(){},
    fill(){},stroke(){},fillRect(){},save(){},restore(){},clip(){},drawImage(){},
    fillText(t){labels.push(t);},measureText(t){return {width:String(t).length*11};}};
  const factory={createElement:()=>({getContext:()=>ctx,toBlob(cb){cb({type:'image/png'});}})};
  const generate=new Function('document','Image',png.replace(/^export /gm,'')+
    ';return makeCardPng;')(factory,undefined);
  await generate({description:'Busco repuesto',contactPhone:'573001234567',location:loc,example:false});
  for(const label of ['UBICACIÓN GPS','País: Colombia','Departamento: Magdalena','Ciudad: Santa Marta',
    'Barrio o localidad: El Rodadero','Precisión estimada: ±19 m'])
    assert.ok(labels.includes(label),'Falta en PNG '+label);
  assert.ok(labels.some(label=>label.includes('Latitud: 11.240000')));
  assert.ok(labels.includes('TELÉFONO · WHATSAPP'));
});
test('PNG muestra número real en banda distinguible sin añadir título a la ficha',async()=>{
  const source=readFileSync(new URL('../card-png.js',import.meta.url),'utf8');
  const drawn=[];
  const ctx={beginPath(){},moveTo(){},lineTo(){},quadraticCurveTo(){},closePath(){},
    fill(){},stroke(){},fillRect(){},save(){},restore(){},clip(){},drawImage(){},
    fillText(value){drawn.push(value);},measureText(value){return {width:String(value).length*15};}};
  const fakeDocument={createElement:()=>({getContext:()=>ctx,toBlob(cb){cb({type:'image/png'});}})};
  const generate=new Function('document','Image',source.replace(/^export /gm,'')+';return makeCardPng;')(fakeDocument,undefined);
  const result=await generate({description:'Busco repuesto en Santa Marta',
    picture:'',contactPhone:'+573001234567',example:false});
  assert.equal(result.type,'image/png');
  assert.ok(drawn.includes('TELÉFONO · WHATSAPP'));
  assert.ok(drawn.includes('+57 300 123 4567'));
  assert.ok(drawn.includes('LoNecesito'));
  assert.ok(!drawn.some(item=>String(item).startsWith('Repuesto para ventilador:')));
});

test('nuevo límite de 1.000 caracteres y textos históricos conservados',()=>{
  const html=readFileSync(new URL('../index.html',import.meta.url),'utf8');
  const js=readFileSync(new URL('../simple.js',import.meta.url),'utf8');
  const rules=readFileSync(new URL('../firestore.rules',import.meta.url),'utf8');
  assert.match(html,/id="need-description"[^>]*maxlength="1000"/);
  assert.match(js,/\$\('need-description'\)\.maxLength=1000/);
  assert.match(js,/maxLength=\$\('need-description'\)\.value\.length>1000\?4000:1000/);
  assert.match(js,/originalDescription:current\?legacyDetails\(current\):null/);
  const old='Texto anterior muy extenso. '+ 'Detalle '.repeat(170);
  assert.ok(old.length>1000&&old.length<4000);
  assert.equal(cleanPublication({description:old,contactPhone:'3001234567'},
    {originalDescription:old}).description,old);
  assert.throws(()=>cleanPublication({description:old+' Cambio',contactPhone:'3001234567'},
    {originalDescription:old}),/1.000/);
  assert.equal(cleanPublication({description:'Nueva redacción',contactPhone:'3001234567'},
    {originalDescription:old}).description,'Nueva redacción');
  assert.match(rules,/request\.resource\.data\.description\.size\(\) <= 1000/);
  assert.match(rules,/request\.resource\.data\.description == resource\.data\.description/);
});

test('las imágenes para PC y móvil se muestran solo en Inicio',()=>{
  const html=readFileSync(new URL('../index.html',import.meta.url),'utf8');
  const a=readFileSync(new URL('../assets/lonecesito-casos-pc.svg',import.meta.url),'utf8');
  const b=readFileSync(new URL('../assets/lonecesito-casos-movil.svg',import.meta.url),'utf8');
  const home=html.split('<section id="inicio"')[1].split('</section>')[0];
  assert.match(home,/lonecesito-presentacion-dos-pasos\.png/);
  assert.match(home,/media="\(max-width:680px\)" srcset="assets\/lonecesito-casos-movil\.svg"/);
  assert.match(home,/src="assets\/lonecesito-casos-pc\.svg"/);
  assert.doesNotMatch(home,/<button|href="#publicar"/);
  for(const img of [a,b]){
    for(const city of ['Medellín','Bogotá','Cali','Barranquilla','Cartagena'])
      assert.ok(img.includes(city),'Falta '+city);
    assert.match(img,/<svg /);
  }
});

test('GPS: precisión mejora en tiempo real en el mismo botón y conserva el mejor valor',async()=>{
  const js=readFileSync(new URL('../simple.js',import.meta.url),'utf8');
  const a=js.indexOf('let locationDraft=null,locationRequestId=0,capturingLocation=false;');
  const b=js.indexOf('function setMicState(active){',a);
  assert.ok(a>=0&&b>a);
  const module=readFileSync(new URL('../location-model.js',import.meta.url),'utf8');
  const loc=new Function(module.replace(/^export /gm,'')+
    ';return {locationFromGps,validLocation,locationLines};')();
  const buttons={};
  const pin={className:'audio-action audio-location',children:[],title:'',
    classes:new Set(),attrs:{},classList:{toggle(name,on){if(on)pin.classes.add(name);else pin.classes.delete(name);}},
    setAttribute(name,value){this.attrs[name]=value;},
    replaceChildren(...items){this.children=items;},
    append(item){this.children.push(item);},
    addEventListener(name,fn){this[name]=fn;}
  };
  const preview={hidden:true},label={textContent:''};
  const remove={addEventListener(name,fn){this[name]=fn;}};
  const els={'gps-preview':preview,'gps-label':label,'gps-remove':remove};
  let success,error,nextId=0;
  const cleared=[],timers=new Map(),requests=[];
  const geo={watchPosition(ok,fail,options){
    assert.deepEqual(options,{enableHighAccuracy:true,maximumAge:0,timeout:12000});
    success=ok;error=fail;return 12;
  },clearWatch(id){cleared.push(id);}};
  const fakeFetch=async(url)=>{
    requests.push(url);
    return {ok:true,json:async()=>({countryName:'Colombia',principalSubdivision:'Magdalena',city:'Santa Marta'})};
  };
  const ctrl=new Function('locateButton','$','el','contactIcon','navigator','window',
    'locationFromGps','validLocation','locationLines','fetch','AbortController','toast',
    'setTimeout','clearTimeout',
    js.slice(a,b)+
    ';return {get state(){return {capturingLocation,locationDraft,gpsWatchId,gpsBestCoords};}};')(
      pin,id=>els[id],(tag,cls,txt)=>({tag,cls,textContent:txt,setAttribute(){}}),
      kind=>({kind}),
      {geolocation:geo},
      {isSecureContext:true,confirm:()=>true},
      loc.locationFromGps,loc.validLocation,loc.locationLines,fakeFetch,
      class Abort {constructor(){this.signal={};}abort(){}},
      ()=>{},
      (fn,ms)=>{const id=++nextId;timers.set(id,{fn,ms});return id;},
      id=>timers.delete(id)
    );
  pin.click();
  assert.equal(ctrl.state.capturingLocation,true);
  assert.equal(pin.classes.has('gps-measuring'),true);
  assert.equal(pin.children[1].textContent,'…');
  success({coords:{latitude:11.24,longitude:-74.21,accuracy:46}});
  assert.equal(pin.children[1].textContent,'±46m');
  success({coords:{latitude:11.25,longitude:-74.22,accuracy:19}});
  assert.equal(pin.children[1].textContent,'±19m');
  success({coords:{latitude:11.26,longitude:-74.23,accuracy:23}});
  assert.equal(pin.children[1].textContent,'±19m'); // never get worse
  assert.equal(requests.length,0);
  pin.click(); // manually stop using the very same button
  assert.equal(ctrl.state.capturingLocation,false);
  assert.equal(ctrl.state.gpsWatchId,null);
  assert.deepEqual(cleared,[12]);
  assert.equal(ctrl.state.locationDraft.accuracy,19);
  assert.equal(pin.classes.has('gps-fixed'),true);
  await Promise.resolve(); await Promise.resolve();
  assert.equal(requests.length,1);
  assert.match(requests[0],/latitude=11.25&longitude=-74.22/);
  assert.equal(pin.children[1].textContent,'±19m');
  assert.equal(label.textContent.includes('Precisión estimada: ±19 m'),true);
});
test('GPS: detención automática al lograr precisión y botón sin controles extra',async()=>{
  const js=readFileSync(new URL('../simple.js',import.meta.url),'utf8');
  const a=js.indexOf('let locationDraft=null,locationRequestId=0,capturingLocation=false;');
  const b=js.indexOf('function setMicState(active){',a);
  const lm=readFileSync(new URL('../location-model.js',import.meta.url),'utf8');
  const loc=new Function(lm.replace(/^export /gm,'')+';return {locationFromGps,locationLines,validLocation};')();
  const elms={'gps-preview':{},'gps-label':{},'gps-remove':{addEventListener(t,fn){this[t]=fn;}}};
  const pin={classList:{toggle(){}},setAttribute(){},
    replaceChildren(){},append(){},addEventListener(t,fn){this[t]=fn;}};
  let notify,clearCount=0;
  const fetches=[];
  const geo={watchPosition(success){notify=success;return 0;},clearWatch(id){assert.equal(id,0);clearCount++;}};
  let nextId=0;const timers=new Map();
  const module=new Function('locateButton','$','el','contactIcon','navigator','window',
    'locationFromGps','validLocation','locationLines','fetch','AbortController','toast',
    'setTimeout','clearTimeout',js.slice(a,b)+
      ';return {get state(){return {capturingLocation,locationDraft};}};');
  const ctrl=module(pin,id=>elms[id],()=>({setAttribute(){}}),()=>({}),{geolocation:geo},
    {isSecureContext:true,confirm:()=>true},loc.locationFromGps,loc.validLocation,
    loc.locationLines,async url=>{fetches.push(url);return {ok:true,json:async()=>({})};},
    class Abort{constructor(){this.signal={};}abort(){}},()=>{},
    (fn,ms)=>{let id=++nextId;timers.set(id,{fn,ms});return id;},id=>timers.delete(id));
  pin.click();
  notify({coords:{latitude:10,longitude:-70,accuracy:39}});
  notify({coords:{latitude:10.0001,longitude:-70.0001,accuracy:8.9}});
  assert.equal(ctrl.state.capturingLocation,false);
  assert.equal(ctrl.state.locationDraft.accuracy,9);
  assert.equal(clearCount,1); // watcher id zero must also clear
  await Promise.resolve();await Promise.resolve();
  assert.equal(fetches.length,1);
  assert.match(js,/GPS_MAX_TIME_MS=30000, GPS_TARGET_METERS=10/);
  assert.doesNotMatch(js,/getCurrentPosition\(/);
  const html=readFileSync(new URL('../index.html',import.meta.url),'utf8');
  assert.equal((html.match(/id="draft-audio-row"/g)||[]).length,1);
});
