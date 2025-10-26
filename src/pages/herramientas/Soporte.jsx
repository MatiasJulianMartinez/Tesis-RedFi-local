import { useState, useRef, useEffect } from "react";
import { IconMessageChatbot, IconX, IconArrowLeft } from "@tabler/icons-react";
import MainH1 from "../../components/ui/MainH1";
import MainH2 from "../../components/ui/MainH2";
import MainH3 from "../../components/ui/MainH3";
import MainButton from "../../components/ui/MainButton";
import MainLinkButton from "../../components/ui/MainLinkButton";
import { useTheme } from "../../context/ThemeContext";

const flujoConversacion = {
  inicio: {
    mensaje: "Hola 👋, soy el asistente de Red-Fi. ¿Cómo estás?",
    opciones: [
      { texto: "Tengo dudas", siguiente: "dudas" },
      { texto: "Tengo problemas", siguiente: "problemas" },
    ],
  },
  dudas: {
    mensaje: "Claro, ¿sobre qué quieres saber más?",
    opciones: [
      {
        texto: "¿Qué es Red-Fi?",
        respuesta:
          "Red-Fi es una plataforma que te ayuda a conocer la cobertura y calidad de proveedores de Internet en tu zona. Te permite comparar servicios y mejorar tu conexión.",
      },
      {
        texto: "¿Qué herramientas tiene Red-Fi?",
        respuesta:
          "Red-Fi ofrece un mapa interactivo, test de velocidad, reseñas de usuarios y buscador de proveedores.",
      },
      {
        texto: "¿Cómo puedo registrarme?",
        respuesta:
          "Registrarte es fácil: solo necesitas tu correo electrónico y una contraseña. ¡Es gratis!",
      },
      { texto: "Volver al inicio", siguiente: "inicio" },
    ],
  },
  problemas: {
    mensaje: "Entiendo, ¿qué problema estás teniendo?",
    opciones: [
      {
        texto: "Internet lento",
        respuesta:
          "Si tu internet está lento, reinicia el router, desconecta dispositivos innecesarios y prueba usar un cable de red si es posible.",
      },
      {
        texto: "Sin conexión",
        respuesta:
          "Verifica cables, luces del router y prueba reiniciarlo. Si sigue sin funcionar, contacta a tu proveedor.",
      },
      {
        texto: "Problemas con el WiFi",
        respuesta:
          "Intenta reiniciar el router. Si el problema persiste, acércate al router, prueba cambiar la banda (2.4GHz/5GHz) o revisa interferencias.",
      },
      {
        texto: "Mejorar señal WiFi",
        respuesta:
          "Ubica el router en un lugar alto y central. Evita paredes gruesas o electrodomésticos cerca. Considera un repetidor o un sistema Mesh.",
      },
      {
        texto: "Corte de servicio",
        respuesta:
          "Consulta la página de tu proveedor o llama al soporte. También puedes preguntar a vecinos si están sin servicio.",
      },
      { texto: "Volver al inicio", siguiente: "inicio" },
    ],
  },
};

const Soporte = () => {
  useEffect(() => {
    document.title = "Red-Fi | Soporte";
  }, []);

  const { currentTheme } = useTheme();
  const [chatAbierto, setChatAbierto] = useState(false);

  const [mensajes, setMensajes] = useState([
    { autor: "bot", texto: flujoConversacion.inicio.mensaje },
  ]);
  const [opciones, setOpciones] = useState(flujoConversacion.inicio.opciones);
  const [escribiendo, setEscribiendo] = useState(false);
  const chatRef = useRef(null);

  const manejarSeleccion = (opcion) => {
    setMensajes((prev) => [...prev, { autor: "user", texto: opcion.texto }]);
    setOpciones(null); // Ocultar botones temporalmente
    setEscribiendo(true);

    setTimeout(() => {
      if (opcion.siguiente) {
        const siguientePaso = flujoConversacion[opcion.siguiente];
        setMensajes((prev) => [
          ...prev,
          { autor: "bot", texto: siguientePaso.mensaje },
        ]);
        setOpciones(siguientePaso.opciones);
      } else if (opcion.respuesta) {
        setMensajes((prev) => [
          ...prev,
          { autor: "bot", texto: opcion.respuesta },
        ]);
        setOpciones([
          { texto: "Volver al inicio", siguiente: "inicio" },
          { texto: "Tengo otra duda", siguiente: "dudas" },
          { texto: "Tengo otro problema", siguiente: "problemas" },
        ]);
      }
      setEscribiendo(false);
    }, 800); // Tiempo de espera simulado
  };

  useEffect(() => {
    chatRef.current?.scrollTo({
      top: chatRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [mensajes, escribiendo]);

  return (
    <>
      {/* Contenido principal de soporte */}
      <section className="self-start py-16 px-4 sm:px-6 text-texto w-full">
        <div className="max-w-7xl mx-auto space-y-12">
          <div className="text-center mb-8">
            <MainH1 icon={IconMessageChatbot}>Centro de Soporte</MainH1>
            <p className="text-lg">
              Encuentra ayuda o chatea con nuestro asistente virtual.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Sección de ayuda rápida */}
            <div className={`p-6 rounded-lg ${
              currentTheme === "light"
                ? "bg-secundario border border-secundario/50 shadow-lg"
                : "bg-texto/5 border border-texto/15"
            }`}>
              <MainH2 className="mb-4">Ayuda Rápida</MainH2>
              <div className="space-y-3">
                <div className="p-3 rounded-lg border border-texto/15">
                  <MainH3 className="mb-1">¿Qué es Red-Fi?</MainH3>
                  <p className="text-sm text-texto">
                    Una plataforma para conocer la cobertura y calidad de proveedores de Internet.
                  </p>
                </div>
                <div className="p-3 rounded-lg border border-texto/15">
                  <MainH3 className="mb-1">Herramientas disponibles</MainH3>
                  <p className="text-sm text-texto">
                    Mapa interactivo, test de velocidad, reseñas y buscador de proveedores.
                  </p>
                </div>
                <div className="p-3 rounded-lg border border-texto/15">
                  <MainH3 className="mb-1">¿Cómo registrarse?</MainH3>
                  <p className="text-sm text-texto">
                    Solo necesitas tu correo electrónico. ¡Es gratis y rápido!
                  </p>
                </div>
              </div>
            </div>

            {/* Sección de problemas comunes */}
            <div className={`p-6 rounded-lg ${
              currentTheme === "light"
                ? "bg-secundario border border-secundario/50 shadow-lg"
                : "bg-texto/5 border border-texto/15"
            }`}>
              <MainH2 className="mb-4">Problemas Comunes</MainH2>
              <div className="space-y-3">
                <div className="p-3 rounded-lg border border-texto/15">
                  <MainH3 className="mb-1">Internet lento</MainH3>
                  <p className="text-sm text-texto">
                    Reinicia el router y desconecta dispositivos innecesarios.
                  </p>
                </div>
                <div className="p-3 rounded-lg border border-texto/15">
                  <MainH3 className="mb-1">Sin conexión</MainH3>
                  <p className="text-sm text-texto">
                    Verifica cables y luces del router. Contacta a tu proveedor si persiste.
                  </p>
                </div>
                <div className="p-3 rounded-lg border border-texto/15">
                  <MainH3 className="mb-1">Problemas WiFi</MainH3>
                  <p className="text-sm text-texto">
                    Ubica el router en lugar central y alto. Evita interferencias.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="text-center">
            <p className="text-lg mb-4">¿Necesitas más ayuda personalizada?</p>
            <MainButton
              onClick={() => setChatAbierto(true)}
              variant="primary"
              className="px-6 py-4"
              icon={IconMessageChatbot}
            >
              Abrir Chat de Soporte
            </MainButton>
          </div>
          {/* Botón para volver a herramientas */}
          <div className="text-center">
            <MainLinkButton to="/herramientas" variant="secondary">
              <IconArrowLeft />
              Volver a herramientas
            </MainLinkButton>
          </div>
        </div>
      </section>

      {/* Botón flotante del chat */}
      {!chatAbierto && (
        <div className="fixed bottom-24 lg:bottom-6 right-6 z-40">
          <MainButton
            onClick={() => setChatAbierto(true)}
            variant="primary"
            className="rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-110 p-4"
            aria-label="Abrir chat de soporte"
          >
            <IconMessageChatbot size={28} />
          </MainButton>
        </div>
      )}

      {/* Ventana del chat flotante */}
      {chatAbierto && (
        <div className="fixed bottom-24 lg:bottom-6 right-4 left-4 sm:right-6 sm:left-auto sm:w-96 lg:w-120 z-50">
          <div className={`rounded-lg shadow-2xl overflow-hidden ${
            currentTheme === "light"
              ? "bg-secundario border border-secundario/50"
              : "bg-fondo border border-texto/15"
          }`}>
            {/* Header del chat */}
            <div className={`px-4 py-3 flex items-center justify-between ${
              currentTheme === "light"
                ? "bg-primario text-white"
                : "bg-primario text-texto"
            }`}>
              <div className="flex items-center space-x-2">
                <IconMessageChatbot size={20} />
                <span className="font-bold">Asistente Red-Fi</span>
              </div>
              <MainButton
                onClick={() => setChatAbierto(false)}
                variant="cross"
                title="Cerrar chat"
                className="px-0 text-white"
              >
                <IconX size={24} />
              </MainButton>
            </div>

            {/* Cuerpo del chat */}
            <div className="h-100 lg:h-140 flex flex-col">
                <div ref={chatRef} className="flex-1 overflow-y-auto space-y-3 p-3">
                  {mensajes.map((m, index) => (
                    <div
                      key={index}
                      className={`flex ${
                        m.autor === "bot" ? "justify-start" : "justify-end"
                      }`}
                    >
                      <div
                        className={`p-2 rounded-lg max-w-[85%] text-sm ${
                          m.autor === "bot"
                            ? currentTheme === "light"
                              ? "bg-texto/5 text-texto text-left"
                              : "bg-texto/5 text-texto text-left"
                            : currentTheme === "light"
                            ? "bg-primario text-white text-right"
                            : "bg-primario text-texto text-right"
                        }`}
                      >
                        {m.texto}
                      </div>
                    </div>
                  ))}

                  {escribiendo && (
                    <div className="flex justify-start">
                      <div className={`p-2 rounded-lg text-sm animate-pulse ${
                        currentTheme === "light"
                          ? "bg-texto/5 text-texto"
                          : "bg-texto/5 text-texto"
                      }`}>
                        Escribiendo...
                      </div>
                    </div>
                  )}
                </div>

                {/* Opciones del chat */}
                {opciones && (
                  <div className="p-3 border-t border-texto/15">
                    <div className="grid grid-cols-2 gap-2">
                      {opciones.map((op, index) => (
                        <MainButton
                          key={index}
                          onClick={() => manejarSeleccion(op)}
                          disabled={escribiendo}
                          variant={
                            op.texto === "Volver al inicio" ? "secondary" : "primary"
                          }
                          className="text-sm text-left justify-start"
                        >
                          {op.texto}
                        </MainButton>
                      ))}
                    </div>
                  </div>
                )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Soporte;
