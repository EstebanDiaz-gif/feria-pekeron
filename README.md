# Feria Pekerón

Marketplace de la marca Pekerón: particulares y comercios publican productos nuevos o usados, arman su tienda
y los compradores los contactan directo por WhatsApp. Publicar es gratis, sin comisiones y sin pagos dentro de la plataforma.

**Proyecto independiente de Pekerón Gestión** (`EstebanDiaz-gif/controlcompraventa`): repositorio, dominio,
service worker y base de datos propios. No importa ni modifica nada de Gestión; solo tiene un link a pekeronapp.com.

## Tecnología

La misma base que Pekerón Gestión, para mantener un solo estilo de trabajo:

- HTML + CSS + JavaScript (módulos ES), **sin compilación**. Se publica tal cual en cualquier hosting estático.
- PWA instalable (`manifest.webmanifest` + `sw.js` con caché propia `feria-vN`).
- Datos: **Firebase** (Authentication + Firestore, SDK 10.12.2) en un proyecto propio. Mientras no esté configurado,
  la app corre en **modo prueba local** (IndexedDB del navegador).
- Identidad Pekerón: azul `#1D3FAF`, crema `#FFF6E9`, tipografía Archivo.

## Probarla en la compu

```bash
python3 -m http.server 8080     # o: npx serve .
# abrir http://localhost:8080
npm test                        # pruebas de utilidades (WhatsApp, búsqueda, seguridad de imágenes)
```

Para verla como en el celular: herramientas de desarrollador del navegador → vista de dispositivo móvil.

## Modo prueba local vs. datos reales

| | Modo prueba local (hoy) | Con Firebase conectado |
|---|---|---|
| Cuentas | Perfil de prueba sin correo ni contraseña, solo en ese navegador | Registro e ingreso reales con correo y contraseña |
| Publicaciones y tiendas | Se guardan en el navegador; nadie más las ve | Se guardan en Firestore; las ve todo el mundo |
| Fotos | Comprimidas en el celular, guardadas en el navegador | Comprimidas y guardadas dentro de la publicación (máx. ~820 KB) hasta tener almacenamiento de imágenes |

### Firebase (conectado: proyecto `feria-pekeron`)

Ya está creado y configurado. Estos eran los pasos, por si hay que repetirlos en otro proyecto:

1. En https://console.firebase.google.com crear un proyecto **nuevo** (ej. `feria-pekeron`). No usar `controlcompraventa`.
2. Authentication → Método de acceso → activar **Correo electrónico/contraseña**.
3. Firestore Database → crear (región `southamerica-east1`) → pestaña Reglas → pegar `firestore.rules` → Publicar.
4. Configuración del proyecto → Tus apps → Web → copiar `apiKey`, `authDomain`, `projectId`, `appId` en `js/config.js`.
5. La primera vez que se use cada filtro, Firestore puede pedir un **índice compuesto**: el error en la consola del
   navegador trae el link para crearlo con un clic.

## Estructura

```
index.html              entrada
manifest.webmanifest    PWA
sw.js                   caché de archivos (subir la versión al cambiar archivos)
css/feria.css           estilos (celular primero)
icons/                  ícono de la app
firestore.rules         reglas de seguridad para el proyecto de Firebase de la Feria
js/
  main.js               arranque y navegación (#inicio, #producto-ID, #tienda-nombre…)
  config.js             Firebase, zona inicial, link a Gestión, límites de fotos
  datos/
    index.js            elige backend (Firebase o local)
    firebase.js         backend real
    local.js            modo prueba local (IndexedDB)
    catalogo.js         categorías, provincias y localidades
  lib/                  utilidades (util, dom, iconos, fotos, instalar)
  vistas/               una pantalla por archivo
test/                   pruebas con node --test
```

## Datos (Firestore)

- `usuarios/{uid}`: nombre, tipo (`particular` | `comercio`), whatsapp, provincia, localidad, barrio.
- `tiendas/{slug}`: uid, nombre, descripción, logo, portada, provincia, localidad, dirección, whatsapp, instagram.
- `publicaciones/{id}`: uid, titulo, descripcion, precio, categoria, subcategoria, estado (`nuevo`|`usado`),
  disponibilidad (`disponible`|`pausada`|`vendida`), stock, variantes {talles, colores}, fotos, provincia, localidad,
  barrio, tienda, palabras (para buscar), destacada (solo la cambia la plataforma), creado, actualizado.

## Tiendas de Pekerón Gestión en la Feria

`functions/api/gestion.js` es una función de Cloudflare Pages (`/api/gestion`) que lee **solo lo público** del catálogo
de las tiendas de Gestión listadas en `TIENDAS` (hoy: `pekeron`), igual que lo ve cualquiera en pekeronapp.com/<tienda>.
No escribe nada ni cambia reglas de Gestión. Guarda una copia por 10 minutos para que los visitantes de la Feria no gasten
las lecturas gratis de Firebase de Gestión. En la Feria esas publicaciones aparecen con el sello "Tienda Pekerón" y un
botón al catálogo para hacer el pedido. Se actualizan solas: lo que cambiás en Gestión se ve en la Feria en hasta 10 minutos.

## Comprar y vender con la misma cuenta

- **Mi cuenta** (`#cuenta`): Compras (Consultados, Favoritos, Vistos) y Ventas (panel, publicaciones, tienda).
- Sin cuenta, Consultados/Favoritos/Vistos se guardan en el celular; con cuenta, Consultados y Favoritos quedan en la cuenta.
- **¿Ya lo vendiste?**: cada toque en "Consultar por WhatsApp" crea un documento en `consultas` (sin datos del
  comprador más que su uid si ingresó). En el panel, el vendedor ve cuántas personas consultaron desde la última vez
  y responde Sí, lo vendí / Todavía no / Ya no lo tengo (marca vendida, solo guarda `revisado` o pausa).

## Pendiente para próximas etapas (no hecho a propósito)

- Conectar Firebase y probar con usuarios reales.
- Interruptor "Mostrar mis productos en la Feria" dentro de Gestión, para que cada negocio elija (hoy la lista está en la función).
- Almacenamiento de imágenes (Cloudflare R2) para no guardar fotos dentro de la publicación.
- Panel de la plataforma: destacar publicaciones, moderar y bajar contenido prohibido, reportes.
- Búsqueda de texto más potente (Algolia/Typesense) cuando haya volumen.
- Favoritos, preguntas, reseñas y verificación de teléfono.
- Términos y condiciones y política de privacidad propios de la Feria.
