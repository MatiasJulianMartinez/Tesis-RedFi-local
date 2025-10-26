import { obtenerProveedores } from "../proveedores/obtenerProveedor";
import { getVisible, getVisiblePorZona } from "./mapaBase";
import maplibregl from "maplibre-gl";

// Utilidad para calcular centroide de una zona
const calcularCentroide = (geom) => {
  const coords = geom.coordinates?.[0];
  if (!coords) return null;
  let x = 0,
    y = 0;
  coords.forEach(([lng, lat]) => {
    x += lng;
    y += lat;
  });
  return [x / coords.length, y / coords.length];
};

export const cargarProveedoresEnMapa = async (
  map,
  filtros,
  setProveedorActivo,
  onZonaMultiProveedorClick = null
) => {
  const proveedores = await obtenerProveedores();
  // Removemos la lógica de asignar visible globalmente ya que ahora lo evaluamos por zona
  const proveedoresConEstado = proveedores;

  const zonasConProveedores = new Map();

  // Primera pasada: agrupar proveedores por zona
  for (const prov of proveedoresConEstado) {
    if (!prov.ZonaProveedor || prov.ZonaProveedor.length === 0) continue;

    for (const relacionZona of prov.ZonaProveedor) {
      const zona = relacionZona.zonas;
      if (!zona || !zona.geom) continue;

      // Agrupar por zona
      if (!zonasConProveedores.has(zona.id)) {
        zonasConProveedores.set(zona.id, {
          zona,
          proveedores: [],
        });
      }
      zonasConProveedores.get(zona.id).proveedores.push(prov);
    }
  }

  
  // Colección de marcadores "+N" para zonas con múltiples proveedores
  const multiMarkers = [];
// Segunda pasada: renderizar cada zona con todos sus proveedores
  for (const [zonaId, zonaInfo] of zonasConProveedores) {
    const { zona, proveedores: proveedoresEnZona } = zonaInfo;
    
    // Filtrar proveedores visibles específicamente para esta zona
    const proveedoresVisibles = proveedoresEnZona.filter(p => 
      getVisiblePorZona(p, zonaId, filtros)
    );
    if (proveedoresVisibles.length === 0) continue;

// Agregar marcador "+N" si hay más de un proveedor visible
if (proveedoresVisibles.length > 1) {
  const centro = calcularCentroide(zona.geom);
  if (centro) {
    multiMarkers.push({
      type: "Feature",
      geometry: { type: "Point", coordinates: centro },
      properties: {
        zonaId: zonaId,
        count: proveedoresVisibles.length
      }
    });
  }
}


    const sourceId = `zona-${zonaId}`;
    
    // Limpiar capas existentes si ya existen
    const existingLayers = map.getStyle().layers.filter(layer => 
      layer.id.startsWith(`fill-${zonaId}`) || layer.id.startsWith(`line-border-${zonaId}`)
    );
    existingLayers.forEach(layer => {
      if (map.getLayer(layer.id)) {
        map.removeLayer(layer.id);
      }
    });
    
    // Limpiar source si existe
    if (map.getSource(sourceId)) {
      map.removeSource(sourceId);
    }
    
    // Agregar source
    map.addSource(sourceId, {
      type: "geojson",
      data: { type: "Feature", geometry: zona.geom, properties: { zonaId } },
    });

    // Renderizar primer proveedor como relleno base
    const primerProveedor = proveedoresVisibles[0];
    const fillLayerId = `fill-${zonaId}`;
    
    map.addLayer({
      id: fillLayerId,
      type: "fill",
      source: sourceId,
      paint: {
        "fill-color": primerProveedor.color || "#888888",
        "fill-opacity": 0.4,
      },
      layout: {
        visibility: "visible",
      },
    });

    // Renderizar proveedores adicionales como bordes con grosor uniforme
    for (let i = 1; i < proveedoresVisibles.length; i++) {
      const proveedor = proveedoresVisibles[i];
      const lineLayerId = `line-border-${zonaId}-${i}`;
      
      // Grosor uniforme de 4px para todos los bordes
      const lineWidth = 2;
      // Para crear el efecto "contraído", usamos offset negativo
      const offsetDistance = -(i * 2); // -2px, -4px, -6px... hacia adentro
      
      map.addLayer({
        id: lineLayerId,
        type: "line",
        source: sourceId,
        paint: {
          "line-color": proveedor.color || "#888888",
          "line-width": lineWidth,
          "line-opacity": 0.9,
          "line-offset": offsetDistance, // Offset hacia adentro para crear contracción
        },
        layout: {
          visibility: "visible",
        },
      });
    }

    // Eventos de hover para la zona
    let popup = new maplibregl.Popup({
      closeButton: false,
      closeOnClick: false,
      offset: 10,
    });
    let popupTimeout = null;
    let lastMouseMove = null;

    map.on("mouseenter", fillLayerId, () => {
      if (window.modoSeleccionActivo) return;
      map.getCanvas().style.cursor = "pointer";
      map.setPaintProperty(fillLayerId, "fill-opacity", 0.6);
    });

    map.on("mousemove", fillLayerId, (e) => {
      if (window.modoSeleccionActivo) return;
      lastMouseMove = Date.now();
      clearTimeout(popupTimeout);

      popupTimeout = setTimeout(() => {
        const quiet = Date.now() - lastMouseMove >= 350;
        if (quiet && !window.modoSeleccionActivo) {
          if (proveedoresVisibles.length > 1) {
            const contenido = proveedoresVisibles
              .map(
                (p) =>
                  `<div><span style="color:${p.color}">⬤</span> ${p.nombre}</div>`
              )
              .join("");
            popup
              .setLngLat(e.lngLat)
              .setHTML(`<strong>Proveedores:</strong><br>${contenido}`)
              .addTo(map);
          } else {
            popup
              .setLngLat(e.lngLat)
              .setHTML(
                `<div class="text-sm font-semibold">${primerProveedor.nombre}</div>`
              )
              .addTo(map);
          }
        }
      }, 350);

      // Si ya está visible, seguirlo con el mouse
      if (popup.isOpen()) {
        popup.setLngLat(e.lngLat);
      }
    });

    map.on("mouseleave", fillLayerId, () => {
      if (window.modoSeleccionActivo) return;
      map.getCanvas().style.cursor = "";
      map.setPaintProperty(fillLayerId, "fill-opacity", 0.4);
      clearTimeout(popupTimeout);
      popup.remove();
    });
  }

  // Handler global de click
  
  // === Marcadores de "multi proveedor" (+N) ===
  const multiSourceId = "multi-zona-markers";
  const multiData = {
    type: "FeatureCollection",
    features: multiMarkers
  };

  if (map.getSource(multiSourceId)) {
    map.getSource(multiSourceId).setData(multiData);
  } else if (multiMarkers.length > 0) {
    map.addSource(multiSourceId, {
      type: "geojson",
      data: multiData
    });

    // Círculo de fondo
    map.addLayer({
      id: "multi-markers-bg",
      type: "circle",
      source: multiSourceId,
      paint: {
        "circle-radius": 14,
        "circle-color": "rgba(0,0,0,0.75)",
        "circle-stroke-color": "#ffffff",
        "circle-stroke-width": 2
      }
    });

    // Texto "+N"
    map.addLayer({
      id: "multi-markers-text",
      type: "symbol",
      source: multiSourceId,
      layout: {
        "text-field": "+{count}",
        "text-size": 12,
        "text-font": ["Open Sans Bold", "Arial Unicode MS Bold"],
        "text-allow-overlap": true
      },
      paint: {
        "text-color": "#ffffff"
      }
    });

    const markerClick = (e) => {
      const features = map.queryRenderedFeatures(e.point, { layers: ["multi-markers-bg", "multi-markers-text"] });
      const f = features && features[0];
      if (!f) return;
      const zonaId = f.properties.zonaId;
      const zonaInfo = zonasConProveedores.get(zonaId);
      if (!zonaInfo) return;

      const proveedoresVisibles = zonaInfo.proveedores.filter(p => 
        getVisiblePorZona(p, zonaId, filtros)
      );
      if (proveedoresVisibles.length > 1 && onZonaMultiProveedorClick) {
        onZonaMultiProveedorClick(proveedoresVisibles, zonaInfo.zona);
      } else if (proveedoresVisibles.length === 1) {
        setProveedorActivo(proveedoresVisibles[0]);
      }
    };

    map.on("click", "multi-markers-bg", markerClick);
    map.on("click", "multi-markers-text", markerClick);
  }
const handleGlobalClick = (e) => {
    if (window.modoSeleccionActivo) return;
    
    // Buscar todas las features en el punto clickeado
    const features = map.queryRenderedFeatures(e.point);
    
    // Si hay reseñas, dejar que useMapaInteractivo las maneje
    const reseñaFeature = features.find(f => f.layer.id === "reseñas-layer");
    if (reseñaFeature) return;
    
    // Filtrar solo las features de zonas de proveedores
    const zonaFeatures = features.filter(feature => {
      const layerId = feature.layer.id;
      return layerId.startsWith('fill-') && feature.layer.layout?.visibility !== 'none';
    });

    if (zonaFeatures.length === 0) return;
    
    // Obtener la zona clickeada
    const zonaFeature = zonaFeatures[0];
    const zonaId = zonaFeature.properties.zonaId;
    const zonaInfo = zonasConProveedores.get(zonaId);
    
    if (!zonaInfo) return;
    
    const proveedoresVisibles = zonaInfo.proveedores.filter(p => 
      getVisiblePorZona(p, zonaId, filtros)
    );
    
    // Si hay múltiples proveedores, usar el callback especial
    if (proveedoresVisibles.length > 1 && onZonaMultiProveedorClick) {
      if (window.zonaMultipleHandled) return;
      
      window.zonaMultipleHandled = true;
      setTimeout(() => {
        window.zonaMultipleHandled = false;
      }, 100);
      
      onZonaMultiProveedorClick(proveedoresVisibles, zonaInfo.zona);
      return;
    }
    
    // Si solo hay un proveedor, abrir modal individual
    if (proveedoresVisibles.length === 1) {
      setProveedorActivo(proveedoresVisibles[0]);
    }
  };
  
  // Remover event listener anterior si existe
  map.off('click', handleGlobalClick);
  // Agregar el nuevo event listener
  map.on('click', handleGlobalClick);

  return proveedoresConEstado;
};

export const actualizarVisibilidadEnMapa = (map, proveedoresRef, filtros) => {
  // Esta función actualiza la visibilidad de las capas existentes basado en los filtros
  const zonasActualizadas = new Map();
  
  proveedoresRef.current.forEach((prov) => {
    if (!prov.ZonaProveedor || prov.ZonaProveedor.length === 0) return;

    prov.ZonaProveedor.forEach((relacionZona) => {
      const zona = relacionZona.zonas;
      if (!zona) return;

      // Verificar si necesitamos actualizar esta zona
      const zonaId = zona.id;
      if (!zonasActualizadas.has(zonaId)) {
        zonasActualizadas.set(zonaId, true);
        
        // Actualizar visibilidad de las capas de la zona
        const fillLayerId = `fill-${zonaId}`;
        if (map.getLayer(fillLayerId)) {
          // Verificar si algún proveedor en esta zona sigue visible usando filtros específicos de zona
          const proveedoresZona = proveedoresRef.current.filter(p => 
            p.ZonaProveedor?.some(rz => rz.zonas?.id === zonaId)
          );
          const algunoVisible = proveedoresZona.some(p => getVisiblePorZona(p, zonaId, filtros));
          
          map.setLayoutProperty(fillLayerId, "visibility", algunoVisible ? "visible" : "none");
          
          // También actualizar las capas de borde
          for (let i = 1; i <= 10; i++) { // Máximo 10 proveedores por zona
            const lineLayerId = `line-border-${zonaId}-${i}`;
            if (map.getLayer(lineLayerId)) {
              map.setLayoutProperty(lineLayerId, "visibility", algunoVisible ? "visible" : "none");
            }
          }
        }
      }
    });
  
  // Actualizar/crear la capa de marcadores "+N"
  try {
    const zonasConProveedores = new Map();
    // Agrupar por zona
    proveedoresRef.current.forEach((prov) => {
      if (!prov.ZonaProveedor) return;
      prov.ZonaProveedor.forEach((rel) => {
        const zona = rel.zonas;
        if (!zona || !zona.geom) return;
        if (!zonasConProveedores.has(zona.id)) {
          zonasConProveedores.set(zona.id, { zona, proveedores: [] });
        }
        zonasConProveedores.get(zona.id).proveedores.push(prov);
      });
    });

    const features = [];
    for (const [zonaId, zonaInfo] of zonasConProveedores) {
      const proveedoresVisibles = zonaInfo.proveedores.filter(p => 
        getVisiblePorZona(p, zonaId, filtros)
      );
      if (proveedoresVisibles.length > 1) {
        const centro = calcularCentroide(zonaInfo.zona.geom);
        if (centro) {
          features.push({
            type: "Feature",
            geometry: { type: "Point", coordinates: centro },
            properties: { zonaId, count: proveedoresVisibles.length }
          });
        }
      }
    }

    const multiSourceId = "multi-zona-markers";
    const data = { type: "FeatureCollection", features };

    if (map.getSource(multiSourceId)) {
      map.getSource(multiSourceId).setData(data);
    } else if (features.length > 0) {
      map.addSource(multiSourceId, { type: "geojson", data });

      map.addLayer({
        id: "multi-markers-bg",
        type: "circle",
        source: multiSourceId,
        paint: {
          "circle-radius": 14,
          "circle-color": "rgba(0,0,0,0.75)",
          "circle-stroke-color": "#ffffff",
          "circle-stroke-width": 2
        }
      });

      map.addLayer({
        id: "multi-markers-text",
        type: "symbol",
        source: multiSourceId,
        layout: {
          "text-field": "+{count}",
          "text-size": 12,
          "text-font": ["Open Sans Bold", "Arial Unicode MS Bold"],
          "text-allow-overlap": true
        },
        paint: {
          "text-color": "#ffffff"
        }
      });
    }
  } catch(e) {
    // Ignorar errores menores si el mapa aún no terminó de cargar las capas
  }
});
};

export const obtenerProveedoresPorZona = (zona, proveedores, filtros) => {
  if (!zona || !proveedores) return [];

  const proveedoresEnZona = proveedores
    .filter((prov) => {
      if (!prov.ZonaProveedor || prov.ZonaProveedor.length === 0) return false;

      const tieneZona = prov.ZonaProveedor.some(
        (relacionZona) => relacionZona.zonas?.id === zona.id
      );

      if (!tieneZona) return false;

      const filtrosPorZonas = filtros?.zonas?.length > 0;
      const zonasVisibles = getVisiblePorZona(filtros);

      if (filtrosPorZonas) {
        // Caso especial: estamos buscando zonas específicas y queremos mostrar solo los proveedores de esas zonas
        return zonasVisibles.some((zv) => zv.zona.id === zona.id);
      }

      return true;
    })
    .filter((prov) => prov);

  return proveedoresEnZona;
};

export const limpiarCapasProveedores = (map) => {
  const layers = map.getStyle().layers;
  layers.forEach((layer) => {
    if (
      layer.id.startsWith("fill-") ||
      layer.id.startsWith("line-") || layer.id.startsWith("multi-markers")
    ) {
      map.removeLayer(layer.id);
    }
  });

  const sources = Object.keys(map.getStyle().sources);
  sources.forEach((sourceId) => {
    if (sourceId.startsWith("zona-") || sourceId === "multi-zona-markers") {
      map.removeSource(sourceId);
    }
  });
};
