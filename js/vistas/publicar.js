// Crear y editar publicación.
import { esc, srcSeguro } from '../lib/util.js';
import { ico } from '../lib/iconos.js';
import { toast, cargandoBtn } from '../lib/dom.js';
import { comprimir, pesoKB } from '../lib/fotos.js';
import { fotos as CFG } from '../config.js';
import { CATEGORIAS, categoria } from '../datos/catalogo.js';
import { camposUbicacion, enlazarUbicacion } from './zona.js';

const RAPIDOS = { talles: ['XS', 'S', 'M', 'L', 'XL', 'XXL', '36', '37', '38', '39', '40', '41', '42', '43'], colores: ['Negro', 'Blanco', 'Gris', 'Azul', 'Rojo', 'Verde', 'Beige', 'Rosa'] };
// Firestore guarda hasta 1 MB por documento: mientras las fotos vayan adentro, se limita el total.
const MAX_KB_FIREBASE = 820;

export async function vista(root, r, ctx) {
  const u = ctx.usuario;
  let p = null;
  if (r.nombre === 'editar') {
    p = await ctx.d.publicacion(r.param);
    if (!p || p.uid !== u.uid) { root.innerHTML = '<div class="vacio"><strong>No podés editar esta publicación</strong><a class="btn btn-pri" href="#panel">Ir al panel</a></div>'; return; }
  }
  const v = p || { estado: 'nuevo', disponibilidad: 'disponible', provincia: u.provincia, localidad: u.localidad, barrio: u.barrio, variantes: {} };
  const st = { fotos: (v.fotos || []).map(srcSeguro).filter(Boolean), talles: [...((v.variantes || {}).talles || [])], colores: [...((v.variantes || {}).colores || [])] };
  const sinWa = !u.whatsapp;

  root.innerHTML = `
  <div class="barra-vista"><a class="btn-ico" href="${p ? '#mis-productos' : '#panel'}" aria-label="Volver">${ico('atras')}</a><h1>${p ? 'Editar publicación' : 'Crear publicación'}</h1></div>
  ${sinWa ? `<div class="nota nota-aviso">${ico('info')}<span>No cargaste tu WhatsApp: los compradores no van a poder escribirte. <a href="#perfil">Cargalo en tu perfil</a>.</span></div>` : ''}
  <form class="form form-publicar" data-f novalidate>
    <section class="bloque">
      <h2>Fotos <span class="opc">hasta ${CFG.max} · la primera es la principal</span></h2>
      <div class="fotos-edit" data-fotos></div>
      <p class="ayuda" data-peso></p>
    </section>

    <section class="bloque">
      <h2>Producto</h2>
      <div class="campo"><label for="p-tit">Nombre del producto</label>
        <input id="p-tit" name="titulo" required maxlength="80" value="${esc(v.titulo || '')}" placeholder="Ej.: Zapatillas urbanas blancas">
        <small class="ayuda">Marca, modelo y lo más importante. <span data-cuenta>0</span>/80</small></div>
      <div class="dos-col">
        <div class="campo"><label for="p-cat">Categoría</label>
          <select id="p-cat" name="categoria" required><option value="">Elegí…</option>
          ${CATEGORIAS.map((c) => `<option value="${c.id}" ${v.categoria === c.id ? 'selected' : ''}>${esc(c.nombre)}</option>`).join('')}</select></div>
        <div class="campo"><label for="p-sub">Subcategoría</label><select id="p-sub" name="subcategoria" required></select></div>
      </div>
      <fieldset class="segmento"><legend>Estado</legend>
        <label><input type="radio" name="estado" value="nuevo" ${v.estado !== 'usado' ? 'checked' : ''}><span>Nuevo</span></label>
        <label><input type="radio" name="estado" value="usado" ${v.estado === 'usado' ? 'checked' : ''}><span>Usado</span></label>
      </fieldset>
      <div class="dos-col">
        <div class="campo"><label for="p-precio">Precio</label>
          <div class="con-prefijo"><span>$</span><input id="p-precio" name="precio" inputmode="numeric" required value="${v.precio ? esc(v.precio) : ''}" placeholder="0"></div></div>
        <div class="campo"><label for="p-stock">Cantidad <span class="opc">(opcional)</span></label>
          <input id="p-stock" name="stock" type="number" min="1" max="9999" inputmode="numeric" value="${v.stock ? esc(v.stock) : ''}" placeholder="—"></div>
      </div>
      <div class="campo"><label for="p-desc">Descripción</label>
        <textarea id="p-desc" name="descripcion" rows="5" maxlength="2000" placeholder="Contá cómo es, medidas, detalles, si hacés envíos…">${esc(v.descripcion || '')}</textarea></div>
    </section>

    <section class="bloque" data-variantes>
      <h2>Variantes <span class="opc">(opcional)</span></h2>
      <p class="ayuda">Si tenés el producto en varios talles o colores, cargalos acá.</p>
      ${['talles', 'colores'].map((k) => `<div class="campo">
        <label for="v-${k}">${k === 'talles' ? 'Talles' : 'Colores'}</label>
        <div class="chip-input"><input id="v-${k}" data-nuevo="${k}" maxlength="20" placeholder="${k === 'talles' ? 'Ej.: M o 40' : 'Ej.: Negro'}" enterkeyhint="done">
          <button type="button" class="btn btn-sec btn-chico" data-agregar="${k}">Agregar</button></div>
        <div class="chips-elegidos" data-lista="${k}"></div>
        <div class="rapidos">${RAPIDOS[k].map((x) => `<button type="button" class="chip chip-mini" data-rapido="${k}" data-val="${esc(x)}">+ ${esc(x)}</button>`).join('')}</div>
      </div>`).join('')}
    </section>

    <section class="bloque">
      <h2>Ubicación</h2>
      ${camposUbicacion(v)}
    </section>

    <section class="bloque">
      <h2>Disponibilidad</h2>
      <fieldset class="segmento"><legend class="sr">Disponibilidad</legend>
        <label><input type="radio" name="disponibilidad" value="disponible" ${v.disponibilidad !== 'pausada' && v.disponibilidad !== 'vendida' ? 'checked' : ''}><span>Publicar ahora</span></label>
        <label><input type="radio" name="disponibilidad" value="pausada" ${v.disponibilidad === 'pausada' ? 'checked' : ''}><span>Guardar pausada</span></label>
        ${p ? `<label><input type="radio" name="disponibilidad" value="vendida" ${v.disponibilidad === 'vendida' ? 'checked' : ''}><span>Vendida</span></label>` : ''}
      </fieldset>
    </section>

    <p class="error" data-err role="alert"></p>
    <div class="barra-accion barra-form"><button class="btn btn-pri ancho btn-grande" type="submit">${p ? 'Guardar cambios' : 'Publicar gratis'}</button></div>
  </form>`;

  enlazarUbicacion(root);
  const f = root.querySelector('[data-f]'), err = root.querySelector('[data-err]');
  const selCat = f.categoria, selSub = f.subcategoria;

  function pintarSubs(valor) {
    const c = categoria(selCat.value);
    selSub.innerHTML = c ? c.subs.map((s) => `<option ${s === valor ? 'selected' : ''}>${esc(s)}</option>`).join('') : '<option value="">Elegí la categoría</option>';
    selSub.disabled = !c;
  }
  selCat.onchange = () => pintarSubs('');
  pintarSubs(v.subcategoria);

  const cuenta = root.querySelector('[data-cuenta]');
  const contar = () => { cuenta.textContent = f.titulo.value.length; };
  f.titulo.oninput = contar; contar();

  // ---- Fotos ----
  const boxF = root.querySelector('[data-fotos]'), peso = root.querySelector('[data-peso]');
  function pintarFotos() {
    boxF.innerHTML = st.fotos.map((s, i) => `<div class="foto-mini">
        <img src="${s}" alt="Foto ${i + 1}">${i === 0 ? '<span class="sello">Principal</span>' : ''}
        <div class="foto-acc">
          ${i > 0 ? `<button type="button" class="btn-ico chico" data-prin="${i}" aria-label="Usar como principal">${ico('check')}</button>` : ''}
          <button type="button" class="btn-ico chico" data-quitar="${i}" aria-label="Quitar foto ${i + 1}">${ico('cerrar')}</button></div></div>`).join('')
      + (st.fotos.length < CFG.max ? `<label class="foto-agregar">${ico('camara')}<span>${st.fotos.length ? 'Agregar' : 'Agregar fotos'}</span>
          <input type="file" accept="image/*" multiple data-archivo class="sr"></label>` : '');
    const kb = st.fotos.reduce((a, s) => a + pesoKB(s), 0);
    peso.textContent = st.fotos.length ? `${st.fotos.length} ${st.fotos.length === 1 ? 'foto' : 'fotos'} · ${kb} KB${ctx.d.modo === 'firebase' ? ` de ${MAX_KB_FIREBASE} KB` : ''}` : 'Las publicaciones con fotos se venden mucho más.';
    const inp = boxF.querySelector('[data-archivo]');
    if (inp) inp.onchange = async () => {
      const lista = [...inp.files].slice(0, CFG.max - st.fotos.length);
      peso.textContent = 'Preparando fotos…';
      for (const file of lista) {
        try { st.fotos.push(await comprimir(file)); } catch (e) { toast(e.message, 'error'); }
      }
      pintarFotos();
    };
    boxF.querySelectorAll('[data-quitar]').forEach((b) => b.onclick = () => { st.fotos.splice(+b.dataset.quitar, 1); pintarFotos(); });
    boxF.querySelectorAll('[data-prin]').forEach((b) => b.onclick = () => { const [x] = st.fotos.splice(+b.dataset.prin, 1); st.fotos.unshift(x); pintarFotos(); });
  }
  pintarFotos();

  // ---- Variantes ----
  function pintarVar(k) {
    const box = root.querySelector(`[data-lista="${k}"]`);
    box.innerHTML = st[k].map((x, i) => `<span class="chip-sel">${esc(x)}<button type="button" data-sacar="${k}" data-i="${i}" aria-label="Quitar ${esc(x)}">${ico('cerrar')}</button></span>`).join('');
    box.querySelectorAll('[data-sacar]').forEach((b) => b.onclick = () => { st[k].splice(+b.dataset.i, 1); pintarVar(k); });
  }
  const agregar = (k, val) => {
    const x = String(val || '').trim().slice(0, 20);
    if (!x || st[k].some((y) => y.toLowerCase() === x.toLowerCase()) || st[k].length >= 30) return;
    st[k].push(x); pintarVar(k);
  };
  ['talles', 'colores'].forEach((k) => {
    pintarVar(k);
    const inp = root.querySelector(`[data-nuevo="${k}"]`);
    root.querySelector(`[data-agregar="${k}"]`).onclick = () => { agregar(k, inp.value); inp.value = ''; inp.focus(); };
    inp.onkeydown = (e) => { if (e.key === 'Enter') { e.preventDefault(); agregar(k, inp.value); inp.value = ''; } };
  });
  root.querySelectorAll('[data-rapido]').forEach((b) => b.onclick = () => agregar(b.dataset.rapido, b.dataset.val));

  // ---- Guardar ----
  f.onsubmit = async (e) => {
    e.preventDefault(); err.textContent = '';
    const d = Object.fromEntries(new FormData(f));
    const precio = Number(String(d.precio || '').replace(/\./g, '').replace(',', '.'));
    const falta = (m, el) => { err.textContent = m; if (el) el.focus(); };
    if (String(d.titulo || '').trim().length < 3) return falta('Escribí el nombre del producto.', f.titulo);
    if (!d.categoria) return falta('Elegí una categoría.', selCat);
    if (!Number.isFinite(precio) || precio <= 0) return falta('Poné un precio mayor a cero.', f.precio);
    if (!String(d.localidad || '').trim()) return falta('Elegí la localidad.', f.localidad);
    if (ctx.d.modo === 'firebase' && st.fotos.reduce((a, s) => a + pesoKB(s), 0) > MAX_KB_FIREBASE) return falta('Las fotos pesan demasiado: sacá alguna.');
    const datos = {
      id: p ? p.id : undefined,
      titulo: d.titulo.trim(), descripcion: String(d.descripcion || '').trim(),
      precio: Math.round(precio), moneda: 'ARS',
      categoria: d.categoria, subcategoria: d.subcategoria || '',
      estado: d.estado === 'usado' ? 'usado' : 'nuevo',
      stock: d.stock ? Math.max(1, Math.min(9999, parseInt(d.stock, 10) || 1)) : null,
      variantes: { talles: st.talles, colores: st.colores },
      fotos: st.fotos,
      provincia: d.provincia, localidad: d.localidad.trim(), barrio: String(d.barrio || '').trim(),
      disponibilidad: ['disponible', 'pausada', 'vendida'].includes(d.disponibilidad) ? d.disponibilidad : 'disponible',
    };
    if (!p) delete datos.id;
    const b = f.querySelector('[type=submit]'); cargandoBtn(b, true, 'Guardando…');
    try {
      const id = await ctx.d.guardarPublicacion(datos);
      toast(p ? 'Cambios guardados.' : datos.disponibilidad === 'disponible' ? '¡Publicado!' : 'Guardada como pausada.');
      ctx.ir('producto-' + id);
    } catch (x) { err.textContent = x.message; cargandoBtn(b, false); }
  };
}
