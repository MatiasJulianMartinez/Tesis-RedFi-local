// src/services/zonas.js
import { supabase } from "../supabase/client";

// Obtiene todas las zonas con sus proveedores y tecnologías relacionadas
export const getZonas = async () => {
  const { data, error } = await supabase
    .from("zonas")
    .select(`
      *,
      ZonaProveedor (
        proveedores (
          *,
          ProveedorTecnologia (
            tecnologias (*)
          )
        )
      )
    `)
    .order("departamento", { ascending: true });

  if (error) {
    console.error("Error al cargar zonas:", error);
    return [];
  }
  return data;
};
