// Inicio: carrusel, categorías, cartel para negocios, Fundadores, destacados, cerca tuyo, tiendas y lo más nuevo.
import { esc } from '../lib/util.js';
import { ico } from '../lib/iconos.js';
import { ilus } from '../lib/ilustraciones.js';
import { CATEGORIAS } from '../datos/catalogo.js';
import { linkGestion, banners } from '../config.js';
import { grilla, seccion, vacio, avatar } from './componentes.js';
import { fijarBusqueda } from './buscar.js';
import * as Fund from '../lib/fundadores.js';

// Categorías que se muestran en el inicio (nombre corto). El resto está en "Más".
const ATAJOS = [
  { id: 'ropa', t: 'Ropa y calzado' }, { id: 'tecnologia', t: 'Tecnología' }, { id: 'hogar', t: 'Hogar' },
  { id: 'deportes', t: 'Deportes' }, { id: 'belleza', t: 'Belleza' }, { id: 'almacen', t: 'Almacén' },
];

let timer = 0;

export async function vista(root, _r, ctx) {
  clearInterval(timer);
  const { d, zona } = ctx;
  const [destacadas, cerca, recientes, tiendas] = await Promise.all([
    d.listar({ soloDestacadas: true, limite: 8 }),
    zona.localidad ? d.listar({ localidad: zona.localidad, limite: 8 }) : zona.provincia ? d.listar({ provincia: zona.provincia, limite: 8 }) : Promise.resolve([]),
    d.listar({ limite: 12 }),
    d.listarTiendas(),
  ]);
  // Productos de Vendedores Fundadores (sección destacada).
  const deFundadores = Fund.uids().size
    ? (await d.listar({})).filter((p) => Fund.esFundador(p.uid)).slice(0, 8) : [];
  const lugar = zona.localidad || zona.provincia;

  root.innerHTML = `
  <section class="carrusel" aria-roledescription="carrusel" aria-label="Novedades">
    <div class="carrusel-pista" data-pista>
      ${banners.map((b, i) => {
        const ext = /^https:\/\//.test(b.link);
        return `<a class="banner tema-${esc(b.tema)}" href="${esc(b.link)}" ${ext ? 'target="_blank" rel="noopener"' : ''} aria-roledescription="diapositiva" aria-label="${i + 1} de ${banners.length}: ${esc(b.titulo)}">
          <span class="banner-in"><span class="banner-txt"><strong>${esc(b.titulo)}</strong><span>${esc(b.texto)}</span><span class="banner-btn">${esc(b.boton)} ${ico('derecha')}</span></span>
          <span class="banner-arte" aria-hidden="true"><span class="anuncio-burbuja b1"></span><span class="anuncio-burbuja b2"></span><span class="banner-ico">${ico(b.icono)}</span></span></span>
        </a>`;
      }).join('')}
    </div>
    <div class="puntos" role="tablist" aria-label="Elegir novedad">${banners.map((b, i) => `<button role="tab" aria-label="Novedad ${i + 1}" data-punto="${i}" class="${i ? '' : 'on'}"></button>`).join('')}</div>
  </section>

  <nav class="cats-grid" aria-label="Categorías">
    <a class="cg" href="#buscar"><span class="cg-ico" style="background:#E8EEFF">${ilus('grilla')}</span><span>Todas</span></a>
    ${ATAJOS.map((a) => { const c = CATEGORIAS.find((x) => x.id === a.id); return `<a class="cg" href="#categoria-${c.id}"><span class="cg-ico" style="background:${c.bg}">${ilus(c.icono)}</span><span>${esc(a.t)}</span></a>`; }).join('')}
    <a class="cg" href="#categorias"><span class="cg-ico" style="background:#EEF0F4">${ilus('caja')}</span><span>Más</span></a>
  </nav>

  <a class="negocio" href="#publicar">
    <span class="negocio-ilus">${ilus('tienda')}</span>
    <span class="negocio-txt"><strong>¿Tenés un negocio o emprendimiento?</strong>
      <span>Creá tu tienda, publicá tus productos y llegá a más clientes.</span>
      <span class="btn btn-amarillo btn-chico">Publicar gratis ${ico('derecha')}</span></span>
  </a>

  ${ctx.usuario && Fund.esFundador(ctx.usuario.uid) ? '' : Fund.cartelCupo()}
  ${deFundadores.length ? seccion("⭐ De Vendedores Fundadores", grilla(deFundadores)) : ''}
  ${destacadas.length ? seccion('Destacados', grilla(destacadas)) : ''}

  ${lugar && cerca.length ? seccion(`🔥 Cerca tuyo · ${lugar}`, grilla(cerca), '<button class="link-btn" data-accion="cerca">Ver todo ›</button>') : ''}

  ${tiendas.length ? seccion('Tiendas', `<div class="tiendas-fila">${tiendas.slice(0, 12).map((t) => `
      <a class="tienda-mini" href="#tienda-${esc(t.slug)}">${avatar(t, 'avatar-l')}<span>${esc(t.nombre)}</span>
      ${t.origen === 'gestion' ? `<small>${ico('check')} Pekerón</small>` : ''}</a>`).join('')}</div>`, '<a href="#tiendas">Ver todas</a>') : ''}

  ${recientes.length ? seccion('Lo más nuevo', grilla(recientes), '<a href="#buscar">Ver todo ›</a>') : seccion('Lo más nuevo',
    vacio('Todavía no hay publicaciones', 'La Feria recién arranca. Podés ser de los primeros en publicar.', '<a class="btn btn-pri" href="#publicar">Publicar gratis</a>'))}

  <button class="banner-app" data-instalar>
    <img src="icons/icon-192.png" alt="" width="44" height="44">
    <span><strong>Descargá la app de la Feria</strong><span>Gratis y ocupa poco espacio</span></span>
    <span class="btn btn-amarillo btn-chico">Descargar</span>
  </button>

  <footer class="pie">
    <a href="${esc(linkGestion)}" rel="noopener">¿Tenés un negocio? Conocé <b>Pekerón Gestión</b>: stock, ventas y caja desde el celular.</a>
    <span>Feria Pekerón · Tucumán, Argentina</span>
  </footer>`;

  root.querySelectorAll('[data-accion]').forEach((b) => b.onclick = () => {
    fijarBusqueda(b.dataset.accion === 'cerca' ? { zona: true } : { estado: 'usado' });
    ctx.ir('buscar');
  });

  // Carrusel: desliza con el dedo, puntos clickeables y pasa solo cada 5 s (se frena si el usuario lo toca).
  const pista = root.querySelector('[data-pista]');
  const puntos = [...root.querySelectorAll('[data-punto]')];
  const actual = () => Math.round(pista.scrollLeft / pista.clientWidth);
  const ir = (i) => pista.scrollTo({ left: i * pista.clientWidth, behavior: 'smooth' });
  pista.addEventListener('scroll', () => { const i = actual(); puntos.forEach((p, k) => p.classList.toggle('on', k === i)); }, { passive: true });
  puntos.forEach((p) => p.onclick = () => ir(+p.dataset.punto));
  const quieto = matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (banners.length > 1 && !quieto) {
    timer = setInterval(() => {
      if (!document.body.contains(pista)) { clearInterval(timer); return; }
      if (document.hidden || document.body.classList.contains('sin-scroll')) return;
      ir((actual() + 1) % banners.length);
    }, 5000);
    ['touchstart', 'pointerdown'].forEach((ev) => pista.addEventListener(ev, () => clearInterval(timer), { once: true, passive: true }));
  }
}
