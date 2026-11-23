// Panel del vendedor: resumen y "Mis productos" (editar, pausar, marcar vendido, borrar).
import { esc, fmtPrecio, hace } from '../lib/util.js';
import { ico } from '../lib/iconos.js';
import { toast, confirmar } from '../lib/dom.js';
import { linkGestion } from '../config.js';
import { chipEstado, foto, vacio } from './componentes.js';

let filtro = 'disponible';

export async function vista(root, r, ctx) {
  const u = ctx.usuario;
  const [mias, t, rec] = await Promise.all([
    ctx.d.listar({ uid: u.uid, incluirOcultas: true }), ctx.d.tiendaDeUsuario(u.uid),
    ctx.d.consultasRecibidas().catch(() => ({})),
  ]);
  const n = { disponible: 0, pausada: 0, vendida: 0 };
  for (const p of mias) {
    n[p.disponibilidad] = (n[p.disponibilidad] || 0) + 1;
    const c = rec[p.id];
    p._consultas = c ? c.total : 0;
    p._nuevas = c ? c.fechas.filter((x) => x > (p.revisado || 0)).length : 0;
  }
  if (r.nombre === 'mis-productos') return lista(root, ctx, mias, n);
  const preguntar = mias.filter((p) => p.disponibilidad === 'disponible' && p._nuevas > 0).sort((a, b) => b._nuevas - a._nuevas);

  const totalConsultas = Object.values(rec).reduce((a, c) => a + (c.total || 0), 0);
  root.innerHTML = `
  <div class="panel-cab2">
    <h1>Mi Panel</h1>
    <p class="txt-sec">Gestioná tus productos y tu tienda.</p>
  </div>
  ${ctx.d.modo === 'local' ? `<div class="nota nota-aviso">${ico('info')}<span>Perfil de prueba: lo que cargues queda solo en este navegador.</span></div>` : ''}

  <div class="stats">
    <a class="stat" href="#mis-productos" data-f="disponible"><span class="stat-ico st-az">${ico('caja')}</span><strong>${mias.length}</strong><span>${mias.length === 1 ? 'Producto' : 'Productos'}</span></a>
    <a class="stat" href="#mi-tienda"><span class="stat-ico st-am">${ico('tienda')}</span><strong>${t ? 1 : 0}</strong><span>Tienda</span></a>
    <a class="stat" href="#notificaciones"><span class="stat-ico st-ce">${ico('chat')}</span><strong>${totalConsultas}</strong><span>Consultas</span></a>
  </div>
  <p class="stats-sub">${n.disponible} activas · ${n.pausada} pausadas · ${n.vendida} vendidas</p>

  ${preguntar.length ? `<section class="vendiste" aria-label="Consultas recibidas">
    ${preguntar.map((p) => `<div class="vendiste-item">
      <a class="mi-foto" href="#producto-${esc(p.id)}" aria-hidden="true" tabindex="-1">${foto(p)}</a>
      <div class="vendiste-txt">
        <strong>${p._nuevas === 1 ? '1 persona te consultó' : `${p._nuevas} personas te consultaron`} por “${esc(p.titulo)}”</strong>
        <span>¿Ya lo vendiste?</span>
      </div>
      <div class="vendiste-btns">
        <button class="btn btn-pri btn-chico" data-resp="vendida" data-id="${esc(p.id)}">${ico('check')} Sí, lo vendí</button>
        <button class="btn btn-sec btn-chico" data-resp="no" data-id="${esc(p.id)}">Todavía no</button>
        <button class="btn btn-sec btn-chico" data-resp="pausada" data-id="${esc(p.id)}">Ya no lo tengo</button>
      </div></div>`).join('')}
  </section>` : ''}

  <a class="btn btn-amarillo ancho btn-grande" href="#publicar">${ico('mas')} Crear publicación</a>

  <div class="menu-lista menu-panel">
    <a href="#mis-productos" data-f="disponible"><span class="mp-ico">${ico('caja')}</span><span><strong>Mis productos</strong><small>Ver, editar y gestionar</small></span>${ico('derecha', 'chev')}</a>
    <a href="#mi-tienda"><span class="mp-ico">${ico('tienda')}</span><span><strong>Mi tienda</strong><small>${t ? esc(t.nombre) + ' · personalizá tu tienda' : 'Todavía no la creaste'}</small></span>${ico('derecha', 'chev')}</a>
    ${t ? `<a href="#tienda-${esc(t.slug)}"><span class="mp-ico">${ico('compartir')}</span><span><strong>Ver mi tienda como cliente</strong><small>Lo que ven los compradores</small></span>${ico('derecha', 'chev')}</a>` : ''}
    <a href="#notificaciones"><span class="mp-ico">${ico('chat')}</span><span><strong>Consultas y favoritos</strong><small>Quién te consultó y productos guardados</small></span>${ico('derecha', 'chev')}</a>
    <a href="#perfil"><span class="mp-ico">${ico('usuario')}</span><span><strong>Perfil</strong><small>Nombre, WhatsApp y ubicación</small></span>${ico('derecha', 'chev')}</a>
    <button data-salir><span class="mp-ico">${ico('salir')}</span><span><strong>Salir</strong><small>${ctx.d.modo === 'local' ? 'El perfil de prueba queda guardado en este navegador' : 'Cerrar sesión en este dispositivo'}</small></span></button>
  </div>

  ${u.tipo === 'comercio' ? `<a class="gestion-card" href="${esc(linkGestion)}" rel="noopener">
    <strong>¿Querés controlar stock, ventas y caja?</strong><span>Probá Pekerón Gestión, el software para negocios.</span></a>` : ''}`;

  root.querySelectorAll('[data-f]').forEach((a) => a.addEventListener('click', () => { filtro = a.dataset.f; }));
  root.querySelector('[data-salir]').onclick = async () => { await ctx.d.auth.salir(); ctx.ir('inicio'); };
  const msj = { vendida: '¡Bien ahí! La marcamos como vendida.', no: 'Listo, sigue publicada. Te avisamos si te vuelven a consultar.', pausada: 'La pausamos: ya no la ve nadie.' };
  root.querySelectorAll('[data-resp]').forEach((b) => b.onclick = async () => {
    root.querySelectorAll(`[data-id="${CSS.escape(b.dataset.id)}"]`).forEach((x) => { x.disabled = true; });
    try {
      if (b.dataset.resp !== 'no') await ctx.d.cambiarDisponibilidad(b.dataset.id, b.dataset.resp);
      await ctx.d.marcarRevisado(b.dataset.id);
      toast(msj[b.dataset.resp]);
      vista(root, r, ctx);
    } catch (e) { toast(e.message, 'error'); vista(root, r, ctx); }
  });
}

function lista(root, ctx, mias, n) {
  const tabs = [['disponible', 'Activas'], ['pausada', 'Pausadas'], ['vendida', 'Vendidas']];
  const l = mias.filter((p) => p.disponibilidad === filtro).sort((a, b) => b.actualizado - a.actualizado);
  root.innerHTML = `
  <div class="barra-vista"><a class="btn-ico" href="#panel" aria-label="Volver al panel">${ico('atras')}</a><h1>Mis productos</h1>
    <a class="btn btn-pri btn-chico" href="#publicar">${ico('mas')} Publicar</a></div>
  <div class="tabs" role="tablist">${tabs.map(([k, t]) => `<button role="tab" aria-selected="${filtro === k}" class="tab ${filtro === k ? 'on' : ''}" data-tab="${k}">${t} <span>${n[k] || 0}</span></button>`).join('')}</div>
  ${l.length ? `<ul class="mis-lista">${l.map((p) => `<li class="mi-item">
      <a class="mi-foto" href="#producto-${esc(p.id)}" aria-label="Ver ${esc(p.titulo)}">${foto(p)}</a>
      <div class="mi-txt"><a href="#producto-${esc(p.id)}"><strong>${esc(p.titulo)}</strong></a>
        <span class="precio-chico">${fmtPrecio(p.precio)}</span>
        <span class="txt-sec">${chipEstado(p)} · actualizada ${hace(p.actualizado)}</span>
        ${p._consultas ? `<span class="txt-sec">${ico('chat')} ${p._consultas} ${p._consultas === 1 ? 'consulta' : 'consultas'} por WhatsApp</span>` : ''}</div>
      <div class="mi-acciones">
        <a class="btn btn-sec btn-chico" href="#editar-${esc(p.id)}">${ico('editar')} Editar</a>
        ${p.disponibilidad === 'disponible' ? `<button class="btn btn-sec btn-chico" data-acc="pausada" data-id="${esc(p.id)}">${ico('pausa')} Pausar</button>
          <button class="btn btn-sec btn-chico" data-acc="vendida" data-id="${esc(p.id)}">${ico('check')} Vendido</button>`
        : `<button class="btn btn-sec btn-chico" data-acc="disponible" data-id="${esc(p.id)}">${ico('play')} ${p.disponibilidad === 'vendida' ? 'Volver a publicar' : 'Reactivar'}</button>`}
        <button class="btn btn-ico-texto peligro" data-borrar="${esc(p.id)}" aria-label="Borrar ${esc(p.titulo)}">${ico('basura')} Borrar</button>
      </div></li>`).join('')}</ul>`
    : vacio(filtro === 'disponible' ? 'No tenés publicaciones activas' : filtro === 'pausada' ? 'No tenés publicaciones pausadas' : 'Todavía no marcaste ventas',
      filtro === 'disponible' ? 'Publicá tu primer producto: es gratis.' : 'Cuando pauses o vendas algo, aparece acá.',
      filtro === 'disponible' ? '<a class="btn btn-pri" href="#publicar">Crear publicación</a>' : '')}`;

  root.querySelectorAll('[data-tab]').forEach((b) => b.onclick = () => { filtro = b.dataset.tab; vista(root, { nombre: 'mis-productos' }, ctx); });
  const txt = { pausada: 'Publicación pausada: ya no la ve nadie.', vendida: '¡Felicitaciones por la venta!', disponible: 'Publicación activa otra vez.' };
  root.querySelectorAll('[data-acc]').forEach((b) => b.onclick = async () => {
    b.disabled = true;
    try { await ctx.d.cambiarDisponibilidad(b.dataset.id, b.dataset.acc); toast(txt[b.dataset.acc]); vista(root, { nombre: 'mis-productos' }, ctx); }
    catch (e) { toast(e.message, 'error'); b.disabled = false; }
  });
  root.querySelectorAll('[data-borrar]').forEach((b) => b.onclick = async () => {
    const p = mias.find((x) => x.id === b.dataset.borrar);
    const ok = await confirmar({ titulo: 'Borrar publicación', texto: `Se borra "${p.titulo}" y no se puede recuperar. Si solo querés ocultarla, usá Pausar.`, si: 'Borrar', peligro: true });
    if (!ok) return;
    try { await ctx.d.borrarPublicacion(p.id); toast('Publicación borrada.'); vista(root, { nombre: 'mis-productos' }, ctx); }
    catch (e) { toast(e.message, 'error'); }
  });
}
