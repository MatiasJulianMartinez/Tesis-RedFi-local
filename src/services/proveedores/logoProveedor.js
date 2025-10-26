import { supabase } from "../../supabase/client";

// Sube un logo al bucket "proveedores" usando la carpeta = proveedorId y devuelve la URL pública
export const subirLogoProveedor = async (proveedorId, file) => {
  const timestamp = Date.now();
  const path = `${proveedorId}/logo-${timestamp}.png`;

  console.log("📤 Subiendo logo en ruta:", path);
  console.log("📄 Archivo recibido:", file);

  const { error: uploadError } = await supabase.storage
    .from("proveedores")
    .upload(path, file, {
      cacheControl: "3600",
      upsert: false,
      contentType: file?.type || "image/png",
    });

  if (uploadError) {
    console.error("❌ Error al subir logo:", uploadError);
    throw uploadError;
  }

  const { data } = supabase.storage.from("proveedores").getPublicUrl(path);
  return data.publicUrl;
};

// Elimina todos los logos del proveedor indicado (borra todo el contenido de su carpeta)
export const eliminarLogoProveedor = async (proveedorId) => {
  const { data: files, error: listError } = await supabase.storage
    .from("proveedores")
    .list(proveedorId.toString());

  if (listError) {
    console.error("❌ Error al listar archivos:", listError);
    throw listError;
  }

  if (files && files.length > 0) {
    const filesToDelete = files.map((file) => `${proveedorId}/${file.name}`);

    const { error } = await supabase.storage
      .from("proveedores")
      .remove(filesToDelete);

    if (error) {
      console.error("❌ Error al eliminar logos:", error);
      throw error;
    }

    console.log("✅ Logos eliminados:", filesToDelete);
  }
};

// Elimina un logo específico del bucket a partir de su URL pública completa
export const eliminarLogoPorURL = async (logoUrl) => {
  if (!logoUrl) return;

  try {
    const url = new URL(logoUrl);
    const pathParts = url.pathname.split("/");
    const bucketIndex = pathParts.findIndex((part) => part === "proveedores");
    if (bucketIndex === -1) {
      throw new Error("URL de logo inválida");
    }

    const logoPath = pathParts.slice(bucketIndex + 1).join("/");

    const { error } = await supabase.storage
      .from("proveedores")
      .remove([logoPath]);

    if (error) {
      console.error("❌ Error al eliminar logo por URL:", error);
      throw error;
    }

    console.log("✅ Logo eliminado:", logoPath);
  } catch (error) {
    console.error("❌ Error al procesar URL de logo:", error);
    throw error;
  }
};
