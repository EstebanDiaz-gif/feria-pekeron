// BACKEND REAL: Firebase Authentication (correo y contraseña) + Firestore.
// Proyecto de Firebase PROPIO de la Feria: nunca el de Pekerón Gestión (`controlcompraventa`),
// que ya usa colecciones como users/, stores/ y productos/.
//
// Estado: código escrito con la misma versión del SDK que usa Pekerón Gestión (10.12.2),
// pero todavía no probado contra un proyecto real porque ese proyecto aún no existe.
import { palabras, coincide, idNuevo, slug as aSlug } from '../lib/util.js';

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
  const w = [F.orderBy('actualizado', 'desc'), F.limit(60)];
  if (localidad) w.unshift(F.where('localidad', '==', localidad));
  const s = await F.getDocs(F.query(F.collection(db, 'tiendas'), ...w));
  return s.docs.map((d) => ({ slug: d.id, ...d.data() }));
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

// Firestore no tiene búsqueda por texto: se filtra por la primera palabra en el servidor
// (array-contains sobre `palabras`) y el resto en el celular. Para algo mejor, más adelante: Algolia/Typesense.
// Cada combinación de filtros + orden necesita un índice compuesto: Firestore muestra el link para crearlo.
export const listar = seguro(async (f = {}) => {
  const w = [];
  if (!f.incluirOcultas) w.push(F.where('disponibilidad', '==', 'disponible'));
  for (const k of ['uid', 'tienda', 'categoria', 'estado', 'provincia', 'localidad']) if (f[k]) w.push(F.where(k, '==', f[k]));
  if (f.sub) w.push(F.where('subcategoria', '==', f.sub));
  if (f.soloDestacadas) w.push(F.where('destacada', '==', true));
  const q1 = palabras(f.q)[0];
  if (q1) w.push(F.where('palabras', 'array-contains', q1));
  const o = f.orden || 'recientes';
  w.push(o === 'precio-asc' ? F.orderBy('precio', 'asc') : o === 'precio-desc' ? F.orderBy('precio', 'desc') : F.orderBy('creado', 'desc'));
  w.push(F.limit(f.limite || 60));
  const s = await F.getDocs(F.query(F.collection(db, 'publicaciones'), ...w));
  let l = s.docs.map((d) => ({ id: d.id, ...d.data() }));
  if (f.q) l = l.filter((p) => coincide(p, f.q));
  return l;
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
