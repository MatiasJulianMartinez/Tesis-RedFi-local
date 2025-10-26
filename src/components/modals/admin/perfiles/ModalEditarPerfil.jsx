import { useEffect, useState } from "react";
import { IconX } from "@tabler/icons-react";
import ModalContenedor from "../../../ui/ModalContenedor";
import MainButton from "../../../ui/MainButton";
import MainH2 from "../../../ui/MainH2";
import Input from "../../../ui/Input";
import Select from "../../../ui/Select";
import { actualizarPerfilPorId } from "../../../../services/perfil/adminPerfil";
import { useAlerta } from "../../../../context/AlertaContext";

// Opciones estáticas para los selectores
const opcionesRol = [
  { value: "user", label: "Usuario" },
  { value: "admin", label: "Administrador" },
];

const opcionesPlan = [
  { value: "basico", label: "Básico" },
  { value: "premium", label: "Premium" },
];

const ModalEditarPerfil = ({ perfil, onClose, onActualizar }) => {
  // Estado del formulario con valores por defecto
  const [formData, setFormData] = useState({
    nombre: "",
    proveedor_preferido: "",
    rol: "user",
    plan: "basico",
    foto: null,
    preview: null,
    eliminarFoto: false,
  });

  const [loading, setLoading] = useState(false);
  const { mostrarExito, mostrarError } = useAlerta();

  // Cargar datos del perfil al abrir el modal
  useEffect(() => {
    if (perfil) {
      setFormData((prev) => ({
        ...prev,
        nombre: perfil.nombre || "",
        proveedor_preferido: perfil.proveedor_preferido || "",
        rol: perfil.rol || "user",
        plan: perfil.plan || "basico",
        preview: perfil.foto_url || null,
        foto: null,
        eliminarFoto: false,
      }));
    }
  }, [perfil]);

  // Handlers para cambios en inputs
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name, value) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (file) => {
    if (file) {
      setFormData((prev) => ({
        ...prev,
        foto: file,
        preview: URL.createObjectURL(file),
        eliminarFoto: false,
      }));
    }
  };

  const handleEliminarFoto = () => {
    setFormData((prev) => ({
      ...prev,
      foto: null,
      preview: null,
      eliminarFoto: true,
    }));
  };

  // Enviar formulario y actualizar perfil
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await actualizarPerfilPorId(perfil.id, formData, mostrarError);
      mostrarExito("Perfil actualizado correctamente");
      onActualizar?.();
      onClose();
    } catch (error) {
      console.error("Error al actualizar el perfil:", error.message);
    } finally {
      setLoading(false);
    }
  };

  if (!perfil) return null;

  return (
    <ModalContenedor onClose={onClose}>
      {/* Encabezado del modal */}
      <div className="flex justify-between items-center mb-6">
        <MainH2 className="mb-0">Editar Perfil</MainH2>
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

      {/* Formulario de edición */}
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Campos de información personal */}
        <div className="flex flex-row gap-4">
          <div className="flex-1">
            <Input
              name="nombre"
              label={
                <>
                  Nombre <span className="text-red-600">*</span>
                </>
              }
              value={formData.nombre}
              onChange={handleChange}
              required
              disabled={loading}
            />
          </div>
          <div className="flex-1">
            <Input
              name="proveedor_preferido"
              label="Proveedor preferido"
              value={formData.proveedor_preferido}
              onChange={handleChange}
              disabled={loading}
            />
          </div>
        </div>
        
        {/* Campos de configuración de cuenta */}
        <div className="flex flex-row gap-4">
          <div className="flex-1">
            <Select
              name="rol"
              label="Rol"
              value={formData.rol}
              onChange={(value) => handleSelectChange("rol", value)}
              options={opcionesRol}
              getOptionValue={(opt) => opt.value}
              getOptionLabel={(opt) => opt.label}
              disabled={loading}
            />
          </div>
          <div className="flex-1">
            <Select
              name="plan"
              label="Plan"
              value={formData.plan}
              onChange={(value) => handleSelectChange("plan", value)}
              options={opcionesPlan}
              getOptionValue={(opt) => opt.value}
              getOptionLabel={(opt) => opt.label}
              disabled={loading}
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
            disabled={loading}
            className="flex-1"
          >
            {loading ? "Guardando..." : "Guardar"}
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

export default ModalEditarPerfil;
