/**
 * Hook personalizado para detectar tipo de dispositivo y pantalla
 * Distingue entre pantallas pequeñas y dispositivos móviles reales,
 * con soporte para PWA instaladas y detección responsiva en tiempo real
 */

import { useState, useEffect } from 'react';

/**
 * Hook que detecta características del dispositivo y pantalla del usuario
 * Proporciona información sobre tamaño de pantalla y tipo de dispositivo
 */
export const useDeteccionDispositivo = () => {
  // Estado para detectar si la pantalla es de tamaño móvil (< 1024px)
  const [esMobile, setEsMobile] = useState(false);
  // Estado para detectar si es un dispositivo móvil real (incluyendo PWA)
  const [esMovil, setEsMovil] = useState(false);
  
  useEffect(() => {
    /**
     * Función que detecta las características del dispositivo y pantalla
     * Combina detección de ancho de pantalla, PWA y user agent
     */
    const detectarDispositivo = () => {
      // Detecta pantalla pequeña basado en breakpoint de TailwindCSS (lg: 1024px)
      const mobile = window.innerWidth < 1024;
      // Detecta si la app está instalada como PWA (Progressive Web App)
      const esPWA = window.matchMedia('(display-mode: standalone)').matches;
      // Detecta dispositivos móviles reales mediante user agent
      const esMovilReal = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
      
      setEsMobile(mobile);
      // Considera móvil si es dispositivo real O es pantalla pequeña Y es PWA
      setEsMovil(esMovilReal || (mobile && esPWA));
    };

    // Ejecuta detección inicial
    detectarDispositivo();
    // Escucha cambios de tamaño de ventana para detección responsiva
    window.addEventListener('resize', detectarDispositivo);
    // Cleanup: remueve el listener al desmontar
    return () => window.removeEventListener('resize', detectarDispositivo);
  }, []); // Array vacío = solo se ejecuta una vez al montar

  // Retorna información sobre el dispositivo y pantalla
  return { 
    esPantallaMovil: esMobile,    // True si pantalla < 1024px (breakpoint móvil)
    esDispositivoMovil: esMovil   // True si dispositivo móvil real o PWA en pantalla pequeña
  };
};
