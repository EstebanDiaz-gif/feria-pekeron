// Inicio: buscador, categorías, destacados, cerca tuyo, recientes y tiendas.
import { esc } from '../lib/util.js';
import { ico } from '../lib/iconos.js';
import { CATEGORIAS } from '../datos/catalogo.js';
import { linkGestion } from '../config.js';
import { grilla, seccion, tarjetaTienda, vacio } from './componentes.js';
import { fijarBusqueda } from './buscar.js';

export async function vista(root, _r, ctx) {
  const { d, zona } = ctx;
  const [destacadas, cerca, recientes, tiendas] = await Promise.all([
    d.listar({ soloDestacadas: true, limite: 8 }),
    zona.localidad ? d.listar({ localidad: zona.localidad, limite: 8 }) : zona.provincia ? d.listar({ provincia: zona.provincia, limite: 8 }) : Promise.resolve([]),
    d.listar({ limite: 12 }),
    d.listarTiendas(),
  ]);
  const lugar = zona.localidad || zona.provincia;
  const hayAlgo = recientes.length > 0;

  root.innerHTML = `
  <section class="hero">
    <h1>Comprá y vendé en tu zona</h1>
    <p>Publicar es gratis y sin comisiones. Hablás directo con quien vende.</p>
    <form class="buscador" role="search" data-buscar>
      ${ico('buscar')}
      <input type="search" name="q" placeholder="¿Qué estás buscando?" aria-label="Buscar productos" autocomplete="off" enterkeyhint="search">
      <button class="btn btn-amarillo" type="submit">Buscar</button>
    </form>
  </section>

  <section class="seccion">
    <div class="seccion-cab"><h2>Categorías</h2></div>
    <div class="cats">${CATEGORIAS.map((c) => `<a class="cat" href="#categoria-${c.id}"><span class="cat-ico">${ico(c.icono)}</span><span>${esc(c.nombre)}</span></a>`).join('')}</div>
  </section>

  <button class="banner-app" data-instalar>
    <img src="icons/icon-192.png" alt="" width="44" height="44">
    <span><strong>Descargá la app de la Feria</strong><span>Gratis y ocupa poco espacio</span></span>
    <span class="btn btn-amarillo btn-chico">Descargar</span>
  </button>

  ${destacadas.length ? seccion('Destacados', grilla(destacadas)) : ''}

  ${lugar && cerca.length ? seccion(`Cerca tuyo · ${lugar}`, grilla(cerca), '<a href="#buscar" data-cerca>Ver todo</a>') : ''}

  ${hayAlgo ? seccion('Publicado recientemente', grilla(recientes), '<a href="#buscar">Ver todo</a>') : seccion('Publicado recientemente',
    vacio('Todavía no hay publicaciones', 'La Feria recién arranca. Podés ser de los primeros en publicar.', '<a class="btn btn-pri" href="#publicar">Publicar gratis</a>'))}

  ${seccion('Tiendas', tiendas.length
    ? `<div class="lista-tiendas">${tiendas.slice(0, 6).map(tarjetaTienda).join('')}</div>`
    : vacio('Todavía no hay tiendas', 'Los comercios pueden armar su tienda con catálogo y WhatsApp, gratis.', '<a class="btn btn-sec" href="#mi-tienda">Crear mi tienda</a>'),
    tiendas.length ? '<a href="#tiendas">Ver todas</a>' : '')}

  <section class="cta-vender">
    <div><strong>¿Tenés algo para vender?</strong><span>Sacale una foto y publicalo en un minuto.</span></div>
    <a class="btn btn-amarillo" href="#publicar">${ico('mas')} Publicar gratis</a>
  </section>

  <footer class="pie">
    <a href="${esc(linkGestion)}" rel="noopener">¿Tenés un negocio? Conocé <b>Pekerón Gestión</b>: stock, ventas y caja desde el celular.</a>
    <span>Feria Pekerón · Tucumán, Argentina</span>
  </footer>`;

  root.querySelector('[data-buscar]').onsubmit = (e) => {
    e.preventDefault();
    fijarBusqueda({ q: new FormData(e.target).get('q') || '' });
    ctx.ir('buscar');
  };
  const vc = root.querySelector('[data-cerca]');
  if (vc) vc.onclick = (e) => { e.preventDefault(); fijarBusqueda({ q: '', zona: true }); ctx.ir('buscar'); };
}
