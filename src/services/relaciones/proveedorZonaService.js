// src/services/relaciones/proveedorZonaService.js
import { supabase } from "../../supabase/client";

// Obtener todas las relaciones proveedor-zona
export const obtenerProveedorZona = async (mostrarAlerta = () => {}) => {
  const { data, error } = await supabase
    .from("ZonaProveedor")
    .select(`
      proveedor_id,
      proveedores (id, nombre),
      zona_id,
      zonas (id, departamento)
    `);

  if (error) {
    mostrarAlerta("Error al obtener relaciones Proveedor-Zona");
    throw error;
  }

  return data;
};

// Obtener zonas de un proveedor
export const obtenerZonasPorProveedor = async (proveedorId, mostrarAlerta = () => {}) => {
  const { data, error } = await supabase
    .from("ZonaProveedor")
    .select("zona_id")
    .eq("proveedor_id", proveedorId);

  if (error) {
    mostrarAlerta("Error al obtener zonas asignadas.");
    throw error;
  }

  return data.map((z) => z.zona_id);
};

// Actualizar zonas de un proveedor
export const actualizarZonasProveedor = async (
  proveedorId,
  zonasSeleccionadas = [],
  mostrarAlerta = () => {}
) => {
  // Eliminar zonas actuales
  const { error: errorDelete } = await supabase
    .from("ZonaProveedor")
    .delete()
    .eq("proveedor_id", proveedorId);

  if (errorDelete) {
    mostrarAlerta("Error al eliminar zonas previas: " + errorDelete.message);
    throw errorDelete;
  }

  // Insertar nuevas zonas
  if (zonasSeleccionadas.length === 0) return;

  const nuevasRelaciones = zonasSeleccionadas.map((zonaId) => ({
    proveedor_id: proveedorId,
    zona_id: zonaId,
  }));

  const { error: errorInsert } = await supabase
    .from("ZonaProveedor")
    .insert(nuevasRelaciones);

  if (errorInsert) {
    mostrarAlerta("Error al asignar nuevas zonas: " + errorInsert.message);
    throw errorInsert;
  }
};

// Obtener proveedores que no tienen zonas asociadas
export const obtenerProveedoresSinZonas = async (mostrarAlerta = () => {}) => {
  const { data, error } = await supabase
    .from("proveedores")
    .select("id, nombre, ZonaProveedor(zonas(id))")
    .order("nombre", { ascending: true });

  if (error) {
    mostrarAlerta("Error al obtener proveedores sin zonas.");
    throw error;
  }

  // Filtrar los que no tienen zonas asociadas
  return data.filter((p) => !p.ZonaProveedor || p.ZonaProveedor.length === 0);
};

// Eliminar todas las relaciones proveedor-zona de un proveedor
export const eliminarProveedorZona = async (proveedorId, mostrarAlerta = () => {}) => {
  const { error } = await supabase
    .from("ZonaProveedor")
    .delete()
    .eq("proveedor_id", proveedorId);

  if (error) {
    mostrarAlerta("Error al eliminar zonas del proveedor.");
    throw error;
  }
};
