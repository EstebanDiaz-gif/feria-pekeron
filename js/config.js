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
