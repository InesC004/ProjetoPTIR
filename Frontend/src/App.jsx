import { BrowserRouter, Routes, Route } from "react-router-dom";
import Homepage from "./pages/Homepage";
import About from "./pages/About";
import Dashboard from "./pages/Dashboard";
import Profile from "./pages/Profile";
import CompletarPerfil from "./pages/Completar-perfil";
import PaginaGestores from "./pages/Gestores/PaginaGestores";
import PaginaMotorista from "./pages/PaginaMotorista";
import CriarGestor from "./pages/CriarGestor";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Homepage />} />
        <Route path="/about" element={<About />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/completar-perfil" element={<CompletarPerfil />} />
        <Route path="/gestor/PaginaGestores" element={<PaginaGestores />} />
        <Route
          path="/motorista/PaginaMotorista"
          element={<PaginaMotorista />}
        />
        <Route path="/admin/criar-gestor" element={<CriarGestor />} />
      </Routes>
    </BrowserRouter>
  );
}
