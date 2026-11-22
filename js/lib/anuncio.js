// Anuncio al abrir la Feria (como el de MercadoLibre): como mucho una vez por día,
// rotando entre los de config.js (lanzamiento de la Feria, Pekerón Gestión, etc.).
import { anuncios } from '../config.js';
import { esc } from './util.js';
import { ico } from './iconos.js';

const CLAVE = 'feria.anuncio';

function leer() { try { return JSON.parse(localStorage.getItem(CLAVE) || '{}'); } catch { return {}; } }
function guardar(v) { try { localStorage.setItem(CLAVE, JSON.stringify(v)); } catch { /* nada */ } }
const hoy = () => new Date().toISOString().slice(0, 10);

export function mostrarAnuncio(ctx, { forzar = false } = {}) {
  if (!anuncios || !anuncios.length) return;
  const h = location.hash.replace('#', '');
  if (!forzar && h && h !== 'inicio') return; // no tapar a quien entró por un link a un producto o tienda
  if (document.querySelector('#capa:not([hidden])')) return;
  const est = leer();
  if (!forzar && est.dia === hoy()) return;
  const i = Number.isInteger(est.i) ? (est.i + 1) % anuncios.length : 0;
  const a = anuncios[i];
  guardar({ dia: hoy(), i });

  const capa = document.querySelector('#capa');
  const externo = /^https:\/\//.test(a.link);
  capa.innerHTML = `<div class="anuncio tema-${esc(a.tema || 'azul')}" role="dialog" aria-modal="true" aria-labelledby="anuncio-t">
    <button class="anuncio-cerrar" data-cerrar aria-label="Cerrar anuncio">${ico('cerrar')}</button>
    <div class="anuncio-arte" aria-hidden="true">
      <span class="anuncio-burbuja b1"></span><span class="anuncio-burbuja b2"></span>
      <span class="anuncio-ico">${ico(a.icono || 'estrella')}</span>
      <img src="icons/icon.svg" alt="" class="anuncio-logo" width="44" height="44">
    </div>
    <div class="anuncio-cuerpo">
      ${a.etiqueta ? `<span class="anuncio-etq">${esc(a.etiqueta)}</span>` : ''}
      <h2 id="anuncio-t">${esc(a.titulo)}</h2>
      <p>${esc(a.texto)}</p>
      <a class="btn btn-amarillo ancho btn-grande" href="${esc(a.link)}" ${externo ? 'target="_blank" rel="noopener"' : ''} data-ir>${esc(a.boton)}</a>
      ${a.secundario ? `<button class="btn-link ancho" data-cerrar>${esc(a.secundario)}</button>` : ''}
    </div>
  </div>`;
  capa.hidden = false;
  capa.classList.add('capa-anuncio');
  document.body.classList.add('sin-scroll');
  const previo = document.activeElement;
  const cerrar = () => {
    capa.hidden = true; capa.innerHTML = ''; capa.classList.remove('capa-anuncio');
    document.body.classList.remove('sin-scroll');
    document.removeEventListener('keydown', tecla);
    if (previo && previo.focus) previo.focus();
  };
  const tecla = (e) => { if (e.key === 'Escape') cerrar(); };
  document.addEventListener('keydown', tecla);
  capa.onclick = (e) => { if (e.target === capa || e.target.closest('[data-cerrar]') || e.target.closest('[data-ir]')) cerrar(); };
  setTimeout(() => { const b = capa.querySelector('[data-ir]'); if (b) b.focus(); }, 30);
}
