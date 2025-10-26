import { useEffect, useRef, useState } from "react";
import MainH3 from "../ui/MainH3";
import MainButton from "../ui/MainButton";
import Input from "../ui/Input";
import { useAlerta } from "../../context/AlertaContext";
import { useTheme } from "../../context/ThemeContext";

const WifiScanner = () => {
  // Estados para el control del input y resultados
  const [nombreZona, setNombreZona] = useState("");
  const [resultados, setResultados] = useState({});
  const [recomendacion, setRecomendacion] = useState("");
  
  // Estados para el control del progreso del test
  const [enProgreso, setEnProgreso] = useState(false);
  const [pasoActual, setPasoActual] = useState(0);
  const [completado, setCompletado] = useState(false);
  
  // Referencias para la librería de speedtest
  const medidorRef = useRef(null);
  const testActivo = useRef(null);
  
  const { mostrarError, mostrarInfo } = useAlerta();
  const { currentTheme } = useTheme();

  // Carga la librería de speedtest cuando el componente se monta
  useEffect(() => {
    // Crea e inyecta el script de speedtest en el DOM
    const script = document.createElement("script");
    script.src = "/speedtest/speedtest.js";
    script.async = true;
    script.onload = () => {
      if (window.Speedtest) {
        // Inicializa la instancia del speedtest
        medidorRef.current = new window.Speedtest();
        console.log("✅ Speedtest inicializado");
      } else {
        console.error("❌ Speedtest.js no se cargó correctamente.");
      }
    };
    document.body.appendChild(script);
    
    // Cleanup: remueve el script cuando el componente se desmonta
    return () => document.body.removeChild(script);
  }, []);

  // Ejecuta la medición de una zona específica
  const medirZona = () => {
    // Validación del nombre de zona
    if (!nombreZona.trim()) {
      mostrarError("Por favor, ingresa un nombre para la zona.");
      return;
    }

    // Verifica que la librería esté disponible
    if (!medidorRef.current) return;

    // Cancela test activo si existe
    if (testActivo.current && testActivo.current._state !== 4) {
      testActivo.current.abort();
    }

    // Crea nueva instancia de test y configura estados
    const t = new window.Speedtest();
    testActivo.current = t;
    let datosSeteados = false;
    setEnProgreso(true);
    setPasoActual(0);
    setCompletado(false);

    // Callback para actualizar progreso durante el test
    t.onupdate = (data) => {
      console.log("Datos obtenidos:", data);

      // Actualiza el paso actual del test (1-4)
      if (data.testState >= 1 && data.testState <= 4) {
        setPasoActual(data.testState);
      }

      // Procesa resultados cuando el test está completo
      if (data.testState === 4 && !datosSeteados) {
        setResultados((prev) => ({
          ...prev,
          [nombreZona]: {
            ping: parseFloat(data.pingStatus) || 0,
            jitter: parseFloat(data.jitterStatus) || 0,
          },
        }));
        datosSeteados = true;
        t.abort();
        setEnProgreso(false);
        setCompletado(true);
        setNombreZona("");

        // Auto-limpia el estado completado después de 4 segundos
        setTimeout(() => {
          setCompletado(false);
          setPasoActual(0);
        }, 4000);
      }
    };

    // Manejo de errores durante el test
    t.onerror = (err) => {
      console.error("❌ Error al medir:", err);
      mostrarError("Ocurrió un error durante la medición.");
      setEnProgreso(false);
      setPasoActual(0);
      setCompletado(false);
    };

    // Callback cuando el test termina
    t.onend = () => {
      console.log("✅ Test finalizado");
      setEnProgreso(false);
    };

    // Inicia la ejecución del test
    t.start();
  };

  // Analiza todas las zonas medidas y recomienda la mejor ubicación
  const recomendarUbicacion = () => {
    // Verifica que haya suficientes mediciones para comparar
    if (Object.keys(resultados).length < 2) {
      mostrarInfo("Medí al menos dos zonas para obtener una recomendación.");
      return;
    }

    // Ordena las zonas por calidad de conexión (menor ping + jitter es mejor)
    const mejor = Object.entries(resultados).sort(([, a], [, b]) => {
      return a.ping + a.jitter - (b.ping + b.jitter);
    })[0];

    // Muestra la recomendación al usuario
    mostrarInfo(
      `Mejor ubicación: ${mejor[0]} (Ping: ${mejor[1].ping} ms, Jitter: ${mejor[1].jitter} ms)`
    );
  };

  // Reinicia todos los datos del análisis
  const reiniciarAnalisis = () => {
    setResultados({});
    setNombreZona("");
    setCompletado(false);
    setPasoActual(0);
  };

  // Elimina una zona específica de los resultados
  const eliminarZona = (zona) => {
    const nuevosResultados = { ...resultados };
    delete nuevosResultados[zona];
    setResultados(nuevosResultados);
  };

  return (
    <div
      className={`p-8 rounded-lg mx-auto text-texto max-w-xl relative ${
        currentTheme === "light"
          ? "bg-secundario border border-secundario/50 shadow-lg"
          : "bg-texto/5 border border-texto/15"
      }`}
    >
      {/* Formulario para nombre de zona y botón de medición */}
      <div className="flex flex-col md:flex-row justify-center items-center gap-4 text-center">
        <div className="w-full md:w-1/2">
          <Input
            name="zona"
            value={nombreZona}
            onChange={(e) => {
              setNombreZona(e.target.value);
            }}
            placeholder="Escribí el nombre de la zona (ej: Comedor)"
            required
          />
        </div>

        <MainButton
          onClick={medirZona}
          disabled={enProgreso}
          loading={enProgreso}
        >
          {enProgreso ? "Analizando..." : "Medir conexión"}
        </MainButton>
      </div>

      {/* Controles principales del análisis */}
      <div className="w-full mt-6 flex flex-col md:flex-row items-center justify-center gap-4">
        <MainButton onClick={reiniciarAnalisis} variant="danger">
          Reiniciar análisis
        </MainButton>
        <MainButton onClick={recomendarUbicacion} variant="accent">
          Recomendar ubicación
        </MainButton>
      </div>

      {/* Barra de progreso visual durante el test */}
      {(enProgreso || completado) && (
        <div className="mt-4 w-full">
          <p
            className={`text-center text-sm mb-2 ${
              completado ? "text-green-700" : "text-yellow-600"
            }`}
          >
            {completado
              ? "✅ Análisis completado"
              : `Paso ${pasoActual} de 4: ${
                  {
                    1: "Conectando al servidor...",
                    2: "Midiendo descarga...",
                    3: "Midiendo subida...",
                    4: "Procesando resultados...",
                  }[pasoActual] || "Iniciando..."
                }`}
          </p>
          {/* Barra de progreso animada */}
          <div className="w-full bg-gray-700 h-3 rounded-full">
            <div
              className={`h-3 rounded-full transition-all duration-500 ${
                completado ? "bg-green-500" : "bg-yellow-700"
              }`}
              style={{
                width: `${completado ? 100 : (pasoActual / 4) * 100}%`,
              }}
            ></div>
          </div>
        </div>
      )}

      {/* Lista de resultados de zonas medidas */}
      {Object.keys(resultados).length > 0 && (
        <div className="mt-6 text-left">
          <MainH3 className="text-center justify-center">Resultados:</MainH3>
          <ul className="space-y-2">
            {Object.entries(resultados).map(([zona, datos]) => (
              <li
                key={zona}
                className="bg-gray-800 p-3 rounded-lg flex justify-between items-center"
              >
                {/* Información de ping y jitter para cada zona */}
                <span>
                  <strong>{zona}:</strong> Ping: {datos.ping} ms | Jitter:{" "}
                  {datos.jitter} ms
                </span>
                {/* Botón para eliminar zona de los resultados */}
                <MainButton
                  onClick={() => eliminarZona(zona)}
                  variant="delete"
                  iconSize={18}
                  className="p-1"
                  title={`Eliminar resultados de ${zona}`}
                />
              </li>
            ))}
          </ul>
        </div>
      )} 
    </div>
  );
};

export default WifiScanner;
