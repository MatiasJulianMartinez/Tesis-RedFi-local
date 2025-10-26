import { useState, useRef, useEffect } from "react";
import { IconChevronDown } from "@tabler/icons-react";
import classNames from "classnames";

const CheckboxDropdown = ({
  label,
  options = [],
  value = [],
  onChange,
  getOptionLabel = (opt) => opt.label,
  getOptionValue = (opt) => opt.value,
  disabled = false,
}) => {
  // Estados para controlar apertura del dropdown
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Alterna la selección de una opción específica
  const toggleOption = (val) => {
    if (value.includes(val)) {
      // Remueve si ya está seleccionado
      onChange(value.filter((v) => v !== val));
    } else {
      // Agrega a la selección
      onChange([...value, val]);
    }
  };

  // Maneja clicks fuera del dropdown para cerrarlo
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  // Genera texto inteligente para mostrar opciones seleccionadas
  const getDisplayText = () => {
    const selectedOptions = options.filter((opt) => 
      value.includes(getOptionValue(opt))
    );
    
    if (selectedOptions.length === 0) {
      return "Seleccionar...";
    }
    
    if (selectedOptions.length === 1) {
      return getOptionLabel(selectedOptions[0]);
    }
    
    if (selectedOptions.length <= 2) {
      // Muestra hasta 2 opciones separadas por coma
      return selectedOptions.map(getOptionLabel).join(", ");
    }
    
    // Para más de 2 opciones, muestra la primera + contador
    return `${getOptionLabel(selectedOptions[0])} y ${selectedOptions.length - 1} más`;
  };

  return (
    <div className="relative w-full" ref={dropdownRef}>
      {/* Label opcional del dropdown */}
      {label && (
        <label className="block text-texto mb-1">
          {label}
        </label>
      )}
      
      {/* Botón principal que abre/cierra el dropdown */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => setOpen(!open)}
        className={classNames(
          "w-full px-3 py-2 bg-texto/5 text-texto rounded-lg border text-left",
          "border-texto/15 focus:outline-none focus:ring-1 focus:ring-acento",
          disabled && "opacity-60 cursor-not-allowed",
          "flex items-center justify-between min-w-0" // Layout y prevención de overflow
        )}
      >
        {/* Texto que muestra las selecciones actuales */}
        <span className="truncate text-sm flex-1 min-w-0">
          {getDisplayText()}
        </span>
        {/* Icono de chevron para indicar dropdown */}
        <IconChevronDown size={18} className="text-texto/50 flex-shrink-0 ml-2" />
      </button>

      {/* Panel desplegable con opciones de checkbox */}
      {open && (
        <div className="absolute mt-1 w-full max-h-60 overflow-y-auto bg-secundario border border-secundario/50 rounded-lg shadow-lg z-60 p-2 space-y-1">
          {options.map((opt) => {
            const val = String(getOptionValue(opt));
            const label = getOptionLabel(opt);
            const checked = value.map(String).includes(val);

            return (
              <label
                key={val}
                className="flex items-center gap-2 p-2 rounded hover:bg-texto/5 cursor-pointer transition"
              >
                {/* Checkbox individual para cada opción */}
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => toggleOption(val)}
                  className="accent-acento flex-shrink-0 rounded"
                />
                {/* Label de la opción */}
                <span className="text-sm">{label}</span>
              </label>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default CheckboxDropdown;
