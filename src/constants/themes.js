// Configuración de temas disponibles con paletas de colores completas
export const THEMES = {
  // Tema oscuro: colores optimizados para ambientes con poca luz
  dark: {
    nombre: 'dark',
    texto: '#ffffff',     // Texto principal blanco para contraste en fondo oscuro
    fondo: '#161616',     // Fondo principal muy oscuro
    primario: '#0047d6',  // Color primario azul para elementos principales
    secundario: '#1f2a40', // Color secundario azul oscuro para paneles y contenedores
    acento: '#fb8531'     // Color de acento naranja para destacar elementos importantes
  },
  // Tema claro: colores optimizados para ambientes bien iluminados
  light: {
    nombre: 'light',
    texto: '#1a1a1a',     // Texto principal oscuro para contraste en fondo claro
    fondo: '#f9f9f9',     // Fondo principal muy claro
    primario: '#0047d6',  // Color primario azul (consistente entre temas)
    secundario: '#e5f0ff', // Color secundario azul muy claro para paneles
    acento: '#fb8531'     // Color de acento naranja (consistente entre temas)
  },
}
