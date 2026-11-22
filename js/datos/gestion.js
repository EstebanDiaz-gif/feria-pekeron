// Tiendas de Pekerón Gestión dentro de la Feria (solo lectura).
// Los datos llegan de /api/gestion (functions/api/gestion.js), que lee el catálogo público de cada tienda conectada.
// Sus publicaciones se mezclan con las de la Feria pero no se pueden editar acá: se manejan desde Gestión.
import { palabras, coincide } from '../lib/util.js';

const VACIO = { tiendas: [], publicaciones: [] };
let prom = null;

export function cargar() {
  if (!prom) {
    prom = fetch('api/gestion', { headers: { accept: 'application/json' } })
      .then((r) => (r.ok && (r.headers.get('content-type') || '').includes('json') ? r.json() : VACIO))
      .then((d) => {
        const pubs = (d.publicaciones || []).map((p) => ({ ...p, palabras: palabras(p.titulo, p.descripcion, p.subcategoria, p.tiendaNombre) }));
        return { tiendas: d.tiendas || [], publicaciones: pubs };
      })
      .catch(() => VACIO);
  }
  return prom;
}

export function filtrar(l, f = {}) {
  if (f.uid) return [];
  if (f.soloDestacadas) return [];
  if (f.tienda) l = l.filter((p) => p.tienda === f.tienda);
  if (f.categoria) l = l.filter((p) => p.categoria === f.categoria);
  if (f.sub) l = l.filter((p) => p.subcategoria === f.sub);
  if (f.estado) l = l.filter((p) => p.estado === f.estado);
  if (f.provincia) l = l.filter((p) => p.provincia === f.provincia);
  if (f.localidad) l = l.filter((p) => p.localidad === f.localidad);
  if (f.q) l = l.filter((p) => coincide(p, f.q));
  return l;
}

export function ordenar(l, orden = 'recientes') {
  const c = orden === 'precio-asc' ? (a, b) => a.precio - b.precio
    : orden === 'precio-desc' ? (a, b) => b.precio - a.precio
    : (a, b) => (b.creado || 0) - (a.creado || 0);
  return [...l].sort(c);
}
