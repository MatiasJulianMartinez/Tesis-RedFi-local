import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { AuthProvider } from "./context/AuthContext";
import { RoleProvider } from "./context/RoleContext";
import { AlertaProvider } from "./context/AlertaContext";
import { ThemeProvider } from "./context/ThemeContext";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <AuthProvider>
      <RoleProvider>
        <ThemeProvider>
          <AlertaProvider>
            <App />
          </AlertaProvider>
        </ThemeProvider>
      </RoleProvider>
    </AuthProvider>
  </StrictMode>
);
