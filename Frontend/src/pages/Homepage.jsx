import { useState, useEffect } from "react";
import Header from "../components/Header";
import backgroundVideo from "../pictures/fundo.mp4";

export default function Homepage() {
  const [loaded, setLoaded] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    setLoaded(true);
    const handleMouseMove = (e) => {
      setMousePos({
        x: (e.clientX / window.innerWidth - 0.5) * 20,
        y: (e.clientY / window.innerHeight - 0.5) * 20,
      });
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#0a1628]">
      {/* VIDEO BACKGROUND */}
      <video
        autoPlay
        loop
        muted
        playsInline
        className="absolute inset-0 w-full h-full object-cover scale-105"
      >
        <source src={backgroundVideo} type="video/mp4" />
      </video>

      {/* GRADIENTES E EFEITOS */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#0a1628] via-[#0a1628]/60 via-30% to-[#0a1628]/40" />
      <div className="absolute inset-0 bg-gradient-to-r from-[#0a1628]/50 via-transparent to-[#0a1628]/50" />

      {/* GLOW EFFECT - segue o cursor */}
      <div
        className="absolute w-[800px] h-[800px] rounded-full opacity-30 blur-[120px] pointer-events-none transition-transform duration-1000 ease-out"
        style={{
          background:
            "radial-gradient(circle, rgba(30,90,168,0.4) 0%, rgba(15,45,100,0.2) 50%, transparent 70%)",
          left: `calc(50% + ${mousePos.x * 3}px - 400px)`,
          top: `calc(50% + ${mousePos.y * 3}px - 400px)`,
        }}
      />

      {/* GRID PATTERN OVERLAY */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `
            linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)
          `,
          backgroundSize: "100px 100px",
        }}
      />

      {/* CONTEÚDO */}
      <div className="relative z-10 min-h-screen">
        <Header />

        <main className="absolute inset-0 flex flex-col justify-center items-center px-6 md:px-11 text-center">
          {/* BADGE */}
          <div
            className={`mb-8 transform transition-all duration-1000 delay-300 ${
              loaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
            }`}
          >
            <span className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/5 border border-white/10 backdrop-blur-sm">
              <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
              <span className="text-white/70 text-sm font-medium tracking-wide">
                Sempre ao seu lado, dia e noite
              </span>
            </span>
          </div>

          {/* TÍTULO PRINCIPAL */}
          <h2
            className={`text-5xl md:text-7xl lg:text-8xl font-extralight text-white leading-[1.05] tracking-tight transform transition-all duration-1000 delay-500 ${
              loaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-12"
            }`}
          >
            <span className="block">Viage com</span>
            <span className="block mt-2">
              <span className="relative">
                <span className="text-[#60a5fa] font-normal ">Conforto</span>
                <span className="absolute -bottom-2 left-0 w-full h-[2px] bg-[#60a5fa]" />
              </span>{" "}
              e <span className="text-[#FFCC00] font-normal">Segurança</span>
            </span>
          </h2>

          {/* SUBTÍTULO */}
          <p
            className={`mt-8 text-lg md:text-xl text-white/50 max-w-xl leading-relaxed font-light transform transition-all duration-1000 delay-700 ${
              loaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
            }`}
          >
            Uma plataforma moderna para pedir transporte rápido e com segurança.
            Não importa onde estejas, estamos a um click de distância
          </p>

          {/* BOTÕES CTA */}
          <div
            className={`mt-12 flex flex-col sm:flex-row gap-4 transform transition-all duration-1000 delay-1000 ${
              loaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
            }`}
          >
            <button className="px-8 py-4 rounded-2xl font-semibold text-white bg-[#1d5eff] transition-all duration-300 hover:bg-[#1746c9] hover:scale-105">
              <span className="flex items-center gap-3">
                <svg
                  className="w-5 h-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
                Pedir uma Viagem
              </span>
            </button>
          </div>
        </main>
      </div>
    </div>
  );
}
