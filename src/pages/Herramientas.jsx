import React from "react";
import MainLinkButton from "../components/ui/MainLinkButton";
import MainH1 from "../components/ui/MainH1";
import MainH3 from "../components/ui/MainH3";
import { IconTool } from "@tabler/icons-react";

const Herramientas = () => {
  return (
    <section className="self-start py-16 px-4 sm:px-6 text-texto w-full">
      <div className="max-w-7xl mx-auto space-y-12">
        <div className="text-center mb-8">
          <MainH1 icon={IconTool}>Herramientas Red-Fi</MainH1>
          <p className="text-lg">
            Descubrí nuestras herramientas de Red-Fi diseñadas para mejorar tu experiencia de conexión: desde mapas colaborativos con reseñas, hasta tests de velocidad y análisis de cobertura en tu hogar. ¡Probá cada una y optimizá tu red!
          </p>
        </div>
        <div className="mx-auto max-w-7xl grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <div>
            <MainLinkButton to="/mapa" variant="card">
              <MainH3 className="text-center justify-center">
                Mapa de Red-Fi
              </MainH3>
              <p>
                Explorá qué proveedores ofrecen servicio en tu zona, leé reseñas de otros usuarios y dejá tu propia opinión sobre tu experiencia.
              </p>
            </MainLinkButton>
          </div>
          <div>
            <MainLinkButton to="/informacion-red" variant="card">
              <MainH3 className="text-center justify-center">
                Información de red
              </MainH3>
              <p>
                Conocé tu IP pública, ubicación aproximada y detalles técnicos de tu conexión actual.
              </p>
            </MainLinkButton>
          </div>
          <div>
            <MainLinkButton to="/test-velocidad" variant="card">
              <MainH3 className="text-center justify-center">
                Test de velocidad
              </MainH3>
              <p>
                Medí la velocidad real de de conexión a Internet en pocos segundos.
              </p>
            </MainLinkButton>
          </div>
          <div>
            <MainLinkButton to="/analisis-conexion" variant="card">
              <MainH3 className="text-center justify-center">
                Análisis de conexión por zonas
              </MainH3>
              <p>
                Simulá un análisis Wi-Fi en tu hogar para identificar las zonas con mejor o peor señal.
              </p>
            </MainLinkButton>
          </div>
          <div className="lg:col-span-2">
            <MainLinkButton to="/soporte" variant="card">
              <MainH3 className="text-center justify-center">
                Soporte
              </MainH3>
              <p>
                Simulá un análisis Wi-Fi en tu hogar para identificar las zonas con mejor o peor señal.
              </p>
            </MainLinkButton>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Herramientas;
