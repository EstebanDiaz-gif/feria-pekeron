// Detalle de una publicación: fotos, precio, descripción, vendedor, ubicación y WhatsApp.
import { esc, srcSeguro, fmtPrecio, waLink } from '../lib/util.js';
import { ico } from '../lib/iconos.js';
import { toast } from '../lib/dom.js';
import { categoria, ESTADOS } from '../datos/catalogo.js';
import { avatar, grilla, metaPub, vacio } from './componentes.js';

export async function vista(root, r, ctx) {
  const p = await ctx.d.publicacion(r.param);
  const u = ctx.usuario;
  const mia = p && u && p.uid === u.uid;
  if (!p || (p.disponibilidad === 'pausada' && !mia)) {
    root.innerHTML = vacio('Esta publicación no está disponible', 'Puede que la hayan pausado o borrado.', '<a class="btn btn-pri" href="#buscar">Ver otras publicaciones</a>');
    return;
  }
  const t = p.tienda ? await ctx.d.tienda(p.tienda) : null;
  const fotos = (p.fotos || []).map(srcSeguro).filter(Boolean);
  const cat = categoria(p.categoria);
  const vendida = p.disponibilidad === 'vendida';
  const url = location.href.split('#')[0] + '#producto-' + p.id;
  const wa = waLink((t && t.whatsapp) || p.whatsapp,`Hola! Vi "${p.titulo}" (${fmtPrecio(p.precio)}) en Feria Pekerón. ¿Sigue disponible?\n${url}`);
  const otras = p.tienda ? (await ctx.d.listar({ tienda: p.tienda, limite: 7 })).filter((x) => x.id !== p.id).slice(0, 6) : [];
  const v = p.variantes || {};
  const lugar = [p.barrio, p.localidad, p.provincia].filter(Boolean).join(', ');

  root.innerHTML = `
  <div class="barra-vista barra-flotante">
    <button class="btn-ico" data-atras aria-label="Volver">${ico('atras')}</button>
    <button class="btn-ico" data-compartir aria-label="Copiar link de la publicación">${ico('compartir')}</button>
  </div>
  <div class="detalle">
    <div class="galeria">
      ${fotos.length ? `<div class="galeria-pista" data-pista>${fotos.map((s, i) => `<img src="${s}" alt="Foto ${i + 1} de ${esc(p.titulo)}">`).join('')}</div>
        ${fotos.length > 1 ? `<span class="galeria-num" data-num>1 / ${fotos.length}</span>` : ''}`
      : `<div class="galeria-vacia">${ico('foto')}<span>Sin fotos</span></div>`}
    </div>

    <div class="detalle-info">
      ${mia ? `<div class="nota">${ico('info')} Esta es tu publicación${p.disponibilidad !== 'disponible' ? ` · <b>${p.disponibilidad === 'vendida' ? 'marcada como vendida' : 'pausada: no la ve nadie'}</b>` : ''}. <a href="#editar-${esc(p.id)}">Editar</a></div>` : ''}
      <p class="meta">${metaPub(p)}</p>
      <h1 class="detalle-tit">${esc(p.titulo)}</h1>
      <p class="detalle-precio">${fmtPrecio(p.precio)}</p>
      ${vendida ? '<p class="chip-estado gris grande">Vendido</p>' : '<p class="txt-ok">Sin comisión: el precio lo pone quien vende</p>'}

      ${(v.talles && v.talles.length) || (v.colores && v.colores.length) ? `<div class="variantes">
        ${v.talles && v.talles.length ? `<div><span class="etq">Talles</span><div class="chips-fijos">${v.talles.map((x) => `<span class="chip-fijo">${esc(x)}</span>`).join('')}</div></div>` : ''}
        ${v.colores && v.colores.length ? `<div><span class="etq">Colores</span><div class="chips-fijos">${v.colores.map((x) => `<span class="chip-fijo">${esc(x)}</span>`).join('')}</div></div>` : ''}
      </div>` : ''}

      <dl class="datos">
        <div><dt>Estado</dt><dd>${esc(ESTADOS[p.estado] || '')}</dd></div>
        ${cat ? `<div><dt>Categoría</dt><dd><a href="#categoria-${esc(cat.id)}">${esc(cat.nombre)}</a>${p.subcategoria ? ' › ' + esc(p.subcategoria) : ''}</dd></div>` : ''}
        ${p.stock ? `<div><dt>Disponibles</dt><dd>${esc(p.stock)} ${Number(p.stock) === 1 ? 'unidad' : 'unidades'}</dd></div>` : ''}
        <div><dt>Ubicación</dt><dd>${ico('ubicacion')} ${esc(lugar)}</dd></div>
      </dl>

      ${p.descripcion ? `<h2 class="sub-tit">Descripción</h2><p class="descripcion">${esc(p.descripcion)}</p>` : ''}

      <div class="vendedor">
        ${avatar(t || { nombre: p.vendedorNombre })}
        <div class="vendedor-txt"><strong>${esc(t ? t.nombre : p.vendedorNombre)}</strong>
          <span class="txt-sec">${t ? 'Tienda en la Feria' : 'Vendedor particular'}${t && t.localidad ? ' · ' + esc(t.localidad) : ''}</span></div>
        ${t ? `<a class="btn btn-sec btn-chico" href="#tienda-${esc(t.slug)}">Ver tienda</a>` : ''}
      </div>

      <div class="nota nota-aviso">${ico('escudo')}<span>Comprá seguro: mirá el producto antes de pagar y nunca mandes una seña a alguien que no conocés.</span></div>
    </div>

    ${otras.length ? `<section class="seccion"><div class="seccion-cab"><h2>Más de ${esc(t.nombre)}</h2></div>${grilla(otras, { mostrarTienda: false })}</section>` : ''}
  </div>

  <div class="barra-accion">
    ${vendida ? '<span class="btn btn-sec ancho" aria-disabled="true">Este producto ya se vendió</span>'
      : wa ? `<a class="btn btn-wa ancho" href="${esc(wa)}" target="_blank" rel="noopener">${ico('whatsapp')} Consultar por WhatsApp</a>`
      : '<span class="btn btn-sec ancho" aria-disabled="true">El vendedor no cargó su WhatsApp</span>'}
  </div>`;

  root.querySelector('[data-atras]').onclick = () => { if (history.length > 1) history.back(); else ctx.ir('inicio'); };
  root.querySelector('[data-compartir]').onclick = async () => {
    try { await navigator.clipboard.writeText(url); toast('Link copiado. Pegalo donde quieras compartirlo.'); }
    catch { toast('No se pudo copiar el link en este navegador.', 'error'); }
  };
  const pista = root.querySelector('[data-pista]'), num = root.querySelector('[data-num]');
  if (pista && num) pista.addEventListener('scroll', () => {
    num.textContent = `${Math.round(pista.scrollLeft / pista.clientWidth) + 1} / ${fotos.length}`;
  }, { passive: true });
}
