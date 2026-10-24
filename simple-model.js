/* Versión visible en la portada. Incrementar al publicar cada nueva modificación. */
export const APP_VERSION = '2.1.0';
export const APP_VERSION_DATE = '24/10/2026';

/* Ejemplos claramente ficticios: jamás redirigir su teléfono a una persona real. */
export const EXAMPLE_PUBLICATIONS = Object.freeze([
  Object.freeze({
    id:'ejemplo-reparacion',
    example:true,category:'servicios',subcategory:'Mantenimiento y reparaciones',
    title:'Necesito reparar una nevera',city:'Santa Marta',
    description:'Busco un técnico que pueda revisar una nevera que dejó de enfriar. Me gustaría recibir información sobre disponibilidad y costo del servicio.',
    contactPhone:'300 000 0000',contactConsent:false,
    budget:150000,desiredDate:'2026-11-05',quantity:null,condition:null,picture:''
  }),
  Object.freeze({
    id:'ejemplo-uniformes',
    example:true,category:'bienes',subcategory:'Ropa y uniformes',
    title:'Busco uniformes para mi equipo',city:'Barranquilla',
    description:'Necesito 15 uniformes para un equipo de trabajo. Busco tela resistente, disponibilidad de tallas y posibilidad de incluir el logo del negocio.',
    contactPhone:'300 000 0000',contactConsent:false,
    budget:1200000,quantity:15,condition:'nuevo',desiredDate:'2026-11-20',picture:''
  }),
  Object.freeze({
    id:'ejemplo-repuestos',
    example:true,category:'bienes',subcategory:'Tecnología y repuestos',
    title:'Busco un repuesto para una impresora',city:'Medellín',
    description:'Necesito conseguir un repuesto compatible con una impresora láser de oficina. Solicito información sobre compatibilidad, entrega y garantía.',
    contactPhone:'300 000 0000',contactConsent:false,
    budget:null,quantity:1,condition:'cualquiera',desiredDate:'',picture:''
  })
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
  return 'https://wa.me/'+digits+'?text='+encodeURIComponent(text);
}
/* Los ejemplos abren WhatsApp sin asignar un destinatario ficticio. */
export function exampleWhatsappUrl(description) {
  return 'https://wa.me/?text='+encodeURIComponent('Vi esta necesidad en LoNecesito: '+derivedTitle(description));
}
export function canManage(publication,uid) {
  return Boolean(publication&&uid&&publication.ownerUid===uid);
}
