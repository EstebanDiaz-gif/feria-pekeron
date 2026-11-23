// Pantalla de descarga (link de la campaña: feria.pekeronapp.com/?v).
// Es lo más directo que permite un navegador: en Android un solo toque en "Descargar" abre el cartel de
// instalación (no se puede instalar sin ese toque); en iPhone se muestran los 3 pasos de Safari.
// Después lleva a crear la cuenta.
import { esIOS, instalada, puedeInstalar, esperarAviso, instalarYa } from '../lib/instalar.js';
import { ico } from '../lib/iconos.js';
import { lugarCartel } from './componentes.js';
import { cartelCupo } from '../lib/fundadores.js';

export async function vista(root, _r, ctx) {
  const ios = esIOS();
  root.innerHTML = `<div class="descarga">
    <img class="descarga-ico" src="icons/icon-512.png" alt="" width="104" height="104">
    <h1>Feria Pekerón</h1>
    <p class="txt-sec">Comprá y vendé en tu barrio. Gratis y sin comisiones.</p>
    <div data-fund-cartel></div>
    <div class="descarga-accion" data-accion></div>
    <a class="btn btn-sec ancho" href="#registrarse">${ctx.usuario ? 'Ir a mi cuenta' : 'Seguir sin descargar y crear mi cuenta'}</a>
    <ul class="descarga-datos">
      <li>${ico('check')} Ocupa muy poco espacio</li>
      <li>${ico('check')} No hace falta Play Store ni App Store</li>
      <li>${ico('check')} Queda con su ícono, como cualquier app</li>
    </ul>
  </div>`;
  lugarCartel(root, () => cartelCupo({ link: '' }));
  const zona = root.querySelector('[data-accion]');
  const listo = () => {
    zona.innerHTML = `<div class="nota ok">${ico('check')} <span><b>¡Listo, ya la tenés!</b> Abrila desde el ícono en tu pantalla de inicio.</span></div>
      <a class="btn btn-pri btn-grande ancho" href="#registrarse">${ico('usuario')} Crear mi cuenta</a>`;
  };
  if (instalada()) { listo(); return; }
  window.addEventListener('feria-instalada', listo, { once: true });

  if (ios) {
    zona.innerHTML = `<p class="descarga-paso">En iPhone se agrega desde <b>Safari</b> en 3 toques:</p>
      <ol class="pasos">
        <li><span class="num">1</span><span>Tocá <b>Compartir</b> abajo</span>${ico('compartir')}</li>
        <li><span class="num">2</span><span>Elegí <b>Agregar a inicio</b></span>${ico('mas')}</li>
        <li><span class="num">3</span><span>Tocá <b>Agregar</b>. ¡Listo!</span></li>
      </ol>`;
    return;
  }
  const boton = (habilitado) => {
    zona.innerHTML = `<button class="btn btn-pri btn-grande ancho" data-bajar ${habilitado ? '' : 'disabled'}>
        ${ico('descargar')} ${habilitado ? 'Descargar la app' : 'Preparando la descarga…'}</button>`;
    const b = zona.querySelector('[data-bajar]');
    if (habilitado) b.onclick = async () => { const r = await instalarYa(); if (r === 'accepted') listo(); else if (!puedeInstalar()) sinAviso(); };
  };
  const sinAviso = () => {
    zona.innerHTML = `<p class="descarga-paso">Abrí el menú del navegador <b>(⋮)</b> y tocá <b>Instalar app</b> o
      <b>Agregar a pantalla de inicio</b>.</p>`;
  };
  if (puedeInstalar()) { boton(true); return; }
  boton(false);
  const hay = await esperarAviso(4000);
  if (!zona.isConnected) return;
  if (hay) boton(true); else sinAviso();
}
