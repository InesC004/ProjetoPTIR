import { useState, useEffect } from "react";
import Header from "../components/Header2";
import backgroundVideo from "../Pictures/fundo.mp4";

export default function Homepage() {
  const [loaded, setLoaded] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

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
      {/* VIDEO */}
      <video
        autoPlay
        loop
        muted
        playsInline
        className="absolute inset-0 h-full w-full scale-105 object-cover opacity-90"
      >
        <source src={backgroundVideo} type="video/mp4" />
      </video>

      {/* OVERLAYS */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#061426]/70 via-[#061426]/35 to-[#061426]/80" />
      <div className="absolute inset-0 bg-gradient-to-r from-[#061426]/85 via-[#061426]/25 to-[#061426]/85" />

      {/* LIGHT BLOBS */}
      <div
        className="absolute left-[12%] top-[28%] h-80 w-80 rounded-full bg-sky-400/20 blur-[90px]"
        style={{ transform: `translate(${mousePos.x}px, ${mousePos.y}px)` }}
      />
      <div
        className="absolute right-[18%] top-[42%] h-72 w-72 rounded-full bg-yellow-400/15 blur-[100px]"
        style={{ transform: `translate(${-mousePos.x}px, ${-mousePos.y}px)` }}
      />

      {/* CONTENT */}
      <div className="relative z-10 min-h-screen">
        <Header />

        <main className="flex min-h-screen items-center justify-center px-6 text-center">
          {/* wrapper para compensar o header */}
          <div className="flex min-h-[calc(100vh-80px)] items-center justify-center">
            <section
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
            </section>
          </div>
        </main>
      </div>
    </div>
  );
}
