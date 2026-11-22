// Elige el backend: Firebase si hay configuración en config.js; si no, modo prueba local.
// Encima suma, solo lectura, las tiendas de Pekerón Gestión conectadas a la Feria (datos/gestion.js).
import { firebase as cfg } from '../config.js';
import { slug as aSlug } from '../lib/util.js';
import * as G from './gestion.js';

let api = null;

export async function iniciarDatos() {
  let base;
  const hayFirebase = cfg && cfg.apiKey && cfg.projectId;
  if (hayFirebase) {
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
  api = conGestion(base);
  return api;
}

function conGestion(base) {
  return {
    ...base,
    get memoria() { return base.memoria; },
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
  };
}

export const datos = () => api;
