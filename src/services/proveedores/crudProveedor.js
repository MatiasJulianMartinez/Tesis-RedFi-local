// Acceso a Supabase y utilidades para eliminar logos de proveedores
import { supabase } from "../../supabase/client";
import { eliminarLogoProveedor } from "./logoProveedor";

// Crea un proveedor y devuelve la fila insertada
export const crearProveedor = async (
  datos, // { nombre, descripcion, sitio_web, color, logotipo }
  mostrarAlerta = () => {}
) => {
  const { tecnologias, zonas, ...proveedorBase } = datos;

  const { data: proveedor, error } = await supabase
    .from("proveedores")
    .insert([proveedorBase])
    .select()
    .single();

  if (error) {
    mostrarAlerta("Error al agregar el proveedor.");
    throw error;
  }

  return proveedor;
};

// Actualiza datos básicos de un proveedor sin tocar relaciones
export const actualizarProveedor = async (
  proveedorId,
  datos, // { nombre, descripcion, sitio_web, color, logotipo }
  mostrarAlerta = () => {}
) => {
  const { tecnologias, zonas, eliminarLogo, ...proveedorBase } = datos;

  const { error: errorUpdate } = await supabase
    .from("proveedores")
    .update(proveedorBase)
    .eq("id", proveedorId);

  if (errorUpdate) {
    console.error(errorUpdate);
    mostrarAlerta("Error al actualizar el proveedor.");
    throw errorUpdate;
  }

  return true;
};

// Elimina un proveedor y sus logos asociados en Storage
export const eliminarProveedor = async (id, mostrarAlerta = () => {}) => {
  try {
    // Elimina logos del bucket asociados al proveedor
    await eliminarLogoProveedor(id);

    // Elimina la fila del proveedor en la base de datos
    const { error } = await supabase.from("proveedores").delete().eq("id", id);

    if (error) {
      console.error("❌ Error al eliminar Proveedor:", error);
      mostrarAlerta("Error al eliminar el proveedor.");
      throw error;
    }
  } catch (err) {
    console.error("❌ Error general en eliminación:", err);
    throw err;
  }
};
