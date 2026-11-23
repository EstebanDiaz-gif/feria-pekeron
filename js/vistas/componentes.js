// Piezas que se repiten en varias pantallas.
import { esc, srcSeguro, fmtPrecio, hace } from '../lib/util.js';
import { ico } from '../lib/iconos.js';
import { ESTADOS } from '../datos/catalogo.js';
import { esFundador, estrella } from '../lib/fundadores.js';

export function foto(p, cls = '') {
  const s = srcSeguro(p && p.fotos && p.fotos[0]);
  return s ? `<img class="${cls}" src="${s}" alt="" loading="lazy">` : `<span class="sin-foto ${cls}">${ico('foto')}</span>`;
}

// Publicaciones que se muestran en tarjetas (para el corazón de favoritos sin volver a pedirlas).
export const enPantalla = new Map();
export function tarjetaPub(p, { mostrarTienda = true } = {}) {
  enPantalla.set(String(p.id), p);
  return `<a class="tarjeta" href="#producto-${esc(p.id)}">
    <span class="tarjeta-foto">${foto(p)}
      <button class="tarjeta-fav" type="button" data-fav-card="${esc(p.id)}" aria-pressed="false" aria-label="Guardar en favoritos">${ico('corazon')}</button>
      ${p.tienda && mostrarTienda ? `<span class="sello">${ico('tienda')} Tienda</span>` : ''}
      ${p.estado === 'usado' ? '<span class="sello sello-usado">Usado</span>' : ''}
      ${esFundador(p.uid) ? `<span class="sello sello-fund">${estrella()} Fundador</span>` : ''}</span>
    <span class="tarjeta-info">
      <span class="precio">${fmtPrecio(p.precio)}</span>
      <span class="tarjeta-tit">${esc(p.titulo)}</span>
      <span class="tarjeta-lugar">${ico('ubicacion')}${esc(p.barrio || p.localidad || '')}</span>
    </span></a>`;
}

export function grilla(lista, op) {
  return `<div class="grilla">${lista.map((p) => tarjetaPub(p, op)).join('')}</div>`;
}

export function avatar(t, cls = '') {
  const s = srcSeguro(t && t.logo);
  const ini = esc(((t && t.nombre) || '?').trim().charAt(0).toUpperCase());
  return s ? `<img class="avatar ${cls}" src="${s}" alt="">` : `<span class="avatar ${cls}" aria-hidden="true">${ini}</span>`;
}

export function tarjetaTienda(t) {
  return `<a class="tienda-card" href="#tienda-${esc(t.slug)}">
    ${avatar(t)}
    <span class="tienda-card-txt"><strong>${esc(t.nombre)}${esFundador(t.uid) ? ` <span class="fundador fundador-chica">${estrella()}</span>` : ''}</strong>
    <span class="txt-sec">${esc([t.localidad, t.provincia].filter(Boolean).join(', '))}</span></span>
    ${ico('derecha', 'chev')}</a>`;
}

export function vacio(titulo, texto, accion = '') {
  return `<div class="vacio">${ico('caja', 'vacio-ico')}<strong>${esc(titulo)}</strong><p>${esc(texto)}</p>${accion}</div>`;
}

export function seccion(titulo, cuerpo, extra = '') {
  return `<section class="seccion"><div class="seccion-cab"><h2>${esc(titulo)}</h2>${extra}</div>${cuerpo}</section>`;
}

export function chipEstado(p) {
  const d = p.disponibilidad;
  const c = d === 'disponible' ? 'ok' : d === 'vendida' ? 'gris' : 'aviso';
  const t = d === 'disponible' ? 'Activa' : d === 'vendida' ? 'Vendida' : 'Pausada';
  return `<span class="chip-estado ${c}">${t}</span>`;
}

export function metaPub(p) {
  return [ESTADOS[p.estado], p.barrio || p.localidad, p.creado ? hace(p.creado) : ''].filter(Boolean).map(esc).join(' · ');
}

export function volver(href, titulo) {
  return `<div class="barra-vista"><a class="btn-ico" href="${href}" aria-label="Volver">${ico('atras')}</a><h1>${esc(titulo)}</h1></div>`;
}

// Espacio para el cartel de cupo de Fundadores: se llena cuando terminan de cargar (sin repintar la pantalla).
export function lugarCartel(root, html) {
  const el = root.querySelector('[data-fund-cartel]');
  if (!el) return;
  const poner = () => { if (el.isConnected) el.innerHTML = html(); };
  poner(); window.addEventListener('fundadores', poner, { once: true });
}
