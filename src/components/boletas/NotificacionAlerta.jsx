import { useEffect, useState } from "react";
import MainButton from "../ui/MainButton";

const NotificacionAlerta = ({ mensaje, tipo, onClose }) => {
  const colores = {
    vencimiento: "bg-yellow-600",
    aumento: "bg-red-600",
    info: "bg-blue-600",
  };

  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
      if (onClose) onClose();
    }, 10000); // 10 segundos

    return () => clearTimeout(timer);
  }, [onClose]);

  if (!visible) return null;

  return (
    <div
      className={`text-texto px-4 py-3 rounded mb-4 relative ${colores[tipo]}`}
    >
      {mensaje}
      <MainButton
        onClick={() => {
          setVisible(false);
          if (onClose) onClose();
        }}
        type="button"
        variant="cross"
        title="Cerrar"
      />
    </div>
  );
};

export default NotificacionAlerta;
