import { BrowserRouter, Routes, Route } from "react-router-dom";
import Homepage from "./pages/Homepage"; // Homepage.jsx esta no ficheiro pages/
import About from "./pages/About";
import Dashboard from "./pages/Dashboard";
import Profile from "./pages/Profile";
import CompletarPerfil from "./pages/Completar-perfil";
import PaginaGestores from "./pages/PaginaGestores";
import PaginaMotorista from "./pages/PaginaMotorista";
export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Homepage />} />
        <Route path="/about" element={<About />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/Profile" element={<Profile />} />
        <Route path="/completar-perfil" element={<CompletarPerfil />} />
        <Route path="/PaginaGestores" element={<PaginaGestores />} />
        <Route path="/PaginaMotorista" element={<PaginaMotorista />} />
      </Routes>
    </BrowserRouter>
  );
}
