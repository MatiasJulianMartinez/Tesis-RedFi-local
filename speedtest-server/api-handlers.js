const { getExecOutput } = require('./api-handlers-helpers');

/**
 * Ejecuta fast-cli con subida y salida JSON.
 * Permitimos override por env FAST_CMD (p.ej. "npx fast --upload --json").
 * Por defecto usamos npx para ubicar el bin local de fast-cli.
 */
exports.testSpeedHandler = async () => {
  const cmd = process.env.FAST_CMD || 'npx --yes fast --upload --json';

  const out = await getExecOutput(cmd);

  // Si el proceso devolvió error (no 200), devolvemos detalle y no crasheamos
  if (out.status !== 200) {
    return {
      status: 400,
      data: {
        error: 'fast-cli falló al ejecutarse',
        detail: out.data,
        hint:
          'Si ves "Failed to launch the browser process", instalá Playwright/Chromium: ' +
          '"npm i -D playwright" y luego "npx playwright install chromium".',
      },
    };
  }

  // Intentamos parsear JSON
  try {
    const parsed = JSON.parse(out.data);
    return { status: 200, data: parsed };
  } catch (e) {
    const txt = String(out.data || '');

    // Casos comunes de salida no JSON
    if (txt.includes('Please check your internet connection')) {
      return { status: 400, data: { error: 'Sin conexión a internet' } };
    }

    if (txt.includes('Failed to launch the browser process')) {
      return {
        status: 500,
        data: {
          error: 'No se pudo lanzar el navegador requerido por fast-cli',
          hint:
            'Instalá Playwright y Chromium: "npm i -D playwright" y "npx playwright install chromium". ' +
            'Luego probá "npx fast --upload --json" en la consola.',
          detail: txt,
        },
      };
    }

    return {
      status: 500,
      data: {
        error: 'Salida no-JSON de fast-cli',
        detail: txt,
      },
    };
  }
};
