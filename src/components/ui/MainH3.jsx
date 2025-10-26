import classNames from "classnames";

const H3 = ({
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
    <h3
      className={classNames(
        applyFlex && "flex", // Layout flexbox condicional
        applyFlex && "items-center", // Alineación vertical centrada
        !hasCustomJustify && applyFlex && "justify-start", // Justificación izquierda por defecto
        !hasCustomTextAlign && "text-left", // Alineación de texto izquierda por defecto
        !hasCustomSize && "text-xl lg:text-2xl", // Tamaño responsivo por defecto (menor que H2)
        !hasCustomWeight && "font-semibold", // Peso de fuente por defecto (igual que H2)
        !hasCustomMargin && "mb-4", // Margen inferior por defecto
        className
      )}
      {...props}
    >
      {/* Icono opcional con el tamaño más pequeño de la jerarquía */}
      {Icon && <Icon size={28} className="hidden sm:inline-block mr-2 text-acento" />}
      {/* Contenido del encabezado */}
      {children}
    </h3>
  );
};

export default H3;
