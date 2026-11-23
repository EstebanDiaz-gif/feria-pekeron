// Vendedores Fundadores: los primeros `config.fundadores.cupo` que se registran.
// Llevan una insignia en sus publicaciones, su tienda y su perfil, y sus productos salen en una sección
// destacada del inicio. El número lo da el servidor (ver reclamarFundador en datos/firebase.js y las reglas).
import { fundadores as CFG } from '../config.js';
import { hoja } from './dom.js';

let mapa = new Map();
let usados = 0;
let cargado = false;

export const cupo = CFG.cupo;
export const esFundador = (uid) => !!uid && mapa.has(uid);
export const numero = (uid) => mapa.get(uid) || 0;
export const quedan = () => Math.max(0, CFG.cupo - usados);
export const listo = () => cargado;
export const uids = () => new Set(mapa.keys());

export async function cargar(d) {
  try {
    const [m, u] = await Promise.all([d.fundadores(), d.cupoFundadores()]);
    mapa = m; usados = Math.max(u, m.size); cargado = true;
  } catch (e) { console.warn('fundadores', e); }
  return mapa;
}

const ESTRELLA = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2.8l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 16.8 6.6 19.7l1-6.1-4.4-4.3 6.1-.9z" fill="currentColor"/></svg>';
export const estrella = () => ESTRELLA;
export function insignia(uid, { chica = false } = {}) {
  if (!esFundador(uid)) return '';
  return `<span class="fundador${chica ? ' fundador-chica' : ''}" title="Vendedor Fundador #${numero(uid)}">${ESTRELLA}${chica ? 'Fundador' : `Vendedor Fundador #${numero(uid)}`}</span>`;
}

// Al registrarse o ingresar: si todavía hay lugar, se le asigna su número. Se celebra una sola vez.
export async function reclamar(ctx) {
  const u = ctx.d.auth.actual();
  if (!u) return 0;
  let n = numero(u.uid);
  if (!n) {
    if (cargado && quedan() <= 0) return 0;
    try { n = (await ctx.d.reclamarFundador(CFG.cupo)) || 0; } catch (e) { console.warn('reclamar fundador', e); return 0; }
    if (n) { mapa.set(u.uid, n); usados = Math.max(usados, n); }
  }
  if (n && !visto(u.uid)) { marcarVisto(u.uid); celebrar(n); }
  return n;
}

const clave = (uid) => 'feria.fundador.visto.' + uid;
function visto(uid) { try { return localStorage.getItem(clave(uid)) === '1'; } catch { return true; } }
function marcarVisto(uid) { try { localStorage.setItem(clave(uid), '1'); } catch { /* nada */ } }

function celebrar(n) {
  hoja(`<div class="fund-cele">
      <div class="fund-medalla">${ESTRELLA}<span>#${n}</span></div>
      <h2>¡Sos Vendedor Fundador!</h2>
      <p class="txt-sec">Sos el número <b>${n}</b> de los primeros ${CFG.cupo}. Tus productos van a llevar la insignia
        <b>Fundador</b> y van a salir destacados en el inicio el día del lanzamiento.</p>
      <a class="btn btn-pri ancho" href="#publicar" data-cerrar>Cargar mis productos</a>
      <button class="btn-link" data-cerrar>Más tarde</button>
    </div>`);
}

// Cartel para invitar a registrarse mientras quedan lugares.
export function cartelCupo({ link = '#registrarse', boton = 'Quiero mi lugar' } = {}) {
  const q = quedan();
  if (!cargado || q <= 0) return '';
  const tag = link ? 'a' : 'div';
  return `<${tag} class="fund-cartel" ${link ? `href="${link}"` : ''}>
    <span class="fund-cartel-ico">${ESTRELLA}</span>
    <span class="fund-cartel-txt"><strong>Quedan ${q} lugares de Vendedor Fundador</strong>
      <span>${link ? `Los primeros ${CFG.cupo} llevan insignia y salen destacados al lanzar.` : `Registrate ahora: los primeros ${CFG.cupo} llevan insignia y sus productos salen destacados al lanzar.`}</span></span>
    ${link ? `<span class="btn btn-amarillo btn-chico">${boton}</span>` : ''}</${tag}>`;
}
