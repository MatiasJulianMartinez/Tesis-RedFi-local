import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useRole } from "../context/RoleContext";
import { getPerfil } from "../services/perfil/getPerfil";
import { useAlerta } from "../context/AlertaContext";
import MainH1 from "../components/ui/MainH1";
import MainH2 from "../components/ui/MainH2";
import MainH3 from "../components/ui/MainH3";
import MainLinkButton from "../components/ui/MainLinkButton";
import MainLoader from "../components/ui/MainLoader";
import { IconUser, IconLoader2 } from "@tabler/icons-react";

const Cuenta = () => {
  const { usuario } = useAuth();
  const { loadingRole } = useRole();
  const location = useLocation();
  const [perfil, setPerfil] = useState(null);
  const [loading, setLoading] = useState(true);
  const { mostrarError, mostrarExito } = useAlerta();

  useEffect(() => {
    document.title = "Red-Fi | Mi Perfil";
  }, []);

  useEffect(() => {
    if (location.state?.alerta) {
      const { tipo, mensaje } = location.state.alerta;
      tipo === "exito" ? mostrarExito(mensaje) : mostrarError(mensaje);
    }
  }, [location.state]);

  useEffect(() => {
    const cargarPerfil = async () => {
      try {
        const data = await getPerfil();
        setPerfil(data);
      } catch (error) {
        mostrarError("No se pudo cargar el perfil de usuario.");
      } finally {
        setLoading(false);
      }
    };

    if (usuario) cargarPerfil();
  }, [usuario, mostrarError]);

  if (!usuario) {
    return (
      <p className="text-center mt-10 text-texto">No has iniciado sesión.</p>
    );
  }

  if (loading || loadingRole) {
    return <MainLoader texto="Cargando perfil..." size="large" />;
  }

  const nombre = perfil?.nombre || "Usuario";
  const foto = perfil?.foto_url || usuario?.user_metadata?.foto_perfil;
  const iniciales = nombre
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <section className="self-start py-16 px-4 sm:px-6 text-texto w-full">
      <div className="max-w-7xl mx-auto space-y-12">
        <div className="text-center mb-8">
          <MainH1 icon={IconUser}>Mi cuenta</MainH1>
          <p className="text-lg">
            Modificá tus datos personales y tus preferencias.
          </p>
        </div>

        <div className="w-full flex flex-col items-center">
          {foto ? (
            <img
              src={foto}
              alt="Foto de perfil"
              className="size-50 rounded-full object-cover border-4 border-texto/15 mx-auto mb-4 shadow-lg"
            />
          ) : (
            <div className="size-50 rounded-full bg-texto/5 border-4 border-texto/15 mx-auto mb-4 flex items-center justify-center shadow-lg">
              <span className="text-3xl font-bold text-texto">{iniciales}</span>
            </div>
          )}
          <MainH2 className="text-center justify-center">{nombre}</MainH2>
          <div className="flex flex-col sm:flex-row justify-center gap-3 mb-4">
            <p className="bg-texto/5 px-3 py-1 rounded-full border border-texto/15">
              {usuario.email}
            </p>
            <p className="bg-texto/5 font-bold px-3 py-1 rounded-full border border-texto/15">
              Usuario <span className="text-acento">{perfil.plan}</span>
            </p>
          </div>
        </div>

        {/* Acciones */}
        <div className="mx-auto mt-8 grid grid-cols-1 sm:grid-cols-2 gap-8">
          <div>
            <MainLinkButton to="/boletas" variant="card" isPremium={true}>
              <MainH3 className="text-center justify-center">
                Gestionar boletas
              </MainH3>
              <p>
                Visualize y administre sus boletas, reciba alertas antes del
                vencimiento y revise los aumentos mes a mes.
              </p>
            </MainLinkButton>
          </div>

          <div>
            <MainLinkButton to="/academy" variant="card" isPremium={true}>
              <MainH3 className="text-center justify-center">
                Red-Fi Academy
              </MainH3>
              <p>
                Accede a nuestros mini cursos gratuitos sobre redes, Wi-Fi y
                aprende a mejorar la calidad de tu conexión desde casa.
              </p>
            </MainLinkButton>
          </div>

          <div>
            <MainLinkButton to="/resenas" variant="card">
              <MainH3 className="text-center justify-center">
                Mis reseñas
              </MainH3>
              <p>
                Visualize y administre todas las reseñas que has publicado sobre
                diferentes proveedores.
              </p>
            </MainLinkButton>
          </div>

          <div>
            <MainLinkButton to="/editar-perfil" variant="card">
              <MainH3 className="text-center justify-center">
                Editar perfil
              </MainH3>
              <p>
                Actualice tanto su foto de perfil como su nombre completo y
                otros detalles importantes asociados a su cuenta de Red-Fi.
              </p>
            </MainLinkButton>
          </div>

          <div>
            <MainLinkButton to="/planes" variant="card">
              <MainH3 className="text-center justify-center">
                Gestionar plan
              </MainH3>
              <p>Gestione su plan y descubra nuestros beneficios.</p>
            </MainLinkButton>
          </div>

          <div>
            <MainLinkButton to="/glosario" variant="card" isPremium={true}>
              <MainH3 className="text-center justify-center">
                Glosario de redes
              </MainH3>
              <p>Buscá términos como IP, ping, latencia y más.</p>
            </MainLinkButton>
          </div>
        </div>

        {perfil.rol === "admin" && (
          <div className="max-w-7xl mx-auto mt-8 w-full">
            <MainLinkButton to="/admin" variant="cardAdmin">
              <MainH3 className="text-center justify-center">
                Gestionar Red-Fi
              </MainH3>
              <p>
                Accedé al panel de administración para gestionar usuarios,
                proveedores, reseñas y tecnologías.
              </p>
            </MainLinkButton>
          </div>
        )}
      </div>
    </section>
  );
};

export default Cuenta;
