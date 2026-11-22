// Pantalla de la campanita: pestañas Destacadas / Compras / Ventas / Tiendas + "También podrían gustarte".
import { esc, srcSeguro, hace } from '../lib/util.js';
import { ico } from '../lib/iconos.js';
import { ilus } from '../lib/ilustraciones.js';
import { armar, ultimaVista, marcarVistas } from '../datos/notificaciones.js';
import { grilla, vacio } from './componentes.js';

const TABS = [
  ['destacadas', 'Destacadas', 'estrella'],
  ['compras', 'Compras', 'bolsa'],
  ['ventas', 'Ventas', 'chat'],
  ['tiendas', 'Tiendas', 'tienda'],
];
const VACIOS = {
  destacadas: ['No hay novedades', 'Acá te avisamos lanzamientos y novedades de la Feria y de Pekerón.'],
  compras: ['Nada por ahora', 'Guardá favoritos con el corazón y te avisamos si bajan de precio o se venden.'],
  ventas: ['Sin consultas nuevas', 'Cuando alguien te escriba por WhatsApp desde tus publicaciones, te avisamos acá.'],
  tiendas: ['Sin novedades de tiendas', 'Cuando las tiendas publiquen productos nuevos, aparecen acá.'],
};
let tab = 'destacadas';

export async function vista(root, r, ctx) {
  const desde = ultimaVista();
  const n = await armar(ctx);
  if (!n[tab].length) { const conAlgo = TABS.find(([k]) => n[k].length); if (conAlgo && r.primera !== false) tab = conAlgo[0]; }
  const nuevas = (k) => n[k].filter((x) => x.at > desde).length;
  const recos = await recomendados(ctx);

  root.innerHTML = `
  <div class="barra-vista"><button class="btn-ico" data-atras aria-label="Volver">${ico('atras')}</button><h1>Notificaciones</h1></div>
  <div class="notif-tabs" role="tablist" aria-label="Tipos de notificación">
    ${TABS.map(([k, t, i]) => `<button role="tab" aria-selected="${tab === k}" class="notif-tab ${tab === k ? 'on' : ''}" data-tab="${k}">
      <span class="notif-tab-ilus">${ilus(i)}${nuevas(k) ? `<span class="notif-punto" aria-label="${nuevas(k)} nuevas"></span>` : ''}</span><span>${t}</span></button>`).join('')}
  </div>
  ${tab === 'ventas' && !ctx.usuario ? vacio('Ingresá para ver tus ventas', 'Con tu cuenta te avisamos cuando alguien consulta por tus publicaciones.', '<a class="btn btn-pri" href="#ingresar">Ingresar</a>')
    : n[tab].length ? `<ul class="notif-lista">${n[tab].map((x) => {
      const f = x.pub && srcSeguro(x.pub.fotos && x.pub.fotos[0]);
      return `<li><a class="notif ${x.at > desde ? 'nueva' : ''}" href="${esc(x.link)}" ${x.externo ? 'target="_blank" rel="noopener"' : ''}>
        <span class="notif-img">${f ? `<img src="${f}" alt="">` : ilus(x.ilus || 'campana')}</span>
        <span class="notif-txt"><span class="notif-fila"><strong>${esc(x.titulo)}</strong><small>${x.at ? hace(x.at) : ''}</small></span><span>${esc(x.texto)}</span></span>
      </a></li>`;
    }).join('')}</ul>`
    : vacio(...VACIOS[tab])}
  ${recos.length ? `<section class="seccion"><div class="titulo-centro"><span></span><h2>También podrían gustarte</h2><span></span></div>${grilla(recos)}</section>` : ''}`;

  root.querySelector('[data-atras]').onclick = () => { if (history.length > 1) history.back(); else ctx.ir('inicio'); };
  root.querySelectorAll('[data-tab]').forEach((b) => b.onclick = () => { tab = b.dataset.tab; vista(root, { ...r, primera: false }, ctx); });
  marcarVistas();
  ctx.actualizarCampana(0);
}

// Recomendados: de las categorías que la persona estuvo mirando; si no hay, lo más nuevo.
async function recomendados(ctx) {
  const vistos = ctx.d.vistos().slice(0, 6);
  const cats = {};
  for (const v of vistos) {
    const p = await ctx.d.publicacion(v.id).catch(() => null);
    if (p && p.categoria) cats[p.categoria] = (cats[p.categoria] || 0) + 1;
  }
  const top = Object.entries(cats).sort((a, b) => b[1] - a[1])[0];
  const ya = new Set(vistos.map((v) => v.id));
  let l = top ? await ctx.d.listar({ categoria: top[0], limite: 12 }) : [];
  l = l.filter((p) => !ya.has(p.id));
  if (l.length < 4) l = [...l, ...(await ctx.d.listar({ limite: 12 })).filter((p) => !ya.has(p.id) && !l.some((x) => x.id === p.id))];
  return l.slice(0, 8);
}
