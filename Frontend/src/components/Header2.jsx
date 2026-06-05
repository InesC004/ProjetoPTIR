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
  ];

  const primeiroNome = cliente.nome ? cliente.nome.split(" ")[0] : "Eu";
  const inicial = primeiroNome.charAt(0).toUpperCase();

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
              style={{
                all: "unset",
                display: "flex",
                alignItems: "center",
                gap: "9px",
                padding: "6px 13px 6px 7px",
                background: profileOpen
                  ? "rgba(255,255,255,0.1)"
                  : "rgba(255,255,255,0.06)",
                border: "1px solid rgba(255,255,255,0.12)",
                borderRadius: "999px",
                cursor: "pointer",
                transition: "all 0.2s ease",
                boxShadow: profileOpen
                  ? "0 0 0 2.5px rgba(61,139,255,0.4), inset 0 1px 0 rgba(255,255,255,0.08)"
                  : "inset 0 1px 0 rgba(255,255,255,0.05)",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "rgba(255,255,255,0.1)";
                e.currentTarget.style.borderColor = "rgba(255,255,255,0.2)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = profileOpen
                  ? "rgba(255,255,255,0.1)"
                  : "rgba(255,255,255,0.06)";
                e.currentTarget.style.borderColor = "rgba(255,255,255,0.12)";
              }}
            >
              {/* Bolinha com inicial */}
              <span
                style={{
                  width: 26,
                  height: 26,
                  borderRadius: "50%",
                  background:
                    "linear-gradient(135deg, #3d8bff 0%, #6c4dff 100%)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "0.7rem",
                  fontWeight: 700,
                  color: "#fff",
                  flexShrink: 0,
                  letterSpacing: 0,
                  boxShadow: "0 2px 8px rgba(61,139,255,0.45)",
                }}
              >
                {inicial}
              </span>

              {/* Nome */}
              <span
                style={{
                  color: "#f0f4ff",
                  fontSize: "0.83rem",
                  fontWeight: 600,
                  letterSpacing: "0.015em",
                  whiteSpace: "nowrap",
                }}
              >
                {primeiroNome}
              </span>

              {/* Chevron SVG */}
              <svg
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="none"
                stroke="rgba(255,255,255,0.5)"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                style={{
                  flexShrink: 0,
                  transition: "transform 0.25s ease",
                  transform: profileOpen ? "rotate(180deg)" : "rotate(0deg)",
                }}
              >
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </button>

            {profileOpen && (
              <div className="perfil-menu">
                <div className="perfil-menu-topo">
                  <div
                    className="perfil-menu-avatar"
                    style={{
                      background:
                        "linear-gradient(135deg, #3d8bff 0%, #6c4dff 100%)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "1.1rem",
                      fontWeight: 700,
                      color: "#fff",
                      boxShadow: "0 2px 10px rgba(61,139,255,0.45)",
                    }}
                  >
                    {inicial}
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

      {!isDashboard && (
        <Sidebar isOpen={menuOpen} onClose={() => setMenuOpen(false)} />
      )}
    </>
  );
}
