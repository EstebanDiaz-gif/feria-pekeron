// Configuración de Feria Pekerón.
//
// BACKEND
//   En los dominios de `dominiosReales` la app usa Firebase (cuentas y publicaciones reales).
//   En cualquier otro lado funciona en MODO PRUEBA LOCAL: todo queda en el navegador (IndexedDB).
// Proyecto propio de la Feria (feria-pekeron). Estos datos son públicos por diseño de Firebase:
// la seguridad la dan las reglas de firestore.rules, no esconder esta configuración.
export const firebase = {
  apiKey: 'AIzaSyCGKIzhyfgvUBz5NIiHpoU2v5yngwjPI_U',
  authDomain: 'feria-pekeron.firebaseapp.com',
  projectId: 'feria-pekeron',
  storageBucket: 'feria-pekeron.firebasestorage.app',
  messagingSenderId: '207978315580',
  appId: '1:207978315580:web:6f6aa67fe119323a3d2839',
};

// Dominios donde se usan los datos reales (Firebase). En cualquier otro (localhost, vistas previas) la app
// funciona en modo prueba local. Para forzar un modo en un navegador: localStorage 'feria.modo' = 'local' | 'firebase'.
export const dominiosReales = ['feria.pekeronapp.com', 'feria-pekeron.pages.dev'];

// Zona con la que arranca la Feria. La app ya acepta cualquier provincia y localidad.
export const zonaInicial = { provincia: 'Tucumán', localidad: 'San Miguel de Tucumán' };

// Link a Pekerón Gestión (el software para negocios). Solo un enlace: no se comparte código ni datos.
export const linkGestion = 'https://pekeronapp.com';

// Límites de las fotos (se comprimen en el celular antes de guardarse).
export const fotos = { max: 6, lado: 1100, calidad: 0.72 };

// Banners del carrusel del inicio (pasan solos). Editables: título, texto, botón, link y color.
// `link` puede ser una pantalla de la Feria (#publicar) o una dirección https.
export const banners = [
  { id: 'lanzamiento', titulo: '¡Llegó Feria Pekerón!', texto: 'Comprá y vendé en tu zona. Publicar es gratis y sin comisiones.', boton: 'Publicar gratis', link: '#publicar', tema: 'azul', icono: 'bolsa' },
  { id: 'gestion', titulo: '¿Tenés un negocio?', texto: 'Con Pekerón Gestión controlás stock, ventas y caja, y tus productos salen en la Feria.', boton: 'Conocer Pekerón Gestión', link: 'https://pekeronapp.com', tema: 'tinta', icono: 'panel' },
  { id: 'tiendas', titulo: 'Tiendas de Tucumán', texto: 'Mirá los catálogos de los negocios de tu zona y escribiles directo.', boton: 'Ver tiendas', link: '#tiendas', tema: 'amarillo', icono: 'tienda' },
];

// Anuncio que aparece al abrir la Feria: como mucho UNA vez por día, rotando entre estos.
// Para apagarlo, dejar la lista vacía: anuncios = [].
export const anuncios = [
  { id: 'lanzamiento-2026', etiqueta: 'Lanzamiento', titulo: '¡Llegó Feria Pekerón!', texto: 'El marketplace de Tucumán: publicá gratis, sin comisiones, y hablá directo con quien compra por WhatsApp.', boton: 'Publicar gratis', link: '#publicar', secundario: 'Explorar la Feria', tema: 'azul', icono: 'bolsa' },
  { id: 'gestion-2026', etiqueta: 'Pekerón Gestión', titulo: 'Tu negocio, ordenado desde el celular', texto: 'Stock, ventas, fiado y caja en una sola app. Y tus productos aparecen solos en la Feria.', boton: 'Conocer Pekerón Gestión', link: 'https://pekeronapp.com', secundario: 'Ahora no', tema: 'tinta', icono: 'panel' },
];
