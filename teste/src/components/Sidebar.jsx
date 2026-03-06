/* eslint-disable react/prop-types */
import { useState } from "react";
import RegisterModal from "./RegisterModal";

/* Objecto com as icons usadas no Sidebar */
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
  info: (
    <>
      <path d="M12 17v-6" />
      <path d="M12 8h.01" />
      <path d="M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
    </>
  ),
  mail: (
    <>
      <path d="M4 6h16v12H4z" />
      <path d="m4 7 8 6 8-6" />
    </>
  ),
};

/**
 * SideBar
 * - isOpen:  menu está aberto
 * - onClose: função para fechar
 */
export default function Sidebar({ isOpen, onClose }) {
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);

  return (
    <>
      {/* FUNDO ESCURO */}
      <div
        onClick={onClose}
        className={`fixed inset-0 z-40 bg-black/60 transition-opacity duration-300 ${
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
      />

      <aside
        className={`fixed top-0 right-0 z-50 h-full w-[360px] max-w-[92vw]
        transform transition-transform duration-300 ease-out
        ${isOpen ? "translate-x-0" : "translate-x-full"}`}
        aria-hidden={!isOpen}
      >
        <div
          className="h-full text-white flex flex-col border-l border-white/10 backdrop-blur-2xl shadow-[ -24px_0_80px_rgba(0,0,0,0.72) ]
                        bg-gradient-to-b from-[#0D2B4F]/85 via-[#0A2341]/78 to-[#071B33]/82"
        >
          {/* TOPO */}
          <header className="p-6">
            <div className="flex items-start justify-between">
              <Brand />

              <button
                onClick={onClose}
                aria-label="Close menu"
                className="w-11 h-11 rounded-full bg-white/10 hover:bg-white/20 border border-white/10 transition flex items-center justify-center"
              >
                <span className="text-white/90 text-xl leading-none">×</span>
              </button>
            </div>

            <div className="mt-5 h-px bg-gradient-to-r from-transparent via-white/15 to-transparent" />
          </header>

          <main className="px-6 pb-6 flex-1 overflow-auto">
            {/* CARD do login e register */}
            <section className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <p className="text-sm text-white/70">
                Request rides in seconds — fast, safe, and comfortable.
              </p>

              <div className="mt-4 grid grid-cols-2 gap-3">
                <button className="w-full py-3 rounded-xl bg-white/10 hover:bg-white/20 border border-white/10 transition font-semibold">
                  <span className="inline-flex items-center justify-center gap-2">
                    <Icon name="key" className="w-4 h-4 text-white/80" />
                    Login
                  </span>
                </button>

                <button
                  onClick={() => setIsRegisterOpen(true)}
                  className="w-full py-3 rounded-xl font-semibold relative overflow-hidden transition"
                >
                  <span className="absolute inset-0 bg-gradient-to-r from-[#1E5AA8] via-[#1B62B8] to-[#2A74D6] opacity-90" />
                  <span className="relative inline-flex items-center justify-center gap-2 text-white">
                    <Icon name="spark" className="w-4 h-4" />
                    Register
                  </span>
                </button>
              </div>
            </section>

            {/* NAVEGAÇÃO */}
            <section className="mt-8">
              <p className="text-white/50 text-xs uppercase tracking-[0.22em]">
                Navigation
              </p>

              <nav className="mt-3 space-y-2">
                <MenuItem
                  label="Want to be a Driver?"
                  icon="info"
                  onClick={onClose}
                />
                <MenuItem label="Contact" icon="mail" onClick={onClose} />
              </nav>
            </section>
          </main>

          {/* RODAPÉ */}
          <footer className="p-6">
            <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent mb-4" />
            <p className="text-white/40 text-xs">
              © {new Date().getFullYear()} TakeCab
            </p>
          </footer>
        </div>
      </aside>

      <RegisterModal
        isOpen={isRegisterOpen}
        onClose={() => setIsRegisterOpen(false)}
      />
    </>
  );
}

function Brand() {
  return (
    <div className="flex items-center gap-3">
      <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-[#0D2B4F]/95 to-[#173b6b]/90 border border-white/10 flex items-center justify-center">
        <Icon name="cab" className="w-6 h-6 text-white" />
      </div>

      <div className="leading-tight">
        <div className="text-lg font-semibold tracking-wide">TakeCab</div>
        <div className="text-xs text-white/60">Comfort & Safety</div>
      </div>
    </div>
  );
}

function MenuItem({ label, icon, onClick }) {
  return (
    <a
      href="#"
      onClick={(e) => {
        e.preventDefault();
        onClick?.();
      }}
      className="flex items-center justify-between px-4 py-3 rounded-2xl border border-white/10 bg-white/5 hover:bg-white/10 transition"
    >
      <span className="flex items-center gap-3">
        <span className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center">
          <Icon name={icon} className="w-5 h-5 text-white/80" />
        </span>

        <span className="text-white/90 font-medium">{label}</span>
      </span>

      <span className="text-white/40">→</span>
    </a>
  );
}

function Icon({ name, className = "" }) {
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
