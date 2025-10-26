import { IconCarambola, IconCarambolaFilled } from "@tabler/icons-react";
import Select from "../../ui/Select";
import MainButton from "../../ui/MainButton";
import { useFiltrosDinamicos } from "../../../hooks/useFiltrosDinamicos";

const FiltrosZona = ({
  filtros,
  setFiltros,
  onFiltrar,
  zonas,
  proveedores,
  tecnologiasUnicas,
  cargandoZonas,
  cargandoProveedores,
  cargandoTecnologias,
}) => {

  // Hook para filtros dinámicos que actualizan opciones según selección
  const {
    zonasDisponibles,
    proveedoresDisponibles,
    tecnologiasDisponibles,
  } = useFiltrosDinamicos(zonas, proveedores, tecnologiasUnicas, filtros);
  
  // Aplicar filtros seleccionados al mapa
  const aplicarFiltros = () => {
    onFiltrar({
      zona: filtros.zona || { id: "", nombre: "Todas las zonas" },
      proveedor: filtros.proveedor || { id: "", nombre: "Todos los proveedores" },
      tecnologia: filtros.tecnologia || "",
      valoracionMin: filtros.valoracionMin || 0,
    });
  };

  // Resetear todos los filtros a valores por defecto
  const limpiarFiltros = () => {
    const filtrosReseteados = {
      zona: { id: "", nombre: "Todas las zonas" },
      proveedor: { id: "", nombre: "Todos los proveedores" },
      tecnologia: "",
      valoracionMin: 0,
    };
    setFiltros(filtrosReseteados);
    onFiltrar(filtrosReseteados);
  };

  return (
    <div className="space-y-6">
      {/* Selectores de filtros principales */}
      <div className="flex flex-col gap-4">
        {/* Zona */}
        <Select
          label="Zona"
          value={filtros.zona?.id || ""}
          onChange={(id) => {
            const zona = zonasDisponibles.find((z) => String(z.id) === String(id)) || {
              id: "",
              nombre: "Todas las zonas",
            };
            setFiltros((prev) => ({ ...prev, zona }));
          }}
          options={zonasDisponibles}
          getOptionValue={(z) => z.id}
          getOptionLabel={(z) => z.departamento || z.nombre}
          loading={cargandoZonas}
        />

        {/* Proveedor */}
        <Select
          label="Proveedor"
          value={filtros.proveedor?.id || ""}
          onChange={(id) => {
            const proveedor = proveedoresDisponibles.find(
              (p) => String(p.id) === String(id)
            ) || {
              id: "",
              nombre: "Todos los proveedores",
            };
            setFiltros((prev) => ({ ...prev, proveedor }));
          }}
          options={proveedoresDisponibles}
          getOptionValue={(p) => p.id}
          getOptionLabel={(p) => p.nombre}
          loading={cargandoProveedores}
        />

        {/* Tecnología */}
        <Select
          label="Tecnología"
          value={filtros.tecnologia || ""}
          onChange={(t) => setFiltros((prev) => ({ ...prev, tecnologia: t }))}
          options={tecnologiasDisponibles}
          getOptionValue={(t) => t}
          getOptionLabel={(t) => t || "Todas las tecnologías"}
          loading={cargandoTecnologias}
        />
      </div>

      {/* Filtro de valoración por estrellas */}
      <div>
        <p className="block mb-1">Valoración exacta</p>
        <div className="flex items-center gap-3 flex-wrap">
          <MainButton
            type="button"
            onClick={() =>
              setFiltros((prev) => ({ ...prev, valoracionMin: 0 }))
            }
            variant="toggle"
            active={filtros.valoracionMin === 0}
          >
            Todas
          </MainButton>

          {/* Sistema de estrellas interactivo */}
          <div className="flex gap-1 bg-texto/5 font-bold px-3 py-1 rounded-full border border-texto/15">
            {[1, 2, 3, 4, 5].map((v) => {
              const isActive = filtros.valoracionMin >= v;
              const StarIcon = isActive ? IconCarambolaFilled : IconCarambola;

              return (
                <button
                  key={v}
                  type="button"
                  onClick={() =>
                    setFiltros((prev) => ({ ...prev, valoracionMin: v }))
                  }
                  className="p-1"
                  title={`${v} estrella${v > 1 ? "s" : ""}`}
                >
                  <StarIcon
                    size={24}
                    className={`transition hover:scale-105 ${
                      isActive ? "text-yellow-600" : "text-texto/75"
                    }`}
                  />
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Botones de acción para aplicar o limpiar filtros */}
      <div className="w-full flex flex-col sm:flex-row gap-3">
        <MainButton
          onClick={limpiarFiltros}
          variant="secondary"
          className="w-full sm:w-[35%] h-full"
          title="Limpiar filtros"
        >
          Limpiar filtros
        </MainButton>
        <MainButton
          onClick={aplicarFiltros}
          variant="accent"
          className="w-full sm:w-[65%] h-full"
          title="Aplicar filtros"
        >
          Aplicar filtros
        </MainButton>
      </div>
    </div>
  );
};

export default FiltrosZona;
