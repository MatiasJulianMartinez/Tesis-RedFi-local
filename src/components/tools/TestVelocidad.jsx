import { useState, useEffect } from "react";
import { IconArrowLeft, IconGauge } from "@tabler/icons-react";
import MainH1 from "../../components/ui/MainH1";
import MainButton from "../../components/ui/MainButton";
import MainLinkButton from "../../components/ui/MainLinkButton";
import { useTheme } from "../../context/ThemeContext";
import { useAlerta } from "../../context/AlertaContext";
import { ejecutarSpeedtest } from "../../services/speedtestService";

const TestVelocidad = () => {
  const { currentTheme } = useTheme();
  const { mostrarError, mostrarExito } = useAlerta();
  
  // Estados para el control del test y resultados
  const [loading, setLoading] = useState(false);
  const [resultados, setResultados] = useState(null);
  
  // Estado para el progreso visual animado de cada métrica durante el test
  const [progreso, setProgreso] = useState({ descarga: 0, subida: 0, latencia: 0 });

  // Inicia la ejecución del test de velocidad
  const iniciarTest = async () => {
    setLoading(true);
    // Reinicia estados para nuevo test
    setResultados(null);
    setProgreso({ descarga: 0, subida: 0, latencia: 0 });

    try {
      // Ejecuta el test mediante el servicio de speedtest
      const data = await ejecutarSpeedtest();
      setResultados(data);
      mostrarExito("Test de velocidad completado");
    } catch (err) {
      mostrarError(err.message || "Error al ejecutar test de velocidad");
    } finally {
      setLoading(false);
    }
  };

  // Formatea números para mostrar con precisión decimal
  const formatNumber = (value) => {
    if (value == null || isNaN(value)) return "?";
    return Number(value).toFixed(2);
  };

  // Simula progreso visual durante la carga del test
  useEffect(() => {
    let interval;
    if (loading) {
      interval = setInterval(() => {
        setProgreso((prev) => {
          // Función para incrementar progreso con desaceleración exponencial
          const incrementar = (valor) => {
            if (valor >= 99) return valor;
            const remaining = 99 - valor;
            const delta = remaining * 0.03 + 0.2;
            return Math.min(valor + delta, 99);
          };
          return {
            descarga: incrementar(prev.descarga),
            subida: incrementar(prev.subida),
            latencia: incrementar(prev.latencia),
          };
        });
      }, 100); // Actualización cada 100ms para animación fluida
    } else {
      // Completa la animación al 100% cuando el test termina
      setProgreso({ descarga: 100, subida: 100, latencia: 100 });
    }
    return () => {
      // Limpia el intervalo para evitar memory leaks
      if (interval) clearInterval(interval);
    };
  }, [loading]);

  // Componente para dibujar el medidor circular radial
  const RadialGauge = ({ label, value, unit, progress }) => {
    // Determina qué valor mostrar según el estado del test
    const mostrarValor = (() => {
      if (resultados && !loading) {
        // Muestra resultado final del test
        return `${formatNumber(value)} ${unit}`;
      } else if (loading) {
        // Muestra progreso animado durante el test
        return `${Math.round(progress)}%`;
      } else {
        // Estado inicial antes del test
        return "0.00 " + unit;
      }
    })();
    
    // Colores del medidor según el tema actual
    const backgroundRing =
      currentTheme === "light" ? "var(--color-secundario)" : "rgba(255,255,255,0.1)";
    const ringColor =
      resultados && !loading ? "var(--color-acento)" : "var(--color-primario)";
    
    return (
      <div className="flex flex-col items-center">
        {/* Contenedor del medidor circular */}
        <div className="relative h-32 w-32 sm:h-40 sm:w-40">
          {/* Anillo de progreso con gradiente cónico */}
          <div
            className="absolute inset-0 rounded-full"
            style={{
              background: `conic-gradient(${ringColor} ${progress}%, ${backgroundRing} 0)`,
              transform: "rotate(-90deg)", // Inicia desde arriba
            }}
          ></div>
          {/* Centro del medidor con valor y estilo según tema */}
          <div
            className="absolute inset-4 rounded-full flex flex-col items-center justify-center text-center"
            style={{
              backgroundColor:
                currentTheme === "light" ? "var(--color-fondo)" : "rgba(0,0,0,0.5)",
            }}
          >
            <span className="text-xl font-bold sm:text-2xl">{mostrarValor}</span>
          </div>
        </div>
        {/* Etiqueta descriptiva del medidor */}
        <p className="mt-2 font-medium">{label}</p>
      </div>
    );
  };

  return (
    <section className="self-start py-16 px-4 sm:px-6 text-texto w-full">
      <div className="max-w-7xl mx-auto space-y-12">
        {/* Encabezado de la herramienta */}
        <div className="text-center mb-8">
          <MainH1 icon={IconGauge}>Test de velocidad</MainH1>
          <p className="text-lg">Medí la velocidad de tu conexión a internet en tiempo real.</p>
        </div>

        {/* Botón para iniciar o mostrar estado del test */}
        <div className="flex justify-center">
          <MainButton
            onClick={iniciarTest}
            variant="primary"
            disabled={loading}
            className="px-6 py-3"
          >
            {loading ? "Midiendo..." : "Iniciar test"}
          </MainButton>
        </div>

        {/* Grid de medidores radiales - siempre visibles */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 pt-8 justify-items-center">
          {/* Medidor de velocidad de descarga */}
          <RadialGauge
            label="Descarga"
            value={resultados?.downloadSpeed}
            unit="Mbps"
            progress={progreso.descarga}
          />
          {/* Medidor de velocidad de subida */}
          <RadialGauge
            label="Subida"
            value={resultados?.uploadSpeed}
            unit="Mbps"
            progress={progreso.subida}
          />
          {/* Medidor de latencia de conexión */}
          <RadialGauge
            label="Latencia"
            value={resultados?.latency}
            unit="ms"
            progress={progreso.latencia}
          />
        </div>

        {/* Navegación de regreso */}
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

export default TestVelocidad;
