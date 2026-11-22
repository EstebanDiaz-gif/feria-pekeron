import { test } from 'node:test';
import assert from 'node:assert/strict';
import { esc, srcSeguro, waNumero, waLink, slug, palabras, coincide, fmtPrecio } from '../js/lib/util.js';

test('esc escapa HTML', () => {
  assert.equal(esc('<img onerror="x">&\''), '&lt;img onerror=&quot;x&quot;&gt;&amp;&#39;');
});

test('srcSeguro solo deja pasar imágenes data:', () => {
  assert.equal(srcSeguro('data:image/jpeg;base64,AAAA'), 'data:image/jpeg;base64,AAAA');
  assert.equal(srcSeguro('javascript:alert(1)'), '');
  assert.equal(srcSeguro('https://x.com/a.jpg'), '');
  assert.equal(srcSeguro('data:image/svg+xml;base64,AAAA'), '');
});

test('waNumero normaliza celulares argentinos', () => {
  for (const x of ['381 512 3456', '0381 15 512-3456', '+54 9 381 5123456', '5493815123456', '(0381) 155123456'])
    assert.equal(waNumero(x), '5493815123456', x);
  assert.equal(waNumero('11 15 2345 6789'), '5491123456789');
  assert.equal(waNumero('3863 15 412345'), '5493863412345');
  assert.equal(waNumero('123'), '');
  assert.equal(waNumero(''), '');
});

test('waLink arma el link con texto', () => {
  assert.equal(waLink('381 5123456', 'Hola!'), 'https://wa.me/5493815123456?text=Hola!');
  assert.equal(waLink('x', 'Hola'), '');
});

test('slug', () => {
  assert.equal(slug('Zapatillería Don Pedro!'), 'zapatilleria-don-pedro');
  assert.equal(slug('  Año Nuevo  '), 'ano-nuevo');
});

test('búsqueda por palabras sin acentos y por inicio de palabra', () => {
  const p = { titulo: 'Campera de jean', descripcion: 'Talle M, poco uso', palabras: palabras('Campera de jean', 'Talle M, poco uso') };
  assert.ok(coincide(p, 'campera'));
  assert.ok(coincide(p, 'CAMP jean'));
  assert.ok(!coincide(p, 'zapatillas'));
  assert.ok(coincide({ palabras: palabras('Pantalón') }, 'pantalon'));
});

test('precio en formato argentino', () => {
  assert.match(fmtPrecio(45000), /^\$ 45\.000$/);
});
