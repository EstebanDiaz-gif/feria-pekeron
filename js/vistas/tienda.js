// Página pública de una tienda: portada, perfil, datos de contacto y catálogo.
import { esc, srcSeguro, waLink } from '../lib/util.js';
import { ico } from '../lib/iconos.js';
import { toast } from '../lib/dom.js';
import { avatar, grilla, vacio } from './componentes.js';

export async function vista(root, r, ctx) {
  const t = await ctx.d.tienda(r.param);
  if (!t) { root.innerHTML = vacio('No encontramos esta tienda', 'Revisá que el link esté bien escrito.', '<a class="btn btn-pri" href="#tiendas">Ver tiendas</a>'); return; }
  const prods = await ctx.d.listar({ tienda: t.slug });
  const mia = ctx.usuario && ctx.usuario.uid === t.uid;
  const portada = srcSeguro(t.portada);
  const url = location.href.split('#')[0] + '#tienda-' + t.slug;
  const wa = waLink(t.whatsapp, `Hola ${t.nombre}! Vi tu tienda en Feria Pekerón.`);
  const ig = String(t.instagram || '').replace(/^@/, '').replace(/[^A-Za-z0-9._]/g, '');
  const lugar = [t.direccion, t.localidad, t.provincia].filter(Boolean).join(', ');

  root.innerHTML = `
    <div class="tienda-portada" ${portada ? '' : 'data-sin'}>${portada ? `<img src="${portada}" alt="">` : ''}
      <button class="btn-ico flotante" data-atras aria-label="Volver">${ico('atras')}</button></div>
    <div class="tienda-cab">
      ${avatar(t, 'avatar-xl')}
      <h1>${esc(t.nombre)}</h1>
      ${lugar ? `<p class="txt-sec">${ico('ubicacion')} ${esc(lugar)}</p>` : ''}
      ${t.descripcion ? `<p class="tienda-desc">${esc(t.descripcion)}</p>` : ''}
      <div class="fila-btns">
        ${wa ? `<a class="btn btn-wa" href="${esc(wa)}" target="_blank" rel="noopener">${ico('whatsapp')} WhatsApp</a>` : ''}
        ${ig ? `<a class="btn btn-sec" href="https://instagram.com/${esc(ig)}" target="_blank" rel="noopener">${ico('instagram')} Instagram</a>` : ''}
        <button class="btn btn-sec" data-link>${ico('compartir')} Copiar link</button>
      </div>
      ${mia ? `<p class="nota">${ico('info')} Es tu tienda. <a href="#mi-tienda">Editar datos</a> · <a href="#publicar">Publicar producto</a></p>` : ''}
    </div>
    <section class="seccion"><div class="seccion-cab"><h2>Catálogo</h2><span class="txt-sec">${prods.length} ${prods.length === 1 ? 'producto' : 'productos'}</span></div>
      ${prods.length ? grilla(prods, { mostrarTienda: false }) : vacio('Esta tienda todavía no publicó productos', mia ? 'Publicá tu primer producto y aparece acá.' : 'Volvé a mirar en unos días.', mia ? '<a class="btn btn-pri" href="#publicar">Publicar</a>' : '')}
    </section>`;

  root.querySelector('[data-atras]').onclick = () => { if (history.length > 1) history.back(); else ctx.ir('tiendas'); };
  root.querySelector('[data-link]').onclick = async () => {
    try { await navigator.clipboard.writeText(url); toast('Link de la tienda copiado.'); }
    catch { toast('No se pudo copiar en este navegador.', 'error'); }
  };
}
