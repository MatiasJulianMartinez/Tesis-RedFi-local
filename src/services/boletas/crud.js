/**
 * Servicio CRUD para manejo de boletas de servicios de internet
 * Proporciona operaciones de creación, lectura, actualización y eliminación
 * de boletas con soporte para gestión de imágenes adjuntas
 */

import { supabase } from "../../supabase/client";
import { obtenerUsuarioActual } from "./auth";
import { subirImagenBoleta, eliminarImagenBoleta } from "./upload";

/**
 * Guarda una nueva boleta en la base de datos
 * Inserta el registro de boleta con todos sus datos asociados
 */
export const guardarBoleta = async (boleta) => {
  const { error } = await supabase.from("boletas").insert(boleta);
  if (error) throw error;
};

/**
 * Elimina una boleta y su imagen asociada
 * Realiza eliminación en cascada: primero la boleta, luego la imagen
 */
export const eliminarBoletaConImagen = async (boleta) => {
  // Elimina el registro de la base de datos
  const { error } = await supabase.from("boletas").delete().eq("id", boleta.id);
  if (error) throw new Error("Error al eliminar la boleta.");

  // Elimina la imagen asociada del almacenamiento
  await eliminarImagenBoleta(boleta.url_imagen);
};

/**
 * Actualiza una boleta existente con manejo completo de imágenes
 * Gestiona reemplazo, eliminación y carga de nuevas imágenes según los parámetros
 */
export const actualizarBoletaConImagen = async (
  boleta,
  nuevosDatos,
  nuevaImagen,
  eliminarImagen = false
) => {
  let url_imagen = boleta.url_imagen;

  // Manejo de eliminación de imagen existente
  if (eliminarImagen) {
    await eliminarImagenBoleta(boleta.url_imagen);
    url_imagen = null;
  }

  // Manejo de nueva imagen: reemplaza la existente
  if (nuevaImagen) {
    // Elimina imagen anterior si existe
    if (boleta.url_imagen) await eliminarImagenBoleta(boleta.url_imagen);
    // Sube la nueva imagen
    url_imagen = await subirImagenBoleta(nuevaImagen);
  }

  // Preparación de datos para actualización
  const datosLimpios = {
    ...nuevosDatos,
    url_imagen,
    // Mapeo de campo específico para fechas de promoción
    ...(nuevosDatos.promoHasta && {
      promo_hasta: nuevosDatos.promoHasta,
    }),
  };
  
  // Limpieza de campos temporales que no van a la base de datos
  delete datosLimpios.promoHasta;
  delete datosLimpios.proveedorOtro;

  // Elimina campos undefined para evitar errores en Supabase
  Object.keys(datosLimpios).forEach((key) => {
    if (datosLimpios[key] === undefined) delete datosLimpios[key];
  });

  // Ejecuta la actualización en la base de datos
  const { error } = await supabase
    .from("boletas")
    .update(datosLimpios)
    .eq("id", boleta.id);

  if (error) throw new Error("Error al guardar cambios.");
};

/**
 * Obtiene todas las boletas del usuario autenticado
 * Retorna boletas ordenadas por fecha de carga descendente
 */
export const obtenerBoletasDelUsuario = async () => {
  // Verifica que haya un usuario autenticado
  const user = await obtenerUsuarioActual();
  if (!user) return [];

  // Consulta boletas del usuario ordenadas por fecha
  const { data, error } = await supabase
    .from("boletas")
    .select("*")
    .eq("user_id", user.id)
    .order("fecha_carga", { ascending: false }); // Más recientes primero

  if (error) {
    console.error("Error al cargar boletas:", error);
    return []; // Retorna array vacío en caso de error
  }

  return data;
};
