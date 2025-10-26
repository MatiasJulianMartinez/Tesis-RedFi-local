import { IconHandFinger, IconX } from "@tabler/icons-react";
import MainButton from "../../ui/MainButton";

const IndicadorSeleccion = ({ onCancelar }) => {
  return (
    <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-30 bg-primario text-texto px-4 py-3 rounded-lg shadow-lg border border-primario/20">
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <IconHandFinger size={20} className="animate-pulse" />
          <span className="font-medium text-sm">
            Haz clic en el mapa para seleccionar ubicación
          </span>
        </div>
        <MainButton
          type="button"
          onClick={onCancelar}
          variant="cross"
          className="px-2 py-1"
          title="Cancelar selección"
        >
          <IconX size={16} />
        </MainButton>
      </div>
      <div className="mt-2 text-xs text-texto/80">
        La ubicación debe estar dentro de una zona con cobertura de internet
      </div>
    </div>
  );
};

export default IndicadorSeleccion; 