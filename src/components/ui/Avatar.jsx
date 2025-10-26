import { useState } from "react";
import { IconLoader2 } from "@tabler/icons-react";
import classNames from "classnames";

const Avatar = ({ fotoUrl, nombre = "Usuario", size = 20, className = "" }) => {
  // Estado para controlar si la imagen se cargó correctamente
  const [loaded, setLoaded] = useState(false);

  // Genera iniciales del nombre (máximo 2 caracteres)
  const initials = nombre
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  // Calcula dimensiones dinámicas basadas en el prop size
  const dimension = size * 4;
  const dynamicFontSize = `${size * 1.2}px`;

  return (
    <div
      className={classNames(
        "rounded-full border-2 border-acento shadow-md overflow-hidden flex items-center justify-center bg-texto/5 text-texto font-bold",
        className
      )}
      style={{
        width: `${dimension}px`,
        height: `${dimension}px`,
        fontSize: dynamicFontSize,
      }}
    >
      {fotoUrl ? (
        <>
          {/* Indicador de carga mientras se carga la imagen */}
          {!loaded && (
            <IconLoader2
              className="animate-spin text-texto"
              size={size * 2}
            />
          )}
          {/* Imagen del avatar con loading state */}
          <img
            src={fotoUrl}
            alt="Avatar"
            onLoad={() => setLoaded(true)}
            className={classNames(
              "w-full h-full object-cover rounded-full",
              !loaded && "hidden" // Oculta hasta que cargue
            )}
          />
        </>
      ) : (
        /* Fallback: muestra iniciales si no hay foto */
        <span>{initials}</span>
      )}
    </div>
  );
};

export default Avatar;
