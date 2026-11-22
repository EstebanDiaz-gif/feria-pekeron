// Elige el backend: Firebase (datos reales) en los dominios publicados de la Feria; en cualquier otro lado
// (la compu de desarrollo, una vista previa) modo prueba local, para no mezclar pruebas con datos reales.
// Encima suma, solo lectura, las tiendas de Pekerón Gestión conectadas a la Feria (datos/gestion.js).
import { firebase as cfg, dominiosReales } from '../config.js';
import { slug as aSlug } from '../lib/util.js';
import * as G from './gestion.js';
import * as L from './guardado-local.js';

let api = null;

function usarFirebase() {
  try { const m = localStorage.getItem('feria.modo'); if (m === 'local') return false; if (m === 'firebase') return true; } catch { /* nada */ }
  const h = location.hostname;
  return dominiosReales.some((d) => h === d || h.endsWith('.' + d));
}

export async function iniciarDatos() {
  let base;
  if (cfg && cfg.apiKey && usarFirebase()) {
    try {
      base = await import('./firebase.js');
      await base.iniciar(cfg);
    } catch (e) {
      console.error('No se pudo conectar con Firebase', e);
      throw new Error('No se pudo conectar con el servidor. Revisá tu conexión y recargá la página.');
    }
  } else {
    base = await import('./local.js');
    await base.iniciar();
  }
  G.cargar(); // empieza a traer las tiendas de Gestión en paralelo
  api = conExtras(base);
  return api;
}

function conExtras(base) {
  const quien = () => { const u = base.auth.actual(); return u ? u.uid : 'anon'; };
  const unir = (a, b) => { const v = new Map(); for (const x of [...a, ...b]) if (!v.has(x.id) || v.get(x.id).at < x.at) v.set(x.id, x); return [...v.values()].sort((x, y) => y.at - x.at); };
  return {
    ...base,
    get memoria() { return base.memoria; },

    // ---- Publicaciones y tiendas (propias + Gestión) ----
    async listar(f = {}) {
      const propias = await base.listar(f);
      if (f.uid || f.incluirOcultas || f.soloDestacadas) return propias;
      const g = await G.cargar();
      const extra = G.filtrar(g.publicaciones, f);
      if (!extra.length) return propias;
      const todo = G.ordenar([...propias, ...extra], f.orden);
      return f.limite ? todo.slice(0, f.limite) : todo;
    },
    async publicacion(id) {
      if (String(id).startsWith('g-')) return (await G.cargar()).publicaciones.find((p) => p.id === id) || null;
      return base.publicacion(id);
    },
    async tienda(s) {
      const g = (await G.cargar()).tiendas.find((t) => t.slug === s);
      return g || base.tienda(s);
    },
    async listarTiendas(f = {}) {
      const [propias, g] = await Promise.all([base.listarTiendas(f), G.cargar()]);
      const ext = g.tiendas.filter((t) => !f.localidad || t.localidad === f.localidad);
      return [...ext, ...propias.filter((t) => !ext.some((e) => e.slug === t.slug))];
    },
    async guardarTienda(d) {
      const previa = base.auth.actual() ? await base.tiendaDeUsuario(base.auth.actual().uid) : null;
      if (!previa && (await G.cargar()).tiendas.some((t) => t.slug === aSlug(d.nombre))) {
        throw new Error('Ese nombre ya lo usa una tienda de Pekerón. Probá con otro.');
      }
      return base.guardarTienda(d);
    },

    // ---- Comprador ----
    // Sin cuenta: se guarda en este navegador. Con cuenta: en la cuenta (Firebase) o en el perfil de prueba (local).
    async registrarConsulta(p) {
      const g = String(p.id).startsWith('g-');
      if (!g) await base.registrarConsulta(p);
      if (g || !base.auth.actual()) L.poner('consultados.' + quien(), p);
    },
    async consultados() {
      const propios = base.auth.actual() ? await base.consultados() : [];
      return unir(propios, L.lista('consultados.' + quien()));
    },
    async favoritos() {
      return base.auth.actual() ? base.favoritos() : L.lista('favoritos.anon');
    },
    async ponerFavorito(p, si) {
      if (base.auth.actual()) return base.ponerFavorito(p, si);
      if (si) L.poner('favoritos.anon', p); else L.quitar('favoritos.anon', p.id);
    },
    async esFavorito(id) { return (await this.favoritos()).some((x) => x.id === id); },
    registrarVisto(p) { L.poner('vistos', p); },
    vistos() { return L.lista('vistos'); },
  };
}

export const datos = () => api;
