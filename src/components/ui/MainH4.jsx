import classNames from "classnames";

const H4 = ({
  children,
  className = "",
  icon: Icon = null,
  variant = "",
  ...props
}) => {
  // Detecta si se aplicaron estilos personalizados para evitar duplicados
  const hasCustomSize = /\btext-(xs|sm|base|lg|xl|\d+xl)\b/.test(className);
  const hasCustomWeight =
    /\bfont-(thin|light|normal|medium|semibold|bold|extrabold|black)\b/.test(
      className
    );
  const hasCustomMargin = /\bmb-\d+\b/.test(className);

  // Controla si aplica flexbox (se puede deshabilitar con variant="noflex")
  const applyFlex = variant !== "noflex";

  return (
    <h4
      className={classNames(
        applyFlex && "flex", // Layout flexbox condicional
        "items-center justify-start text-left", // Estilos de alineación fijos
        !hasCustomSize && "text-lg md:text-xl", // Tamaño responsivo por defecto (el más pequeño)
        !hasCustomWeight && "font-semibold", // Peso de fuente por defecto
        !hasCustomMargin && "mb-2", // Margen inferior reducido para jerarquía menor
        className
      )}
      {...props}
    >
      {/* Icono opcional con el tamaño más pequeño de todos los encabezados */}
      {Icon && <Icon size={20} className="hidden sm:inline-block mr-2 text-acento" />}
      {/* Contenido del encabezado */}
      {children}
    </h4>
  );
};

export default H4;
