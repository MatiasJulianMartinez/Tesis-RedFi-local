import { useEffect } from "react";
import { IconBook2, IconArrowLeft, IconSchool, IconCalendarWeek, IconTools } from "@tabler/icons-react";
import MainH1 from "../components/ui/MainH1";
import MainH2 from "../components/ui/MainH2";
import MainH3 from "../components/ui/MainH3";
import MainLinkButton from "../components/ui/MainLinkButton";
import ReseñasDestacadas from "../components/academia/reseñasDestacadas";

const AcademyHome = () => {
  useEffect(() => {
    document.title = "Red-Fi | Academia";
  }, []);
  const cursos = [
    {
      id: 1,
      titulo: "Como solucionar problemas de internet",
      descripcion:
        "Aprende a resolver fallas de conexión y mejorar la señal en tu hogar.",
      imagen: "/imgs/cursos/curso1.jpg",
    },
    {
      id: 2,
      titulo: "Como medir la velocidad de internet",
      descripcion:
        "Conoce cómo interpretar megas, ping y jitter en un test de velocidad.",
      imagen: "/imgs/cursos/curso2.jpg",
    },
    {
      id: 3,
      titulo: "Como elegir un proveedor de internet",
      descripcion:
        "Compara cobertura, atención y estabilidad para elegir bien.",
      imagen: "/imgs/cursos/curso3.jpg",
    },
  ];

  return (
    <section className="self-start py-16 px-4 sm:px-6 text-texto w-full">
      <div className="max-w-7xl mx-auto space-y-12">
        <div className="text-center mb-8">
          <MainH1 icon={IconBook2}>Academia Red-Fi</MainH1>
          <p className="text-lg">
            Aprende a mejorar tu experiencia con internet y redes.
          </p>
        </div>

        <div className="text-center mb-8">
          <MainH2 className="text-center justify-center">Ingresá a nuestros cursos</MainH2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-12">
          {cursos.map((curso) => (
            <MainLinkButton
              to={`/academy/curso${curso.id}`}
              key={curso.id}
              variant="curso"
              className="h-full hover:scale-105"
            >
              <img
                src={curso.imagen}
                alt={curso.titulo}
                className="w-full h-48 object-cover rounded-lg"
              />
              <div className="p-4 flex flex-col gap-2 flex-1">
                <MainH3 className="text-center justify-center">{curso.titulo}</MainH3>
                <p>{curso.descripcion}</p>
              </div>
            </MainLinkButton>
          ))}
        </div>

        <div className="text-center max-w-2xl mx-auto mb-6">
          <MainH2 className="text-center justify-center">¿Por qué elegir Red-Fi Academy?</MainH2>
          <p className="text-lg">
            En Red-Fi Academy te brindamos formación práctica y de calidad para
            que puedas mejorar tu experiencia con internet y redes.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-4 mb-12">
          <div className="bg-texto/5 border border-texto/15 shadow-lg p-4 rounded-lg">
            <MainH3 icon={IconSchool} className="text-center justify-center">Instructores expertos</MainH3>
            <p>
              Aprende con profesionales con experiencia real en la industria.
            </p>
          </div>
          <div className="bg-texto/5 border border-texto/15 shadow-lg p-4 rounded-lg">
            <MainH3 icon={IconCalendarWeek} className="text-center justify-center">Aprendizaje flexible</MainH3>
            <p>
              Estudia a tu ritmo desde cualquier dispositivo, en cualquier
              momento.
            </p>
          </div>
          <div className="bg-texto/5 border border-texto/15 shadow-lg p-4 rounded-lg">
            <MainH3 icon={IconTools} className="text-center justify-center">Contenido práctico</MainH3>
            <p>Aplica lo aprendido con ejercicios reales y casos concretos.</p>
          </div>
        </div>

        

        <ReseñasDestacadas />

        {/* Botón volver al perfil */}
        <div className="text-center">
          <MainLinkButton to="/cuenta" variant="secondary">
            <IconArrowLeft />
            Volver al perfil
          </MainLinkButton>
        </div>
      </div>
    </section>
  );
};

export default AcademyHome;
