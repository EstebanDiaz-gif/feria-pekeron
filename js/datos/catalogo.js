// Categorías y ubicaciones. Son datos de referencia (no publicaciones): se pueden ampliar sin tocar el resto.

export const CATEGORIAS = [
  { id: 'ropa', nombre: 'Ropa y calzado', icono: 'remera', variantes: true,
    subs: ['Ropa de mujer', 'Ropa de hombre', 'Ropa de niños', 'Zapatillas', 'Calzado', 'Accesorios y bijou', 'Bolsos y mochilas'] },
  { id: 'tecnologia', nombre: 'Celulares y tecnología', icono: 'celular',
    subs: ['Celulares', 'Accesorios para celular', 'Computación', 'Audio', 'TV y video', 'Consolas y videojuegos'] },
  { id: 'hogar', nombre: 'Hogar y muebles', icono: 'casa',
    subs: ['Muebles', 'Electrodomésticos', 'Cocina', 'Decoración', 'Colchones y blanquería', 'Jardín'] },
  { id: 'herramientas', nombre: 'Herramientas y construcción', icono: 'herramienta',
    subs: ['Herramientas eléctricas', 'Herramientas manuales', 'Materiales', 'Electricidad', 'Plomería'] },
  { id: 'vehiculos', nombre: 'Motos y repuestos', icono: 'moto',
    subs: ['Motos', 'Bicicletas', 'Repuestos de moto', 'Repuestos de auto', 'Cascos y accesorios'] },
  { id: 'belleza', nombre: 'Belleza y cuidado', icono: 'belleza',
    subs: ['Perfumes', 'Maquillaje', 'Cuidado de la piel', 'Cabello'] },
  { id: 'bebes', nombre: 'Bebés y juguetes', icono: 'juguete',
    subs: ['Ropa de bebé', 'Coches y sillas', 'Juguetes', 'Artículos escolares'] },
  { id: 'deportes', nombre: 'Deportes', icono: 'pelota',
    subs: ['Fitness', 'Fútbol', 'Ciclismo', 'Camping y pesca'] },
  { id: 'almacen', nombre: 'Almacén y comida', icono: 'canasta',
    subs: ['Almacén', 'Bebidas', 'Comida casera', 'Panificados'] },
  { id: 'mascotas', nombre: 'Mascotas', icono: 'mascota',
    subs: ['Alimento', 'Accesorios'] },
  { id: 'servicios', nombre: 'Servicios', icono: 'servicio',
    subs: ['Oficios', 'Reparaciones', 'Fletes', 'Clases', 'Eventos'] },
  { id: 'otros', nombre: 'Otros', icono: 'caja', subs: ['Otros'] },
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
