import { useState, useEffect } from "react";
import { conceptosRed } from "../../data/conceptosValidos";
import Input from "../ui/Input";
import MainH2 from "../ui/MainH2";
import MainH3 from "../ui/MainH3";
import MainButton from "../ui/MainButton";
import { IconX, IconWorldSearch, IconVolume, IconPlayerStopFilled } from "@tabler/icons-react";

const GlosarioBuscador = () => {
  // Estados para búsqueda y resultados
  const [busqueda, setBusqueda] = useState("");
  const [resultado, setResultado] = useState(null);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState(null);
  const [leyendo, setLeyendo] = useState(false);

  // Limpiar síntesis de voz al desmontar componente
  useEffect(() => {
    const handleEnd = () => setLeyendo(false);
    window.speechSynthesis.addEventListener("end", handleEnd);
    return () => {
      window.speechSynthesis.removeEventListener("end", handleEnd);
    };
  }, []);

  // Buscar término en Wikipedia usando mapeo de conceptos válidos
  const manejarBusqueda = async (termino) => {
    const tituloWiki = conceptosRed[termino] || termino;
    setBusqueda(termino);
    setCargando(true);
    setResultado(null);
    setError(null);

    try {
      const response = await fetch(
        `https://es.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(
          tituloWiki
        )}`
      );
      const data = await response.json();

      if (data.extract) {
        setResultado(data);
      } else {
        setResultado({
          title: termino,
          extract: "No se encontró información.",
        });
      }
    } catch (err) {
      setError("Error al consultar Wikipedia.");
    } finally {
      setCargando(false);
    }
  };

  // Filtrar conceptos válidos como sugerencias
  const sugerencias = Object.keys(conceptosRed).filter((concepto) =>
    concepto.toLowerCase().includes(busqueda.toLowerCase())
  );

  return (
    <>
      {/* Instrucciones de uso */}
      <div className="mt-2">
        <strong className="text-texto">¿Cómo utilizar el buscador?</strong>{" "}
        Escribí palabras como <strong className="text-texto">"DNS"</strong>,{" "}
        <strong className="text-texto">"ping"</strong> o{" "}
        <strong className="text-texto">"ancho de banda"</strong> para conocer su
        significado.
      </div>

      {/* Botones de conceptos populares */}
      <div className="mt-4 flex flex-wrap gap-2 justify-center">
        {[
          "IP",
          "Router",
          "Ping",
          "DNS",
          "Firewall",
          "Latencia",
          "WiFi",
          "Dirección MAC",
          "Ancho de banda",
          "Servidor",
        ].map((concepto, i) => (
          <MainButton
            key={i}
            onClick={() => manejarBusqueda(concepto)}
            variant="secondary"
          >
            {concepto}
          </MainButton>
        ))}
      </div>

      {/* Botón de concepto aleatorio */}
      <div className="mt-12 text-center">
        <MainButton
          variant="primary"
          onClick={() => {
            const keys = Object.keys(conceptosRed);
            const randomKey = keys[Math.floor(Math.random() * keys.length)];
            manejarBusqueda(randomKey);
          }}
        >
          Ver un concepto al azar
        </MainButton>
      </div>

      {/* Campo de búsqueda principal */}
      <div className="relative w-full">
        <Input
          name="busqueda"
          placeholder="Buscar un concepto (ej: IP pública)"
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          endIconAction={
            busqueda
              ? {
                  onClick: () => {
                    setBusqueda("");
                    setResultado(null);
                    setError(null);
                  },
                  icon: <IconX size={18} />,
                  label: "Borrar búsqueda",
                }
              : null
          }
        />
      </div>

      {/* Lista de sugerencias basada en conceptos válidos */}
      {busqueda && sugerencias.length > 0 && (
        <ul className="mt-2 bg-secundario rounded-lg shadow--g text-left max-h-64 overflow-y-auto">
          {sugerencias.map((sugerencia, idx) => (
            <li
              key={idx}
              className="p-3 hover:bg-secundario cursor-pointer border-b border-gray-600 last:border-0"
              onClick={() => manejarBusqueda(sugerencia)}
            >
              {sugerencia}
            </li>
          ))}
        </ul>
      )}

      {/* Mensaje cuando no hay sugerencias */}
      {busqueda && sugerencias.length === 0 && (
        <p className="mt-2">No hay sugerencias.</p>
      )}

      {/* Estados de carga y error */}
      {cargando && (
        <p className="mt-4 text-blue-400 font-bold">Buscando en Wikipedia...</p>
      )}
      {error && <p className="mt-4 text-red-500">{error}</p>}

      {/* Resultado de Wikipedia con opciones de interacción */}
      {resultado && (
        <div className="mt-6 bg-secundario border border-secundario/50 shadow-lg rounded-lg p-4 text-left">
          <MainH3>{resultado.title}</MainH3>
          <p className="mt-3">{resultado.extract}</p>

          {resultado.thumbnail && (
            <img
              src={resultado.thumbnail.source}
              alt={resultado.title}
              className="mt-4 mx-auto rounded-lg bg-white w-full max-w-[300px] h-auto p-4"
            />
          )}

          {/* Botones de síntesis de voz y enlace a Wikipedia */}
          {resultado.extract && (
            <div className="mt-8 flex flex-col sm:flex-row items-start justify-center sm:items-center gap-3">
              <MainButton
                onClick={() => {
                  if (leyendo) {
                    speechSynthesis.cancel();
                    setLeyendo(false);
                  } else {
                    const texto = `${resultado.title}. ${resultado.extract}`;
                    const utterance = new SpeechSynthesisUtterance(texto);
                    utterance.lang = "es-ES";
                    utterance.onend = () => setLeyendo(false);
                    speechSynthesis.speak(utterance);
                    setLeyendo(true);
                  }
                }}
                variant={leyendo ? "danger" : "accent"}
                icon={leyendo ? IconPlayerStopFilled : IconVolume}
              >
                {leyendo ? "Detener lectura" : "Escuchar definición"}
              </MainButton>

              <MainButton
                as="a"
                href={`https://es.wikipedia.org/wiki/${encodeURIComponent(
                  resultado.title
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                variant="primary"
                icon={IconWorldSearch}
              >
                Leer más en Wikipedia
              </MainButton>
            </div>
          )}
        </div>
      )}

      {/* Sección de conceptos destacados */}
      <div className="mt-12">
        <MainH2 className="text-center justify-center">Conceptos destacados</MainH2>
        <div className="grid md:grid-cols-3 gap-4">
          {[
            {
              termino: "Router",
              descripcion:
                "Es el dispositivo que conecta tu casa a Internet y reparte la señal por Wi-Fi o cable.",
            },
            {
              termino: "Wi-Fi",
              descripcion:
                "Es la forma inalámbrica en la que tu celular o compu se conecta al router.",
            },
            {
              termino: "IP pública",
              descripcion:
                "Es la dirección única con la que salís a Internet desde tu casa.",
            },
          ].map((item, i) => (
            <div
              key={i}
              className="bg-secundario border border-secundario/50 shadow-lg rounded-lg p-4 text-left"
            >
              <MainH3 className="text-lg">{item.termino}</MainH3>
              <p>{item.descripcion}</p>
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

export default GlosarioBuscador;
