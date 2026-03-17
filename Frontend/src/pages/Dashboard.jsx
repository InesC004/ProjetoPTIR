import { useState, useEffect } from "react";
import Header from "../components/Header";

export default function Dashboard() {
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

  const recentTrips = [
    { id: 1, destination: "Aeroporto de Lisboa", date: "Today, 07:42", price: "€18.50", color: "blue" },
    { id: 2, destination: "Oriente Station", date: "Yesterday, 18:15", price: "€9.20", color: "yellow" },
    { id: 3, destination: "Belém Tower", date: "Mar 12, 14:30", price: "€14.00", color: "green" },
  ];

  const tripIconColor = {
    blue: "rgba(29,94,255,0.15)",
    yellow: "rgba(255,204,0,0.12)",
    green: "rgba(16,185,129,0.12)",
  };
  const tripStrokeColor = {
    blue: "#60a5fa",
    yellow: "#FFCC00",
    green: "#10b981",
  };

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-[#0a1628]">
      {/* GRID PATTERN */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `
            linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)
          `,
          backgroundSize: "80px 80px",
        }}
      />

      {/* TOP GLOW */}
      <div
        className="absolute pointer-events-none"
        style={{
          top: "-200px",
          left: "50%",
          transform: "translateX(-50%)",
          width: "900px",
          height: "600px",
          background: "radial-gradient(ellipse, rgba(30,90,168,0.25) 0%, transparent 70%)",
        }}
      />

      {/* BOTTOM RIGHT GLOW - segue o cursor */}
      <div
        className="absolute w-[500px] h-[500px] pointer-events-none transition-transform duration-1000 ease-out"
        style={{
          bottom: "-100px",
          right: "-100px",
          background: "radial-gradient(ellipse, rgba(255,204,0,0.07) 0%, transparent 70%)",
          transform: `translate(${mousePos.x * -1}px, ${mousePos.y * -1}px)`,
        }}
      />

      {/* CONTEÚDO */}
      <div className="relative z-10 min-h-screen flex flex-col">
        <Header />

      <main
        className={`flex-1 px-4 sm:px-6 lg:px-8 pt-24 pb-8 flex flex-col lg:flex-row gap-6 max-w-[1200px] w-full mx-auto transform transition-all duration-700 ${
          loaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
        }`}
      >
          {/* LEFT COLUMN */}
          <div className="flex-1 flex flex-col gap-5">

            {/* GREETING */}
            <div>
              <h1 className="text-3xl font-semibold tracking-tight leading-tight">
                <span className="text-white">Good morning, </span>
                <span className="text-[#60a5fa]">João</span> 👋
              </h1>
              <p className="text-white/40 text-sm mt-1.5 font-light">
                Where are you heading today?
              </p>
            </div>

            {/* BOOKING CARD */}
            <div
              className="rounded-2xl p-6 relative overflow-hidden border border-[#1d5eff]/30"
              style={{
                background:
                  "linear-gradient(135deg, rgba(29,94,255,0.18) 0%, rgba(10,22,40,0.6) 100%)",
              }}
            >
              {/* card glow */}
              <div
                className="absolute -top-14 -right-14 w-48 h-48 rounded-full pointer-events-none"
                style={{
                  background:
                    "radial-gradient(circle, rgba(29,94,255,0.2) 0%, transparent 70%)",
                }}
              />

              <p className="text-[11px] text-white/45 uppercase tracking-widest font-medium mb-3">
                Book a ride
              </p>

              {/* Origin */}
              <div className="flex items-center gap-3 bg-white/[0.06] border border-white/[0.08] rounded-2xl px-4 py-3 cursor-text hover:bg-white/[0.09] hover:border-white/[0.15] transition-all duration-200">
                <span
                  className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                  style={{
                    background: "#10b981",
                    boxShadow: "0 0 0 3px rgba(16,185,129,0.2)",
                  }}
                />
                <span className="text-sm text-white/55 font-light">
                  Your current location
                </span>
              </div>

              {/* Divider */}
              <div className="ml-7 my-1 border-l border-dashed border-white/10 h-2" />

              {/* Destination */}
              <div className="flex items-center gap-3 bg-white/[0.06] border border-white/[0.08] rounded-2xl px-4 py-3 cursor-text hover:bg-white/[0.09] hover:border-white/[0.15] transition-all duration-200">
                <span
                  className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                  style={{
                    background: "#60a5fa",
                    boxShadow: "0 0 0 3px rgba(96,165,250,0.2)",
                  }}
                />
                <span className="text-sm text-white/55 font-light">
                  Where to? Search destination...
                </span>
              </div>

              {/* Buttons */}
              <div className="flex gap-3 mt-4">
                <button className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-2xl font-semibold text-sm text-white bg-[#1d5eff] hover:bg-[#1746c9] hover:scale-[1.02] active:scale-[0.98] transition-all duration-200">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  Request Taxi
                </button>
                <button className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-2xl font-semibold text-sm text-white/80 bg-white/[0.06] border border-white/10 hover:bg-white/10 hover:border-white/20 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                    <line x1="16" y1="2" x2="16" y2="6" />
                    <line x1="8" y1="2" x2="8" y2="6" />
                    <line x1="3" y1="10" x2="21" y2="10" />
                  </svg>
                  Schedule
                </button>
              </div>
            </div>

            {/* STATS */}
            <div className="grid grid-cols-3 gap-3">
              {[
                {
                  val: "47",
                  label: "Total Trips",
                  color: "#60a5fa",
                  bg: "rgba(29,94,255,0.15)",
                  icon: (
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="#60a5fa" strokeWidth="2">
                      <path d="M12 2L2 7l10 5 10-5-10-5z" />
                      <path d="M2 17l10 5 10-5" />
                      <path d="M2 12l10 5 10-5" />
                    </svg>
                  ),
                },
                {
                  val: "€128",
                  label: "This Month",
                  color: "#FFCC00",
                  bg: "rgba(255,204,0,0.1)",
                  icon: (
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="#FFCC00" strokeWidth="2">
                      <line x1="12" y1="1" x2="12" y2="23" />
                      <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                    </svg>
                  ),
                },
                {
                  val: "4.9",
                  label: "Your Rating",
                  color: "#10b981",
                  bg: "rgba(16,185,129,0.12)",
                  icon: (
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2">
                      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                    </svg>
                  ),
                },
              ].map((stat) => (
                <div
                  key={stat.label}
                  className="bg-white/[0.04] border border-white/[0.07] rounded-2xl p-4 flex flex-col gap-1.5"
                >
                  <div
                    className="w-8 h-8 rounded-xl flex items-center justify-center mb-1"
                    style={{ background: stat.bg }}
                  >
                    {stat.icon}
                  </div>
                  <div
                    className="text-[22px] font-semibold"
                    style={{ color: stat.color, fontFamily: "'Space Grotesk', sans-serif" }}
                  >
                    {stat.val}
                  </div>
                  <div className="text-xs text-white/40">{stat.label}</div>
                </div>
              ))}
            </div>

            {/* ACTIVE TRIP */}
            <div className="rounded-2xl p-5 border border-[#10b981]/25 bg-[#10b981]/[0.08]">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2 text-[#10b981] text-[11px] font-semibold uppercase tracking-widest">
                  <span className="w-2 h-2 bg-[#10b981] rounded-full animate-pulse" />
                  Active Trip
                </div>
                <span className="px-3 py-1 text-[11px] font-medium text-[#10b981] bg-[#10b981]/15 border border-[#10b981]/30 rounded-full">
                  En Route
                </span>
              </div>

              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-base text-amber-900 flex-shrink-0"
                  style={{ background: "linear-gradient(135deg, #f59e0b, #fbbf24)" }}>
                  MF
                </div>
                <div className="flex-1">
                  <div className="text-[15px] font-semibold text-white">Miguel Ferreira</div>
                  <div className="text-xs text-white/45 mt-0.5">
                    Mercedes-Benz E-Class · Silver
                  </div>
                  <div className="flex items-center gap-1 mt-1">
                    <span className="text-[#FFCC00] text-xs">★★★★★</span>
                    <span className="text-xs font-medium text-white/70">4.97</span>
                  </div>
                </div>
                <div className="px-3.5 py-1.5 bg-white/[0.06] border border-white/10 rounded-xl text-xs font-semibold tracking-widest text-white/80">
                  73-PQ-47
                </div>
              </div>

              <div className="flex items-center justify-between mt-4 pt-4 border-t border-white/[0.07]">
                <div>
                  <div className="text-xs text-white/40">ETA</div>
                  <div className="text-base font-bold text-[#10b981]">3 min</div>
                  <div className="text-[10px] text-white/35 mt-0.5">
                    Arriving at Av. da Liberdade
                  </div>
                </div>
                <button className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold text-white/80 bg-white/[0.07] border border-white/10 hover:bg-white/10 transition-all duration-200">
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 1.18h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.77a16 16 0 0 0 6.29 6.29l.95-.96a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7a2 2 0 0 1 1.72 2.07z" />
                  </svg>
                  Contact Driver
                </button>
              </div>
            </div>

          </div>

          {/* RIGHT COLUMN */}
          <div className="w-[300px] flex flex-col gap-5">

            {/* MAP PREVIEW */}
            <div>
              <p className="text-[11px] text-white/40 uppercase tracking-widest font-semibold mb-3">
                Live Map
              </p>
              <div className="rounded-2xl overflow-hidden h-[200px] border border-white/[0.07]">
                <svg width="100%" height="100%" viewBox="0 0 300 200" xmlns="http://www.w3.org/2000/svg">
                  <rect width="300" height="200" fill="#0d1f3c" />
                  <line x1="0" y1="100" x2="300" y2="100" stroke="rgba(255,255,255,0.07)" strokeWidth="12" />
                  <line x1="150" y1="0" x2="150" y2="200" stroke="rgba(255,255,255,0.07)" strokeWidth="10" />
                  <line x1="0" y1="60" x2="300" y2="140" stroke="rgba(255,255,255,0.04)" strokeWidth="8" />
                  <line x1="50" y1="0" x2="250" y2="200" stroke="rgba(255,255,255,0.04)" strokeWidth="6" />
                  <line x1="0" y1="100" x2="300" y2="100" stroke="rgba(255,255,255,0.12)" strokeWidth="1" strokeDasharray="20,12" />
                  <line x1="150" y1="0" x2="150" y2="200" stroke="rgba(255,255,255,0.12)" strokeWidth="1" strokeDasharray="20,12" />
                  <path d="M 80 150 Q 150 100 200 70" stroke="#1d5eff" strokeWidth="3" fill="none" strokeLinecap="round" opacity="0.8" />
                  <circle cx="80" cy="150" r="6" fill="#10b981" />
                  <circle cx="80" cy="150" r="10" fill="rgba(16,185,129,0.25)" />
                  <circle cx="200" cy="70" r="6" fill="#1d5eff" />
                  <circle cx="200" cy="70" r="11" fill="rgba(29,94,255,0.2)" />
                  <rect x="10" y="20" width="40" height="30" rx="3" fill="rgba(255,255,255,0.03)" stroke="rgba(255,255,255,0.06)" strokeWidth="0.5" />
                  <rect x="60" y="20" width="50" height="25" rx="3" fill="rgba(255,255,255,0.03)" stroke="rgba(255,255,255,0.06)" strokeWidth="0.5" />
                  <rect x="170" y="120" width="45" height="35" rx="3" fill="rgba(255,255,255,0.03)" stroke="rgba(255,255,255,0.06)" strokeWidth="0.5" />
                  <rect x="220" y="110" width="60" height="28" rx="3" fill="rgba(255,255,255,0.03)" stroke="rgba(255,255,255,0.06)" strokeWidth="0.5" />
                  <rect x="10" y="130" width="35" height="45" rx="3" fill="rgba(255,255,255,0.03)" stroke="rgba(255,255,255,0.06)" strokeWidth="0.5" />
                </svg>
              </div>
            </div>

            {/* RECENT TRIPS */}
            <div>
              <p className="text-[11px] text-white/40 uppercase tracking-widest font-semibold mb-3">
                Recent Trips
              </p>
              <div className="flex flex-col gap-2.5">
                {recentTrips.map((trip) => (
                  <div
                    key={trip.id}
                    className="flex items-center gap-3 px-3.5 py-3 bg-white/[0.04] border border-white/[0.07] rounded-2xl cursor-pointer hover:bg-white/[0.07] hover:border-white/[0.12] transition-all duration-200"
                  >
                    <div
                      className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{ background: tripIconColor[trip.color] }}
                    >
                      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke={tripStrokeColor[trip.color]} strokeWidth="2">
                        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                        <circle cx="12" cy="10" r="3" />
                      </svg>
                    </div>
                    <div>
                      <div className="text-[13px] font-medium text-white">{trip.destination}</div>
                      <div className="text-[11px] text-white/35 mt-0.5">{trip.date}</div>
                    </div>
                    <div className="ml-auto text-[14px] font-semibold text-white/80">
                      {trip.price}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* PROMO */}
            <div
              className="flex items-center gap-3.5 rounded-2xl p-4 border border-[#FFCC00]/20"
              style={{
                background: "linear-gradient(135deg, rgba(255,204,0,0.12) 0%, rgba(255,204,0,0.04) 100%)",
              }}
            >
              <div className="w-11 h-11 bg-[#FFCC00]/15 rounded-xl flex items-center justify-center text-xl flex-shrink-0">
                🎁
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-[13px] font-semibold text-[#FFCC00]">Weekend Promo</div>
                <div className="text-[11px] text-white/40 mt-0.5">20% off every ride this weekend</div>
              </div>
              <button className="px-3 py-1.5 rounded-xl bg-[#FFCC00]/15 border border-[#FFCC00]/30 text-[#FFCC00] text-[11px] font-semibold hover:bg-[#FFCC00]/25 transition-all duration-200 whitespace-nowrap">
                Claim
              </button>
            </div>

          </div>
        </main>
      </div>
    </div>
  );
}