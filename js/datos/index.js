// Elige el backend: Firebase si hay configuración en config.js; si no, modo prueba local.
import { firebase as cfg } from '../config.js';

let api = null;

export async function iniciarDatos() {
  const hayFirebase = cfg && cfg.apiKey && cfg.projectId;
  if (hayFirebase) {
    try {
      const m = await import('./firebase.js');
      await m.iniciar(cfg);
      api = m;
      return api;
    } catch (e) {
      console.error('No se pudo conectar con Firebase', e);
      throw new Error('No se pudo conectar con el servidor. Revisá tu conexión y recargá la página.');
    }
  }
  const m = await import('./local.js');
  await m.iniciar();
  api = m;
  return api;
}

export const datos = () => api;
