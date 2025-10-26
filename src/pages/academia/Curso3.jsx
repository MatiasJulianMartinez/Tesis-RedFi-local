import { useState } from "react";
import MainH1 from "../../components/ui/MainH1";
import MainH2 from "../../components/ui/MainH2";
import MainButton from "../../components/ui/MainButton";
import MainLinkButton from "../../components/ui/MainLinkButton";
import { IconArrowLeft, IconRadar2, IconBrain } from "@tabler/icons-react";

const Curso3 = () => {
  const [respuestas, setRespuestas] = useState({});
  const [resultado, setResultado] = useState(null);
  const [mostrarResultados, setMostrarResultados] = useState(false);

  const preguntas = [
    {
      id: "p1",
      texto: "¿Qué es lo más importante al elegir un proveedor de internet?",
      correcta: "b",
      opciones: {
        a: "Que tenga un logo famoso",
        b: "Cobertura y buenas reseñas locales",
        c: "El precio más bajo sin importar calidad",
      },
    },
    {
      id: "p2",
      texto:
        "¿Qué herramienta puede ayudarte a medir la calidad del proveedor?",
      correcta: "c",
      opciones: {
        a: "Facebook",
        b: "Google Maps",
        c: "SpeedTest o feedback de otros usuarios",
      },
    },
    {
      id: "p3",
      texto: "¿Qué deberías revisar antes de contratar un ISP?",
      correcta: "a",
      opciones: {
        a: "Comentarios de otros usuarios en tu zona",
        b: "Cuántos colores tiene el módem",
        c: "Si aparece en la televisión",
      },
    },
    {
      id: "p4",
      texto: "¿Cuál de estas situaciones indica un mal servicio técnico?",
      correcta: "c",
      opciones: {
        a: "Te cambian el módem rápidamente",
        b: "Responden en el día",
        c: "No atienden y dan soluciones vagas",
      },
    },
    {
      id: "p5",
      texto: "¿Qué es útil para comparar proveedores en tu zona?",
      correcta: "b",
      opciones: {
        a: "Buscar precios en otro país",
        b: "Ver mapas de cobertura reales y experiencias",
        c: "Elegir al azar",
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
          <MainH1 icon={IconRadar2}>
            Cómo elegir tu proveedor de internet
          </MainH1>
        </div>

        {/* VIDEO */}
        <div className="aspect-video">
          <iframe
            className="w-full h-full rounded-lg"
            src="https://www.youtube.com/embed/GH7RXCO1L0g"
            title="Video Proveedor"
            allowFullScreen
          ></iframe>
        </div>

        {/* TEXTO INFORMATIVO */}
        <div className="text-texto space-y-4">
          <p>
            Elegir un proveedor de internet no debería basarse solo en la
            publicidad. Es clave considerar la experiencia real de otros
            usuarios en tu zona.
          </p>
          <p>
            La cobertura geográfica asegura que recibas buena señal. No todos
            los proveedores ofrecen el mismo rendimiento en todas las zonas.
          </p>
          <p>
            Las reseñas y quejas en redes sociales, foros o apps como Red-Fi te
            pueden dar una idea clara del servicio técnico y estabilidad que
            brindan.
          </p>
          <p>
            Medí la velocidad real que ofrecen con herramientas como SpeedTest.
            Si la velocidad es mucho menor que la contratada, probablemente no
            sea buena opción.
          </p>
          <p>
            Un buen proveedor también ofrece atención rápida y eficaz. Si los
            problemas persisten o no responden, eso habla mal del soporte.
          </p>
        </div>

        {/* QUIZ */}
        <div className="bg-texto/5 p-6 rounded-lg border border-texto/15">
          <MainH2 icon={IconBrain} className="text-center justify-center">
            Quiz final
          </MainH2>

          {mostrarResultados && (
            <p className="mt-8 font-bold text-lg text-center text-texto bg-texto/5 border border-texto/15 rounded-lg px-4 py-4 w-fit mx-auto">
              Acertaste {resultado} de {preguntas.length} preguntas.
            </p>
          )}

          <form
            onSubmit={handleSubmit}
            className="space-y-6 max-w-2xl mx-auto  mt-8"
          >
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
                      className={`p-2 rounded-lg font-bold ${
                        esCorrecta
                          ? "bg-green-600 text-texto"
                          : "bg-red-600 text-texto"
                      }`}
                    >
                      {esCorrecta
                        ? "¡Respuesta correcta!"
                        : `Incorrecto. La respuesta correcta era: "${
                            p.opciones[p.correcta]
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

export default Curso3;
