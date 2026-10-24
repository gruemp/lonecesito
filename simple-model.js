/* Versión visible en la portada. Incrementar al publicar cada nueva modificación. */
export const APP_VERSION = '2.0.0';
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

/* Utilidades puras para publicaciones y contacto directo. */
export function normalizeWhatsApp(value) {
  const raw = String(value == null ? '' : value).trim();
  if (!/^\+?[0-9 ()-]{7,24}$/.test(raw)) {
    throw new Error('Escribe un número de WhatsApp válido, con indicativo de país.');
  }
  let digits = raw.replace(/\D/g, '');
  // Un móvil colombiano de diez dígitos, sin prefijo, recibe +57.
  if (raw.charAt(0) !== '+' && /^3\d{9}$/.test(digits)) digits = '57' + digits;
  if (digits.length < 10 || digits.length > 15 || digits.charAt(0) === '0') {
    throw new Error('Revisa el número de WhatsApp e incluye el indicativo del país.');
  }
  return digits;
}

export function whatsappUrl(number, needTitle) {
  const digits = normalizeWhatsApp(number);
  const title = String(needTitle || '').trim().slice(0, 160);
  const message = 'Hola, vi tu publicación en LoNecesito: ' + title + '. ¿Podemos hablar?';
  return 'https://wa.me/' + digits + '?text=' + encodeURIComponent(message);
}

export function cleanPublication(fields) {
  const title = String(fields.title || '').trim().replace(/\s+/g, ' ');
  const description = String(fields.description || '').trim();
  const city = String(fields.city || '').trim().replace(/\s+/g, ' ');
  const category = String(fields.category || '');
  if (title.length < 5 || title.length > 120) throw new Error('El título debe tener entre 5 y 120 caracteres.');
  if (!['bienes', 'servicios'].includes(category)) throw new Error('Selecciona producto o servicio.');
  if (city.length < 2 || city.length > 80) throw new Error('Indica una ciudad o municipio válido.');
  if (description.length < 15 || description.length > 1500) throw new Error('La descripción debe tener entre 15 y 1.500 caracteres.');
  if (fields.contactConsent !== true) throw new Error('Autoriza la publicación de tu WhatsApp para que puedan contactarte.');
  const contactPhone = normalizeWhatsApp(fields.contactPhone);
  let budget = null;
  if (fields.budget !== '' && fields.budget != null) {
    const numeric = String(fields.budget).trim();
    if (!/^\d+$/.test(numeric)) throw new Error('Escribe el presupuesto sin puntos ni comas.');
    budget = Number(numeric);
    if (!Number.isSafeInteger(budget) || budget < 0 || budget > 1000000000000) throw new Error('Revisa el presupuesto.');
  }
  let quantity = null;
  let condition = null;
  if (category === 'bienes') {
    if (fields.quantity != null && String(fields.quantity).trim() !== '') {
      const n = Number(fields.quantity);
      if (!Number.isInteger(n) || n < 1 || n > 1000000) throw new Error('La cantidad debe ser un número entero positivo.');
      quantity = n;
    }
    condition = ['nuevo', 'usado', 'cualquiera'].includes(fields.condition) ? fields.condition : 'cualquiera';
  }
  const image = String(fields.picture || '');
  if (image && (image.length > 400000 || !/^data:image\/jpeg;base64,[a-zA-Z0-9+/=]+$/.test(image))) {
    throw new Error('La fotografía debe ser una imagen JPG válida de menos de 300 KB.');
  }
  return {
    title, category, city, description, contactPhone,
    contactConsent: true, budget, quantity, condition, picture: image
  };
}

export function canManage(publication, uid) {
  return Boolean(publication && uid && publication.ownerUid === uid);
}
