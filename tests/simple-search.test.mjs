import test from 'node:test';
import assert from 'node:assert/strict';
import {foldSearchText,publicationSearchIndex,publicationMatchesQuery} from '../simple-search.js';

const record={
  title:'Reparación de nevera',
  description:'Necesito un técnico para revisar mi NEVERA de 12 pies.',
  city:'Santa Marta',
  category:'servicios',
  subcategory:'Electrodomésticos',
  budget:150000,
  quantity:2,
  contactPhone:'573114040809',
  ownerUid:'private-user-marker',
  id:'record-secret',
  picture:'data:image/png;base64,AAA'
};

test('fragmentos y términos en distinto orden',()=>{
  assert.equal(publicationMatchesQuery(record,'never tecn'),true);
  assert.equal(publicationMatchesQuery(record,'tecn never'),true);
  assert.equal(publicationMatchesQuery(record,'rep nevera'),true);
  assert.equal(publicationMatchesQuery(record,'nEvErA'),true);
  assert.equal(publicationMatchesQuery(record,'never lavadora'),false);
  assert.equal(publicationMatchesQuery(record,'   '),true);
});
test('sin tildes y con fragmentos de metadatos públicos',()=>{
  assert.equal(foldSearchText('TÉCNICO de reparación'),'tecnico de reparacion');
  assert.equal(publicationMatchesQuery(record,'tecnico electrodom'),true);
  assert.equal(publicationMatchesQuery(record,'santa 150'),true);
  assert.equal(publicationMatchesQuery(record,'servic marta 2'),true);
});
test('buscar teléfono completo, sin indicativo y por tramos',()=>{
  for(const query of ['573114040809','3114040809','311404','311 404','57 311 404','+57 (311) 404-0809']){
    assert.equal(publicationMatchesQuery(record,query),true,query);
  }
  assert.equal(publicationMatchesQuery(record,'3009999999'),false);
  assert.equal(publicationMatchesQuery(record,'never 311404'),true);
});
test('no indexar IDs ni identificador de dueño',()=>{
  const index=publicationSearchIndex(record);
  assert.doesNotMatch(index,/private|secret|base64/);
  assert.equal(publicationMatchesQuery(record,'private-user-marker'),false);
  assert.equal(publicationMatchesQuery(record,'record-secret'),false);
});
