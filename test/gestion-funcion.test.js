import { test } from 'node:test';
import assert from 'node:assert/strict';

const S = (v) => ({ stringValue: v }), I = (v) => ({ integerValue: String(v) }), B = (v) => ({ booleanValue: v });
const IMG = 'data:image/jpeg;base64,AAAA';
const docs = {
  'slugs/pekeron': { sid: S('kvku2jzkrf') },
  'stores/kvku2jzkrf/public/info': { enabled: B(true), name: S('Pekeron'), wa: S('5493815123456'), tag: S('Ropa y zapatillas'), slug: S('pekeron') },
};
const stock = [
  { name: '.../stock/a1', fields: { n: S('Zapatilla Urbana'), s: S('ZU1'), z: S('40'), q: I(2), pn: I(45000), img: S(IMG), cat: S('Zapatillas') } },
  { name: '.../stock/a2', fields: { n: S('Zapatilla Urbana'), s: S('ZU1'), z: S('38'), q: I(1), pn: I(45000) } },
  { name: '.../stock/b1', fields: { n: S('Remera oculta'), q: I(5), pn: I(9000), oh: B(true) } },
  { name: '.../stock/c1', fields: { n: S('Sin stock'), q: I(0), pn: I(9000) } },
  { name: '.../stock/d1', fields: { n: S('Sin precio'), q: I(3) } },
];
globalThis.fetch = async (url) => {
  const ruta = decodeURIComponent(url.split('/documents/')[1].split('?')[0]);
  if (ruta === 'stores/kvku2jzkrf/stock') return new Response(JSON.stringify({ documents: stock }));
  if (docs[ruta]) return new Response(JSON.stringify({ fields: docs[ruta] }));
  return new Response('{}', { status: 404 });
};

test('la función arma tienda y publicaciones desde el catálogo público de Gestión', async () => {
  const { onRequestGet } = await import('../functions/api/gestion.js');
  const r = await onRequestGet({ request: new Request('https://x.dev/api/gestion'), waitUntil() {} });
  const d = await r.json();
  assert.deepEqual(d.errores, []);
  assert.equal(d.tiendas.length, 1);
  assert.equal(d.tiendas[0].nombre, 'Pekeron');
  assert.equal(d.tiendas[0].linkCatalogo, 'https://pekeronapp.com/pekeron');
  assert.equal(d.publicaciones.length, 1);
  const p = d.publicaciones[0];
  assert.equal(p.titulo, 'Zapatilla Urbana');
  assert.equal(p.precio, 45000);
  assert.equal(p.stock, 3);
  assert.deepEqual(p.variantes.talles, ['38', '40']);
  assert.equal(p.subcategoria, 'Zapatillas');
  assert.deepEqual(p.fotos, [IMG]);
  assert.equal(p.tienda, 'pekeron');
  assert.match(r.headers.get('cache-control'), /s-maxage=600/);
});
