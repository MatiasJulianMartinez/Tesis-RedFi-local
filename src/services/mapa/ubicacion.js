// src/services/mapa/ubicacion.js
import { estaEnCorrientes } from "./mapaBase";
import maplibregl from "maplibre-gl";

// ===============================
// Configuración geolocalización
// ===============================
const opcionesGeolocalizacion = (esMovil = false) => ({
  enableHighAccuracy: esMovil,           // Alta precisión solo en móvil
  timeout: esMovil ? 20000 : 10000,      // Más tiempo en móvil para GPS
  maximumAge: esMovil ? 30000 : 60000,   // Cache más corto en móvil
});

// Tu API key de OpenCage
const API_KEY = "195f05dc4c614f52ac0ac882ee570395";

// ===============================
// Helpers de bounds y centro
// ===============================
const getBoundsParam = (bounds) => {
  if (!bounds) return undefined;
  const { west, south, east, north } = bounds;
  if (
    typeof west !== "number" ||
    typeof south !== "number" ||
    typeof east !== "number" ||
    typeof north !== "number"
  ) {
    return undefined;
  }
  // OpenCage: west,south,east,north (lon,lat,lon,lat)
  return `${west},${south},${east},${north}`;
};

const centroCiudad = (bounds) =>
  bounds
    ? [(bounds.west + bounds.east) / 2, (bounds.south + bounds.north) / 2]
    : [-58.8341, -27.4698]; // fallback: centro aprox. Corrientes Capital

const dentroDeCorrientes = (bounds, lng, lat) =>
  bounds ? estaEnCorrientes(lng, lat, bounds) : true;

// ===============================
// Normalización de direcciones
// ===============================
const extraerCalleYNumero = (input) => {
  // Busca último número como "altura"
  const m = input.match(/(.+?)\s+(\d{1,6})(?!.*\d)/);
  if (!m) return { calle: input.trim(), numero: null };
  return { calle: m[1].trim(), numero: parseInt(m[2], 10) || null };
};

const variantesCalle = (calle) => {
  const c = calle.trim();

  // Normalizaciones típicas para "avenida"
  const base = c
    .replace(/^av\.\s*/i, "avenida ")
    .replace(/^av\s+/i, "avenida ")
    .replace(/^avda\.\s*/i, "avenida ")
    .replace(/^avda\s+/i, "avenida ");

  // Variantes útiles: con y sin “avenida”
  const sinTipo = base.replace(/^avenida\s+/i, "");
  const variantes = new Set([
    base,                  // "avenida independencia"
    sinTipo,               // "independencia"
    c,                     // lo que escribió el usuario ("Av. independencia")
  ]);

  return Array.from(variantes).filter(Boolean);
};

const armarVariantesConsulta = (input) => {
  const { calle, numero } = extraerCalleYNumero(input);
  const vCalles = variantesCalle(calle);
  const variantes = [];

  if (numero) {
    for (const vc of vCalles) {
      variantes.push(`${vc} ${numero}, Corrientes Capital, Corrientes, Argentina`);
    }
  }

  // Por si el usuario no puso número
  for (const vc of vCalles) {
    variantes.push(`${vc}, Corrientes Capital, Corrientes, Argentina`);
  }

  return { variantes, numero };
};

// ===============================
// Scoring de candidatos (OpenCage)
// ===============================
const scoreCandidate = (r, bounds, input) => {
  const c = r?.components || {};
  const g = r?.geometry || {};
  const conf = typeof r?.confidence === "number" ? r.confidence : 0;
  let s = 0;

  if (typeof g.lng === "number" && typeof g.lat === "number" && dentroDeCorrientes(bounds, g.lng, g.lat)) s += 100;
  if (c.house_number || c.housenumber) s += 80;
  if ((c.city || c.town || c.village || "").toLowerCase().includes("corrientes")) s += 30;
  if ((c.state || "").toLowerCase().includes("corrientes")) s += 20;

  const road = (c.road || c.street || c.footway || "").toLowerCase();
  if (road && input.toLowerCase().includes(road)) s += 10;

  s += Math.min(conf * 2, 20);
  if (!c.house_number && !c.housenumber) s -= 5;

  return s;
};

// ===============================
// Geocoders
// ===============================
async function geocodeOpenCage(query, bounds) {
  const prox = centroCiudad(bounds); // [lng, lat]
  const params = new URLSearchParams({
    q: query,
    key: API_KEY,
    limit: "5",
    no_annotations: "1",
    language: "es",
    countrycode: "ar",
    no_dedupe: "1",
    proximity: `${prox[1]},${prox[0]}`, // OpenCage proximity: lat,lon
  });
  const boundsParam = getBoundsParam(bounds);
  if (boundsParam) params.set("bounds", boundsParam);

  const url = `https://api.opencagedata.com/geocode/v1/json?${params.toString()}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Geocoding HTTP ${res.status}`);
  const data = await res.json();
  return Array.isArray(data?.results) ? data.results : [];
}

async function geocodeNominatimStreet(street, bounds) {
  // A Nominatim le gusta: street=<calle número>&city=&state=&country=
  const params = new URLSearchParams({
    format: "jsonv2",
    street,
    city: "Corrientes",
    state: "Corrientes",
    country: "Argentina",
    limit: "1",
    addressdetails: "1",
  });

  if (bounds) {
    // Nominatim usa viewbox: west,north,east,south
    params.set("viewbox", `${bounds.west},${bounds.north},${bounds.east},${bounds.south}`);
    params.set("bounded", "1");
  }

  const url = `https://nominatim.openstreetmap.org/search?${params.toString()}`;
  const res = await fetch(url, {
    headers: {
      "User-Agent": "Red-Fi Corrientes (tesis) - navegador",
      "Accept-Language": "es",
    },
  });
  if (!res.ok) throw new Error(`Nominatim HTTP ${res.status}`);

  const arr = await res.json();
  const hit = Array.isArray(arr) ? arr[0] : null;
  if (!hit) return null;

  const lng = parseFloat(hit.lon);
  const lat = parseFloat(hit.lat);
  const house = hit?.address?.house_number || null;
  const road = hit?.address?.road || hit?.address?.pedestrian || hit?.address?.footway || null;

  return { lng, lat, display_name: hit.display_name, house_number: house, road };
}

// ===============================
// Buscador principal
// ===============================
export const buscarUbicacion = async (input, bounds, mostrarAlerta = () => {}, map) => {
  if (!input || !input.trim() || !map) return;

  try {
    const { variantes, numero } = armarVariantesConsulta(input);
    let mejor = null;

    // 1) Probar variantes en OpenCage
    for (const q of variantes) {
      const results = await geocodeOpenCage(q, bounds);
      if (!results.length) continue;

      // Filtrar a Corrientes y ordenar por score
      const enCorr = results.filter((r) => {
        const g = r?.geometry || {};
        return typeof g.lng === "number" && typeof g.lat === "number" && dentroDeCorrientes(bounds, g.lng, g.lat);
      });
      const ordenados = (enCorr.length ? enCorr : results).sort(
        (a, b) => scoreCandidate(b, bounds, q) - scoreCandidate(a, bounds, q)
      );

      const top = ordenados[0];
      if (!mejor || scoreCandidate(top, bounds, q) > scoreCandidate(mejor, bounds, q)) {
        mejor = top;
      }

      // Si el top ya trae house_number, cortamos
      if (top?.components?.house_number || top?.components?.housenumber) {
        mejor = top;
        break;
      }
    }

    // 2) Si no hay altura exacta todavía, intentar Nominatim con variantes
    if (!(mejor?.components?.house_number || mejor?.components?.housenumber)) {
      for (const q of variantes) {
        const nn = await geocodeNominatimStreet(q.replace(/,\s*Corrientes.*$/i, ""), bounds);
        if (nn && dentroDeCorrientes(bounds, nn.lng, nn.lat)) {
          mejor = {
            geometry: { lng: nn.lng, lat: nn.lat },
            formatted: nn.display_name || q,
            components: { house_number: nn.house_number, road: nn.road, city: "Corrientes" },
            _from: "nominatim",
          };
          break;
        }
      }
    }

    // 3) Si aún no hay número, probar “barrido” de números vecinos (±2,4,6,8,10) con Nominatim
    if (numero && !(mejor?.components?.house_number || mejor?.components?.housenumber)) {
      const offsets = [2, 4, 6, 8, 10];
      const { calle } = extraerCalleYNumero(input);
      const vCalles = variantesCalle(calle);

      let preciso = null;
      for (const off of offsets) {
        const candidatos = [
          numero - off,
          numero + off,
        ].filter((n) => n > 0);

        for (const n of candidatos) {
          for (const vc of vCalles) {
            const street = `${vc} ${n}`;
            const nn = await geocodeNominatimStreet(street, bounds);
            if (nn && dentroDeCorrientes(bounds, nn.lng, nn.lat)) {
              preciso = {
                geometry: { lng: nn.lng, lat: nn.lat },
                formatted: nn.display_name || street,
                components: { house_number: nn.house_number ?? String(n), road: nn.road ?? vc, city: "Corrientes" },
                _from: "nominatim_sweep",
              };
              break;
            }
          }
          if (preciso) break;
        }
        if (preciso) {
          mejor = preciso;
          break;
        }
      }
    }

    // 4) Si no se obtuvo nada util, avisar
    if (!mejor?.geometry?.lat || !mejor?.geometry?.lng) {
      mostrarAlerta("No se encontró la ubicación ingresada en Corrientes Capital.");
      return;
    }

    const { lat, lng } = mejor.geometry;
    const precise = !!(mejor?.components?.house_number || mejor?.components?.housenumber);
    const rb = mejor?.bounds;

    if (rb?.northeast && rb?.southwest) {
      const sw = [rb.southwest.lng, rb.southwest.lat];
      const ne = [rb.northeast.lng, rb.northeast.lat];
      map.fitBounds([sw, ne], { padding: 60, maxZoom: precise ? 17 : 15, duration: 800 });
    } else {
      map.flyTo({ center: [lng, lat], zoom: precise ? 17 : 15, essential: true });
    }

    colocarMarcadorUbicacion(map, [lng, lat]);
    if (!precise) {
      mostrarAlerta("No se encontró el número exacto; se ubicó el mejor tramo de la calle en Corrientes Capital.");
    }
  } catch (error) {
    console.error("Error en la búsqueda:", error);
    mostrarAlerta("Ocurrió un error al buscar la ubicación.");
  }
};

// ===============================
// Geolocalización del usuario
// ===============================
export const manejarUbicacionActual = async (bounds, mostrarAlerta = () => {}, map, esMovil = false) => {
  return new Promise((resolve) => {
    if (!navigator.geolocation) {
      mostrarAlerta("La geolocalización no está disponible en este dispositivo.");
      resolve(null);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async ({ coords }) => {
        const { latitude, longitude } = coords;
        console.log("📍 Ubicación obtenida:", { latitude, longitude });

        try {
          const params = new URLSearchParams({
            q: `${latitude}+${longitude}`, // OpenCage acepta lat+lon en este orden
            key: API_KEY,
            no_annotations: "1",
            language: "es",
          });
          const url = `https://api.opencagedata.com/geocode/v1/json?${params.toString()}`;
          const res = await fetch(url);
          if (!res.ok) throw new Error(`Reverse geocoding HTTP ${res.status}`);

          const data = await res.json();
          const address = data?.results?.[0]?.components || {};

          const ciudad =
            address.city || address.town || address.village || "una ciudad desconocida";
          const provincia = (address.state || "una provincia desconocida").toLowerCase();

          console.log("🏙️ Ubicación detectada:", { ciudad, provincia });

          if (provincia === "corrientes") {
            mostrarAlerta(`Estás en ${ciudad}, Corrientes`);
            const center = [longitude, latitude];
            colocarMarcadorUbicacion(map, center);
            map.flyTo({ center, zoom: 15, essential: true });
            resolve({ lat: latitude, lng: longitude });
          } else {
            mostrarAlerta(
              `Red-Fi solo está disponible en Corrientes. Estás en ${ciudad}, ${address.state || "provincia desconocida"}.`
            );
            resolve(null);
          }
        } catch (error) {
          console.error("Error al obtener datos de ubicación:", error);
          mostrarAlerta("No se pudo obtener tu ubicación exacta.");
          resolve(null);
        }
      },
      (error) => {
        console.error("❌ Error de geolocalización:", error);

        let mensaje = "No se pudo obtener tu ubicación.";
        switch (error.code) {
          case error.PERMISSION_DENIED:
            mensaje = "Permiso de ubicación denegado. Habilita la geolocalización en tu navegador.";
            break;
          case error.POSITION_UNAVAILABLE:
            mensaje = "Ubicación no disponible. Si estás en un emulador, configura una ubicación mock.";
            break;
          case error.TIMEOUT:
            mensaje = "Tiempo de espera agotado. Intenta nuevamente.";
            break;
          default:
            mensaje = `Error de ubicación: ${error.message || "Desconocido"}`;
        }

        mostrarAlerta(mensaje);
        resolve(null);
      },
      opcionesGeolocalizacion(esMovil)
    );
  });
};

// ===============================
// Marcadores
// ===============================
export const colocarMarcadorUbicacion = (map, coords) => {
  try {
    const markerEl = document.createElement("div");
    markerEl.style.width = "16px";
    markerEl.style.height = "16px";
    markerEl.style.backgroundColor = "#0047D6";
    markerEl.style.borderRadius = "50%";
    markerEl.style.border = "2px solid white";
    markerEl.style.boxShadow = "0 0 6px rgba(0,0,0,0.3)";
    markerEl.style.pointerEvents = "none";

    if (map.__marcadorUbicacion) {
      map.__marcadorUbicacion.remove();
    }

    const marker = new maplibregl.Marker({
      element: markerEl,
      anchor: "center",
    })
      .setLngLat(coords) // [lng, lat]
      .addTo(map);

    map.__marcadorUbicacion = marker;
  } catch (error) {
    console.error("❌ Error colocando marcador:", error);
  }
};

export const eliminarMarcadorUbicacion = (map) => {
  if (map?.__marcadorUbicacion) {
    map.__marcadorUbicacion.remove();
    map.__marcadorUbicacion = null;
  }
};

// ===============================
// Coordenadas si está en Corrientes
// ===============================
export const obtenerCoordenadasSiEstanEnCorrientes = (bounds, mostrarAlerta = () => {}, esMovil = false) => {
  return new Promise((resolve) => {
    if (!navigator.geolocation) {
      mostrarAlerta("La geolocalización no está disponible en este dispositivo.");
      resolve(null);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async ({ coords }) => {
        const { latitude, longitude } = coords;
        console.log("📍 Coordenadas obtenidas:", { latitude, longitude });

        try {
          const params = new URLSearchParams({
            q: `${latitude}+${longitude}`,
            key: API_KEY,
            no_annotations: "1",
            language: "es",
          });
          const url = `https://api.opencagedata.com/geocode/v1/json?${params.toString()}`;
          const res = await fetch(url);
          if (!res.ok) throw new Error(`Reverse geocoding HTTP ${res.status}`);

          const data = await res.json();
          const address = data?.results?.[0]?.components || {};
          const provincia = (address.state || "").toLowerCase();

          if (provincia === "corrientes") {
            resolve({ lat: latitude, lng: longitude });
          } else {
            mostrarAlerta(
              `Estás fuera de Corrientes. Estás en ${address.state || "una provincia desconocida"}.`
            );
            resolve(null);
          }
        } catch (error) {
          console.error("Error al obtener datos de ubicación:", error);
          mostrarAlerta("No se pudo obtener tu ubicación exacta.");
          resolve(null);
        }
      },
      (error) => {
        console.error("❌ Error de geolocalización:", error);
        mostrarAlerta("No se pudo obtener tu ubicación.");
        resolve(null);
      },
      opcionesGeolocalizacion(esMovil)
    );
  });
};
