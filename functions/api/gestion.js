// Cloudflare Pages Function: GET /api/gestion
// Trae, SOLO LECTURA, el catálogo público de las tiendas de Pekerón Gestión que aceptaron aparecer en la Feria.
// - No usa contraseñas ni permisos especiales: lee lo mismo que muestra pekeronapp.com/<tienda> a cualquier visitante.
// - No escribe nada en Gestión.
// - Guarda una copia por 10 minutos, así los visitantes de la Feria no gastan las lecturas gratis de Firebase
//   que usan los clientes de Gestión (todos los visitantes comparten la misma copia).
//
// Para sumar una tienda: agregarla a TIENDAS (con su permiso). Más adelante esto lo reemplaza un interruptor
// "Mostrar mis productos en la Feria" dentro de Gestión.

const PROYECTO = 'controlcompraventa';
// Clave web pública de Firebase (la misma que ya está en firebase-config.js de Gestión; no es secreta).
const CLAVE = 'AIzaSyDvPJSTst4xGQtzIegLkpftpi7sN6r78b4';
const CATALOGO = 'https://pekeronapp.com/';
const MINUTOS = 10;

// slug de Gestión → cómo se ubica en la Feria.
const TIENDAS = {
  pekeron: { provincia: 'Tucumán', localidad: 'San Miguel de Tucumán', categoria: 'ropa' },
};

const SUBS = {
  ropa: [['zapatill', 'Zapatillas'], ['calzad', 'Calzado'], ['ojota', 'Calzado'], ['bota', 'Calzado'], ['sandalia', 'Calzado'],
    ['mochila', 'Bolsos y mochilas'], ['bolso', 'Bolsos y mochilas'], ['cartera', 'Bolsos y mochilas'], ['riñonera', 'Bolsos y mochilas'],
    ['gorra', 'Accesorios y bijou'], ['media', 'Accesorios y bijou'], ['accesor', 'Accesorios y bijou'], ['reloj', 'Accesorios y bijou'],
    ['niñ', 'Ropa de niños'], ['nene', 'Ropa de niños'], ['mujer', 'Ropa de mujer'], ['dama', 'Ropa de mujer'], ['hombre', 'Ropa de hombre']],
};

const BASE = `https://firestore.googleapis.com/v1/projects/${PROYECTO}/databases/(default)/documents/`;
let memoria = { t: 0, datos: null };

function valor(v) {
  if (!v) return null;
  if ('stringValue' in v) return v.stringValue;
  if ('integerValue' in v) return Number(v.integerValue);
  if ('doubleValue' in v) return Number(v.doubleValue);
  if ('booleanValue' in v) return v.booleanValue;
  if ('nullValue' in v) return null;
  if ('timestampValue' in v) return v.timestampValue;
  if ('mapValue' in v) return campos(v.mapValue.fields);
  if ('arrayValue' in v) return (v.arrayValue.values || []).map(valor);
  return null;
}
function campos(f = {}) { const o = {}; for (const k of Object.keys(f)) o[k] = valor(f[k]); return o; }
const idDe = (d) => decodeURIComponent(d.name.split('/').pop());

async function leer(ruta) {
  const r = await fetch(BASE + ruta + (ruta.includes('?') ? '&' : '?') + 'key=' + CLAVE);
  if (r.status === 404) return null;
  if (!r.ok) throw new Error(`Firestore ${r.status} en ${ruta.split('?')[0]}`);
  return r.json();
}
async function doc(ruta) { const j = await leer(ruta); return j && j.fields ? campos(j.fields) : null; }
async function coleccion(ruta) {
  const out = []; let token = '';
  for (let i = 0; i < 10; i++) {
    const j = await leer(ruta + '?pageSize=300' + (token ? '&pageToken=' + encodeURIComponent(token) : ''));
    for (const d of (j && j.documents) || []) out.push({ id: idDe(d), ...campos(d.fields) });
    token = j && j.nextPageToken; if (!token) break;
  }
  return out;
}

const img = (s) => (typeof s === 'string' && /^data:image\/(jpeg|png|webp);base64,/.test(s) ? s : '');
const clave = (s) => String(s || '').trim().toLowerCase();
function subDe(cat, texto) {
  const t = String(texto || '').toLowerCase();
  for (const [p, s] of SUBS[cat] || []) if (t.includes(p)) return s;
  return '';
}
function talleOrden(a, b) { const x = parseFloat(a), y = parseFloat(b); return (isNaN(x) || isNaN(y)) ? String(a).localeCompare(String(b)) : x - y; }

async function tiendaGestion(slug, cfg) {
  const s = await doc('slugs/' + encodeURIComponent(slug));
  if (!s || !s.sid) return null;
  const sid = s.sid;
  const info = await doc(`stores/${sid}/public/info`);
  if (!info || !info.enabled || info.susp) return null;
  const wa = ((info.was || []).find((x) => x && x.w) || {}).w || info.wa || '';
  const tienda = {
    slug, origen: 'gestion', nombre: info.name || slug, descripcion: info.tag || '',
    logo: img(info.logo), portada: '', whatsapp: wa, instagram: info.ig || '', direccion: info.addr || '',
    provincia: cfg.provincia, localidad: cfg.localidad, linkCatalogo: CATALOGO + (info.slug || slug),
  };
  const comun = {
    origen: 'gestion', uid: 'gestion:' + sid, tienda: slug, tiendaNombre: tienda.nombre, vendedorNombre: tienda.nombre,
    whatsapp: wa, provincia: cfg.provincia, localidad: cfg.localidad, barrio: '', estado: 'nuevo',
    disponibilidad: 'disponible', destacada: false, creado: null, linkCatalogo: tienda.linkCatalogo, categoria: cfg.categoria,
  };
  let pubs = [];
  if (info.alm) {
    // Almacén: lista de precios resumida por Gestión.
    const L = await doc(`stores/${sid}/public/lista`);
    if (L && L.n) {
      const partes = await Promise.all(Array.from({ length: L.n }, (_, i) => doc(`stores/${sid}/public/lista_d${i}`)));
      const fotos = {};
      const fs = await Promise.all(Array.from({ length: L.ni || 0 }, (_, i) => doc(`stores/${sid}/public/lista_i${i}`).catch(() => null)));
      for (const f of fs) for (const x of (f && f.f) || []) fotos[x.i] = img(x.f);
      for (const p of partes) for (const x of (p && p.p) || []) {
        if (!x.p || (x.q != null && x.q <= 0 && !x.w)) continue;
        pubs.push({ ...comun, id: `g-${slug}-${x.i}`, titulo: x.n || '', descripcion: x.d || '', precio: x.p,
          subcategoria: x.c || '', fotos: fotos[x.i] ? [fotos[x.i]] : [], variantes: { talles: [], colores: [] }, stock: null });
      }
    }
  } else {
    // Ropa, calzado y demás: una ficha por talle en stock/; se agrupan como en el catálogo de Gestión.
    const st = await coleccion(`stores/${sid}/stock`);
    const g = {};
    for (const x of st) {
      const k = clave(x.s || x.n);
      const a = g[k] || (g[k] = { k, n: '', d: '', cat: '', pn: 0, pm: 0, img: '', oh: false, q: 0, sz: [] });
      a.n = x.n || a.n; if (x.d) a.d = x.d; if (x.cat) a.cat = x.cat; if (x.pn) a.pn = x.pn; if (x.pm) a.pm = x.pm;
      if (x.img) a.img = x.img; if (x.oh) a.oh = true;
      a.q += Math.max(Number(x.q) || 0, 0);
      if (x.z && (x.q || 0) > 0) a.sz.push(String(x.z));
    }
    pubs = Object.values(g).filter((a) => !a.oh && a.q > 0 && (a.pn || a.pm)).map((a) => ({
      ...comun, id: `g-${slug}-${encodeURIComponent(a.k).slice(0, 120)}`, titulo: a.n, descripcion: a.d,
      precio: a.pn || a.pm, subcategoria: subDe(cfg.categoria, a.cat + ' ' + a.n) || '',
      fotos: img(a.img) ? [img(a.img)] : [], variantes: { talles: [...new Set(a.sz)].sort(talleOrden), colores: [] }, stock: a.q,
    }));
  }
  return { tienda, publicaciones: pubs };
}

async function armar() {
  const res = { tiendas: [], publicaciones: [], actualizado: Date.now(), errores: [] };
  await Promise.all(Object.entries(TIENDAS).map(async ([slug, cfg]) => {
    try {
      const t = await tiendaGestion(slug, cfg);
      if (t) { res.tiendas.push(t.tienda); res.publicaciones.push(...t.publicaciones); }
    } catch (e) { res.errores.push(`${slug}: ${e.message}`); }
  }));
  return res;
}

export async function onRequestGet({ request, waitUntil }) {
  const ahora = Date.now();
  const cache = typeof caches !== 'undefined' ? caches.default : null;
  const claveCache = new Request(new URL('/__cache/gestion-v1', request.url).toString());
  if (memoria.datos && ahora - memoria.t < MINUTOS * 60000) return responder(memoria.datos);
  if (cache) { const r = await cache.match(claveCache); if (r) return r; }
  const datos = await armar();
  if (!datos.errores.length) memoria = { t: ahora, datos };
  const r = responder(datos);
  if (cache && !datos.errores.length) waitUntil(cache.put(claveCache, r.clone()));
  return r;
}

function responder(datos) {
  return new Response(JSON.stringify(datos), {
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'cache-control': `public, max-age=300, s-maxage=${MINUTOS * 60}`,
      'access-control-allow-origin': '*',
    },
  });
}
