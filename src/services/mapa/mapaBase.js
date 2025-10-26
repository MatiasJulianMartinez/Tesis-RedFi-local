import maplibregl from "maplibre-gl";

export const estaEnCorrientes = (lng, lat, bounds) => {
  return (
    lng >= bounds.west &&
    lng <= bounds.east &&
    lat >= bounds.south &&
    lat <= bounds.north
  );
};

export const crearMapaBase = (mapContainer, bounds) => {
  return new maplibregl.Map({
    container: mapContainer,
    style:
      "https://api.maptiler.com/maps/streets-v2-dark/style.json?key=911tGzxLSAMvhDUnyhXL",
    center: [-58.78, -27.4825],
    zoom: 12,
    maxBounds: bounds,
    attributionControl: false,
  });
};

export const getVisible = (prov, filtros) => {
  if (!filtros) return true;

  // Filtro por proveedor
  if (
    filtros.proveedor &&
    filtros.proveedor.id &&
    String(prov.id) !== String(filtros.proveedor.id)
  )
    return false;

  // Filtro por zona
  const tieneZona =
    !filtros.zona ||
    !filtros.zona.id ||
    prov.ZonaProveedor?.some(
      (rel) => String(rel.zonas?.id) === String(filtros.zona.id)
    );
  if (!tieneZona) return false;

  // Filtro por tecnología
  const tieneTecnologia =
    !filtros.tecnologia ||
    prov.ProveedorTecnologia?.some(
      (rel) => rel.tecnologias?.tecnologia === filtros.tecnologia
    );
  if (!tieneTecnologia) return false;

  return true;
};

export const getVisiblePorZona = (prov, zonaId, filtros) => {
  if (!filtros) return true;

  // Filtro por proveedor
  if (
    filtros.proveedor &&
    filtros.proveedor.id &&
    String(prov.id) !== String(filtros.proveedor.id)
  )
    return false;

  // Filtro por zona (debe coincidir con esta zona en particular)
  if (
    filtros.zona &&
    filtros.zona.id &&
    String(zonaId) !== String(filtros.zona.id)
  )
    return false;

  // Filtro por tecnología
  const tieneTecnologia =
    !filtros.tecnologia ||
    prov.ProveedorTecnologia?.some(
      (rel) => rel.tecnologias?.tecnologia === filtros.tecnologia
    );
  if (!tieneTecnologia) return false;

  return true;
};
