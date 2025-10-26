import { supabase } from "../../supabase/client";

// Obtiene todas las tecnologías disponibles
export const obtenerTecnologiasDisponibles = async (
  mostrarAlerta = () => {}
) => {
  const { data, error } = await supabase
    .from("tecnologias")
    .select("id, tecnologia");

  if (error) {
    mostrarAlerta("Error al obtener tecnologías disponibles");
    throw error;
  }
  return data;
};

// Obtiene todas las zonas disponibles
export const obtenerZonasDisponibles = async (mostrarAlerta = () => {}) => {
  const { data, error } = await supabase
    .from("zonas")
    .select("id, departamento");

  if (error) {
    mostrarAlerta("Error al obtener zonas disponibles");
    throw error;
  }
  return data;
};
