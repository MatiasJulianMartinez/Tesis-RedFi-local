import MainH2 from "../ui/MainH2";
import MainH3 from "../ui/MainH3";
import { useTheme } from "../../context/ThemeContext";

const preguntas = [
  {
    titulo: "¿Necesito habilitar la ubicación?",
    contenido:
      "No es obligatorio. También puedes buscar proveedores escribiendo manualmente tu zona.",
  },
  {
    titulo: "¿Cómo se validan las opiniones de usuarios?",
    contenido:
      "Las reseñas provienen exclusivamente de usuarios registrados. Si una reseña contiene insultos o fue escrita con mala intención, será eliminada.",
  },
  {
    titulo: "¿Red-Fi cobra por el servicio?",
    contenido:
      "No. Red-Fi es totalmente gratuito. Sin embargo, algunas funciones avanzadas como la carga y gestión de boletas, historial completo o navegación sin anuncios están disponibles solo para usuarios con cuenta Premium.",
  },
  {
    titulo: "¿Qué puedo hacer con las boletas?",
    contenido:
      "Puedes guardarlas para recibir notificaciones antes del vencimiento y ver si hubo aumentos en el monto mes a mes.",
  },
  {
    titulo: "¿Quiénes pueden dejar opiniones?",
    contenido:
      "Cualquier usuario registrado puede dejar una reseña sobre su experiencia con un proveedor de internet.",
  },
  {
    titulo: "¿Qué tipo de proveedores aparecen?",
    contenido:
      "Aparecen tanto grandes empresas como ISPs locales que operan en Corrientes. Vos decidís cuál te conviene más.",
  },
];

const PreguntasFrecuentes = () => {
  const { currentTheme } = useTheme();
  return (
    <section
      className={`py-16 px-4 sm:px-6 text-texto ${
        currentTheme === "light" ? "bg-secundario" : "bg-texto/5"
      }`}
    >
      <div className="max-w-7xl mx-auto">
        <MainH2 className="text-center justify-center">Preguntas frecuentes</MainH2>

        <div className="grid gap-16 sm:grid-cols-2">
          {preguntas.map((item, i) => (
            <div key={i} className="space-y-2">
              <MainH3 className="text-acento">{item.titulo}</MainH3>
              <p className="leading-relaxed">{item.contenido}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PreguntasFrecuentes;
