import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { obtenerProveedorPorId } from "../services/proveedores/obtenerProveedor";
import {
  IconCarambola,
  IconCarambolaFilled,
  IconExternalLink,
  IconArrowLeft,
} from "@tabler/icons-react";
import MainH1 from "../components/ui/MainH1";
import MainH2 from "../components/ui/MainH2";
import MainLinkButton from "../components/ui/MainLinkButton";
import Avatar from "../components/ui/Avatar";
import Badge from "../components/ui/Badge";
import MainLoader from "../components/ui/MainLoader";

const Proveedores = () => {
  useEffect(() => {
    document.title = "Red-Fi | Proveedor";
  }, []);

  const { id } = useParams();
  const [proveedor, setProveedor] = useState(null);

  useEffect(() => {
    const fetchProveedor = async () => {
      const data = await obtenerProveedorPorId(id);
      setProveedor(data);
    };
    fetchProveedor();
  }, [id]);

  // Actualizar el título cuando se carga el proveedor
  useEffect(() => {
    if (proveedor?.nombre) {
      document.title = `Red-Fi | ${proveedor.nombre}`;
    }
  }, [proveedor]);

  if (!proveedor) {
    return (
      <div className="text-center text-texto mt-20">
        <MainLoader texto="Cargando proveedor..." size="large" />
      </div>
    );
  }

  const tecnologias =
    proveedor?.ProveedorTecnologia?.map((rel) => rel.tecnologias?.tecnologia) ||
    [];

  return (
    <section className="self-start py-16 px-4 sm:px-6 text-texto w-full">
      <div className="max-w-7xl mx-auto space-y-12 mb-8">
        {/* Info principal del proveedor */}
        <div className="bg-texto/5 border border-texto/15 rounded-2xl p-6 mb-10 shadow-lg text-center">
          {/* Avatar del proveedor */}
          <div className="flex justify-center mb-4">
            <Avatar
              fotoUrl={proveedor.logotipo}
              nombre={proveedor.nombre}
              size={20}
              className="rounded-full"
            />
          </div>

          {/* Nombre */}
          <MainH1>{proveedor.nombre}</MainH1>

          {/* Tecnologías */}
          <div className="mt-2">
            {tecnologias.length > 0 ? (
              <div className="flex flex-wrap justify-center gap-2">
                {tecnologias.map((tec, index) => (
                  <Badge
                    key={index}
                    variant="accent"
                    size="sm"
                  >
                    {tec}
                  </Badge>
                ))}
              </div>
            ) : (
              <p className="text-sm text-texto text-center">
                Tecnologías no especificadas
              </p>
            )}
          </div>

          {/* Descripción breve */}
          <p className="text-sm text-texto mt-4 max-w-xl mx-auto leading-relaxed">
            {proveedor.descripcion ||
              "Proveedor destacado en Corrientes por su cobertura, estabilidad y servicio al cliente. Red-Fi lo destaca por su presencia activa en múltiples zonas urbanas y rurales."}
          </p>

          {/* Botón sitio web */}
          <a
            href={proveedor.sitio_web || "https://www.google.com"}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center mt-6 px-5 py-2 bg-primario text-white hover:bg-[#336ef0] transition rounded-lg font-bold"
          >
            Visitar sitio oficial{" "}
            <IconExternalLink size={18} className="ml-2" />
          </a>
        </div>

        {/* Reseñas */}
        <div>
          <MainH2 className="text-center justify-center">
            Opiniones de usuarios
          </MainH2>

          {proveedor.reseñas && proveedor.reseñas.length > 0 ? (
            <div className="space-y-6">
              {proveedor.reseñas.map((r) => {
                const nombre = r.user?.nombre || "Usuario";
                const fotoUrl = r.user?.foto_url || null;

                const fecha = r.created_at
                  ? new Date(r.created_at).toLocaleDateString("es-AR", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })
                  : "Fecha desconocida";

                return (
                  <div
                    key={r.id}
                    className="bg-texto/5 border border-texto/15 p-5 rounded-xl flex flex-col gap-3"
                  >
                    {/* Usuario + estrellas */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Avatar
                          fotoUrl={fotoUrl}
                          nombre={nombre}
                          size={10}
                          className="rounded-full border border-acento"
                        />
                        <div>
                          <p className="font-medium text-texto">{nombre}</p>
                          <p className="text-xs text-texto">{fecha}</p>
                        </div>
                      </div>

                      <div className="flex gap-1 text-yellow-600 pl-2 bg-texto/5 font-bold px-3 py-1 rounded-full border border-texto/15">
                        {Array.from({ length: 5 }, (_, i) =>
                          i < r.estrellas ? (
                            <IconCarambolaFilled size={18} key={i} />
                          ) : (
                            <IconCarambola size={18} key={i} />
                          )
                        )}
                      </div>
                    </div>

                    {/* Comentario */}
                    <p className="text-texto leading-relaxed">
                      “{r.comentario}”
                    </p>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-texto text-center">
              Este proveedor aún no tiene reseñas.
            </p>
          )}
        </div>
      </div>
      {/* Botón volver al mapa */}
      <div className="text-center">
        <MainLinkButton to="/mapa" variant="secondary">
          <IconArrowLeft />
          Volver al mapa
        </MainLinkButton>
      </div>
    </section>
  );
};

export default Proveedores;
