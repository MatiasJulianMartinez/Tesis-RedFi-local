import { supabase } from "../../supabase/client";

// Obtiene el perfil completo del usuario autenticado actual
export const getPerfil = async (mostrarAlerta = () => {}) => {
  // Verifica el usuario en sesión desde Supabase Auth
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    mostrarAlerta("Error al obtener el usuario.");
    throw userError;
  }

  // Busca los datos del perfil en la tabla user_profiles según el id del usuario
  const { data, error } = await supabase
    .from("user_profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (error) {
    mostrarAlerta("Error al obtener el perfil.");
    throw error;
  }
  return data;
};

// Obtiene un perfil por id, incluyendo reseñas y datos del proveedor asociado
export const obtenerPerfilPorId = async (id, mostrarAlerta = () => {}) => {
  const { data, error } = await supabase
    .from("user_profiles")
    .select(
      `
      id,
      nombre,
      foto_url,
      proveedor_preferido,
      rol,
      plan,
      reseñas (
        id,
        comentario,
        estrellas,
        created_at,
        proveedor_id (
          id,
          nombre
        )
      )
    `
    )
    .eq("id", id)
    .single();

  if (error) {
    mostrarAlerta("Error al obtener el perfil del usuario");
    throw error;
  }

  return data;
};
