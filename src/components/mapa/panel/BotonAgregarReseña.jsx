import { useAlerta } from "../../../context/AlertaContext";
import MainButton from "../../ui/MainButton";
import { IconPlus } from "@tabler/icons-react";

const BotonAgregarReseña = ({ usuario, onAbrirModalReseña }) => {
  const { mostrarError } = useAlerta();

  const handleClick = () => {
    if (!usuario) {
      mostrarError("Debes iniciar sesión para agregar una reseña");
      return;
    }
    
    onAbrirModalReseña();
  };

  return (
    <div className="flex flex-col items-center gap-2">
      <MainButton
        onClick={handleClick}
        disabled={!usuario}
        variant={usuario ? "add" : "disabled"}
        className="w-full"
        icon={IconPlus}
        title={
          usuario
            ? "Agregar reseña"
            : "Debes iniciar sesión para agregar una reseña"
        }
      >
        Agregar reseña
      </MainButton>
      {!usuario && (
        <p className="text-sm text-texto/60 italic animate-fade-in">
          Necesitas iniciar sesión para acceder a esta función.
        </p>
      )}
    </div>
  );
};

export default BotonAgregarReseña;
