// Categorías al estilo de las apps grandes: lista a la izquierda, grilla a la derecha.
import { esc } from '../lib/util.js';
import { ico } from '../lib/iconos.js';
import { CATEGORIAS, categoria } from '../datos/catalogo.js';
import { linkGestion } from '../config.js';
import { fijarBusqueda } from './buscar.js';

let elegida = '';

const DESCUBRI = [
  { t: 'Cerca tuyo', i: 'ubicacion', bg: '#E6F0FF', fg: '#1D4ED8', accion: 'cerca' },
  { t: 'Tiendas', i: 'tienda', bg: '#FFF1DB', fg: '#B45309', h: '#tiendas' },
  { t: 'Vender', i: 'mas', bg: '#FFE9A8', fg: '#7A4E00', h: '#publicar' },
  { t: 'Usados', i: 'regalo', bg: '#E7F7E9', fg: '#15803D', accion: 'usados' },
  { t: 'Favoritos', i: 'corazon', bg: '#FDE8EF', fg: '#C2255C', h: '#favoritos' },
  { t: 'Consultados', i: 'chat', bg: '#E5F6F4', fg: '#0F766E', h: '#consultados' },
  { t: 'Vistos', i: 'ojo', bg: '#F6E8FF', fg: '#8B3FC4', h: '#vistos' },
  { t: 'Pekerón Gestión', i: 'panel', bg: '#E8ECF8', fg: '#102468', h: linkGestion, ext: true },
  { t: 'Descargar app', i: 'descargar', bg: '#F0EEEA', fg: '#57534E', instalar: true },
];

const tile = (x) => {
  const inner = `<span class="ct-ico" style="background:${x.bg};color:${x.fg}">${ico(x.i)}</span><span class="ct-txt">${esc(x.t)}</span>`;
  if (x.instalar) return `<button class="ct" data-instalar>${inner}</button>`;
  if (x.accion) return `<button class="ct" data-accion="${x.accion}">${inner}</button>`;
  return `<a class="ct" href="${esc(x.h)}" ${x.ext ? 'target="_blank" rel="noopener"' : ''}>${inner}</a>`;
};

export async function vista(root, _r, ctx) {
  const c = categoria(elegida);
  root.innerHTML = `
  <div class="cat-vista">
    <nav class="cat-lado" aria-label="Categorías">
      <button class="cat-lado-item ${!c ? 'on' : ''}" data-elegir="" aria-current="${!c}">Descubrí</button>
      ${CATEGORIAS.map((k) => `<button class="cat-lado-item ${c && c.id === k.id ? 'on' : ''}" data-elegir="${k.id}" aria-current="${!!(c && c.id === k.id)}">${esc(k.nombre)}</button>`).join('')}
    </nav>
    <section class="cat-grilla" aria-live="polite">
      ${c ? `
        <a class="cat-todo" href="#categoria-${c.id}" style="background:${c.bg};color:${c.fg}">
          <span class="ct-ico grande">${ico(c.icono)}</span><span><small>Ver todo en</small><strong>${esc(c.nombre)}</strong></span>${ico('derecha', 'chev')}</a>
        <div class="ct-grid">${c.subs.map((s) => tile({ t: s, i: c.icono, bg: c.bg, fg: c.fg, h: `#categoria-${c.id}~${encodeURIComponent(s)}` })).join('')}</div>`
      : `<div class="ct-grid">${DESCUBRI.map(tile).join('')}</div>
         <h2 class="ct-sub">Categorías</h2>
         <div class="ct-grid">${CATEGORIAS.map((k) => tile({ t: k.nombre, i: k.icono, bg: k.bg, fg: k.fg, h: `#categoria-${k.id}` })).join('')}</div>`}
    </section>
  </div>`;

  root.querySelectorAll('[data-elegir]').forEach((b) => b.onclick = () => { elegida = b.dataset.elegir; vista(root, _r, ctx); });
  root.querySelectorAll('[data-accion]').forEach((b) => b.onclick = () => {
    fijarBusqueda(b.dataset.accion === 'cerca' ? { zona: true } : { estado: 'usado' });
    ctx.ir('buscar');
  });
}
