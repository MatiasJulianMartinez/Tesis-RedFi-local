import {
  IconX,
  IconCarambolaFilled,
  IconCarambola,
  IconArrowRight,
} from "@tabler/icons-react";
import MainButton from "../../ui/MainButton";
import MainLinkButton from "../../ui/MainLinkButton";
import MainH2 from "../../ui/MainH2";
import ModalContenedor from "../../ui/ModalContenedor";
import Badge from "../../ui/Badge";
import Avatar from "../../ui/Avatar";

const ModalProveedor = ({ proveedor, onClose }) => {
  // Verifica que existe el proveedor antes de renderizar
  if (!proveedor) return null;

  // Calcula el promedio de estrellas basado en las reseñas del proveedor
  const promedioEstrellas = proveedor.reseñas?.length
    ? proveedor.reseñas.reduce((sum, r) => sum + r.estrellas, 0) /
      proveedor.reseñas.length
    : 0;

  // Obtiene las tecnologías disponibles desde la relación ProveedorTecnologia
  const tecnologias =
    proveedor.ProveedorTecnologia?.map((rel) => rel.tecnologias?.tecnologia) ||
    [];

  // Renderiza el sistema de estrellas con promedio de calificaciones
  const renderStars = (promedio) => {
    const stars = [];
    const promedioRedondeado = Math.round(promedio || 0);

    for (let i = 1; i <= 5; i++) {
      if (i <= promedioRedondeado) {
        stars.push(
          <IconCarambolaFilled key={i} size={24} className="text-yellow-600" />
        );
      } else {
        stars.push(
          <IconCarambola key={i} size={24} className="text-texto/75" />
        );
      }
    }

    return (
      <div className="flex items-center gap-1">
        <div className="flex gap-1">{stars}</div>
        <span className="text-sm text-texto/75 ml-1">
          ({promedio ? promedio.toFixed(1) : "0.0"})
        </span>
      </div>
    );
  };

  return (
    <ModalContenedor onClose={onClose}>
      {/* Botón de cierre del modal */}
      <MainButton
        onClick={onClose}
        variant="cross"
        title="Cerrar"
        className="absolute top-3 right-3"
      >
        <IconX size={24} />
      </MainButton>

      {/* Logotipo o ícono representativo del proveedor */}
      <div className="flex justify-center mb-4">
        {proveedor.logotipo ? (
          <Avatar
            fotoUrl={proveedor.logotipo}
            nombre={proveedor.nombre}
            size={20}
            className="rounded-full"
          />
        ) : (
          <div className="w-20 h-20 rounded-full bg-texto/5 flex items-center justify-center text-3xl">
            🏢
          </div>
        )}
      </div>

      {/* Nombre del proveedor */}
      <MainH2 className="text-center justify-center">{proveedor.nombre}</MainH2>

      {/* Sistema de calificación con promedio de estrellas */}
      <div className="mb-4 flex justify-center">
        {renderStars(promedioEstrellas)}
      </div>

      {/* Tecnologías disponibles con badges responsivos */}
      <div className="flex flex-wrap justify-center gap-2 mb-4">
        {tecnologias.length > 0 ? (
          <>
            {/* Primeras tecnologías visibles */}
            {tecnologias.slice(0, 2).map((tec, index) => (
              <Badge
                key={index}
                variant="accent"
                size="xs"
                collapseOnMobile={index === 1} // oculta la 2da en mobile
              >
                {tec}
              </Badge>
            ))}

            {/* Contador de tecnologías adicionales en mobile */}
            {tecnologias.length > 1 && (
              <Badge variant="muted" size="xs" onlyMobile>
                +{tecnologias.length - 1} más
              </Badge>
            )}

            {/* Contador de tecnologías adicionales en desktop */}
            {tecnologias.length > 2 && (
              <Badge variant="muted" size="xs" onlyDesktop>
                +{tecnologias.length - 2} más
              </Badge>
            )}
          </>
        ) : (
          <span className="text-sm text-texto">Sin tecnologías asociadas</span>
        )}
      </div>

      {/* Descripción del proveedor */}
      <p className="text-texto bg-texto/5 border border-texto/15 rounded-lg px-4 py-4 text-center leading-relaxed mb-6">
        {proveedor.descripcion || "Este proveedor aún no tiene descripción."}
      </p>

      {/* Botón para ver más información del proveedor */}
      <MainLinkButton
        to={`/proveedores/${proveedor.id}`}
        className="w-full px-4 py-2"
        icon={IconArrowRight}
        iconSize={16}
        iconPosition="right"
      >
        Más información
      </MainLinkButton>
    </ModalContenedor>
  );
};

export default ModalProveedor;
