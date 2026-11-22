// Utilidades puras (sin DOM): se prueban con `node --test`.

export function esc(v) {
  return String(v ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

// Solo dejamos pasar imágenes guardadas por la propia app (data:image/...).
export function srcSeguro(v) {
  return typeof v === 'string' && /^data:image\/(jpeg|png|webp);base64,[A-Za-z0-9+/=]+$/.test(v) ? v : '';
}

export function normalizar(t) {
  return String(t ?? '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9ñ\s]/g, ' ').replace(/\s+/g, ' ').trim();
}

// Palabras para buscar (se guardan con la publicación; sirven también para Firestore array-contains).
export function palabras(...textos) {
  const set = new Set();
  for (const t of textos) for (const w of normalizar(t).split(' ')) if (w.length >= 2) set.add(w);
  return [...set].slice(0, 60);
}

export function coincide(pub, consulta) {
  const q = palabras(consulta);
  if (!q.length) return true;
  const p = pub.palabras || palabras(pub.titulo, pub.descripcion);
  return q.every((w) => p.some((x) => x.startsWith(w)));
}

export function fmtPrecio(n) {
  const v = Number(n);
  if (!Number.isFinite(v)) return '';
  return '$ ' + Math.round(v).toLocaleString('es-AR');
}

export function hace(ms, ahora = Date.now()) {
  const s = Math.max(0, Math.round((ahora - ms) / 1000));
  if (s < 60) return 'recién';
  const m = Math.round(s / 60); if (m < 60) return `hace ${m} min`;
  const h = Math.round(m / 60); if (h < 24) return `hace ${h} h`;
  const d = Math.round(h / 24); if (d === 1) return 'ayer';
  if (d < 30) return `hace ${d} días`;
  const me = Math.round(d / 30); return me <= 1 ? 'hace un mes' : `hace ${me} meses`;
}

// WhatsApp de Argentina: devuelve 549 + código de área + número, o '' si no parece válido.
// Acepta "381 15 512-3456", "0381 5123456", "+54 9 381 5123456", "3815123456".
export function waNumero(entrada) {
  let d = String(entrada ?? '').replace(/\D/g, '');
  if (!d) return '';
  if (d.startsWith('549')) d = d.slice(3);
  else if (d.startsWith('54')) d = d.slice(2);
  if (d.startsWith('0')) d = d.slice(1);
  // Saca el "15" que va después del código de área (área de 2, 3 o 4 dígitos).
  if (d.length === 12) {
    for (const a of [2, 3, 4]) if (d.slice(a, a + 2) === '15') { d = d.slice(0, a) + d.slice(a + 2); break; }
  }
  return d.length === 10 ? '549' + d : '';
}

export function waLink(numero, texto) {
  const n = waNumero(numero);
  if (!n) return '';
  return `https://wa.me/${n}${texto ? '?text=' + encodeURIComponent(texto) : ''}`;
}

// Nombre de tienda → dirección corta (feria.../#tienda-nombre).
export function slug(t) {
  return normalizar(t).replace(/ñ/g, 'n').replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '').replace(/-+/g, '-').replace(/^-|-$/g, '').slice(0, 40);
}

export function idNuevo(n = 12) {
  const A = 'abcdefghjkmnpqrstuvwxyz23456789';
  const r = crypto.getRandomValues(new Uint8Array(n));
  return Array.from(r, (x) => A[x % A.length]).join('');
}
