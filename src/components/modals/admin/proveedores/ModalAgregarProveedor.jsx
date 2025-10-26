import {  useState } from "react";
import MainButton from "../../../ui/MainButton";
import MainH2 from "../../../ui/MainH2";
import Input from "../../../ui/Input";
import Textarea from "../../../ui/Textarea";
import FileInput from "../../../ui/FileInput";
import { IconX } from "@tabler/icons-react";
import { crearProveedor, actualizarProveedor } from "../../../../services/proveedores/crudProveedor";
import { subirLogoProveedor } from "../../../../services/proveedores/logoProveedor";
import { useAlerta } from "../../../../context/AlertaContext";
import ModalContenedor from "../../../ui/ModalContenedor";

const ModalAgregarProveedor = ({ onClose, onActualizar }) => {
  // Estado del formulario con datos del proveedor
  const [form, setForm] = useState({
    nombre: "",
    sitio_web: "",
    descripcion: "",
    color: "#000000",
  });

  // Estados para manejo de logotipo
  const [logoFile, setLogoFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);

  const [loading, setLoading] = useState(false);

  const { mostrarError, mostrarExito } = useAlerta();

  // Handlers para cambios en el formulario
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (campo, valores) => {
    setForm((prev) => ({ ...prev, [campo]: valores }));
  };

  // Crear nuevo proveedor con subida de logotipo
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.nombre.trim()) return mostrarError("El nombre es obligatorio");
    setLoading(true);

    try {
      // 1. Crear proveedor primero (sin logo)
      const nuevoProveedor = await crearProveedor({
        ...form,
        logotipo: null, // Inicialmente sin logo
      });

      let logoUrl = null;
      
      // 2. Subir logotipo solo si se seleccionó uno
      if (logoFile) {
        console.log("Subiendo logo para proveedor ID:", nuevoProveedor.id);
        logoUrl = await subirLogoProveedor(nuevoProveedor.id, logoFile);
        console.log("Logo subido con URL:", logoUrl);
        
        // 3. Actualizar proveedor con la URL del logo
        await actualizarProveedor(nuevoProveedor.id, {
          logotipo: logoUrl,
        });
      }

      mostrarExito("Proveedor creado exitosamente");
      onActualizar?.();
      onClose();
    } catch (error) {
      console.error("❌ Error general:", error);
      mostrarError(
        "Error al crear proveedor: " +
          (error.message || error.error_description || "Error desconocido")
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <ModalContenedor onClose={onClose}>
      {/* Encabezado del modal */}
      <div className="flex justify-between mb-6">
        <MainH2 className="mb-0">Agregar proveedor</MainH2>
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

      {/* Formulario de creación de proveedor */}
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Campos básicos: nombre y sitio web */}
        <div className="flex flex-row gap-4">
          <div className="flex-1">
            <Input
              label={
                <>
                  Nombre del proveedor <span className="text-red-600">*</span>
                </>
              }
              name="nombre"
              value={form.nombre}
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
              value={form.sitio_web}
              onChange={handleChange}
              disabled={loading}
              placeholder="https://www.ejemplo.com"
            />
          </div>
        </div>
        
        {/* Descripción y logotipo */}
        <div className="flex flex-row gap-4">
          <div className="flex-1">
            <Textarea
              label="Descripción"
              name="descripcion"
              value={form.descripcion}
              onChange={handleChange}
              rows={8}
              disabled={loading}
              placeholder="Descripción del proveedor"
            />
          </div>
          <div className="flex-1">
            <FileInput
              label="Logotipo"
              value={logoFile}
              onChange={setLogoFile}
              previewUrl={previewUrl}
              setPreviewUrl={setPreviewUrl}
              accept="image/*"
              disabled={loading}
            />
          </div>
        </div>

        {/* Selector de color con múltiples interfaces */}
        <div>
          <label className="block text-texto mb-1">Color <span className="text-red-600">*</span></label>
          <div className="flex items-center gap-4">
            <Input
              type="color"
              name="color"
              value={form.color}
              onChange={handleChange}
              disabled={loading}
              required
              title="Selecciona un color"
            />
            <div className="flex-1">
              <Input
                type="text"
                name="color"
                value={form.color}
                onChange={(e) => {
                  const hex = e.target.value;
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
            <div
              className="w-10 h-10 rounded border border-texto/15"
              style={{ backgroundColor: form.color }}
              title={`Color: ${form.color}`}
            />
          </div>
        </div>

        {/* Botones de acción del formulario */}
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
            {loading ? "Creando..." : "Crear proveedor"}
          </MainButton>
        </div>

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

export default ModalAgregarProveedor;
