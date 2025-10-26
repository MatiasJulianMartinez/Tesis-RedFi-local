import { supabase } from "../supabase/client";

// Obtener todas las tecnologías
export const obtenerTecnologias = async (mostrarAlerta = () => {}) => {
  const { data, error } = await supabase.from("tecnologias").select("*").order("tecnologia", { ascending: true });
  if (error) {
    mostrarAlerta("Error al obtener tecnologías");
    throw error;
  }
  return data;
};

// Editar tecnología
export const editarTecnologia = async (id, nuevosDatos, mostrarAlerta = () => {}) => {
  const { error } = await supabase
    .from("tecnologias")
    .update(nuevosDatos)
    .eq("id", id);

  if (error) {
    mostrarAlerta("Error al editar la tecnología");
    throw error;
  }
};

// Eliminar tecnología
export const eliminarTecnologia = async (id, mostrarAlerta = () => {}) => {
  const { error } = await supabase
    .from("tecnologias")
    .delete()
    .eq("id", id);

  if (error) {
    mostrarAlerta("Error al eliminar la tecnología");
    throw error;
  } 
};

// Agregar nueva tecnología
export const agregarTecnologia = async (nuevaTecno, mostrarAlerta = () => {}) => {
  const { error } = await supabase
    .from("tecnologias")
    .insert([nuevaTecno]);

  if (error) {
    mostrarAlerta("Error al agregar la tecnología");
    throw error;
  }
};
