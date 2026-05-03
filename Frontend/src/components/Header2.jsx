/* eslint-disable react/prop-types */
import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "./Sidebar";
import logo from "../Pictures/logo1.jpeg";

export default function Header({ isDashboard = false }) {
  const cliente = JSON.parse(localStorage.getItem("cliente") || "{}");

  const [menuOpen, setMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const profileRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    const onClickOutside = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setProfileOpen(false);
      }
    };
    window.addEventListener("scroll", onScroll);
    document.addEventListener("mousedown", onClickOutside);
    return () => {
      window.removeEventListener("scroll", onScroll);
      document.removeEventListener("mousedown", onClickOutside);
    };
  }, []);

  function go(path) {
    setProfileOpen(false);
    navigate(path);
  }

  function handleLogout() {
    setProfileOpen(false);
    localStorage.removeItem("token");
    localStorage.removeItem("cliente");
    localStorage.removeItem("role");
    navigate("/");
  }

  const menuItems = [
    { icon: "👤", label: "O meu perfil", path: "/profile" },
    { icon: "🚗", label: "As minhas viagens", path: "/trips" },
    { icon: "💳", label: "Carteira", path: "/wallet" },
    { icon: "⚙️", label: "Definições", path: "/settings" },
  ];

  return (
    <>
      <header className={`header${scrolled ? " scrolled" : ""}`}>
        {/* LOGO */}
        <div
          className="header-logo"
          onClick={() => navigate(isDashboard ? "/dashboard" : "/")}
        >
          <div className="header-logo-imagem">
            <img src={logo} alt="TakeCab" />
          </div>
          <div className="header-logo-texto">
            <span className="header-logo-nome">
              Take<span>Cab</span>
            </span>
            <span className="header-logo-sub">Premium Rides</span>
          </div>
        </div>

        {/* NAV CENTRAL (só no dashboard) */}
        {isDashboard && (
          <nav className="header-nav">
            <a href="/dashboard">Viagens</a>
            <a href="/trips">Histórico</a>
            <a href="#">Promoções</a>
            <a href="#">Suporte</a>
          </nav>
        )}

        {/* LADO DIREITO */}
        {isDashboard ? (
          <div className="perfil-btn-wrap" ref={profileRef}>
            <button
              className="perfil-btn"
              onClick={() => setProfileOpen((p) => !p)}
              aria-label="Menu de perfil"
            >
              <img
                src={`https://api.dicebear.com/7.x/thumbs/svg?seed=${cliente.nome || "user"}`}
                alt="Avatar"
              />
              <span className="perfil-btn-online" />
            </button>

            {profileOpen && (
              <div className="perfil-menu">
                <div className="perfil-menu-topo">
                  <div className="perfil-menu-avatar">
                    <img
                      src={`https://api.dicebear.com/7.x/thumbs/svg?seed=${cliente.nome || "user"}`}
                      alt="Avatar"
                    />
                  </div>
                  <div>
                    <div className="perfil-menu-nome">
                      {cliente.nome || "Utilizador"}
                    </div>
                    <div className="perfil-menu-email">
                      {cliente.email || ""}
                    </div>
                  </div>
                </div>

                <div className="perfil-menu-lista">
                  {menuItems.map((item) => (
                    <button
                      key={item.path}
                      className="perfil-menu-item"
                      onClick={() => go(item.path)}
                    >
                      <span className="perfil-menu-icone">{item.icon}</span>
                      {item.label}
                    </button>
                  ))}
                  <div className="perfil-menu-divisor" />
                  <button
                    className="perfil-menu-item danger"
                    onClick={handleLogout}
                  >
                    <span className="perfil-menu-icone">🚪</span>
                    Terminar sessão
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <button
            className={`header-menu-btn${menuOpen ? " open" : ""}`}
            onClick={() => setMenuOpen((p) => !p)}
            aria-label="Menu"
          >
            <span />
            <span />
            <span />
          </button>
        )}
      </header>

      {/* Sidebar só nas páginas de landing */}
      {!isDashboard && (
        <Sidebar isOpen={menuOpen} onClose={() => setMenuOpen(false)} />
      )}
    </>
  );
}
