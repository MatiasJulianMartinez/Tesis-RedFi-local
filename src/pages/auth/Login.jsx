import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  IconLogin,
  IconUserPlus,
  IconMail,
  IconLock,
} from "@tabler/icons-react";
import { loginUser } from "../../services/authService";

import MainH1 from "../../components/ui/MainH1";
import MainButton from "../../components/ui/MainButton";
import MainLinkButton from "../../components/ui/MainLinkButton";
import Input from "../../components/ui/Input";

import { useAlerta } from "../../context/AlertaContext";
import { useTheme } from "../../context/ThemeContext";

const Login = () => {
  useEffect(() => {
    document.title = "Red-Fi | Login";
  }, []);

  const { currentTheme } = useTheme();
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { mostrarError } = useAlerta();

  const from = location.state?.from?.pathname || "/cuenta";

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await loginUser(form);
      navigate(from);
    } catch (err) {
      mostrarError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full bg-fondo flex items-center justify-center px-4 py-16 relative">
      <div className="w-full max-w-md">
        {/* Título */}
        <div className="w-full text-center mb-8">
          <MainH1 icon={IconLogin}>Iniciar sesión</MainH1>
          <p className="text-lg">Accede a tu cuenta para continuar.</p>
        </div>

        {/* Formulario */}
        <div className={`rounded-lg p-6
        ${
          currentTheme === "light"
            ? "bg-secundario border border-secundario/50 shadow-lg"
            : "bg-texto/5 border border-texto/15"
        } `}
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Correo electrónico"
              name="email"
              type="email"
              placeholder="tu@email.com"
              value={form.email}
              onChange={handleChange}
              required
              icon={IconMail}
            />
            <Input
              label="Contraseña"
              name="password"
              type="password"
              placeholder="••••••••"
              value={form.password}
              onChange={handleChange}
              required
              icon={IconLock}
            />
            <MainButton
              type="submit"
              variant="primary"
              className="w-full"
              loading={loading}
            >
              {loading ? "Iniciando sesión..." : "Iniciar Sesión"}
            </MainButton>
          </form>
        </div>

        {/* Divider */}
        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-texto/15"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-fondo text-texto">
              ¿No tienes cuenta?
            </span>
          </div>
        </div>

        {/* Registro */}
        <MainLinkButton to="/register" variant="secondary" className="w-full">
          <IconUserPlus size={24} />
          Crear nueva cuenta
        </MainLinkButton>

        <div className="text-center mt-6">
          <p className="text-xs text-texto">
            Al iniciar sesión, aceptas nuestros términos y condiciones.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
