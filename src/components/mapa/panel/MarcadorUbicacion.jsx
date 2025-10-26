import { IconMapPin, IconCheck } from "@tabler/icons-react";

const MarcadorUbicacion = ({ coordenadas, zona, esValida }) => {
  if (!coordenadas) return null;

  return (
    <div className="absolute z-20 transform -translate-x-1/2 -translate-y-full">
      <div className={`relative ${esValida ? 'text-green-500' : 'text-red-500'}`}>
        {/* Marcador principal */}
        <div className={`w-8 h-8 rounded-full border-2 border-white shadow-lg flex items-center justify-center ${
          esValida ? 'bg-green-500' : 'bg-red-500'
        }`}>
          {esValida ? (
            <IconCheck size={16} className="text-white" />
          ) : (
            <IconMapPin size={16} className="text-white" />
          )}
        </div>
        
        {/* Información de la zona */}
        {zona && (
          <div className={`absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-1 rounded-lg text-xs font-medium text-white shadow-lg ${
            esValida ? 'bg-green-500' : 'bg-red-500'
          }`}>
            {zona.departamento}
            <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-current"></div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MarcadorUbicacion; 