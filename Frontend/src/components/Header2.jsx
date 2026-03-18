/* eslint-disable react/prop-types */
import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import logo from "../Pictures/logo1.jpeg";
import { useAuth0 } from "@auth0/auth0-react";
// ── Inject Header styles once ─────────────────────────────────────────────────
const HEADER_STYLES = `
  /* ── HEADER ── */
  .tc-header {
    position: fixed; top: 0; left: 0; right: 0; z-index: 300;
    display: flex; align-items: center; justify-content: space-between;
    padding: 14px 48px;
    transition: all 0.4s ease;
  }
  .tc-header.scrolled {
    background: rgba(5,13,26,0.85);
    backdrop-filter: blur(24px);
    border-bottom: 1px solid rgba(26,110,255,0.15);
    padding: 10px 48px;
  }
  .tc-header-logo {
    display: flex; align-items: center; gap: 12px;
    cursor: pointer; text-decoration: none;
  }
  .tc-header-logo-img-wrap {
    position: relative;
  }
  .tc-header-logo-img-wrap::before {
    content: '';
    position: absolute; inset: -2px;
    background: linear-gradient(135deg, #1a6eff, #00d4ff);
    border-radius: 14px;
    opacity: 0;
    transition: opacity 0.3s;
    filter: blur(6px);
  }
  .tc-header-logo-img-wrap:hover::before { opacity: 0.5; }
  .tc-header-logo img {
    position: relative;
    height: 44px; width: auto;
    border-radius: 12px;
    border: 1px solid rgba(255,255,255,0.1);
    transition: transform 0.3s;
    display: block;
  }
  .tc-header-logo:hover img { transform: scale(1.05); }
  .tc-header-logo-text { display: flex; flex-direction: column; }
  .tc-header-logo-name {
    font-family: 'Syne', sans-serif;
    font-size: 1.1rem; font-weight: 800;
    color: #f0f6ff; letter-spacing: -0.02em;
    line-height: 1;
  }
  .tc-header-logo-name span { color: #3d8bff; }
  .tc-header-logo-sub {
    font-size: 0.55rem; color: #6b8baa;
    letter-spacing: 0.2em; font-weight: 400;
    text-transform: uppercase;
  }

  /* nav links (dashboard mode) */
  .tc-header-links { display: flex; gap: 28px; align-items: center; }
  .tc-header-links a {
    color: #6b8baa; text-decoration: none;
    font-size: 0.87rem; transition: color 0.2s;
    font-family: 'DM Sans', sans-serif;
  }
  .tc-header-links a:hover { color: #f0f6ff; }

  /* hamburger (landing mode) */
  .tc-header-burger {
    width: 44px; height: 44px; border-radius: 12px;
    background: rgba(255,255,255,0.05);
    border: 1px solid rgba(255,255,255,0.1);
    backdrop-filter: blur(8px);
    display: flex; flex-direction: column;
    align-items: center; justify-content: center;
    gap: 5px; cursor: pointer;
    transition: all 0.2s;
  }
  .tc-header-burger:hover { background: rgba(255,255,255,0.1); border-color: rgba(255,255,255,0.2); }
  .tc-header-burger span {
    display: block; height: 2px; background: white; border-radius: 2px;
    transition: all 0.3s;
  }
  .tc-header-burger span:nth-child(1) { width: 20px; }
  .tc-header-burger span:nth-child(2) { width: 14px; margin-left: auto; }
  .tc-header-burger span:nth-child(3) { width: 20px; }
  .tc-header-burger.open span:nth-child(1) { transform: rotate(45deg) translate(5px, 5px); }
  .tc-header-burger.open span:nth-child(2) { opacity: 0; transform: scaleX(0); }
  .tc-header-burger.open span:nth-child(3) { transform: rotate(-45deg) translate(5px, -5px); }

  /* ── PROFILE BUTTON + DROPDOWN ── */
  .tc-profile-wrap { position: relative; }

  .tc-profile-btn {
    position: relative; width: 44px; height: 44px;
    border-radius: 50%; overflow: hidden;
    border: 2px solid rgba(26,110,255,0.35);
    cursor: pointer; background: none; padding: 0;
    transition: all 0.25s;
    box-shadow: 0 0 0 0 rgba(26,110,255,0.3);
  }
  .tc-profile-btn:hover {
    border-color: rgba(26,110,255,0.7);
    box-shadow: 0 0 0 3px rgba(26,110,255,0.15);
    transform: scale(1.05);
  }
  .tc-profile-btn img { width: 100%; height: 100%; object-fit: cover; display: block; }
  .tc-profile-online {
    position: absolute; bottom: 1px; right: 1px;
    width: 11px; height: 11px; border-radius: 50%;
    background: #00e887;
    border: 2px solid #050d1a;
    pointer-events: none;
  }

  /* dropdown */
  .tc-profile-menu {
    position: absolute; top: calc(100% + 12px); right: 0;
    width: 220px;
    background: rgba(8,18,38,0.97);
    backdrop-filter: blur(24px);
    border: 1px solid rgba(26,110,255,0.2);
    border-radius: 18px;
    overflow: hidden;
    box-shadow: 0 24px 60px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.04);
    animation: tcDropIn 0.2s ease both;
  }
  @keyframes tcDropIn {
    from { opacity:0; transform: translateY(-8px) scale(0.97); }
    to   { opacity:1; transform: translateY(0)     scale(1); }
  }

  /* user info header inside dropdown */
  .tc-profile-menu-header {
    padding: 16px 16px 12px;
    border-bottom: 1px solid rgba(26,110,255,0.12);
    display: flex; align-items: center; gap: 10px;
  }
  .tc-profile-menu-avatar {
    width: 36px; height: 36px; border-radius: 50%; overflow: hidden; flex-shrink: 0;
    border: 1.5px solid rgba(26,110,255,0.3);
  }
  .tc-profile-menu-avatar img { width: 100%; height: 100%; object-fit: cover; }
  .tc-profile-menu-name  { font-family: 'Syne', sans-serif; font-size: 0.88rem; font-weight: 700; color: #f0f6ff; }
  .tc-profile-menu-email { font-size: 0.7rem; color: #6b8baa; }

  /* menu items */
  .tc-profile-menu-items { padding: 6px; }
  .tc-profile-menu-item {
    width: 100%; display: flex; align-items: center; gap: 10px;
    padding: 10px 12px; border-radius: 12px;
    background: none; border: none; cursor: pointer;
    color: rgba(240,246,255,0.8); font-size: 0.85rem;
    font-family: 'DM Sans', sans-serif;
    text-align: left; transition: all 0.15s;
  }
  .tc-profile-menu-item:hover { background: rgba(26,110,255,0.1); color: #f0f6ff; }
  .tc-profile-menu-item .tc-mi-icon {
    width: 30px; height: 30px; border-radius: 9px;
    background: rgba(26,110,255,0.1);
    border: 1px solid rgba(26,110,255,0.15);
    display: flex; align-items: center; justify-content: center;
    font-size: 0.85rem; flex-shrink: 0;
    transition: all 0.15s;
  }
  .tc-profile-menu-item:hover .tc-mi-icon {
    background: rgba(26,110,255,0.2);
    border-color: rgba(26,110,255,0.35);
  }
  .tc-profile-menu-divider { height: 1px; background: rgba(26,110,255,0.1); margin: 4px 6px; }
  .tc-profile-menu-item.danger { color: rgba(255,100,100,0.8); }
  .tc-profile-menu-item.danger:hover { background: rgba(255,50,50,0.1); color: #ff6b6b; }
  .tc-profile-menu-item.danger .tc-mi-icon {
    background: rgba(255,50,50,0.08);
    border-color: rgba(255,50,50,0.15);
  }
  .tc-profile-menu-item.danger:hover .tc-mi-icon {
    background: rgba(255,50,50,0.18);
    border-color: rgba(255,50,50,0.35);
  }

  @media (max-width: 768px) {
    .tc-header, .tc-header.scrolled { padding: 12px 20px; }
    .tc-header-links { display: none; }
    .tc-header-logo-text { display: none; }
  }
`;

let _headerStylesInjected = false;
function injectHeaderStyles() {
  if (_headerStylesInjected || typeof document === "undefined") return;
  const el = document.createElement("style");
  el.textContent = HEADER_STYLES;
  document.head.appendChild(el);
  _headerStylesInjected = true;
}

// ─────────────────────────────────────────────────────────────────────────────
export default function Header({ isDashboard = false }) {
  const { logout } = useAuth0();
  injectHeaderStyles();

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
    logout({
      logoutParams: {
        returnTo: window.location.origin,
      },
    });
  }

  const menuItems = [
    { icon: "👤", label: "O meu perfil", path: "/profile" },
    { icon: "🚗", label: "As minhas viagens", path: "/trips" },
    { icon: "💳", label: "Carteira", path: "/wallet" },
    { icon: "⚙️", label: "Definições", path: "/settings" },
  ];

  return (
    <>
      <header className={`tc-header${scrolled ? " scrolled" : ""}`}>
        {/* LOGO */}
        <div
          className="tc-header-logo"
          onClick={() => navigate(isDashboard ? "/dashboard" : "/")}
        >
          <div className="tc-header-logo-img-wrap">
            <img src={logo} alt="TakeCab" />
          </div>
          <div className="tc-header-logo-text">
            <span className="tc-header-logo-name">
              Take<span>Cab</span>
            </span>
            <span className="tc-header-logo-sub">Premium Rides</span>
          </div>
        </div>

        {/* CENTRE LINKS (dashboard only) */}
        {isDashboard && (
          <nav className="tc-header-links">
            <a href="/dashboard">Viagens</a>
            <a href="/trips">Histórico</a>
            <a href="#">Promoções</a>
            <a href="#">Suporte</a>
          </nav>
        )}

        {/* RIGHT SIDE */}
        {isDashboard ? (
          /* ── Profile button + dropdown ── */
          <div className="tc-profile-wrap" ref={profileRef}>
            <button
              className="tc-profile-btn"
              onClick={() => setProfileOpen((p) => !p)}
              aria-label="Menu de perfil"
            >
              <img
                src="https://api.dicebear.com/7.x/thumbs/svg?seed=Joao"
                alt="Avatar"
              />
              <span className="tc-profile-online" />
            </button>

            {profileOpen && (
              <div className="tc-profile-menu">
                {/* User info */}
                <div className="tc-profile-menu-header">
                  <div className="tc-profile-menu-avatar">
                    <img
                      src="https://api.dicebear.com/7.x/thumbs/svg?seed=Joao"
                      alt="Avatar"
                    />
                  </div>
                  <div>
                    <div className="tc-profile-menu-name">João Silva</div>
                    <div className="tc-profile-menu-email">joao@takecab.pt</div>
                  </div>
                </div>

                {/* Items */}
                <div className="tc-profile-menu-items">
                  {menuItems.map((item) => (
                    <button
                      key={item.path}
                      className="tc-profile-menu-item"
                      onClick={() => go(item.path)}
                    >
                      <span className="tc-mi-icon">{item.icon}</span>
                      {item.label}
                    </button>
                  ))}

                  <div className="tc-profile-menu-divider" />

                  <button
                    className="tc-profile-menu-item danger"
                    onClick={handleLogout}
                  >
                    <span className="tc-mi-icon">🚪</span>
                    Terminar sessão
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          /* ── Hamburger (landing pages) ── */
          <button
            className={`tc-header-burger${menuOpen ? " open" : ""}`}
            onClick={() => setMenuOpen((p) => !p)}
            aria-label="Menu"
          >
            <span />
            <span />
            <span />
          </button>
        )}
      </header>
    </>
  );
}
