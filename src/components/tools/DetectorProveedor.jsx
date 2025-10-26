import { useEffect, useState } from "react";
import { IconMapPin, IconWorld } from "@tabler/icons-react";
import MainH3 from "../ui/MainH3";
import MainLoader from "../ui/MainLoader";
import { useTheme } from "../../context/ThemeContext";

const DetectorProveedor = () => {
  const { currentTheme } = useTheme();
  const [datos, setDatos] = useState(null);
  const [error, setError] = useState(null);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    fetch("https://ipwhois.app/json/")
      .then((res) => res.json())
      .then((data) => {
        setDatos(data);
        setCargando(false);
      })
      .catch(() => {
        setError("No se pudo obtener la información de red.");
        setCargando(false);
      });
  }, []);

  return (
    <div
          className={`max-w-xl mx-auto p-8 rounded-lg text-center ${
            currentTheme === "light"
              ? "bg-secundario border border-secundario/50 shadow-lg"
              : "bg-texto/5 border border-texto/15"
          }`}
        >
      
      <MainH3 icon={IconWorld}>Tu conexión actual</MainH3>

      {cargando && <MainLoader texto="Obteniendo información de red..." />}

      {error && <p className="text-red-700 font-semibold">{error}</p>}

      {datos && !cargando && (
        <div className="grid gap-4 text-sm text-left">
          <div>
            <span className="text-texto/75">Proveedor (ISP):</span>
            <p className="font-bold text-lg text-acento">{datos.isp}</p>
          </div>
          <div>
            <span className="text-texto/75">IP Pública:</span>
            <p className="font-mono text-lg">{datos.ip}</p>
          </div>
          <div className="flex items-center gap-2">
            <IconMapPin size={20} className="text-acento" />
            <span>{datos.city}, {datos.region}, {datos.country}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default DetectorProveedor;
