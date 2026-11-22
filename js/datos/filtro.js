// Filtros y orden que se aplican en el celular (Firestore solo filtra por disponibilidad + un campo).
import { coincide } from '../lib/util.js';

export function filtrar(l, f = {}) {
  if (f.tienda) l = l.filter((p) => p.tienda === f.tienda);
  if (f.categoria) l = l.filter((p) => p.categoria === f.categoria);
  if (f.sub) l = l.filter((p) => p.subcategoria === f.sub);
  if (f.estado) l = l.filter((p) => p.estado === f.estado);
  if (f.provincia) l = l.filter((p) => p.provincia === f.provincia);
  if (f.localidad) l = l.filter((p) => p.localidad === f.localidad);
  if (f.soloDestacadas) l = l.filter((p) => p.destacada === true);
  if (f.q) l = l.filter((p) => coincide(p, f.q));
  return l;
}

export function ordenar(l, orden = 'recientes') {
  const c = orden === 'precio-asc' ? (a, b) => a.precio - b.precio
    : orden === 'precio-desc' ? (a, b) => b.precio - a.precio
    : (a, b) => (b.creado || 0) - (a.creado || 0);
  return [...l].sort(c);
}
