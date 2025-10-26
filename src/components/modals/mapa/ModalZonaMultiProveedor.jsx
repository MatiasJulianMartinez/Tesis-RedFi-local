import {
  IconX,
  IconArrowRight,
  IconCarambolaFilled,
  IconCarambola,
} from "@tabler/icons-react";
import MainButton from "../../ui/MainButton";
import MainLinkButton from "../../ui/MainLinkButton";
import MainH2 from "../../ui/MainH2";
import MainH3 from "../../ui/MainH3";
import Badge from "../../ui/Badge";
import Avatar from "../../ui/Avatar";
import ModalContenedor from "../../ui/ModalContenedor";

const ModalZonaMultiProveedor = ({
  isOpen,
  onClose,
  proveedores = [],
  zonaInfo = null,
}) => {
  // No renderiza nada si el modal está cerrado
  if (!isOpen) return null;

  // Renderiza el sistema de estrellas para calificaciones de proveedores
  const renderStars = (promedio) => {
    const stars = [];
    const promedioRedondeado = Math.round(promedio || 0);

    for (let i = 1; i <= 5; i++) {
      if (i <= promedioRedondeado) {
        stars.push(
          <IconCarambolaFilled key={i} size={16} className="text-yellow-600" />
        );
      } else {
        stars.push(
          <IconCarambola key={i} size={16} className="text-texto/75" />
        );
      }
    }

    return (
      <div className="flex items-center gap-1">
        <div className="flex">{stars}</div>
        <span className="text-sm text-texto/75 ml-1 hidden sm:inline-block">
          ({promedio ? promedio.toFixed(1) : "0.0"})
        </span>
      </div>
    );
  };

  // Calcula el promedio de calificación basado en las reseñas del proveedor
  const calcularPromedioCalificacion = (reseñas) => {
    if (!reseñas || reseñas.length === 0) return 0;
    const suma = reseñas.reduce((acc, reseña) => acc + reseña.estrellas, 0);
    return suma / reseñas.length;
  };

  return (
    <ModalContenedor onClose={onClose}>
      {/* Encabezado del modal */}
      <div className="flex justify-between mb-6">
        <MainH2 className="mb-0">Proveedores</MainH2>
        <MainButton
          onClick={onClose}
          type="button"
          variant="cross"
          title="Cerrar modal"
          className="px-0"
        >
          <IconX size={24} />
        </MainButton>
      </div>

      {/* Información de la zona seleccionada */}
      {zonaInfo && (
        <div className="mb-4 p-2 bg-texto/5 rounded-lg border border-texto/15">
          <p className="text-sm text-texto">
            <strong>Zona:</strong>{" "}
            {zonaInfo.departamento || "Zona seleccionada"}
          </p>
          <p className="hidden sm:block text-sm text-texto mt-1">
            Se encontraron <strong>{proveedores.length} proveedores</strong> en
            esta área
          </p>
        </div>
      )}

      {/* Lista scrolleable de proveedores disponibles */}
      <div className="grid grid-cols-1 sm:grid-cols-1 gap-4 max-h-96 overflow-y-auto p-1">
        {proveedores.map((proveedor) => {
          const promedioCalificacion = calcularPromedioCalificacion(
            proveedor.reseñas
          );

          return (
            /* Tarjeta individual de proveedor */
            <div
              key={proveedor.id}
              className="flex flex-col sm:flex-row items-center gap-2 p-2 bg-texto/5 rounded-lg border border-texto/15 hover:bg-texto/10"
            >
              {/* Logo del proveedor */}
              <div className="flex-shrink-0">
                <Avatar
                  fotoUrl={proveedor.logotipo}
                  nombre={proveedor.nombre}
                  size={16}
                  className="rounded-full"
                />
              </div>

              {/* Información detallada del proveedor */}
              <div className="flex-1 min-w-0">
                {/* Nombre y círculo de color identificativo */}
                <div className="flex items-center justify-center sm:justify-start gap-2 mb-1">
                  <MainH3
                    className="text-lg line-clamp-1 mb-0"
                    title={proveedor.nombre}
                  >
                    {proveedor.nombre}
                  </MainH3>
                  <div
                    className="w-4 h-4 rounded-full flex-shrink-0 border border-white/20"
                    style={{ backgroundColor: proveedor.color || "#888888" }}
                    title={`Color de ${proveedor.nombre}`}
                  ></div>
                </div>

                {/* Calificación promedio con estrellas */}
                <div className="mb-2 flex justify-center sm:justify-start">
                  {renderStars(promedioCalificacion)}
                </div>

                {/* Tecnologías disponibles con badges responsivos */}
                {proveedor.ProveedorTecnologia &&
                  proveedor.ProveedorTecnologia.length > 0 && (
                    <div className="hidden sm:flex flex-wrap items-center gap-1 justify-center sm:justify-start">
                      {/* Primeras tecnologías visibles */}
                      {proveedor.ProveedorTecnologia.slice(0, 2).map(
                        (tech, index) => (
                          <Badge
                            key={index}
                            variant="accent"
                            size="xs"
                            collapseOnMobile={index === 1} // oculta la 2da en mobile
                          >
                            {tech.tecnologias?.tecnologia}
                          </Badge>
                        )
                      )}

                      {/* Contador de tecnologías adicionales en mobile */}
                      {proveedor.ProveedorTecnologia.length > 1 && (
                        <Badge variant="muted" size="xs" onlyMobile>
                          +{proveedor.ProveedorTecnologia.length - 1} más
                        </Badge>
                      )}

                      {/* Contador de tecnologías adicionales en desktop */}
                      {proveedor.ProveedorTecnologia.length > 2 && (
                        <Badge variant="muted" size="xs" onlyDesktop>
                          +{proveedor.ProveedorTecnologia.length - 2} más
                        </Badge>
                      )}
                    </div>
                  )}
              </div>

              {/* Botón de navegación a información detallada */}
              <div className="flex-shrink-0">
                <MainLinkButton
                  to={`/proveedores/${proveedor.id}`}
                  variant="primary"
                  className="flex items-center gap-2 px-4 py-2"
                  icon={IconArrowRight}
                  iconSize={16}
                  iconPosition="right"
                >
                  Ver más
                </MainLinkButton>
              </div>
            </div>
          );
        })}
      </div>

      {/* Instrucciones de uso para el usuario */}
      <div className="mt-6 text-center">
        <p className="text-sm text-texto/50 italic">
          Haz clic en "Ver más" para ver más información de cada
          proveedor.
        </p>
      </div>
    </ModalContenedor>
  );
};

export default ModalZonaMultiProveedor;
