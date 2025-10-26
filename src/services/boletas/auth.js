import { supabase } from "../../supabase/client";

/**
 * Devuelve el usuario autenticado actual.
 * @returns {Promise<Object|null>} Usuario o null
 */
export const obtenerUsuarioActual = async () => {
  const { data } = await supabase.auth.getUser();
  return data?.user || null;
};