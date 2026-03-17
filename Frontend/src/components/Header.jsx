import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "./Sidebar";
import logo from "../Pictures/logo1.jpeg";

export default function Header({ isDashboard = false }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    setLoaded(true);

    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };

    const handleClickOutside = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setProfileOpen(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      window.removeEventListener("scroll", handleScroll);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  function toggleMenu() {
    setIsMenuOpen((prev) => !prev);
  }

  function closeMenu() {
    setIsMenuOpen(false);
  }

  function goTo(path) {
    setProfileOpen(false);
    navigate(path);
  }

  function handleLogout() {
    setProfileOpen(false);
    navigate("/");
  }

  return (
    <>
      <header
        className={`fixed top-0 left-0 w-full z-50 px-4 sm:px-6 lg:px-10 py-4 flex items-center justify-between transition-all duration-500 ${
          scrolled
            ? "bg-[#0a1628]/80 backdrop-blur-xl border-b border-white/5 py-3"
            : "bg-transparent"
        }`}
      >
        <div
          className={`transform transition-all duration-700 delay-100 ${
            loaded ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-8"
          }`}
        >
          <div
            onClick={() => navigate(isDashboard ? "/dashboard" : "/")}
            className="flex items-center gap-3 group cursor-pointer"
          >
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-[#3b82f6] to-[#60a5fa] rounded-xl blur-lg opacity-0 group-hover:opacity-50 transition-opacity duration-500" />
              <img
                src={logo}
                alt="TakeCab logo"
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

        {isDashboard ? (
          <div className="relative" ref={profileRef}>
            <button
              onClick={() => setProfileOpen((prev) => !prev)}
              className="relative w-12 h-12 rounded-full overflow-hidden border border-white/10 hover:scale-105 transition-all duration-300"
            >
              <img
                src="https://api.dicebear.com/7.x/thumbs/svg?seed=Joao"
                className="w-full h-full object-cover"
              />

              {/* online indicator */}
              <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-[#0a1628] rounded-full" />
            </button>

            {profileOpen && (
              <div className="absolute right-0 mt-3 w-56 rounded-2xl border border-white/10 bg-[#0a1628]/95 backdrop-blur-xl shadow-2xl overflow-hidden">
                <button
                  onClick={() => goTo("/profile")}
                  className="w-full px-4 py-3 text-left text-sm text-white/80 hover:bg-white/[0.06] transition-colors"
                >
                  Profile
                </button>

                <button
                  onClick={() => goTo("/wallet")}
                  className="w-full px-4 py-3 text-left text-sm text-white/80 hover:bg-white/[0.06] transition-colors"
                >
                  Wallet
                </button>

                <button
                  onClick={() => goTo("/trips")}
                  className="w-full px-4 py-3 text-left text-sm text-white/80 hover:bg-white/[0.06] transition-colors"
                >
                  Trip History
                </button>

                <div className="h-px bg-white/10" />

                <button
                  onClick={handleLogout}
                  className="w-full px-4 py-3 text-left text-sm text-red-300 hover:bg-white/[0.06] transition-colors"
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        ) : (
          <button
            onClick={toggleMenu}
            className="relative w-12 h-12 rounded-xl bg-white/5 border border-white/10 backdrop-blur-sm flex items-center justify-center hover:bg-white/10 hover:border-white/20 transition-all duration-300 group"
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
        )}
      </header>

      {!isDashboard && <Sidebar isOpen={isMenuOpen} onClose={closeMenu} />}
    </>
  );
}