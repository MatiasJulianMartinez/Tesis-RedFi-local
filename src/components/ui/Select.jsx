import classNames from "classnames";
import { IconLoader2, IconChevronDown } from "@tabler/icons-react";

const Select = ({
  label,
  value,
  multiple = false,
  onChange,
  options = [],
  getOptionValue = (opt) => opt,
  getOptionLabel = (opt) => opt,
  renderOption,
  className = "",
  disabled = false,
  loading = false,
  name,
  required = false,
  isInvalid = false,
}) => {
  return (
    <div className="space-y-1 relative">
      {/* Renderiza la etiqueta si se proporciona */}
      {label && (
        <label htmlFor={name} className="block text-texto mb-1">
          {label}
        </label>
      )}

      <div className="relative">
        {/* Campo select principal con estilos personalizados */}
        <select
          id={name}
          name={name}
          multiple={multiple}
          value={value}
          onChange={(e) => {
            // Maneja la selección múltiple convirtiendo HTMLCollection a array
            if (multiple) {
              const values = Array.from(
                e.target.selectedOptions,
                (opt) => opt.value
              );
              onChange(values);
            } else {
              // Para selección simple, pasa directamente el valor
              onChange(e.target.value);
            }
          }}
          disabled={disabled || loading}
          required={required}
          className={classNames(
            // Estilos base para todos los selects
            "w-full px-3 py-2 bg-texto/5 text-texto rounded-lg border transition",
            // Estilos específicos para selección múltiple vs simple
            multiple
              ? "h-40 overflow-y-auto" // Select múltiple: altura fija con scroll
              : "appearance-none pr-10 max-w-full truncate", // Select simple: oculta flecha nativa
            "focus:outline-none focus:ring-1",
            // Estados deshabilitado/cargando
            (disabled || loading) && "cursor-not-allowed opacity-70",
            // Estados de validación (válido/inválido)
            isInvalid
              ? "border-red-500 focus:border-red-500 focus:ring-red-500"
              : "border-texto/15 focus:border-acento focus:ring-1 focus:ring-acento",
            className
          )}
        >
          {/* Muestra estado de carga o renderiza las opciones */}
          {loading ? (
            <option>Cargando...</option>
          ) : (
            options.map((opt, i) =>
              // Permite renderizado personalizado de opciones o usa el renderizado por defecto
              renderOption ? (
                renderOption(opt)
              ) : (
                <option key={i} value={getOptionValue(opt)}>
                  {getOptionLabel(opt)}
                </option>
              )
            )
          )}
        </select>

        {/* Icono indicador solo para selección simple (no múltiple) */}
        {!multiple && (
          <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
            {/* Muestra spinner durante carga o flecha de dropdown normal */}
            {loading ? (
              <IconLoader2 size={20} className="animate-spin text-texto/60" />
            ) : (
              <IconChevronDown size={20} className="text-texto/60" />
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Select;