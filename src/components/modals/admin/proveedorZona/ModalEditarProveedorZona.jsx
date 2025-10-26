import { useEffect, useState } from "react";
import ModalContenedor from "../../../ui/ModalContenedor";
import MainButton from "../../../ui/MainButton";
import MainH2 from "../../../ui/MainH2";
import CheckboxDropdown from "../../../ui/CheckboxDropdown";
import { IconX } from "@tabler/icons-react";
import { useAlerta } from "../../../../context/AlertaContext";
import {
  obtenerZonasPorProveedor,
  actualizarZonasProveedor,
} from "../../../../services/relaciones/proveedorZonaService";
import { getZonas } from "../../../../services/zonaService";

const ModalEditarProveedorZona = ({
  proveedor,
  onClose,
  onActualizar,
}) => {
  // Estados para las opciones y selecciones
  const [todasLasZonas, setTodasLasZonas] = useState([]);
  const [seleccionadas, setSeleccionadas] = useState([]);
  
  // Estado de carga para operaciones asíncronas
  const [cargando, setCargando] = useState(false);
  const { mostrarError, mostrarExito } = useAlerta();

  /**
   * Carga todas las zonas disponibles y las actualmente asignadas al proveedor
   */
  useEffect(() => {
    const cargarDatos = async () => {
      try {
        // Cargar todas las zonas y las actuales del proveedor
        const zonas = await getZonas();
        setTodasLasZonas(zonas);
        const actuales = await obtenerZonasPorProveedor(proveedor.id);
        setSeleccionadas(actuales); // Array de IDs de zonas
      } catch (e) {
        mostrarError("Error al cargar zonas: " + e.message);
      }
    };
    cargarDatos();
  }, [proveedor]);

  /**
   * Actualiza las zonas asignadas al proveedor
   */
  const handleSubmit = async () => {
    setCargando(true);
    try {
      // Actualiza las relaciones proveedor-zona
      await actualizarZonasProveedor(proveedor.id, seleccionadas);
      mostrarExito("Zonas actualizadas correctamente");
      onActualizar();
      onClose();
    } catch (e) {
      mostrarError("Error al actualizar zonas: " + e.message);
    } finally {
      setCargando(false);
    }
  };

  return (
    <ModalContenedor onClose={onClose}>
      {/* Encabezado del modal */}
      <div className="flex justify-between items-center mb-6">
        <MainH2 className="mb-0">Editar zonas</MainH2>
        <MainButton
          onClick={onClose}
          type="button"
          variant="cross"
          title="Cerrar modal"
          disabled={cargando}
        >
          <IconX size={24} />
        </MainButton>
      </div>

      {/* Información del proveedor */}
      <div className="bg-texto/5 rounded-lg p-4 mb-6">
        <div className="flex items-center gap-2">
          <span className="font-bold">Proveedor:</span>
          <span>
            {proveedor.proveedor}
          </span>
        </div>
      </div>

      {/* Selector de zonas con estado actual */}
      <div className="mb-6">
        <CheckboxDropdown
          label="Zonas asignadas"
          options={todasLasZonas.map((z) => ({
            value: String(z.id),
            label: z.departamento,
          }))}
          value={seleccionadas.map(String)}
          onChange={(nuevas) =>
            setSeleccionadas(nuevas.map((id) => parseInt(id)))
          }
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
          disabled={cargando}
          className="flex-1 order-2 sm:order-1"
        >
          Cancelar
        </MainButton>
        <MainButton
          type="submit"
          variant="primary"
          loading={cargando}
          disabled={cargando}
          className="flex-1 order-1 sm:order-2"
          onClick={handleSubmit}
        >
          {cargando ? "Guardando..." : "Guardar cambios"}
        </MainButton>
      </div>
    </ModalContenedor>
  );
};

export default ModalEditarProveedorZona;
