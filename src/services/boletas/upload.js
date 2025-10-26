/**
 * Servicio de gestión de archivos para boletas de servicios
 * Maneja la carga y eliminación de imágenes en el almacenamiento de Supabase
 * Organiza archivos por usuario y genera URLs públicas de acceso
 */

import { supabase } from "../../supabase/client";
import { obtenerUsuarioActual } from "./auth";

/**
 * Sube una imagen al bucket de Supabase y devuelve su URL pública.
 * La imagen se guarda dentro de una carpeta con el ID del usuario.
 * @param {File} archivo - Archivo de imagen
 * @returns {Promise<string|null>} URL pública o null si falla
 */
export const subirImagenBoleta = async (archivo) => {
  // Verifica que el usuario esté autenticado antes de subir
  const user = await obtenerUsuarioActual();
  if (!user) throw new Error("Usuario no autenticado");

  // Genera nombre único con timestamp para evitar conflictos
  const fileName = `boleta-${Date.now()}-${archivo.name}`;
  // Organiza archivos en carpeta del usuario para privacidad
  const path = `${user.id}/${fileName}`;

  // Sube el archivo al bucket 'boletas' de Supabase Storage
  const { error: uploadError } = await supabase.storage
    .from("boletas")
    .upload(path, archivo);

  if (uploadError) throw new Error("Error al subir la imagen.");

  // Obtiene la URL pública del archivo subido
  const { data } = supabase.storage.from("boletas").getPublicUrl(path);
  return data.publicUrl;
};

/**
 * Elimina una imagen de boleta del almacenamiento de Supabase
 * Extrae la ruta del archivo desde la URL pública y realiza la eliminación
 * Maneja errores de forma silenciosa para evitar fallos en cascada
 */
export const eliminarImagenBoleta = async (urlImagen) => {
  // No procesa si no hay URL de imagen
  if (!urlImagen) return;

  // Extrae la ruta del archivo desde la URL pública completa
  const url = new URL(urlImagen);
  // Decodifica la ruta removiendo el prefijo del storage público
  const path = decodeURIComponent(url.pathname.split("/storage/v1/object/public/boletas/")[1]);

  // Elimina el archivo del bucket de almacenamiento
  const { error } = await supabase.storage.from("boletas").remove([path]);
  
  // Log de advertencia en lugar de throw para no interrumpir flujo principal
  if (error) {
    console.warn("Error al eliminar imagen:", error.message);
  }
};
