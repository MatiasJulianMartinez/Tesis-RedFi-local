const ModalContenedor = ({ 
  children, 
  onClose = null, 
  maxWidth = "max-w-xl",
  maxHeight = "max-h-[90vh]" // Parámetro para controlar altura máxima
}) => {
  return (
    /* Backdrop de pantalla completa con z-index alto */
    <div className="fixed inset-0 z-[10000] bg-black/60 flex items-center justify-center px-4 sm:px-6 pb-20 lg:pb-0">
      {/* Contenedor principal del modal con dimensiones configurables */}
      <div
        className={`bg-secundario border border-secundario/50 rounded-lg w-full ${maxWidth} ${maxHeight} overflow-visible flex flex-col text-texto relative`}
        onClick={(e) => e.stopPropagation()} // Previene cierre al hacer click en el modal
      >
        {/* Área de contenido con padding y flex-1 para ocupar espacio disponible */}
        <div className="flex-1 p-6">
          {children}
        </div>
      </div>
    </div>
  );
};

export default ModalContenedor;
