import { useState } from "react";
import { IconX } from "@tabler/icons-react";
import MainButton from "../../../ui/MainButton";
import MainH2 from "../../../ui/MainH2";
import Input from "../../../ui/Input";
import Textarea from "../../../ui/Textarea";
import ModalContenedor from "../../../ui/ModalContenedor";
import { agregarTecnologia } from "../../../../services/tecnologiaService";
import { useAlerta } from "../../../../context/AlertaContext";

const ModalAgregarTecnologia = ({ onClose, onActualizar }) => {
  // Estado del formulario con datos de la tecnología
  const [formData, setFormData] = useState({
    tecnologia: "",
    descripcion: "",
  });

  // Estado de carga para operaciones asíncronas
  const [loading, setLoading] = useState(false);
  const { mostrarExito, mostrarError } = useAlerta();

  /**
   * Maneja los cambios en los campos del formulario
   */
  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  /**
   * Procesa la creación de la nueva tecnología
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Crea la nueva tecnología en la base de datos
      await agregarTecnologia(formData, mostrarError);
      mostrarExito("Tecnología agregada correctamente");
      onActualizar?.();
      onClose();
    } catch (error) {
      console.error("Error al agregar tecnología:", error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ModalContenedor onClose={onClose}>
      {/* Encabezado del modal */}
      <div className="flex justify-between mb-6">
        <MainH2 className="mb-0">Agregar tecnología</MainH2>
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

      {/* Formulario de creación de tecnología */}
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Campo nombre de tecnología (obligatorio) */}
        <Input
          name="tecnologia"
          label={
              <>
                Nombre de la tecnología <span className="text-red-600">*</span>
              </>
            }
          value={formData.tecnologia}
          onChange={handleChange}
          placeholder="Ej. Fibra óptica"
          required
          disabled={loading}
        />

        {/* Campo descripción (opcional) */}
        <Textarea
          name="descripcion"
          label="Descripción"
          value={formData.descripcion}
          onChange={handleChange}
          rows={4}
          placeholder="Descripción de la tecnología"
          disabled={loading}
        />

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
            disabled={loading}
            className="flex-1"
          >
            {loading ? "Creando..." : "Crear tecnología"}
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

export default ModalAgregarTecnologia;
