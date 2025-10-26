import React from "react";
import MainLinkButton from "../../components/ui/MainLinkButton";
import MainH1 from "../../components/ui/MainH1";
import MainH2 from "../../components/ui/MainH2";
import MainH3 from "../../components/ui/MainH3";
import { IconAccessPoint, IconArrowLeft } from "@tabler/icons-react";
import WifiScanner from "../../components/tools/WifiScanner";
import { useTheme } from "../../context/ThemeContext";

const AnalisisConexion = () => {
  const { currentTheme } = useTheme();
  return (
    <section className="self-start py-16 px-4 sm:px-6 text-texto w-full">
      <div className="max-w-7xl mx-auto space-y-12">
        <div className="text-center mb-8">
          <MainH1 icon={IconAccessPoint}>Análisis de conexión por zonas</MainH1>
          <p className="text-lg">
            En esta herramienta podrás ver la información de tu red, al igual
            que tu ubicación.
          </p>
        </div>
        <div>
          <WifiScanner />
        </div>
        <div
          className={`w-full p-8 rounded-lg ${
            currentTheme === "light"
              ? "bg-secundario border border-secundario/50 shadow-lg"
              : "bg-texto/5 border border-texto/15"
          }`}
        >
          <MainH3>¿Como funciona el análisis de conexión por zonas?</MainH3>
          <p>
            Su funcionalidad es "escanear" la calidad de su conexión Wi-Fi en diferentes zonas de su hogar. El objetivo es ayudarl a encontrar la ubicación óptima para su router.
          </p>
        </div>
        <div
          className={`w-full p-8 rounded-lg ${
            currentTheme === "light"
              ? "bg-secundario border border-secundario/50 shadow-lg"
              : "bg-texto/5 border border-texto/15"
          }`}
        >
          <MainH3>¿Como se usar el análisis de conexión por zonas?</MainH3>
          <p>
            Para usar el analisis de conexión por zonas, simplemente debes
            ingresar el nombre de la zona que deseas analizar y presionar el
            botón "Analizar". El sistema te mostrará la información de la zona
            que ingresaste.
          </p>
          <p>
            Si realiza el analisis mas de 2 veces, se le habilitará el boton de "Recomendar ubicación". La funcionalidad del mismo es analizar los resultados y le dirá cuál de las zonas medidas tiene la mejor calidad de señal (menor ping y jitter combinados).
          </p>
        </div>
        {/* Botón volver a herramientas */}
        <div className="text-center">
          <MainLinkButton to="/herramientas" variant="secondary">
            <IconArrowLeft />
            Volver a herramientas
          </MainLinkButton>
        </div>
      </div>
    </section>
  );
};

export default AnalisisConexion;
