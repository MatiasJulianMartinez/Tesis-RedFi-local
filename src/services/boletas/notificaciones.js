/**
 * Servicio de notificaciones para boletas de servicios de internet
 * Genera alertas automáticas sobre vencimientos próximos y aumentos de precios
 * Analiza las boletas del usuario para crear notificaciones relevantes
 */

import { supabase } from "../../supabase/client";

/**
 * Obtiene notificaciones automáticas basadas en las boletas del usuario
 * Genera alertas por vencimientos próximos (0-2 días) y aumentos de precio
 * Retorna un array de mensajes de notificación formateados
 */
export const obtenerNotificacionesBoletas = async (userId) => {
  // Consulta todas las boletas del usuario desde la base de datos
  const { data, error } = await supabase
    .from("boletas")
    .select("*")
    .eq("user_id", userId);

  // Retorna array vacío si hay error o no hay datos
  if (error || !data) return [];

  const ahora = new Date();
  const alertas = [];

  // Análisis de vencimientos próximos para cada boleta
  data.forEach((b) => {
    // Convierte fecha de vencimiento a objeto Date con hora específica
    const vencimiento = new Date(b.vencimiento + "T00:00:00");
    const diff = vencimiento - ahora;
    
    // Calcula tiempo restante en diferentes unidades
    const dias = Math.floor(diff / (1000 * 60 * 60 * 24));
    const horas = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutos = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    // Genera alerta si vence en los próximos 2 días (incluyendo hoy)
    if (dias >= 0 && dias <= 2) {
      const partes = [];
      // Construye mensaje con formato humanizado del tiempo restante
      if (dias > 0) partes.push(`${dias} día${dias !== 1 ? "s" : ""}`);
      if (horas > 0) partes.push(`${horas} hora${horas !== 1 ? "s" : ""}`);
      if (minutos > 0) partes.push(`${minutos} minuto${minutos !== 1 ? "s" : ""}`);
      
      // Agrega notificación de vencimiento con emoji y proveedor
      alertas.push(`📅 ${b.proveedor} vence en ${partes.join(" y ")}`);
    }
  });

  // Análisis de aumentos de precio comparando boletas más recientes
  const ordenadas = [...data].sort(
    (a, b) => new Date(b.vencimiento) - new Date(a.vencimiento)
  );
  
  // Compara las dos boletas más recientes si existen
  if (ordenadas.length >= 2) {
    const actual = parseFloat(ordenadas[0].monto);
    const anterior = parseFloat(ordenadas[1].monto);
    const diferencia = actual - anterior;
    
    // Genera alerta solo si hubo aumento de precio
    if (diferencia > 0) {
      alertas.push(`⚠️ Subió $${diferencia.toFixed(2)} este mes`);
    }
  }

  return alertas;
};
