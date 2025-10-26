import { supabase } from "../../supabase/client";

// Obtener proveedores que operan en una zona específica
export const obtenerProveedoresPorZona = async (zonaId, mostrarAlerta = () => {}) => {
  const { data, error } = await supabase
    .from("proveedores")
    .select(
      `
      *,
      ProveedorTecnologia (
        tecnologias (*)
      ),
      ZonaProveedor!inner (
        zonas!inner (*)
      ),
      reseñas (
        id,
        estrellas
      )
    `
    )
    .eq("ZonaProveedor.zonas.id", zonaId)
    .order("nombre", { ascending: true });

  if (error) {
    mostrarAlerta("Error al obtener proveedores por zona");
    throw error;
  }
  
  // Eliminar duplicados basados en ID (por si acaso)
  const proveedoresUnicos = data?.reduce((acc, proveedor) => {
    if (!acc.find(p => p.id === proveedor.id)) {
      acc.push(proveedor);
    }
    return acc;
  }, []) || [];
  
  return proveedoresUnicos;
};

// Determinar en qué zona están unas coordenadas específicas usando geometrías reales
export const determinarZonaPorCoordenadas = async (lat, lng, mostrarAlerta = () => {}) => {
  try {
    // Usar PostGIS para determinar la zona basada en geometrías reales
    // ST_Contains verifica si el punto está dentro del polígono de la zona
    const { data, error } = await supabase
      .rpc('buscar_zona_por_punto', {
        punto_lat: lat,
        punto_lng: lng
      });

    if (error) {
      // Fallback: usar geometrías del cliente
      return await determinarZonaClientSide(lat, lng, mostrarAlerta);
    }

    if (data && data.length > 0) {
      return data[0];
    }

    return await determinarZonaClientSide(lat, lng, mostrarAlerta);

  } catch (error) {
    // Fallback a método del cliente
    return await determinarZonaClientSide(lat, lng, mostrarAlerta);
  }
};

// Método alternativo usando las geometrías en el cliente (JavaScript)
const determinarZonaClientSide = async (lat, lng, mostrarAlerta) => {
  // Obtener todas las zonas con sus geometrías
  const { data: zonas, error } = await supabase
    .from("zonas")
    .select("*")
    .order("departamento", { ascending: true });

  if (error) {
    mostrarAlerta("Error al obtener zonas");
    throw error;
  }

  // Verificar cada zona usando point-in-polygon
  for (const zona of zonas) {
    if (zona.geom && zona.geom.coordinates) {
      const dentroDeZona = isPointInPolygon([lng, lat], zona.geom.coordinates[0]);
      
      if (dentroDeZona) {
        return zona;
      }
    }
  }

  // Si no se encuentra en ninguna zona específica, verificar si está cerca de alguna
  // Solo usar fallback si está dentro de un rango razonable (ej: 0.0045 grados ≈ 0.5km)
  const MAX_DISTANCE_THRESHOLD = 0.0045; // aproximadamente 0.5km en grados
  
  let menorDistancia = Infinity;
  let zonaMasCercana = null;
  
  for (const zona of zonas) {
    if (zona.geom && zona.geom.coordinates) {
      // Calcular distancia al centroide del polígono
      const centroide = calcularCentroidePoligono(zona.geom.coordinates[0]);
      const distancia = Math.sqrt(
        Math.pow(lat - centroide.lat, 2) + Math.pow(lng - centroide.lng, 2)
      );
      
      if (distancia < menorDistancia) {
        menorDistancia = distancia;
        zonaMasCercana = zona;
      }
    }
  }
  
  // Solo devolver zona si está dentro del umbral de distancia
  if (menorDistancia <= MAX_DISTANCE_THRESHOLD) {
    return zonaMasCercana;
  }
  
  // Si está muy lejos de cualquier zona, devolver null
  return null;
};

// Algoritmo point-in-polygon (Ray casting)
const isPointInPolygon = (point, polygon) => {
  const [x, y] = point;
  let inside = false;
  
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const [xi, yi] = polygon[i];
    const [xj, yj] = polygon[j];
    
    if (((yi > y) !== (yj > y)) && (x < (xj - xi) * (y - yi) / (yj - yi) + xi)) {
      inside = !inside;
    }
  }
  
  return inside;
};

// Calcular centroide de un polígono
const calcularCentroidePoligono = (coordinates) => {
  let totalLat = 0;
  let totalLng = 0;
  const numPoints = coordinates.length;
  
  coordinates.forEach(coord => {
    totalLng += coord[0];
    totalLat += coord[1];
  });
  
  return {
    lat: totalLat / numPoints,
    lng: totalLng / numPoints
  };
};
