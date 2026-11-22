// Listado de tiendas.
import { esc } from '../lib/util.js';
import { tarjetaTienda, vacio } from './componentes.js';

export async function vista(root, _r, ctx) {
  const lugar = ctx.zona.localidad;
  const [enZona, todas] = await Promise.all([lugar ? ctx.d.listarTiendas({ localidad: lugar }) : [], ctx.d.listarTiendas()]);
  const resto = todas.filter((t) => !enZona.some((z) => z.slug === t.slug));
  root.innerHTML = `
    <div class="cab-vista"><h1>Tiendas</h1><p class="txt-sec">Comercios y emprendedores con su catálogo en la Feria.</p></div>
    ${todas.length ? `
      ${enZona.length ? `<section class="seccion"><div class="seccion-cab"><h2>En ${esc(lugar)}</h2></div><div class="lista-tiendas">${enZona.map(tarjetaTienda).join('')}</div></section>` : ''}
      ${resto.length ? `<section class="seccion"><div class="seccion-cab"><h2>${enZona.length ? 'Otras zonas' : 'Todas'}</h2></div><div class="lista-tiendas">${resto.map(tarjetaTienda).join('')}</div></section>` : ''}`
    : vacio('Todavía no hay tiendas', 'Si tenés un comercio o emprendimiento, armá tu tienda gratis: catálogo, portada y WhatsApp.', '<a class="btn btn-pri" href="#mi-tienda">Crear mi tienda</a>')}`;
}
