import {cleanPublication} from './simple-model.js?v=20261025-v2237';
import {validLocation,cleanAddressText} from './location-model.js?v=20261025-v2232';

export function localImportCandidates(items,completed=[]){
  const seen=new Set(completed);
  return (Array.isArray(items)?items:[]).filter(item=>{
    if(!item||item.example===true||item.ownerUid!=='demo-browser'||item.contactConsent!==true||
      typeof item.id!=='string'||!item.id||seen.has(item.id))return false;
    seen.add(item.id);return true;
  });
}
export async function localImportId(uid,id){
  const bytes=new TextEncoder().encode(JSON.stringify([uid,id]));
  const hash=await crypto.subtle.digest('SHA-256',bytes);
  return 'import-'+Array.from(new Uint8Array(hash),n=>n.toString(16).padStart(2,'0')).join('');
}
export function prepareLocalImport(record,uid,createdAt,describe=r=>r.description){
  if(!uid||!localImportCandidates([record]).length)throw new Error('Publicación local no elegible.');
  const data={...cleanPublication({description:describe(record),contactPhone:record.contactPhone}),ownerUid:uid,createdAt};
  if(record.picture){
    if(typeof record.picture!=='string'||record.picture.length>400000||
      !/^data:image\/(?:jpeg|png|webp);base64,[a-zA-Z0-9+/=]+$/.test(record.picture))
      throw new Error('La fotografía no es compatible con el límite de almacenamiento.');
    data.picture=record.picture;
  }
  const address=cleanAddressText(record.addressText);
  if(address)data.addressText=address;
  if(record.location){
    if(!validLocation(record.location))throw new Error('Las coordenadas guardadas no son válidas.');
    const location={};
    for(const key of ['latitude','longitude','accuracy'])location[key]=record.location[key];
    for(const key of ['country','department','municipality','city','address','neighborhood']){
      const value=record.location[key];
      if(value===undefined)continue;
      if(typeof value!=='string'||value.length>160)throw new Error('La dirección GPS guardada no es válida.');
      location[key]=value;
    }
    if(record.location.addressSource!==undefined){
      if(!['google','osm'].includes(record.location.addressSource))throw new Error('La fuente de dirección no es válida.');
      location.addressSource=record.location.addressSource;
    }
    data.location=location;
  }
  return data;
}
// Called only after the user confirms the account, number of records and public data.
export async function importLocalPublications(items,{uid,api,describe,onComplete=()=>{}}){
  if(!uid||api.auth.currentUser?.uid!==uid)throw new Error('Inicia sesión antes de recuperar tus publicaciones.');
  const result={created:0,existing:0,failed:[]};
  for(const record of localImportCandidates(items)){
    if(api.auth.currentUser?.uid!==uid)throw new Error('La cuenta cambió. Las copias locales siguen guardadas.');
    try{
      const id=await localImportId(uid,record.id);
      const data=prepareLocalImport(record,uid,api.serverTimestamp(),describe);
      const reference=api.doc(api.db,'requests',id);
      const created=await api.runTransaction(api.db,async transaction=>{
        const existing=await transaction.get(reference);
        if(api.auth.currentUser?.uid!==uid)throw new Error('La cuenta cambió.');
        if(existing.exists()){
          if(existing.data().ownerUid!==uid)throw new Error('La publicación pertenece a otra cuenta.');
          return false; // Never overwrite an already imported (and possibly edited) record.
        }
        transaction.set(reference,data);return true;
      });
      if(created)result.created++;else result.existing++;
      onComplete(record.id);
    }catch(error){result.failed.push({id:record.id,message:error?.message||'No se pudo recuperar.'});}
  }
  return result;
}
