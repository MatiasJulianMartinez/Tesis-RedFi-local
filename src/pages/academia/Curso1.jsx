import { useState } from "react";
import MainH1 from "../../components/ui/MainH1";
import MainH2 from "../../components/ui/MainH2";
import MainButton from "../../components/ui/MainButton";
import MainLinkButton from "../../components/ui/MainLinkButton";
import { IconArrowLeft, IconWifi, IconBrain } from "@tabler/icons-react";

const Curso1 = () => {

  const [respuestas, setRespuestas] = useState({});
  const [resultado, setResultado] = useState(null);
  const [mostrarResultados, setMostrarResultados] = useState(false);

  const preguntas = [
    {
      id: "p1",
      texto: "¿Dónde es mejor ubicar tu router para mejor señal?",
      correcta: "b",
      opciones: {
        a: "En una esquina del piso",
        b: "En el centro de la casa y en alto",
        c: "Debajo de una mesa",
      },
    },
    {
      id: "p2",
      texto: "¿Qué frecuencia tiene mayor alcance?",
      correcta: "a",
      opciones: {
        a: "2.4 GHz",
        b: "5 GHz",
        c: "6 GHz",
      },
    },
    {
      id: "p3",
      texto: "¿Cuál es un motivo común de interferencia Wi-Fi?",
      correcta: "c",
      opciones: {
        a: "Demasiada velocidad",
        b: "Luz solar directa",
        c: "Electrodomésticos como microondas",
      },
    },
    {
      id: "p4",
      texto: "¿Qué canal usar en 2.4 GHz para evitar saturación?",
      correcta: "a",
      opciones: {
        a: "1, 6 u 11",
        b: "Todos a la vez",
        c: "Cualquiera, no importa",
      },
    },
    {
      id: "p5",
      texto: "¿Qué podés hacer si no llega señal a una habitación?",
      correcta: "b",
      opciones: {
        a: "Cambiar de proveedor",
        b: "Usar repetidores o una red mesh",
        c: "Apagar y prender el router",
      },
    },
  ];

  const handleChange = (id, value) => {
    setRespuestas({ ...respuestas, [id]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const correctas = preguntas.reduce(
      (acc, p) => acc + (respuestas[p.id] === p.correcta ? 1 : 0),
      0
    );
    setResultado(correctas);
    setMostrarResultados(true);
  };

  const handleReset = () => {
    setRespuestas({});
    setResultado(null);
    setMostrarResultados(false);
  };

  return (
    <section className="self-start py-16 px-4 sm:px-6 text-texto w-full">
      <div className="max-w-7xl mx-auto space-y-12">
        <div className="text-center mb-8">
          <MainH1 icon={IconWifi}>Mejora tu Wi-Fi en casa</MainH1>
        </div>

        {/* VIDEO */}
        <div className="aspect-video">
          <iframe
            className="w-full h-full rounded-lg"
            src="https://www.youtube.com/embed/Gqq71BWfDpI"
            title="Video WiFi"
            allowFullScreen
          ></iframe>
        </div>

        {/* TEXTO EXPLICATIVO */}
        <div className="text-texto space-y-4">
          <p>
            ¿Tienes problemas de conexión en tu casa? Muchas veces, el problema
            no es el proveedor, sino cómo está distribuida la red Wi-Fi.
          </p>
          <p>
            Uno de los factores más importantes es la ubicación del router.
            Dejarlo cerca del piso, detrás del televisor o en una esquina,
            afecta negativamente la señal.
          </p>
          <p>
            Las señales Wi-Fi funcionan mejor cuando el router está en el centro
            de la vivienda, a una altura elevada y sin obstáculos como metales o
            espejos.
          </p>
          <p>
            Las redes de 2.4 GHz tienen mayor alcance, pero son más susceptibles
            a interferencias. Las redes de 5 GHz ofrecen más velocidad, pero
            menos cobertura.
          </p>
          <p>
            Un canal saturado también afecta tu red. Elegí siempre entre los
            canales 1, 6 u 11 para 2.4 GHz, ya que no se superponen entre sí.
          </p>
          <p>
            Para extender la cobertura puedes usar repetidores, sistemas mesh o
            adaptadores PLC. No hace falta cambiar de proveedor si la solución
            está dentro del hogar.
          </p>
          <p>
            Finalmente, recuerda cambiar la contraseña predeterminada de tu
            router para evitar accesos no deseados y optimizar el rendimiento de
            la red.
          </p>
          <p>
            Mantener tu router actualizado y reiniciarlo cada cierto tiempo
            también puede ayudar a resolver errores intermitentes o caídas de
            señal.
          </p>
        </div>

        {/* QUIZ */}
        <div className="bg-texto/5 p-6 rounded-lg border border-texto/15">
          <MainH2 icon={IconBrain} className="text-center justify-center">Quiz final</MainH2>

          {mostrarResultados && (
            <p className="mt-8 font-bold text-lg text-center text-texto bg-texto/5 border border-texto/15 rounded-lg px-4 py-4 w-fit mx-auto">
              Acertaste {resultado} de {preguntas.length} preguntas.
            </p>
          )}

          <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl mx-auto mt-8">
            {preguntas.map((p) => {
              const respuestaUsuario = respuestas[p.id];
              const esCorrecta = respuestaUsuario === p.correcta;
              return (
                <div key={p.id} className="space-y-2">
                  <p className="font-medium text-texto">{p.texto}</p>
                  <div className="flex flex-col gap-1 text-sm">
                    {Object.entries(p.opciones).map(([key, text]) => (
                      <label key={key} className="cursor-pointer">
                        <input
                          type="radio"
                          name={p.id}
                          value={key}
                          onChange={() => handleChange(p.id, key)}
                          checked={respuestaUsuario === key}
                          className="mr-2"
                        />
                        {text}
                      </label>
                    ))}
                  </div>

                  {mostrarResultados && (
                    <div
                      className={`p-2 rounded-lg font-bold ${esCorrecta
                          ? "bg-green-600 text-texto"
                          : "bg-red-600 text-texto"
                        }`}
                    >
                      {esCorrecta
                        ? "¡Respuesta correcta!"
                        : `Incorrecto. La respuesta correcta era: "${p.opciones[p.correcta]
                        }"`}
                    </div>
                  )}
                </div>
              );
            })}

            <div className="flex justify-center gap-4 flex-wrap mt-6">
              <MainButton
                type="button"
                onClick={handleReset}
                variant="secondary"
              >
                Reiniciar
              </MainButton>

              <MainButton type="submit" variant="primary">
                Enviar respuestas
              </MainButton>
            </div>

          </form>
        </div>

        {/* Botón volver a Academy */}
        <div className="text-center">
          <MainLinkButton to="/academy" variant="secondary">
            <IconArrowLeft />
            Volver a Red-Fi Academy
          </MainLinkButton>
        </div>
      </div>
    </section>
  );
};

export default Curso1;
