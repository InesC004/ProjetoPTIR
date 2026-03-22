/* eslint-disable react/prop-types */
import { useState } from "react";

const MOCK_TURNOS = [
  {
    id: 1,
    data: "22/03/2026",
    taxi: "Táxi #12",
    inicio: "06:00",
    fim: "14:00",
    estado: "Ativo",
  },
  {
    id: 2,
    data: "21/03/2026",
    taxi: "Táxi #07",
    inicio: "14:00",
    fim: "22:00",
    estado: "Concluído",
  },
];

const MOCK_PEDIDOS = [
  {
    id: 101,
    cliente: "Ana R.",
    origem: "Rossio",
    destino: "Aeroporto",
    hora: "10:32",
  },
  {
    id: 102,
    cliente: "João M.",
    origem: "Belém",
    destino: "Parque das Nações",
    hora: "10:45",
  },
  {
    id: 103,
    cliente: "Maria S.",
    origem: "Saldanha",
    destino: "Cascais",
    hora: "11:02",
  },
];

const TAXIS_DISPONIVEIS = ["Táxi #03", "Táxi #08", "Táxi #12", "Táxi #15"];

export default function PaginaMotorista() {
  const [secaoAtiva, setSecaoAtiva] = useState("painel");
  const [viagemAtiva, setViagemAtiva] = useState(null);
  const [mostrarNovoTurno, setMostrarNovoTurno] = useState(false);
  const [mostrarReabastecimento, setMostrarReabastecimento] = useState(false);
  const [mostrarFatura, setMostrarFatura] = useState(false);

  const secoes = [
    { id: "painel", nome: "Painel", icon: "⊞" },
    { id: "turnos", nome: "Turnos", icon: "⏱" },
    { id: "pedidos", nome: "Pedidos", icon: "📲" },
    { id: "viagens", nome: "Viagens", icon: "🧭" },
    { id: "pagamentos", nome: "Pagamentos", icon: "🧾" },
    { id: "veiculo", nome: "Veículo", icon: "⛽" },
  ];

  return (
    <div
      style={{ fontFamily: "'DM Sans', 'Segoe UI', sans-serif" }}
      className="min-h-screen bg-stone-50 text-stone-900"
    >
      <link
        href="https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,500;0,9..40,700;1,9..40,400&display=swap"
        rel="stylesheet"
      />

      {/* Top bar */}
      <header className="border-b border-stone-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500 text-lg font-bold text-white shadow-sm">
              T
            </div>
            <div>
              <p className="text-[13px] text-stone-400 leading-none">
                Motorista
              </p>
              <p className="text-[15px] font-bold leading-tight">
                Carlos Mendes
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700 ring-1 ring-emerald-200">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              Em serviço
            </span>
            <button className="ml-2 rounded-lg border border-stone-200 px-3 py-1.5 text-xs text-stone-500 hover:bg-stone-50 transition">
              Sair
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto flex max-w-6xl gap-0 lg:gap-6 px-5 py-6">
        {/* Sidebar nav */}
        <nav className="hidden lg:flex flex-col gap-1 w-52 shrink-0 pt-1">
          {secoes.map((s) => (
            <button
              key={s.id}
              onClick={() => setSecaoAtiva(s.id)}
              className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all ${
                secaoAtiva === s.id
                  ? "bg-amber-500 text-white shadow-md shadow-amber-200"
                  : "text-stone-500 hover:bg-stone-100 hover:text-stone-800"
              }`}
            >
              <span className="text-base">{s.icon}</span>
              {s.nome}
            </button>
          ))}
        </nav>

        {/* Mobile tabs */}
        <div className="lg:hidden flex gap-1 overflow-x-auto pb-4 w-full -mx-5 px-5 scrollbar-hide">
          {secoes.map((s) => (
            <button
              key={s.id}
              onClick={() => setSecaoAtiva(s.id)}
              className={`flex items-center gap-2 whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium transition ${
                secaoAtiva === s.id
                  ? "bg-amber-500 text-white shadow"
                  : "bg-white border border-stone-200 text-stone-500"
              }`}
            >
              <span>{s.icon}</span>
              {s.nome}
            </button>
          ))}
        </div>

        {/* Content */}
        <main className="flex-1 min-w-0">
          {/* ─── PAINEL ─── */}
          {secaoAtiva === "painel" && (
            <div className="space-y-5">
              <SectionHeader
                titulo="Painel do Motorista"
                subtitulo="Resumo do dia e ações rápidas"
              />

              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                <StatCard
                  label="Turno atual"
                  valor="06:00–14:00"
                  detalhe="Táxi #12"
                  cor="amber"
                />
                <StatCard
                  label="Viagens hoje"
                  valor="7"
                  detalhe="3 em espera"
                  cor="sky"
                />
                <StatCard
                  label="Faturado hoje"
                  valor="€142"
                  detalhe="+€38 vs ontem"
                  cor="emerald"
                />
                <StatCard
                  label="Km percorridos"
                  valor="96"
                  detalhe="Táxi #12"
                  cor="violet"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                <QuickBtn
                  label="Iniciar viagem"
                  sub="Nova corrida"
                  onClick={() => setSecaoAtiva("viagens")}
                />
                <QuickBtn
                  label="Ver pedidos"
                  sub="Clientes à espera"
                  onClick={() => setSecaoAtiva("pedidos")}
                />
                <QuickBtn
                  label="Reabastecimento"
                  sub="Registar combustível"
                  onClick={() => setSecaoAtiva("veiculo")}
                />
              </div>
            </div>
          )}

          {/* ─── TURNOS ─── */}
          {secaoAtiva === "turnos" && (
            <div className="space-y-5">
              <div className="flex items-start justify-between flex-wrap gap-3">
                <SectionHeader
                  titulo="Turnos"
                  subtitulo="Gerir e requisitar turnos"
                />
                <button
                  onClick={() => setMostrarNovoTurno(!mostrarNovoTurno)}
                  className="rounded-xl bg-amber-500 px-4 py-2.5 text-sm font-medium text-white shadow hover:bg-amber-600 transition"
                >
                  + Novo turno
                </button>
              </div>

              {mostrarNovoTurno && (
                <Card>
                  <p className="font-semibold mb-4">Requisitar turno</p>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <InputField label="Data" type="date" />
                    <InputField label="Hora início" type="time" />
                    <InputField label="Hora fim" type="time" />
                  </div>
                  <div className="mt-4">
                    <label className="block text-xs text-stone-500 mb-1.5">
                      Táxi disponível
                    </label>
                    <select className="w-full rounded-lg border border-stone-200 bg-white px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-300">
                      {TAXIS_DISPONIVEIS.map((t) => (
                        <option key={t}>{t}</option>
                      ))}
                    </select>
                  </div>
                  <button className="mt-5 rounded-xl bg-stone-900 px-5 py-2.5 text-sm font-medium text-white hover:bg-stone-800 transition">
                    Confirmar turno
                  </button>
                </Card>
              )}

              <Card>
                <p className="font-semibold mb-3">Os meus turnos</p>
                <div className="space-y-2">
                  {MOCK_TURNOS.map((t) => (
                    <div
                      key={t.id}
                      className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-stone-50 px-4 py-3"
                    >
                      <div>
                        <p className="text-sm font-medium">
                          {t.data} — {t.inicio} a {t.fim}
                        </p>
                        <p className="text-xs text-stone-400">{t.taxi}</p>
                      </div>
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-medium ${
                          t.estado === "Ativo"
                            ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200"
                            : "bg-stone-100 text-stone-500"
                        }`}
                      >
                        {t.estado}
                      </span>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          )}

          {/* ─── PEDIDOS ─── */}
          {secaoAtiva === "pedidos" && (
            <div className="space-y-5">
              <SectionHeader
                titulo="Pedidos de Clientes"
                subtitulo="Aceitar ou recusar corridas disponíveis"
              />
              <div className="space-y-3">
                {MOCK_PEDIDOS.map((p) => (
                  <Card key={p.id}>
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold">{p.cliente}</p>
                        <p className="text-xs text-stone-500 mt-0.5">
                          {p.origem} → {p.destino}
                        </p>
                        <p className="text-xs text-stone-400 mt-0.5">
                          Pedido às {p.hora}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <button className="rounded-lg bg-emerald-500 px-4 py-2 text-xs font-medium text-white hover:bg-emerald-600 transition">
                          Aceitar
                        </button>
                        <button className="rounded-lg border border-stone-200 px-4 py-2 text-xs text-stone-500 hover:bg-stone-50 transition">
                          Recusar
                        </button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* ─── VIAGENS ─── */}
          {secaoAtiva === "viagens" && (
            <div className="space-y-5">
              <SectionHeader
                titulo="Viagens"
                subtitulo="Iniciar, gerir e terminar viagens"
              />

              {!viagemAtiva ? (
                <Card>
                  <p className="text-sm text-stone-500 mb-4">
                    Nenhuma viagem em curso.
                  </p>
                  <button
                    onClick={() => setViagemAtiva(true)}
                    className="rounded-xl bg-amber-500 px-5 py-3 text-sm font-medium text-white shadow hover:bg-amber-600 transition"
                  >
                    🚕 Iniciar nova viagem
                  </button>
                </Card>
              ) : (
                <Card>
                  <div className="flex items-center gap-2 mb-5">
                    <span className="h-2.5 w-2.5 rounded-full bg-red-500 animate-pulse" />
                    <p className="text-sm font-semibold text-red-600">
                      Viagem em curso
                    </p>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <InputField
                      label="Morada de origem"
                      placeholder="Ex: Rossio, Lisboa"
                    />
                    <InputField
                      label="Morada de destino"
                      placeholder="Ex: Aeroporto de Lisboa"
                    />
                    <InputField
                      label="Nº de passageiros"
                      type="number"
                      placeholder="1"
                    />
                    <InputField label="Hora de início" type="time" />
                  </div>
                  <div className="mt-5 flex flex-wrap gap-3">
                    <button
                      onClick={() => {
                        setViagemAtiva(false);
                        setMostrarFatura(true);
                      }}
                      className="rounded-xl bg-stone-900 px-5 py-2.5 text-sm font-medium text-white hover:bg-stone-800 transition"
                    >
                      Terminar viagem
                    </button>
                    <button
                      onClick={() => setViagemAtiva(false)}
                      className="rounded-xl border border-stone-200 px-5 py-2.5 text-sm text-stone-500 hover:bg-stone-50 transition"
                    >
                      Cancelar
                    </button>
                  </div>
                </Card>
              )}

              {mostrarFatura && (
                <Card>
                  <p className="font-semibold mb-1">Viagem concluída</p>
                  <p className="text-xs text-stone-400 mb-4">
                    Preço calculado automaticamente
                  </p>
                  <div className="flex items-end gap-6 flex-wrap">
                    <div>
                      <p className="text-xs text-stone-400">Distância</p>
                      <p className="text-lg font-bold">12.4 km</p>
                    </div>
                    <div>
                      <p className="text-xs text-stone-400">Duração</p>
                      <p className="text-lg font-bold">18 min</p>
                    </div>
                    <div>
                      <p className="text-xs text-stone-400">Preço</p>
                      <p className="text-2xl font-bold text-amber-600">
                        €14,80
                      </p>
                    </div>
                  </div>
                  <div className="mt-5 flex gap-3 flex-wrap">
                    <button className="rounded-xl bg-emerald-500 px-5 py-2.5 text-sm font-medium text-white hover:bg-emerald-600 transition">
                      Confirmar pagamento
                    </button>
                    <button className="rounded-xl border border-stone-200 px-5 py-2.5 text-sm text-stone-500 hover:bg-stone-50 transition">
                      Emitir fatura
                    </button>
                    <button
                      onClick={() => setMostrarFatura(false)}
                      className="rounded-xl border border-stone-200 px-5 py-2.5 text-xs text-stone-400 hover:bg-stone-50 transition"
                    >
                      Fechar
                    </button>
                  </div>
                </Card>
              )}
            </div>
          )}

          {/* ─── PAGAMENTOS ─── */}
          {secaoAtiva === "pagamentos" && (
            <div className="space-y-5">
              <SectionHeader
                titulo="Pagamentos e Faturação"
                subtitulo="Confirmar pagamentos e emitir faturas"
              />
              {[
                {
                  viagem: "Rossio → Aeroporto",
                  valor: "€14,80",
                  estado: "Pago",
                },
                {
                  viagem: "Belém → Parque Nações",
                  valor: "€9,20",
                  estado: "Pendente",
                },
                {
                  viagem: "Saldanha → Cascais",
                  valor: "€28,50",
                  estado: "Pendente",
                },
              ].map((p, i) => (
                <Card key={i}>
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-medium">{p.viagem}</p>
                      <p className="text-lg font-bold mt-0.5">{p.valor}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-medium ${
                          p.estado === "Pago"
                            ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200"
                            : "bg-amber-50 text-amber-700 ring-1 ring-amber-200"
                        }`}
                      >
                        {p.estado}
                      </span>
                      {p.estado === "Pendente" && (
                        <button className="rounded-lg bg-stone-900 px-3 py-2 text-xs font-medium text-white hover:bg-stone-800 transition">
                          Confirmar
                        </button>
                      )}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}

          {/* ─── VEÍCULO ─── */}
          {secaoAtiva === "veiculo" && (
            <div className="space-y-5">
              <div className="flex items-start justify-between flex-wrap gap-3">
                <SectionHeader
                  titulo="Operações do Veículo"
                  subtitulo="Reabastecimentos e manutenção"
                />
                <button
                  onClick={() =>
                    setMostrarReabastecimento(!mostrarReabastecimento)
                  }
                  className="rounded-xl bg-amber-500 px-4 py-2.5 text-sm font-medium text-white shadow hover:bg-amber-600 transition"
                >
                  + Registar reabastecimento
                </button>
              </div>

              {mostrarReabastecimento && (
                <Card>
                  <p className="font-semibold mb-4">Novo reabastecimento</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs text-stone-500 mb-1.5">
                        Tipo
                      </label>
                      <select className="w-full rounded-lg border border-stone-200 bg-white px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-300">
                        <option>Gasóleo</option>
                        <option>Gasolina</option>
                        <option>Elétrico</option>
                        <option>GPL</option>
                      </select>
                    </div>
                    <InputField
                      label="Litros / kWh"
                      type="number"
                      placeholder="Ex: 45"
                    />
                    <InputField
                      label="Custo (€)"
                      type="number"
                      placeholder="Ex: 72.50"
                    />
                    <InputField
                      label="Km do táxi"
                      type="number"
                      placeholder="Ex: 134520"
                    />
                  </div>
                  <button className="mt-5 rounded-xl bg-stone-900 px-5 py-2.5 text-sm font-medium text-white hover:bg-stone-800 transition">
                    Guardar
                  </button>
                </Card>
              )}

              <Card>
                <p className="font-semibold mb-3">Últimos reabastecimentos</p>
                <div className="space-y-2">
                  {[
                    {
                      data: "22/03",
                      tipo: "Gasóleo",
                      litros: "42L",
                      custo: "€68,40",
                      km: "134 520 km",
                    },
                    {
                      data: "18/03",
                      tipo: "Gasóleo",
                      litros: "38L",
                      custo: "€61,20",
                      km: "133 870 km",
                    },
                    {
                      data: "14/03",
                      tipo: "Gasóleo",
                      litros: "44L",
                      custo: "€71,10",
                      km: "133 200 km",
                    },
                  ].map((r, i) => (
                    <div
                      key={i}
                      className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-stone-50 px-4 py-3"
                    >
                      <div>
                        <p className="text-sm font-medium">
                          {r.data} — {r.tipo} · {r.litros}
                        </p>
                        <p className="text-xs text-stone-400">{r.km}</p>
                      </div>
                      <p className="text-sm font-bold">{r.custo}</p>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

/* ── Small reusable pieces ── */

function SectionHeader({ titulo, subtitulo }) {
  return (
    <div>
      <h2 className="text-2xl font-bold tracking-tight">{titulo}</h2>
      <p className="mt-1 text-sm text-stone-400">{subtitulo}</p>
    </div>
  );
}

function Card({ children }) {
  return (
    <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
      {children}
    </div>
  );
}

function StatCard({ label, valor, detalhe, cor }) {
  const cores = {
    amber: "bg-amber-50 text-amber-700 ring-amber-200",
    sky: "bg-sky-50 text-sky-700 ring-sky-200",
    emerald: "bg-emerald-50 text-emerald-700 ring-emerald-200",
    violet: "bg-violet-50 text-violet-700 ring-violet-200",
  };
  return (
    <div className="rounded-2xl border border-stone-200 bg-white p-4 shadow-sm">
      <p className="text-xs text-stone-400">{label}</p>
      <p className="mt-1 text-xl font-bold">{valor}</p>
      <span
        className={`mt-2 inline-block rounded-full px-2 py-0.5 text-[11px] font-medium ring-1 ${cores[cor]}`}
      >
        {detalhe}
      </span>
    </div>
  );
}

function QuickBtn({ label, sub, onClick }) {
  return (
    <button
      onClick={onClick}
      className="rounded-2xl border border-stone-200 bg-white p-4 text-left shadow-sm transition hover:border-amber-300 hover:shadow-md"
    >
      <p className="text-sm font-semibold">{label}</p>
      <p className="mt-0.5 text-xs text-stone-400">{sub}</p>
    </button>
  );
}

function InputField({ label, type = "text", placeholder }) {
  return (
    <div>
      <label className="block text-xs text-stone-500 mb-1.5">{label}</label>
      <input
        type={type}
        placeholder={placeholder}
        className="w-full rounded-lg border border-stone-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-300"
      />
    </div>
  );
}
