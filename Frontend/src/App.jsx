import { BrowserRouter, Routes, Route } from "react-router-dom";
import Homepage from "./pages/Homepage";
import About from "./pages/About";
import Dashboard from "./pages/Dashboard";
import Profile from "./pages/Profile";
import PaginaGestores from "./pages/Gestores/PaginaGestores";
import PaginaMotorista from "./pages/PaginaMotorista";
import CriarGestor from "./pages/CriarGestor";
import PerfilMotorista from "./pages/PerfilMotorista";
import HistoricoCliente from "./pages/HistoricoCliente";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Homepage />} />
        <Route path="/About" element={<About />} />
        <Route path="/Dashboard" element={<Dashboard />} />
        <Route path="/Profile" element={<Profile />} />
        <Route path="/gestor/PaginaGestores" element={<PaginaGestores />} />
        <Route
          path="/motorista/PaginaMotorista"
          element={<PaginaMotorista />}
        />
        <Route path="/Perfil-motorista" element={<PerfilMotorista />} />
        <Route path="/admin/Criar-gestor" element={<CriarGestor />} />
        <Route path="/trips" element={<HistoricoCliente />} />
      </Routes>
    </BrowserRouter>
  );
}
