import { IconMap2 } from "@tabler/icons-react";
import MainLinkButton from "../ui/MainLinkButton";
import MainH2 from "../ui/MainH2";

const CTASection = () => {
  return (
    <section className="bg-secundario text-texto py-16 text-center px-4 sm:px-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <MainH2 className="text-center justify-center">¿Listo para mejorar tu conexión?</MainH2>
        <p>
          Explora el mapa interactivo y descubre qué proveedor se adapta mejor a
          tu zona.
        </p>
        <MainLinkButton
          to="/mapa"
          className="hover:scale-105"
          icon={IconMap2}
          loading={false}
          variant="accent"
        >
          Ver mapa
        </MainLinkButton>
      </div>
    </section>
  );
};

export default CTASection;
