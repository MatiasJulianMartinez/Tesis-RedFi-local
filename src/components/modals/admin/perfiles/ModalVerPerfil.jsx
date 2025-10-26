import { IconX } from "@tabler/icons-react";
import Avatar from "../../../ui/Avatar";
import Badge from "../../../ui/Badge";
import MainButton from "../../../ui/MainButton";
import MainH2 from "../../../ui/MainH2";
import ModalContenedor from "../../../ui/ModalContenedor";

const ModalVerPerfil = ({ perfil, onClose }) => {
  if (!perfil) return null;

  const { nombre, proveedor_preferido, rol, plan, foto_url } = perfil;

  // Función para determinar la variante del badge según el tipo
  const obtenerVarianteBadge = (tipo, valor) => {
    if (tipo === "rol" && valor === "admin") return "admin";
    if (tipo === "plan" && valor === "premium") return "premium";
    return "muted";
  };

  return (
    <ModalContenedor onClose={onClose}>
      {/* Encabezado del modal */}
      <div className="flex justify-between items-start mb-6">
        <MainH2 className="mb-0">Detalle del Perfil</MainH2>
        <MainButton
          onClick={onClose}
          type="button"
          variant="cross"
          title="Cerrar modal"
        >
          <IconX size={24} />
        </MainButton>
      </div>

      {/* Avatar y nombre del usuario */}
      <div className="flex flex-col items-center text-texto mb-6">
        <Avatar fotoUrl={foto_url} nombre={nombre} size={28} />
        <p className="mt-4 text-xl font-semibold">{nombre}</p>
      </div>

      {/* Información detallada del perfil */}
      <div className="bg-secundario rounded-lg px-4 py-4 space-y-4 text-texto border border-secundario/50">
        <div>
          <p className="font-bold">Proveedor preferido</p>
          <p>{proveedor_preferido || "—"}</p>
        </div>

        <div className="flex flex-row gap-4">
          <div className="flex-1">
            <p className="text-texto font-bold">Rol</p>
            <Badge 
              size="md" 
              variant={obtenerVarianteBadge("rol", rol)}
            >
              {rol}
            </Badge>
          </div>
          <div className="flex-1">
            <p className="text-texto font-bold">Plan</p>
            <Badge 
              size="md" 
              variant={obtenerVarianteBadge("plan", plan)}
            >
              {plan}
            </Badge>
          </div>
        </div>
      </div>

      {/* Botón de cierre */}
      <div className="mt-6 flex justify-end">
        <MainButton variant="primary" onClick={onClose}>
          Cerrar
        </MainButton>
      </div>
    </ModalContenedor>
  );
};

export default ModalVerPerfil;
