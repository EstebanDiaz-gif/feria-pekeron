// Mi cuenta, como en MercadoLibre: una sola cuenta para comprar y vender.
// Compras: consultados, favoritos y vistos. Ventas: el panel del vendedor.
import { insignia, cartelCupo } from '../lib/fundadores.js';
import { esc } from '../lib/util.js';
import { ico } from '../lib/iconos.js';
import { linkGestion } from '../config.js';

export async function vista(root, _r, ctx) {
  const u = ctx.usuario;
  const [cons, favs] = await Promise.all([ctx.d.consultados().catch(() => []), ctx.d.favoritos().catch(() => [])]);
  const vistos = ctx.d.vistos();
  const badge = (n) => (n ? `<span class="num-badge">${n > 99 ? '99+' : n}</span>` : '');

  root.innerHTML = `
  <div class="cuenta-cab">
    <span class="avatar" aria-hidden="true">${esc(((u && u.nombre) || 'F').charAt(0).toUpperCase())}</span>
    <div>${u ? `<h1>Hola, ${esc(u.nombre.split(' ')[0] || 'vecino')}</h1>${insignia(u.uid)}<p>${u.tipo === 'comercio' ? 'Comerciante' : 'Particular'}${u.localidad ? ' · ' + esc(u.localidad) : ''}</p>`
      : '<h1>Mi cuenta</h1><p>Ingresá para vender y tener tus favoritos en todos tus dispositivos.</p>'}</div>
  </div>

  <nav class="accesos" aria-label="Compras">
    <a href="#consultados"><span class="acc-ico">${ico('chat')}${badge(cons.length)}</span>Consultados</a>
    <a href="#favoritos"><span class="acc-ico">${ico('corazon')}${badge(favs.length)}</span>Favoritos</a>
    <a href="#vistos"><span class="acc-ico">${ico('ojo')}${badge(vistos.length)}</span>Vistos</a>
  </nav>

  <h2 class="grupo-tit">Ventas</h2>
  ${u ? `<div class="menu-lista">
      <a href="#panel">${ico('panel')}<span><strong>Panel de vendedor</strong><small>Resumen, consultas y "¿ya lo vendiste?"</small></span>${ico('derecha', 'chev')}</a>
      <a href="#mis-productos">${ico('caja')}<span><strong>Mis publicaciones</strong><small>Editar, pausar o marcar vendido</small></span>${ico('derecha', 'chev')}</a>
      <a href="#publicar">${ico('mas')}<span><strong>Vender algo</strong><small>Publicar es gratis y sin comisiones</small></span>${ico('derecha', 'chev')}</a>
      <a href="#mi-tienda">${ico('tienda')}<span><strong>Mi tienda</strong><small>Tu página con todos tus productos</small></span>${ico('derecha', 'chev')}</a>
    </div>
    <h2 class="grupo-tit">Cuenta</h2>
    <div class="menu-lista">
      <a href="#notificaciones">${ico('campana')}<span><strong>Notificaciones</strong><small>Consultas, favoritos y novedades</small></span>${ico('derecha', 'chev')}</a>
      <a href="#perfil">${ico('usuario')}<span><strong>Configuración del perfil</strong><small>Nombre, WhatsApp y ubicación</small></span>${ico('derecha', 'chev')}</a>
      <button data-salir>${ico('salir')}<span><strong>Salir</strong><small>Cerrar sesión en este dispositivo</small></span></button>
    </div>`
  : `<div class="menu-lista">
      <a href="#ingresar">${ico('usuario')}<span><strong>Ingresar</strong><small>Si ya tenés cuenta en la Feria</small></span>${ico('derecha', 'chev')}</a>
      <a href="#registrarse">${ico('mas')}<span><strong>Crear cuenta gratis</strong><small>Para vender y guardar tus favoritos en la cuenta</small></span>${ico('derecha', 'chev')}</a>
    </div>`}

  <div class="menu-lista menu-solo"><button data-instalar>${ico('descargar')}<span><strong>Descargar la app</strong><small>Instalala en tu celular, gratis</small></span>${ico('derecha', 'chev')}</button></div>

  <a class="gestion-card" href="${esc(linkGestion)}" rel="noopener">
    <strong>¿Tenés un negocio?</strong><span>Con Pekerón Gestión controlás stock, ventas y caja, y tus productos aparecen en la Feria.</span></a>`;

  const s = root.querySelector('[data-salir]');
  if (s) s.onclick = async () => { await ctx.d.auth.salir(); ctx.ir('inicio'); };
}
