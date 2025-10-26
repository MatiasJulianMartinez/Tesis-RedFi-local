// src/services/speedtestService.js

// Leemos la URL del test de velocidad desde el .env
const SPEEDTEST_URL = import.meta.env.VITE_SPEEDTEST_API_URL;

// Esta función llama al servidor y devuelve los datos del test usando fetch
export async function ejecutarSpeedtest() {
  try {
    const response = await fetch(SPEEDTEST_URL);

    if (!response.ok) {
      throw new Error(`Error HTTP: ${response.status}`);
    }

    const data = await response.json();
    // data contendrá uploadSpeed, downloadSpeed, latency, etc.
    return data;
  } catch (error) {
    console.error('Error al obtener la prueba de velocidad:', error);
    throw new Error('No se pudo ejecutar el test de velocidad');
  }
}
