import { useState, useEffect } from "react";
import MapaInteractivo from "../components/mapa/MapaInteractivo";
import PanelControlMapa from "../components/mapa/PanelControlMapa";
import FiltrosMobile from "../components/mapa/filtros/FiltrosMobile";
import { IconFilter } from "@tabler/icons-react";
import { getZonas } from "../services/zonaService";
import { obtenerProveedores } from "../services/proveedores/obtenerProveedor";
import { DURACION_ALERTA, BOUNDS_CORRIENTES } from "../constants/constantes";
import MainLoader from "../components/ui/MainLoader";
import { useTheme } from "../context/ThemeContext";
import { useValidacionUbicacion } from "../hooks/useValidacionUbicacion";

const Mapa = () => {
  useEffect(() => {
    document.title = "Red-Fi | Mapa";
  }, []);
  const { theme } = useTheme();

  const [mostrarFiltros, setMostrarFiltros] = useState(false);
  const [mapRefReal, setMapRefReal] = useState(null);
  const [cargandoMapa, setCargandoMapa] = useState(true);

  const [zonas, setZonas] = useState([]);
  const [proveedores, setProveedores] = useState([]);
  const [tecnologiasUnicas, setTecnologiasUnicas] = useState([]);

  const [cargandoZonas, setCargandoZonas] = useState(true);
  const [cargandoProveedores, setCargandoProveedores] = useState(true);
  const [cargandoTecnologias, setCargandoTecnologias] = useState(true);

  const [filtrosAplicados, setFiltrosAplicados] = useState({
    zona: { id: "", nombre: "Todas las zonas" },
    proveedor: { id: "", nombre: "Todos los proveedores" },
    tecnologia: "",
    valoracionMin: 0,
  });

  const [filtrosTemporales, setFiltrosTemporales] = useState({
    zona: { id: "", nombre: "Todas las zonas" },
    proveedor: { id: "", nombre: "Todos los proveedores" },
    tecnologia: "",
    valoracionMin: 0,
  });

  // Hook para validación de ubicación
  const {
    ubicacionActual,
    zonaActual,
    ubicacionValida,
    cargandoUbicacion,
  } = useValidacionUbicacion(BOUNDS_CORRIENTES);

  useEffect(() => {
    const cargarDatos = async () => {
      const zonasSupabase = await getZonas();
      const proveedoresSupabase = await obtenerProveedores();

      // Obtener zonas usadas por proveedores (relación muchos a muchos)
      const zonasRelacionadas = new Set();
      proveedoresSupabase.forEach((prov) => {
        prov.ZonaProveedor?.forEach((rel) => {
          if (rel.zonas?.id) zonasRelacionadas.add(rel.zonas.id);
        });
      });

      const zonasFiltradas = zonasSupabase.filter((z) =>
        zonasRelacionadas.has(z.id)
      );

      // Obtener tecnologías únicas desde la relación muchos a muchos
      const tecnologiasSet = new Set();
      proveedoresSupabase.forEach((prov) => {
        prov.ProveedorTecnologia?.forEach((rel) => {
          if (rel.tecnologias?.tecnologia)
            tecnologiasSet.add(rel.tecnologias.tecnologia);
        });
      });

      setZonas([{ id: "", nombre: "Todas las zonas" }, ...zonasFiltradas]);
      setProveedores([
        { id: "", nombre: "Todos los proveedores" },
        ...proveedoresSupabase,
      ]);
      setTecnologiasUnicas(["", ...Array.from(tecnologiasSet)]);

      setCargandoZonas(false);
      setCargandoProveedores(false);
      setCargandoTecnologias(false);
    };

    cargarDatos();
  }, []);

  useEffect(() => {
    const manejarResize = () => {
      if (window.innerWidth >= 1024) {
        setMostrarFiltros(false);
      }
    };

    window.addEventListener("resize", manejarResize);
    manejarResize();

    return () => window.removeEventListener("resize", manejarResize);
  }, []);

  return (
    <div className="h-[calc(100vh-75px)] w-full relative">
      {cargandoMapa && (
        <MainLoader 
          texto="Cargando mapa..." 
          variant="overlay" 
          size="large" 
          visible={cargandoMapa} 
        />
      )}

      <div
        className={`grid grid-cols-1 lg:grid-cols-12 h-full relative transition-opacity duration-300 ${
          cargandoMapa ? "pointer-events-none opacity-0" : "opacity-100"
        }`}
      >
        <aside
          className={`hidden lg:block lg:col-span-3 h-full z-10 overflow-y-auto lg:p-4
          ${theme === "light"
            ? "bg-secundario border border-secundario/50 shadow-lg"
            : "bg-fondo border border-texto/15"}`}
        >
          <PanelControlMapa
            boundsCorrientes={BOUNDS_CORRIENTES}
            mapRef={mapRefReal}
            onAbrirModalReseña={() =>
              window.dispatchEvent(new CustomEvent("abrirModalAgregarReseña"))
            }
            filtros={filtrosTemporales}
            setFiltros={setFiltrosTemporales}
            zonas={zonas}
            proveedores={proveedores}
            tecnologiasUnicas={tecnologiasUnicas}
            cargandoZonas={cargandoZonas}
            cargandoProveedores={cargandoProveedores}
            cargandoTecnologias={cargandoTecnologias}
            onFiltrar={(f) => setFiltrosAplicados(f)}
            // Nuevas props para el estado de ubicación
            ubicacionActual={ubicacionActual}
            zonaActual={zonaActual}
            ubicacionValida={ubicacionValida}
            cargandoUbicacion={cargandoUbicacion}
          />
        </aside>

        <div className="col-span-1 lg:col-span-9 h-full relative">
          <MapaInteractivo
            filtros={filtrosAplicados}
            onMapRefReady={(ref) => setMapRefReal(ref)}
            setCargandoMapa={setCargandoMapa}
          />

          <div className="lg:hidden absolute bottom-6 right-6 flex flex-col gap-3 z-30">
            <button
              onClick={() => setMostrarFiltros(true)}
              className="bg-fondo p-4 rounded-full shadow-md hover:bg-acento transition border-2 border-acento"
              title="Filtros"
            >
              <IconFilter className="text-texto" />
            </button>
          </div>

          {mostrarFiltros && (
            <FiltrosMobile
              mapRef={mapRefReal}
              filtrosTemporales={filtrosTemporales}
              setFiltrosTemporales={setFiltrosTemporales}
              setFiltrosAplicados={setFiltrosAplicados}
              setMostrarFiltros={setMostrarFiltros}
              zonas={zonas}
              proveedores={proveedores}
              tecnologiasUnicas={tecnologiasUnicas}
              cargandoZonas={cargandoZonas}
              cargandoProveedores={cargandoProveedores}
              cargandoTecnologias={cargandoTecnologias}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default Mapa;
