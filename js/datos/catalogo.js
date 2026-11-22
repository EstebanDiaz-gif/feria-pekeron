// Categorías y ubicaciones. Son datos de referencia (no publicaciones): se pueden ampliar sin tocar el resto.

export const CATEGORIAS = [
  { id: 'ropa', bg: '#FDE8EF', fg: '#C2255C', nombre: 'Ropa y calzado', icono: 'remera', variantes: true,
    subs: ['Ropa de mujer', 'Ropa de hombre', 'Ropa de niños', 'Zapatillas', 'Calzado', 'Accesorios y bijou', 'Bolsos y mochilas'] },
  { id: 'tecnologia', bg: '#E6F0FF', fg: '#1D4ED8', nombre: 'Celulares y tecnología', icono: 'celular',
    subs: ['Celulares', 'Accesorios para celular', 'Computación', 'Audio', 'TV y video', 'Consolas y videojuegos'] },
  { id: 'hogar', bg: '#FFF1DB', fg: '#B45309', nombre: 'Hogar y muebles', icono: 'casa',
    subs: ['Muebles', 'Electrodomésticos', 'Cocina', 'Decoración', 'Colchones y blanquería', 'Jardín'] },
  { id: 'herramientas', bg: '#FFF4D6', fg: '#A16207', nombre: 'Herramientas y construcción', icono: 'herramienta',
    subs: ['Herramientas eléctricas', 'Herramientas manuales', 'Materiales', 'Electricidad', 'Plomería'] },
  { id: 'vehiculos', bg: '#E5F6F4', fg: '#0F766E', nombre: 'Motos y repuestos', icono: 'moto',
    subs: ['Motos', 'Bicicletas', 'Repuestos de moto', 'Repuestos de auto', 'Cascos y accesorios'] },
  { id: 'belleza', bg: '#F6E8FF', fg: '#8B3FC4', nombre: 'Belleza y cuidado', icono: 'belleza',
    subs: ['Perfumes', 'Maquillaje', 'Cuidado de la piel', 'Cabello'] },
  { id: 'bebes', bg: '#FFEDE4', fg: '#C2410C', nombre: 'Bebés y juguetes', icono: 'juguete',
    subs: ['Ropa de bebé', 'Coches y sillas', 'Juguetes', 'Artículos escolares'] },
  { id: 'deportes', bg: '#E7F7E9', fg: '#15803D', nombre: 'Deportes', icono: 'pelota',
    subs: ['Fitness', 'Fútbol', 'Ciclismo', 'Camping y pesca'] },
  { id: 'almacen', bg: '#FDF3E1', fg: '#9A5B13', nombre: 'Almacén y comida', icono: 'canasta',
    subs: ['Almacén', 'Bebidas', 'Comida casera', 'Panificados'] },
  { id: 'mascotas', bg: '#EEF1FF', fg: '#4F46E5', nombre: 'Mascotas', icono: 'mascota',
    subs: ['Alimento', 'Accesorios'] },
  { id: 'servicios', bg: '#E8F4FB', fg: '#0369A1', nombre: 'Servicios', icono: 'servicio',
    subs: ['Oficios', 'Reparaciones', 'Fletes', 'Clases', 'Eventos'] },
  { id: 'otros', bg: '#F0EEEA', fg: '#57534E', nombre: 'Otros', icono: 'caja', subs: ['Otros'] },
];

export const categoria = (id) => CATEGORIAS.find((c) => c.id === id) || null;

export const PROVINCIAS = [
  'Buenos Aires', 'Ciudad de Buenos Aires', 'Catamarca', 'Chaco', 'Chubut', 'Córdoba', 'Corrientes',
  'Entre Ríos', 'Formosa', 'Jujuy', 'La Pampa', 'La Rioja', 'Mendoza', 'Misiones', 'Neuquén',
  'Río Negro', 'Salta', 'San Juan', 'San Luis', 'Santa Cruz', 'Santa Fe', 'Santiago del Estero',
  'Tierra del Fuego', 'Tucumán',
];

// Localidades sugeridas por provincia. Si una provincia no está, la localidad se escribe a mano.
export const LOCALIDADES = {
  'Tucumán': [
    'San Miguel de Tucumán', 'Yerba Buena', 'Tafí Viejo', 'Banda del Río Salí', 'Alderetes',
    'Las Talitas', 'Lules', 'El Manantial', 'Famaillá', 'Monteros', 'Concepción', 'Aguilares',
    'Simoca', 'Bella Vista', 'Juan Bautista Alberdi', 'Tafí del Valle', 'Trancas', 'Burruyacú',
  ],
};

export const ESTADOS = { nuevo: 'Nuevo', usado: 'Usado' };
export const DISPONIBILIDAD = { disponible: 'Disponible', pausada: 'Pausada', vendida: 'Vendida' };
