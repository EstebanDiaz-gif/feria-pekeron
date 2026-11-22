// Ayudas de interfaz: avisos, diálogos y hojas que suben desde abajo.
import { esc } from './util.js';
import { ico } from './iconos.js';

export const $ = (s, r = document) => r.querySelector(s);
export const $$ = (s, r = document) => [...r.querySelectorAll(s)];

let tt = 0;
export function toast(texto, tipo = '') {
  const t = $('#toast');
  t.textContent = texto;
  t.className = 'toast visible ' + tipo;
  clearTimeout(tt);
  tt = setTimeout(() => { t.className = 'toast'; }, 3200);
}

// Hoja inferior (en celular) / diálogo centrado (en compu). Devuelve el elemento y una función cerrar.
export function hoja(html, { titulo = '', alCerrar } = {}) {
  const capa = $('#capa');
  capa.innerHTML = `<div class="hoja" role="dialog" aria-modal="true" ${titulo ? 'aria-labelledby="hoja-t"' : ''}>
    <div class="hoja-asa" aria-hidden="true"></div>
    ${titulo ? `<div class="hoja-cab"><h2 id="hoja-t">${esc(titulo)}</h2><button class="btn-ico" data-cerrar aria-label="Cerrar">${ico('cerrar')}</button></div>` : ''}
    <div class="hoja-cuerpo">${html}</div></div>`;
  capa.hidden = false;
  document.body.classList.add('sin-scroll');
  const el = capa.firstElementChild;
  const previo = document.activeElement;
  const cerrar = () => {
    capa.hidden = true; capa.innerHTML = '';
    document.body.classList.remove('sin-scroll');
    document.removeEventListener('keydown', tecla);
    if (previo && previo.focus) previo.focus();
    if (alCerrar) alCerrar();
  };
  const tecla = (e) => { if (e.key === 'Escape') cerrar(); };
  document.addEventListener('keydown', tecla);
  capa.onclick = (e) => { if (e.target === capa || e.target.closest('[data-cerrar]')) cerrar(); };
  setTimeout(() => { const f = el.querySelector('button, a, input, select, textarea'); if (f) f.focus(); }, 30);
  return { el, cerrar };
}

// Confirmación propia (confirm() no funciona en todos lados y se ve fuera de estilo).
export function confirmar({ titulo, texto, si = 'Confirmar', peligro = false }) {
  return new Promise((ok) => {
    let r = false;
    const { el, cerrar } = hoja(`<p class="txt-sec">${esc(texto)}</p>
      <div class="fila-btns"><button class="btn btn-sec" data-cerrar>Cancelar</button>
      <button class="btn ${peligro ? 'btn-peligro' : 'btn-pri'}" data-si>${esc(si)}</button></div>`, { titulo, alCerrar: () => ok(r) });
    el.querySelector('[data-si]').onclick = () => { r = true; cerrar(); };
  });
}

export function cargandoBtn(btn, si, texto = 'Guardando…') {
  if (!btn) return;
  if (si) { btn.dataset.txt = btn.innerHTML; btn.disabled = true; btn.textContent = texto; }
  else { btn.disabled = false; if (btn.dataset.txt) btn.innerHTML = btn.dataset.txt; }
}
