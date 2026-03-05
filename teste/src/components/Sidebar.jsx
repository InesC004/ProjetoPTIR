/* eslint-disable react/prop-types */

export default function Sidebar({ isOpen, onClose }) {
  return (
    <>
      <div />

      {/* SIDEBAR */}
      <aside
        className={`fixed top-0 right-0 h-full w-[340px] max-w-[90vw] z-50
        transform transition-transform duration-300 ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Painel com gradiente + borda */}
        <div className="h-full bg-gradient-to-b from-[#0c2b4e] via-[#0c2b4e]/95 to-[#071b33] text-white border-l border-white/10 shadow-[0_0_50px_rgba(0,0,0,0.55)]">
          {/* Topo */}
          <div className="p-6 flex items-center justify-between border-b border-white/10">
            <div className="flex items-center gap-3"></div>
            <button
              onClick={onClose}
              aria-label="Fechar menu"
              className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/15 transition flex items-center justify-center text-white/90"
            >
              ✕
            </button>
          </div>

          {/* Conteúdo */}
          <div className="p-6 space-y-6">
            {/* CTA Buttons */}
            <div className="space-y-3">
              <button className="w-full py-3 rounded-2xl bg-white text-[#0c2b4e] font-semibold hover:bg-white/90 transition shadow-lg shadow-black/10">
                Login
              </button>

              <button className="w-full py-3 rounded-2xl font-semibold transition relative overflow-hidden">
                <span className="absolute inset-0 bg-gradient-to-r from-blue-500 via-blue-400 to-cyan-300 opacity-95" />
                <span className="relative text-[#061a2f]">Registo</span>
              </button>
            </div>

            {/* Secção links */}
            <div>
              <p className="text-white/60 text-xs uppercase tracking-widest mb-3">
                Navegação
              </p>

              <nav className="space-y-2">
                <SidebarItem label="Sobre" onClick={onClose} />
                <SidebarItem label="Contacto" onClick={onClose} />
              </nav>
            </div>

            {/* Secção extra (opcional) */}
          </div>

          {/* Rodapé */}
          <div className="absolute bottom-0 left-0 w-full p-6 border-t border-white/10">
            <p className="text-white/60 text-xs">
              © {new Date().getFullYear()} TakeCab
            </p>
          </div>
        </div>
      </aside>
    </>
  );
}

function SidebarItem({ label, onClick }) {
  return (
    <a
      href="#"
      onClick={onClick}
      className="flex items-center justify-between px-4 py-3 rounded-2xl
                 bg-white/5 hover:bg-white/10 border border-white/10
                 transition group"
    >
      <span className="text-white/90 font-medium">{label}</span>
      <span className="text-white/50 group-hover:text-white/80 transition">
        ›
      </span>
    </a>
  );
}
