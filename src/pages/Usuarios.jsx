// src/pages/Usuarios.jsx
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { obtenerPerfilPorId } from "../services/perfil/getPerfil";
import {
  IconCarambola,
  IconCarambolaFilled,
  IconExternalLink,
} from "@tabler/icons-react";
import MainH1 from "../components/ui/MainH1";
import MainH2 from "../components/ui/MainH2";
import Avatar from "../components/ui/Avatar";
import MainLoader from "../components/ui/MainLoader";

const Usuarios = () => {
  const { id } = useParams();
  const [perfil, setPerfil] = useState(null);

  useEffect(() => {
    const fetchPerfil = async () => {
      const data = await obtenerPerfilPorId(id);
      setPerfil(data);
    };
    fetchPerfil();
  }, [id]);
  

  if (!perfil) {
    return (
      <div className="text-center text-texto mt-20">
        <MainLoader texto="Cargando perfil..." size="large" />
      </div>
    );
  }

  const { nombre, foto_url, proveedor_preferido, rol, plan, reseñas } = perfil;

  

  return (
    <section className="self-start py-16 px-4 sm:px-6 text-texto w-full">
      <div className="max-w-7xl mx-auto space-y-12">
        {/* Info del usuario */}
        <div className="bg-texto/5 border border-texto/15 rounded-2xl p-6 mb-10 shadow-lg text-center">
          {/* Avatar */}
          <div className="flex justify-center mb-4">
            <Avatar fotoUrl={foto_url} nombre={nombre} size={50} />
          </div>

          {/* Nombre */}
          <MainH1>{nombre}</MainH1>

          {/* Proveedor preferido */}
          <p className="text-texto mt-2">
            Proveedor preferido:{" "}
            <span className="font-bold text-texto">
              {proveedor_preferido || "No especificado"}
            </span>
          </p>

          {/* Rol y Plan */}
          <div className="flex justify-center gap-3 mt-4">
            <span className="bg-texto/5 text-sm px-3 py-1 rounded-full border border-texto/15">
              Rol: <span className="font-semibold text-acento">{rol}</span>
            </span>
            <span className="bg-texto/5 text-sm px-3 py-1 rounded-full border border-texto/15">
              Plan: <span className="font-semibold text-acento">{plan}</span>
            </span>
          </div>
        </div>

        {/* Reseñas del usuario */}
        <div>
          <MainH2 className="text-center justify-center">Reseñas publicadas</MainH2>

          {reseñas && reseñas.length > 0 ? (
            <ul className="space-y-6">
              {reseñas.map((r) => {
                const fecha = r.created_at
                  ? new Date(r.created_at).toLocaleDateString("es-AR", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })
                  : "Fecha desconocida";

                return (
                  <li
                    key={r.id}
                    className="bg-texto/5 border border-texto/15 p-5 rounded-xl flex flex-col gap-3"
                  >
                    <div className="flex justify-between items-center">
                      <p className="font-medium text-texto">
                        
                        {r.proveedor_id?.nombre || "Proveedor desconocido"}
                      </p>
                      <div className="flex gap-1 text-yellow-600 bg-texto/5 font-bold px-3 py-1 rounded-full border border-texto/15">
                        {Array.from({ length: 5 }, (_, i) =>
                          i < r.estrellas ? (
                            <IconCarambolaFilled key={i} size={18} />
                          ) : (
                            <IconCarambola key={i} size={18} />
                          )
                        )}
                      </div>
                    </div>

                    <p className="text-sm text-texto">{fecha}</p>

                    <p className="text-texto leading-relaxed">
                      “{r.comentario}”
                    </p>
                  </li>
                );
              })}
            </ul>
          ) : (
            <p className="text-texto text-center">
              Este usuario aún no ha publicado reseñas.
            </p>
          )}
        </div>
      </div>
    </section>
  );
};

export default Usuarios;
