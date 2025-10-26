import classNames from "classnames";

const Textarea = ({
  label,
  name,
  value,
  onChange,
  placeholder = "",
  required = false,
  disabled = false,
  rows = 3,
  className = "",
  isInvalid = false,
  onKeyDown,
}) => {
  return (
    <div className="space-y-1">
      {/* Renderiza etiqueta si se proporciona */}
      {label && (
        <label htmlFor={name} className="block text-texto mb-1">
          {label}
        </label>
      )}

      {/* Campo textarea principal con estilos y funcionalidad completa */}
      <textarea
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        onKeyDown={onKeyDown} // Maneja eventos de teclado personalizados
        placeholder={placeholder}
        required={required}
        disabled={disabled}
        rows={rows} // Altura configurable del textarea
        className={classNames(
          // Estilos base: ancho completo, fondo translúcido, bordes redondeados
          "w-full bg-texto/5 border text-texto rounded-lg transition px-3 py-2 resize-none",
          // Estilos de enfoque con anillo de color
          "focus:outline-none focus:ring-1",
          // Estado deshabilitado con cursor y opacidad
          disabled && "cursor-not-allowed opacity-70",
          // Estados de validación (válido/inválido)
          isInvalid
            ? "border-red-500 focus:border-red-500 focus:ring-red-500" // Error: borde y anillo rojos
            : "border-texto/15 focus:border-acento focus:ring-acento", // Normal: borde neutro, enfoque con color de acento
          className // Clases adicionales personalizables
        )}
      />
    </div>
  );
};

export default Textarea;
