import React from "react";
import classNames from "classnames";
import {
  IconLoader2,
  IconPlus,
  IconEye,
  IconEdit,
  IconTrash,
} from "@tabler/icons-react";
import { useTheme } from "../../context/ThemeContext";

const Button = ({
  children,
  onClick,
  type = "button",
  variant = "primary",
  disabled = false,
  loading = false,
  active = false,
  icon: Icon = null,
  iconSize = 24,
  className = "",
  as = "button",
  iconAlwaysVisible = false,
  ...props
}) => {
  const Tag = as;

  // Detecta si se pasaron clases de padding personalizadas para evitar duplicados
  const hasPx = /\bpx-\d+\b/.test(className);
  const hasPy = /\bpy-\d+\b/.test(className);
  const hasP = /\bp-\d+\b/.test(className);

  // Aplica padding por defecto solo si no se especificó uno personalizado
  const defaultPx = !hasPx && !hasP ? "px-4" : "";
  const defaultPy = !hasPy && !hasP ? "py-2" : "";

  // Estilos base comunes a todas las variantes
  const baseStyles = classNames(
    "inline-flex items-center justify-center gap-2 rounded-lg font-bold transition focus:outline-none duration-300",
    defaultPx,
    defaultPy
  );

  const { currentTheme } = useTheme();

  // Configuración de estilos para cada variante del botón
  const variants = {
    primary: "bg-primario text-white hover:bg-[#336ef0]",
    accent: "bg-acento text-white hover:bg-[#fca75f]",
    secondary:
      currentTheme === "light"
        ? "bg-texto/5 text-texto hover:bg-[#d2e4ff]"
        : "bg-texto/5 text-texto hover:bg-[#2a3955]",
    danger: "bg-red-600 text-white hover:bg-red-400",
    disabled: "bg-gray-400 text-gray-700 cursor-not-allowed",
    cross: "text-texto/60 hover:text-red-400",
    add: "bg-green-700 text-white hover:bg-green-500",
    see: "bg-blue-600 text-white hover:bg-blue-400",
    edit: "bg-yellow-600 text-white hover:bg-yellow-400",
    delete: "bg-red-600 text-white hover:bg-red-400",
    toggle: active
      ? "bg-primario text-white hover:bg-[#336ef0]"
      : currentTheme === "light"
      ? "bg-secundario text-texto hover:bg-[#d2e4ff]"
      : "bg-secundario text-texto hover:bg-[#2a3955]",
    navbar: "bg-transparent text-texto hover:bg-white/10",
  };

  // Estilos específicos para estado de carga
  const loadingStyles = "bg-gray-400 text-gray-700 cursor-not-allowed";

  // Mapeo de iconos automáticos según la variante del botón
  const autoIcon =
    !Icon &&
    {
      add: IconPlus,
      see: IconEye,
      edit: IconEdit,
      delete: IconTrash,
    }[variant];

  // Combina todos los estilos según el estado del botón
  const finalClass = classNames(
    baseStyles,
    loading ? loadingStyles : variants[variant],
    {
      "opacity-50 pointer-events-none": disabled || loading,
    },
    className
  );

  return (
    <Tag
      type={Tag === "button" ? type : undefined}
      onClick={onClick}
      className={finalClass}
      disabled={Tag === "button" ? disabled || loading : undefined}
      {...props}
    >
      {/* Renderizado condicional del icono según el estado */}
      {loading ? (
        /* Spinner de carga animado */
        <IconLoader2
          size={iconSize}
          className={classNames("animate-spin", {
            "sm:inline hidden": !iconAlwaysVisible, // Oculta en móvil si no es siempre visible
          })}
        />
      ) : (
        /* Icono personalizado o automático según variante */
        (Icon || autoIcon) &&
        React.createElement(Icon || autoIcon, {
          size: iconSize,
          className: classNames({
            "sm:inline hidden": !iconAlwaysVisible, // Comportamiento responsivo del icono
          }),
        })
      )}
      {/* Contenido del botón (texto, elementos hijos) */}
      {children}
    </Tag>
  );
};

export default Button;
