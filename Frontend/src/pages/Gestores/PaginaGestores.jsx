/* eslint-disable react/prop-types */
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Database,
  Settings,
  BarChart3,
  Car,
  Users,
  Plus,
  Pencil,
  Trash2,
  DollarSign,
  Calculator,
  ChevronRight,
} from "lucide-react";
import logo from "../../Pictures/logo1.jpeg";
import RegistarTaxi from "../../components/RegistarTaxi";
import RegistarMotorista from "../../components/RegistarMotorista";
import EditarTaxi from "../../components/EditarTaxi";
import EditarMotorista from "../../components/EditarMotorista";
import RemoverTaxi from "../../components/RemoverTaxi";
import RemoverMotorista from "../../components/RemoverMotorista";
import {
  DefinirPrecos,
  ListarPrecos,
  SimularViagem,
} from "../../components/ConfigurarPrecos";

const NAV = [
  { id: "dados", label: "Gestão de Dados", Icon: Database, tag: "Dados" },
  { id: "config", label: "Configuração", Icon: Settings, tag: "Sistema" },
  { id: "relatorios", label: "Relatórios", Icon: BarChart3, tag: "Análise" },
];

export default function PaginaGestores() {
  const navigate = useNavigate();
  const [active, setActive] = useState("dados");
  const [modalTaxi, setModalTaxi] = useState(false);
  const [modalMotorista, setModalMotorista] = useState(false);
  const [modalEditTaxi, setModalEditTaxi] = useState(false);
  const [modalEditMotorista, setModalEditMotorista] = useState(false);
  const [modalRemoverTaxi, setModalRemoverTaxi] = useState(false);
  const [modalRemoverMotorista, setModalRemoverMotorista] = useState(false);
  const [modalPrecos, setModalPrecos] = useState(false);
  const [modalListarPrecos, setModalListarPrecos] = useState(false);
  const [modalSimular, setModalSimular] = useState(false);
  const current = NAV.find((n) => n.id === active);

  return (
    <div className="relative min-h-screen bg-[#060e1e] font-['DM_Sans',sans-serif] text-[#eaf0ff]">
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute -top-[180px] left-1/2 -translate-x-1/2 w-[900px] h-[900px] rounded-full bg-[radial-gradient(circle,rgba(26,110,255,0.08)_0%,transparent_70%)]" />
        <div className="absolute -bottom-[100px] -right-[100px] w-[600px] h-[600px] rounded-full bg-[radial-gradient(circle,rgba(198,77,255,0.05)_0%,transparent_70%)]" />
      </div>
      <div
        className="fixed inset-0 z-0 pointer-events-none"
        style={{
          backgroundImage:
            "linear-gradient(rgba(26,110,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(26,110,255,0.03) 1px, transparent 1px)",
          backgroundSize: "70px 70px",
          maskImage:
            "radial-gradient(ellipse 80% 60% at 50% 30%, black 20%, transparent 100%)",
        }}
      />

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
        <div className="flex items-center gap-3.5">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-[#1a6eff]/10 border border-[#1a6eff]/20 text-[12px] font-semibold text-[#00d4ff]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#00e887] shadow-[0_0_6px_#00e887]" />
            Gestor
          </div>
          <button
            onClick={() => {
              localStorage.removeItem("token");
              localStorage.removeItem("cliente");
              localStorage.removeItem("role");
              navigate("/");
            }}
            className="px-3.5 py-1.5 rounded-xl text-[12px] font-medium text-red-400/80 border border-red-500/15 bg-red-500/[0.06] hover:bg-red-500/[0.12] hover:border-red-500/30 hover:text-red-400 transition-all duration-200 cursor-pointer"
          >
            Sair
          </button>
        </div>
      </header>

      <div className="flex pt-16 relative z-[1] min-h-screen">
        <aside className="hidden lg:flex flex-col w-[250px] min-h-[calc(100vh-64px)] bg-[#081226]/85 backdrop-blur-xl border-r border-[#1a6eff]/[0.12] p-[28px_14px_24px] sticky top-16 self-start shrink-0">
          <p className="text-[10px] font-bold tracking-[0.14em] uppercase text-[#4e6a8a] px-3 mb-[18px]">
            Painel do Gestor
          </p>
          <nav className="flex flex-col gap-[3px]">
            {NAV.map((item) => {
              const Ic = item.Icon;
              const isActive = active === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActive(item.id)}
                  className={`relative flex items-center gap-[11px] w-full py-[11px] px-[14px] rounded-xl border-none text-[13.5px] font-medium text-left transition-all duration-200 cursor-pointer ${isActive ? "bg-[#1a6eff]/10 text-[#3d8bff] font-semibold" : "bg-transparent text-[#8ba3c7] hover:bg-[#1a6eff]/[0.06] hover:text-[#eaf0ff]"}`}
                >
                  <span
                    className={`absolute left-0 top-1.5 bottom-1.5 w-[3px] rounded-r-[3px] bg-[#1a6eff] transition-transform duration-200 origin-center ${isActive ? "scale-y-100" : "scale-y-0"}`}
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
        </aside>

        <main className="flex-1 p-[36px_44px] max-w-[980px]" key={active}>
          <div className="mb-8 animate-[fadeUp_0.5s_ease_both]">
            <div className="inline-flex items-center gap-[7px] text-[11px] font-semibold tracking-[0.1em] uppercase text-[#00d4ff] mb-2.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#00d4ff] shadow-[0_0_8px_#00d4ff] animate-pulse" />
              {current?.tag}
            </div>
            {active === "dados" && (
              <PageHead
                t="Gestão de Dados"
                s="Registo e manutenção de táxis e motoristas da empresa."
              />
            )}
            {active === "config" && (
              <PageHead
                t="Configuração do Sistema"
                s="Ajuste de preços, acréscimos e simulação de custos de viagens."
              />
            )}
            {active === "relatorios" && (
              <PageHead
                t="Relatórios e Análise"
                s="Visão analítica da operação, faturação e reabastecimentos."
              />
            )}
          </div>

          <div className="animate-[fadeUp_0.5s_0.08s_ease_both]">
            {active === "dados" && (
              <SecDados
                onRegistarTaxi={() => setModalTaxi(true)}
                onRegistarMotorista={() => setModalMotorista(true)}
                onEditarTaxi={() => setModalEditTaxi(true)}
                onEditarMotorista={() => setModalEditMotorista(true)}
                onRemoverTaxi={() => setModalRemoverTaxi(true)}
                onRemoverMotorista={() => setModalRemoverMotorista(true)}
              />
            )}
            {active === "config" && (
              <SecConfig
                onDefinirPrecos={() => setModalPrecos(true)}
                onListarPrecos={() => setModalListarPrecos(true)}
                onSimularViagem={() => setModalSimular(true)}
              />
            )}
          </div>
        </main>
      </div>

      <RegistarTaxi aberto={modalTaxi} onFechar={() => setModalTaxi(false)} />
      <RegistarMotorista
        aberto={modalMotorista}
        onFechar={() => setModalMotorista(false)}
      />
      <EditarTaxi
        aberto={modalEditTaxi}
        onFechar={() => setModalEditTaxi(false)}
      />
      <EditarMotorista
        aberto={modalEditMotorista}
        onFechar={() => setModalEditMotorista(false)}
      />
      <RemoverTaxi
        aberto={modalRemoverTaxi}
        onFechar={() => setModalRemoverTaxi(false)}
      />
      <RemoverMotorista
        aberto={modalRemoverMotorista}
        onFechar={() => setModalRemoverMotorista(false)}
      />
      <DefinirPrecos
        aberto={modalPrecos}
        onFechar={() => setModalPrecos(false)}
      />
      <ListarPrecos
        aberto={modalListarPrecos}
        onFechar={() => setModalListarPrecos(false)}
        onEditar={() => setModalPrecos(true)}
      />
      <SimularViagem
        aberto={modalSimular}
        onFechar={() => setModalSimular(false)}
      />

      <style>{`@keyframes fadeUp{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}`}</style>
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

function SecDados({
  onRegistarTaxi,
  onRegistarMotorista,
  onEditarTaxi,
  onEditarMotorista,
  onRemoverTaxi,
  onRemoverMotorista,
}) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
      <Card
        CardIcon={Car}
        bg="linear-gradient(135deg, #1a6eff, #0052cc)"
        title="Táxis"
      >
        <Action
          Icon={Plus}
          label="Registar táxi"
          accent
          onClick={onRegistarTaxi}
        />
        <Action Icon={Pencil} label="Editar táxi" onClick={onEditarTaxi} />
        <Action Icon={Trash2} label="Remover táxi" onClick={onRemoverTaxi} />
      </Card>
      <Card
        CardIcon={Users}
        bg="linear-gradient(135deg, #00c873, #00a85e)"
        title="Motoristas"
      >
        <Action
          Icon={Plus}
          label="Registar motorista"
          accent
          onClick={onRegistarMotorista}
        />
        <Action
          Icon={Pencil}
          label="Editar motorista"
          onClick={onEditarMotorista}
        />
        <Action
          Icon={Trash2}
          label="Remover motorista"
          onClick={onRemoverMotorista}
        />
      </Card>
    </div>
  );
}

function SecConfig({ onDefinirPrecos, onListarPrecos, onSimularViagem }) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
      <Card
        CardIcon={DollarSign}
        bg="linear-gradient(135deg, #1a6eff, #7c3aed)"
        title="Preços por minuto"
      >
        <Action
          Icon={DollarSign}
          label="Definir preços (Básico + Luxuoso)"
          accent
          onClick={onDefinirPrecos}
        />
        <Action
          Icon={DollarSign}
          label="Ver preços atuais"
          onClick={onListarPrecos}
        />
      </Card>
      <Card
        CardIcon={Calculator}
        bg="linear-gradient(135deg, #00d4ff, #1a6eff)"
        title="Simulação de viagem"
      >
        <Action
          Icon={Calculator}
          label="Simular custo de viagem fictícia"
          accent
          onClick={onSimularViagem}
        />
      </Card>
    </div>
  );
}

function Card({ CardIcon, bg, title, children }) {
  return (
    <div className="relative overflow-hidden rounded-[20px] border border-[#1a6eff]/[0.12] bg-[rgba(12,28,56,0.55)] backdrop-blur-xl p-6 transition-all duration-300 hover:border-[#1a6eff]/25 hover:bg-[rgba(18,38,72,0.7)] hover:-translate-y-0.5 hover:shadow-[0_16px_48px_rgba(0,0,0,0.3)]">
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
  if (accent)
    variant =
      "border-[#1a6eff]/[0.18] bg-[#1a6eff]/[0.06] text-[#eaf0ff] hover:bg-[#1a6eff]/[0.14] hover:border-[#1a6eff]/[0.35] hover:shadow-[0_0_20px_rgba(26,110,255,0.1)] hover:translate-x-[3px]";
  else if (danger)
    variant =
      "border-white/[0.03] bg-white/[0.02] text-[#8ba3c7] hover:bg-[#ef4444]/[0.08] hover:border-[#ef4444]/25 hover:text-[#ff6b6b] hover:translate-x-[3px]";
  else
    variant =
      "border-white/[0.04] bg-white/[0.02] text-[#eaf0ff] hover:bg-[#1a6eff]/[0.08] hover:border-[#1a6eff]/20 hover:translate-x-[3px]";
  return (
    <button className={`${base} ${variant}`} onClick={onClick}>
      <span className="flex items-center gap-2.5">
        <span
          className={`w-[30px] h-[30px] rounded-[9px] flex items-center justify-center border transition-all duration-200 ${danger ? "bg-white/[0.03] border-white/[0.05] group-hover:bg-[#ef4444]/[0.12] group-hover:border-[#ef4444]/20" : "bg-white/[0.03] border-white/[0.05] group-hover:bg-[#1a6eff]/[0.12] group-hover:border-[#1a6eff]/20"}`}
        >
          <Icon size={15} strokeWidth={1.8} />
        </span>
        {label}
      </span>
      <ChevronRight
        size={14}
        strokeWidth={2}
        className="text-[#4e6a8a] transition-all duration-200 group-hover:text-[#3d8bff] group-hover:translate-x-0.5"
      />
    </button>
  );
}
