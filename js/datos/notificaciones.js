// Notificaciones de la campanita. Se arman con datos reales, nunca inventados:
// - Destacadas: novedades de la Feria y de Pekerón (config.js → anuncios).
// - Ventas: personas que consultaron por tus publicaciones desde la última vez que respondiste "¿Ya lo vendiste?".
// - Compras: favoritos que bajaron de precio o se vendieron, y consultados que ya se vendieron.
// - Tiendas: publicaciones nuevas de tiendas (últimos 14 días).
import { anuncios } from '../config.js';
import { fmtPrecio } from '../lib/util.js';

const VISTO = 'feria.notif.visto';
const DIA = 86400000;

export function ultimaVista() { try { return Number(localStorage.getItem(VISTO)) || 0; } catch { return 0; } }
export function marcarVistas() { try { localStorage.setItem(VISTO, String(Date.now())); } catch { /* nada */ } }

export async function armar(ctx) {
  const d = ctx.d, u = ctx.usuario, ahora = Date.now();
  const r = { destacadas: [], ventas: [], compras: [], tiendas: [] };

  for (const a of anuncios || []) {
    r.destacadas.push({ id: 'a-' + a.id, titulo: a.titulo, texto: a.texto, at: a.fecha ? Date.parse(a.fecha + 'T12:00:00-03:00') : 0,
      link: a.link, ilus: a.icono || 'estrella', externo: /^https:\/\//.test(a.link) });
  }

  const tareas = [];

  if (u) tareas.push((async () => {
    const [rec, mias] = await Promise.all([d.consultasRecibidas().catch(() => ({})), d.listar({ uid: u.uid, incluirOcultas: true })]);
    for (const p of mias) {
      const c = rec[p.id]; if (!c || p.disponibilidad !== 'disponible') continue;
      const nuevas = c.fechas.filter((x) => x > (p.revisado || 0));
      if (!nuevas.length) continue;
      r.ventas.push({ id: 'v-' + p.id, pub: p, at: Math.max(...nuevas), link: '#panel',
        titulo: nuevas.length === 1 ? '1 persona te consultó' : `${nuevas.length} personas te consultaron`,
        texto: `Por “${p.titulo}”. ¿Ya lo vendiste? Contanos desde tu panel.` });
    }
  })());

  tareas.push((async () => {
    const [favs, cons] = await Promise.all([d.favoritos().catch(() => []), d.consultados().catch(() => [])]);
    const vistos = new Set();
    for (const f of favs.slice(0, 30)) {
      const p = await d.publicacion(f.id).catch(() => null);
      vistos.add(f.id);
      if (!p) continue;
      if (p.disponibilidad === 'vendida') {
        r.compras.push({ id: 'fv-' + f.id, pub: p, at: p.actualizado || f.at, link: '#producto-' + p.id, titulo: 'Un favorito se vendió', texto: `“${p.titulo}” ya no está disponible.` });
      } else if (f.precio && p.precio < f.precio && p.disponibilidad === 'disponible') {
        r.compras.push({ id: 'fp-' + f.id + '-' + p.precio, pub: p, at: p.actualizado || ahora, link: '#producto-' + p.id,
          titulo: '¡Bajó de precio!', texto: `“${p.titulo}” ahora está ${fmtPrecio(p.precio)} (antes ${fmtPrecio(f.precio)}).` });
      }
    }
    for (const c of cons.slice(0, 20)) {
      if (vistos.has(c.id)) continue;
      const p = await d.publicacion(c.id).catch(() => null);
      if (p && p.disponibilidad === 'vendida') {
        r.compras.push({ id: 'cv-' + c.id, pub: p, at: p.actualizado || c.at, link: '#producto-' + p.id, titulo: 'Se vendió algo que consultaste', texto: `“${p.titulo}” ya fue vendido.` });
      }
    }
  })());

  tareas.push((async () => {
    const l = await d.listar({ limite: 80 });
    for (const p of l) {
      if (!p.tienda || !p.creado || ahora - p.creado > 14 * DIA || (u && p.uid === u.uid)) continue;
      r.tiendas.push({ id: 't-' + p.id, pub: p, at: p.creado, link: '#producto-' + p.id,
        titulo: `${p.tiendaNombre || 'Una tienda'} publicó algo nuevo`, texto: `${p.titulo} · ${fmtPrecio(p.precio)}` });
      if (r.tiendas.length >= 15) break;
    }
  })());

  await Promise.all(tareas.map((t) => t.catch((e) => console.warn('notificaciones', e))));
  for (const k of Object.keys(r)) r[k].sort((a, b) => b.at - a.at);
  return r;
}

export function contarNuevas(r, desde = ultimaVista()) {
  return Object.values(r).flat().filter((n) => n.at > desde).length;
}
