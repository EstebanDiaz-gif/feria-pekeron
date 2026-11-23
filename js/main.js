// Arranque y navegación de Feria Pekerón.
// Rutas por "hash" simple (#inicio, #producto-abc123): funcionan en cualquier hosting estático, sin servidor.
import { iniciarDatos } from './datos/index.js';
import { zonaInicial } from './config.js';
import { $, toast } from './lib/dom.js';
import { esc } from './lib/util.js';
import { ico } from './lib/iconos.js';
import { abrirInstalar, revisarInstalacion } from './lib/instalar.js';
import { elegirZona } from './vistas/zona.js';
import { fijarBusqueda } from './vistas/buscar.js';
import { mostrarAnuncio } from './lib/anuncio.js';

const RUTAS = {
  inicio: () => import('./vistas/inicio.js'),
  notificaciones: () => import('./vistas/notificaciones.js'),
  categorias: () => import('./vistas/categorias.js'),
  buscar: () => import('./vistas/buscar.js'),
  categoria: () => import('./vistas/buscar.js'),
  producto: () => import('./vistas/producto.js'),
  tiendas: () => import('./vistas/tiendas.js'),
  tienda: () => import('./vistas/tienda.js'),
  ingresar: () => import('./vistas/cuenta.js'),
  registrarse: () => import('./vistas/cuenta.js'),
  cuenta: () => import('./vistas/mi-cuenta.js'),
  consultados: () => import('./vistas/compras.js'),
  favoritos: () => import('./vistas/compras.js'),
  vistos: () => import('./vistas/compras.js'),
  panel: () => import('./vistas/panel.js'),
  'mis-productos': () => import('./vistas/panel.js'),
  publicar: () => import('./vistas/publicar.js'),
  editar: () => import('./vistas/publicar.js'),
  'mi-tienda': () => import('./vistas/mi-tienda.js'),
  perfil: () => import('./vistas/perfil.js'),
};
const CON_PARAM = ['producto', 'tienda', 'editar', 'categoria'];
const PRIVADAS = ['panel', 'mis-productos', 'publicar', 'editar', 'mi-tienda', 'perfil'];

function leerRuta() {
  const h = decodeURIComponent(location.hash.replace(/^#/, '')) || 'inicio';
  if (RUTAS[h] && !CON_PARAM.includes(h)) return { nombre: h, param: '' };
  for (const r of CON_PARAM) if (h.startsWith(r + '-')) return { nombre: r, param: h.slice(r.length + 1) };
  return { nombre: 'inicio', param: '' };
}

// ---- Zona elegida por el comprador (comodidad de este navegador) ----
function leerZona() {
  try { const z = JSON.parse(localStorage.getItem('feria.zona') || 'null'); if (z && z.provincia) return z; } catch { /* nada */ }
  return { ...zonaInicial };
}
function guardarZona(z) { try { localStorage.setItem('feria.zona', JSON.stringify(z)); } catch { /* nada */ } }

const ctx = {
  d: null,
  zona: leerZona(),
  get usuario() { return ctx.d.auth.actual(); },
  ir(h) { if (location.hash === '#' + h) mostrar(); else location.hash = h; },
  refrescar() { mostrar(); },
  async cambiarZona() {
    const z = await elegirZona(ctx.zona);
    if (z) { ctx.zona = z; guardarZona(z); pintarCabecera(); ctx.actualizarCampana(ctx.campana); mostrar(); }
  },
  volverA: '',
  despuesDeCuenta: '',
  campana: 0,
  actualizarCampana(n) {
    ctx.campana = n;
    const b = document.querySelector('[data-campana]');
    if (!b) return;
    b.hidden = !n; b.textContent = n > 9 ? '9+' : String(n);
    b.parentElement.setAttribute('aria-label', n ? `Notificaciones, ${n} nuevas` : 'Notificaciones');
  },
  async contarNotificaciones() {
    try {
      const N = await import('./datos/notificaciones.js');
      ctx.actualizarCampana(N.contarNuevas(await N.armar(ctx)));
    } catch (e) { console.warn('campana', e); }
  },
};

function pintarCabecera() {
  $('#top').innerHTML = `<div class="top-in">
    <div class="top-fila">
      <a class="marca" href="#inicio" aria-label="Feria Pekerón, inicio">
        <img src="icons/icon.svg" alt="" width="36" height="36"><span class="marca-txt">Feria <b>Pekerón</b></span></a>
      <form class="top-buscar" role="search" data-top-buscar>
        ${ico('buscar')}<input type="search" name="q" placeholder="Buscar en la Feria" aria-label="Buscar productos" autocomplete="off" enterkeyhint="search">
      </form>
      <nav class="top-links" aria-label="Secciones">
        <a href="#categorias">Categorías</a><a href="#tiendas">Tiendas</a><a href="#publicar">Vender</a><a href="#cuenta">Mi cuenta</a>
      </nav>
      <a class="btn-ico campana" href="#notificaciones" aria-label="Notificaciones">${ico('campana')}<span class="campana-num" data-campana hidden></span></a>
    </div>
    <button class="zona" data-zona>${ico('ubicacion')}<span>${esc(ctx.zona.localidad || ctx.zona.provincia || 'Todo el país')}</span>${ico('abajo', 'zona-flecha')}</button>
  </div>`;
  $('#top [data-zona]').onclick = () => ctx.cambiarZona();
  $('#top [data-top-buscar]').onsubmit = (e) => {
    e.preventDefault();
    const q = String(new FormData(e.target).get('q') || '').trim();
    e.target.q.blur();
    fijarBusqueda({ q });
    ctx.ir('buscar');
  };
}

function pintarTabbar(activa) {
  const it = [
    ['inicio', 'Inicio', 'casa'], ['categorias', 'Categorías', 'grilla'], ['publicar', 'Vender', 'mas'],
    ['tiendas', 'Tiendas', 'tienda'], ['cuenta', 'Mi cuenta', 'usuario'],
  ];
  const grupo = { categoria: 'categorias', buscar: 'categorias', tienda: 'tiendas' };
  const cuenta = ['panel', 'mis-productos', 'editar', 'mi-tienda', 'perfil', 'ingresar', 'registrarse', 'consultados', 'favoritos', 'vistos'];
  const a = cuenta.includes(activa) ? 'cuenta' : grupo[activa] || activa;
  $('#tabbar').innerHTML = it.map(([h, t, i]) => {
    const on = a === h;
    return `<a href="#${h}" class="${h === 'publicar' ? 'tab-vender ' : ''}${on ? 'activa' : ''}" ${on ? 'aria-current="page"' : ''}>
      <span class="tab-ico">${ico(i)}</span><span>${t}</span></a>`;
  }).join('');
}

let turno = 0;
async function mostrar() {
  const n = ++turno;
  let { nombre, param } = leerRuta();
  if (PRIVADAS.includes(nombre) && !ctx.usuario) {
    ctx.volverA = location.hash.replace(/^#/, '');
    nombre = 'ingresar'; param = '';
  }
  pintarTabbar(nombre);
  const root = $('#app');
  try {
    const m = await RUTAS[nombre]();
    if (n !== turno) return;
    root.innerHTML = '<div class="cargando">Cargando…</div>';
    await m.vista(root, { nombre, param }, ctx);
    if (n !== turno) return;
    window.scrollTo(0, 0);
    root.focus({ preventScroll: true });
  } catch (e) {
    console.error(e);
    if (n === turno) root.innerHTML = `<div class="vacio"><strong>No se pudo abrir esta pantalla</strong><p>${esc(e.message)}</p><a class="btn btn-pri" href="#inicio">Ir al inicio</a></div>`;
  }
}

function avisoModo() {
  const a = $('#aviso-modo');
  if (ctx.d.modo === 'local') {
    a.innerHTML = ctx.d.memoria
      ? `${ico('info')}<span><b>Modo prueba:</b> este navegador no permite guardar datos, así que lo que cargues se borra al recargar la página.</span>`
      : `${ico('info')}<span><b>Modo prueba:</b> lo que publiques se guarda solo en este navegador. Nadie más lo ve todavía.</span>`;
    a.hidden = false;
  }
}

async function arrancar() {
  try {
    ctx.d = await iniciarDatos();
  } catch (e) {
    $('#app').innerHTML = `<div class="vacio"><strong>No se pudo iniciar la Feria</strong><p>${esc(e.message)}</p></div>`;
    return;
  }
  avisoModo();
  pintarCabecera();
  revisarInstalacion();
  ctx.d.auth.alCambiar(() => { pintarCabecera(); ctx.actualizarCampana(ctx.campana); ctx.contarNotificaciones(); });
  window.addEventListener('hashchange', mostrar);
  document.addEventListener('click', (e) => { if (e.target.closest('[data-instalar]') && !e.target.closest('#top')) abrirInstalar(); });
  mostrar();
  // Viene del QR de "Descargá la app" (feria.pekeronapp.com/?app): se ofrece instalar en vez del anuncio.
  const desdeQR = new URLSearchParams(location.search).has('app');
  if (desdeQR) {
    history.replaceState(null, '', location.pathname + location.hash);
    setTimeout(() => { if (!document.body.classList.contains('app-instalada')) abrirInstalar(); }, 1500);
  } else setTimeout(() => mostrarAnuncio(ctx), 900);
  setTimeout(() => ctx.contarNotificaciones(), 2500);
  setInterval(() => { if (!document.hidden) ctx.contarNotificaciones(); }, 5 * 60000);
  if ('serviceWorker' in navigator && location.protocol === 'https:') {
    navigator.serviceWorker.register('sw.js').catch(() => { /* vista previa o navegador sin soporte */ });
  }
}

window.addEventListener('unhandledrejection', (e) => { toast((e.reason && e.reason.message) || 'Ocurrió un error', 'error'); });
arrancar();
