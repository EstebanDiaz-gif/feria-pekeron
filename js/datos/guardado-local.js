// Listas guardadas en este navegador: favoritos y consultados de quien no ingresó, y "vistos recientemente".
const pref = 'feria.lista.';

function leer(k) { try { const v = JSON.parse(localStorage.getItem(pref + k) || '[]'); return Array.isArray(v) ? v : []; } catch { return []; } }
function escribir(k, v) { try { localStorage.setItem(pref + k, JSON.stringify(v.slice(0, 100))); } catch { /* sin espacio o sin permiso */ } }

export const lista = (k) => leer(k).sort((a, b) => b.at - a.at);
export function poner(k, p) {
  const v = leer(k).filter((x) => x.id !== p.id);
  v.unshift({ id: p.id, titulo: p.titulo || '', precio: p.precio || 0, at: Date.now() });
  escribir(k, v);
}
export function quitar(k, id) { escribir(k, leer(k).filter((x) => x.id !== id)); }
export const tiene = (k, id) => leer(k).some((x) => x.id === id);
