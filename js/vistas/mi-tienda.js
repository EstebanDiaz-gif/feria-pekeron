// Mi tienda: nombre comercial, logo, portada, descripción, ubicación, WhatsApp y catálogo.
import { esc, srcSeguro, slug as aSlug, waNumero } from '../lib/util.js';
import { ico } from '../lib/iconos.js';
import { toast, cargandoBtn } from '../lib/dom.js';
import { comprimir } from '../lib/fotos.js';
import { camposUbicacion, enlazarUbicacion } from './zona.js';
import { foto } from './componentes.js';

export async function vista(root, _r, ctx) {
  const u = ctx.usuario;
  const t = await ctx.d.tiendaDeUsuario(u.uid);
  const prods = await ctx.d.listar({ uid: u.uid, incluirOcultas: true });
  const v = t || { nombre: u.tipo === 'comercio' ? u.nombre : '', whatsapp: u.whatsapp, provincia: u.provincia, localidad: u.localidad };
  const img = { logo: srcSeguro(v.logo), portada: srcSeguro(v.portada) };
  const base = location.href.split('#')[0];

  root.innerHTML = `
  <div class="barra-vista"><a class="btn-ico" href="#panel" aria-label="Volver al panel">${ico('atras')}</a><h1>${t ? 'Mi tienda' : 'Crear mi tienda'}</h1>
    ${t ? `<a class="btn btn-sec btn-chico" href="#tienda-${esc(t.slug)}">Ver</a>` : ''}</div>
  ${t ? '' : '<p class="txt-sec pad">Tu página propia en la Feria, con todos tus productos juntos y un link para compartir en tus redes. Es gratis.</p>'}
  <form class="form" data-f novalidate>
    <section class="bloque bloque-imagenes">
      <label class="portada-edit" data-portada>${img.portada ? `<img src="${img.portada}" alt="Portada">` : `<span>${ico('foto')} Agregar portada</span>`}
        <input type="file" accept="image/*" class="sr" data-img="portada" aria-label="Elegir portada"></label>
      <label class="logo-edit" data-logo>${img.logo ? `<img src="${img.logo}" alt="Logo">` : `<span>${ico('camara')}</span>`}
        <input type="file" accept="image/*" class="sr" data-img="logo" aria-label="Elegir imagen de perfil o logo"></label>
      <p class="ayuda centro">Tocá la portada o el círculo para cambiar las imágenes.</p>
    </section>
    <section class="bloque">
      <div class="campo"><label for="t-nombre">Nombre comercial</label>
        <input id="t-nombre" name="nombre" required maxlength="50" value="${esc(v.nombre || '')}" placeholder="Ej.: Zapatillería Don Pedro">
        <small class="ayuda" data-link>${t ? `Tu link: ${esc(base)}#tienda-${esc(t.slug)}` : ''}</small></div>
      <div class="campo"><label for="t-desc">Descripción</label>
        <textarea id="t-desc" name="descripcion" rows="4" maxlength="500" placeholder="Qué vendés, horarios, si hacés envíos…">${esc(v.descripcion || '')}</textarea></div>
    </section>
    <section class="bloque">
      <h2>Contacto</h2>
      <div class="campo"><label for="t-wa">WhatsApp de la tienda</label>
        <input id="t-wa" name="whatsapp" type="tel" inputmode="tel" required value="${esc(v.whatsapp || '')}" placeholder="381 512 3456">
        <small class="ayuda">Con código de área, sin 0 ni 15.</small></div>
      <div class="campo"><label for="t-ig">Instagram <span class="opc">(opcional)</span></label>
        <input id="t-ig" name="instagram" value="${esc(v.instagram || '')}" maxlength="40" placeholder="@tutienda" autocapitalize="off"></div>
    </section>
    <section class="bloque">
      <h2>Ubicación</h2>
      ${camposUbicacion(v, { barrio: false })}
      <div class="campo"><label for="t-dir">Dirección <span class="opc">(opcional: si atendés al público)</span></label>
        <input id="t-dir" name="direccion" value="${esc(v.direccion || '')}" maxlength="80" placeholder="Ej.: San Martín 1200"></div>
    </section>
    <p class="error" data-err role="alert"></p>
    <button class="btn btn-pri ancho btn-grande" type="submit">${t ? 'Guardar cambios' : 'Crear mi tienda'}</button>
  </form>

  <section class="seccion">
    <div class="seccion-cab"><h2>Catálogo</h2><a href="#publicar">+ Agregar producto</a></div>
    ${prods.length ? `<ul class="catalogo-mini">${prods.map((p) => `<li><a href="#editar-${esc(p.id)}">${foto(p)}<span>${esc(p.titulo)}</span></a></li>`).join('')}</ul>
      <p class="ayuda">Todas tus publicaciones aparecen en tu tienda. Las pausadas solo las ves vos.</p>`
    : '<p class="txt-sec">Cuando publiques productos, aparecen acá y en tu tienda.</p>'}
  </section>`;

  enlazarUbicacion(root);
  const f = root.querySelector('[data-f]'), err = root.querySelector('[data-err]');
  if (!t) {
    const lk = root.querySelector('[data-link]');
    const act = () => { const s = aSlug(f.nombre.value); lk.textContent = s ? `Tu link va a ser: ${base}#tienda-${s}` : ''; };
    f.nombre.addEventListener('input', act); act();
  }
  root.querySelectorAll('[data-img]').forEach((inp) => inp.onchange = async () => {
    const k = inp.dataset.img, file = inp.files[0];
    if (!file) return;
    try {
      img[k] = await comprimir(file, k === 'logo' ? 400 : 1200, 0.75);
      const box = root.querySelector(k === 'logo' ? '[data-logo]' : '[data-portada]');
      const prev = box.querySelector('img, span');
      const im = document.createElement('img'); im.src = img[k]; im.alt = k === 'logo' ? 'Logo' : 'Portada';
      prev.replaceWith(im);
    } catch (e) { toast(e.message, 'error'); }
  });
  f.onsubmit = async (e) => {
    e.preventDefault(); err.textContent = '';
    const d = Object.fromEntries(new FormData(f));
    d.nombre = String(d.nombre || '').trim();
    if (aSlug(d.nombre).length < 3) { err.textContent = 'Escribí el nombre de la tienda (al menos 3 letras).'; f.nombre.focus(); return; }
    if (!waNumero(d.whatsapp)) { err.textContent = 'El WhatsApp no parece válido. Ej.: 381 512 3456'; f.whatsapp.focus(); return; }
    if (!String(d.localidad || '').trim()) { err.textContent = 'Elegí la localidad.'; f.localidad.focus(); return; }
    const b = f.querySelector('[type=submit]'); cargandoBtn(b, true);
    try {
      const nueva = await ctx.d.guardarTienda({
        nombre: d.nombre, descripcion: String(d.descripcion || '').trim(),
        whatsapp: d.whatsapp.trim(), instagram: String(d.instagram || '').trim(),
        provincia: d.provincia, localidad: d.localidad.trim(), direccion: String(d.direccion || '').trim(),
        logo: img.logo || '', portada: img.portada || '',
      });
      toast(t ? 'Tienda actualizada.' : '¡Tu tienda está lista!');
      ctx.ir('tienda-' + nueva.slug);
    } catch (x) { err.textContent = x.message; cargandoBtn(b, false); }
  };
}
