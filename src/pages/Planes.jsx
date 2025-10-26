import { useAuth } from "../context/AuthContext";
import { useRole } from "../context/RoleContext";
import { useEffect, useState } from "react";
import { IconCheck, IconReceiptDollar, IconArrowLeft } from "@tabler/icons-react";
import MainH1 from "../components/ui/MainH1";
import MainH2 from "../components/ui/MainH2";
import MainButton from "../components/ui/MainButton";
import MainLinkButton from "../components/ui/MainLinkButton";
import ModalConfirmacionPlan from "../components/modals/plan/ModalConfirmacionPlan";

const beneficiosBasico = [
  { texto: "Acceso al mapa interactivo", disponible: true },
  { texto: "Ver y agregar reseñas", disponible: true },
  { texto: "Acceso a las herramientas", disponible: true },
  { texto: "Acceso completo a la gestión de boletas", disponible: false },
  { texto: "Acceso completo a Red-Fi Academy", disponible: false },
  { texto: "Sin anuncios ni banners promocionales", disponible: false },
  { texto: "Notificaciones básicas", disponible: false },
];

const beneficiosPremium = [
  { texto: "Acceso al mapa interactivo", disponible: true },
  { texto: "Ver y agregar reseñas", disponible: true },
  { texto: "Acceso a las herramientas", disponible: true },
  { texto: "Acceso completo a la gestión de boletas", disponible: true },
  { texto: "Acceso completo a Red-Fi Academy", disponible: true },
  { texto: "Sin anuncios ni banners promocionales", disponible: true },
  { texto: "Notificaciones básicas", disponible: true },
];

const Planes = () => {
  const { usuario } = useAuth();
  const { plan } = useRole();
  const planActual = plan || "basico";

  const [mostrarModal, setMostrarModal] = useState(false);
  const [planDestino, setPlanDestino] = useState("");

  useEffect(() => {
    document.title = "Red-Fi | Planes";
  }, []);

  const abrirModalCambioPlan = (nuevo) => {
    setPlanDestino(nuevo);
    setMostrarModal(true);
  };

  const renderBeneficios = (lista) => (
    <ul className="text-sm text-texto space-y-2 mb-6 text-left">
      {lista.map((b, i) => (
        <li
          key={i}
          className={`flex items-center ${!b.disponible ? "opacity-75" : ""}`}
        >
          <IconCheck
            size={18}
            className={`${b.disponible ? "text-acento" : "text-texto"} mr-2`}
          />
          {b.texto}
        </li>
      ))}
    </ul>
  );

  return (
    <section className="py-16 px-4 sm:px-6 text-texto w-full">
      <div className="max-w-7xl mx-auto space-y-12 mb-8">
        <div className="text-center mb-8">
          <MainH1 icon={IconReceiptDollar}>Elija su plan Red-Fi</MainH1>
          <p className="text-lg">
            Compare los planes y seleccione el que mejor se adapte a sus
            necesidades.
          </p>
        </div>

        <div className="mx-auto max-w-5xl grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Plan Básico */}
          <div className="bg-secundario border border-secundario/50 shadow-lg rounded-lg p-6 flex flex-col justify-between">
            <div>
              <MainH2 className="text-center justify-center">Plan Básico</MainH2>
              <p className="text-texto mb-4">
                Ideal para usuarios que quieren explorar Red-Fi sin funciones
                avanzadas.
              </p>
              {renderBeneficios(beneficiosBasico)}
            </div>
            {usuario && planActual === "basico" ? (
              <MainButton variant="disabled" className="px-6 py-3">
                Este es tu plan actual
              </MainButton>
            ) : (
              <MainButton
                onClick={() => abrirModalCambioPlan("basico")}
                className="px-6 py-3"
              >
                Cambiar a Básico
              </MainButton>
            )}
          </div>

          {/* Plan Premium */}
          <div className="bg-secundario border border-secundario/50 shadow-lg rounded-lg p-6 flex flex-col justify-between">
            <div>
              <MainH2 className="text-acento text-center justify-center">Plan Premium</MainH2>
              <p className="text-texto mb-4">
                Acceda a todos los beneficios de Red-Fi sin límites de uso y sin
                anuncios.
              </p>
              {renderBeneficios(beneficiosPremium)}
            </div>
            {usuario && planActual === "premium" ? (
              <MainButton variant="disabled" className="px-6 py-3">
                Este es tu plan actual
              </MainButton>
            ) : (
              <MainButton
                onClick={() => abrirModalCambioPlan("premium")}
                className="px-6 py-3"
              >
                Cambiar a Premium
              </MainButton>
            )}
          </div>
        </div>
      </div>

      {/* Botón volver al perfil */}
      <div className="text-center">
        <MainLinkButton to="/cuenta" variant="secondary">
          <IconArrowLeft />
          Volver al perfil
        </MainLinkButton>
      </div>

      {mostrarModal && (
        <ModalConfirmacionPlan
          usuarioId={usuario.id}
          nuevoPlan={planDestino}
          onClose={() => setMostrarModal(false)}
        />
      )}
    </section>
  );
};

export default Planes;
