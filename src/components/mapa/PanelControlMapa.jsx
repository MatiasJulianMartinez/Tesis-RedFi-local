import { useAuth } from "../../context/AuthContext";
import BusquedaUbicacion from "./panel/BusquedaUbicacion";
import UbicacionActual from "./panel/UbicacionActual";
import FiltrosZona from "./filtros/FiltrosZona";
import BotonAgregarReseña from "./panel/BotonAgregarReseña";
import MainButton from "../ui/MainButton";
import MainH3 from "../ui/MainH3";
import { IconX, IconCheck, IconAlertCircle } from "@tabler/icons-react";

const PanelControlMapa = ({
  boundsCorrientes,
  mapRef,
  onAbrirModalReseña,
  filtros,
  setFiltros,
  zonas,
  proveedores,
  tecnologiasUnicas,
  cargandoZonas,
  cargandoProveedores,
  cargandoTecnologias,
  onFiltrar,
  onCerrarPanel,
  ubicacionActual,
  zonaActual,
  ubicacionValida,
  cargandoUbicacion,
}) => {
  const { usuario } = useAuth();

  return (
    <div className="space-y-6">
      {/* Encabezado del panel con botón de cierre móvil */}
      <div className="flex justify-between items-center mb-4">
        <MainH3 className="mb-0">Panel de control</MainH3>
        {onCerrarPanel && (
          <MainButton
            onClick={onCerrarPanel}
            variant="cross"
            className="lg:hidden px-0"
            title="Cerrar panel"
          >
            <IconX size={24} />
          </MainButton>
        )}
      </div>

      {/* Indicador visual del estado de ubicación validada */}
      {ubicacionActual && (
        <div className={`rounded-lg p-3 border ${
          ubicacionValida 
            ? "bg-green-600/20 border-green-700/50" 
            : "bg-red-500/10 border-red-500/50"
        }`}>
          <div className="flex items-center gap-2 mb-2">
            {ubicacionValida ? (
              <IconCheck size={16} className="text-green-600" />
            ) : (
              <IconAlertCircle size={16} className="text-red-500" />
            )}
            <span className={`font-medium text-sm ${
              ubicacionValida ? "text-green-700" : "text-red-500"
            }`}>
              {ubicacionValida ? "Ubicación válida" : "Ubicación fuera de cobertura"}
            </span>
          </div>
          {zonaActual && (
            <p className="text-texto text-sm">
              Zona: <strong>{zonaActual.departamento}</strong>
            </p>
          )}
          <p className="text-texto/60 text-xs mt-1">
            Coordenadas: {ubicacionActual.lat.toFixed(6)}, {ubicacionActual.lng.toFixed(6)}
          </p>
        </div>
      )}

      {/* Herramientas de navegación y búsqueda */}
      <BusquedaUbicacion boundsCorrientes={boundsCorrientes} mapRef={mapRef} />

      {/* Botón de ubicación */}
      <UbicacionActual mapRef={mapRef} boundsCorrientes={boundsCorrientes} />

      {/* Sistema de filtros dinámicos */}
      <FiltrosZona
        filtros={filtros}
        setFiltros={setFiltros}
        onFiltrar={onFiltrar}
        zonas={zonas}
        proveedores={proveedores}
        tecnologiasUnicas={tecnologiasUnicas}
        cargandoZonas={cargandoZonas}
        cargandoProveedores={cargandoProveedores}
        cargandoTecnologias={cargandoTecnologias}
      />

      {/* Botón para agregar nueva reseña */}
      <BotonAgregarReseña
        usuario={usuario}
        onAbrirModalReseña={onAbrirModalReseña}
      />

      {/* Leyenda de colores para valoraciones en el mapa */}
      <div className="bg-texto/5 border border-texto/15 rounded-lg px-3 py-2 text-xs">
        <div className="flex justify-between text-center gap-2 px-4">
          <div className="flex flex-col items-center">
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: "#D7263D" }}
            ></div>
            <span className="text-texto/80 mt-0.5">1⭐</span>
            <span className="text-texto/80 mt-0.5">Muy malo</span>
          </div>
          <div className="flex flex-col items-center">
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: "#F46036" }}
            ></div>
            <span className="text-texto/80 mt-0.5">2⭐</span>
            <span className="text-texto/80 mt-0.5">Malo</span>
          </div>
          <div className="flex flex-col items-center">
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: "#FFD23F" }}
            ></div>
            <span className="text-texto/80 mt-0.5">3⭐</span>
            <span className="text-texto/80 mt-0.5">Regular</span>
          </div>
          <div className="flex flex-col items-center">
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: "#6CC551" }}
            ></div>
            <span className="text-texto/80 mt-0.5">4⭐</span>
            <span className="text-texto/80 mt-0.5">Bueno</span>
          </div>
          <div className="flex flex-col items-center">
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: "#36C9C6" }}
            ></div>
            <span className="text-texto/80 mt-0.5">5⭐</span>
            <span className="text-texto/80 mt-0.5">Excelente</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PanelControlMapa;
