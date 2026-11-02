/* Búsqueda local por fragmentos: sin API externa, sin datos de sesiones.
   Combina términos de cualquier parte de los campos públicos de la ficha. */
export function foldSearchText(value){
  return String(value??'')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g,'')
    .toLocaleLowerCase('es')
    .replace(/[^a-z0-9]+/g,' ')
    .trim();
}
export function publicationSearchIndex(record){
  // Solo información pública, nunca ownerUid/IDs/tokens ni datos de autenticación.
  const fields=['description','title','city','category','subcategory',
    'quantity','condition','budget','desiredDate','status','contactPhone'];
  const raw=fields.map(key=>record?.[key]??'').join(' ');
  const phone=String(record?.contactPhone??'').replace(/\D/g,'');
  const phoneWithoutCountry=phone.startsWith('57')&&phone.length===12?phone.slice(2):'';
  return [foldSearchText(raw),phone,phoneWithoutCountry].filter(Boolean).join(' ');
}
export function publicationMatchesQuery(record,query){
  const normalized=foldSearchText(query);
  if(!normalized)return true;
  const terms=normalized.split(/\s+/).filter(Boolean);
  const index=publicationSearchIndex(record);
  // Cada tramo debe aparecer, pero pueden estar en campos y lugares distintos.
  if(!terms.every(term=>index.includes(term)))return false;
  // Un teléfono copiado con espacios, guiones o paréntesis se busca como número continuo.
  if(/^[\d\s+().-]+$/.test(String(query).trim())){
    const digits=String(query).replace(/\D/g,'');
    if(digits.length>=3){
      const phone=String(record?.contactPhone??'').replace(/\D/g,'');
      if(phone.includes(digits))return true;
      // Permitir coincidencias numéricas no telefónicas en la descripción.
      if(foldSearchText(record?.description).includes(digits))return true;
    }
  }
  return true;
}
