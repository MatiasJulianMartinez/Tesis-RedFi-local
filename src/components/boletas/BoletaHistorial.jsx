import { useEffect, useState } from "react";
import { eliminarBoletaConImagen } from "../../services/boletas/crud";
import ModalEditarBoleta from "../modals/boletas/ModalEditarBoleta";
import ModalVerBoleta from "../modals/boletas/ModalVerBoleta";
import ModalEliminar from "../modals/ModalEliminar";
import MainH3 from "../ui/MainH3";
import MainButton from "../ui/MainButton";
import MainLoader from "../ui/MainLoader";
import Table from "../ui/Table";
import { useAlerta } from "../../context/AlertaContext";

const BoletaHistorial = ({ boletas, recargarBoletas }) => {
  // Estados para control de UI y modales
  const [cargando, setCargando] = useState(true);
  const [boletaSeleccionada, setBoletaSeleccionada] = useState(null);
  const [boletaParaVer, setBoletaParaVer] = useState(null);
  const [boletaAEliminar, setBoletaAEliminar] = useState(null);
  const [eliminando, setEliminando] = useState(false);
  const { mostrarExito, mostrarError } = useAlerta();

  // Simular tiempo de carga para mejor UX
  useEffect(() => {
    const timer = setTimeout(() => setCargando(false), 300);
    return () => clearTimeout(timer);
  }, [boletas]);

  // Función para eliminar boleta con confirmación
  const confirmarEliminacion = async () => {
    if (!boletaAEliminar) return;
    try {
      setEliminando(true);
      await eliminarBoletaConImagen(boletaAEliminar);
      mostrarExito("Boleta eliminada correctamente.");
      window.dispatchEvent(new Event("nueva-boleta"));
      recargarBoletas?.();
    } catch (error) {
      mostrarError("Error al eliminar la boleta.");
      console.error(error);
    } finally {
      setEliminando(false);
      setBoletaAEliminar(null);
    }
  };

  // Formatear fecha con tooltip informativo
  const formatearFechaConTooltip = (fechaISO) => {
    if (!fechaISO) return <span className="text-xs text-texto/40">—</span>;

    const fecha = new Date(fechaISO);
    const formatoCorto = fecha.toLocaleDateString("es-AR");
    const formatoLargo = fecha.toLocaleDateString("es-AR", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    return <span title={formatoLargo}>{formatoCorto}</span>;
  };

  // Ordenar boletas por fecha de carga (más recientes primero)
  const boletasOrdenadas = [...boletas].sort(
    (a, b) => new Date(b.fecha_carga) - new Date(a.fecha_carga)
  );

  // Configuración de columnas para la tabla
  const columnas = [
    {
      id: "proveedor",
      label: "PROVEEDOR",
      renderCell: (b) => (
        <div className="font-bold text-texto">
          {b.proveedor || "—"}
        </div>
      ),
    },
    {
      id: "periodo",
      label: "PERÍODO",
      renderCell: (b) => (
        <div className="space-y-1">
          <span className="font-bold">{b.mes || "—"} {b.anio || "—"}</span>
        </div>
      ),
    },
    {
      id: "monto",
      label: "MONTO",
      renderCell: (b) => (
        <div className="font-bold text-acento">
          ${parseFloat(b.monto || 0).toFixed(2)}
        </div>
      ),
    },
    {
      id: "fechas",
      label: "FECHAS IMPORTANTES",
      renderCell: (b) => (
        <div className="space-y-1 text-xs">
          <div className="flex items-center gap-1">
            <span className="font-semibold text-green-700">Carga:</span>
            {formatearFechaConTooltip(b.fecha_carga)}
          </div>
          <div className="flex items-center gap-1">
            <span className="font-semibold text-red-600">Vence:</span>
            {formatearFechaConTooltip(b.vencimiento + "T12:00:00")}
          </div>
          {b.promo_hasta && (
            <div className="flex items-center gap-1">
              <span className="font-semibold text-yellow-600">Promo:</span>
              {formatearFechaConTooltip(b.promo_hasta + "T12:00:00")}
            </div>
          )}
        </div>
      ),
    },
    {
      id: "acciones",
      label: "ACCIONES",
      renderCell: (b) => (
        <div className="flex flex-wrap gap-2 lg:gap-2">
          <MainButton
            onClick={() => setBoletaParaVer(b)}
            title="Ver boleta"
            variant="see"
            iconAlwaysVisible={true}
          >
            <span className="hidden sm:inline">Ver</span>
          </MainButton>
          <MainButton
            onClick={() => setBoletaSeleccionada(b)}
            title="Editar boleta"
            variant="edit"
            iconAlwaysVisible={true}
          >
            <span className="hidden sm:inline">Editar</span>
          </MainButton>
          <MainButton
            onClick={() => setBoletaAEliminar(b)}
            title="Eliminar boleta"
            variant="delete"
            iconAlwaysVisible={true}
          >
            <span className="hidden sm:inline">Eliminar</span>
          </MainButton>
        </div>
      ),
    },
  ];

  return (
    <div className="max-w-7xl mx-auto relative">
      {/* Renderizado condicional según estado de datos */}
      {cargando ? (
        <MainLoader texto="Cargando boletas..." size="large" />
      ) : boletas.length === 0 ? (
        <div className="text-center py-16">
          <MainH3 className="text-center justify-center">
            No tienes boletas cargadas.
          </MainH3>
          <p className="text-texto mb-4">
            Comienza cargando tus boletas para poder verlas aquí.
          </p>
        </div>
      ) : (
        <Table columns={columnas} data={boletasOrdenadas} />
      )}

      {/* MODALES*/}
      {/* Modal para ver boleta con navegación */}
      {boletaParaVer &&
        (() => {
          const indexActual = boletasOrdenadas.findIndex(
            (b) => b.id === boletaParaVer.id
          );
          const boletaAnterior = boletasOrdenadas[indexActual + 1] || null;
          return (
            <ModalVerBoleta
              boleta={boletaParaVer}
              boletaAnterior={boletaAnterior}
              onClose={() => setBoletaParaVer(null)}
            />
          );
        })()}

      {/* Modal para editar boleta */}
      {boletaSeleccionada && (
        <ModalEditarBoleta
          boleta={boletaSeleccionada}
          onClose={() => setBoletaSeleccionada(null)}
          onActualizar={recargarBoletas}
        />
      )}

      {/* Modal de confirmación para eliminar */}
      {boletaAEliminar && (
        <ModalEliminar
          titulo="Eliminar boleta"
          descripcion="¿Estás seguro que querés eliminar esta boleta? Esta acción no se puede deshacer."
          onConfirmar={confirmarEliminacion}
          onCancelar={() => setBoletaAEliminar(null)}
          loading={eliminando}
        />
      )}
    </div>
  );
};

export default BoletaHistorial;
