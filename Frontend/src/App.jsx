import { BrowserRouter, Routes, Route } from "react-router-dom";
import Homepage from "./pages/Homepage";
import About from "./pages/About";
import Dashboard from "./pages/Dashboard";
import Profile from "./pages/Profile";
import CompletarPerfil from "./pages/completar-perfil";
import PaginaGestores from "./pages/Gestores/PaginaGestores";
import PaginaMotorista from "./pages/PaginaMotorista";
import CriarGestor from "./pages/CriarGestor";
import PerfilMotorista from "./pages/PerfilMotorista";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Homepage />} />
        <Route path="/About" element={<About />} />
        <Route path="/Dashboard" element={<Dashboard />} />
        <Route path="/Profile" element={<Profile />} />
        <Route path="/Completar-perfil" element={<CompletarPerfil />} />
        <Route path="/gestor/PaginaGestores" element={<PaginaGestores />} />
        <Route
          path="/motorista/PaginaMotorista"
          element={<PaginaMotorista />}
        />
        <Route path="/Perfil-motorista" element={<PerfilMotorista />} />
        <Route path="/admin/Criar-gestor" element={<CriarGestor />} />
      </Routes>
    </BrowserRouter>
  );
}
