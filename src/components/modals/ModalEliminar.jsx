import MainButton from "../ui/MainButton";
import MainH2 from "../ui/MainH2";
import { IconX } from "@tabler/icons-react";
import ModalContenedor from "../ui/ModalContenedor";

const ModalEliminar = ({
  titulo = "¿Estás seguro?",
  descripcion = "Esta acción no se puede deshacer.",
  onConfirmar,
  onCancelar,
  loading = false,
}) => {
  return (
    <ModalContenedor onClose={onCancelar}>
      <div className="flex justify-between mb-6">
        <MainH2 className="mb-0">{titulo}</MainH2>
        <MainButton
          onClick={onCancelar}
          type="button"
          variant="cross"
          title="Cerrar modal"
          className="px-0"
          disabled={loading}
        >
          <IconX size={24} />
        </MainButton>
      </div>
      <p className="text-center font-bold">{descripcion}</p>

      <div className="flex justify-center gap-4 pt-4">
        <MainButton onClick={onCancelar} variant="secondary" disabled={loading}>
          Cancelar
        </MainButton>
        <MainButton
          onClick={onConfirmar}
          variant="danger"
          loading={loading}
          disabled={loading}
        >
          {loading ? "Eliminando..." : "Eliminar"}
        </MainButton>
      </div>
    </ModalContenedor>
  );
};

export default ModalEliminar;
