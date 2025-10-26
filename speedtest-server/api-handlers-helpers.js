const { exec } = require('child_process');

class OSFunc {
  execCommand(command) {
    return new Promise((resolve, reject) => {
      exec(
        command,
        {
          windowsHide: true,
          timeout: 120000, // 2 minutos
          maxBuffer: 1024 * 1024 * 10, // 10MB por si el output es grande
        },
        (error, stdout, stderr) => {
          // Si hay error, devolvemos igualmente stdout/stderr para debug
          if (error) {
            const all = (stdout || '') + (stderr || '');
            return reject(all || error.message || String(error));
          }
          const out = (stdout || '') + (stderr || '');
          resolve(out);
        }
      );
    });
  }
}

// Exporta una función estándar para ejecutar comandos y normalizar salida
exports.getExecOutput = async (command) => {
  const osFunc = new OSFunc();
  try {
    const out = await osFunc.execCommand(command);
    return { status: 200, data: out };
  } catch (e) {
    return { status: 400, data: String(e) };
  }
};
