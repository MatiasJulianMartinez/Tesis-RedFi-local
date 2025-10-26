import classNames from "classnames";
import { IconLoader2 } from "@tabler/icons-react";

const Input = ({
  label,
  name,
  type = "text",
  value,
  onChange,
  placeholder = "",
  required = false,
  disabled = false,
  loading = false,
  icon: Icon,
  endIconAction = null,
  className = "",
  isInvalid = false,
  onKeyDown,
  maxLength = null,
  min,
  max,

}) => {
  return (
    <div className="space-y-1 relative">
      {/* Label opcional del input */}
      {label && (
        <label htmlFor={name} className="block text-texto mb-1">
          {label}
        </label>
      )}

      <div className="relative">
        {/* Icono izquierdo opcional */}
        {Icon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Icon size={20} className="text-texto/40" />
          </div>
        )}

        {/* Renderizado específico para input de color */}
        {type === "color" ? (
          <input
            id={name}
            name={name}
            type="color"
            value={loading ? "#000000" : value ?? "#000000"}
            onChange={onChange}
            disabled={disabled || loading}
            required={required}
            className={classNames(
              "w-14 h-14 rounded-lg border transition p-0 cursor-pointer",
              (disabled || loading) && "cursor-not-allowed opacity-70",
              isInvalid ? "border-red-500" : "border-texto/15",
              className
            )}
          />
        ) : (
          /* Input estándar para todos los demás tipos */
          <input
            id={name}
            name={name}
            type={type}
            value={loading ? "" : value ?? ""}
            onChange={(e) => {
              // Validación de longitud para inputs numéricos
              if (type === "number" && maxLength && e.target.value.length > maxLength) {
                e.target.value = e.target.value.slice(0, maxLength);
              }
              onChange(e);
            }}
            onKeyDown={(e) => {
              if (onKeyDown) onKeyDown(e);
              // Previene caracteres no válidos en inputs numéricos
              if (type === "number" && ["e", "E", "+", "-"].includes(e.key)) {
                e.preventDefault();
              }
            }}
            min={min}
            max={max}
            placeholder={loading ? "Cargando..." : placeholder}
            required={required}
            disabled={disabled || loading}
            className={classNames(
              "w-full bg-texto/5 text-texto rounded-lg border transition",
              "focus:outline-none focus:ring-1",
              Icon ? "pl-10" : "pl-3", // Padding izquierdo según icono
              loading || isInvalid || endIconAction ? "pr-10" : "pr-3", // Padding derecho según estado
              "py-2",
              (disabled || loading) && "cursor-not-allowed opacity-70",
              isInvalid
                ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                : "border-texto/15 focus:border-acento focus:ring-acento",
              className
            )}
          />
        )}

        {/* Área de iconos/acciones del lado derecho */}
        <div className="absolute inset-y-0 right-3 flex items-center">
          {loading ? (
            /* Spinner de carga */
            <IconLoader2 size={20} className="animate-spin text-texto/60" />
          ) : isInvalid ? null : endIconAction ? (
            /* Botón de acción personalizable */
            <button
              type="button"
              onClick={endIconAction.onClick}
              title={endIconAction.label || "Acción"}
              aria-label={endIconAction.label || "Acción del ícono"}
              tabIndex={0}
              className="text-texto/60 hover:text-texto transition focus:outline-none"
            >
              {endIconAction.icon}
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default Input;
