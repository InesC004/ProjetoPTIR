import { useState, useEffect } from "react";
import { LogIn, UserPlus } from "lucide-react";
import Header from "../components/Header2";
import LoginModal from "../components/LoginModal";
import RegisterModal from "../components/RegisterModal";
import backgroundVideo from "../Pictures/fundo.mp4";

export default function Homepage() {
  const [loaded, setLoaded] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);

  useEffect(() => {
    setLoaded(true);

    const handleMouseMove = (e) => {
      setMousePos({
        x: (e.clientX / window.innerWidth - 0.5) * 14,
        y: (e.clientY / window.innerHeight - 0.5) * 14,
      });
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#071426] text-white">
      {/*
        FIX AXE: "All page content should be contained by landmarks"
        O <video> e os overlays decorativos estavam fora de qualquer landmark.
        aria-hidden="true" diz ao axe (e leitores de ecrã) para ignorar estes
        elementos decorativos — eles não têm conteúdo útil para utilizadores
        de tecnologias assistivas.
      */}
      <div aria-hidden="true">
        {/* VIDEO de fundo — decorativo */}
        <video
          autoPlay
          loop
          muted
          playsInline
          tabIndex={-1}
          className="absolute inset-0 h-full w-full scale-105 object-cover opacity-90"
        >
          <source src={backgroundVideo} type="video/mp4" />
        </video>

        {/* OVERLAYS decorativos */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#061426]/70 via-[#061426]/35 to-[#061426]/80" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#061426]/85 via-[#061426]/25 to-[#061426]/85" />

        {/* LIGHT BLOBS decorativos */}
        <div
          className="absolute left-[12%] top-[28%] h-80 w-80 rounded-full bg-sky-400/20 blur-[90px]"
          style={{ transform: `translate(${mousePos.x}px, ${mousePos.y}px)` }}
        />
        <div
          className="absolute right-[18%] top-[42%] h-72 w-72 rounded-full bg-yellow-400/15 blur-[100px]"
          style={{ transform: `translate(${-mousePos.x}px, ${-mousePos.y}px)` }}
        />
      </div>

      {/* CONTENT — todo dentro de landmarks */}
      <div className="relative z-10 min-h-screen">
        <Header />

        <main className="flex min-h-screen items-center justify-center px-6 text-center">
          {/* wrapper para compensar o header */}
          <div className="flex min-h-[calc(100vh-80px)] items-center justify-center">
            <section
              aria-label="Apresentação do serviço"
              className={`mx-auto max-w-5xl text-center flex flex-col items-center transition-all duration-1000 ${
                loaded
                  ? "translate-y-0 opacity-100"
                  : "translate-y-10 opacity-0"
              }`}
            >
              {/* TITLE */}
              <h1 className="text-5xl font-semibold leading-[1.03] tracking-[-0.05em] text-white drop-shadow-2xl md:text-7xl lg:text-8xl">
                Viaje com
                <br />
                <span className="bg-gradient-to-r from-sky-300 via-blue-400 to-blue-600 bg-clip-text text-transparent">
                  conforto
                </span>{" "}
                <span className="font-light text-white/85">e</span>{" "}
                <span className="bg-gradient-to-r from-yellow-200 via-yellow-400 to-amber-500 bg-clip-text text-transparent">
                  segurança
                </span>
              </h1>

              {/* SUBTITLE */}
              <p className="mx-auto mt-7 max-w-2xl text-base font-normal leading-8 text-white/75 md:text-xl">
                Peça a sua viagem em poucos segundos. Uma experiência moderna,
                confortável e confiável, onde quer que esteja.
              </p>

              <div className="mt-16 flex w-full max-w-xl flex-col items-center justify-center gap-4 sm:flex-row md:mt-20">
                <button
                  type="button"
                  onClick={() => setIsRegisterOpen(true)}
                  className="group inline-flex min-h-14 w-full items-center justify-center gap-3 rounded-full bg-white px-8 py-4 text-base font-extrabold text-[#071426] shadow-[0_18px_50px_rgba(255,255,255,0.2)] outline-none transition duration-300 hover:-translate-y-1 hover:bg-sky-50 hover:shadow-[0_24px_65px_rgba(255,255,255,0.28)] focus-visible:ring-4 focus-visible:ring-white/50 sm:w-56 md:text-lg"
                >
                  <UserPlus
                    size={21}
                    className="text-blue-600 transition group-hover:scale-110"
                  />
                  Criar conta
                </button>

                <button
                  type="button"
                  onClick={() => setIsLoginOpen(true)}
                  className="group inline-flex min-h-14 w-full items-center justify-center gap-3 rounded-full border border-white/45 bg-white/[0.06] px-8 py-4 text-base font-extrabold text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.18),0_18px_48px_rgba(0,0,0,0.2)] outline-none backdrop-blur-xl transition duration-300 hover:-translate-y-1 hover:border-white/70 hover:bg-white/[0.14] hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.28),0_24px_60px_rgba(0,0,0,0.28)] focus-visible:ring-4 focus-visible:ring-white/35 sm:w-56 md:text-lg"
                >
                  <LogIn
                    size={21}
                    className="text-sky-200 transition group-hover:scale-110"
                  />
                  Entrar
                </button>
              </div>
            </section>
          </div>
        </main>
      </div>

      <RegisterModal
        isOpen={isRegisterOpen}
        onClose={() => setIsRegisterOpen(false)}
      />
      <LoginModal isOpen={isLoginOpen} onClose={() => setIsLoginOpen(false)} />
    </div>
  );
}
