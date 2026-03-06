/* eslint-disable react/prop-types */
import { useState, useEffect } from "react";
import RegisterModal from "./RegisterModal";

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
  location: (
    <>
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
      <circle cx="12" cy="10" r="3" />
    </>
  ),
  star: (
    <>
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
    </>
  ),
};

export default function Sidebar({ isOpen, onClose }) {
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setMounted(true);
    } else {
      const timer = setTimeout(() => setMounted(false), 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  return (
    <>
      {/* FUNDO ESCURO */}
      <div
        onClick={onClose}
        className={`fixed inset-0 z-40 transition-all duration-500 ${
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        style={{
          background:
            "radial-gradient(ellipse at right, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.85) 100%)",
          backdropFilter: isOpen ? "blur(8px)" : "blur(0px)",
        }}
      />

      <aside
        className={`fixed top-0 right-0 z-50 h-full w-[400px] max-w-[95vw]
        transform transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]
        ${isOpen ? "translate-x-0" : "translate-x-full"}`}
        aria-hidden={!isOpen}
      >
        <div className="h-full text-white flex flex-col overflow-hidden relative">
          {/* BACKGROUND GRADIENT */}
          <div className="absolute inset-0 bg-gradient-to-b from-[#0a1628] via-[#0d1f3a] to-[#0a1628]" />

          {/* CONTENT */}
          <div className="relative z-10 h-full flex flex-col">
            {/* TOPO */}
            <header className="p-6 pt-5">
              <div className="flex items-start justify-between">
                <Brand mounted={mounted && isOpen} />

                <button
                  onClick={onClose}
                  aria-label="Close menu"
                  className="w-10 h-10 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 
                             transition-all duration-300 flex items-center justify-center group
                             hover:rotate-90 hover:border-white/20"
                >
                  <svg
                    className="w-5 h-5 text-white/70 group-hover:text-white transition-colors"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
            </header>

            <main className="px-6 pb-6 flex-1 overflow-auto">
              {/* CARD do login e register */}
              <section
                className={`rounded-2xl border border-white/10 bg-gradient-to-br from-white/5 to-white/[0.02] p-5 backdrop-blur-sm transition-all duration-500 delay-200 ${
                  mounted && isOpen
                    ? "opacity-100 translate-y-0"
                    : "opacity-0 translate-y-4"
                }`}
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#3b82f6]/20 to-[#60a5fa]/10 flex items-center justify-center">
                    <Icon name="spark" className="w-5 h-5 text-[#60a5fa]" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white">Start Now !</h3>
                    <p className="text-xs text-white/50">
                      Fast, Safe and confortable
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <button className="group relative py-3.5 rounded-xl font-semibold transition-all duration-300 overflow-hidden border border-white/10 hover:border-white/20">
                    <span className="absolute inset-0 bg-white/5 group-hover:bg-white/10 transition-colors" />
                    <span className="relative flex items-center justify-center gap-2 text-white/90 group-hover:text-white">
                      <Icon name="key" className="w-4 h-4" />
                      Login
                    </span>
                  </button>

                  <button
                    onClick={() => setIsRegisterOpen(true)}
                    className="group relative py-3.5 rounded-xl font-semibold transition-all duration-300 overflow-hidden hover:shadow-[0_0_30px_rgba(59,130,246,0.3)] hover:scale-[1.02]"
                  >
                    <span className="absolute inset-0 bg-gradient-to-r from-[#1d5eff] via-[#3b82f6] to-[#60a5fa]" />
                    <span className="absolute inset-0 bg-gradient-to-r from-[#60a5fa] to-[#1d5eff] opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    <span className="relative flex items-center justify-center gap-2 text-white">
                      <Icon name="spark" className="w-4 h-4" />
                      Register
                    </span>
                  </button>
                </div>
              </section>

              {/* NAVEGAÇÃO */}
              <section
                className={`mt-8 transition-all duration-500 delay-300 ${
                  mounted && isOpen
                    ? "opacity-100 translate-y-0"
                    : "opacity-0 translate-y-4"
                }`}
              >
                <p className="text-white/40 text-xs uppercase tracking-[0.2em] mb-4 ml-1">
                  Explorar
                </p>

                <nav className="space-y-2">
                  <MenuItem
                    label="Want to be a Driver?"
                    description="Join our team"
                    icon="driver"
                    onClick={onClose}
                    delay={350}
                    mounted={mounted && isOpen}
                  />
                  <MenuItem
                    label="Contact"
                    description="Contact us"
                    icon="mail"
                    onClick={onClose}
                    delay={400}
                    mounted={mounted && isOpen}
                  />
                  <MenuItem
                    label="Suport 24/7"
                    description="+351 xxx xxx xxx"
                    icon="phone"
                    onClick={onClose}
                    delay={450}
                    mounted={mounted && isOpen}
                  />
                </nav>
              </section>
            </main>

            {/* RODAPÉ */}
            <footer className="p-6 pt-0">
              <div className="h-px   via-white/10" />
              <div className="flex items-center justify-between">
                <p className="text-white/30 text-xs">
                  © {new Date().getFullYear()} TakeCab
                </p>
              </div>
            </footer>
          </div>
        </div>
      </aside>

      <RegisterModal
        isOpen={isRegisterOpen}
        onClose={() => setIsRegisterOpen(false)}
      />
    </>
  );
}

function Brand({ mounted }) {
  return (
    <div
      className={`flex items-center gap-3 transition-all duration-500 ${
        mounted ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-4"
      }`}
    >
      <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#0d2b4f] to-[#1a3a5c] border border-white/10 flex items-center justify-center shadow-lg">
        <Icon name="cab" className="w-6 h-6 text-white" />
      </div>

      <div className="leading-tight">
        <div className="text-lg font-semibold tracking-wide">
          Take<span className="text-[#60a5fa]">Cab</span>
        </div>
        <div className="text-xs text-white/50 tracking-wider">
          Premium Rides
        </div>
      </div>
    </div>
  );
}

function MenuItem({ label, description, icon, onClick, delay, mounted }) {
  return (
    <a
      href="#"
      onClick={(e) => {
        e.preventDefault();
        onClick?.();
      }}
      className={`group flex items-center gap-4 px-4 py-3.5 rounded-xl border border-white/5 bg-white/[0.02] 
                  hover:bg-white/5 hover:border-white/10 transition-all duration-300
                  ${mounted ? "opacity-100 translate-x-0" : "opacity-0 translate-x-4"}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      <span className="w-11 h-11 rounded-xl bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10 flex items-center justify-center group-hover:border-[#3b82f6]/30 group-hover:shadow-[0_0_15px_rgba(59,130,246,0.1)] transition-all duration-300">
        <Icon
          name={icon}
          className="w-5 h-5 text-white/70 group-hover:text-[#60a5fa] transition-colors"
        />
      </span>

      <div className="flex-1">
        <span className="text-white/90 font-medium block group-hover:text-white transition-colors">
          {label}
        </span>
        <span className="text-xs text-white/40">{description}</span>
      </div>

      <span className="text-white/20 group-hover:text-[#60a5fa] group-hover:translate-x-1 transition-all duration-300">
        →
      </span>
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
