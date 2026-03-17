import { useState, useEffect, useRef } from "react";
import Header from "../components/Header";

export default function Dashboard() {
  const [loaded, setLoaded] = useState(false);
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);

  useEffect(() => {
    setLoaded(true);

    // Load Leaflet CSS
    if (!document.querySelector('link[href*="leaflet"]')) {
      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
      document.head.appendChild(link);
    }

    // Load Leaflet JS and initialize map
    if (!window.L) {
      const script = document.createElement("script");
      script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
      script.onload = () => initMap();
      document.head.appendChild(script);
    } else {
      initMap();
    }

    function initMap() {
      if (mapRef.current && !mapInstanceRef.current && window.L) {
        // Lisbon coordinates
        const map = window.L.map(mapRef.current, {
          zoomControl: false,
          attributionControl: false,
        }).setView([38.7223, -9.1393], 13);

        // Dark style tiles
        window.L.tileLayer(
          "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
          { maxZoom: 19 },
        ).addTo(map);

        mapInstanceRef.current = map;
      }
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  return (
    <div className="min-h-screen bg-[#0a1628] overflow-hidden">
      {/* Background Effects */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[-30%] left-[20%] w-[800px] h-[800px] bg-[#1d5eff]/20 rounded-full blur-[180px]" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[600px] h-[600px] bg-purple-500/10 rounded-full blur-[150px]" />
        <div className="absolute top-[40%] left-[-10%] w-[400px] h-[400px] bg-emerald-500/8 rounded-full blur-[120px]" />
      </div>

      <div className="relative z-10">
        <Header />

        {/* Hero Section with Map */}
        <section className="pt-28 pb-12 px-6">
          <div className="max-w-7xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              {/* Left - Content */}
              <div
                className={`transition-all duration-1000 ${
                  loaded
                    ? "opacity-100 translate-x-0"
                    : "opacity-0 -translate-x-12"
                }`}
              >
                <h1 className="text-5xl lg:text-6xl font-bold text-white leading-[1.1]">
                  Get there
                  <br />
                  <span className="bg-gradient-to-r from-[#60a5fa] via-[#a78bfa] to-[#f472b6] bg-clip-text text-transparent">
                    in minutes
                  </span>
                </h1>

                <p className="text-white/50 text-lg mt-6 max-w-md leading-relaxed">
                  Book a ride instantly. Track your driver in real-time. Arrive
                  safely at your destination.
                </p>

                {/* Booking Inputs */}
                <div className="mt-10 space-y-3">
                  <div className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-xl px-5 py-4 hover:border-white/20 transition-colors">
                    <div className="w-3 h-3 rounded-full bg-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.5)]" />
                    <input
                      type="text"
                      placeholder="Enter pickup location"
                      className="flex-1 bg-transparent text-white placeholder:text-white/40 outline-none"
                    />
                  </div>

                  <div className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-xl px-5 py-4 hover:border-white/20 transition-colors">
                    <div className="w-3 h-3 rounded-full bg-[#60a5fa] shadow-[0_0_12px_rgba(96,165,250,0.5)]" />
                    <input
                      type="text"
                      placeholder="Where are you going?"
                      className="flex-1 bg-transparent text-white placeholder:text-white/40 outline-none"
                    />
                  </div>

                  <button className="w-full py-4 rounded-xl bg-gradient-to-r from-[#1d5eff] to-[#7c3aed] text-white font-semibold transition-all hover:shadow-[0_0_40px_rgba(29,94,255,0.4)] hover:scale-[1.02]">
                    Request Ride
                  </button>
                </div>

                {/* Quick Stats */}
                <div className="flex gap-8 mt-10 pt-10 border-t border-white/10">
                  <div>
                    <p className="text-3xl font-bold text-white">3min</p>
                    <p className="text-white/40 text-sm mt-1">Avg. pickup</p>
                  </div>
                  <div>
                    <p className="text-3xl font-bold text-white">50k+</p>
                    <p className="text-white/40 text-sm mt-1">Happy riders</p>
                  </div>
                  <div>
                    <p className="text-3xl font-bold text-white">4.9</p>
                    <p className="text-white/40 text-sm mt-1">Star rating</p>
                  </div>
                </div>
              </div>

              {/* Right - Map */}
              <div
                className={`transition-all duration-1000 delay-300 ${
                  loaded
                    ? "opacity-100 translate-x-0"
                    : "opacity-0 translate-x-12"
                }`}
              >
                <div className="relative">
                  {/* Map Container */}
                  <div
                    ref={mapRef}
                    className="h-[500px] rounded-3xl overflow-hidden border border-white/10"
                    style={{ background: "#0d1f3c" }}
                  />

                  {/* Map Overlay Card nao esta a funcionar*/}
                  <div className="absolute bottom-6 left-6 right-6 bg-[#0a1628]/90 backdrop-blur-xl border border-white/10 rounded-2xl p-5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#1d5eff] to-[#7c3aed] flex items-center justify-center text-white font-bold">
                          12
                        </div>
                        <div>
                          <p className="text-white font-semibold">
                            Drivers nearby
                          </p>
                          <p className="text-white/40 text-sm">
                            Ready to pick you up
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-emerald-400 font-semibold">~2 min</p>
                        <p className="text-white/40 text-sm">ETA</p>
                      </div>
                    </div>
                  </div>

                  {/* Decorative Elements */}
                  <div className="absolute -top-4 -right-4 w-24 h-24 bg-[#1d5eff]/20 rounded-full blur-2xl" />
                  <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-purple-500/15 rounded-full blur-2xl" />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section
          className={`py-24 px-6 transition-all duration-1000 delay-500 ${
            loaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-12"
          }`}
        >
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <p className="text-[#60a5fa] text-sm font-semibold uppercase tracking-widest mb-4">
                Why TakeCab
              </p>
              <h2 className="text-4xl md:text-5xl font-bold text-white">
                The smarter way to move
              </h2>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              <FeatureCard
                number="01"
                title="Real-time Tracking"
                description="Follow your driver on the map. Know exactly when they'll arrive."
                color="blue"
              />
              <FeatureCard
                number="02"
                title="Verified Drivers"
                description="Every driver is background-checked and professionally trained."
                color="emerald"
              />
              <FeatureCard
                number="03"
                title="Best Prices"
                description="Competitive fares with no surge pricing. Pay what you see."
                color="purple"
              />
            </div>
          </div>
        </section>

        {/* How it Works */}
        <section
          className={`py-24 px-6 transition-all duration-1000 delay-700 ${
            loaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-12"
          }`}
        >
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-16">
              <p className="text-emerald-400 text-sm font-semibold uppercase tracking-widest mb-4">
                Simple Process
              </p>
              <h2 className="text-4xl md:text-5xl font-bold text-white">
                How it works
              </h2>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              <StepCard
                step="1"
                title="Set Location"
                description="Enter your pickup and drop-off points"
              />
              <StepCard
                step="2"
                title="Get Matched"
                description="We find the nearest available driver"
              />
              <StepCard
                step="3"
                title="Enjoy the Ride"
                description="Sit back, relax, and reach your destination"
              />
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-24 px-6">
          <div className="max-w-4xl mx-auto">
            <div className="relative bg-gradient-to-br from-[#1d5eff]/30 via-[#7c3aed]/20 to-[#f472b6]/10 border border-white/10 rounded-[2rem] p-12 md:p-20 text-center overflow-hidden">
              {/* Decorative circles */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-[#1d5eff]/20 rounded-full blur-[80px]" />
              <div className="absolute bottom-0 left-0 w-48 h-48 bg-purple-500/20 rounded-full blur-[60px]" />

              <div className="relative">
                <h2 className="text-4xl md:text-5xl font-bold text-white">
                  Ready to go?
                </h2>
                <p className="text-white/50 text-lg mt-6 max-w-md mx-auto">
                  Your next ride is just a tap away. Join thousands of happy
                  riders today.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center mt-10">
                  <button className="px-10 py-4 rounded-xl bg-white text-[#0a1628] font-semibold transition-all hover:scale-105 hover:shadow-[0_0_30px_rgba(255,255,255,0.3)]">
                    Book Now
                  </button>
                  <button className="px-10 py-4 rounded-xl bg-white/10 border border-white/20 text-white font-semibold transition-all hover:bg-white/20">
                    Download App
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="py-16 px-6 border-t border-white/5">
          <div className="max-w-6xl mx-auto">
            <div className="grid md:grid-cols-4 gap-12">
              <div>
                <div className="text-white font-bold text-2xl mb-4">
                  Take<span className="text-[#60a5fa]">Cab</span>
                </div>
                <p className="text-white/40 text-sm leading-relaxed">
                  The modern way to get around the city. Fast, safe, reliable.
                </p>
              </div>
              <div>
                <p className="text-white font-semibold mb-4">Company</p>
                <div className="space-y-3">
                  <a
                    href="#"
                    className="block text-white/40 hover:text-white transition-colors text-sm"
                  >
                    About Us
                  </a>
                  <a
                    href="#"
                    className="block text-white/40 hover:text-white transition-colors text-sm"
                  >
                    Careers
                  </a>
                  <a
                    href="#"
                    className="block text-white/40 hover:text-white transition-colors text-sm"
                  >
                    Press
                  </a>
                </div>
              </div>
              <div>
                <p className="text-white font-semibold mb-4">Support</p>
                <div className="space-y-3">
                  <a
                    href="#"
                    className="block text-white/40 hover:text-white transition-colors text-sm"
                  >
                    Help Center
                  </a>
                  <a
                    href="#"
                    className="block text-white/40 hover:text-white transition-colors text-sm"
                  >
                    Safety
                  </a>
                  <a
                    href="#"
                    className="block text-white/40 hover:text-white transition-colors text-sm"
                  >
                    Contact
                  </a>
                </div>
              </div>
              <div>
                <p className="text-white font-semibold mb-4">Legal</p>
                <div className="space-y-3">
                  <a
                    href="#"
                    className="block text-white/40 hover:text-white transition-colors text-sm"
                  >
                    Privacy Policy
                  </a>
                  <a
                    href="#"
                    className="block text-white/40 hover:text-white transition-colors text-sm"
                  >
                    Terms of Service
                  </a>
                  <a
                    href="#"
                    className="block text-white/40 hover:text-white transition-colors text-sm"
                  >
                    Cookie Policy
                  </a>
                </div>
              </div>
            </div>
            <div className="mt-16 pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4">
              <p className="text-white/30 text-sm">
                © 2025 TakeCab. All rights reserved.
              </p>
              <div className="flex gap-6">
                <a
                  href="#"
                  className="text-white/30 hover:text-white transition-colors text-sm"
                >
                  Twitter
                </a>
                <a
                  href="#"
                  className="text-white/30 hover:text-white transition-colors text-sm"
                >
                  Instagram
                </a>
                <a
                  href="#"
                  className="text-white/30 hover:text-white transition-colors text-sm"
                >
                  LinkedIn
                </a>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}

function FeatureCard({ number, title, description, color }) {
  const colors = {
    blue: "from-[#1d5eff]/20 to-transparent border-[#1d5eff]/20 text-[#60a5fa]",
    emerald:
      "from-emerald-500/20 to-transparent border-emerald-500/20 text-emerald-400",
    purple:
      "from-purple-500/20 to-transparent border-purple-500/20 text-purple-400",
  };

  return (
    <div
      className={`group bg-gradient-to-br ${colors[color]} border rounded-2xl p-8 hover:scale-105 transition-all duration-300`}
    >
      <span
        className={`text-5xl font-bold opacity-20 ${colors[color].split(" ").pop()}`}
      >
        {number}
      </span>
      <h3 className="text-white text-xl font-semibold mt-4">{title}</h3>
      <p className="text-white/40 mt-3 leading-relaxed">{description}</p>
    </div>
  );
}

function StepCard({ step, title, description }) {
  return (
    <div className="relative text-center p-8">
      <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-[#1d5eff] to-[#7c3aed] flex items-center justify-center text-white text-2xl font-bold mb-6">
        {step}
      </div>
      <h3 className="text-white text-xl font-semibold">{title}</h3>
      <p className="text-white/40 mt-3">{description}</p>
    </div>
  );
}
