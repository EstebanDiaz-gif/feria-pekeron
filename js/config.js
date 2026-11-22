// Configuración de Feria Pekerón.
//
// BACKEND
//   Mientras `firebase` esté vacío, la app funciona en MODO PRUEBA LOCAL:
//   todo se guarda solo en el navegador de quien la usa (IndexedDB) y no hay cuentas reales.
//   Para pasar a datos reales: crear un proyecto NUEVO de Firebase (no el de Pekerón Gestión),
//   activar Authentication (correo y contraseña) y Firestore, publicar firestore.rules
//   y pegar acá la configuración web del proyecto. Ver README.md.
export const firebase = {
  // apiKey: '',
  // authDomain: '',
  // projectId: '',
  // appId: '',
};

// Zona con la que arranca la Feria. La app ya acepta cualquier provincia y localidad.
export const zonaInicial = { provincia: 'Tucumán', localidad: 'San Miguel de Tucumán' };

// Link a Pekerón Gestión (el software para negocios). Solo un enlace: no se comparte código ni datos.
export const linkGestion = 'https://pekeronapp.com';

// Límites de las fotos (se comprimen en el celular antes de guardarse).
export const fotos = { max: 6, lado: 1100, calidad: 0.72 };
