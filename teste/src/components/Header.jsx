import { useState } from "react";
import Sidebar from "./Sidebar";

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  function toggleMenu() {
    setIsMenuOpen((prev) => !prev);
  }

  function closeMenu() {
    setIsMenuOpen(false);
  }

  return (
    <>
      <header className="fixed top-0 left-0 w-full z-50 px-6 md:px-10 py-5 flex items-center justify-between bg-transparent">
        <h1 className="text-white text-xl md:text-2xl font-semibold tracking-wide">
          TakeCab
        </h1>

        <button
          onClick={toggleMenu}
          className="w-11 h-11 rounded-full bg-white/10 backdrop-blur 
                     flex items-center justify-center hover:bg-white/20 transition"
        >
          <div className="relative w-5 h-5">
            <span
              className={`absolute left-0 top-1 w-5 h-0.5 bg-white transition-transform duration-300 ${
                isMenuOpen ? "rotate-45 translate-y-2" : ""
              }`}
            />
            <span
              className={`absolute left-0 top-2.5 w-5 h-0.5 bg-white transition-opacity duration-300 ${
                isMenuOpen ? "opacity-0" : "opacity-100"
              }`}
            />
            <span
              className={`absolute left-0 top-4 w-5 h-0.5 bg-white transition-transform duration-300 ${
                isMenuOpen ? "-rotate-45 -translate-y-2" : ""
              }`}
            />
          </div>
        </button>
      </header>

      {/* Sidebar separado */}
      <Sidebar isOpen={isMenuOpen} onClose={closeMenu} />
    </>
  );
}
