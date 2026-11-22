// Registro e ingreso. Dos tipos de usuario: particular y comerciante.
// En modo prueba local NO hay cuentas reales: se crea un perfil de prueba que vive solo en este navegador.
import { esc, waNumero } from '../lib/util.js';
import { ico } from '../lib/iconos.js';
import { toast, cargandoBtn } from '../lib/dom.js';
import { camposUbicacion, enlazarUbicacion } from './zona.js';

const avisoLocal = `<div class="nota nota-aviso">${ico('info')}<span><b>Modo prueba, sin cuentas reales.</b> Todavía no está conectado el servidor,
  así que no se pide correo ni contraseña: el perfil se guarda solo en este navegador para que puedas recorrer la app.</span></div>`;

export async function vista(root, r, ctx) {
  if (ctx.usuario) { ctx.ir('panel'); return; }
  if (r.nombre === 'registrarse') return registro(root, ctx);
  return ingreso(root, ctx);
}

function destino(ctx) { const v = ctx.volverA; ctx.volverA = ''; return v || 'panel'; }

async function ingreso(root, ctx) {
  const local = ctx.d.modo === 'local';
  if (local) {
    const perfiles = await ctx.d.auth.perfilesGuardados();
    root.innerHTML = `<div class="form-vista">
      <h1>Ingresar</h1>
      ${avisoLocal}
      ${perfiles.length ? `<p class="txt-sec">Perfiles de prueba guardados en este navegador:</p>
        <div class="lista-perfiles">${perfiles.map((p) => `<button class="perfil-btn" data-uid="${esc(p.uid)}">
          <span class="avatar" aria-hidden="true">${esc(p.nombre.charAt(0).toUpperCase())}</span>
          <span><strong>${esc(p.nombre)}</strong><span class="txt-sec">${p.tipo === 'comercio' ? 'Comerciante' : 'Particular'}</span></span>${ico('derecha', 'chev')}</button>`).join('')}</div>`
        : '<p class="txt-sec">Todavía no creaste ningún perfil de prueba.</p>'}
      <a class="btn btn-pri ancho" href="#registrarse">Crear perfil de prueba</a>
    </div>`;
    root.querySelectorAll('[data-uid]').forEach((b) => b.onclick = async () => {
      await ctx.d.auth.usarPerfil(b.dataset.uid);
      ctx.ir(destino(ctx));
    });
    return;
  }
  root.innerHTML = `<div class="form-vista">
    <h1>Ingresar</h1>
    <p class="txt-sec">Para publicar, armar tu tienda y ver tus productos.</p>
    <form class="form" data-f novalidate>
      <div class="campo"><label for="c-email">Correo</label><input id="c-email" name="email" type="email" required autocomplete="email" inputmode="email"></div>
      <div class="campo"><label for="c-clave">Contraseña</label><input id="c-clave" name="clave" type="password" required autocomplete="current-password" minlength="6"></div>
      <p class="error" data-err role="alert"></p>
      <button class="btn btn-pri ancho" type="submit">Ingresar</button>
      <button class="btn-link" type="button" data-olvide>Me olvidé la contraseña</button>
    </form>
    <p class="centro">¿No tenés cuenta? <a href="#registrarse">Registrate gratis</a></p>
  </div>`;
  const f = root.querySelector('[data-f]'), err = root.querySelector('[data-err]');
  f.onsubmit = async (e) => {
    e.preventDefault(); err.textContent = '';
    const d = Object.fromEntries(new FormData(f));
    if (!d.email || !d.clave) { err.textContent = 'Completá el correo y la contraseña.'; return; }
    const b = f.querySelector('[type=submit]'); cargandoBtn(b, true, 'Ingresando…');
    try { await ctx.d.auth.ingresar(d); ctx.ir(destino(ctx)); }
    catch (x) { err.textContent = x.message; cargandoBtn(b, false); }
  };
  root.querySelector('[data-olvide]').onclick = async () => {
    const email = f.email.value.trim();
    if (!email) { err.textContent = 'Escribí tu correo y tocá de nuevo "Me olvidé la contraseña".'; return; }
    try { await ctx.d.auth.recuperar(email); toast('Te mandamos un correo para cambiar la contraseña.'); }
    catch (x) { err.textContent = x.message; }
  };
}

function registro(root, ctx) {
  const local = ctx.d.modo === 'local';
  root.innerHTML = `<div class="form-vista">
    <h1>${local ? 'Crear perfil de prueba' : 'Crear cuenta'}</h1>
    ${local ? avisoLocal : '<p class="txt-sec">Es gratis. Publicar no tiene costo ni comisiones.</p>'}
    <form class="form" data-f novalidate>
      <fieldset class="tipo-usuario"><legend>¿Cómo vas a usar la Feria?</legend>
        <label class="opcion-tipo"><input type="radio" name="tipo" value="particular" checked>
          <span>${ico('usuario')}<strong>Particular</strong><small>Compro o vendo cosas mías, nuevas o usadas</small></span></label>
        <label class="opcion-tipo"><input type="radio" name="tipo" value="comercio">
          <span>${ico('tienda')}<strong>Comerciante</strong><small>Tengo un negocio o emprendimiento y quiero mi tienda</small></span></label>
      </fieldset>
      <div class="campo"><label for="r-nombre" data-lbl-nombre>Tu nombre</label><input id="r-nombre" name="nombre" required maxlength="60" autocomplete="name"></div>
      ${local ? '' : `<div class="campo"><label for="r-email">Correo</label><input id="r-email" name="email" type="email" required autocomplete="email" inputmode="email"></div>
      <div class="campo"><label for="r-clave">Contraseña</label><input id="r-clave" name="clave" type="password" required minlength="6" autocomplete="new-password"><small class="ayuda">Mínimo 6 caracteres.</small></div>`}
      <div class="campo"><label for="r-wa">WhatsApp</label><input id="r-wa" name="whatsapp" type="tel" inputmode="tel" required placeholder="381 512 3456" autocomplete="tel">
        <small class="ayuda">Con código de área, sin 0 ni 15. Los compradores te escriben acá.</small></div>
      ${camposUbicacion(ctx.zona)}
      <p class="error" data-err role="alert"></p>
      <button class="btn btn-pri ancho" type="submit">${local ? 'Crear perfil y entrar' : 'Crear cuenta'}</button>
    </form>
    <p class="centro">¿Ya ${local ? 'creaste un perfil' : 'tenés cuenta'}? <a href="#ingresar">Ingresar</a></p>
  </div>`;
  enlazarUbicacion(root);
  const f = root.querySelector('[data-f]'), err = root.querySelector('[data-err]');
  const lbl = root.querySelector('[data-lbl-nombre]');
  f.querySelectorAll('[name=tipo]').forEach((x) => x.onchange = () => { lbl.textContent = f.tipo.value === 'comercio' ? 'Nombre del negocio' : 'Tu nombre'; });
  f.onsubmit = async (e) => {
    e.preventDefault(); err.textContent = '';
    const d = Object.fromEntries(new FormData(f));
    d.nombre = String(d.nombre || '').trim();
    if (d.nombre.length < 2) { err.textContent = 'Escribí tu nombre.'; f.nombre.focus(); return; }
    if (!local && !/^\S+@\S+\.\S+$/.test(d.email || '')) { err.textContent = 'Escribí un correo válido.'; f.email.focus(); return; }
    if (!local && String(d.clave || '').length < 6) { err.textContent = 'La contraseña tiene que tener al menos 6 caracteres.'; f.clave.focus(); return; }
    if (!waNumero(d.whatsapp)) { err.textContent = 'El WhatsApp no parece válido. Ej.: 381 512 3456'; f.whatsapp.focus(); return; }
    if (!String(d.localidad || '').trim()) { err.textContent = 'Elegí tu localidad.'; f.localidad.focus(); return; }
    d.localidad = d.localidad.trim();
    const b = f.querySelector('[type=submit]'); cargandoBtn(b, true, 'Creando…');
    try {
      await ctx.d.auth.registrar(d);
      toast(d.tipo === 'comercio' ? '¡Listo! Ahora armá tu tienda.' : '¡Listo! Ya podés publicar.');
      const ir = destino(ctx);
      // Un comerciante nuevo arma primero su tienda, salvo que venga de otra pantalla puntual.
      ctx.ir(d.tipo === 'comercio' && ir === 'panel' ? 'mi-tienda' : ir);
    } catch (x) { err.textContent = x.message; cargandoBtn(b, false); }
  };
}
