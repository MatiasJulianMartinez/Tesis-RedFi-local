import classNames from "classnames";

const H1 = ({
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
    <h1
      className={classNames(
        applyFlex && "flex", // Layout flexbox condicional
        "items-center justify-center text-center",
        !hasCustomSize && "text-4xl lg:text-5xl", // Tamaño responsivo por defecto
        !hasCustomWeight && "font-extrabold", // Peso de fuente por defecto
        !hasCustomMargin && "mb-4", // Margen inferior por defecto
        className
      )}
      {...props}
    >
      {/* Icono opcional con comportamiento responsivo */}
      {Icon && <Icon size={48} className="mr-2 text-acento hidden sm:inline-block" />}
      {/* Contenido del encabezado */}
      {children}
    </h1>
  );
};

export default H1;
