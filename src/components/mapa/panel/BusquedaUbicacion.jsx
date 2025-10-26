import { useState, useEffect, useRef } from "react";
import { IconX, IconSearch } from "@tabler/icons-react";
import { useBusquedaUbicacion } from "../../../hooks/useBusquedaUbicacion";
import { useAlerta } from "../../../context/AlertaContext";
import Input from "../../ui/Input";
import MainButton from "../../ui/MainButton";

const BusquedaUbicacion = ({ boundsCorrientes, mapRef }) => {
  const {
    input,
    sugerencias,
    handleInputChange,
    handleBuscar,
    handleSeleccionarSugerencia,
    handleLimpiarBusqueda,
    setSugerencias,
  } = useBusquedaUbicacion(boundsCorrientes, mapRef);

  const { mostrarError } = useAlerta();

  const [inputInvalido, setInputInvalido] = useState(false);
  const contenedorRef = useRef();

  useEffect(() => {
    const manejarClickAfuera = (e) => {
      if (contenedorRef.current && !contenedorRef.current.contains(e.target)) {
        setSugerencias([]);
      }
    };
    document.addEventListener("mousedown", manejarClickAfuera);
    return () => document.removeEventListener("mousedown", manejarClickAfuera);
  }, []);

  const handleBuscarClick = () => {
    if (!input.trim()) {
      mostrarError("Por favor ingresá una ubicación.");
      setInputInvalido(true);
      return;
    }
    setInputInvalido(false);
    handleBuscar();
  };

  return (
    <div className="space-y-4 relative">
      <div className="flex gap-2 relative" ref={contenedorRef}>
        <div className="relative flex-1">
          <Input
            label="Buscar ubicación"
            name="busqueda"
            value={input}
            onChange={(e) => {
              handleInputChange(e.target.value);
              if (inputInvalido) setInputInvalido(false);
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleBuscarClick();
            }}
            placeholder="Buscar en Corrientes..."
            isInvalid={inputInvalido}
            endIconAction={
              input
                ? {
                    icon: (
                      <IconX
                        size={18}
                        className="text-texto/60 hover:text-red-400 font-bold transition focus:outline-none duration-300"
                      />
                    ),
                    onClick: handleLimpiarBusqueda,
                    label: "Limpiar campo de búsqueda",
                  }
                : null
            }
          />

          {/* Sugerencias flotantes */}
          {input && sugerencias.length > 0 && (
            <ul className="absolute z-10 left-0 right-0 bg-fondo border border-texto/15 rounded-lg mt-1 max-h-40 overflow-auto text-texto shadow-lg">
              {sugerencias.map((sug, index) => (
                <li
                  key={index}
                  onClick={() => handleSeleccionarSugerencia(sug)}
                  className="px-3 py-2 cursor-pointer hover:bg-texto/20 transition"
                >
                  {sug.formatted}
                </li>
              ))}
            </ul>
          )}
        </div>

        <MainButton
          onClick={handleBuscarClick}
          title="Buscar ubicación"
          type="button"
          variant="primary"
          className="self-end py-2.25"
          icon={IconSearch}
          iconAlwaysVisible={true}
        />
      </div>
    </div>
  );
};

export default BusquedaUbicacion;
