import {
  IconMapPinCheck,
  IconTools,
  IconStars,
  IconReceipt,
} from "@tabler/icons-react";
import MainH2 from "../ui/MainH2";
import MainH3 from "../ui/MainH3";
import { useTheme } from "../../context/ThemeContext";

const features = [
  {
    icono: <IconMapPinCheck size={64} />,
    titulo: "Cobertura geolocalizada",
    descripcion:
      "Explora el mapa interactivo de Corrientes y descubrí qué proveedores ofrecen servicio en tu zona exacta.",
  },
  {
    icono: <IconStars size={64} />,
    titulo: (
      <>
        Opiniones
        <br />
        verificadas
      </>
    ),
    descripcion:
      "Lee reseñas auténticas de usuarios reales y evita sorpresas. Conoce las experiencias reales en tu barrio.",
  },
  {
    icono: <IconTools size={64} />,
    titulo: "Herramientas inteligentes",
    descripcion:
      "Mide la velocidad de tu conexión, analiza la latencia y accede a métricas clave para evaluar tu proveedor.",
  },
  {
    icono: <IconReceipt size={64} />,
    titulo: (
      <>
        Guardado
        <br />
        de boletas
      </>
    ),
    descripcion:
      "Guarde sus boletas, reciba notificaciones antes del vencimiento y revise si hubo aumentos mes a mes.",
  },
];

const Caracteristicas = () => {
  const { currentTheme } = useTheme();
  return (
    <section className="py-16 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto text-center space-y-12">
        <div className="space-y-5">
          <MainH2 className="text-center justify-center">
            ¿Por qué elegir Red-Fi?
          </MainH2>
          <p className="max-w-2xl mx-auto text-texto leading-relaxed">
            Red-Fi te permite tomar decisiones informadas al momento de elegir
            un proveedor de internet. Ya sea que busques velocidad, estabilidad
            o una buena atención al cliente, acá vas a encontrar lo que
            necesitas.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 sm:gap-10">
          {features.map((f, i) => (
            <div
              key={i}
              className={`w-full max-w-[320px] sm:max-w-none mx-auto sm:mx-0 p-6 rounded-lg transition-transform transform hover:scale-105 backdrop-blur-md ${
                currentTheme === "light"
                  ? "bg-secundario border border-secundario/50 shadow-lg"
                  : "bg-texto/5 border border-texto/15"
              }`}
            >
              <div className="flex justify-center mb-4 sm:mb-5 text-acento">
                <div>{f.icono}</div>
              </div>
              <MainH3 className="text-acento text-center justify-center">{f.titulo}</MainH3>
              <p className="text-texto leading-relaxed">{f.descripcion}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Caracteristicas;
