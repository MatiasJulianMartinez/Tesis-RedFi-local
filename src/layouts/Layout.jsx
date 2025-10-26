import { Outlet } from "react-router-dom";
import Navbar from "../components/layout/Navbar";
import MobileBottomNav from "../components/layout/MobileBottomNav";
import Footer from "../components/layout/Footer";
import { AuthProvider } from "../context/AuthContext";
import { useLocation } from "react-router-dom";

const Layout = () => {
  const location = useLocation();
  const esVistaMapa = location.pathname === "/mapa";

  return (
    <AuthProvider>
      <header className="z-50">
        <Navbar />
      </header>
      <main className="flex-grow flex items-center justify-center">
        <Outlet />
      </main>
      {!esVistaMapa && <Footer />}
      <MobileBottomNav />
    </AuthProvider>
  );
};

export default Layout;
