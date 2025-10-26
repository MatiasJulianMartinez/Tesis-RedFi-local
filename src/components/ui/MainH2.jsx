import classNames from "classnames";

const H2 = ({
  children,
  className = "",
  icon: Icon = null,
  variant = "",
  ...props
}) => {
  // Detecta si se aplicaron estilos personalizados para evitar duplicados
  const hasCustomSize = /\btext-(xs|sm|base|lg|xl|\d+xl)\b/.test(className);
  const hasCustomWeight = /\bfont-(thin|light|normal|medium|semibold|bold|extrabold|black)\b/.test(className);
  const hasCustomMargin = /\bmb-\d+\b/.test(className);
  const hasCustomTextAlign = /\btext-(left|center|right|justify)\b/.test(className);
  const hasCustomJustify = /\bjustify-(start|center|end|between|around|evenly)\b/.test(className);

  // Controla si aplica flexbox (se puede deshabilitar con variant="noflex")
  const applyFlex = variant !== "noflex";

  return (
    <h2
      className={classNames(
        applyFlex && "flex items-center gap-2", // Layout flexbox condicional con gap
        !hasCustomJustify && applyFlex && "justify-start", // Justificación izquierda por defecto
        !hasCustomTextAlign && "text-left", // Alineación izquierda por defecto
        !hasCustomSize && "text-3xl lg:text-4xl", // Tamaño responsivo por defecto (menor que H1)
        !hasCustomWeight && "font-semibold", // Peso de fuente por defecto (menor que H1)
        !hasCustomMargin && "mb-4", // Margen inferior por defecto
        className
      )}
      {...props}
    >
      {/* Icono opcional con comportamiento responsivo y menor tamaño */}
      {Icon && <Icon size={32} className="hidden sm:inline-block text-acento" />}
      {/* Contenido del encabezado */}
      {children}
    </h2>
  );
};

export default H2;
