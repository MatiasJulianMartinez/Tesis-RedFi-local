import { IconCurrentLocation, IconX } from "@tabler/icons-react";
import MainButton from "../../ui/MainButton";
import { useUbicacionActual } from "../../../hooks/useUbicacionActual";

const UbicacionActual = ({ mapRef, boundsCorrientes }) => {
  const { cargandoUbicacion, marcadorVisible, handleUbicacionActual, eliminarMarcador } = useUbicacionActual(
    boundsCorrientes,
    mapRef
  );

  return (
    <div className="relative">
      <div className="flex gap-2">
        <MainButton
          onClick={handleUbicacionActual}
          title="Ubicación actual"
          icon={IconCurrentLocation}
          type="button"
          variant="accent"
          className="flex-1"
          loading={cargandoUbicacion}
        >
          Mi Ubicación
        </MainButton>
        
        {marcadorVisible && (
          <MainButton
            onClick={eliminarMarcador}
            title="Eliminar marcador de ubicación"
            icon={IconX}
            type="button"
            variant="cross"
            className="px-3"
          />
        )}
      </div>
    </div>
  );
};

export default UbicacionActual;
