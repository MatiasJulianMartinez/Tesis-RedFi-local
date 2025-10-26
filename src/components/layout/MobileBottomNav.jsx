import { useState } from "react";
import { useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import {
  IconX,
  IconBell,
  IconBellFilled,
  IconHome,
  IconTool,
  IconUser,
  IconDots,
  IconLogout,
  IconSun,
  IconMoon,
  IconChevronDown,
} from "@tabler/icons-react";
import { useNotificaciones } from "./Navbar";
import MainButton from "../ui/MainButton";
import MainLinkButton from "../ui/MainLinkButton";
import { logoutUser } from "../../services/authService";
import { useTheme } from "../../context/ThemeContext";

const MobileBottomNav = () => {
  const [mostrarNotis, setMostrarNotis] = useState(false);
  const [mostrarMenu, setMostrarMenu] = useState(false);
  const { usuario } = useAuth();
  const { notificaciones, setNotificaciones } = useNotificaciones();
  const [mostrarHerramientas, setMostrarHerramientas] = useState(false);
  const location = useLocation();

  const { currentTheme, changeTheme } = useTheme();

  const toggleTheme = () => {
    const nextTheme = currentTheme === "light" ? "dark" : "light";
    changeTheme(nextTheme);
  };

  const openOnly = (menu) => {
    setMostrarHerramientas(menu === "tools");
    setMostrarNotis(menu === "notis");
    setMostrarMenu(menu === "menu");
  };

  const mainNavigationItems = [
    { path: "/", label: "Inicio", icon: IconHome },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <>
      {/* Mobile Bottom Navigation */}
      <nav
        className={`lg:hidden fixed bottom-0 left-0 right-0 z-[9999] safe-area-inset-bottom ${
          currentTheme === "light"
            ? "bg-fondo border-t border-texto/15 shadow-lg"
            : "bg-fondo border-t border-texto/15 shadow-lg"
        }`}
      >
        <div className="flex justify-around items-center py-3 px-2">
          {/* Main Navigation Items usando MainLinkButton */}
          {mainNavigationItems.map(({ path, label, icon: Icon }) => (
            <MainLinkButton
              key={path}
              to={path}
              variant="navbarIcon"
              className={`flex flex-col items-center py-1 px-2 min-w-[60px] !bg-transparent ${
                isActive(path)
                  ? "!text-acento !scale-110"
                  : currentTheme === "light"
                  ? "!text-texto"
                  : "!text-texto"
              }`}
            >
              <Icon size={22} />
              <span className="text-xs mt-1 font-medium">{label}</span>
            </MainLinkButton>
          ))}

          {/* Herramientas (Dropdown) */}
          <div className="relative">
            <MainButton
              onClick={() => {
                setMostrarHerramientas((v) => !v);
                setMostrarMenu(false);
                setMostrarNotis(false);
                openOnly(mostrarHerramientas ? null : "tools");
              }}
              variant="secondary"
              className={`flex flex-col items-center py-1 px-2 min-w-[60px] !bg-transparent
              ${mostrarHerramientas ? "!text-acento !scale-110" : ""}`}
              icon={IconTool}
              iconSize={22}
              iconAlwaysVisible
              aria-expanded={mostrarHerramientas}
            >
              <span className="text-xs mt-1 font-medium flex items-center gap-1">
                Herramientas
                <IconChevronDown
                  size={14}
                  className={`transition-transform ${
                    mostrarHerramientas ? "rotate-180" : "rotate-0"
                  }`}
                />
              </span>
            </MainButton>

            {mostrarHerramientas && (
              <div
                className={`absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-60 rounded-lg shadow-lg z-50 p-2 space-y-1 ${
                  currentTheme === "light"
                    ? "bg-fondo border border-texto/15 text-texto"
                    : "bg-fondo text-texto border border-texto/15"
                }`}
              >
                <MainLinkButton
                  to="/herramientas"
                  onClick={() => setMostrarHerramientas(false)}
                  variant="navbar"
                  className={`w-full !justify-start !px-4 !py-3 !rounded-none ${
                    location.pathname === "/herramientas" ? "!text-acento" : ""
                  }`}
                >
                  Todas las herramientas
                </MainLinkButton>

                {/* Grupo indentado */}
                <div className="ml-2 pl-3 mt-1 space-y-1 border-l border-texto/15">
                  <MainLinkButton
                    to="/mapa"
                    onClick={() => setMostrarHerramientas(false)}
                    variant="navbar"
                    className={`w-full !justify-start !px-4 !py-3 !rounded-none ${
                      location.pathname === "/mapa" ? "!text-acento" : ""
                    }`}
                  >
                    Mapa
                  </MainLinkButton>

                  <MainLinkButton
                    to="/informacion-red"
                    onClick={() => setMostrarHerramientas(false)}
                    variant="navbar"
                    className={`w-full !justify-start !px-4 !py-3 !rounded-none ${
                      location.pathname === "/informacion-red"
                        ? "!text-acento"
                        : ""
                    }`}
                  >
                    Información de red
                  </MainLinkButton>

                  <MainLinkButton
                    to="/test-velocidad"
                    onClick={() => setMostrarHerramientas(false)}
                    variant="navbar"
                    className={`w-full !justify-start !px-4 !py-3 !rounded-none ${
                      location.pathname === "/test-velocidad"
                        ? "!text-acento"
                        : ""
                    }`}
                  >
                    Test de velocidad
                  </MainLinkButton>

                  <MainLinkButton
                    to="/analisis-conexion"
                    onClick={() => setMostrarHerramientas(false)}
                    variant="navbar"
                    className={`w-full !justify-start !px-4 !py-3 !rounded-none ${
                      location.pathname === "/analisis-conexion"
                        ? "!text-acento"
                        : ""
                    }`}
                  >
                    Análisis de conexión
                  </MainLinkButton>

                  <MainLinkButton
                    to="/soporte"
                    onClick={() => setMostrarHerramientas(false)}
                    variant="navbar"
                    className={`w-full !justify-start !px-4 !py-3 !rounded-none ${
                      location.pathname === "/soporte" ? "!text-acento" : ""
                    }`}
                  >
                    Soporte
                  </MainLinkButton>
                </div>
              </div>
            )}
          </div>

          {/* Notifications Icon for Mobile usando MainButton */}
          {usuario && (
            <div className="relative">
              <MainButton
                onClick={() => {
                  setMostrarNotis(!mostrarNotis);
                  openOnly(mostrarNotis ? null : "notis");
                }}
                variant="secondary"
                className={`flex flex-col items-center py-1 px-2 min-w-[60px] !bg-transparent ${
                  notificaciones.length > 0
                    ? "!text-acento"
                    : currentTheme === "light"
                    ? "!text-texto"
                    : "!text-texto"
                }`}
                icon={notificaciones.length > 0 ? IconBellFilled : IconBell}
                iconSize={22}
                iconAlwaysVisible={true}
              >
                <span className="text-xs mt-1 font-medium">Alertas</span>
                {notificaciones.length > 0 && (
                  <span className="absolute -top-0 -right-0 bg-red-500 text-texto text-xs px-1.5 py-0.5 rounded-full min-w-[16px] h-[16px] flex items-center justify-center">
                    {notificaciones.length}
                  </span>
                )}
              </MainButton>

             {mostrarNotis && (
                <>
                  {/* Overlay para cerrar el dropdown en móvil */}
                  <div 
                    className="fixed inset-0 z-40 sm:hidden" 
                    onClick={() => setMostrarNotis(false)}
                  />
                  <div
                    className={`fixed bottom-24 left-4 right-4 z-50 rounded-lg shadow-lg p-4 space-y-2 
                      sm:absolute sm:bottom-full sm:right-0 sm:left-auto sm:w-72 mb-2 ${
                      currentTheme === "light"
                      ? "bg-fondo border border-texto/15 text-texto"
                      : "bg-fondo text-texto border border-texto/15"
                  }`}
                >
                  {notificaciones.length === 0 ? (
                    <p className="italic text-center">Sin notificaciones</p>
                  ) : (
                    notificaciones.map((msg, i) => (
                      <div
                        key={i}
                        className={`border-b last:border-b-0 flex justify-between items-center gap-2 ${
                          currentTheme === "light"
                            ? "border-texto/15"
                            : "border-texto/15"
                        }`}
                      >
                        <span className="break-words">{msg}</span>
                        <MainButton
                          onClick={() =>
                            setNotificaciones((prev) =>
                              prev.filter((_, idx) => idx !== i)
                            )
                          }
                          variant="cross"
                          title="Cerrar"
                          icon={IconX}
                          iconSize={20}
                          className="leading-none p-0"
                          iconAlwaysVisible={true}
                        />
                      </div>
                    ))
                  )}
                </div>
                </>
              )}
            </div>
            
          )}

          {/* More Menu Button usando MainButton */}
          <div className="relative">
            <MainButton
              onClick={() => {
                setMostrarMenu(!mostrarMenu);
                openOnly(mostrarMenu ? null : "menu");
              }}
              variant="secondary"
              className={`flex flex-col items-center py-1 px-2 min-w-[60px] !bg-transparent ${
                currentTheme === "light" ? "!text-texto" : "!text-texto",
                mostrarMenu ? "!text-acento !scale-110" : ""
              }`}

              icon={IconDots}
              iconSize={22}
              iconAlwaysVisible={true}
            >
              <span className="text-xs mt-1 font-medium">Más</span>
            </MainButton>

            {/* More Menu Dropdown */}
            {mostrarMenu && (
              <div
                className={`absolute bottom-full right-2 mb-2 w-56 max-w-[calc(100vw-1rem)] rounded-lg shadow-lg z-50 py-2 ${
                  currentTheme === "light"
                    ? "bg-fondo border border-texto/15 text-texto"
                    : "bg-fondo text-texto border border-texto/15"
                }`}
              >
                {/* Cambiar tema usando MainButton */}
                <MainButton
                  onClick={() => {
                    toggleTheme();
                    setMostrarMenu(false);
                  }}
                  variant="secondary"
                  className={`w-full !justify-start !px-4 !py-3 !rounded-none ${
                    currentTheme === "light"
                      ? "!bg-transparent !text-texto"
                      : "!bg-transparent !text-texto"
                  }`}
                  icon={currentTheme === "light" ? IconSun : IconMoon}
                  iconSize={20}
                >
                  <span>Cambiar tema</span>
                </MainButton>

                {usuario && (
                  <>
                    {/* Perfil usando MainLinkButton */}
                    <MainLinkButton
                      to="/cuenta"
                      onClick={() => setMostrarMenu(false)}
                      variant="navbar"
                      className={`w-full !justify-start !px-4 !py-3 !rounded-none ${
                        isActive("/cuenta") ? "!text-acento" : ""
                      }`}
                    >
                      <IconUser size={20} />
                      <span>Perfil</span>
                    </MainLinkButton>

                    {/* Cerrar sesión usando MainButton */}
                    <MainButton
                      onClick={async () => {
                        await logoutUser();
                        setMostrarMenu(false);
                      }}
                      variant="danger"
                      className={`w-full !justify-start !px-4 !py-3 !rounded-none ${
                        currentTheme === "light"
                          ? "!bg-transparent !text-red-600"
                          : "!bg-transparent !text-red-400"
                      }`}
                      icon={IconLogout}
                      iconSize={20}
                    >
                      <span>Cerrar sesión</span>
                    </MainButton>
                  </>
                )}

                {!usuario && (
                  /* Login usando MainLinkButton */
                  <MainLinkButton
                    to="/login"
                    onClick={() => setMostrarMenu(false)}
                    variant="accent"
                    className={`w-full !justify-start !px-4 !py-3 !rounded-none ${
                      currentTheme === "light"
                        ? "!bg-transparent !text-orange-600"
                        : "!bg-transparent !text-acento"
                    }`}
                  >
                    <IconUser size={20} />
                    <span>Iniciar sesión</span>
                  </MainLinkButton>
                )}
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* Mobile Bottom Padding to prevent content overlap */}
      <div className="lg:hidden h-20"></div>
    </>
  );
};

export default MobileBottomNav;
