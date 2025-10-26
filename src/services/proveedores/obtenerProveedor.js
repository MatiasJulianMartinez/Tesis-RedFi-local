import { supabase } from "../../supabase/client";

// Obtiene todos los proveedores con sus tecnologías, zonas y reseñas básicas
export const obtenerProveedores = async (mostrarAlerta = () => {}) => {
  const { data, error } = await supabase
    .from("proveedores")
    .select(
      `
      *,
      ProveedorTecnologia (
        tecnologias (*)
      ),
      ZonaProveedor (
        zonas (*)
      ),
      reseñas (
        id,
        estrellas
      )
    `
    )
    .order("nombre", { ascending: true });

  if (error) {
    mostrarAlerta("Error al obtener proveedores");
    throw error;
  }
  return data;
};

// Obtiene un proveedor por ID con tecnologías y reseñas (incluye datos del autor)
export const obtenerProveedorPorId = async (id, mostrarAlerta = () => {}) => {
  const { data, error } = await supabase
    .from("proveedores")
    .select(
      `
      *,
      ProveedorTecnologia (
        tecnologias (*)
      ),
      reseñas (
        comentario,
        estrellas,
        created_at,
        user:user_profiles (
          nombre,
          foto_url
        )
      )
    `
    )
    .eq("id", id)
    .single();

  if (error) {
    mostrarAlerta("Error al obtener proveedor");
    throw error;
  }
  return data;
};

// Obtiene proveedores para vista admin y normaliza arrays de tecnologías y zonas
export const obtenerProveedoresAdmin = async (mostrarAlerta = () => {}) => {
  const { data, error } = await supabase
    .from("proveedores")
    .select(
      `id, nombre, color, descripcion, sitio_web, logotipo, 
       ProveedorTecnologia(tecnologias(id, tecnologia)), 
       ZonaProveedor(zonas(id, departamento)),
       reseñas(id, estrellas)`
    )
    .order("nombre", { ascending: true });

  if (error) {
    mostrarAlerta("Error al obtener proveedores para admin.");
    throw error;
  }

  return data.map((p) => ({
    ...p,
    tecnologias: p.ProveedorTecnologia?.map((t) =>
      String(t.tecnologias?.tecnologia)
    ).filter(Boolean),
    zonas: p.ZonaProveedor?.map((z) => String(z.zonas?.id)).filter(Boolean),
  }));
};
