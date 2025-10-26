var settings = {
  telemetry_enabled: false, // No queremos enviar datos a ningún servidor
  telemetry_server: "",

  backend: {
    type: "custom", // Usamos nuestro propio backend Node.js
    url_dl: "http://127.0.0.1:3001/garbage",
    url_ul: "http://127.0.0.1:3001/empty",
    url_ping: "http://127.0.0.1:3001/ping",
  },

  // Medidas visuales y comportamiento
  auto_start: false,
  start_minimized: false,
  enable_quirks: true,

  // Unidades
  unit: {
    type: "Mbps", // Mostramos en megabits por segundo
    digits: 2,
  },

  // Opciones de prueba
dl: {
  test: true,
  streams: 8,
  duration: 30, // ⏱️ duplicás el tiempo de bajada
},
ul: {
  test: true,
  streams: 8,
  duration: 30, // ⏱️ duplicás el tiempo de subida
},

  ping: {
    test: true,
    count: 10,
  },

  jitter: {
    test: true,
  },
};
