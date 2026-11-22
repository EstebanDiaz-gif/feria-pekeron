// "Descargar la app": la Feria es una PWA. En Android/Chrome se instala con el aviso del navegador;
// en iPhone se agrega desde Safari (Compartir → Agregar a inicio).
import { hoja } from './dom.js';
import { ico } from './iconos.js';

let aviso = null;
window.addEventListener('beforeinstallprompt', (e) => { e.preventDefault(); aviso = e; });
window.addEventListener('appinstalled', () => { aviso = null; marcar(true); });

export const esIOS = () => /iphone|ipad|ipod/i.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
const abiertaComoApp = () => ['standalone', 'fullscreen', 'minimal-ui'].some((m) => matchMedia(`(display-mode: ${m})`).matches)
  || navigator.standalone === true || document.referrer.startsWith('android-app://');
let yaInstalada = false;
try { yaInstalada = localStorage.getItem('feria.instalada') === '1'; } catch { /* nada */ }

function marcar(si) {
  yaInstalada = si;
  try { si ? localStorage.setItem('feria.instalada', '1') : localStorage.removeItem('feria.instalada'); } catch { /* nada */ }
  document.body.classList.toggle('app-instalada', si || abiertaComoApp());
}

export const instalada = () => abiertaComoApp() || yaInstalada;

// Oculta "Descargar la app" si se abrió desde la app instalada o si el navegador avisa que ya está instalada.
export async function revisarInstalacion() {
  document.body.classList.toggle('app-instalada', instalada());
  if (abiertaComoApp()) return;
  if ('getInstalledRelatedApps' in navigator) {
    try { const l = await navigator.getInstalledRelatedApps(); marcar(l.length > 0); } catch { /* sin soporte */ }
  }
}

export function abrirInstalar() {
  const ios = esIOS();
  const html = `
    <div class="app-ficha"><img src="icons/icon-192.png" alt="" width="56" height="56">
      <div><strong>Feria Pekerón</strong><span class="txt-sec">Comprá y vendé en tu zona</span></div></div>
    ${instalada() ? '<p class="nota ok">Ya tenés la app instalada en este dispositivo.</p>' : ios ? `
      <p class="txt-sec">En iPhone se agrega desde <b>Safari</b>, en 3 pasos:</p>
      <ol class="pasos">
        <li><span class="num">1</span><span>Tocá <b>Compartir</b> en la barra de Safari</span>${ico('compartir')}</li>
        <li><span class="num">2</span><span>Elegí <b>Agregar a inicio</b></span>${ico('mas')}</li>
        <li><span class="num">3</span><span>Tocá <b>Agregar</b>. ¡Listo!</span></li>
      </ol>
      <button class="btn btn-sec ancho" data-cerrar>Entendido</button>` : aviso ? `
      <p class="txt-sec">Se instala en un toque y queda con su ícono, como cualquier app. No hace falta Play Store.</p>
      <button class="btn btn-pri ancho" data-instalar>${ico('descargar')} Instalar la app</button>` : `
      <p class="txt-sec">Tu navegador no ofreció la instalación automática. Abrí el menú del navegador (⋮) y elegí
      <b>Instalar app</b> o <b>Agregar a pantalla de inicio</b>.</p>
      <p class="nota">La instalación funciona cuando la Feria está publicada en su dirección propia (https), no dentro de una vista previa.</p>
      <button class="btn btn-sec ancho" data-cerrar>Entendido</button>`}`;
  const { el, cerrar } = hoja(html, { titulo: 'Descargá la app' });
  const b = el.querySelector('[data-instalar]');
  if (b) b.onclick = async () => { const a = aviso; aviso = null; a.prompt(); await a.userChoice.catch(() => {}); cerrar(); };
}
