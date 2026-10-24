/* Versión visible en la portada. Incrementar al publicar cada nueva modificación. */
export const APP_VERSION = '2.2.6';
export const APP_VERSION_DATE = '24/10/2026';

/* Los ejemplos utilizan el mismo formulario y validación que una publicación nueva.
   No se asigna un teléfono real a estas muestras. */
function samplePublication(id,description){
  return Object.freeze({
    id,
    example:true,
    ...cleanPublication({description,contactPhone:'3000000000'})
  });
}
export const EXAMPLE_PUBLICATIONS=Object.freeze([
  samplePublication(
    'ejemplo-reparacion',
    'Necesito reparar una nevera\nBusco un técnico que revise una nevera que dejó de enfriar. Estoy en Santa Marta y quisiera conocer el costo de la revisión y la disponibilidad para esta semana.'
  ),
  samplePublication(
    'ejemplo-uniformes',
    'Necesito 15 uniformes para mi equipo\nBusco quien venda o confeccione 15 uniformes de trabajo, en varias tallas y con el logo de mi negocio. La entrega sería en Barranquilla. Agradezco información sobre telas, precio total y tiempo de fabricación.'
  ),
  samplePublication(
    'ejemplo-repuesto',
    'Busco repuesto para una impresora\nNecesito un repuesto compatible con una impresora láser de oficina. Estoy en Medellín. Me interesa conocer disponibilidad, precio, garantía y opciones de entrega.'
  )
]);

/* Modelo sencillo: el autor solo escribe su necesidad y su WhatsApp. */
export function normalizeWhatsApp(value) {
  const raw=String(value==null?'':value).trim();
  if(!/^\+?[0-9 ()-]{7,24}$/.test(raw))throw new Error('Escribe un número de WhatsApp válido.');
  let digits=raw.replace(/\D/g,'');
  if(raw[0]!=='+'&&/^3\d{9}$/.test(digits))digits='57'+digits;
  if(digits.length<10||digits.length>15||digits.startsWith('0'))throw new Error('Revisa el teléfono e incluye el indicativo del país.');
  return digits;
}
export function derivedTitle(description) {
  const lines=String(description||'').split(/\n/);
  const first=(lines.find(line=>line.trim())||'').trim().replace(/\s+/g,' ');
  return first.slice(0,120);
}
export function cleanPublication(fields) {
  const description=String(fields.description||'').trim().replace(/\r\n?/g,'\n');
  if(description.length<10||description.length>4000)throw new Error('Describe tu necesidad en entre 10 y 4.000 caracteres.');
  const contactPhone=normalizeWhatsApp(fields.contactPhone);
  return {
    description,
    title:derivedTitle(description),
    contactPhone,
    contactConsent:true
  };
}
export function whatsappUrl(number,description) {
  const digits=normalizeWhatsApp(number);
  const first=derivedTitle(description);
  const text='Hola, vi tu necesidad en LoNecesito: '+first+'. ¿Podemos hablar?';
  return 'https://api.whatsapp.com/send?phone='+digits+'&text='+encodeURIComponent(text);
}
/* Los ejemplos abren WhatsApp sin asignar un destinatario ficticio. */
export function exampleWhatsappUrl(description) {
  return 'https://api.whatsapp.com/send?text='+encodeURIComponent('Vi esta necesidad en LoNecesito: '+derivedTitle(description));
}
export function canManage(publication,uid) {
  return Boolean(publication&&uid&&publication.ownerUid===uid);
}
