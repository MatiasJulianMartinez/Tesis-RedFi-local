import { supabase } from "../../supabase/client";

// Obtiene todos los perfiles ordenados alfabéticamente (uso admin)
export const obtenerPerfilesAdmin = async (mostrarAlerta = () => {}) => {
  const { data, error } = await supabase
    .from("user_profiles")
    .select("id, nombre, proveedor_preferido, rol, plan, foto_url")
    .order("nombre", { ascending: true });

  if (error) {
    mostrarAlerta("Error al obtener los perfiles.");
    throw error;
  }
  return data;
};

// Elimina un perfil por su ID (uso admin)
export const eliminarPerfilPorId = async (id, mostrarAlerta = () => {}) => {
  const { error } = await supabase
    .from("user_profiles")
    .delete()
    .eq("id", id);

  if (error) {
    mostrarAlerta("Error al eliminar el perfil.");
    throw error;
  }
};

// Actualiza solo plan (y opcionalmente rol) de un usuario
export const actualizarPlanUsuario = async (usuarioId, nuevoPlan, nuevoRol = null) => {
  const actualizacion = { plan: nuevoPlan };
  if (nuevoRol) actualizacion.rol = nuevoRol;

  const { error } = await supabase
    .from("user_profiles")
    .update(actualizacion)
    .eq("id", usuarioId);

  if (error) {
    throw new Error(error.message);
  }
};

// Actualiza un perfil completo por ID, incluyendo validaciones y manejo de imagen en Storage (uso admin)
export const actualizarPerfilPorId = async (
  id,
  {
    nombre,
    proveedor_preferido,
    rol,
    plan,
    foto,
    preview,
    eliminarFoto = false,
  },
  mostrarAlerta = () => {}
) => {
  // Valida el campo nombre antes de continuar
  if (!nombre || nombre.trim().length < 2) {
    mostrarAlerta("El nombre debe tener al menos 2 caracteres.");
    throw new Error("El nombre debe tener al menos 2 caracteres.");
  }
  const emojiRegex = /[\p{Emoji_Presentation}\p{Extended_Pictographic}]/gu;
  const caracteresInvalidos = /[^a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s\-']/;
  if (emojiRegex.test(nombre) || caracteresInvalidos.test(nombre)) {
    mostrarAlerta("El nombre contiene caracteres no permitidos.");
    throw new Error("El nombre contiene caracteres no permitidos.");
  }

  let nuevaUrl = preview;

  // Obtiene datos actuales del perfil para decidir si eliminar o reemplazar imagen previa
  const { data: perfilActual, error: errorPerfil } = await supabase
    .from("user_profiles")
    .select("foto_url")
    .eq("id", id)
    .single();

  if (errorPerfil) {
    mostrarAlerta("Error al obtener el perfil actual.");
    throw errorPerfil;
  }

  const urlAntigua = perfilActual?.foto_url;
  const bucketUrl = supabase.storage.from("perfiles").getPublicUrl("").data.publicUrl;

  // Elimina imagen previa del bucket si se solicitó
  if (eliminarFoto && urlAntigua && urlAntigua.startsWith(bucketUrl)) {
    const rutaAntigua = urlAntigua.replace(bucketUrl, "").replace(/^\/+/, "");
    await supabase.storage.from("perfiles").remove([rutaAntigua]);
    nuevaUrl = null;
  }

  // Sube una nueva imagen validando tipo, tamaño y resolución
  if (foto) {
    const tiposPermitidos = ["image/jpeg", "image/png", "image/webp"];
    if (!tiposPermitidos.includes(foto.type)) {
      mostrarAlerta("Formato de imagen no soportado. Solo JPG, PNG o WEBP.");
      throw new Error("Formato de imagen no soportado. Solo JPG, PNG o WEBP.");
    }

    const MAX_TAMANO_BYTES = 300 * 1024;
    if (foto.size > MAX_TAMANO_BYTES) {
      mostrarAlerta("La imagen supera los 300 KB permitidos.");
      throw new Error("La imagen supera los 300 KB permitidos.");
    }

    // Verifica dimensiones máximas 500x500 antes de subir
    const imagenValida = await new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        if (img.width > 500 || img.height > 500) {
          reject(
            mostrarAlerta("La resolución máxima permitida es 500x500 píxeles."),
            new Error("La resolución máxima permitida es 500x500 píxeles.")
          );
        } else {
          resolve(true);
        }
      };
      img.onerror = () =>
        reject(
          mostrarAlerta("No se pudo procesar la imagen."),
          new Error("No se pudo procesar la imagen.")
        );
      img.src = URL.createObjectURL(foto);
    });

    if (!imagenValida) {
      throw new Error("La imagen no es válida.");
    }

    // Elimina la imagen anterior del bucket si existía
    if (urlAntigua && urlAntigua.startsWith(bucketUrl)) {
      const rutaAntigua = urlAntigua.replace(bucketUrl, "").replace(/^\/+/, "");
      await supabase.storage.from("perfiles").remove([rutaAntigua]);
    }

    // Sube la nueva imagen al bucket y obtiene su URL pública
    const carpetaUsuario = `${id}`;
    const nombreArchivo = `perfil-${Date.now()}`;
    const rutaCompleta = `${carpetaUsuario}/${nombreArchivo}`;

    const { error: uploadError } = await supabase.storage
      .from("perfiles")
      .upload(rutaCompleta, foto, {
        cacheControl: "3600",
        upsert: true,
      });

    if (uploadError) {
      mostrarAlerta("Error al subir la imagen al servidor.");
      throw uploadError;
    }

    const { data } = supabase.storage.from("perfiles").getPublicUrl(rutaCompleta);
    nuevaUrl = data.publicUrl;
  }

  // Actualiza la fila del usuario con los nuevos datos y URL de imagen (si corresponde)
  const { error: updateError } = await supabase
    .from("user_profiles")
    .update({
      nombre,
      proveedor_preferido,
      rol,
      plan,
      foto_url: nuevaUrl,
    })
    .eq("id", id);

  if (updateError) {
    mostrarAlerta("Error al actualizar el perfil.");
    throw updateError;
  }
};
