// Selector de provincia y localidad (sirve para "cerca tuyo" y para los formularios).
import { hoja } from '../lib/dom.js';
import { esc } from '../lib/util.js';
import { PROVINCIAS, LOCALIDADES } from '../datos/catalogo.js';

// Campos de ubicación reutilizables. `pre` = prefijo de los name.
export function camposUbicacion(v = {}, { barrio = true, requerido = true } = {}) {
  const prov = v.provincia || 'Tucumán';
  return `<div class="campo"><label for="u-prov">Provincia</label>
      <select id="u-prov" name="provincia" ${requerido ? 'required' : ''}>
      ${PROVINCIAS.map((p) => `<option ${p === prov ? 'selected' : ''}>${esc(p)}</option>`).join('')}</select></div>
    <div class="campo"><label for="u-loc">Localidad</label>
      <input id="u-loc" name="localidad" list="u-locs" value="${esc(v.localidad || '')}" ${requerido ? 'required' : ''} autocomplete="address-level2" placeholder="Ej.: San Miguel de Tucumán">
      <datalist id="u-locs">${(LOCALIDADES[prov] || []).map((l) => `<option value="${esc(l)}">`).join('')}</datalist></div>
    ${barrio ? `<div class="campo"><label for="u-barrio">Barrio <span class="opc">(opcional)</span></label>
      <input id="u-barrio" name="barrio" value="${esc(v.barrio || '')}" maxlength="60" placeholder="Ej.: Barrio Norte"></div>` : ''}`;
}

// Al cambiar la provincia, actualiza las sugerencias de localidad.
export function enlazarUbicacion(root) {
  const s = root.querySelector('#u-prov'), dl = root.querySelector('#u-locs'), loc = root.querySelector('#u-loc');
  if (!s) return;
  s.addEventListener('change', () => {
    dl.innerHTML = (LOCALIDADES[s.value] || []).map((l) => `<option value="${esc(l)}">`).join('');
    loc.value = '';
  });
}

export function elegirZona(zona) {
  return new Promise((ok) => {
    let r = null;
    const { el, cerrar } = hoja(`<form class="form" data-f>
        <p class="txt-sec">Te mostramos primero lo que se vende en tu zona.</p>
        ${camposUbicacion(zona, { barrio: false })}
        <button class="btn btn-pri ancho" type="submit">Ver esta zona</button>
        <button class="btn btn-sec ancho" type="button" data-todo>Ver todo ${esc('el país')}</button>
      </form>`, { titulo: '¿Dónde estás?', alCerrar: () => ok(r) });
    enlazarUbicacion(el);
    const f = el.querySelector('[data-f]');
    f.onsubmit = (e) => {
      e.preventDefault();
      const d = new FormData(f);
      r = { provincia: d.get('provincia'), localidad: String(d.get('localidad') || '').trim() };
      cerrar();
    };
    el.querySelector('[data-todo]').onclick = () => { r = { provincia: '', localidad: '' }; cerrar(); };
  });
}
