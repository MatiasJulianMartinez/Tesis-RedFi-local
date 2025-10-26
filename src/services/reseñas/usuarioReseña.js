import { supabase } from "../../supabase/client";

// Obtiene todas las reseñas del usuario autenticado con datos de proveedor y perfil
export const obtenerReseñasUsuario = async (mostrarAlerta = () => {}) => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Usuario no autenticado");

    const { data, error } = await supabase
      .from("reseñas")
      .select(`
        *,
        proveedores (
          *,
          ProveedorTecnologia(tecnologias(*)),
          ZonaProveedor(zonas(*))
        ),
        user_profiles(nombre, foto_url)
      `)
      .eq("usuario_id", user.id)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data;
  } catch (error) {
    mostrarAlerta(`Error al obtener reseñas del usuario: ${error.message}`);
    throw error;
  }
};

// Actualiza una reseña del usuario autenticado por su ID
export const actualizarReseña = async (id, reseñaData, mostrarAlerta = () => {}) => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Usuario no autenticado");

    const { data, error } = await supabase
      .from("reseñas")
      .update({
        comentario: reseñaData.comentario,
        estrellas: reseñaData.estrellas,
        proveedor_id: reseñaData.proveedor_id,
      })
      .eq("id", id)
      .eq("usuario_id", user.id)
      .select(`
        *,
        proveedores (
          *,
          ProveedorTecnologia(tecnologias(*)),
          ZonaProveedor(zonas(*))
        )
      `)
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    mostrarAlerta(`Error al actualizar reseña: ${error.message}`);
    throw error;
  }
};

// Elimina una reseña del usuario autenticado por su ID
export const eliminarReseña = async (id, mostrarAlerta = () => {}) => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Usuario no autenticado");

    const { error } = await supabase
      .from("reseñas")
      .delete()
      .eq("id", id)
      .eq("usuario_id", user.id);

    if (error) throw error;
    return true;
  } catch (error) {
    mostrarAlerta(`Error al eliminar reseña: ${error.message}`);
    throw error;
  }
};
