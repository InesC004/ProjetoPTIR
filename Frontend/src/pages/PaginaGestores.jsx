/* eslint-disable react/prop-types */
export default function PaginaGestores() {
  const kpis = [
    { label: "Táxis ativos", value: "48", note: "+3 este mês" },
    { label: "Motoristas", value: "73", note: "68 em serviço" },
    { label: "Faturação", value: "€24.580", note: "+12% vs. mês anterior" },
    { label: "Viagens", value: "1.284", note: "média de 41/dia" },
  ];

  const dataManagement = [
    "Registar táxis",
    "Editar/remover táxis",
    "Registar motoristas",
    "Editar/remover motoristas",
  ];

  const systemConfig = [
    "Definir preços por minuto",
    "Configurar acréscimos",
    "Simular custo de viagens",
  ];

  const reports = [
    "Viagens (nº, tempo, km)",
    "Motoristas",
    "Táxis",
    "Clientes",
    "Faturação (€)",
    "Reabastecimentos",
  ];

  const exploration = [
    "Subtotais por motorista",
    "Subtotais por táxi",
    "Subtotais por cliente",
    "Detalhes de viagens",
    "Detalhes de táxis",
    "Detalhes de motoristas",
  ];

  const quickActions = [
    { title: "Novo táxi", subtitle: "Adicionar à frota" },
    { title: "Novo motorista", subtitle: "Registar colaborador" },
    { title: "Simular viagem", subtitle: "Testar custo estimado" },
    { title: "Exportar relatório", subtitle: "Gerar ficheiro" },
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <div className="mx-auto flex max-w-7xl gap-6 px-4 py-6 sm:px-6 lg:px-8">
        <aside className="hidden w-72 shrink-0 lg:block">
          <div className="sticky top-6 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-8 flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-900 text-sm font-semibold text-white">
                GT
              </div>
              <div>
                <p className="text-sm text-slate-500">Painel</p>
                <h1 className="text-lg font-semibold">Gestão da Empresa</h1>
              </div>
            </div>

            <nav className="space-y-2 text-sm">
              {[
                "Visão geral",
                "Gestão de dados",
                "Configuração",
                "Relatórios",
                "Exploração",
              ].map((item, index) => (
                <button
                  key={item}
                  className={`flex w-full items-center justify-between rounded-2xl px-4 py-3 text-left transition ${
                    index === 0
                      ? "bg-slate-900 text-white"
                      : "text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  <span>{item}</span>
                  <span className="text-xs opacity-70">›</span>
                </button>
              ))}
            </nav>

            <div className="mt-8 rounded-2xl bg-slate-100 p-4">
              <p className="text-sm font-medium">Resumo rápido</p>
              <p className="mt-2 text-sm text-slate-600">
                Acompanhe operação, preços e relatórios num único painel.
              </p>
            </div>
          </div>
        </aside>

        <main className="flex-1">
          <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">
                  Área do gestor
                </p>
                <h2 className="mt-1 text-3xl font-semibold tracking-tight">
                  Controlo operacional e análise
                </h2>
                <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600 sm:text-base">
                  Interface simples e moderna para gerir táxis, motoristas,
                  preços, relatórios e exploração detalhada dos dados da
                  empresa.
                </p>
              </div>

              <div className="flex flex-wrap gap-3">
                <button className="rounded-2xl bg-slate-900 px-5 py-3 text-sm font-medium text-white shadow-sm transition hover:opacity-90">
                  Gerar relatório
                </button>
                <button className="rounded-2xl border border-slate-200 px-5 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50">
                  Simular viagem
                </button>
              </div>
            </div>
          </section>

          <section className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {kpis.map((item) => (
              <div
                key={item.label}
                className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"
              >
                <p className="text-sm text-slate-500">{item.label}</p>
                <p className="mt-3 text-3xl font-semibold tracking-tight">
                  {item.value}
                </p>
                <p className="mt-2 text-sm text-slate-600">{item.note}</p>
              </div>
            ))}
          </section>

          <section className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-[1.2fr_0.8fr]">
            <div className="space-y-6">
              <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold">Ações rápidas</h3>
                    <p className="mt-1 text-sm text-slate-500">
                      Operações frequentes para o gestor.
                    </p>
                  </div>
                </div>

                <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
                  {quickActions.map((action) => (
                    <button
                      key={action.title}
                      className="rounded-2xl border border-slate-200 p-4 text-left transition hover:border-slate-300 hover:bg-slate-50"
                    >
                      <p className="font-medium">{action.title}</p>
                      <p className="mt-1 text-sm text-slate-500">
                        {action.subtitle}
                      </p>
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                <FeatureCard
                  title="Gestão de dados"
                  description="Registo e manutenção de táxis e motoristas."
                  items={dataManagement}
                />
                <FeatureCard
                  title="Configuração do sistema"
                  description="Ajuste de preços, acréscimos e simulações."
                  items={systemConfig}
                />
                <FeatureCard
                  title="Relatórios e análise"
                  description="Visão analítica da operação e faturação."
                  items={reports}
                />
                <FeatureCard
                  title="Exploração de dados"
                  description="Consulta detalhada e subtotais por entidade."
                  items={exploration}
                />
              </div>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}

function FeatureCard({ title, description, items }) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <h3 className="text-lg font-semibold">{title}</h3>
      <p className="mt-1 text-sm text-slate-500">{description}</p>
      <div className="mt-5 space-y-3">
        {items.map((item) => (
          <div
            key={item}
            className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3"
          >
            <span className="text-sm text-slate-700">{item}</span>
            <span className="text-slate-400">+</span>
          </div>
        ))}
      </div>
    </div>
  );
}
