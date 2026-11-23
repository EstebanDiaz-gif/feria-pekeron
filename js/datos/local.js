// MODO PRUEBA LOCAL
// Guarda todo en el navegador (IndexedDB). No hay cuentas ni contraseñas: un "perfil de prueba"
// existe solo en este dispositivo y nadie más ve lo que se publica. Sirve para recorrer y probar la app
// hasta que se conecte Firebase (ver datos/firebase.js y README.md).
import { palabras, coincide, idNuevo, slug as aSlug } from '../lib/util.js';
import * as L from './guardado-local.js';

const DB = 'feria-pekeron-local';
const SESION = 'feria.sesion';
let dbp = null;

function abrir() {
  if (dbp) return dbp;
  dbp = new Promise((ok, mal) => {
    let r;
    try { r = indexedDB.open(DB, 2); } catch (e) { mal(e); return; }
    r.onupgradeneeded = () => {
      const d = r.result;
      for (const [n, k] of [['perfiles', 'uid'], ['tiendas', 'slug'], ['publicaciones', 'id'], ['consultas', 'id']]) {
        if (!d.objectStoreNames.contains(n)) d.createObjectStore(n, { keyPath: k });
      }
    };
    r.onsuccess = () => ok(r.result);
    r.onerror = () => mal(r.error);
  });
  return dbp;
}

// Si el navegador no deja usar IndexedDB (algunas vistas previas o modo incógnito), se guarda en memoria
// hasta recargar la página. `memoria` avisa a la interfaz para mostrarlo.
export let memoria = false;
const MEM = { perfiles: new Map(), tiendas: new Map(), publicaciones: new Map(), consultas: new Map() };
const CLAVE = { perfiles: 'uid', tiendas: 'slug', publicaciones: 'id', consultas: 'id' };
function opMem(store, fn) {
  const m = MEM[store];
  const o = {
    get: (k) => ({ result: m.get(k) }),
    getAll: () => ({ result: [...m.values()] }),
    put: (v) => { m.set(v[CLAVE[store]], structuredClone(v)); return {}; },
    delete: (k) => { m.delete(k); return {}; },
  };
  const r = fn(o);
  return Promise.resolve(r && r.result !== undefined ? structuredClone(r.result) : undefined);
}

async function op(store, modo, fn) {
  if (memoria) return opMem(store, fn);
  const d = await abrir();
  return new Promise((ok, mal) => {
    const tx = d.transaction(store, modo);
    const req = fn(tx.objectStore(store));
    tx.oncomplete = () => ok(req && req.result);
    tx.onerror = () => mal(tx.error);
    tx.onabort = () => mal(tx.error || new Error('No se pudo guardar (¿falta espacio en el navegador?)'));
  });
}
const get = (s, k) => op(s, 'readonly', (o) => o.get(k));
const todos = (s) => op(s, 'readonly', (o) => o.getAll());
const put = (s, v) => op(s, 'readwrite', (o) => o.put(v));
const del = (s, k) => op(s, 'readwrite', (o) => o.delete(k));

function leerSesion() { try { return localStorage.getItem(SESION) || ''; } catch { return ''; } }
function escribirSesion(uid) { try { uid ? localStorage.setItem(SESION, uid) : localStorage.removeItem(SESION); } catch { /* sin almacenamiento */ } }

const oyentes = new Set();
let actual = null;
async function avisar() { for (const f of oyentes) f(actual); }

export const modo = 'local';

export async function iniciar() {
  try { await abrir(); } catch (e) { console.warn('IndexedDB no disponible: modo memoria', e); memoria = true; }
  const uid = leerSesion();
  actual = uid ? (await get('perfiles', uid)) || null : null;
  if (!actual) escribirSesion('');
}

export const auth = {
  actual: () => actual,
  alCambiar(f) { oyentes.add(f); return () => oyentes.delete(f); },
  async registrar(d) {
    const p = {
      uid: 'local-' + idNuevo(10),
      nombre: d.nombre.trim(), tipo: d.tipo === 'comercio' ? 'comercio' : 'particular',
      whatsapp: d.whatsapp || '', provincia: d.provincia || '', localidad: d.localidad || '', barrio: d.barrio || '',
      creado: Date.now(),
    };
    await put('perfiles', p);
    actual = p; escribirSesion(p.uid); await avisar();
    return p;
  },
  async perfilesGuardados() { return (await todos('perfiles')).sort((a, b) => b.creado - a.creado); },
  async usarPerfil(uid) {
    const p = await get('perfiles', uid);
    if (!p) throw new Error('Ese perfil ya no existe en este navegador.');
    actual = p; escribirSesion(uid); await avisar();
    return p;
  },
  async salir() { actual = null; escribirSesion(''); await avisar(); },
};

export async function guardarPerfil(cambios) {
  if (!actual) throw new Error('Tenés que ingresar primero.');
  const p = { ...actual, ...cambios, uid: actual.uid };
  await put('perfiles', p);
  actual = p; await avisar();
  // Datos de contacto copiados en las publicaciones (igual que se hará en Firestore).
  const mias = (await todos('publicaciones')).filter((x) => x.uid === p.uid);
  for (const x of mias) await put('publicaciones', { ...x, vendedorNombre: p.nombre, whatsapp: p.whatsapp });
  return p;
}

// ---------- Tiendas ----------
export const tienda = (s) => get('tiendas', s).then((t) => t || null);
export async function tiendaDeUsuario(uid) {
  return (await todos('tiendas')).find((t) => t.uid === uid) || null;
}
export async function listarTiendas({ localidad } = {}) {
  let t = await todos('tiendas');
  if (localidad) t = t.filter((x) => x.localidad === localidad);
  return t.sort((a, b) => b.actualizado - a.actualizado);
}
export async function slugLibre(s, uid) {
  const t = await get('tiendas', s);
  return !t || t.uid === uid;
}
export async function guardarTienda(d) {
  if (!actual) throw new Error('Tenés que ingresar primero.');
  const previa = await tiendaDeUsuario(actual.uid);
  const s = previa ? previa.slug : aSlug(d.nombre);
  if (!s || s.length < 3) throw new Error('El nombre de la tienda es muy corto.');
  if (!previa && !(await slugLibre(s, actual.uid))) throw new Error('Ya hay una tienda con ese nombre. Probá con otro.');
  const t = {
    ...(previa || {}), ...d, slug: s, uid: actual.uid,
    creado: previa ? previa.creado : Date.now(), actualizado: Date.now(),
  };
  await put('tiendas', t);
  const mias = (await todos('publicaciones')).filter((x) => x.uid === actual.uid);
  for (const x of mias) await put('publicaciones', { ...x, tienda: s, tiendaNombre: t.nombre });
  return t;
}

// ---------- Publicaciones ----------
export const publicacion = (id) => get('publicaciones', id).then((p) => p || null);

export async function listar(f = {}) {
  let l = await todos('publicaciones');
  if (!f.incluirOcultas) l = l.filter((p) => p.disponibilidad === 'disponible');
  if (f.uid) l = l.filter((p) => p.uid === f.uid);
  if (f.tienda) l = l.filter((p) => p.tienda === f.tienda);
  if (f.categoria) l = l.filter((p) => p.categoria === f.categoria);
  if (f.sub) l = l.filter((p) => p.subcategoria === f.sub);
  if (f.estado) l = l.filter((p) => p.estado === f.estado);
  if (f.provincia) l = l.filter((p) => p.provincia === f.provincia);
  if (f.localidad) l = l.filter((p) => p.localidad === f.localidad);
  if (f.soloDestacadas) l = l.filter((p) => p.destacada === true);
  if (f.q) l = l.filter((p) => coincide(p, f.q));
  const o = f.orden || 'recientes';
  l.sort(o === 'precio-asc' ? (a, b) => a.precio - b.precio : o === 'precio-desc' ? (a, b) => b.precio - a.precio : (a, b) => b.creado - a.creado);
  return f.limite ? l.slice(0, f.limite) : l;
}

export async function guardarPublicacion(d) {
  if (!actual) throw new Error('Tenés que ingresar primero.');
  const previa = d.id ? await get('publicaciones', d.id) : null;
  if (previa && previa.uid !== actual.uid) throw new Error('Esta publicación no es tuya.');
  const t = await tiendaDeUsuario(actual.uid);
  const p = {
    ...(previa || {}), ...d,
    id: previa ? previa.id : idNuevo(),
    uid: actual.uid,
    vendedorNombre: actual.nombre, whatsapp: actual.whatsapp,
    tienda: t ? t.slug : '', tiendaNombre: t ? t.nombre : '',
    destacada: previa ? previa.destacada === true : false, // solo la plataforma destaca
    palabras: palabras(d.titulo, d.descripcion, d.subcategoria),
    creado: previa ? previa.creado : Date.now(),
    actualizado: Date.now(),
  };
  await put('publicaciones', p);
  return p.id;
}

export async function cambiarDisponibilidad(id, disponibilidad) {
  const p = await get('publicaciones', id);
  if (!p || !actual || p.uid !== actual.uid) throw new Error('Esta publicación no es tuya.');
  await put('publicaciones', { ...p, disponibilidad, actualizado: Date.now() });
}

export async function borrarPublicacion(id) {
  const p = await get('publicaciones', id);
  if (!p || !actual || p.uid !== actual.uid) throw new Error('Esta publicación no es tuya.');
  await del('publicaciones', id);
}

// ---------- Consultas y comprador (modo prueba: todo en este navegador) ----------
export async function registrarConsulta(p) {
  if (!p || !p.id || String(p.id).startsWith('g-') || !p.uid) return;
  await put('consultas', { id: idNuevo(), pub: p.id, vendedor: p.uid, titulo: p.titulo || '', at: Date.now(), uid: actual ? actual.uid : '' });
  if (actual) L.poner('consultados.' + actual.uid, p);
}
export async function consultasRecibidas() {
  if (!actual) return {};
  const r = {};
  for (const x of (await todos('consultas')).filter((c) => c.vendedor === actual.uid)) {
    const a = r[x.pub] || (r[x.pub] = { total: 0, fechas: [] });
    a.total++; a.fechas.push(x.at);
  }
  return r;
}
export async function marcarRevisado(id) {
  const p = await get('publicaciones', id);
  if (!p || !actual || p.uid !== actual.uid) throw new Error('Esta publicación no es tuya.');
  await put('publicaciones', { ...p, revisado: Date.now() });
}
export async function favoritos() { return actual ? L.lista('favoritos.' + actual.uid) : []; }
export async function ponerFavorito(p, si) {
  if (!actual) throw new Error('Ingresá para guardar favoritos.');
  if (si) L.poner('favoritos.' + actual.uid, p); else L.quitar('favoritos.' + actual.uid, p.id);
}
export async function consultados() { return actual ? L.lista('consultados.' + actual.uid) : []; }

// ---------- Vendedores Fundadores (modo prueba: en este navegador) ----------
const FUND = 'feria.fundadores';
const leerFund = () => { try { return JSON.parse(localStorage.getItem(FUND) || '{}'); } catch { return {}; } };
export async function fundadores() { return new Map(Object.entries(leerFund())); }
export async function cupoFundadores() { return Object.keys(leerFund()).length; }
export async function reclamarFundador(cupo) {
  if (!actual) return null;
  const f = leerFund();
  if (f[actual.uid]) return f[actual.uid];
  const n = Object.keys(f).length + 1;
  if (n > cupo) return null;
  f[actual.uid] = n;
  try { localStorage.setItem(FUND, JSON.stringify(f)); } catch { /* sin almacenamiento */ }
  return n;
}
