/* Versión técnica interna; nunca mostrar número de versión en la interfaz. */
export const APP_VERSION = '2.2.27';
export const APP_VERSION_DATE = '2026-10-25';

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
export function cleanPublication(fields,{originalDescription=null}={}) {
  const description=String(fields.description||'').trim().replace(/\r\n?/g,'\n');
  const original=originalDescription==null?null:String(originalDescription).trim().replace(/\r\n?/g,'\n');
  if(!description||description.length>4000)throw new Error('Escribe tu necesidad (máximo 1.000 caracteres).');
  // Permitir actualizar el teléfono o la foto de fichas antiguas sin recortar el texto.
  if(description.length>1000&&description!==original)
    throw new Error('La descripción no debe superar 1.000 caracteres.');
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
  const line=(String(description||'').split(/\n/).find(value=>value.trim())||'').trim().replace(/\s+/g,' ');
  const draft=line.slice(0,120);
  const first=line.length>120&&/\S/.test(line[120])?(draft.slice(0,draft.lastIndexOf(' ')).trim()||draft):draft;
  const text='Hola, vi tu publicación en LoNecesito: *«'+first+'»*. ¿Aún lo necesitas? Puedo ayudarte.';
  return 'https://api.whatsapp.com/send?phone='+digits+'&text='+encodeURIComponent(text);
}
export function canManage(publication,uid) {
  return Boolean(publication&&uid&&publication.ownerUid===uid);
}
