import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useRole } from "../../context/RoleContext";
import { crearPerfil } from "../../services/perfil/crearPerfil";
import { registerUser } from "../../services/authService";
import {
  IconUserPlus,
  IconLogin,
  IconMail,
  IconLock,
  IconUser,
  IconWifi,
} from "@tabler/icons-react";
import MainH1 from "../../components/ui/MainH1";
import MainButton from "../../components/ui/MainButton";
import MainLinkButton from "../../components/ui/MainLinkButton";
import Input from "../../components/ui/Input";
import Select from "../../components/ui/Select";
import { useTheme } from "../../context/ThemeContext";
import { obtenerProveedores } from "../../services/proveedores/obtenerProveedor";
import { useAlerta } from "../../context/AlertaContext";

const Register = () => {
  useEffect(() => {
    document.title = "Red-Fi | Registro";
  }, []);

  const [form, setForm] = useState({
    email: "",
    password: "",
    nombre: "",
    proveedor_preferido: "",
  });

  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { mostrarError, mostrarExito } = useAlerta();
  const { refrescarRol } = useRole();
  const { currentTheme } = useTheme();
  const [proveedores, setProveedores] = useState([]);
  const [loadingProveedores, setLoadingProveedores] = useState(true);

  useEffect(() => {
    const cargarProveedores = async () => {
      try {
        const data = await obtenerProveedores();
        const nombres = data.map((p) => p.nombre);
        setProveedores(nombres);
      } catch (err) {
        mostrarError("Error al cargar proveedores.");
      } finally {
        setLoadingProveedores(false);
      }
    };

    cargarProveedores();
  }, []);

  // Opciones para el select
  const opcionesProveedor = [
    { value: "", label: "Selecciona un proveedor" },
    ...proveedores.map((nombre) => ({ value: nombre, label: nombre })),
  ];

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const { email, password, nombre, proveedor_preferido } = form;

    try {
      await registerUser({ email, password });
    } catch (err) {
      mostrarError(err.message);
      setLoading(false);
      return;
    }

    try {
      const proveedorFinal =
        proveedor_preferido === "EMPTY" ? "" : proveedor_preferido;

      await crearPerfil({ nombre, proveedor_preferido: proveedorFinal });
      await refrescarRol();
      mostrarExito("Cuenta creada con éxito. Redirigiendo...");
      setTimeout(() => navigate("/cuenta"), 1500);
    } catch (err) {
      mostrarError(
        "El usuario fue registrado, pero falló la creación del perfil."
      );
      setLoading(false);
    }
  };

  return (
    <div className="w-full flex items-center justify-center px-4 py-16 relative">
      <div className="w-full max-w-md">
        <div className="w-full text-center mb-8">
          <MainH1 icon={IconUserPlus}>Crear cuenta</MainH1>
          <p className="text-lg">Únete a la comunidad de Red-Fi.</p>
        </div>

        <div
          className={`rounded-lg p-6 ${
            currentTheme === "light"
              ? "bg-secundario border border-secundario/50 shadow-lg"
              : "bg-texto/5 border border-texto/15"
          }`}
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label={
                <>
                  Correo electrónico <span className="text-red-600">*</span>
                </>
              }
              name="email"
              type="email"
              placeholder="tu@email.com"
              icon={IconMail}
              value={form.email}
              onChange={handleChange}
              required
            />
            <Input
              label={
                <>
                  Contraseña <span className="text-red-600">*</span>
                </>
              }
              name="password"
              type="password"
              placeholder="••••••••"
              icon={IconLock}
              value={form.password}
              onChange={handleChange}
              required
            />
            <Input
              label={
                <>
                  Nombre completo <span className="text-red-600">*</span>
                </>
              }
              name="nombre"
              placeholder="Tu nombre completo"
              icon={IconUser}
              value={form.nombre}
              onChange={handleChange}
              required
            />
            <Select
              label="Proveedor actual"
              name="proveedor_preferido"
              value={form.proveedor_preferido}
              onChange={(value) =>
                setForm({ ...form, proveedor_preferido: value })
              }
              options={opcionesProveedor}
              getOptionValue={(opt) => opt.value}
              getOptionLabel={(opt) => opt.label}
              loading={loadingProveedores}
            />

            <MainButton
              type="submit"
              variant="primary"
              className="w-full"
              loading={loading}
            >
              {loading ? "Creando cuenta..." : "Crear Cuenta"}
            </MainButton>
            <div className="text-center mt-6">
              <p className="text-sm text-texto/50 italic">
                Los campos marcados con <span className="text-red-600">*</span>{" "}
                son obligatorios.
              </p>
            </div>
          </form>
        </div>

        {/* Divider */}
        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-texto/15"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-fondo text-texto">¿Ya tienes cuenta?</span>
          </div>
        </div>

        <MainLinkButton to="/login" variant="secondary" className="w-full">
          <IconLogin size={24} />
          Iniciar sesión
        </MainLinkButton>

        <div className="text-center mt-6">
          <p className="text-xs text-texto">
            Al registrarte, aceptas nuestros términos y condiciones
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
