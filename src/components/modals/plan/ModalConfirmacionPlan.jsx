import { useState } from "react";
import MainButton from "../../ui/MainButton";
import MainH2 from "../../ui/MainH2";
import ModalContenedor from "../../ui/ModalContenedor";
import { actualizarPlanUsuario } from "../../../services/perfil/adminPerfil";
import { useAlerta } from "../../../context/AlertaContext";
import { useRole } from "../../../context/RoleContext";
import { IconX, IconStar, IconAlertTriangle } from "@tabler/icons-react";

const ModalConfirmacionPlan = ({ usuarioId, nuevoPlan, onClose }) => {
  const [cargando, setCargando] = useState(false);
  const { mostrarExito, mostrarError } = useAlerta();
  const { setPlan } = useRole();

  const mensajes = {
    premium: {
      titulo: "\u00a1Gracias por pasarte al plan Premium!",
      descripcion:
        "Ahora tenés acceso completo a Red-Fi Academy, herramientas avanzadas y mucho más.",
      icono: <IconStar size={64} className="text-green-700 mx-auto mb-4" />,
    },
    basico: {
      titulo: "Volveras al plan Básico",
      descripcion:
        "Algunas funcionalidades premium ya no estarán disponibles. Podés volver a cambiar de plan cuando quieras.",
      icono: (
        <IconAlertTriangle size={64} className="text-yellow-600 mx-auto mb-4" />
      ),
    },
  };

  const handleConfirmar = async () => {
    setCargando(true);
    try {
      await actualizarPlanUsuario(usuarioId, nuevoPlan);
      setPlan(nuevoPlan);
      mostrarExito(
        nuevoPlan === "premium"
          ? "Tu plan fue actualizado a Premium."
          : "Tu plan fue actualizado a Básico."
      );
      onClose();
    } catch (error) {
      console.error("Error al cambiar de plan:", error);
      mostrarError("No se pudo actualizar el plan. Intentalo de nuevo.");
    } finally {
      setCargando(false);
    }
  };

  const { titulo, descripcion, icono } = mensajes[nuevoPlan];

  return (
    <ModalContenedor onClose={onClose}>
      {/* Encabezado */}
      <div className="flex justify-between mb-6">
        <MainH2 className="mb-0">{titulo}</MainH2>
        <MainButton
          onClick={onClose}
          type="button"
          variant="cross"
          title="Cerrar modal"
          className="px-0"
        >
          <IconX size={24} />
        </MainButton>
      </div>

      {/* Icono y Contenido */}
      {icono}
      <p className="text-white-700 mb-6 text-center">{descripcion}</p>

      {/* Acciones */}
      <div className="flex justify-center gap-4 pt-2">
        <MainButton
          type="button"
          variant="secondary"
          onClick={onClose}
          disabled={cargando}
        >
          Cancelar
        </MainButton>

        <MainButton
          type="button"
          variant="primary"
          onClick={handleConfirmar}
          loading={cargando}
          disabled={cargando}
        >
          Confirmar
        </MainButton>
        
      </div>
    </ModalContenedor>
  );
};

export default ModalConfirmacionPlan;