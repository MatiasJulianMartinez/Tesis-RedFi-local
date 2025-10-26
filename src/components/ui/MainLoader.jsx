import classNames from "classnames";
import { useEffect, useState } from "react";
import { IconLoader2 } from "@tabler/icons-react";

const MainLoader = ({ 
  texto = "", 
  className = "", 
  size = "medium", 
  variant = "inline",
  visible = true 
}) => {
  // Estado interno para controlar visibilidad con animaciones
  const [isVisible, setIsVisible] = useState(visible);

  // Maneja la transición de visibilidad con delay para animaciones
  useEffect(() => {
    if (visible) {
      setIsVisible(true);
    } else {
      // Delay para permitir animación de salida antes de desmontar
      const timeout = setTimeout(() => {
        setIsVisible(false);
      }, 200);
      return () => clearTimeout(timeout);
    }
  }, [visible]);

  // Configuración de tamaños para icono y texto
  const sizeConfig = {
    small: { icon: 20, text: "text-sm" },
    medium: { icon: 24, text: "text-base" },
    large: { icon: 42, text: "text-lg sm:text-xl font-bold" }
  };

  // Obtiene la configuración del tamaño actual con fallback a medium
  const currentSize = sizeConfig[size] || sizeConfig.medium;

  // Renderizado para variante overlay (pantalla completa con backdrop)
  if (variant === "overlay") {
    if (!isVisible) return null;

    return (
      <div
        className={classNames(
          "fixed inset-0 z-45 flex items-center justify-center transition-opacity duration-300",
          visible ? "opacity-75 pointer-events-auto" : "opacity-0 pointer-events-none",
          className
        )}
        style={{
          backgroundColor: "rgba(0, 0, 0, 0.6)", // Fondo semitransparente
          backdropFilter: "blur(4px)", // Efecto de desenfoque
        }}
      >
        <div className="flex flex-col items-center gap-3 text-texto">
          <IconLoader2 size={currentSize.icon} className="animate-spin text-texto" />
          {/* Texto opcional con estilos dinámicos */}
          {texto && (
            <p className={classNames(currentSize.text, "tracking-wide")}>
              {texto}
            </p>
          )}
        </div>
      </div>
    );
  }

  // Variante inline (por defecto) - se integra en el flujo del documento
  return (
    <div className={classNames("flex flex-col items-center justify-center gap-3 text-texto", className)}>
      {/* Spinner animado con tamaño dinámico */}
      <IconLoader2 size={currentSize.icon} className="animate-spin" />
      {/* Texto opcional con estilos según tamaño */}
      {texto && (
        <span className={classNames(currentSize.text, "font-medium")}>
          {texto}
        </span>
      )}
    </div>
  );
};

export default MainLoader;
