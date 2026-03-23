/* eslint-disable react/prop-types */
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  CarFront,
  Route,
  Users,
  Receipt,
  Fuel,
  Clock,
  Square,
  MapPin,
  ChevronRight,
  Calendar,
  Navigation,
  Timer,
  CheckCircle2,
  ListOrdered,
  PlusCircle,
} from "lucide-react";
import logo from "../Pictures/logo1.jpeg";

/* ═══════════════════════════════════════════════
   NAV
   ═══════════════════════════════════════════════ */
const NAV = [
  { id: "turno", label: "Requisitar Táxi", Icon: CarFront, tag: "Turno" },
  { id: "pedidos", label: "Pedidos de Táxi", Icon: Navigation, tag: "Pedidos" },
  { id: "viagem", label: "Viagens", Icon: Route, tag: "Viagem" },
  { id: "fatura", label: "Faturas", Icon: Receipt, tag: "Faturação" },
  { id: "reabastecimento", label: "Reabastecimento", Icon: Fuel, tag: "Táxi" },
];

/* ═══════════════════════════════════════════════
   COMPONENTE PRINCIPAL
   ═══════════════════════════════════════════════ */
export default function PaginaMotorista() {
  const navigate = useNavigate();
  const [active, setActive] = useState("turno");
  const current = NAV.find((n) => n.id === active);

  return (
    <div className="relative min-h-screen bg-[#060e1e] font-['DM_Sans',sans-serif] text-[#eaf0ff]">
      {/* ── Fundo decorativo ── */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute -top-[180px] left-1/2 -translate-x-1/2 w-[900px] h-[900px] rounded-full bg-[radial-gradient(circle,rgba(0,232,135,0.06)_0%,transparent_70%)]" />
        <div className="absolute -bottom-[100px] -right-[100px] w-[600px] h-[600px] rounded-full bg-[radial-gradient(circle,rgba(26,110,255,0.05)_0%,transparent_70%)]" />
      </div>
      <div
        className="fixed inset-0 z-0 pointer-events-none"
        style={{
          backgroundImage:
            "linear-gradient(rgba(0,232,135,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(0,232,135,0.02) 1px, transparent 1px)",
          backgroundSize: "70px 70px",
          maskImage:
            "radial-gradient(ellipse 80% 60% at 50% 30%, black 20%, transparent 100%)",
        }}
      />

      {/* ── HEADER ── */}
      <header className="fixed top-0 left-0 right-0 z-50 h-16 flex items-center justify-between px-5 bg-[#060e1e]/80 backdrop-blur-xl border-b border-white/[0.06]">
        <div
          className="flex items-center gap-3 cursor-pointer group"
          onClick={() => navigate("/")}
        >
          <img
            src={logo}
            alt="TakeCab"
            className="h-10 w-auto rounded-[10px] border border-white/[0.08] transition-transform duration-300 group-hover:scale-105"
          />
          <div className="flex flex-col">
            <span className="font-semibold text-white text-[16px] tracking-tight">
              Take<span className="text-[#3d8bff]">Cab</span>
            </span>
            <span className="text-[10px] tracking-[0.16em] uppercase text-white/30">
              Premium Rides
            </span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-[#00e887]/10 border border-[#00e887]/20 text-[12px] font-semibold text-[#00e887]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#00e887] shadow-[0_0_6px_#00e887]" />
            Motorista
          </div>
        </div>
      </header>

      {/* ── LAYOUT ── */}
      <div className="flex pt-16 relative z-[1] min-h-screen">
        {/* ── SIDEBAR ── */}
        <aside className="hidden lg:flex flex-col w-[250px] min-h-[calc(100vh-64px)] bg-[#081226]/85 backdrop-blur-xl border-r border-[#00e887]/[0.08] p-[28px_14px_24px] sticky top-16 self-start shrink-0">
          <p className="text-[10px] font-bold tracking-[0.14em] uppercase text-[#4e6a8a] px-3 mb-[18px]">
            Painel do Motorista
          </p>

          <nav className="flex flex-col gap-[3px]">
            {NAV.map((item) => {
              const Ic = item.Icon;
              const isActive = active === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActive(item.id)}
                  className={`relative flex items-center gap-[11px] w-full py-[11px] px-[14px] rounded-xl border-none text-[13.5px] font-medium text-left transition-all duration-200 cursor-pointer
                    ${
                      isActive
                        ? "bg-[#00e887]/10 text-[#00e887] font-semibold"
                        : "bg-transparent text-[#8ba3c7] hover:bg-[#00e887]/[0.04] hover:text-[#eaf0ff]"
                    }`}
                >
                  <span
                    className={`absolute left-0 top-1.5 bottom-1.5 w-[3px] rounded-r-[3px] bg-[#00e887] transition-transform duration-200 origin-center ${isActive ? "scale-y-100" : "scale-y-0"}`}
                  />
                  <Ic
                    size={18}
                    strokeWidth={isActive ? 2.2 : 1.6}
                    className={`transition-opacity ${isActive ? "opacity-100" : "opacity-50"}`}
                  />
                  {item.label}
                </button>
              );
            })}
          </nav>

          {/* Turno ativo (mock) */}
          <div className="mt-auto p-4 rounded-2xl bg-gradient-to-br from-[#00e887]/[0.08] to-[#1a6eff]/[0.05] border border-[#00e887]/[0.12]">
            <div className="flex items-center gap-2 mb-2">
              <span className="w-2 h-2 rounded-full bg-[#00e887] shadow-[0_0_8px_#00e887] animate-pulse" />
              <span className="text-[11px] font-semibold text-[#00e887] uppercase tracking-wider">
                Turno Ativo
              </span>
            </div>
            <p className="text-[13px] font-semibold text-[#eaf0ff]">
              Mercedes Classe E
            </p>
            <p className="text-[11px] text-[#4e6a8a] mt-0.5">
              AA-23-BB · Luxuoso
            </p>
            <div className="flex items-center gap-1.5 mt-3 text-[11px] text-[#8ba3c7]">
              <Clock size={12} /> 14:00 — 22:00
            </div>
          </div>
        </aside>

        {/* ── MAIN ── */}
        <main className="flex-1 p-[36px_44px] max-w-[1020px]" key={active}>
          <div className="mb-8 animate-[fadeUp_0.5s_ease_both]">
            <div className="inline-flex items-center gap-[7px] text-[11px] font-semibold tracking-[0.1em] uppercase text-[#00e887] mb-2.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#00e887] shadow-[0_0_8px_#00e887] animate-pulse" />
              {current?.tag}
            </div>
            {active === "turno" && (
              <PageHead
                t="Requisitar Táxi"
                s="Registe um turno e escolha um táxi disponível para conduzir."
              />
            )}
            {active === "pedidos" && (
              <PageHead
                t="Pedidos de Táxi"
                s="Visualize e aceite pedidos de clientes que aguardam motorista."
              />
            )}
            {active === "viagem" && <PageHead t="Viagens" s="viagens page" />}
            {active === "fatura" && <PageHead t="Faturas" s=" faturas page." />}
            {active === "reabastecimento" && (
              <PageHead t="Reabastecimento" s=" reabastecimentos page" />
            )}
          </div>

          <div className="animate-[fadeUp_0.5s_0.08s_ease_both]">
            {active === "turno" && <SecTurno />}
            {active === "pedidos" && <SecPedidos />}
          </div>
        </main>
      </div>

      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}

function PageHead({ t, s }) {
  return (
    <>
      <h2 className="font-['Syne',sans-serif] text-[28px] font-extrabold tracking-tight text-[#eaf0ff] mb-1.5">
        {t}
      </h2>
      <p className="text-[14px] text-[#8ba3c7] leading-relaxed">{s}</p>
    </>
  );
}

/* ═══════════════════════════════════════════════
   US5 — REQUISITAR TÁXI PARA TURNO
   ═══════════════════════════════════════════════ */
function SecTurno() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
      <Card
        CardIcon={Calendar}
        bg="linear-gradient(135deg, #00e887, #00a85e)"
        title="Novo Turno"
      >
        <Action Icon={PlusCircle} label="Definir período do turno" accent />
        <Action Icon={Clock} label="Verificar disponibilidade" />
        <Action Icon={CarFront} label="Escolher táxi disponível" accent />
      </Card>
      <Card
        CardIcon={ListOrdered}
        bg="linear-gradient(135deg, #1a6eff, #3d8bff)"
        title="Os Meus Turnos"
      >
        <Action Icon={Clock} label="Ver turnos ativos" />
        <Action Icon={Calendar} label="Histórico de turnos" />
        <Action Icon={CarFront} label="Táxis utilizados" />
      </Card>
    </div>
  );
}

/* ═══════════════════════════════════════════════
   US7 — VER / ACEITAR PEDIDOS DE TÁXI
   ═══════════════════════════════════════════════ */
function SecPedidos() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
      <Card
        CardIcon={Navigation}
        bg="linear-gradient(135deg, #00d4ff, #1a6eff)"
        title="Pedidos Pendentes"
      >
        <Action Icon={MapPin} label="Ver pedidos por proximidade" accent />
        <Action Icon={Users} label="Detalhes do cliente e destino" />
        <Action Icon={CheckCircle2} label="Aceitar pedido" accent />
      </Card>
      <Card
        CardIcon={Timer}
        bg="linear-gradient(135deg, #c64dff, #7c3aed)"
        title="Aguardar Confirmação"
      >
        <Action Icon={Clock} label="Pedidos aceites a aguardar cliente" />
        <Action Icon={Square} label="Cancelar aceitação" danger />
      </Card>
    </div>
  );
}

/* ═══════════════════════════════════════════════
   COMPONENTES BASE
   ═══════════════════════════════════════════════ */
function Card({ CardIcon, bg, title, children }) {
  return (
    <div className="relative overflow-hidden rounded-[20px] border border-[#00e887]/[0.08] bg-[rgba(12,28,56,0.55)] backdrop-blur-xl p-6 transition-all duration-300 hover:border-[#00e887]/20 hover:bg-[rgba(18,38,72,0.7)] hover:-translate-y-0.5 hover:shadow-[0_16px_48px_rgba(0,0,0,0.3)]">
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />
      <div className="flex items-center gap-3 mb-5 pb-4 border-b border-white/[0.04]">
        <div
          className="w-10 h-10 rounded-[13px] flex items-center justify-center text-white shadow-[0_4px_16px_rgba(0,0,0,0.25)]"
          style={{ background: bg }}
        >
          <CardIcon size={18} strokeWidth={1.8} />
        </div>
        <h3 className="font-['Syne',sans-serif] text-[16px] font-bold tracking-tight">
          {title}
        </h3>
      </div>
      <div className="flex flex-col gap-2">{children}</div>
    </div>
  );
}

function Action({ Icon, label, accent, danger, onClick }) {
  const base =
    "group flex items-center justify-between w-full py-3 px-3.5 rounded-xl border text-[13.5px] font-medium cursor-pointer transition-all duration-200 text-left";

  let variant;
  if (accent) {
    variant =
      "border-[#00e887]/[0.15] bg-[#00e887]/[0.05] text-[#eaf0ff] hover:bg-[#00e887]/[0.12] hover:border-[#00e887]/[0.3] hover:shadow-[0_0_20px_rgba(0,232,135,0.08)] hover:translate-x-[3px]";
  } else if (danger) {
    variant =
      "border-white/[0.03] bg-white/[0.02] text-[#8ba3c7] hover:bg-[#ef4444]/[0.08] hover:border-[#ef4444]/25 hover:text-[#ff6b6b] hover:translate-x-[3px]";
  } else {
    variant =
      "border-white/[0.04] bg-white/[0.02] text-[#eaf0ff] hover:bg-[#00e887]/[0.06] hover:border-[#00e887]/15 hover:translate-x-[3px]";
  }

  return (
    <button className={`${base} ${variant}`} onClick={onClick}>
      <span className="flex items-center gap-2.5">
        <span
          className={`w-[30px] h-[30px] rounded-[9px] flex items-center justify-center border transition-all duration-200 ${
            danger
              ? "bg-white/[0.03] border-white/[0.05] group-hover:bg-[#ef4444]/[0.12] group-hover:border-[#ef4444]/20"
              : "bg-white/[0.03] border-white/[0.05] group-hover:bg-[#00e887]/[0.1] group-hover:border-[#00e887]/20"
          }`}
        >
          <Icon size={15} strokeWidth={1.8} />
        </span>
        {label}
      </span>
      <ChevronRight
        size={14}
        strokeWidth={2}
        className="text-[#4e6a8a] transition-all duration-200 group-hover:text-[#00e887] group-hover:translate-x-0.5"
      />
    </button>
  );
}
