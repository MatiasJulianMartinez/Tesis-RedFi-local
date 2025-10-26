import { useEffect, useState } from "react";
import { obtenerBoletasDelUsuario } from "../services/boletas/crud";
import BoletaHistorial from "../components/boletas/BoletaHistorial";
import ModalAgregarBoleta from "../components/modals/boletas/ModalAgregarBoleta";
import { useNotificaciones } from "../components/layout/Navbar";
import MainButton from "../components/ui/MainButton";
import MainLinkButton from "../components/ui/MainLinkButton";
import MainH1 from "../components/ui/MainH1";
import { useAlerta } from "../context/AlertaContext";
import { IconArrowLeft, IconReceipt2 } from "@tabler/icons-react";

const Boletas = () => {
  useEffect(() => {
    document.title = "Red-Fi | Boletas";
  }, []);

  const [boletas, setBoletas] = useState([]);
  const [modalAgregarAbierto, setModalAgregarAbierto] = useState(false);
  const [loading, setLoading] = useState(true);
  const { cargarNotificaciones } = useNotificaciones();
  const { mostrarError } = useAlerta();

  const cargarBoletas = async () => {
    setLoading(true);
    try {
      const data = await obtenerBoletasDelUsuario();
      setBoletas(data);
    } catch (error) {
      mostrarError("Error al cargar las boletas.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarBoletas();
  }, []);

  return (
    <section className="self-start py-16 px-4 sm:px-6 text-texto w-full">
      <div className="max-w-7xl mx-auto space-y-12">
        <div className="text-center mb-8">
          <MainH1 icon={IconReceipt2}>Gestión de Boletas</MainH1>
          <p className="text-lg">
            Administrá tus boletas de servicios de internet.
          </p>
        </div>

        <div className="flex justify-center mb-4">
          <MainButton
            onClick={() => setModalAgregarAbierto(true)}
            variant="add"
          >
            Agregar Boleta
          </MainButton>
        </div>

        <BoletaHistorial
          boletas={boletas}
          recargarBoletas={cargarBoletas}
          loading={loading}
        />

        {/* Botón volver al perfil */}
        <div className="text-center">
          <MainLinkButton to="/cuenta" variant="secondary">
            <IconArrowLeft />
            Volver al perfil
          </MainLinkButton>
        </div>

        {/* Modal Agregar Boleta */}
        {modalAgregarAbierto && (
          <ModalAgregarBoleta
            onClose={() => setModalAgregarAbierto(false)}
            onBoletaAgregada={cargarBoletas}
            onActualizarNotificaciones={cargarNotificaciones}
          />
        )}
      </div>
    </section>
  );
};

export default Boletas;
