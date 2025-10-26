import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { IconArrowLeft, IconSettings } from "@tabler/icons-react"
import { getPerfil } from "../services/perfil/getPerfil";
import {
  obtenerPerfilesAdmin,
  eliminarPerfilPorId,
} from "../services/perfil/adminPerfil";
import { obtenerProveedoresAdmin } from "../services/proveedores/obtenerProveedor";
import { eliminarProveedor } from "../services/proveedores/crudProveedor";
import {
  obtenerReseñasAdmin,
  actualizarReseñaAdmin,
  eliminarReseñaAdmin,
} from "../services/reseñas/adminReseña";
import {
  obtenerTecnologias,
  eliminarTecnologia,
} from "../services/tecnologiaService";

import {
  obtenerProveedorTecnologia,
  eliminarProveedorTecnologia,
} from "../services/relaciones/proveedorTecnologiaService";
import {
  obtenerProveedorZona,
  eliminarProveedorZona,
} from "../services/relaciones/proveedorZonaService";

import ModalEliminar from "../components/modals/ModalEliminar";

import ModalVerPerfil from "../components/modals/admin/perfiles/ModalVerPerfil";
import ModalEditarPerfil from "../components/modals/admin/perfiles/ModalEditarPerfil";

import ModalAgregarProveedor from "../components/modals/admin/proveedores/ModalAgregarProveedor";
import ModalVerProveedor from "../components/modals/mapa/ModalProveedor";
import ModalEditarProveedor from "../components/modals/admin/proveedores/ModalEditarProveedor";

import ModalVerReseña from "../components/modals/mapa/ModalReseña";
import ModalEditarReseña from "../components/modals/mapa/ModalEditarReseña";

import ModalAgregarTecnologia from "../components/modals/admin/tecnologias/ModalAgregarTecnologia";
import ModalVerTecnologia from "../components/modals/admin/tecnologias/ModalVerTecnologia";
import ModalEditarTecnologia from "../components/modals/admin/tecnologias/ModalEditarTecnologia";

import ModalAgregarProveedorTecnologia from "../components/modals/admin/proveedorTecnologia/ModalAgregarProveedorTecnologia";
import ModalEditarProveedorTecnologia from "../components/modals/admin/proveedorTecnologia/ModalEditarProveedorTecnologia";

import ModalAgregarProveedorZona from "../components/modals/admin/proveedorZona/ModalAgregarProveedorZona";
import ModalEditarProveedorZona from "../components/modals/admin/proveedorZona/ModalEditarProveedorZona";

import Table from "../components/ui/Table";
import MainH1 from "../components/ui/MainH1";
import MainButton from "../components/ui/MainButton";
import MainLinkButton from "../components/ui/MainLinkButton";
import MainLoader from "../components/ui/MainLoader";

import TablaSelector from "../components/admin/TablaSelector";
import { generarColumnas } from "../components/admin/generarColumnas";

import { useAlerta } from "../context/AlertaContext";

const tablasDisponibles = [
  { id: "user_profiles", label: "Perfiles" },
  { id: "proveedores", label: "Proveedores" },
  { id: "reseñas", label: "Reseñas" },
  { id: "tecnologias", label: "Tecnologías" },
  { id: "ProveedorTecnologia", label: "Proveedor y Tecnología" },
  { id: "ZonaProveedor", label: "Proveedor y Zona" },
];

const Administrador = () => {
  const [perfil, setPerfil] = useState(null);
  const [tablaActual, setTablaActual] = useState("user_profiles");
  const [loading, setLoading] = useState(true);
  const { mostrarError, mostrarExito } = useAlerta();
  const navigate = useNavigate();

  const [perfilSeleccionado, setPerfilSeleccionado] = useState(null);
  const [perfilAVer, setPerfilAVer] = useState(null);
  const [perfilAEliminar, setPerfilAEliminar] = useState(null);

  const [proveedorNuevo, setProveedorNuevo] = useState(false);
  const [proveedorSeleccionado, setProveedorSeleccionado] = useState(null);
  const [proveedorAVer, setProveedorAVer] = useState(null);
  const [proveedorAEliminar, setProveedorAEliminar] = useState(null);

  const [reseñaSeleccionada, setReseñaSeleccionada] = useState(null);
  const [reseñaAVer, setReseñaAVer] = useState(null);
  const [reseñaAEliminar, setReseñaAEliminar] = useState(null);

  const [tecnologiaNueva, setTecnologiaNueva] = useState(false);
  const [tecnologiaSeleccionada, setTecnologiaSeleccionada] = useState(null);
  const [tecnologiaAVer, setTecnologiaAVer] = useState(null);
  const [tecnologiaAEliminar, setTecnologiaAEliminar] = useState(null);

  const [proveedorTecnologiaNuevo, setProveedorTecnologiaNuevo] = useState(false);
  const [proveedorTecnologiaSeleccionado, setProveedorTecnologiaSeleccionado] = useState(null);
  const [proveedorTecnologiaAEliminar, setProveedorTecnologiaAEliminar] = useState(null);

  const [proveedorZonaNuevo, setProveedorZonaNuevo] = useState(false);
  const [proveedorZonaSeleccionado, setProveedorZonaSeleccionado] = useState(null);
  const [proveedorZonaAEliminar, setProveedorZonaAEliminar] = useState(null);

  const [eliminando, setEliminando] = useState(false);

  const [todosLosDatos, setTodosLosDatos] = useState({
    user_profiles: [],
    proveedores: [],
    reseñas: [],
    tecnologias: [],
  });

  const acciones = {
    onVer: (row) => {
      if (tablaActual === "user_profiles") {
        setPerfilAVer(row);
      }
      if (tablaActual === "proveedores") {
        setProveedorAVer(row);
      }
      if (tablaActual === "reseñas") {
        setReseñaAVer(row);
      }
      if (tablaActual === "tecnologias") {
        setTecnologiaAVer(row);
      }
      // ...otros casos
    },
    onEditar: (row) => {
      if (tablaActual === "user_profiles") {
        setPerfilSeleccionado(row);
      }
      if (tablaActual === "proveedores") {
        setProveedorSeleccionado(row);
      }
      if (tablaActual === "reseñas") {
        setReseñaSeleccionada(row);
      }
      if (tablaActual === "tecnologias") {
        setTecnologiaSeleccionada(row);
      }
      if (tablaActual === "ProveedorTecnologia") {
        setProveedorTecnologiaSeleccionado(row);
      }
      if (tablaActual === "ZonaProveedor") {
        setProveedorZonaSeleccionado(row);
      }
    },
    onEliminar: (row) => {
      if (tablaActual === "user_profiles") {
        setPerfilAEliminar(row);
      }
      if (tablaActual === "proveedores") {
        setProveedorAEliminar(row);
      }
      if (tablaActual === "reseñas") {
        setReseñaAEliminar(row);
      }
      if (tablaActual === "tecnologias") {
        setTecnologiaAEliminar(row);
      }
      if (tablaActual === "ProveedorTecnologia") {
        setProveedorTecnologiaAEliminar(row);
      }
      if (tablaActual === "ZonaProveedor") {
        setProveedorZonaAEliminar(row);
      }
    },
  };

  const precargarDatos = async () => {
    setLoading(true);
    try {
      const [
        perfiles,
        proveedores,
        reseñas,
        tecnologias,
        proveedorTecnologia,
        zonaProveedor,
      ] = await Promise.all([
        obtenerPerfilesAdmin(),
        obtenerProveedoresAdmin(),
        obtenerReseñasAdmin(),
        obtenerTecnologias(),
        obtenerProveedorTecnologia(),
        obtenerProveedorZona(),
      ]);

      // Agrupar ProveedorTecnologia
      const agrupadoPorProveedorTecnologia = Object.values(
        proveedorTecnologia.reduce((acc, item) => {
          const id = item.proveedor_id;
          if (!acc[id]) {
            acc[id] = {
              id,
              proveedor: item.proveedores?.nombre || "—",
              tecnologias: [],
            };
          }
          const tec = item.tecnologias?.tecnologia;
          if (tec && !acc[id].tecnologias.includes(tec)) {
            acc[id].tecnologias.push(tec);
          }
          return acc;
        }, {})
      );

      // Agrupar ZonaProveedor
      const agrupadoPorZonaProveedor = Object.values(
        zonaProveedor.reduce((acc, item) => {
          const id = item.proveedor_id;
          if (!acc[id]) {
            acc[id] = {
              id,
              proveedor: item.proveedores?.nombre || "—",
              zonas: [],
            };
          }
          const zona = item.zonas?.departamento;
          if (zona && !acc[id].zonas.includes(zona)) {
            acc[id].zonas.push(zona);
          }
          return acc;
        }, {})
      );

      // Setear datos agrupados
      setTodosLosDatos({
        user_profiles: perfiles,
        proveedores,
        reseñas,
        tecnologias,
        ProveedorTecnologia: agrupadoPorProveedorTecnologia,
        ZonaProveedor: agrupadoPorZonaProveedor,
      });
    } catch (error) {
      mostrarError("Error al cargar datos.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const verificarPermisos = async () => {
      try {
        const p = await getPerfil();
        setPerfil(p);
        if (p.rol !== "admin") {
          navigate("/cuenta", {
            state: {
              alerta: {
                tipo: "error",
                mensaje: "No tienes permisos para acceder a esta vista.",
              },
            },
          });
        } else {
          await precargarDatos();
        }
      } catch (error) {
        mostrarError("Error al cargar perfil de usuario.");
        setLoading(false);
      }
    };

    verificarPermisos();
  }, [navigate]);

  if (!perfil || perfil.rol !== "admin") return;

  const datosActuales = todosLosDatos[tablaActual] || [];
  const columnas = generarColumnas(tablaActual, datosActuales, acciones);

  return (
    <section className="self-start py-16 px-4 sm:px-6 text-texto w-full">
      <div className="max-w-7xl mx-auto space-y-12">
        <div className="text-center mb-8">
          <MainH1 icon={IconSettings}>Panel de Administración</MainH1>
          <p className="text-lg">
            Visualizá los datos de todas las tablas del sistema.
          </p>
        </div>

        {loading ? (
          <MainLoader texto="Cargando datos del sistema..." size="large" />
        ) : (
          <>
            <TablaSelector
              tablas={tablasDisponibles}
              tablaActual={tablaActual}
              setTablaActual={setTablaActual}
            />

            <div className="flex justify-center mb-4">{tablaActual === "proveedores" && (
            <MainButton onClick={() => setProveedorNuevo(true)} variant="add">
              Agregar Proveedor
            </MainButton>
          )}
          {tablaActual === "tecnologias" && (
            <MainButton onClick={() => setTecnologiaNueva(true)} variant="add">
              Agregar Tecnología
            </MainButton>
          )}
          {tablaActual === "ProveedorTecnologia" && (
            <MainButton
              onClick={() => setProveedorTecnologiaNuevo(true)}
              variant="add"
            >
              Asignar Tecnologías
            </MainButton>
          )}
          {tablaActual === "ZonaProveedor" && (
            <MainButton onClick={() => setProveedorZonaNuevo(true)} variant="add">
              Asignar Zonas
            </MainButton>
          )}

        </div>

            <Table columns={columnas} data={datosActuales} />

            <div className="text-center mt-6">
              <MainLinkButton to="/" variant="secondary">
                <IconArrowLeft />
                Volver al inicio
              </MainLinkButton>
            </div>
          </>
        )}

        {/* === MODALES === */}

        {/* Perfiles */}
        {/* Ver */}
        {tablaActual === "user_profiles" && perfilAVer && (
          <ModalVerPerfil
            perfil={perfilAVer}
            onClose={() => setPerfilAVer(null)}
          />
        )}
        {/* Editar */}
        {tablaActual === "user_profiles" && perfilSeleccionado && (
          <ModalEditarPerfil
            perfil={perfilSeleccionado}
            onClose={() => setPerfilSeleccionado(null)}
            onActualizar={precargarDatos}
          />
        )}
        {/* Eliminar */}
        {tablaActual === "user_profiles" && perfilAEliminar && (
          <ModalEliminar
            titulo="¿Eliminar perfil?"
            descripcion={`¿Estás seguro de que querés eliminar el perfil "${perfilAEliminar.nombre}"?`}
            loading={eliminando}
            onCancelar={() => setPerfilAEliminar(null)}
            onConfirmar={async () => {
              setEliminando(true);
              try {
                await eliminarPerfilPorId(perfilAEliminar.id, mostrarError);
                mostrarExito("Perfil eliminado con éxito.");
                setPerfilAEliminar(null);
                precargarDatos();
              } catch (error) {
                mostrarError("Error al eliminar perfil: " + error.message);
              } finally {
                setEliminando(false);
              }
            }}
          />
        )}
        {/* Proveedores */}
        {/* Agregar */}
        {tablaActual === "proveedores" && proveedorNuevo && (
          <ModalAgregarProveedor
            onClose={() => setProveedorNuevo(false)}
            onActualizar={async () => {
              setProveedorNuevo(false);
              await precargarDatos();
            }}
          />
        )}

        {/* Ver */}
        {tablaActual === "proveedores" && proveedorAVer && (
          <ModalVerProveedor
            proveedor={proveedorAVer}
            onClose={() => setProveedorAVer(null)}
          />
        )}
        {/* Editar */}
        {tablaActual === "proveedores" && proveedorSeleccionado && (
          <ModalEditarProveedor
            proveedor={proveedorSeleccionado}
            onClose={() => setProveedorSeleccionado(null)}
            onActualizar={precargarDatos}
          />
        )}
        {/* Eliminar */}
        {tablaActual === "proveedores" && proveedorAEliminar && (
          <ModalEliminar
            titulo="¿Eliminar proveedor?"
            descripcion={`¿Estás seguro de que querés eliminar el proveedor "${proveedorAEliminar.nombre}"?`}
            loading={eliminando}
            onCancelar={() => setProveedorAEliminar(null)}
            onConfirmar={async () => {
              setEliminando(true);
              try {
                await eliminarProveedor(proveedorAEliminar.id, mostrarError);
                mostrarExito("Proveedor eliminado correctamente");
                setProveedorAEliminar(null);
                await precargarDatos();
              } catch (e) {
                mostrarError("Error al eliminar proveedor: " + e.message);
              } finally {
                setEliminando(false);
              }
            }}
          />
        )}

        {/* Reseñas */}
        {/* Ver */}
        {tablaActual === "reseñas" && reseñaAVer && (
          <ModalVerReseña
            reseña={reseñaAVer}
            onClose={() => setReseñaAVer(null)}
          />
        )}
        {/* Editar */}
        {tablaActual === "reseñas" && reseñaSeleccionada && (
          <ModalEditarReseña
            isOpen={!!reseñaSeleccionada}
            reseña={reseñaSeleccionada}
            onClose={() => setReseñaSeleccionada(null)}
            onSave={async (datosActualizados) => {
              try {
                await actualizarReseñaAdmin(
                  reseñaSeleccionada.id,
                  datosActualizados,
                  mostrarError
                );
                mostrarExito("Reseña actualizada correctamente");
                await precargarDatos();
                setReseñaSeleccionada(null);
              } catch (e) {
                mostrarError("Error al actualizar reseña: " + e.message);
              }
            }}
          />
        )}
        {/* Eliminar */}
        {tablaActual === "reseñas" && reseñaAEliminar && (
          <ModalEliminar
            titulo="¿Eliminar reseña?"
            descripcion="¿Estás seguro de que querés eliminar esta reseña?"
            loading={eliminando}
            onCancelar={() => setReseñaAEliminar(null)}
            onConfirmar={async () => {
              setEliminando(true);
              try {
                await eliminarReseñaAdmin(reseñaAEliminar.id, mostrarError);
                mostrarExito("Reseña eliminada correctamente");
                setReseñaAEliminar(null);
                await precargarDatos();
              } catch (e) {
                mostrarError("Error al eliminar reseña: " + e.message);
              } finally {
                setEliminando(false);
              }
            }}
          />
        )}

        {/* Tecnologías */}
        {/* Agregar */}
        {tablaActual === "tecnologias" && tecnologiaNueva && (
          <ModalAgregarTecnologia
            onClose={() => setTecnologiaNueva(false)}
            onActualizar={precargarDatos}
          />
        )}

        {/* Ver */}
        {tablaActual === "tecnologias" && tecnologiaAVer && (
          <ModalVerTecnologia
            tecnologia={tecnologiaAVer}
            onClose={() => setTecnologiaAVer(null)}
          />
        )}
        {/* Editar */}
        {tablaActual === "tecnologias" && tecnologiaSeleccionada && (
          <ModalEditarTecnologia
            tecnologia={tecnologiaSeleccionada}
            onClose={() => setTecnologiaSeleccionada(null)}
            onActualizar={precargarDatos}
          />
        )}
        {/* Eliminar */}
        {tablaActual === "tecnologias" && tecnologiaAEliminar && (
          <ModalEliminar
            titulo="¿Eliminar tecnología?"
            descripcion={`¿Estás seguro de que querés eliminar la tecnología "${tecnologiaAEliminar.tecnologia}"?`}
            loading={eliminando}
            onCancelar={() => setTecnologiaAEliminar(null)}
            onConfirmar={async () => {
              setEliminando(true);
              try {
                await eliminarTecnologia(tecnologiaAEliminar.id, mostrarError);
                setTecnologiaAEliminar(null);
                mostrarExito("Tecnología eliminada con éxito.");
                await precargarDatos();
              } catch (e) {
                console.error("Error al eliminar tecnología: " + e.message);
              } finally {
                setEliminando(false);
              }
            }}
          />
        )}
        {/* Proveedor y Tecnología */}
        {/* Agregar */}
        {tablaActual === "ProveedorTecnologia" && proveedorTecnologiaNuevo && (
          <ModalAgregarProveedorTecnologia
            onClose={() => setProveedorTecnologiaNuevo(false)}
            onActualizar={async () => {
              setProveedorTecnologiaNuevo(false);
              await precargarDatos();
            }}
          />
        )}
        {/* Editar */}
        {tablaActual === "ProveedorTecnologia" &&
          proveedorTecnologiaSeleccionado && (
            <ModalEditarProveedorTecnologia
              proveedor={proveedorTecnologiaSeleccionado}
              onClose={() => setProveedorTecnologiaSeleccionado(null)}
              onActualizar={precargarDatos}
            />
          )}
        {/* Eliminar */}
        {tablaActual === "ProveedorTecnologia" &&
          proveedorTecnologiaAEliminar && (
            <ModalEliminar
              titulo="¿Eliminar relación proveedor-tecnología?"
              descripcion={`¿Estás seguro de que querés eliminar todas las tecnologías del proveedor "${proveedorTecnologiaAEliminar.proveedor}"?`}
              loading={eliminando}
              onCancelar={() => setProveedorTecnologiaAEliminar(null)}
              onConfirmar={async () => {
                setEliminando(true);
                try {
                  await eliminarProveedorTecnologia(
                    proveedorTecnologiaAEliminar.id,
                    mostrarError
                  );
                  mostrarExito("Relación proveedor-tecnología eliminada.");
                  setProveedorTecnologiaAEliminar(null);
                  await precargarDatos();
                } catch (e) {
                  mostrarError("Error al eliminar relación: " + e.message);
                } finally {
                  setEliminando(false);
                }
              }}
            />
          )}
        {/* Proveedor y Zona */}
        {/* Agregar */}
        {tablaActual === "ZonaProveedor" && proveedorZonaNuevo && (
          <ModalAgregarProveedorZona
            onClose={() => setProveedorZonaNuevo(false)}
            onActualizar={async () => {
              setProveedorZonaNuevo(false);
              await precargarDatos();
            }}
          />
        )}

        {/* Editar */}
        {tablaActual === "ZonaProveedor" && proveedorZonaSeleccionado && (
          <ModalEditarProveedorZona
            proveedor={proveedorZonaSeleccionado}
            onClose={() => setProveedorZonaSeleccionado(null)}
            onActualizar={precargarDatos}
          />
        )}
        {/* Eliminar */}
        {tablaActual === "ZonaProveedor" && proveedorZonaAEliminar && (
          <ModalEliminar
            titulo="¿Eliminar relación proveedor-zona?"
            descripcion={`¿Estás seguro de que querés eliminar todas las zonas del proveedor "${proveedorZonaAEliminar.proveedor}"?`}
            loading={eliminando}
            onCancelar={() => setProveedorZonaAEliminar(null)}
            onConfirmar={async () => {
              setEliminando(true);
              try {
                await eliminarProveedorZona(
                  proveedorZonaAEliminar.id,
                  mostrarError
                );
                mostrarExito("Relación proveedor-zona eliminada.");
                setProveedorZonaAEliminar(null);
                await precargarDatos();
              } catch (e) {
                mostrarError("Error al eliminar relación: " + e.message);
              } finally {
                setEliminando(false);
              }
            }}
          />
        )}
      </div>
    </section>
  );
};

export default Administrador;
