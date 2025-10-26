import { createContext, useContext, useEffect, useState } from 'react'
import { THEMES } from '../constants/themes'

// Contexto principal para el sistema de temas
const ThemeContext = createContext()

/**
 * Hook personalizado para acceder al contexto de temas
 * Valida que el hook se use dentro del proveedor correspondiente
 */
export const useTheme = () => {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useTheme debe usarse dentro de ThemeProvider')
  }
  return context
}

/**
 * Proveedor del contexto de temas
 * Maneja la aplicación de temas, persistencia y cambios dinámicos
 */
export const ThemeProvider = ({ children }) => {
  // Estado del tema actual (por defecto 'dark')
  const [currentTheme, setCurrentTheme] = useState('dark')

  /**
   * Función para aplicar un tema específico al documento
   * Actualiza las variables CSS personalizadas para TailwindCSS v4
   */
  const applyTheme = (themeName) => {
    const theme = THEMES[themeName]
    if (!theme) return

    // Actualiza variables CSS en el elemento root para TailwindCSS v4 @theme
    const root = document.documentElement
    Object.entries(theme).forEach(([key, value]) => {
      if (key !== 'nombre') {
        root.style.setProperty(`--color-${key}`, value)
      }
    })

    // Establecimiento adicional en body para compatibilidad con versiones anteriores
    document.body.style.setProperty('--color-texto', theme.texto)
    document.body.style.setProperty('--color-fondo', theme.fondo) 
    document.body.style.setProperty('--color-primario', theme.primario)
    document.body.style.setProperty('--color-secundario', theme.secundario)
    document.body.style.setProperty('--color-acento', theme.acento)
  }

  // Efecto para cargar el tema guardado al inicializar la aplicación
  useEffect(() => {
    // Intenta cargar tema desde localStorage
    const savedTheme = localStorage.getItem('redfi-theme')
    if (savedTheme && THEMES[savedTheme]) {
      // Aplica el tema guardado si existe y es válido
      setCurrentTheme(savedTheme)
      applyTheme(savedTheme)
    } else {
      // Aplica tema por defecto si no hay tema guardado
      applyTheme('dark')
    }
  }, []) // Solo se ejecuta una vez al montar el componente

  /**
   * Función para cambiar a un tema específico
   * Actualiza el estado, aplica los estilos y persiste en localStorage
   */
  const changeTheme = (themeName) => {
    if (!THEMES[themeName]) return

    setCurrentTheme(themeName)
    applyTheme(themeName)
    // Persiste la selección del usuario en localStorage
    localStorage.setItem('redfi-theme', themeName)
  }

  /**
   * Obtiene el siguiente tema en la secuencia (para funcionalidad toggle)
   * Utiliza módulo para crear un ciclo infinito entre temas disponibles
   */
  const getNextTheme = () => {
    const themeNames = Object.keys(THEMES)
    const currentIndex = themeNames.indexOf(currentTheme)
    const nextIndex = (currentIndex + 1) % themeNames.length
    return themeNames[nextIndex]
  }

  /**
   * Alterna entre temas disponibles
   * Función de conveniencia para botones de cambio rápido de tema
   */
  const toggleTheme = () => {
    const nextTheme = getNextTheme()
    changeTheme(nextTheme)
  }

  // Valor del contexto con todos los datos y funciones relacionadas con temas
  const value = {
    currentTheme,                    // Tema actualmente seleccionado
    availableThemes: Object.keys(THEMES), // Lista de temas disponibles
    themeData: THEMES[currentTheme], // Datos completos del tema actual
    changeTheme,                     // Función para cambiar a un tema específico
    toggleTheme,                     // Función para alternar entre temas
    getNextTheme                     // Función para obtener el siguiente tema
  }

  // Proporciona el contexto de temas a toda la aplicación
  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  )
}
