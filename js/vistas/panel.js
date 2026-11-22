// Panel del vendedor: resumen y "Mis productos" (editar, pausar, marcar vendido, borrar).
import { esc, fmtPrecio, hace } from '../lib/util.js';
import { ico } from '../lib/iconos.js';
import { toast, confirmar } from '../lib/dom.js';
import { linkGestion } from '../config.js';
import { chipEstado, foto, vacio } from './componentes.js';

let filtro = 'disponible';

export async function vista(root, r, ctx) {
  const u = ctx.usuario;
  const [mias, t] = await Promise.all([ctx.d.listar({ uid: u.uid, incluirOcultas: true }), ctx.d.tiendaDeUsuario(u.uid)]);
  const n = { disponible: 0, pausada: 0, vendida: 0 };
  for (const p of mias) n[p.disponibilidad] = (n[p.disponibilidad] || 0) + 1;
  if (r.nombre === 'mis-productos') return lista(root, ctx, mias, n);

  root.innerHTML = `
  <div class="panel-cab">
    <div><p class="txt-sec">Panel del vendedor</p><h1>Hola, ${esc(u.nombre.split(' ')[0])}</h1>
    <span class="chip-tipo">${u.tipo === 'comercio' ? ico('tienda') + ' Comerciante' : ico('usuario') + ' Particular'}</span></div>
  </div>
  ${ctx.d.modo === 'local' ? `<div class="nota nota-aviso">${ico('info')}<span>Perfil de prueba: lo que cargues queda solo en este navegador.</span></div>` : ''}

  <div class="resumen">
    <a class="resumen-item" href="#mis-productos" data-f="disponible"><strong>${n.disponible}</strong><span>Activas</span></a>
    <a class="resumen-item" href="#mis-productos" data-f="pausada"><strong>${n.pausada}</strong><span>Pausadas</span></a>
    <a class="resumen-item" href="#mis-productos" data-f="vendida"><strong>${n.vendida}</strong><span>Vendidas</span></a>
  </div>

  <a class="btn btn-pri ancho btn-grande" href="#publicar">${ico('mas')} Crear publicación</a>

  <div class="menu-lista">
    <a href="#mis-productos" data-f="disponible">${ico('caja')}<span><strong>Mis productos</strong><small>${mias.length} en total · editar, pausar o marcar vendido</small></span>${ico('derecha', 'chev')}</a>
    <a href="#mi-tienda">${ico('tienda')}<span><strong>Mi tienda</strong><small>${t ? esc(t.nombre) + ' · portada, logo y WhatsApp' : 'Todavía no la creaste'}</small></span>${ico('derecha', 'chev')}</a>
    ${t ? `<a href="#tienda-${esc(t.slug)}">${ico('compartir')}<span><strong>Ver mi tienda como cliente</strong><small>Lo que ven los compradores</small></span>${ico('derecha', 'chev')}</a>` : ''}
    <a href="#perfil">${ico('usuario')}<span><strong>Configuración del perfil</strong><small>Nombre, WhatsApp y ubicación</small></span>${ico('derecha', 'chev')}</a>
    <button data-salir>${ico('salir')}<span><strong>Salir</strong><small>${ctx.d.modo === 'local' ? 'El perfil de prueba queda guardado en este navegador' : 'Cerrar sesión en este dispositivo'}</small></span></button>
  </div>

  ${u.tipo === 'comercio' ? `<a class="gestion-card" href="${esc(linkGestion)}" rel="noopener">
    <strong>¿Querés controlar stock, ventas y caja?</strong><span>Probá Pekerón Gestión, el software para negocios.</span></a>` : ''}`;

  root.querySelectorAll('[data-f]').forEach((a) => a.addEventListener('click', () => { filtro = a.dataset.f; }));
  root.querySelector('[data-salir]').onclick = async () => { await ctx.d.auth.salir(); ctx.ir('inicio'); };
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
        <span class="txt-sec">${chipEstado(p)} · actualizada ${hace(p.actualizado)}</span></div>
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
