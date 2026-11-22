// Configuración del perfil.
import { esc, waNumero } from '../lib/util.js';
import { ico } from '../lib/iconos.js';
import { toast, cargandoBtn } from '../lib/dom.js';
import { camposUbicacion, enlazarUbicacion } from './zona.js';

export async function vista(root, _r, ctx) {
  const u = ctx.usuario;
  root.innerHTML = `
  <div class="barra-vista"><a class="btn-ico" href="#panel" aria-label="Volver al panel">${ico('atras')}</a><h1>Configuración del perfil</h1></div>
  <form class="form" data-f novalidate>
    <section class="bloque">
      <fieldset class="segmento"><legend>Tipo de cuenta</legend>
        <label><input type="radio" name="tipo" value="particular" ${u.tipo !== 'comercio' ? 'checked' : ''}><span>Particular</span></label>
        <label><input type="radio" name="tipo" value="comercio" ${u.tipo === 'comercio' ? 'checked' : ''}><span>Comerciante</span></label>
      </fieldset>
      <div class="campo"><label for="pf-nombre">Nombre</label><input id="pf-nombre" name="nombre" required maxlength="60" value="${esc(u.nombre || '')}"></div>
      <div class="campo"><label for="pf-wa">WhatsApp</label><input id="pf-wa" name="whatsapp" type="tel" inputmode="tel" required value="${esc(u.whatsapp || '')}" placeholder="381 512 3456">
        <small class="ayuda">Es donde te escriben por tus publicaciones particulares. La tienda puede tener otro número.</small></div>
    </section>
    <section class="bloque"><h2>Ubicación</h2>${camposUbicacion(u)}</section>
    <p class="error" data-err role="alert"></p>
    <button class="btn btn-pri ancho btn-grande" type="submit">Guardar</button>
  </form>`;
  enlazarUbicacion(root);
  const f = root.querySelector('[data-f]'), err = root.querySelector('[data-err]');
  f.onsubmit = async (e) => {
    e.preventDefault(); err.textContent = '';
    const d = Object.fromEntries(new FormData(f));
    if (String(d.nombre || '').trim().length < 2) { err.textContent = 'Escribí tu nombre.'; return; }
    if (!waNumero(d.whatsapp)) { err.textContent = 'El WhatsApp no parece válido. Ej.: 381 512 3456'; return; }
    const b = f.querySelector('[type=submit]'); cargandoBtn(b, true);
    try {
      await ctx.d.guardarPerfil({ nombre: d.nombre.trim(), tipo: d.tipo, whatsapp: d.whatsapp.trim(), provincia: d.provincia, localidad: String(d.localidad || '').trim(), barrio: String(d.barrio || '').trim() });
      toast('Perfil guardado.'); ctx.ir('panel');
    } catch (x) { err.textContent = x.message; cargandoBtn(b, false); }
  };
}
