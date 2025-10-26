// src/services/relaciones/proveedorTecnologiaService.js
import { supabase } from "../../supabase/client";

// Obtener todas las relaciones proveedor-tecnología
export const obtenerProveedorTecnologia = async (mostrarAlerta = () => {}) => {
  const { data, error } = await supabase
    .from("ProveedorTecnologia")
    .select(`
      proveedor_id,
      proveedores (id, nombre),
      tecnologia_id,
      tecnologias (id, tecnologia)
    `);

  if (error) {
    mostrarAlerta("Error al obtener relaciones Proveedor-Tecnología");
    throw error;
  }

  return data;
};

// Obtener tecnologías de un proveedor
export const obtenerTecnologiasPorProveedor = async (proveedorId, mostrarAlerta = () => {}) => {
  const { data, error } = await supabase
    .from("ProveedorTecnologia")
    .select("tecnologia_id")
    .eq("proveedor_id", proveedorId);

  if (error) {
    mostrarAlerta("Error al obtener tecnologías asignadas.");
    throw error;
  }

  return data.map((t) => t.tecnologia_id);
};

// Actualizar tecnologías de un proveedor
export const actualizarTecnologiasProveedor = async (proveedorId, nuevasTecnologias, mostrarAlerta = () => {}) => {
  // Eliminar todas las tecnologías actuales
  const { error: errorDelete } = await supabase
    .from("ProveedorTecnologia")
    .delete()
    .eq("proveedor_id", proveedorId);

  if (errorDelete) {
    mostrarAlerta("Error al eliminar tecnologías previas.");
    throw errorDelete;
  }

  // Insertar nuevas relaciones
  const nuevasRelaciones = nuevasTecnologias.map((idTec) => ({
    proveedor_id: proveedorId,
    tecnologia_id: idTec,
  }));

  const { error: errorInsert } = await supabase
    .from("ProveedorTecnologia")
    .insert(nuevasRelaciones);

  if (errorInsert) {
    mostrarAlerta("Error al asignar nuevas tecnologías.");
    throw errorInsert;
  }
};

// Obtener proveedores sin tecnologías
export const obtenerProveedoresSinTecnologias = async (mostrarAlerta = () => {}) => {
  const { data, error } = await supabase
    .from("proveedores")
    .select("id, nombre, ProveedorTecnologia(tecnologias(id))")
    .order("nombre", { ascending: true });

  if (error) {
    mostrarAlerta("Error al obtener proveedores sin tecnologías.");
    throw error;
  }

  // Filtrar los que no tienen relaciones en ProveedorTecnologia
  return data.filter(
    (p) => !p.ProveedorTecnologia || p.ProveedorTecnologia.length === 0
  );
};

// Elimina todas las relaciones proveedor-tecnología de un proveedor
export const eliminarProveedorTecnologia = async (proveedorId, mostrarAlerta = () => {}) => {
  const { error } = await supabase
    .from("ProveedorTecnologia")
    .delete()
    .eq("proveedor_id", proveedorId);

  if (error) {
    mostrarAlerta("Error al eliminar tecnologías del proveedor.");
    throw error;
  }
};