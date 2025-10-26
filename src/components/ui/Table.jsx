import classNames from "classnames";
import { useTheme } from "../../context/ThemeContext";

const Table = ({ columns = [], data = [], className = "" }) => {
  const { currentTheme } = useTheme();

  return (
    <>
      {/* Vista de escritorio - Tabla tradicional con diseño responsivo para pantallas grandes */}
      <div
        className={classNames(
          "hidden lg:block backdrop-blur-md bg-secundario border border-secundario/50 shadow-lg rounded-lg overflow-hidden",
          className
        )}
      >
        <table className="w-full">
          {/* Encabezado de la tabla con estilos diferenciados */}
          <thead className="bg-texto/5">
            <tr>
              {columns.map((col) => (
                <th
                  key={col.id}
                  className="px-6 py-4 text-left text-sm font-bold text-texto uppercase tracking-wider"
                >
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          {/* Cuerpo de la tabla con separadores entre filas */}
          <tbody className="divide-y divide-texto/10">
            {/* Manejo del estado vacío */}
            {data.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length}
                  className="px-6 py-4 text-center text-texto"
                >
                  No hay datos para mostrar.
                </td>
              </tr>
            ) : (
              /* Renderizado de datos con soporte para celdas personalizadas */
              data.map((row, rowIndex) => (
                <tr key={row.id || rowIndex}>
                  {columns.map((col) => (
                    <td
                      key={col.id}
                      className={classNames(
                        "px-6 py-4 text-texto text-sm font-semibold"
                      )}
                    >
                      {/* Permite renderizado personalizado de celdas o valor directo */}
                      {typeof col.renderCell === "function"
                        ? col.renderCell(row, rowIndex)
                        : row[col.id]}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Vista móvil - Cards responsivas que reemplazan la tabla en pantallas pequeñas */}
      <div className="lg:hidden space-y-4">
        {/* Estado vacío para vista móvil */}
        {data.length === 0 ? (
          <div
            className={classNames(
              "backdrop-blur-md bg-secundario border border-secundario/50 shadow-lg rounded-lg p-6 text-center text-texto",
              className
            )}
          >
            No hay datos para mostrar.
          </div>
        ) : (
          /* Convierte cada fila en una card individual */
          data.map((row, rowIndex) => (
            <div
              key={row.id || rowIndex}
              className={classNames(
                "backdrop-blur-md bg-secundario border border-secundario/50 shadow-lg rounded-lg p-4 space-y-3",
                className
              )}
            >
              {columns.map((col) => {
                // Manejo especial: excluye la columna de acciones del flujo normal
                if (col.id === "acciones") return null;

                // Obtiene el contenido de la celda (personalizado o directo)
                const cellContent =
                  typeof col.renderCell === "function"
                    ? col.renderCell(row, rowIndex)
                    : row[col.id];

                return (
                  /* Estructura de campo en formato vertical para móvil */
                  <div key={col.id} className="flex flex-col space-y-1">
                    <div className="text-xs font-bold text-texto/75 uppercase tracking-wider">
                      {col.label}
                    </div>
                    <div className="text-sm font-semibold text-texto">
                      {cellContent || "—"}
                    </div>
                  </div>
                );
              })}

              {/* Sección especial para acciones al final de cada card */}
              {columns.find((col) => col.id === "acciones") && (
                <div className="flex flex-col space-y-1 pt-2 border-t border-texto/10">
                  <div className="text-xs font-bold text-texto/75 uppercase tracking-wider">
                    Acciones
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {/* Renderiza botones de acción con layout flexible */}
                    {columns
                      .find((col) => col.id === "acciones")
                      .renderCell(row, rowIndex)}
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </>
  );
};

export default Table;
