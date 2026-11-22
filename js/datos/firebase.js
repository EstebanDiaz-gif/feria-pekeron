// BACKEND REAL: Firebase Authentication (correo y contraseña) + Firestore.
// Proyecto de Firebase PROPIO de la Feria: nunca el de Pekerón Gestión (`controlcompraventa`),
// que ya usa colecciones como users/, stores/ y productos/.
//
// Proyecto: feria-pekeron (Firestore en southamerica-east1). SDK 10.12.2, el mismo que usa Pekerón Gestión.
// Índices compuestos creados en la consola: publicaciones (disponibilidad, [tienda|localidad|categoria|provincia], creado desc).
import { palabras, idNuevo, slug as aSlug } from '../lib/util.js';
import { filtrar, ordenar } from './filtro.js';

const V = 'https://www.gstatic.com/firebasejs/10.12.2/';
let A, F, auth0, db;

export const modo = 'firebase';
let actual = null;
const oyentes = new Set();
const avisar = () => { for (const f of oyentes) f(actual); };

export async function iniciar(config) {
  const [app, a, f] = await Promise.all([
    import(V + 'firebase-app.js'), import(V + 'firebase-auth.js'), import(V + 'firebase-firestore.js'),
  ]);
  A = a; F = f;
  const ap = app.initializeApp(config);
  auth0 = a.getAuth(ap);
  db = f.getFirestore(ap);
  await new Promise((listo) => {
    let primera = true;
    a.onAuthStateChanged(auth0, async (u) => {
      actual = u ? await perfilDe(u.uid) : null;
      if (primera) { primera = false; listo(); } else avisar();
    });
  });
}

async function perfilDe(uid) {
  const s = await F.getDoc(F.doc(db, 'usuarios', uid));
  return s.exists() ? { uid, ...s.data() } : { uid, nombre: '', tipo: 'particular', incompleto: true };
}

const msg = (e) => {
  const c = (e && e.code) || '';
  if (c.includes('email-already-in-use')) return 'Ya hay una cuenta con ese correo. Probá ingresar.';
  if (c.includes('invalid-email')) return 'El correo no es válido.';
  if (c.includes('weak-password')) return 'La contraseña tiene que tener al menos 6 caracteres.';
  if (c.includes('invalid-credential') || c.includes('wrong-password') || c.includes('user-not-found')) return 'Correo o contraseña incorrectos.';
  if (c.includes('too-many-requests')) return 'Demasiados intentos. Esperá unos minutos.';
  if (c.includes('permission-denied')) return 'No tenés permiso para hacer eso.';
  if (c.includes('unavailable') || c.includes('network')) return 'Sin conexión. Probá de nuevo.';
  return (e && e.message) || 'Ocurrió un error. Probá de nuevo.';
};
const seguro = (fn) => async (...x) => { try { return await fn(...x); } catch (e) { throw new Error(msg(e)); } };

export const auth = {
  actual: () => actual,
  alCambiar(f) { oyentes.add(f); return () => oyentes.delete(f); },
  registrar: seguro(async (d) => {
    const c = await A.createUserWithEmailAndPassword(auth0, d.email.trim(), d.clave);
    const p = {
      nombre: d.nombre.trim(), tipo: d.tipo === 'comercio' ? 'comercio' : 'particular',
      whatsapp: d.whatsapp || '', provincia: d.provincia || '', localidad: d.localidad || '', barrio: d.barrio || '',
      creado: Date.now(),
    };
    await F.setDoc(F.doc(db, 'usuarios', c.user.uid), p);
    actual = { uid: c.user.uid, ...p }; avisar();
    return actual;
  }),
  ingresar: seguro(async ({ email, clave }) => {
    const c = await A.signInWithEmailAndPassword(auth0, email.trim(), clave);
    actual = await perfilDe(c.user.uid); avisar();
    return actual;
  }),
  recuperar: seguro(async (email) => { await A.sendPasswordResetEmail(auth0, email.trim()); }),
  salir: seguro(async () => { await A.signOut(auth0); actual = null; avisar(); }),
};

export const guardarPerfil = seguro(async (cambios) => {
  if (!actual) throw new Error('Tenés que ingresar primero.');
  const { uid, incompleto, ...resto } = { ...actual, ...cambios };
  await F.setDoc(F.doc(db, 'usuarios', actual.uid), resto, { merge: true });
  actual = { uid: actual.uid, ...resto }; avisar();
  await copiarEnPublicaciones({ vendedorNombre: actual.nombre, whatsapp: actual.whatsapp });
  return actual;
});

async function copiarEnPublicaciones(campos) {
  const q = F.query(F.collection(db, 'publicaciones'), F.where('uid', '==', actual.uid));
  const s = await F.getDocs(q);
  let b = F.writeBatch(db), n = 0;
  for (const d of s.docs) {
    b.update(d.ref, campos);
    if (++n === 450) { await b.commit(); b = F.writeBatch(db); n = 0; }
  }
  if (n) await b.commit();
}

// ---------- Tiendas (documento = tiendas/{slug}) ----------
export const tienda = seguro(async (s) => {
  const d = await F.getDoc(F.doc(db, 'tiendas', s));
  return d.exists() ? { slug: s, ...d.data() } : null;
});
export const tiendaDeUsuario = seguro(async (uid) => {
  const s = await F.getDocs(F.query(F.collection(db, 'tiendas'), F.where('uid', '==', uid), F.limit(1)));
  return s.empty ? null : { slug: s.docs[0].id, ...s.docs[0].data() };
});
export const listarTiendas = seguro(async ({ localidad } = {}) => {
  const s = await F.getDocs(F.query(F.collection(db, 'tiendas'), F.orderBy('actualizado', 'desc'), F.limit(200)));
  const l = s.docs.map((d) => ({ slug: d.id, ...d.data() }));
  return localidad ? l.filter((t) => t.localidad === localidad) : l;
});
export const guardarTienda = seguro(async (d) => {
  if (!actual) throw new Error('Tenés que ingresar primero.');
  const previa = await tiendaDeUsuario(actual.uid);
  const s = previa ? previa.slug : aSlug(d.nombre);
  if (!s || s.length < 3) throw new Error('El nombre de la tienda es muy corto.');
  const ref = F.doc(db, 'tiendas', s);
  const base = { ...d, uid: actual.uid, actualizado: Date.now() };
  await F.runTransaction(db, async (tx) => {
    const x = await tx.get(ref);
    if (x.exists() && x.data().uid !== actual.uid) throw new Error('Ya hay una tienda con ese nombre. Probá con otro.');
    tx.set(ref, x.exists() ? base : { ...base, creado: Date.now() }, { merge: true });
  });
  await copiarEnPublicaciones({ tienda: s, tiendaNombre: d.nombre });
  return { slug: s, ...(previa || {}), ...base };
});

// ---------- Publicaciones ----------
export const publicacion = seguro(async (id) => {
  const d = await F.getDoc(F.doc(db, 'publicaciones', id));
  return d.exists() ? { id, ...d.data() } : null;
});

// Consulta en el servidor: disponibles + UN filtro (tienda, localidad, categoría o provincia), las 300 más
// recientes. Cada combinación tiene su índice compuesto creado en la consola (disponibilidad, campo, creado desc).
// El resto de los filtros, la búsqueda por texto y el orden por precio se aplican en el celular.
// Cuando haya miles de publicaciones, la búsqueda de texto pasa a un buscador dedicado (Algolia/Typesense).
export const listar = seguro(async (f = {}) => {
  if (f.uid) {
    // Mis publicaciones: todas (incluye pausadas y vendidas). Solo filtra por dueño: no necesita índice.
    const s = await F.getDocs(F.query(F.collection(db, 'publicaciones'), F.where('uid', '==', f.uid)));
    let l = s.docs.map((d) => ({ id: d.id, ...d.data() }));
    if (!f.incluirOcultas) l = l.filter((p) => p.disponibilidad === 'disponible');
    l = ordenar(filtrar(l, { ...f, uid: undefined }), f.orden);
    return f.limite ? l.slice(0, f.limite) : l;
  }
  const w = [F.where('disponibilidad', '==', 'disponible')];
  const campo = ['tienda', 'localidad', 'categoria', 'provincia'].find((k) => f[k]);
  if (campo) w.push(F.where(campo, '==', f[campo]));
  w.push(F.orderBy('creado', 'desc'), F.limit(300));
  const s = await F.getDocs(F.query(F.collection(db, 'publicaciones'), ...w));
  const l = ordenar(filtrar(s.docs.map((d) => ({ id: d.id, ...d.data() })), f), f.orden);
  return f.limite ? l.slice(0, f.limite) : l;
});

export const guardarPublicacion = seguro(async (d) => {
  if (!actual) throw new Error('Tenés que ingresar primero.');
  const id = d.id || idNuevo();
  const ref = F.doc(db, 'publicaciones', id);
  const t = await tiendaDeUsuario(actual.uid);
  const datos = {
    ...d, uid: actual.uid,
    vendedorNombre: actual.nombre, whatsapp: actual.whatsapp,
    tienda: t ? t.slug : '', tiendaNombre: t ? t.nombre : '',
    palabras: palabras(d.titulo, d.descripcion, d.subcategoria),
    actualizado: Date.now(),
  };
  delete datos.id;
  if (d.id) await F.updateDoc(ref, datos);
  else await F.setDoc(ref, { ...datos, destacada: false, creado: Date.now() });
  return id;
});

export const cambiarDisponibilidad = seguro(async (id, disponibilidad) => {
  await F.updateDoc(F.doc(db, 'publicaciones', id), { disponibilidad, actualizado: Date.now() });
});
export const borrarPublicacion = seguro(async (id) => { await F.deleteDoc(F.doc(db, 'publicaciones', id)); });

// ---------- Consultas (toques en "Consultar por WhatsApp") ----------
// Se guarda que alguien consultó (y su uid si está logueado), nunca su número ni el mensaje.
export async function registrarConsulta(p) {
  if (!p || !p.id || String(p.id).startsWith('g-') || !p.uid) return;
  const d = { pub: p.id, vendedor: p.uid, titulo: String(p.titulo || '').slice(0, 80), at: F.serverTimestamp() };
  if (actual) d.uid = actual.uid;
  try { await F.addDoc(F.collection(db, 'consultas'), d); } catch (e) { console.warn('consulta', e); }
  if (actual) {
    try {
      await F.setDoc(F.doc(db, 'usuarios', actual.uid, 'consultados', p.id),
        { titulo: p.titulo || '', precio: p.precio || 0, at: Date.now() });
    } catch (e) { console.warn('consultado', e); }
  }
}

// Para el vendedor: { [idPublicacion]: { total, nuevas, ultima } }. "Nuevas" = después de la última vez
// que respondió "¿Ya lo vendiste?" (campo `revisado` de la publicación).
export const consultasRecibidas = seguro(async () => {
  if (!actual) return {};
  const s = await F.getDocs(F.query(F.collection(db, 'consultas'), F.where('vendedor', '==', actual.uid)));
  const r = {};
  for (const d of s.docs) {
    const x = d.data(); const t = x.at && x.at.toMillis ? x.at.toMillis() : 0;
    const a = r[x.pub] || (r[x.pub] = { total: 0, fechas: [] });
    a.total++; a.fechas.push(t);
  }
  return r;
});

export const marcarRevisado = seguro(async (id) => {
  await F.updateDoc(F.doc(db, 'publicaciones', id), { revisado: Date.now() });
});

// ---------- Comprador: favoritos y consultados (en la cuenta, sincronizados entre dispositivos) ----------
export const favoritos = seguro(async () => {
  if (!actual) return [];
  const s = await F.getDocs(F.collection(db, 'usuarios', actual.uid, 'favoritos'));
  return s.docs.map((d) => ({ id: d.id, ...d.data() })).sort((a, b) => b.at - a.at);
});
export const ponerFavorito = seguro(async (p, si) => {
  if (!actual) throw new Error('Ingresá para guardar favoritos en tu cuenta.');
  const ref = F.doc(db, 'usuarios', actual.uid, 'favoritos', p.id);
  if (si) await F.setDoc(ref, { titulo: p.titulo || '', precio: p.precio || 0, at: Date.now() });
  else await F.deleteDoc(ref);
});
export const consultados = seguro(async () => {
  if (!actual) return [];
  const s = await F.getDocs(F.collection(db, 'usuarios', actual.uid, 'consultados'));
  return s.docs.map((d) => ({ id: d.id, ...d.data() })).sort((a, b) => b.at - a.at);
});
