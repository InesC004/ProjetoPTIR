import { useState, useEffect } from "react";
import Sidebar from "./Sidebar";
import logo from "../Pictures/logo1.jpeg";

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setLoaded(true);
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  function toggleMenu() {
    setIsMenuOpen((prev) => !prev);
  }

  function closeMenu() {
    setIsMenuOpen(false);
  }

  return (
    <>
      <header
        className={`fixed top-0 left-0 w-full z-50 px-6 md:px-10 py-4 flex items-center justify-between transition-all duration-500 ${
          scrolled
            ? "bg-[#0a1628]/80 backdrop-blur-xl border-b border-white/5 py-3"
            : "bg-transparent"
        }`}
      >
        {/* LOGO */}
        <div
          className={`transform transition-all duration-700 delay-100 ${
            loaded ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-8"
          }`}
        >
          <div className="flex items-center gap-3 group cursor-pointer">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-[#3b82f6] to-[#60a5fa] rounded-xl blur-lg opacity-0 group-hover:opacity-50 transition-opacity duration-500" />
              <img
                src={logo}
                className="relative h-12 w-auto rounded-xl border border-white/10 transition-transform duration-300 group-hover:scale-105"
              />
            </div>
            <div className="hidden sm:block">
              <span className="text-white font-semibold text-lg tracking-wide">
                Take<span className="text-[#60a5fa]">Cab</span>
              </span>
              <div className="text-white/40 text-xs tracking-widest">
                PREMIUM RIDES
              </div>
            </div>
          </div>
        </div>

        <div>
          {/* MENU BUTTON */}
          <button
            onClick={toggleMenu}
            className="relative w-12 h-12 rounded-xl bg-white/5 border border-white/10 backdrop-blur-sm
                       flex items-center justify-center hover:bg-white/10 hover:border-white/20 
                       transition-all duration-300 group"
          >
            <div className="relative w-5 h-4 flex flex-col justify-between">
              <span
                className={`block w-full h-0.5 bg-white rounded-full transform origin-center transition-all duration-300 ${
                  isMenuOpen ? "rotate-45 translate-y-[7px]" : ""
                }`}
              />
              <span
                className={`block w-3/4 h-0.5 bg-white/70 rounded-full ml-auto transition-all duration-300 ${
                  isMenuOpen ? "opacity-0 scale-0" : ""
                }`}
              />
              <span
                className={`block w-full h-0.5 bg-white rounded-full transform origin-center transition-all duration-300 ${
                  isMenuOpen ? "-rotate-45 -translate-y-[7px]" : ""
                }`}
              />
            </div>
          </button>
        </div>
      </header>

      <Sidebar isOpen={isMenuOpen} onClose={closeMenu} />
    </>
  );
}
