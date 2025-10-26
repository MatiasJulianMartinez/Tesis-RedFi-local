import MainButton from "../ui/MainButton";
import Select from "../ui/Select";

const TablaSelector = ({ tablas, tablaActual, setTablaActual }) => {
  return (
    <div className="mb-8">
      {/* Vista móvil - Select component */}
      <div className="lg:hidden">
        <Select
          label="Seleccionar tabla"
          value={tablaActual}
          onChange={setTablaActual}
          options={tablas}
          getOptionValue={(tabla) => tabla.id}
          getOptionLabel={(tabla) => tabla.label}
          className="text-sm font-bold"
        />
      </div>
      
      {/* Vista desktop - Botones */}
      <div className="hidden lg:flex justify-center gap-2 flex-wrap">
        {tablas.map((t) => (
          <MainButton
            key={t.id}
            onClick={() => setTablaActual(t.id)}
            variant={tablaActual === t.id ? "accent" : "secondary"}
          >
            {t.label}
          </MainButton>
        ))}
      </div>
    </div>
  );
};

export default TablaSelector;
