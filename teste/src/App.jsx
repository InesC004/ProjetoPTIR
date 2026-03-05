import Header from "./components/Header";
import backgroundVideo from "./pictures/fundo.mp4";

export default function App() {
  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* VIDEO BACKGROUND */}
      <video
        autoPlay
        loop
        muted
        playsInline
        className="absolute inset-0 w-full h-full object-cover"
      >
        <source src={backgroundVideo} type="video/mp4" />
      </video>

      {/*  GRADIENTE AZUL */}
      <div
        className="absolute inset-0 
                   bg-gradient-to-b
                   from-[#132440]/95
                   via-[#132440]/60
                   via-40%
                   to-transparent"
      />

      {/* CONTEÚDO */}
      <div className="relative z-10 min-h-screen">
        <Header />

        <main className="px-6 md:px-12 pt-32 max-w-4xl">
          <h2 className="text-5xl md:text-6xl font-bold text-white leading-tight drop-shadow-lg">
            Viaja com conforto e segurança.
          </h2>

          <p className="mt-6 text-lg text-white/80 max-w-xl">
            A plataforma moderna para pedires transporte de forma rápida e
            segura.
          </p>
        </main>
      </div>
    </div>
  );
}
