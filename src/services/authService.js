// src/services/authService.js
import { supabase } from "../supabase/client";

// Registro de cuenta (email + password)
export const registerUser = async ({ email, password }) => {
  // Validaciones personalizadas
  if (!email || !password) {
    throw new Error("Email y contraseña son obligatorios.");
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    throw new Error("El correo electrónico no es válido.");
  }

  if (password.length < 6) {
    throw new Error("La contraseña debe tener al menos 6 caracteres.");
  }

  const { data, error } = await supabase.auth.signUp({ email, password });

  if (error) {
    if (error.message.includes("User already registered")) {
      throw new Error("Este correo ya está registrado. Probá iniciar sesión.");
    }
    throw new Error("Error al registrar el usuario.");
  }

  return data;
};

// Login
export const loginUser = async ({ email, password }) => {
  if (!email || !password) {
    throw new Error("Debes ingresar email y contraseña.");
  }

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    if (error.message.includes("Invalid login credentials")) {
      throw new Error("Credenciales incorrectas. Revisa tu email o contraseña.");
    }
    throw new Error("Error al iniciar sesión.");
  }

  return data;
};


// Logout
export const logoutUser = async () => {
  await supabase.auth.signOut();
};

// Obtener sesión activa
export const obtenerSesionActual = async () => {
  const { data, error } = await supabase.auth.getSession();
  if (error) throw error;
  return data.session;
};

// Escuchar login/logout
export const escucharCambiosDeSesion = (callback) => {
  const { data: listener } = supabase.auth.onAuthStateChange(
    (_event, session) => {
      callback(session?.user || null);
    }
  );
  return listener.subscription;
};

// Cambiar contraseña del usuario actual
export const cambiarPassword = async (nuevaPassword) => {
  if (!nuevaPassword || nuevaPassword.length < 6) {
    throw new Error("La contraseña debe tener al menos 6 caracteres.");
  }

  const { error } = await supabase.auth.updateUser({ password: nuevaPassword });

  if (error) {
    throw new Error("Error al actualizar la contraseña: " + error.message);
  }
};
