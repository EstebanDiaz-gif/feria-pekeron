// Búsqueda y listado por categoría, con filtros.
import { esc } from '../lib/util.js';
import { ico } from '../lib/iconos.js';
import { CATEGORIAS, categoria } from '../datos/catalogo.js';
import { grilla, vacio } from './componentes.js';

const est = { q: '', categoria: '', sub: '', estado: '', orden: 'recientes', zona: false };
export function fijarBusqueda(c) { Object.assign(est, { q: '', categoria: '', sub: '', estado: '', orden: 'recientes', zona: false }, c); }

export async function vista(root, r, ctx) {
  // La categoría la define la dirección: #categoria-ropa la fija, #buscar la limpia.
  // #categoria-ropa~Zapatillas abre la categoría con la subcategoría ya elegida.
  const [cId, subRuta] = r.nombre === 'categoria' ? r.param.split('~') : [''];
  const catRuta = categoria(cId) ? cId : '';
  if (est.categoria !== catRuta) Object.assign(est, { categoria: catRuta, sub: '' });
  if (subRuta !== undefined && catRuta) {
    const s = decodeURIComponent(subRuta);
    est.sub = categoria(catRuta).subs.includes(s) ? s : '';
  }
  const cat = categoria(est.categoria);
  const lugar = ctx.zona.localidad || ctx.zona.provincia;

  root.innerHTML = `
  <div class="buscar-cab">
    <form class="buscador buscador-claro" role="search" data-f>
      ${ico('buscar')}
      <input type="search" name="q" value="${esc(est.q)}" placeholder="Buscar en la Feria" aria-label="Buscar productos" autocomplete="off" enterkeyhint="search">
      <button class="btn btn-pri btn-chico" type="submit">Buscar</button>
    </form>
    <div class="chips" role="group" aria-label="Categoría">
      <button class="chip ${!est.categoria ? 'on' : ''}" data-cat="" aria-pressed="${!est.categoria}">Todas</button>
      ${CATEGORIAS.map((c) => `<button class="chip ${est.categoria === c.id ? 'on' : ''}" data-cat="${c.id}" aria-pressed="${est.categoria === c.id}">${esc(c.nombre)}</button>`).join('')}
    </div>
    ${cat ? `<div class="chips chips-sub" role="group" aria-label="Subcategoría">
      <button class="chip chip-sub ${!est.sub ? 'on' : ''}" data-sub="" aria-pressed="${!est.sub}">Todo ${esc(cat.nombre.toLowerCase())}</button>
      ${cat.subs.map((s) => `<button class="chip chip-sub ${est.sub === s ? 'on' : ''}" data-sub="${esc(s)}" aria-pressed="${est.sub === s}">${esc(s)}</button>`).join('')}</div>` : ''}
    <div class="filtros">
      <label class="sel-mini"><span class="sr">Estado</span><select data-estado>
        <option value="">Nuevo y usado</option><option value="nuevo" ${est.estado === 'nuevo' ? 'selected' : ''}>Solo nuevo</option><option value="usado" ${est.estado === 'usado' ? 'selected' : ''}>Solo usado</option></select></label>
      <label class="sel-mini"><span class="sr">Ordenar</span><select data-orden>
        <option value="recientes">Más recientes</option><option value="precio-asc" ${est.orden === 'precio-asc' ? 'selected' : ''}>Menor precio</option><option value="precio-desc" ${est.orden === 'precio-desc' ? 'selected' : ''}>Mayor precio</option></select></label>
      ${lugar ? `<label class="toggle"><input type="checkbox" data-zona ${est.zona ? 'checked' : ''}><span>Solo ${esc(lugar)}</span></label>` : ''}
    </div>
  </div>
  <div data-res><div class="cargando">Buscando…</div></div>`;

  const f = root.querySelector('[data-f]');
  f.onsubmit = (e) => { e.preventDefault(); est.q = String(new FormData(f).get('q') || '').trim(); resultados(); };
  root.querySelectorAll('[data-cat]').forEach((b) => b.onclick = () => {
    est.categoria = b.dataset.cat; est.sub = '';
    const h = est.categoria ? 'categoria-' + est.categoria : 'buscar';
    ctx.ir(h);
  });
  root.querySelectorAll('[data-sub]').forEach((b) => b.onclick = () => { est.sub = b.dataset.sub; ctx.ir('categoria-' + est.categoria + (est.sub ? '~' + encodeURIComponent(est.sub) : '')); });
  root.querySelector('[data-estado]').onchange = (e) => { est.estado = e.target.value; resultados(); };
  root.querySelector('[data-orden]').onchange = (e) => { est.orden = e.target.value; resultados(); };
  const z = root.querySelector('[data-zona]');
  if (z) z.onchange = () => { est.zona = z.checked; resultados(); };

  async function resultados() {
    const box = root.querySelector('[data-res]');
    const filtro = { q: est.q, categoria: est.categoria, sub: est.sub, estado: est.estado, orden: est.orden };
    if (est.zona) { if (ctx.zona.localidad) filtro.localidad = ctx.zona.localidad; else filtro.provincia = ctx.zona.provincia; }
    const l = await ctx.d.listar(filtro);
    const titulo = est.q ? `“${esc(est.q)}”` : est.sub ? esc(est.sub) : cat ? esc(cat.nombre) : 'Todas las publicaciones';
    box.innerHTML = l.length
      ? `<p class="res-cab"><strong>${titulo}</strong> · ${l.length} ${l.length === 1 ? 'resultado' : 'resultados'}</p>${grilla(l)}`
      : vacio('No encontramos publicaciones', est.q || est.categoria ? 'Probá con otras palabras o sacá algún filtro.' : 'Todavía no hay nada publicado.', '<a class="btn btn-sec" href="#publicar">Publicar algo</a>');
  }
  await resultados();
}
