import { BrowserRouter, Routes, Route } from "react-router-dom";
import Homepage from "./pages/Homepage"; // Homepage.jsx esta no ficheiro pages/
import About from "./pages/About";
import Dashboard from "./pages/Dashboard";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Homepage />} />
        <Route path="/about" element={<About />} />
        <Route path="/dashboard" element={<Dashboard />} />
      </Routes>
    </BrowserRouter>
  );
}
