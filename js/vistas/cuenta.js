// Bienvenida, ingreso y registro. Dos tipos de usuario: particular y comercio/emprendimiento.
// Rutas: #entrar (bienvenida) · #ingresar · #registrarse (¿cómo querés usar la Feria?) · #registro-particular · #registro-comercio.
// Con Google: si la cuenta es nueva, se completa el perfil (tipo, WhatsApp y zona) con las mismas pantallas.
// En modo prueba local NO hay cuentas reales: se crea un perfil de prueba que vive solo en este navegador.
import { esc, waNumero } from '../lib/util.js';
import { ico } from '../lib/iconos.js';
import { toast, cargandoBtn } from '../lib/dom.js';
import { camposUbicacion, enlazarUbicacion } from './zona.js';
import { lugarCartel } from './componentes.js';
import { cartelCupo } from '../lib/fundadores.js';

const avisoLocal = `<div class="nota nota-aviso">${ico('info')}<span><b>Modo prueba, sin cuentas reales.</b> Todavía no está conectado el servidor,
  así que no se pide correo ni contraseña: el perfil se guarda solo en este navegador para que puedas recorrer la app.</span></div>`;

const G = '<svg class="g-logo" viewBox="0 0 48 48" aria-hidden="true"><path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z"/><path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"/><path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-7.9l-6.5 5C9.5 39.6 16.2 44 24 44z"/><path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.3-.1-2.4-.4-3.5z"/></svg>';

const conGoogle = (ctx) => ctx.d.modo === 'firebase' && typeof ctx.d.auth.conGoogle === 'function';
function bloqueGoogle(ctx) {
  if (!conGoogle(ctx)) return '';
  return `<div class="separador"><span>o continuá con</span></div>
    <button class="btn btn-google ancho" type="button" data-google>${G} Continuar con Google</button>
    <p class="error" data-err-g role="alert"></p>`;
}
function enlazarGoogle(root, ctx) {
  const b = root.querySelector('[data-google]'); if (!b) return;
  const err = root.querySelector('[data-err-g]');
  b.onclick = async () => {
    err.textContent = ''; cargandoBtn(b, true, 'Abriendo Google…');
    try {
      const u = await ctx.d.auth.conGoogle();
      if (!u) return; // redirige y vuelve
      if (u.incompleto) { toast('¡Hola! Te falta un paso para terminar tu cuenta.'); ctx.ir('registrarse'); }
      else ctx.ir(destino(ctx));
    } catch (x) { err.textContent = x.message; cargandoBtn(b, false); }
  };
}

export async function vista(root, r, ctx) {
  const u = ctx.usuario;
  const completar = !!(u && u.incompleto);
  if (u && !completar) { ctx.ir('panel'); return; }
  if (completar && r.nombre === 'registro-particular') return registro(root, ctx, 'particular', true);
  if (completar && r.nombre === 'registro-comercio') return registro(root, ctx, 'comercio', true);
  if (completar) return elegirTipo(root, ctx, true);
  if (r.nombre === 'entrar') return bienvenida(root, ctx);
  if (r.nombre === 'registrarse') return elegirTipo(root, ctx, false);
  if (r.nombre === 'registro-particular') return registro(root, ctx, 'particular', false);
  if (r.nombre === 'registro-comercio') return registro(root, ctx, 'comercio', false);
  return ingreso(root, ctx);
}

function destino(ctx) { const v = ctx.volverA; ctx.volverA = ''; return v || 'panel'; }

// ---------- Bienvenida ----------
function bienvenida(root, ctx) {
  const local = ctx.d.modo === 'local';
  root.innerHTML = `<div class="bienvenida">
    <img class="bv-logo" src="icons/logo-principal.png" alt="Feria Pekerón" width="260" height="209">
    <h1>¡Bienvenido!</h1>
    <p class="txt-sec">Ingresá o creá tu cuenta para comenzar a usar Feria Pekerón.</p>
    ${local ? avisoLocal : ''}
    <div class="bv-btns">
      <a class="btn btn-amarillo ancho btn-grande" href="#ingresar">Iniciar sesión</a>
      <a class="btn btn-borde ancho btn-grande" href="#registrarse">Crear cuenta</a>
      ${bloqueGoogle(ctx)}
    </div>
    <div class="bv-ola" aria-hidden="true"></div>
    <p class="bv-pie">${ico('corazon')} Más oportunidades para tu negocio</p>
  </div>`;
  enlazarGoogle(root, ctx);
}

// ---------- ¿Cómo querés usar Feria Pekerón? ----------
function elegirTipo(root, ctx, completar) {
  root.innerHTML = `<div class="form-vista tipo-vista">
    <div class="barra-vista"><a class="btn-ico" href="${completar ? '#inicio' : '#entrar'}" aria-label="Volver">${ico('atras')}</a></div>
    <h1>¿Cómo querés usar Feria Pekerón?</h1>
    ${completar ? '<p class="txt-sec">Elegí una opción para terminar de crear tu cuenta.</p>' : ''}
    <div data-fund-cartel></div>
    <a class="tipo-card" href="#registro-particular">
      <span class="tipo-ico">${ico('usuario')}</span>
      <span class="tipo-txt"><strong>Particular</strong><span>Publicá productos que quieras vender, o encontrá lo que necesitás.</span></span>
      ${ico('derecha', 'chev')}</a>
    <a class="tipo-card tipo-card-am" href="#registro-comercio">
      <span class="tipo-ico">${ico('tienda')}</span>
      <span class="tipo-txt"><strong>Comercio / Emprendimiento</strong><span>Creá tu tienda, mostrá tus productos y hacé crecer tu negocio.</span></span>
      ${ico('derecha', 'chev')}</a>
    <p class="centro txt-sec">Ambos registros son gratuitos y sin comisiones.</p>
    ${completar ? '' : `<p class="centro">¿Ya tenés cuenta? <a href="#ingresar">Iniciar sesión</a></p>`}
  </div>`;
  lugarCartel(root, () => cartelCupo({ link: '' }));
}

// ---------- Ingreso ----------
async function ingreso(root, ctx) {
  const local = ctx.d.modo === 'local';
  if (local) {
    const perfiles = await ctx.d.auth.perfilesGuardados();
    root.innerHTML = `<div class="form-vista">
      <div class="barra-vista"><a class="btn-ico" href="#entrar" aria-label="Volver">${ico('atras')}</a></div>
      <h1>Iniciar sesión</h1>
      ${avisoLocal}
      ${perfiles.length ? `<p class="txt-sec">Perfiles de prueba guardados en este navegador:</p>
        <div class="lista-perfiles">${perfiles.map((p) => `<button class="perfil-btn" data-uid="${esc(p.uid)}">
          <span class="avatar" aria-hidden="true">${esc(p.nombre.charAt(0).toUpperCase())}</span>
          <span><strong>${esc(p.nombre)}</strong><span class="txt-sec">${p.tipo === 'comercio' ? 'Comercio' : 'Particular'}</span></span>${ico('derecha', 'chev')}</button>`).join('')}</div>`
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
    <div class="barra-vista"><a class="btn-ico" href="#entrar" aria-label="Volver">${ico('atras')}</a></div>
    <h1>Iniciar sesión</h1>
    <p class="txt-sec">Para publicar, armar tu tienda y ver tus productos.</p>
    <form class="form" data-f novalidate>
      <div class="campo"><label for="c-email">Correo</label><input id="c-email" name="email" type="email" required autocomplete="email" inputmode="email"></div>
      <div class="campo"><label for="c-clave">Contraseña</label><input id="c-clave" name="clave" type="password" required autocomplete="current-password" minlength="6"></div>
      <p class="error" data-err role="alert"></p>
      <button class="btn btn-amarillo ancho btn-grande" type="submit">Iniciar sesión</button>
      <button class="btn-link" type="button" data-olvide>Me olvidé la contraseña</button>
    </form>
    ${bloqueGoogle(ctx)}
    <p class="centro">¿No tenés cuenta? <a href="#registrarse">Registrate gratis</a></p>
  </div>`;
  enlazarGoogle(root, ctx);
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

// ---------- Registro (o completar perfil después de Google) ----------
function registro(root, ctx, tipo, completar) {
  const local = ctx.d.modo === 'local';
  const com = tipo === 'comercio';
  const u = ctx.usuario;
  root.innerHTML = `<div class="form-vista">
    <div class="barra-vista"><a class="btn-ico" href="#registrarse" aria-label="Volver">${ico('atras')}</a></div>
    <span class="chip-tipo">${com ? ico('tienda') + ' Comercio / Emprendimiento' : ico('usuario') + ' Particular'}</span>
    <h1>${completar ? 'Completá tu perfil' : local ? 'Crear perfil de prueba' : 'Crear cuenta'}</h1>
    ${local ? avisoLocal : `<p class="txt-sec">${completar ? 'Último paso: así los compradores te pueden escribir.' : 'Es gratis. Publicar no tiene costo ni comisiones.'}</p>`}
    <div data-fund-cartel></div>
    <form class="form" data-f novalidate>
      <input type="hidden" name="tipo" value="${com ? 'comercio' : 'particular'}">
      <div class="campo"><label for="r-nombre">${com ? 'Nombre del negocio' : 'Tu nombre'}</label><input id="r-nombre" name="nombre" required maxlength="60" autocomplete="${com ? 'organization' : 'name'}" value="${completar && !com ? esc((u && u.nombre) || '') : ''}"></div>
      ${local || completar ? '' : `<div class="campo"><label for="r-email">Correo</label><input id="r-email" name="email" type="email" required autocomplete="email" inputmode="email"></div>
      <div class="campo"><label for="r-clave">Contraseña</label><input id="r-clave" name="clave" type="password" required minlength="6" autocomplete="new-password"><small class="ayuda">Mínimo 6 caracteres.</small></div>`}
      <div class="campo"><label for="r-wa">WhatsApp</label><input id="r-wa" name="whatsapp" type="tel" inputmode="tel" required placeholder="381 512 3456" autocomplete="tel">
        <small class="ayuda">Con código de área, sin 0 ni 15. Los compradores te escriben acá.</small></div>
      ${camposUbicacion(ctx.zona)}
      <p class="error" data-err role="alert"></p>
      <button class="btn btn-amarillo ancho btn-grande" type="submit">${completar ? 'Terminar' : local ? 'Crear perfil y entrar' : 'Crear cuenta'}</button>
    </form>
    ${completar ? '' : bloqueGoogle(ctx)}
    ${completar ? '' : `<p class="centro">¿Ya ${local ? 'creaste un perfil' : 'tenés cuenta'}? <a href="#ingresar">Iniciar sesión</a></p>`}
  </div>`;
  enlazarUbicacion(root);
  enlazarGoogle(root, ctx);
  lugarCartel(root, () => cartelCupo({ link: '' }));
  const f = root.querySelector('[data-f]'), err = root.querySelector('[data-err]');
  f.onsubmit = async (e) => {
    e.preventDefault(); err.textContent = '';
    const d = Object.fromEntries(new FormData(f));
    d.nombre = String(d.nombre || '').trim();
    if (d.nombre.length < 2) { err.textContent = com ? 'Escribí el nombre del negocio.' : 'Escribí tu nombre.'; f.nombre.focus(); return; }
    if (!local && !completar && !/^\S+@\S+\.\S+$/.test(d.email || '')) { err.textContent = 'Escribí un correo válido.'; f.email.focus(); return; }
    if (!local && !completar && String(d.clave || '').length < 6) { err.textContent = 'La contraseña tiene que tener al menos 6 caracteres.'; f.clave.focus(); return; }
    if (!waNumero(d.whatsapp)) { err.textContent = 'El WhatsApp no parece válido. Ej.: 381 512 3456'; f.whatsapp.focus(); return; }
    if (!String(d.localidad || '').trim()) { err.textContent = 'Elegí tu localidad.'; f.localidad.focus(); return; }
    d.localidad = d.localidad.trim();
    const b = f.querySelector('[type=submit]'); cargandoBtn(b, true, completar ? 'Guardando…' : 'Creando…');
    try {
      if (completar) {
        await ctx.d.guardarPerfil({ nombre: d.nombre, tipo: d.tipo, whatsapp: d.whatsapp, provincia: d.provincia || '', localidad: d.localidad, barrio: d.barrio || '', creado: Date.now() });
      } else {
        await ctx.d.auth.registrar(d);
      }
      if (ctx.despuesDeCuenta !== 'whatsapp') toast(com ? '¡Listo! Ahora armá tu tienda.' : '¡Listo! Ya podés publicar.');
      const ir = destino(ctx);
      // Un comercio nuevo arma primero su tienda, salvo que venga de otra pantalla puntual.
      ctx.ir(com && ir === 'panel' ? 'mi-tienda' : ir);
    } catch (x) { err.textContent = x.message; cargandoBtn(b, false); }
  };
}
