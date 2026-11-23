// Para escribirle a un vendedor hay que tener cuenta (como en MercadoLibre). Navegar, buscar y ver todo sigue libre.
// Si alguien sin sesión toca un botón de WhatsApp, se le muestra una hoja para crear su cuenta o ingresar,
// y después vuelve a la misma pantalla con el botón resaltado para que escriba (el navegador no deja abrir
// WhatsApp solo, sin un toque de la persona).
import { hoja } from './dom.js';
import { ilus } from './ilustraciones.js';

export function pedirCuenta(ctx, { vendedor = '' } = {}) {
  const { el, cerrar } = hoja(`<div class="acceso">
      <div class="acceso-ilus">${ilus('chat')}</div>
      <h2>Creá tu cuenta para escribirle${vendedor ? ' a ' + escTxt(vendedor) : ' al vendedor'}</h2>
      <p class="txt-sec">Es gratis y te lleva un minuto. Así los vendedores saben quién consulta, y vos tenés tus consultas
        y favoritos guardados.</p>
      <button class="btn btn-pri ancho" data-ir="registrarse">Crear cuenta gratis</button>
      <button class="btn btn-sec ancho" data-ir="ingresar">Ya tengo cuenta</button>
      <button class="btn-link" data-cerrar>Ahora no</button>
    </div>`);
  el.querySelectorAll('[data-ir]').forEach((b) => b.onclick = () => {
    ctx.volverA = location.hash.replace(/^#/, '') || 'inicio';
    ctx.despuesDeCuenta = 'whatsapp';
    cerrar();
    ctx.ir(b.dataset.ir);
  });
}

// Engancha todos los botones de WhatsApp de una pantalla. Devuelve true si la persona ya puede escribir.
export function protegerWhatsApp(root, ctx, opciones = {}) {
  root.querySelectorAll('.btn-wa').forEach((b) => b.addEventListener('click', (e) => {
    if (ctx.usuario) return;
    e.preventDefault();
    e.stopImmediatePropagation();
    pedirCuenta(ctx, opciones);
  }, true));
  // Recién creó la cuenta o ingresó desde un botón de WhatsApp: resaltarlo.
  if (ctx.usuario && ctx.despuesDeCuenta === 'whatsapp') {
    ctx.despuesDeCuenta = '';
    const b = root.querySelector('.btn-wa');
    if (b) {
      b.classList.add('wa-listo');
      setTimeout(() => b.scrollIntoView({ block: 'center', behavior: 'smooth' }), 200);
      return 'listo';
    }
  }
  return !!ctx.usuario;
}

function escTxt(s) { return String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c])); }
