// Compras: productos consultados por WhatsApp, favoritos y vistos recientemente.
import { esc, fmtPrecio, hace } from '../lib/util.js';
import { ico } from '../lib/iconos.js';
import { toast } from '../lib/dom.js';
import { foto, vacio } from './componentes.js';

const T = {
  consultados: { tit: 'Consultados', vacio: 'Todavía no consultaste por ningún producto', txt: 'Cuando escribas a un vendedor por WhatsApp, el producto queda guardado acá para volver a verlo.' },
  favoritos: { tit: 'Favoritos', vacio: 'No tenés favoritos', txt: 'Tocá el corazón en una publicación para guardarla.' },
  vistos: { tit: 'Vistos recientemente', vacio: 'Todavía no viste publicaciones', txt: 'Lo que mires queda acá para encontrarlo fácil.' },
};

export async function vista(root, r, ctx) {
  const k = r.nombre;
  const base = k === 'consultados' ? await ctx.d.consultados() : k === 'favoritos' ? await ctx.d.favoritos() : ctx.d.vistos();
  // Trae el estado actual de cada publicación (pudo venderse, pausarse o borrarse).
  const items = await Promise.all(base.slice(0, 60).map(async (x) => ({ x, p: await ctx.d.publicacion(x.id).catch(() => null) })));
  const nota = !ctx.usuario && k !== 'vistos' ? `<p class="nota nota-lista">${ico('info')} Se guardan en este celular. <a href="#registrarse">Creá tu cuenta</a> para tenerlos en todos lados.</p>` : '';

  root.innerHTML = `
  <div class="barra-vista"><a class="btn-ico" href="#cuenta" aria-label="Volver a Mi cuenta">${ico('atras')}</a><h1>${T[k].tit}</h1></div>
  ${nota}
  ${items.length ? `<ul class="lista-compras">${items.map(({ x, p }) => {
    const ok = p && p.disponibilidad === 'disponible';
    const estado = !p ? 'Ya no está publicada' : p.disponibilidad === 'vendida' ? 'Vendido' : p.disponibilidad === 'pausada' ? 'Pausada' : fmtPrecio(p.precio);
    return `<li class="compra-item ${ok ? '' : 'apagado'}"><a class="compra-link" href="${p ? '#producto-' + esc(x.id) : '#' + k}">
      <span class="mi-foto">${foto(p)}</span>
      <span class="mi-txt"><strong>${esc((p && p.titulo) || x.titulo)}</strong>
        <span class="precio-chico">${esc(estado)}</span>
        <span class="txt-sec">${k === 'consultados' ? 'Consultado' : k === 'favoritos' ? 'Guardado' : 'Visto'} ${hace(x.at)}${p && p.tiendaNombre ? ' · ' + esc(p.tiendaNombre) : ''}</span></span></a>
      ${k === 'favoritos' ? `<button class="btn-ico" data-quitar="${esc(x.id)}" aria-label="Quitar ${esc((p && p.titulo) || x.titulo)} de favoritos">${ico('cerrar')}</button>` : ''}
    </li>`;
  }).join('')}</ul>` : vacio(T[k].vacio, T[k].txt, '<a class="btn btn-pri" href="#buscar">Buscar productos</a>')}`;

  root.querySelectorAll('[data-quitar]').forEach((b) => b.onclick = async () => {
    try { await ctx.d.ponerFavorito({ id: b.dataset.quitar }, false); toast('Quitado de favoritos.'); vista(root, r, ctx); }
    catch (x) { toast(x.message, 'error'); }
  });
}
