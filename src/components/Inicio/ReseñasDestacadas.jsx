import { IconCarambolaFilled, IconCarambola } from "@tabler/icons-react";
import MainH2 from "../ui/MainH2";
import { useTheme } from "../../context/ThemeContext";

const reseñas = [
  {
    nombre: "Juan P.",
    comentario:
      "Red-Fi me ayudó muchísimo a elegir el proveedor ideal para mi zona. La plataforma es clara y fácil de usar.",
    estrellas: 5,
    imagen: "/imgs/avatars/reseñas/juan.jpg",
  },
  {
    nombre: "Ana G.",
    comentario:
      "Muy útil para comparar proveedores. Sería genial si más personas dejaran reseñas, pero la idea es excelente.",
    estrellas: 4,
    imagen: "/imgs/avatars/reseñas/ana.jpg",
  },
  {
    nombre: "Martin M.",
    comentario:
      "No encontraba buen internet en mi zona hasta que conocí Red-Fi. Me sirvió mucho el mapa y los comentarios de otros.",
    estrellas: 5,
    imagen: "/imgs/avatars/reseñas/martin.jpg",
  },
  {
    nombre: "Agustina M.",
    comentario:
      "Me gusta el diseño y lo intuitiva que es la página. A veces algunas zonas tardan en cargar, pero en general funciona bien.",
    estrellas: 4,
    imagen: "/imgs/avatars/reseñas/agustina.jpg",
  },
  {
    nombre: "Sofía T.",
    comentario:
      "Excelente iniciativa. Es justo lo que necesitábamos en Corrientes para elegir mejor a quién contratar.",
    estrellas: 5,
    imagen: "/imgs/avatars/reseñas/sofia.jpg",
  },
  {
    nombre: "Lucas R.",
    comentario:
      "Buena plataforma. Las reseñas de otros me dieron más seguridad para contratar. Recomendado.",
    estrellas: 5,
    imagen: "/imgs/avatars/reseñas/lucas.jpg",
  },
];

const ReseñasDestacadas = () => {
  const { currentTheme } = useTheme();
  return (
    <section className="py-16 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto text-center">
        <MainH2 className="text-center justify-center">Reseñas destacadas</MainH2>

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-8">
          {reseñas.map((r, i) => (
            <div
              key={i}
              className={`flex flex-col items-center backdrop-blur-md p-6 rounded-lg text-center transition-transform transform hover:scale-105 ${
                currentTheme === "light"
                  ? "bg-secundario border border-secundario/50 shadow-lg"
                  : "bg-texto/5 border border-texto/15"
              }`}
            >
              <img
                src={r.imagen}
                alt={r.nombre}
                className="w-24 h-24 rounded-full object-cover border border-texto/15 mb-3"
              />
              <p className="text-acento font-bold mb-2">{r.nombre}</p>

              <p className="text-texto mb-4">{r.comentario}</p>

              <div className="flex gap-1 text-yellow-600 justify-center bg-texto/5 font-bold px-3 py-1 rounded-full border border-texto/15">
                {Array.from({ length: 5 }, (_, idx) =>
                  idx < r.estrellas ? (
                    <IconCarambolaFilled size={14} key={idx} />
                  ) : (
                    <IconCarambola size={14} key={idx} />
                  )
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ReseñasDestacadas;
