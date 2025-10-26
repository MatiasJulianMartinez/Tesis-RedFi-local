import { useState } from "react";
import MainButton from "../../ui/MainButton";
import MainH2 from "../../ui/MainH2";
import Input from "../../ui/Input";
import Select from "../../ui/Select";
import FileInput from "../../ui/FileInput";
import ModalContenedor from "../../ui/ModalContenedor";
import {
  IconCalendar,
  IconCurrencyDollar,
  IconWifi,
  IconX,
} from "@tabler/icons-react";
import { obtenerUsuarioActual } from "../../../services/boletas/auth";
import { subirImagenBoleta } from "../../../services/boletas/upload";
import { guardarBoleta } from "../../../services/boletas/crud";
import { useAlerta } from "../../../context/AlertaContext";

const ModalAgregarBoleta = ({ onClose, onBoletaAgregada, onActualizarNotificaciones }) => {
  // Estado del formulario con datos de la boleta
  const [form, setForm] = useState({
    mes: "",
    anio: "",
    monto: "",
    proveedor: "",
    vencimiento: "",
    promoHasta: "",
    proveedorOtro: "",
  });

  // Estados para la gestión del archivo y carga
  const [loading, setLoading] = useState(false);
  const [archivo, setArchivo] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const { mostrarExito, mostrarError } = useAlerta();

  // Opciones disponibles para el selector de mes
  const meses = [
    { label: "Seleccionar mes", value: "" },
    { label: "Enero", value: "Enero" },
    { label: "Febrero", value: "Febrero" },
    { label: "Marzo", value: "Marzo" },
    { label: "Abril", value: "Abril" },
    { label: "Mayo", value: "Mayo" },
    { label: "Junio", value: "Junio" },
    { label: "Julio", value: "Julio" },
    { label: "Agosto", value: "Agosto" },
    { label: "Septiembre", value: "Septiembre" },
    { label: "Octubre", value: "Octubre" },
    { label: "Noviembre", value: "Noviembre" },
    { label: "Diciembre", value: "Diciembre" },
  ];

  // Opciones disponibles para el selector de proveedor
  const proveedores = [
    { label: "Seleccionar proveedor", value: "" },
    { label: "Fibertel", value: "Fibertel" },
    { label: "Telecentro", value: "Telecentro" },
    { label: "Claro", value: "Claro" },
    { label: "Movistar", value: "Movistar" },
    { label: "Otro", value: "Otro" },
  ];

  // Maneja los cambios en los campos de texto del formulario
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Maneja los cambios en los campos de selección
  const handleSelectChange = (campo) => (valor) => {
    setForm((prev) => ({ ...prev, [campo]: valor }));
  };

  // Procesa el envío del formulario y guarda la boleta
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Validaciones manuales
      if (!form.mes) {
        mostrarError("Debés seleccionar un mes válido.");
        return;
      }
      if (!form.proveedor) {
        mostrarError("Debés seleccionar un proveedor válido.");
        return;
      }

      if (form.proveedor === "Otro" && !form.proveedorOtro.trim()) {
        mostrarError("Debés ingresar el nombre del proveedor.");
        return;
      }

      const user = await obtenerUsuarioActual();
      if (!user) {
        mostrarError("Debés iniciar sesión.");
        return;
      }

      let url_imagen = null;
      if (archivo) {
        url_imagen = await subirImagenBoleta(archivo);
      }

      const vencimientoAjustado = new Date(
        form.vencimiento + "T12:00:00"
      ).toISOString();

      const promoHastaAjustado = form.promoHasta
        ? new Date(form.promoHasta + "T12:00:00").toISOString()
        : null;

      const proveedorFinal =
        form.proveedor === "Otro" ? form.proveedorOtro : form.proveedor;

      await guardarBoleta({
        mes: form.mes,
        anio: form.anio,
        monto: form.monto,
        proveedor: proveedorFinal,
        user_id: user.id,
        vencimiento: vencimientoAjustado,
        promo_hasta: promoHastaAjustado,
        url_imagen,
      });

      mostrarExito("Boleta guardada correctamente.");

      setForm({
        mes: "",
        anio: "",
        monto: "",
        proveedor: "",
        vencimiento: "",
        promoHasta: "",
        proveedorOtro: "",
      });
      setArchivo(null);
      setPreviewUrl(null);

      onBoletaAgregada?.();
      onActualizarNotificaciones?.();
      window.dispatchEvent(new Event("nueva-boleta"));

      onClose();
    } catch (error) {
      console.error(error);
      mostrarError("Error al guardar la boleta.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ModalContenedor onClose={onClose}>
      {/* Encabezado del modal */}
      <div className="flex justify-between mb-6">
        <MainH2 className="mb-0">Agregar Nueva Boleta</MainH2>
        <MainButton
          onClick={onClose}
          type="button"
          variant="cross"
          aria-label="Cerrar"
        >
          <IconX />
        </MainButton>
      </div>
      
      {/* Formulario de creación de boleta */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Campos principales del formulario */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Selector de mes (obligatorio) */}
          <Select
            label={
              <>
                Mes <span className="text-red-600">*</span>
              </>
            }
            name="mes"
            value={form.mes}
            onChange={handleSelectChange("mes")}
            options={meses}
            getOptionValue={(opt) => opt.value}
            getOptionLabel={(opt) => opt.label}
            required
          />

          {/* Campo año (obligatorio) */}
          <Input
            label={
              <>
                Año <span className="text-red-600">*</span>
              </>
            }
            name="anio"
            type="number"
            value={form.anio}
            onChange={handleChange}
            placeholder="Ej. 2025"
            min={2020}
            max={2035}
            maxLength={4}
            required
          />

          {/* Campo monto (obligatorio) */}
          <Input
            label={
              <>
                Monto <span className="text-red-600">*</span>
              </>
            }
            name="monto"
            type="number"
            value={form.monto}
            onChange={handleChange}
            placeholder="Monto"
            required
            min="0"
            step="0.01"
            icon={IconCurrencyDollar}
          />

          {/* Selector de proveedor (obligatorio) */}
          <Select
            label={
              <>
                Proveedor <span className="text-red-600">*</span>
              </>
            }
            name="proveedor"
            value={form.proveedor}
            onChange={handleSelectChange("proveedor")}
            options={proveedores}
            getOptionValue={(opt) => opt.value}
            getOptionLabel={(opt) => opt.label}
            required
            icon={IconWifi}
          />

          {/* Campo proveedor personalizado (solo si selecciona "Otro") */}
          {form.proveedor === "Otro" && (
            <Input
              label={
                <>
                  Nombre del proveedor <span className="text-red-600">*</span>
                </>
              }
              name="proveedorOtro"
              value={form.proveedorOtro}
              onChange={handleChange}
              placeholder="Ej. Red Fibra Z"
              required
            />
          )}

          {/* Campo fecha de vencimiento (obligatorio) */}
          <Input
            label={
              <>
                Fecha de vencimiento <span className="text-red-600">*</span>
              </>
            }
            name="vencimiento"
            type="date"
            value={form.vencimiento}
            onChange={handleChange}
            required
            icon={IconCalendar}
          />

          {/* Campo fin de promoción (opcional) */}
          <Input
            label="Fin de promoción"
            name="promoHasta"
            type="date"
            value={form.promoHasta}
            onChange={handleChange}
            icon={IconCalendar}
          />
        </div>
        
        {/* Campo de carga de archivo */}
        <div className="flex justify-center text-center">
          <FileInput
            id="archivo"
            label="Archivo de la boleta"
            value={archivo}
            onChange={setArchivo}
            previewUrl={previewUrl}
            setPreviewUrl={setPreviewUrl}
            accept="image/*, application/pdf"
          />
        </div>

        {/* Botones de acción */}
        <div className="flex justify-center gap-4">
          <MainButton
            type="button"
            variant="secondary"
            onClick={onClose}
          >
            Cancelar
          </MainButton>
          <MainButton
            type="submit"
            variant="primary"
            loading={loading}
            disabled={loading}
          >
            {loading ? "Guardando..." : "Guardar boleta"}
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

export default ModalAgregarBoleta;
