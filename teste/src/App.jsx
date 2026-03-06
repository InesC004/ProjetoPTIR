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
                   from-[#132439]
                   via-[#132439]/40
                   via-35%
                   to-transparent"
      />

      {/* CONTEÚDO */}
      <div className="relative z-10 min-h-screen">
        <Header />

        <main className="absolute inset-0 flex flex-col justify-center items-center px-6 md:px-11 text-center max-w-4xl mx-auto">
          <h2 className="text-5xl md:text-6xl font-light text-white/95 leading-[1.1] tracking-tight drop-shadow-2xl">
            Travel with comfort and safety
          </h2>

          <p className="mt-8 text-xl md:text-xl text-white/60 max-w-2xl leading-relaxed font-light">
            The modern platform to request transportation quickly and safely.
          </p>
        </main>
      </div>
    </div>
  );
}
