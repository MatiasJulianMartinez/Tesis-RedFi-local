import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import {
  obtenerReseñasUsuario,
  actualizarReseña,
  eliminarReseña,
} from "../services/reseñas/usuarioReseña";
import {
  IconCarambolaFilled,
  IconCarambola,
  IconCalendar,
  IconLoader2,
  IconStars,
  IconArrowLeft,
} from "@tabler/icons-react";
import ModalEditarReseña from "../components/modals/mapa/ModalEditarReseña";
import ModalEliminar from "../components/modals/ModalEliminar";
import ModalReseña from "../components/modals/mapa/ModalReseña";
import MainH1 from "../components/ui/MainH1";
import MainH3 from "../components/ui/MainH3";
import MainButton from "../components/ui/MainButton";
import MainLinkButton from "../components/ui/MainLinkButton";
import MainLoader from "../components/ui/MainLoader";
import Table from "../components/ui/Table";

import { useAlerta } from "../context/AlertaContext";

const Reseñas = () => {
  const [reseñaParaVer, setReseñaParaVer] = useState(null);
  const { usuario } = useAuth();
  const [reseñas, setReseñas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [reseñaEditando, setReseñaEditando] = useState(null);
  const [reseñaAEliminar, setReseñaAEliminar] = useState(null);
  const [eliminando, setEliminando] = useState(false);
  const { mostrarError, mostrarExito } = useAlerta();
  const { currentTheme } = useTheme();

  useEffect(() => {
    document.title = "Red-Fi | Mis Reseñas";
  }, []);

  useEffect(() => {
    const cargarReseñas = async () => {
      if (usuario) {
        try {
          const data = await obtenerReseñasUsuario();
          setReseñas(data);
        } catch (error) {
          console.error("Error al cargar reseñas:", error);
          mostrarError("Error al cargar las reseñas.");
        } finally {
          setLoading(false);
        }
      }
    };

    cargarReseñas();
  }, [usuario]);

  const handleEditarReseña = (reseña) => {
    setReseñaEditando(reseña);
    setIsModalOpen(true);
  };

  const handleGuardarReseña = async (formData) => {
    try {
      const reseñaActualizada = await actualizarReseña(
        reseñaEditando.id,
        formData
      );
      setReseñas(
        reseñas.map((r) => (r.id === reseñaEditando.id ? reseñaActualizada : r))
      );
      setIsModalOpen(false);
      setReseñaEditando(null);
      mostrarExito("Reseña actualizada correctamente.");
    } catch (error) {
      console.error("Error al actualizar reseña:", error);
      mostrarError("Error al actualizar la reseña.");
    }
  };

  const handleEliminarReseña = (reseña) => {
    setReseñaAEliminar(reseña);
  };

  const confirmarEliminacion = async () => {
    if (!reseñaAEliminar) return;

    try {
      setEliminando(true);
      await eliminarReseña(reseñaAEliminar.id);
      setReseñas(reseñas.filter((r) => r.id !== reseñaAEliminar.id));
      mostrarExito("Reseña eliminada correctamente.");
    } catch (error) {
      console.error("Error al eliminar reseña:", error);
      mostrarError("Error al eliminar la reseña.");
    } finally {
      setEliminando(false);
      setReseñaAEliminar(null);
    }
  };

  const renderEstrellas = (estrellas) => {
    const estrellasLlenas = Math.round(estrellas);
    return (
      <div className="flex gap-1 text-yellow-600 bg-texto/5 font-bold px-3 py-1 rounded-full border border-texto/15 w-fit">
        {Array.from({ length: 5 }).map((_, i) =>
          i < estrellasLlenas ? (
            <IconCarambolaFilled key={i} size={16} />
          ) : (
            <IconCarambola key={i} size={16} />
          )
        )}
      </div>
    );
  };

  const columnas = [
    {
      id: "proveedor",
      label: "PROVEEDOR",
      renderCell: (r) => (
        <div className="space-y-1">
          <div className="font-bold text-texto">
            {r.proveedores?.nombre || "Proveedor no disponible"}
          </div>
        </div>
      ),
    },
    {
      id: "evaluacion",
      label: "EVALUACIÓN",
      renderCell: (r) => (
        <div className="space-y-2">
          {renderEstrellas(r.estrellas)}
        </div>
      ),
    },
    {
      id: "comentario",
      label: "COMENTARIO",
      renderCell: (r) => (
        <div 
          className="text-sm text-texto max-w-[250px] lg:max-w-none line-clamp-3 leading-relaxed"
          title={r.comentario}
        >
          {r.comentario || "—"}
        </div>
      ),
    },
    {
      id: "acciones",
      label: "ACCIONES",
      renderCell: (r) => (
        <div className="flex flex-wrap gap-2 lg:gap-2">
          <MainButton
            onClick={() => setReseñaParaVer(r)}
            variant="see"
            title="Ver reseña"
            iconAlwaysVisible={true}
          >
            <span className="hidden sm:inline">Ver</span>
          </MainButton>
          <MainButton
            onClick={() => handleEditarReseña(r)}
            variant="edit"
            title="Editar reseña"
            iconAlwaysVisible={true}
          >
            <span className="hidden sm:inline">Editar</span>
          </MainButton>
          <MainButton
            onClick={() => handleEliminarReseña(r)}
            variant="delete"
            title="Eliminar reseña"
            iconAlwaysVisible={true}
          >
            <span className="hidden sm:inline">Eliminar</span>
          </MainButton>
        </div>
      ),
    },
  ];

  if (!usuario) {
    return (
      <div className="w-full bg-fondo px-4 sm:px-6 pb-12">
        <div className="max-w-7xl mx-auto pt-16 text-center">
          <p className="text-texto text-lg">No has iniciado sesión.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="w-full bg-fondo px-4 sm:px-6 pb-12">
        <div className="max-w-7xl mx-auto pt-16 text-center">
          <MainLoader texto="Cargando reseñas..." size="large" />
        </div>
      </div>
    );
  }

  return (
    <section className="self-start py-16 px-4 sm:px-6 text-texto w-full">
      <div className="max-w-7xl mx-auto space-y-12">
        <div className="text-center mb-8">
          <MainH1 icon={IconStars}>Mis reseñas</MainH1>
          <p className="text-lg">
            Administre todas las reseñas que ha publicado.
          </p>
        </div>

        {reseñas.length === 0 ? (
          <div className="text-center py-16">
            <div className="backdrop-blur-md bg-secundario border border-secundario/50 shadow-lg rounded-lg p-8">
              <MainH3 className="text-center justify-center">
                No tienes reseñas publicadas
              </MainH3>
              <p className="text-texto mb-4">
                Comienza compartiendo tu experiencia con diferentes proveedores
                de internet.
              </p>
            </div>
          </div>
        ) : (
          <>
            <Table columns={columnas} data={reseñas} />

            {/* Estadísticas */}
            <div className="mt-8 text-center">
              <div
                className={`backdrop-blur-md rounded-lg p-6 ${
                  currentTheme === "light"
                    ? "bg-secundario border border-secundario/50 shadow-lg"
                    : "bg-texto/5 border border-texto/15"
                }`}
              >
                <MainH3 className="text-center justify-center">
                  Estadísticas de tus reseñas
                </MainH3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                  <div>
                    <div className="text-2xl font-bold text-acento">
                      {reseñas.length}
                    </div>
                    <div className="text-sm text-texto">Total de reseñas</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-acento">
                      {(
                        reseñas.reduce((acc, r) => acc + r.estrellas, 0) /
                        reseñas.length
                      ).toFixed(1)}
                    </div>
                    <div className="text-sm text-texto">
                      Calificación promedio
                    </div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-acento">
                      {new Set(reseñas.map((r) => r.proveedor_id)).size}
                    </div>
                    <div className="text-sm text-texto">
                      Proveedores evaluados
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Botón volver al perfil */}
        <div className="text-center">
          <MainLinkButton to="/cuenta" variant="secondary">
            <IconArrowLeft />
            Volver al perfil
          </MainLinkButton>
        </div>
      </div>

      {/* Modal ver reseña */}
      {reseñaParaVer && (
        <ModalReseña
          reseña={reseñaParaVer}
          onClose={() => setReseñaParaVer(null)}
        />
      )}

      {/* Modal editar reseña */}
      <ModalEditarReseña
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setReseñaEditando(null);
        }}
        reseña={reseñaEditando}
        onSave={handleGuardarReseña}
      />

      {/* Modal eliminar reseña */}
      {reseñaAEliminar && (
        <ModalEliminar
          titulo="Eliminar reseña"
          descripcion="¿Estás seguro que querés eliminar esta reseña? Esta acción no se puede deshacer."
          onConfirmar={confirmarEliminacion}
          onCancelar={() => setReseñaAEliminar(null)}
          loading={eliminando}
        />
      )}
    </section>
  );
};

export default Reseñas;
