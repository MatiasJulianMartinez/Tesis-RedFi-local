import { useEffect, useState } from "react";
import ModalContenedor from "../../../ui/ModalContenedor";
import MainButton from "../../../ui/MainButton";
import MainH2 from "../../../ui/MainH2";
import CheckboxDropdown from "../../../ui/CheckboxDropdown";
import Select from "../../../ui/Select";
import { IconX } from "@tabler/icons-react";
import { useAlerta } from "../../../../context/AlertaContext";
import { obtenerProveedoresSinZonas, actualizarZonasProveedor } from "../../../../services/relaciones/proveedorZonaService";
import { getZonas } from "../../../../services/zonaService";

const ModalAgregarProveedorZona = ({ onClose, onActualizar }) => {
  // Estados para las opciones de selección
  const [proveedores, setProveedores] = useState([]);
  const [zonas, setZonas] = useState([]);
  
  // Estados para las selecciones del usuario
  const [proveedorSeleccionado, setProveedorSeleccionado] = useState("");
  const [zonasSeleccionadas, setZonasSeleccionadas] = useState([]);

  // Estado de carga para operaciones asíncronas
  const [loading, setLoading] = useState(false);
  const { mostrarError, mostrarExito } = useAlerta();

  /**
   * Carga inicial de proveedores sin zonas asignadas y todas las zonas disponibles
   */
  useEffect(() => {
    const cargarDatos = async () => {
      try {
        const [provs, zonasData] = await Promise.all([
          obtenerProveedoresSinZonas(),
          getZonas(),
        ]);
        setProveedores(provs);
        setZonas(zonasData);
      } catch (e) {
        mostrarError("Error al cargar proveedores o zonas.");
      }
    };
    cargarDatos();
  }, []);

  /**
   * Procesa la asignación de zonas al proveedor seleccionado
   */
  const handleSubmit = async () => {
    if (!proveedorSeleccionado) {
      mostrarError("Debes seleccionar un proveedor.");
      return;
    }
    setLoading(true);
    try {
      // Asigna las zonas seleccionadas al proveedor
      await actualizarZonasProveedor(
        parseInt(proveedorSeleccionado),
        zonasSeleccionadas
      );
      mostrarExito("Zonas asignadas correctamente");
      onActualizar?.();
      onClose();
    } catch (e) {
      mostrarError("Error al asignar zonas: " + e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ModalContenedor onClose={onClose}>
      {/* Encabezado del modal */}
      <div className="flex justify-between items-center mb-6">
        <MainH2 className="mb-0">Asignar zonas a proveedor</MainH2>
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

      {/* Selector de proveedor */}
      <div className="mb-6">
        <Select
          label="Proveedor"
          value={proveedorSeleccionado}
          onChange={(val) => setProveedorSeleccionado(val)}
          options={[{ id: "", nombre: "Seleccionar proveedor" }, ...proveedores]}
          getOptionValue={(opt) => opt.id}
          getOptionLabel={(opt) => opt.nombre}
          disabled={loading}
        />
      </div>

      {/* Selector de zonas múltiples */}
      <div className="mb-6">
        <CheckboxDropdown
          label="Zonas a asignar"
          options={zonas.map((z) => ({
            value: String(z.id),
            label: z.departamento,
          }))}
          value={zonasSeleccionadas.map(String)}
          onChange={(nuevas) =>
            setZonasSeleccionadas(nuevas.map((id) => parseInt(id)))
          }
          disabled={loading || !proveedorSeleccionado}
        />
      </div>

      {/* Divider */}
      <hr className="border-texto/15 mb-6" />

      {/* Botones de acción */}
      <div className="flex flex-col sm:flex-row gap-3">
        <MainButton
          type="button"
          variant="secondary"
          onClick={onClose}
          disabled={loading}
          className="flex-1 order-2 sm:order-1"
        >
          Cancelar
        </MainButton>
        <MainButton
          type="submit"
          variant="primary"
          onClick={handleSubmit}
          loading={loading}
          disabled={loading}
          className="flex-1 order-1 sm:order-2"
        >
          {loading ? "Asignando..." : "Asignar zonas"}
        </MainButton>
      </div>
    </ModalContenedor>
  );
};

export default ModalAgregarProveedorZona;
