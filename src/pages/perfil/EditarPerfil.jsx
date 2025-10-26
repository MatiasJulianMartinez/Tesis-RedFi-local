import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { IconUserEdit } from "@tabler/icons-react";
import { obtenerProveedores } from "../../services/proveedores/obtenerProveedor";
import { getPerfil } from "../../services/perfil/getPerfil";
import { updatePerfilYFoto } from "../../services/perfil/updatePerfil";

import MainH1 from "../../components/ui/MainH1";
import MainButton from "../../components/ui/MainButton";
import MainLinkButton from "../../components/ui/MainLinkButton";
import Input from "../../components/ui/Input";
import FileInput from "../../components/ui/FileInput";
import Select from "../../components/ui/Select";
import Avatar from "../../components/ui/Avatar";

import { useAlerta } from "../../context/AlertaContext";

const EditarPerfil = () => {
  const { usuario } = useAuth();
  const { mostrarError, mostrarExito } = useAlerta();

  const [form, setForm] = useState({
    nombre: "",
    proveedor_preferido: "",
    foto: null,
    eliminarFoto: false,
  });
  const [preview, setPreview] = useState(null);
  const [proveedores, setProveedores] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    document.title = "Red-Fi | Editar Perfil";
  }, []);

  useEffect(() => {
    const cargarDatos = async () => {
      if (!usuario) return;

      try {
        const perfilDB = await getPerfil();

        setForm({
          nombre: perfilDB?.nombre || usuario.user_metadata?.name || "",
          proveedor_preferido: perfilDB?.proveedor_preferido || "",
          foto: null,
        });

        setPreview(
          perfilDB?.foto_url || usuario.user_metadata?.foto_perfil || null
        );
      } catch (err) {
        mostrarError("Error al cargar el perfil.");
      }
    };

    const cargarProveedores = async () => {
      try {
        const data = await obtenerProveedores();
        setProveedores(data);
      } catch (error) {
        mostrarError("Error al cargar proveedores.");
      }
    };

    cargarDatos();
    cargarProveedores();
  }, [usuario]);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setForm({ ...form, foto: file });

    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setPreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await updatePerfilYFoto({ ...form, preview });
      mostrarExito("Perfil actualizado correctamente.");
    } catch (error) {
      mostrarError("Ocurrió un error inesperado: " + error.message);
      console.error("Error completo:", error);
    }

    setLoading(false);
  };

  return (
    <div className="w-full flex items-center justify-center px-4 py-16 relative">
      <div className="w-full max-w-lg">
        {/* Título */}
        <div className="w-full text-center mb-8">
          <MainH1 icon={IconUserEdit}>Editar perfil</MainH1>
          <p className="text-lg">Modificá tu información personal.</p>
        </div>

        {/* Card */}
        <div className="bg-secundario border border-secundario/50 shadow-lg rounded-lg p-6 max-w-lg mx-auto">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Avatar */}
            <div className="flex flex-col items-center gap-3">
              <Avatar fotoUrl={preview} nombre={form.nombre} size={30} />
              <FileInput
                id="foto"
                label="Foto de perfil"
                value={form.foto}
                onChange={(file) => {
                  setForm((prev) => ({
                    ...prev,
                    foto: file,
                    eliminarFoto: !file,
                  }));

                  if (file) {
                    const reader = new FileReader();
                    reader.onloadend = () => setPreview(reader.result);
                    reader.readAsDataURL(file);
                  } else {
                    setPreview(null);
                  }
                }}
                previewUrl={preview}
                setPreviewUrl={setPreview}
                disabled={loading}
                sinPreview={true}
              />
            </div>

            <Input
              label={
                <>
                  Nombre <span className="text-red-600">*</span>
                </>
              }
              name="nombre"
              value={form.nombre}
              onChange={handleChange}
              placeholder="Tu nombre completo"
              required
              disabled={loading}
            />

            <Select
              label="Proveedor actual"
              name="proveedor_preferido"
              value={form.proveedor_preferido}
              onChange={(value) =>
                setForm((prev) => ({ ...prev, proveedor_preferido: value }))
              }
              options={[
                { id: "", nombre: "Seleccionar proveedor" },
                ...proveedores,
              ]}
              getOptionValue={(p) => p.nombre}
              getOptionLabel={(p) => p.nombre}
              disabled={loading}
            />

            <div className="flex gap-3">
              <div className="flex-1">
                <MainLinkButton
                  type="button"
                  to="/cuenta"
                  disabled={loading}
                  variant="secondary"
                  className="w-full"
                >
                  Volver
                </MainLinkButton>
              </div>
              <MainButton
                type="submit"
                variant="primary"
                disabled={loading}
                className="flex-1"
                loading={loading}
              >
                {loading ? "Guardando..." : "Guardar"}
              </MainButton>
            </div>

            <div className="text-center mt-6">
              <p className="text-sm text-texto/50 italic">
                Los campos marcados con <span className="text-red-600">*</span>{" "}
                son obligatorios.
              </p>
            </div>
          </form>
        </div>

        {/* Link a cambio de contraseña */}
        <div className="text-center mt-6">
          <MainLinkButton
            to="/cambiar-contraseña"
            variant="secondary"
            disabled={loading}
          >
            Cambiar contraseña
          </MainLinkButton>
        </div>
      </div>
    </div>
  );
};

export default EditarPerfil;
