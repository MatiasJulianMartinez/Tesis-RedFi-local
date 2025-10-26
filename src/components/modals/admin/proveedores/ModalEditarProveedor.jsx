import { useEffect, useState } from "react";
import MainButton from "../../../ui/MainButton";
import MainH2 from "../../../ui/MainH2";
import Input from "../../../ui/Input";
import Textarea from "../../../ui/Textarea";
import FileInput from "../../../ui/FileInput";
import { IconX } from "@tabler/icons-react";
import { actualizarProveedor } from "../../../../services/proveedores/crudProveedor";
import { subirLogoProveedor, eliminarLogoPorURL } from "../../../../services/proveedores/logoProveedor";
import { useAlerta } from "../../../../context/AlertaContext";
import ModalContenedor from "../../../ui/ModalContenedor";

const ModalEditarProveedor = ({ proveedor, onClose, onActualizar }) => {
  // Estados del formulario con información actual del proveedor
  const [form, setForm] = useState({ ...proveedor });
  const [loading, setLoading] = useState(false);
  
  // Estados para manejo del logo
  const [logoFile, setLogoFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [logoOriginal, setLogoOriginal] = useState(null); // Para trackear el logo original

  const { mostrarError, mostrarExito } = useAlerta();

  /**
   * Convierte una URL de logo existente en un objeto File para mantener consistencia
   * en el manejo de archivos del componente
   */
  useEffect(() => {
    const prepararPreviewDesdeURL = async (url) => {
      try {
        const response = await fetch(url);
        const blob = await response.blob();
        const filename = "logo.png";
        const file = new File([blob], filename, { type: blob.type });

        setLogoFile(file);
        setPreviewUrl(url);
      } catch (error) {
        console.error("❌ Error al generar archivo desde URL:", error);
      }
    };

    if (proveedor) {
      setForm({
        nombre: proveedor.nombre || "",
        sitio_web: proveedor.sitio_web || "",
        descripcion: proveedor.descripcion || "",
        color: proveedor.color || "#000000",
        logotipo: proveedor.logotipo || null,
        eliminarLogo: false,
      });

      // Guardar referencia del logo original
      setLogoOriginal(proveedor.logotipo);

      if (proveedor.logotipo) {
        prepararPreviewDesdeURL(proveedor.logotipo);
      }
    }
  }, [proveedor]);

  /**
   * Maneja los cambios en los campos del formulario
   */
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  /**
   * Maneja cambios en campos de selección múltiple
   */
  const handleSelectChange = (campo, valores) => {
    setForm((prev) => ({ ...prev, [campo]: valores }));
  };

  /**
   * Procesa el envío del formulario y actualiza el proveedor
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      let logoUrl = form.logotipo || null;
      const logoAntiguo = proveedor.logotipo;

      console.log("🔄 Iniciando actualización de proveedor");
      console.log("📷 Logo actual:", logoAntiguo);
      console.log("📁 Archivo seleccionado:", logoFile);
      console.log("🖼️ Preview URL:", previewUrl);
      console.log("🗑️ Eliminar logo marcado:", form.eliminarLogo);

      // Caso 1: Eliminar logo actual
      if (form.eliminarLogo) {
        console.log("🗑️ Eliminando logo actual");
        logoUrl = null;
        // Eliminar logo del bucket si existe
        if (logoOriginal) {
          await eliminarLogoPorURL(logoOriginal);
          console.log("✅ Logo eliminado del bucket");
        }
      } 
      // Caso 2: Subir nueva imagen
      else if (logoFile && logoFile !== null) {
        // Verificar si realmente es un archivo nuevo seleccionado por el usuario
        const esArchivoNuevoSeleccionado = previewUrl?.startsWith('data:');
        
        console.log("📋 Es archivo nuevo:", esArchivoNuevoSeleccionado);
        
        if (esArchivoNuevoSeleccionado) {
          console.log("📤 Subiendo nueva imagen para proveedor ID:", proveedor.id);
          // 1. Subir nueva imagen PRIMERO (usando ID del proveedor)
          logoUrl = await subirLogoProveedor(proveedor.id, logoFile);
          console.log("✅ Nueva imagen subida:", logoUrl);
          
          // 2. Eliminar imagen antigua DESPUÉS del éxito
          if (logoOriginal && logoOriginal !== logoUrl) {
            try {
              console.log("🗑️ Eliminando logo anterior:", logoOriginal);
              await eliminarLogoPorURL(logoOriginal);
              console.log("✅ Logo anterior eliminado");
            } catch (deleteError) {
              console.warn("⚠️ No se pudo eliminar logo anterior:", deleteError);
              // No fallar el proceso si no se puede eliminar el anterior
            }
          }
        } else {
          // Mantener logo actual si no hay cambios
          logoUrl = logoOriginal;
        }
      } else {
        // Si no hay archivo y no se marcó para eliminar, mantener actual
        logoUrl = logoOriginal;
      }

      // 3. Actualizar el proveedor en la base de datos
      const { eliminarLogo, ...restoForm } = form;
      await actualizarProveedor(proveedor.id, {
        ...restoForm,
        logotipo: logoUrl,
      });
      
      mostrarExito("Proveedor actualizado correctamente");
      onActualizar?.();
      onClose();
    } catch (error) {
      mostrarError("Error al actualizar proveedor: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ModalContenedor onClose={onClose}>
      <div className="flex justify-between mb-6">
        <MainH2 className="mb-0">Editar proveedor</MainH2>
        <MainButton
          onClick={onClose}
          type="button"
          variant="cross"
          title="Cerrar modal"
          disabled={loading}
        >
          <IconX size={24} />
        </MainButton>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex flex-row gap-4">
          <div className="flex-1">
            <Input
              label={
                <>
                  Nombre del proveedor <span className="text-red-600">*</span>
                </>
              }
              name="nombre"
              value={form.nombre || ""}
              onChange={handleChange}
              required
              disabled={loading}
              placeholder="Nombre del proveedor"
            />
          </div>

          <div className="flex-1">
            <Input
              label="Sitio web (url)"
              name="sitio_web"
              value={form.sitio_web || ""}
              onChange={handleChange}
              disabled={loading}
              placeholder="https://www.ejemplo.com"
            />
          </div>
        </div>
        <div className="flex flex-row gap-4">
          <div className="flex-1">
            <Textarea
              label="Descripción"
              name="descripcion"
              value={form.descripcion || ""}
              onChange={handleChange}
              rows={8}
              disabled={loading}
              placeholder="Descripción del proveedor"
            />
          </div>
          <div className="flex-1">
            <FileInput
              label="Logotipo"
              id="logo"
              value={logoFile}
              onChange={(file) => {
                setLogoFile(file);

                if (file) {
                  // Genera preview local del archivo seleccionado
                  const reader = new FileReader();
                  reader.onloadend = () => setPreviewUrl(reader.result);
                  reader.readAsDataURL(file);

                  // Cancela la eliminación si hay nueva imagen
                  setForm((prev) => ({ ...prev, eliminarLogo: false }));
                } else {
                  // Cuando se quita el archivo, marcar para eliminar el logo
                  setPreviewUrl(null);
                  setForm((prev) => ({ ...prev, eliminarLogo: true }));
                }
              }}
              previewUrl={previewUrl}
              setPreviewUrl={setPreviewUrl}
              accept="image/*"
              disabled={loading}
            />
          </div>
        </div>
        
        {/* Selector de color con preview */}
        <div>
          <label className="block text-texto mb-1">Color <span className="text-red-600">*</span></label>
          <div className="flex items-center gap-4">
            {/* Picker visual de color */}
            <Input
              type="color"
              name="color"
              value={form.color || "#000000"}
              onChange={handleChange}
              disabled={loading}
              required
              title="Selecciona un color"
            />

            {/* Input manual de código hexadecimal */}
            <div className="flex-1">
              <Input
                type="text"
                name="color"
                value={form.color || ""}
                onChange={(e) => {
                  const hex = e.target.value;
                  // Valida formato hexadecimal mientras se escribe
                  const isValid = /^#[0-9A-Fa-f]{0,6}$/.test(hex) || hex === "";

                  if (isValid) {
                    setForm((prev) => ({ ...prev, color: hex }));
                  }
                }}
                disabled={loading}
                placeholder="#000000"
                maxLength={7}
                required
              />
            </div>

            {/* Preview del color seleccionado */}
            <div
              className="w-10 h-10 rounded border border-texto/15"
              style={{
                backgroundColor: /^#[0-9A-Fa-f]{6}$/.test(form.color || "")
                  ? form.color
                  : "#000000",
              }}
              title={`Color: ${form.color}`}
            />
          </div>
        </div>

        {/* Botones de acción */}
        <div className="flex gap-3 pt-4">
          <MainButton
            type="button"
            variant="secondary"
            onClick={onClose}
            disabled={loading}
            className="flex-1"
          >
            Cancelar
          </MainButton>
          <MainButton
            type="submit"
            variant="primary"
            loading={loading}
            disabled={loading}
            className="flex-1"
          >
            {loading ? "Guardando..." : "Guardar cambios"}
          </MainButton>
        </div>
        
        {/* Nota informativa sobre campos obligatorios */}
        <div className="text-center mt-6">
          <p className="text-sm text-texto/50 italic">
            Los campos marcados con <span className="text-red-600">*</span> son
            obligatorios.
          </p>
        </div>
      </form>
    </ModalContenedor>
  );
};

export default ModalEditarProveedor;
