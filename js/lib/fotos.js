// Comprime las fotos en el celular antes de guardarlas (JPEG, lado mayor configurable).
// Hoy se guardan dentro de la publicación como data:image/jpeg. Cuando se conecte un almacenamiento
// de imágenes (Cloudflare R2), solo cambia esta función: devolverá la URL subida.
import { fotos as CFG } from '../config.js';

export function comprimir(file, lado = CFG.lado, calidad = CFG.calidad) {
  return new Promise((ok, mal) => {
    if (!file || !/^image\//.test(file.type)) { mal(new Error('El archivo no es una imagen.')); return; }
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      const k = Math.min(1, lado / Math.max(img.width, img.height));
      const w = Math.max(1, Math.round(img.width * k)), h = Math.max(1, Math.round(img.height * k));
      const c = document.createElement('canvas');
      c.width = w; c.height = h;
      const g = c.getContext('2d');
      g.fillStyle = '#fff'; g.fillRect(0, 0, w, h);
      g.drawImage(img, 0, 0, w, h);
      URL.revokeObjectURL(url);
      ok(c.toDataURL('image/jpeg', calidad));
    };
    img.onerror = () => { URL.revokeObjectURL(url); mal(new Error('No se pudo leer la imagen.')); };
    img.src = url;
  });
}

export const pesoKB = (dataUrl) => Math.round((dataUrl.length * 3) / 4 / 1024);
