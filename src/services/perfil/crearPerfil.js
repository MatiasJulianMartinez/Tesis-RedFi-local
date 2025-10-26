import { supabase } from "../../supabase/client";

// Crea el perfil base del usuario recién registrado usando su id de auth
export const crearPerfil = async ({ nombre, proveedor_preferido }, mostrarAlerta = () => {}) => {
  // Obtiene el usuario autenticado actual desde Supabase Auth
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  // Valida que exista un usuario autenticado antes de continuar
  if (userError || !user) {
    mostrarAlerta("Error al obtener el usuario.");
    throw userError;
  }

  // Inserta el perfil inicial en la tabla user_profiles
  const { error } = await supabase.from("user_profiles").insert({
    id: user.id,
    nombre,
    proveedor_preferido: proveedor_preferido || null,
  });

  // Informa si falló la creación del perfil
  if (error) {
    mostrarAlerta("Error al crear el perfil.");
    throw error;
  }
};
