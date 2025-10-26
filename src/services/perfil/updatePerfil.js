import { supabase } from "../../supabase/client";
import { getPerfil } from "../../services/perfil/getPerfil";

// Actualiza campos simples del perfil del usuario autenticado
export const updatePerfil = async (fields, mostrarAlerta = () => {}) => {
  // Obtiene el usuario autenticado
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  // Valida que exista sesión antes de actualizar
  if (userError || !user) {
    mostrarAlerta("Error al obtener el usuario.");
    throw userError;
  }

  // Actualiza la fila del perfil en user_profiles
  const { data, error } = await supabase
    .from("user_profiles")
    .update(fields)
    .eq("id", user.id);

  // Manejo de error al actualizar perfil
  if (error) {
    mostrarAlerta("Error al actualizar el perfil.");
    throw error;
  }
  return data;
};

// Actualiza perfil y maneja foto en Storage y metadatos en Auth
export const updatePerfilYFoto = async (
  { nombre, proveedor_preferido, foto, preview, eliminarFoto = false },
  mostrarAlerta = () => {}
) => {
  // Obtiene el usuario autenticado
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  // Valida que exista sesión
  if (userError || !user) {
    mostrarAlerta("Error al obtener el usuario.");
    throw userError;
  }

  // Validación del nombre
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

  // Obtiene perfil actual y prepara referencias de imagen
  let nuevaUrl = preview;
  const perfilActual = await getPerfil();
  const urlAntigua = perfilActual.foto_url;
  const bucketUrl = supabase.storage.from("perfiles").getPublicUrl("")
    .data.publicUrl;

  // Elimina la foto previa si se solicitó
  if (eliminarFoto && urlAntigua && urlAntigua.startsWith(bucketUrl)) {
    const rutaAntigua = urlAntigua.replace(bucketUrl, "").replace(/^\/+/, "");
    await supabase.storage.from("perfiles").remove([rutaAntigua]);
    nuevaUrl = null;
  }

  // Si viene una foto nueva, valida y sube a Storage
  if (foto) {
    // Validación de tipo de archivo
    const tiposPermitidos = ["image/jpeg", "image/png", "image/webp"];
    if (!tiposPermitidos.includes(foto.type)) {
      mostrarAlerta("Formato de imagen no soportado. Solo JPG, PNG o WEBP.");
      throw new Error("Formato de imagen no soportado. Solo JPG, PNG o WEBP.");
    }

    // Validación de tamaño
    const MAX_TAMANO_BYTES = 300 * 1024;
    if (foto.size > MAX_TAMANO_BYTES) {
      mostrarAlerta("La imagen supera los 300 KB permitidos.");
      throw new Error("La imagen supera los 300 KB permitidos.");
    }

    // Validación de resolución
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

    // Aborta si la imagen no pasa validaciones
    if (!imagenValida) {
      mostrarAlerta("La imagen no es válida.");
      throw new Error("La imagen no es válida.");
    }

    // Elimina la imagen anterior del bucket si existía
    const urlAntigua = perfilActual.foto_url;
    const bucketUrl = supabase.storage.from("perfiles").getPublicUrl("")
      .data.publicUrl;
    if (urlAntigua && urlAntigua.startsWith(bucketUrl)) {
      const rutaAntigua = urlAntigua.replace(bucketUrl, "").replace(/^\/+/, "");
      await supabase.storage.from("perfiles").remove([rutaAntigua]);
    }

    // Sube la nueva imagen y obtiene su URL pública
    const carpetaUsuario = `${user.id}`;
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
    const { data } = supabase.storage
      .from("perfiles")
      .getPublicUrl(rutaCompleta);
    nuevaUrl = data.publicUrl;
  }

  // Actualiza metadatos del usuario en Auth (name y foto)
  const { error: authError } = await supabase.auth.updateUser({
    data: {
      name: nombre,
      foto_perfil: nuevaUrl,
    },
  });
  if (authError) {
    mostrarAlerta("Error al actualizar los datos de autenticación.");
    throw authError;
  }

  // Actualiza los datos del perfil en la tabla user_profiles
  const { error: perfilError } = await supabase
    .from("user_profiles")
    .update({
      nombre,
      proveedor_preferido,
      foto_url: nuevaUrl,
    })
    .eq("id", user.id);

  // Manejo de error al actualizar en BD
  if (perfilError) {
    mostrarAlerta("Error al actualizar los datos en la base de datos.");
    throw perfilError;
  }
};
