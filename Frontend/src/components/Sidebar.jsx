/* eslint-disable react/prop-types */
import { useState, useEffect } from "react";
import RegisterModal from "./RegisterModal";
import LoginModal from "./LoginModal";

const ICONS = {
  cab: (
    <>
      <path d="M6 16l1-5a4 4 0 0 1 4-3h2a4 4 0 0 1 4 3l1 5" />
      <path d="M7 16h10" />
      <path d="M6.5 16.5v2.5M17.5 16.5v2.5" />
      <path d="M8 8.5l.6-2.1A2.5 2.5 0 0 1 11 4.5h2a2.5 2.5 0 0 1 2.4 1.9L16 8.5" />
      <path d="M8.3 13.2h.01M15.7 13.2h.01" />
    </>
  ),
  key: (
    <>
      <path d="M21 8a5 5 0 1 1-9.6-2H3v4h2v2h2v2h4l2.2-2.2A5 5 0 0 1 21 8Z" />
      <path d="M16 8h.01" />
    </>
  ),
  spark: (
    <>
      <path d="M12 2l1.2 4.2L17.5 7.5l-4.3 1.3L12 13l-1.2-4.2-4.3-1.3 4.3-1.3L12 2Z" />
      <path d="M5 13l.7 2.4L8 16l-2.3.6L5 19l-.7-2.4L2 16l2.3-.6L5 13Z" />
    </>
  ),
  driver: (
    <>
      <circle cx="12" cy="8" r="4" />
      <path d="M6 21v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2" />
      <path d="M9 11l1.5 1.5L13 10" />
    </>
  ),
  mail: (
    <>
      <path d="M4 6h16v12H4z" />
      <path d="m4 7 8 6 8-6" />
    </>
  ),
  phone: (
    <>
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
    </>
  ),
};

function SvgIcon({ name, className = "" }) {
  const paths = ICONS[name];
  if (!paths) return null;
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {paths}
    </svg>
  );
}

export default function Sidebar({ isOpen, onClose }) {
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setMounted(true);
    } else {
      const timer = setTimeout(() => setMounted(false), 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  const visivel = mounted && isOpen;

  const navItems = [];

  return (
    <>
      {/* Fundo escuro */}
      <div
        onClick={onClose}
        className={`sidebar-fundo ${isOpen ? "aberto" : "fechado"}`}
      />

      {/* Painel lateral */}
      <aside
        className={`sidebar ${isOpen ? "aberto" : ""}`}
        aria-hidden={!isOpen}
      >
        <div className="sidebar-interior">
          <div className="sidebar-gradiente" />
          <div className="sidebar-conteudo">
            {/* Topo */}
            <header className="sidebar-topo">
              <div
                className={`sidebar-brand ${visivel ? "visivel" : "oculto"}`}
              >
                <div className="sidebar-brand-icone">
                  <SvgIcon name="cab" />
                </div>
                <div>
                  <div className="sidebar-brand-nome">
                    Take<span>Cab</span>
                  </div>
                  <div className="sidebar-brand-sub">Viagens premium</div>
                </div>
              </div>
              <button
                type="button"
                className="sidebar-fechar sidebar-fechar-animado"
                onClick={onClose}
                aria-label="Fechar menu"
              >
                <span aria-hidden="true" />
                <span aria-hidden="true" />
                <span aria-hidden="true" />
              </button>
            </header>

            {/* Conteúdo */}
            <main className="sidebar-main">
              {/* Card de auth */}
              <div
                className={`sidebar-card-auth ${visivel ? "visivel" : "oculto"}`}
              >
                <div className="sidebar-card-topo">
                  <div className="sidebar-card-icone">
                    <SvgIcon name="spark" />
                  </div>
                  <div>
                    <div className="sidebar-card-titulo">Peça Agora!</div>
                    <div className="sidebar-card-sub">
                      Rápido, Seguro e Confortável
                    </div>
                  </div>
                </div>

                <div className="sidebar-botoes">
                  <button
                    onClick={() => setIsLoginOpen(true)}
                    className="sidebar-btn-entrar"
                  >
                    <SvgIcon name="key" />
                    Entrar
                  </button>
                  <button
                    onClick={() => setIsRegisterOpen(true)}
                    className="sidebar-btn-registar"
                  >
                    <SvgIcon name="spark" />
                    Registar
                  </button>
                </div>
              </div>

              {/* Navegação */}
              <div
                className={`sidebar-nav-wrap ${visivel ? "visivel" : "oculto"}`}
              >
                <nav className="sidebar-nav">
                  {navItems.map((item) => (
                    <a
                      key={item.label}
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        onClose?.();
                      }}
                      className={`sidebar-item ${visivel ? "visivel" : "oculto"}`}
                      style={{ transitionDelay: `${item.delay}ms` }}
                    >
                      <span className="sidebar-item-icone">
                        <SvgIcon name={item.icon} />
                      </span>
                      <div className="sidebar-item-texto">
                        <span className="sidebar-item-label">{item.label}</span>
                        <span className="sidebar-item-desc">{item.desc}</span>
                      </div>
                      <span className="sidebar-item-seta">→</span>
                    </a>
                  ))}
                </nav>
              </div>
            </main>

            {/* Rodapé */}
            <footer className="sidebar-rodape">
              <p className="sidebar-rodape-copy">
                © {new Date().getFullYear()} TakeCab
              </p>
            </footer>
          </div>
        </div>
      </aside>

      <RegisterModal
        isOpen={isRegisterOpen}
        onClose={() => setIsRegisterOpen(false)}
      />
      <LoginModal isOpen={isLoginOpen} onClose={() => setIsLoginOpen(false)} />
    </>
  );
}
