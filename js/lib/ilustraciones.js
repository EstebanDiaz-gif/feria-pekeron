// Ilustraciones a color (estilo "sticker" con volumen) para categorías, accesos y notificaciones.
// Formas planas + brillos blancos semitransparentes: se ven bien chicas y pesan muy poco. Sin degradados con id,
// así se pueden repetir muchas veces en la misma pantalla.
const S = (c) => `<svg class="ilus" viewBox="0 0 64 64" aria-hidden="true" focusable="false">${c}</svg>`;
const sombra = '<ellipse cx="32" cy="58" rx="18" ry="3" fill="#000" opacity=".10"/>';
const brillo = (x, y, w, h, r = 3) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${r}" fill="#fff" opacity=".35"/>`;

const D = {
  // ---- categorías ----
  remera: sombra + `<path d="M23 9 9 16l5 12 6-3v29h24V25l6 3 5-12-14-7c-1.6 4.4-5.6 7-9 7s-7.4-2.6-9-7z" fill="#F06595"/>
    <path d="M23 9c1.6 4.4 5.6 7 9 7s7.4-2.6 9-7l-3-1c-1.2 3-3.4 5-6 5s-4.8-2-6-5z" fill="#C2255C"/>
    <path d="M20 25v29h6V22z" fill="#fff" opacity=".22"/><rect x="34" y="30" width="7" height="5" rx="1.5" fill="#FFD43B"/>`,
  celular: sombra + `<rect x="18" y="5" width="28" height="51" rx="7" fill="#1F2A44"/><rect x="21" y="10" width="22" height="40" rx="3.5" fill="#4C8DFF"/>
    <path d="M21 30c6-3 15-2 22 1v15.5a3.5 3.5 0 0 1-3.5 3.5h-15A3.5 3.5 0 0 1 21 46.5z" fill="#2F6BE8"/>
    <rect x="28" y="7" width="8" height="2" rx="1" fill="#3B4A6B"/>${brillo(23, 12, 4, 15, 2)}
    <circle cx="27" cy="20" r="2.5" fill="#FFD43B"/><circle cx="35" cy="20" r="2.5" fill="#69DB7C"/><circle cx="27" cy="27" r="2.5" fill="#FF8787"/><circle cx="35" cy="27" r="2.5" fill="#fff"/>`,
  casa: sombra + `<path d="M12 30 32 12l20 18v24H12z" fill="#FFE8CC"/><path d="M7 31 32 9l25 22-3.5 3.5L32 15 10.5 34.5z" fill="#F76707"/>
    <rect x="42" y="12" width="6" height="11" rx="1" fill="#C2410C"/><rect x="27" y="38" width="10" height="16" rx="2" fill="#B45309"/>
    <rect x="16" y="35" width="8" height="8" rx="1.5" fill="#74C0FC"/><rect x="40" y="35" width="8" height="8" rx="1.5" fill="#74C0FC"/>
    <circle cx="34.5" cy="46.5" r="1" fill="#FFE8CC"/>${brillo(16, 35, 3, 8, 1)}`,
  herramienta: sombra + `<rect x="9" y="26" width="46" height="26" rx="5" fill="#E03131"/><rect x="9" y="26" width="46" height="9" rx="4" fill="#C92A2A"/>
    <path d="M24 26v-5a3 3 0 0 1 3-3h10a3 3 0 0 1 3 3v5h-4v-4h-8v4z" fill="#343A40"/>
    <rect x="28" y="33" width="8" height="6" rx="1.5" fill="#FFD43B"/><rect x="12" y="38" width="40" height="3" rx="1.5" fill="#fff" opacity=".25"/>
    <path d="M47 6l4 4-10 14-3-3z" fill="#ADB5BD"/><path d="M38 21l3 3-3 3-3-3z" fill="#FAB005"/>`,
  moto: sombra + `<circle cx="16" cy="40" r="11" fill="none" stroke="#12B886" stroke-width="5"/><circle cx="48" cy="40" r="11" fill="none" stroke="#12B886" stroke-width="5"/>
    <circle cx="16" cy="40" r="3" fill="#087F5B"/><circle cx="48" cy="40" r="3" fill="#087F5B"/>
    <path d="M16 40l10-16h16l6 16M26 24l7 16h-17M33 40l9-16" fill="none" stroke="#F59F00" stroke-width="4" stroke-linejoin="round" stroke-linecap="round"/>
    <rect x="21" y="18" width="11" height="4" rx="2" fill="#343A40"/><path d="M41 24l3-7h5" fill="none" stroke="#343A40" stroke-width="3.5" stroke-linecap="round"/>`,
  belleza: sombra + `<rect x="27" y="7" width="10" height="9" rx="2" fill="#FFD43B"/><rect x="29" y="15" width="6" height="5" fill="#FAB005"/>
    <rect x="15" y="19" width="34" height="36" rx="10" fill="#DA77F2"/><rect x="15" y="34" width="34" height="21" rx="10" fill="#BE4BDB"/>
    <rect x="23" y="31" width="18" height="11" rx="3" fill="#fff" opacity=".9"/><circle cx="32" cy="36.5" r="2.5" fill="#BE4BDB"/>${brillo(19, 23, 5, 22)}`,
  juguete: sombra + `<circle cx="18" cy="15" r="7" fill="#D9480F"/><circle cx="46" cy="15" r="7" fill="#D9480F"/><circle cx="18" cy="15" r="3.5" fill="#FFC078"/><circle cx="46" cy="15" r="3.5" fill="#FFC078"/>
    <circle cx="32" cy="30" r="18" fill="#E8590C"/><ellipse cx="32" cy="37" rx="9" ry="7" fill="#FFC078"/>
    <circle cx="25" cy="27" r="2.6" fill="#212529"/><circle cx="39" cy="27" r="2.6" fill="#212529"/><ellipse cx="32" cy="34" rx="3" ry="2.2" fill="#212529"/>
    <path d="M28.5 39q3.5 3 7 0" fill="none" stroke="#212529" stroke-width="1.8" stroke-linecap="round"/><circle cx="21" cy="21" r="3" fill="#fff" opacity=".3"/>`,
  pelota: sombra + `<circle cx="32" cy="31" r="22" fill="#FD7E14"/><circle cx="32" cy="31" r="22" fill="none" stroke="#C2410C" stroke-width="2"/>
    <path d="M10 31h44M32 9v44" stroke="#7A2E05" stroke-width="2.6"/>
    <path d="M17 15c6 5 9 10 9 16s-3 11-9 16M47 15c-6 5-9 10-9 16s3 11 9 16" fill="none" stroke="#7A2E05" stroke-width="2.6"/>
    <ellipse cx="22" cy="18" rx="6" ry="3.5" fill="#fff" opacity=".35" transform="rotate(-30 22 18)"/>`,
  canasta: sombra + `<path d="M24 24 19 9" stroke="#FAB005" stroke-width="7" stroke-linecap="round"/><path d="M36 24l6-17" stroke="#2F9E44" stroke-width="5" stroke-linecap="round"/>
    <circle cx="44" cy="10" r="5" fill="#51CF66"/><rect x="28" y="12" width="7" height="13" rx="2" fill="#C92A2A"/>
    <path d="M8 24h48l-5 28a4 4 0 0 1-4 3H17a4 4 0 0 1-4-3z" fill="#E8590C"/>
    <path d="M14 33h36M15.5 42h33M24 24l2 31M40 24l-2 31M32 24v31" stroke="#B8460A" stroke-width="2"/><rect x="8" y="22" width="48" height="6" rx="3" fill="#C2410C"/>`,
  mascota: sombra + `<ellipse cx="32" cy="40" rx="13" ry="11" fill="#7048E8"/>
    <ellipse cx="16" cy="25" rx="6" ry="7.5" fill="#845EF7"/><ellipse cx="48" cy="25" rx="6" ry="7.5" fill="#845EF7"/>
    <ellipse cx="25" cy="14" rx="5.5" ry="7" fill="#845EF7"/><ellipse cx="39" cy="14" rx="5.5" ry="7" fill="#845EF7"/>
    <ellipse cx="27" cy="36" rx="4" ry="3" fill="#fff" opacity=".3"/>`,
  servicio: sombra + `<path d="M10 36a22 20 0 0 1 44 0z" fill="#FCC419"/><rect x="6" y="35" width="52" height="7" rx="3.5" fill="#FAB005"/>
    <rect x="29" y="15" width="6" height="21" rx="3" fill="#F59F00"/><path d="M14 36a18 17 0 0 1 12-15" fill="none" stroke="#fff" stroke-width="3" opacity=".45" stroke-linecap="round"/>
    <rect x="14" y="45" width="36" height="9" rx="4.5" fill="#495057"/><rect x="18" y="47.5" width="10" height="4" rx="2" fill="#ADB5BD"/>`,
  caja: sombra + `<rect x="9" y="24" width="46" height="31" rx="4" fill="#339AF0"/><rect x="6" y="17" width="52" height="11" rx="3" fill="#228BE6"/>
    <rect x="28" y="17" width="8" height="38" fill="#FFD43B"/><path d="M32 17c-6-10-16-9-14-3 1.4 4 10 3 14 3zM32 17c6-10 16-9 14-3-1.4 4-10 3-14 3z" fill="#FAB005"/>${brillo(12, 30, 4, 20)}`,

  // ---- accesos ----
  grilla: sombra + `<rect x="10" y="10" width="19" height="19" rx="6" fill="#4C6EF5"/><rect x="35" y="10" width="19" height="19" rx="6" fill="#FFD43B"/>
    <rect x="10" y="35" width="19" height="19" rx="6" fill="#FF6B6B"/><rect x="35" y="35" width="19" height="19" rx="6" fill="#20C997"/>${brillo(13, 13, 5, 9, 2.5)}`,
  ubicacion: sombra + `<path d="M8 50l12-6 12 6 12-6 12 6V24l-12-6-12 6-12-6-12 6z" fill="#D3F9D8"/><path d="M20 18v32M32 24v32M44 18v32" stroke="#8CE99A" stroke-width="2"/>
    <path d="M32 46S18 33 18 22a14 14 0 0 1 28 0c0 11-14 24-14 24z" fill="#F03E3E"/><circle cx="32" cy="22" r="5.5" fill="#fff"/>${brillo(22, 13, 4, 10, 2)}`,
  tienda: sombra + `<rect x="10" y="26" width="44" height="28" rx="3" fill="#FFF4E6"/><rect x="26" y="36" width="12" height="18" rx="2" fill="#1D3FAF"/>
    <rect x="14" y="33" width="9" height="9" rx="1.5" fill="#74C0FC"/><rect x="41" y="33" width="9" height="9" rx="1.5" fill="#74C0FC"/>
    <path d="M8 12h48l2 12a6 6 0 0 1-12 0 6 6 0 0 1-12 0 6 6 0 0 1-12 0 6 6 0 0 1-12 0z" fill="#FFD43B"/>
    <path d="M18 12l-2 12a6 6 0 0 0 12 0V12zM36 12v12a6 6 0 0 0 12 0l-2-12z" fill="#1D3FAF"/>`,
  vender: sombra + `<path d="M8 30 30 8h20a6 6 0 0 1 6 6v20L34 56z" fill="#FFD43B"/><path d="M8 30 30 8h8L16 38z" fill="#fff" opacity=".35"/>
    <circle cx="44" cy="20" r="5" fill="#fff"/><circle cx="44" cy="20" r="2.5" fill="#F59F00"/>
    <path d="M28 27v16M21 35h14" stroke="#102468" stroke-width="5" stroke-linecap="round"/>`,
  usados: sombra + `<path d="M32 8a24 24 0 0 1 20.8 12l-6.2 3.6A16.8 16.8 0 0 0 32 15.2z" fill="#40C057"/><path d="M47 13l8 4-1 9z" fill="#40C057"/>
    <path d="M52 40a24 24 0 0 1-21 15.9l-.4-7.2A16.8 16.8 0 0 0 45.3 37z" fill="#2F9E44"/><path d="M36 53l-7 5-1-8z" fill="#2F9E44"/>
    <path d="M14 46A24 24 0 0 1 9.6 22l6.6 3A16.8 16.8 0 0 0 20 42z" fill="#69DB7C"/><path d="M12 15l-1 9 8-3z" fill="#69DB7C"/>
    <circle cx="32" cy="32" r="8" fill="#FFD43B"/>`,
  corazon: sombra + `<path d="M32 54S8 40 8 23a12 12 0 0 1 24-4 12 12 0 0 1 24 4c0 17-24 31-24 31z" fill="#FA5252"/>
    <path d="M32 54S8 40 8 23a12 12 0 0 1 6-10.4C13 30 32 46 32 46z" fill="#E03131"/><ellipse cx="18" cy="20" rx="4" ry="6" fill="#fff" opacity=".4" transform="rotate(-25 18 20)"/>`,
  panel: sombra + `<rect x="8" y="10" width="48" height="36" rx="5" fill="#102468"/><rect x="12" y="14" width="40" height="28" rx="2.5" fill="#E7F5FF"/>
    <rect x="17" y="30" width="6" height="9" rx="1.5" fill="#4C6EF5"/><rect x="26" y="24" width="6" height="15" rx="1.5" fill="#20C997"/><rect x="35" y="19" width="6" height="20" rx="1.5" fill="#FAB005"/>
    <path d="M44 22l3-4 3 2" stroke="#FA5252" stroke-width="2.4" fill="none" stroke-linecap="round"/><rect x="24" y="46" width="16" height="4" fill="#495057"/><rect x="18" y="50" width="28" height="4" rx="2" fill="#343A40"/>`,
  descargar: sombra + `<rect x="18" y="5" width="28" height="51" rx="7" fill="#1D3FAF"/><rect x="21" y="10" width="22" height="40" rx="3.5" fill="#FFF6E9"/>
    <path d="M32 17v18M25 29l7 7 7-7" stroke="#1D3FAF" stroke-width="4" fill="none" stroke-linecap="round" stroke-linejoin="round"/><rect x="26" y="40" width="12" height="3.5" rx="1.75" fill="#FFD43B"/>`,
  chat: sombra + `<path d="M32 8C18 8 8 17 8 28c0 6 3 11 8 15l-2 10 11-6c2 .5 4.5 1 7 1 14 0 24-9 24-20S46 8 32 8z" fill="#20C997"/>
    <circle cx="22" cy="28" r="3.5" fill="#fff"/><circle cx="32" cy="28" r="3.5" fill="#fff"/><circle cx="42" cy="28" r="3.5" fill="#fff"/>${brillo(14, 16, 10, 4, 2)}`,
  ojo: sombra + `<path d="M4 32s11-18 28-18 28 18 28 18-11 18-28 18S4 32 4 32z" fill="#E5DBFF"/><circle cx="32" cy="32" r="12" fill="#7950F2"/>
    <circle cx="32" cy="32" r="5.5" fill="#212529"/><circle cx="36" cy="28" r="3" fill="#fff"/>`,
  campana: sombra + `<path d="M32 8a4 4 0 0 1 4 4v1.5c8 2 13 9 13 18V42l5 6H10l5-6V31.5c0-9 5-16 13-18V12a4 4 0 0 1 4-4z" fill="#FCC419"/>
    <path d="M15 42l-5 6h44l-5-6z" fill="#FAB005"/><circle cx="32" cy="53" r="5" fill="#F08C00"/><path d="M22 22a12 12 0 0 1 6-6" stroke="#fff" stroke-width="3" opacity=".5" fill="none" stroke-linecap="round"/>`,
  estrella: sombra + `<rect x="14" y="6" width="36" height="48" rx="5" fill="#FFD43B"/><path d="M14 46h36v8a5 5 0 0 1-5 5H19a5 5 0 0 1-5-5z" fill="#FAB005"/>
    <path d="m32 16 4 8.5 9.3 1.2-6.8 6.5 1.7 9.2L32 37l-8.2 4.4 1.7-9.2-6.8-6.5 9.3-1.2z" fill="#102468"/>`,
  bolsa: sombra + `<path d="M12 22h40l-3 30a5 5 0 0 1-5 4.5H20a5 5 0 0 1-5-4.5z" fill="#FFD43B"/><path d="M12 22h40l-.6 6H12.6z" fill="#FAB005"/>
    <path d="M23 26V18a9 9 0 0 1 18 0v8" fill="none" stroke="#102468" stroke-width="4" stroke-linecap="round"/>${brillo(17, 30, 4, 18, 2)}`,
  regalo: null, // alias más abajo
};
D.regalo = D.caja;
D.bebes = D.juguete;

export function ilus(nombre) { return S(D[nombre] || D.caja); }
export const hayIlus = (n) => !!D[n];
