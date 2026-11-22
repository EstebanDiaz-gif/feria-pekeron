import { test } from 'node:test';
import assert from 'node:assert/strict';

// Una tienda que se sumó desde Gestión (feria/{sid}) y otra que la apagó (sin documento).
const S = (v) => ({ stringValue: v }), I = (v) => ({ integerValue: String(v) }), B = (v) => ({ booleanValue: v });
const docs = {
  'slugs/pekeron': { sid: S('kvku2jzkrf') },
  'stores/kvku2jzkrf/public/info': { enabled: B(true), name: S('Pekeron'), wa: S('5493815123456'), slug: S('pekeron') },
  'stores/alm1/public/info': { enabled: B(true), alm: B(true), name: S('La Popular'), wa: S('5493814000000'), slug: S('la-popular') },
  'stores/alm1/public/lista': { n: I(1) },
  'stores/alm1/public/lista_d0': { p: { arrayValue: { values: [{ mapValue: { fields: { i: S('x1'), n: S('Queso cremoso'), p: I(8500), q: I(4) } } }] } } },
};
const feria = [
  // el slug guardado quedó viejo: manda el de public/info
  { name: '.../feria/alm1', fields: { slug: S('popular-viejo'), prov: S('Tucumán'), loc: S('Yerba Buena'), cat: S('almacen') } },
  { name: '.../feria/kvku2jzkrf', fields: { slug: S('pekeron'), prov: S('Tucumán'), loc: S('Tafí Viejo'), cat: S('raro') } },
];
globalThis.fetch = async (url) => {
  const ruta = decodeURIComponent(url.split('/documents/')[1].split('?')[0]);
  if (ruta === 'feria') return new Response(JSON.stringify({ documents: feria }));
  if (ruta === 'stores/kvku2jzkrf/stock') return new Response(JSON.stringify({ documents: [
    { name: '.../stock/a', fields: { n: S('Zapatilla'), q: I(1), pn: I(40000) } }] }));
  if (docs[ruta]) return new Response(JSON.stringify({ fields: docs[ruta] }));
  return new Response('{}', { status: 404 });
};

test('las tiendas que se suman desde Gestión aparecen con su zona y categoría, sin duplicar Pekeron', async () => {
  const { onRequestGet } = await import('../functions/api/gestion.js?inscriptas');
  const d = await (await onRequestGet({ request: new Request('https://x.dev/api/gestion'), waitUntil() {} })).json();
  assert.deepEqual(d.errores, []);
  assert.deepEqual(d.tiendas.map((t) => t.slug).sort(), ['la-popular', 'pekeron']);
  const pop = d.tiendas.find((t) => t.slug === 'la-popular');
  assert.equal(pop.localidad, 'Yerba Buena');
  assert.equal(pop.linkCatalogo, 'https://pekeronapp.com/la-popular');
  const q = d.publicaciones.find((p) => p.tienda === 'la-popular');
  assert.equal(q.titulo, 'Queso cremoso');
  assert.equal(q.categoria, 'almacen');
  const pk = d.publicaciones.find((p) => p.tienda === 'pekeron');
  assert.equal(pk.localidad, 'Tafí Viejo'); // lo que eligió en Gestión pisa al respaldo
  assert.equal(pk.categoria, 'otros'); // categoría desconocida → Otros
});
