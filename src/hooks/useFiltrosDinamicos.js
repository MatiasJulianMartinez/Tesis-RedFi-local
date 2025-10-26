/**
 * Hook personalizado para filtros dinámicos e interconectados
 * Calcula opciones disponibles basándose en las selecciones actuales,
 * creando un sistema de filtros que se actualizan mutuamente en tiempo real
 */

import { useMemo } from 'react';

/**
 * Implementa lógica de filtros interconectados donde la selección en un filtro
 * afecta las opciones disponibles en los otros filtros
 * @param {Array} todasLasZonas - Todas las zonas disponibles
 * @param {Array} todosLosProveedores - Todos los proveedores disponibles  
 * @param {Array} todasLasTecnologias - Todas las tecnologías disponibles
 * @param {Object} filtrosActuales - Los filtros actualmente seleccionados
 * @returns {Object} Objeto con opciones filtradas dinámicamente
 */
export const useFiltrosDinamicos = (
  todasLasZonas,
  todosLosProveedores,
  todasLasTecnologias,
  filtrosActuales
) => {
  
  // Memo que recalcula opciones disponibles cuando cambian las dependencias
  const filtrosDinamicos = useMemo(() => {
    // Validación inicial: si no hay datos, retorna arrays vacíos o datos originales
    if (!todasLasZonas || !todosLosProveedores || !todasLasTecnologias) {
      return {
        zonasDisponibles: todasLasZonas || [],
        proveedoresDisponibles: todosLosProveedores || [],
        tecnologiasDisponibles: todasLasTecnologias || [],
      };
    }

    // Sets para almacenar IDs válidos de cada tipo de filtro
    let zonasPermitidas = new Set();
    let proveedoresPermitidos = new Set();
    let tecnologiasPermitidas = new Set();

    // Caso 1: Si hay una zona seleccionada, filtrar proveedores y tecnologías disponibles
    if (filtrosActuales.zona?.id) {
      const zonaSeleccionada = todasLasZonas.find(z => z.id === filtrosActuales.zona.id);
      
      if (zonaSeleccionada) {
        // Encuentra proveedores que operan en la zona seleccionada
        const proveedoresEnZona = todosLosProveedores.filter(prov => 
          prov.ZonaProveedor?.some(zp => zp.zonas?.id === zonaSeleccionada.id)
        );
        
        // Agrega proveedores válidos al set
        proveedoresEnZona.forEach(prov => proveedoresPermitidos.add(prov.id));
        
        // Encuentra tecnologías disponibles por estos proveedores
        proveedoresEnZona.forEach(prov => {
          prov.ProveedorTecnologia?.forEach(pt => {
            if (pt.tecnologias?.tecnologia) {
              tecnologiasPermitidas.add(pt.tecnologias.tecnologia);
            }
          });
        });
      }
    }
    
    // Caso 2: Si hay un proveedor seleccionado, filtrar zonas y tecnologías disponibles
    if (filtrosActuales.proveedor?.id) {
      const proveedorSeleccionado = todosLosProveedores.find(p => p.id === filtrosActuales.proveedor.id);
      
      if (proveedorSeleccionado) {
        // Encuentra zonas donde opera el proveedor seleccionado
        proveedorSeleccionado.ZonaProveedor?.forEach(zp => {
          if (zp.zonas?.id) {
            zonasPermitidas.add(zp.zonas.id);
          }
        });
        
        // Encuentra tecnologías que ofrece el proveedor seleccionado
        proveedorSeleccionado.ProveedorTecnologia?.forEach(pt => {
          if (pt.tecnologias?.tecnologia) {
            tecnologiasPermitidas.add(pt.tecnologias.tecnologia);
          }
        });
      }
    }

    // Caso 3: Si hay una tecnología seleccionada, filtrar proveedores y zonas que la soporten
    if (filtrosActuales.tecnologia) {
      // Encuentra proveedores que ofrecen la tecnología seleccionada
      const proveedoresConTecnologia = todosLosProveedores.filter(prov =>
        prov.ProveedorTecnologia?.some(pt => pt.tecnologias?.tecnologia === filtrosActuales.tecnologia)
      );
      
      proveedoresConTecnologia.forEach(prov => {
        // Agrega proveedores que tienen la tecnología
        proveedoresPermitidos.add(prov.id);
        
        // Encuentra zonas donde operan estos proveedores
        prov.ZonaProveedor?.forEach(zp => {
          if (zp.zonas?.id) {
            zonasPermitidas.add(zp.zonas.id);
          }
        });
      });
    }

    // Verificación: determina si hay algún filtro activo
    const tieneAlgunFiltro = filtrosActuales.zona?.id || filtrosActuales.proveedor?.id || filtrosActuales.tecnologia;
    
    // Si no hay filtros, mostrar todas las opciones disponibles
    if (!tieneAlgunFiltro) {
      todasLasZonas.forEach(z => zonasPermitidas.add(z.id));
      todosLosProveedores.forEach(p => proveedoresPermitidos.add(p.id));
      todasLasTecnologias.forEach(t => tecnologiasPermitidas.add(t));
    }

    // Construye los arrays filtrados basándose en los sets de IDs válidos
    const zonasDisponibles = todasLasZonas.filter(zona => zonasPermitidas.has(zona.id));
    const proveedoresDisponibles = todosLosProveedores.filter(prov => proveedoresPermitidos.has(prov.id));
    const tecnologiasDisponibles = todasLasTecnologias.filter(tech => tecnologiasPermitidas.has(tech));

    // Retorna opciones filtradas o arrays originales como fallback
    return {
      zonasDisponibles: zonasDisponibles.length > 0 ? zonasDisponibles : todasLasZonas,
      proveedoresDisponibles: proveedoresDisponibles.length > 0 ? proveedoresDisponibles : todosLosProveedores,
      tecnologiasDisponibles: tecnologiasDisponibles.length > 0 ? tecnologiasDisponibles : todasLasTecnologias,
    };

  }, [todasLasZonas, todosLosProveedores, todasLasTecnologias, filtrosActuales]); // Recalcula cuando cambian las dependencias

  // Retorna el objeto con las opciones filtradas dinámicamente
  return filtrosDinamicos;
};
