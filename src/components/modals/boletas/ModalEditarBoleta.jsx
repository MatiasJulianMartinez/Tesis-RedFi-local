import { useState, useEffect } from "react";
import MainButton from "../../ui/MainButton";
import MainH2 from "../../ui/MainH2";
import Input from "../../ui/Input";
import FileInput from "../../ui/FileInput";
import Select from "../../ui/Select";
import ModalContenedor from "../../ui/ModalContenedor";
import {
  IconX,
  IconCalendar,
  IconCurrencyDollar,
  IconWifi,
} from "@tabler/icons-react";
import { actualizarBoletaConImagen } from "../../../services/boletas/crud";
import { useAlerta } from "../../../context/AlertaContext";

const ModalEditarBoleta = ({ boleta, onClose, onActualizar }) => {
  // Verifica si el proveedor está en la lista predefinida
  const esProveedorValido = [
    "Fibertel",
    "Telecentro",
    "Claro",
    "Movistar",
  ].includes(boleta.proveedor);

  // Convierte fecha ISO a formato YYYY-MM-DD para inputs de tipo date
  const formatFecha = (fecha) => {
    if (!fecha) return "";
    const d = new Date(fecha);
    return d.toISOString().split("T")[0]; // "YYYY-MM-DD"
  };

  // Estado del formulario inicializado con datos de la boleta existente
  const [form, setForm] = useState({
    ...boleta,
    proveedor: esProveedorValido ? boleta.proveedor : "Otro",
    proveedorOtro: esProveedorValido ? "" : boleta.proveedor,
    vencimiento: formatFecha(boleta.vencimiento),
    promoHasta: formatFecha(boleta.promo_hasta), // <-- este nombre depende del campo original
  });

  // Estados para la gestión de archivos e imagen
  const [archivoNuevo, setArchivoNuevo] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [imagenEliminada, setImagenEliminada] = useState(false);

  const { mostrarExito, mostrarError } = useAlerta();

  // Opciones disponibles para el selector de mes
  const meses = [
    "Enero",
    "Febrero",
    "Marzo",
    "Abril",
    "Mayo",
    "Junio",
    "Julio",
    "Agosto",
    "Septiembre",
    "Octubre",
    "Noviembre",
    "Diciembre",
  ];

  // Opciones disponibles para el selector de proveedor
  const proveedores = ["Fibertel", "Telecentro", "Claro", "Movistar", "Otro"];

  // Inicializa la vista previa con la imagen existente de la boleta
  useEffect(() => {
    if (boleta.url_imagen) {
      setPreview(boleta.url_imagen);
    }
  }, [boleta.url_imagen]);

  // Maneja los cambios en los campos de texto del formulario
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Maneja los cambios en los campos de selección
  const handleSelectChange = (campo) => (valor) => {
    setForm((prev) => ({ ...prev, [campo]: valor }));
  };

  // Elimina la imagen actual y resetea el archivo nuevo
  const handleClearImagen = () => {
    setArchivoNuevo(null);
    setPreview(null);
    setImagenEliminada(true);
  };

  // Procesa la actualización de la boleta con los cambios realizados
  const handleGuardarCambios = async () => {
    setLoading(true);
    try {
      const datosFinales = {
        ...form,
        proveedor:
          form.proveedor === "Otro" ? form.proveedorOtro : form.proveedor,
        promo_hasta: form.promoHasta, // mapear a snake_case si es necesario
      };

      // Eliminar campos innecesarios o camelCase
      delete datosFinales.proveedorOtro;
      delete datosFinales.promoHasta;

      await actualizarBoletaConImagen(
        boleta,
        datosFinales,
        archivoNuevo,
        imagenEliminada
      );

      mostrarExito("Boleta actualizada correctamente.");
      window.dispatchEvent(new Event("nueva-boleta"));
      onActualizar?.();
      onClose();
    } catch (error) {
      console.error(error);
      mostrarError("Error al actualizar la boleta.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ModalContenedor onClose={onClose}>
      {/* Encabezado del modal */}
      <div className="flex justify-between mb-6">
        <MainH2 className="mb-0">Modificar boleta</MainH2>
        <MainButton
          onClick={onClose}
          type="button"
          variant="cross"
          title="Cerrar modal"
          className="px-0"
        >
          <IconX size={24} />
        </MainButton>
      </div>

      {/* Formulario de edición de boleta */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Selector de mes */}
        <Select
          name="mes"
          value={form.mes}
          onChange={handleSelectChange("mes")}
          options={meses}
          label="Mes"
        />
        
        {/* Campo año */}
        <Input
          name="anio"
          value={form.anio}
          onChange={handleChange}
          placeholder="Año"
          label="Año"
        />
        
        {/* Campo monto */}
        <Input
          name="monto"
          type="number"
          value={form.monto}
          onChange={handleChange}
          placeholder="Monto"
          label="Monto"
          icon={IconCurrencyDollar}
        />
        
        {/* Selector de proveedor */}
        <Select
          name="proveedor"
          value={form.proveedor}
          onChange={handleSelectChange("proveedor")}
          options={proveedores}
          label="Proveedor"
          icon={IconWifi}
        />

        {/* Campo proveedor personalizado (solo si selecciona "Otro") */}
        {form.proveedor === "Otro" && (
          <Input
            label="Nombre del proveedor"
            name="proveedorOtro"
            value={form.proveedorOtro}
            onChange={handleChange}
            placeholder="Ej. Red Fibra Z"
            required
          />
        )}

        {/* Campo fecha de vencimiento */}
        <Input
          name="vencimiento"
          type="date"
          value={form.vencimiento}
          onChange={handleChange}
          label="Fecha de vencimiento"
          className="md:col-span-2"
          icon={IconCalendar}
        />

        {/* Campo fin de promoción */}
        <Input
          name="promoHasta"
          type="date"
          value={form.promoHasta}
          onChange={handleChange}
          label="Fin de promoción"
          className="md:col-span-2"
          icon={IconCalendar}
        />

        {/* Campo de carga/edición de archivo */}
        <div className="md:col-span-2 text-center">
          <FileInput
            id="archivoNuevo"
            label="Nuevo archivo"
            accept="image/*, application/pdf"
            value={archivoNuevo}
            onChange={(file) => {
              setArchivoNuevo(file);
              setImagenEliminada(false); // si elige una nueva, ya no es una eliminación
            }}
            previewUrl={preview}
            setPreviewUrl={setPreview}
            existingImage={
              boleta.url_imagen && !imagenEliminada ? boleta.url_imagen : null
            }
            onClear={handleClearImagen}
          />
        </div>
      </div>

      {/* Botones de acción */}
      <div className="flex justify-center gap-4 pt-4">
        <MainButton
          type="button"
          variant="secondary"
          onClick={onClose}
          disabled={loading}
        >
          Cancelar
        </MainButton>

        <MainButton
          type="button"
          variant="primary"
          onClick={handleGuardarCambios}
          loading={loading}
          disabled={loading}
        >
          Guardar Cambios
        </MainButton>
      </div>
    </ModalContenedor>
  );
};

export default ModalEditarBoleta;
