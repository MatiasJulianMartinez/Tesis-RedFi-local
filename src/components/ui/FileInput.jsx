import { useRef, useState, useEffect } from "react";
import MainButton from "./MainButton";
import { IconX, IconFileTypePdf } from "@tabler/icons-react";

const FileInput = ({
  id = "archivo",
  label = "Seleccionar imagen",
  accept = "image/*, application/pdf",
  onChange,
  value = null,
  previewUrl = null,
  setPreviewUrl = null,
  onClear,
  disabled = false,
  loading = false,
  existingImage = null,
  sinPreview = false,
}) => {
  const inputRef = useRef(null);
  const [internalPreview, setInternalPreview] = useState(null);

  // Detecta si el archivo actual es un PDF
  const esPDF = (url) => {
    if (!url) return false;
    // Detecta URLs de blob (archivos temporales) o URLs que contienen .pdf
    return (
      url.toLowerCase().includes(".pdf") ||
      url.toLowerCase().includes("application/pdf") ||
      (url.startsWith("blob:") && value?.type === "application/pdf")
    );
  };

  // Extrae el nombre del archivo desde la URL o el objeto File
  const obtenerNombreArchivo = (url) => {
    if (!url) return "archivo.pdf";

    // Si es un blob URL y tenemos el archivo original, usar su nombre
    if (url.startsWith("blob:") && value?.name) {
      return value.name;
    }

    const nombreCompleto = url.split("/").pop() || url.split("\\").pop();
    return nombreCompleto || "archivo.pdf";
  };

  // Abre el archivo en una nueva pestaña del navegador
  const abrirArchivo = () => {
    if (internalPreview) {
      window.open(internalPreview, "_blank");
    }
  };

  // Inicializa el preview con URLs externas o imágenes existentes
  useEffect(() => {
    if (previewUrl) {
      setInternalPreview(previewUrl);
    } else if (existingImage) {
      setInternalPreview(existingImage);
    }
  }, [previewUrl, existingImage]);

  // Maneja la selección de archivos y genera preview según el tipo
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Resetea el value para permitir volver a elegir el mismo archivo
    if (inputRef.current) {
      inputRef.current.value = "";
    }

    onChange?.(file);

    if (!sinPreview) {
      // Para PDFs, crear URL temporal en lugar de base64
      if (file.type === "application/pdf") {
        const objectUrl = URL.createObjectURL(file);
        setInternalPreview(objectUrl);
        setPreviewUrl?.(objectUrl);
      } else {
        // Para imágenes, usar base64 como antes
        const reader = new FileReader();
        reader.onloadend = () => {
          setInternalPreview(reader.result);
          setPreviewUrl?.(reader.result);
        };
        reader.readAsDataURL(file);
      }
    }
  };

  // Limpia el archivo seleccionado y su preview
  const handleClear = () => {
    if (inputRef.current) {
      inputRef.current.value = "";
    }

    // Libera memoria de URL de objeto si existe
    if (internalPreview && internalPreview.startsWith("blob:")) {
      URL.revokeObjectURL(internalPreview);
    }

    onChange?.(null);
    setInternalPreview(null);
    if (!sinPreview) setPreviewUrl?.(null);
    onClear?.();
  };

  // Variables de control para el renderizado condicional
  const hayPreview = internalPreview;
  const mostrarPreview = !sinPreview && hayPreview;
  const mostrarBotonQuitar = value || hayPreview;

  return (
    <div className="space-y-2 text-center text-texto">
      {/* Label opcional del input */}
      {label && (
        <label htmlFor={id} className="block font-medium">
          {label}
        </label>
      )}

      {/* Input de archivo oculto */}
      <input
        id={id}
        ref={inputRef}
        type="file"
        accept={accept}
        className="hidden"
        onChange={handleFileChange}
        disabled={disabled || loading}
      />

      {/* Área de preview del archivo seleccionado */}
      {mostrarPreview && (
        <div className="mt-2 flex flex-col items-center gap-2">
          {esPDF(internalPreview) ? (
            // Preview para archivos PDF
            <div
              className="flex flex-col items-center gap-2 p-4 border border-texto/15 rounded-lg max-h-25 cursor-pointer hover:bg-texto/5 transition-colors"
              onClick={abrirArchivo}
              title="Click para abrir en nueva pestaña"
            >
              <IconFileTypePdf size={60} className="text-red-500" />
              <p className="text-xs text-center font-medium break-all max-w-xs">
                {obtenerNombreArchivo(internalPreview)}
              </p>
            </div>
          ) : (
            // Preview para imágenes
            <img
              src={internalPreview}
              alt="Imagen seleccionada"
              className="max-h-25 border border-texto/15 rounded-lg object-contain cursor-pointer hover:opacity-80 transition-opacity"
              onClick={abrirArchivo}
              title="Click para abrir en nueva pestaña"
            />
          )}
        </div>
      )}

      {/* Controles principales: botón quitar y seleccionar */}
      <div className="flex flex-col sm:flex-row gap-2 justify-center">
        {/* Botón para quitar archivo actual */}
        {mostrarBotonQuitar && (
          <div>
            <MainButton
              type="button"
              variant="danger"
              onClick={handleClear}
              className="flex-1"
              disabled={disabled || loading}
            >
              <IconX size={18} /> Quitar archivo
            </MainButton>
          </div>
        )}
        {/* Label que activa el input de archivo */}
        <label htmlFor={id}>
          <MainButton
            as="span"
            variant="accent"
            loading={loading}
            disabled={disabled}
            className="cursor-pointer flex-1"
          >
            {value || hayPreview ? "Cambiar archivo" : "Seleccionar archivo"}
          </MainButton>
        </label>
      </div>
    </div>
  );
};

export default FileInput;
