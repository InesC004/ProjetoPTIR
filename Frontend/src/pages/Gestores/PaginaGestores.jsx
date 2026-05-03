/* eslint-disable react/prop-types */
import { useState, useEffect } from "react";
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

import "../../css/paginaGestores.css";

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
    <div className="pg-page">
      <div className="pg-bg-grid" />
      <div className="pg-orb pg-orb-left" />
      <div className="pg-orb pg-orb-right" />

      <header className="pg-header">
        <div className="pg-logo" onClick={() => navigate("/")}>
          <img src={logo} alt="TakeCab" />
          <div>
            <strong>
              Take<span>Cab</span>
            </strong>
            <small>Premium Rides</small>
          </div>
        </div>

        <div className="pg-header-right">
          <span className="pg-badge">
            <span />
            Gestor
          </span>

          <button
            className="pg-logout"
            onClick={() => {
              localStorage.removeItem("token");
              localStorage.removeItem("cliente");
              localStorage.removeItem("role");
              navigate("/");
            }}
          >
            Sair
          </button>
        </div>
      </header>

      <div className="pg-layout">
        <aside className="pg-sidebar">
          <p className="pg-sidebar-title">Painel do Gestor</p>

          <nav className="pg-nav">
            {NAV.map((item) => {
              const Icon = item.Icon;
              const isActive = active === item.id;

              return (
                <button
                  key={item.id}
                  className={`pg-nav-item ${isActive ? "active" : ""}`}
                  onClick={() => setActive(item.id)}
                >
                  <Icon size={18} />
                  {item.label}
                </button>
              );
            })}
          </nav>
        </aside>

        <main className="pg-main" key={active}>
          <div className="pg-section-head">
            <div className="pg-tag">
              <span />
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
                t="Relatórios"
                s="Visualização de relatórios da empresa."
              />
            )}


          </div>

          <div className="pg-content">
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

            {active === "relatorios" && <SecRelatorios />}
          </div>
        </main>
      </div>

      <RegistarTaxi aberto={modalTaxi} onFechar={() => setModalTaxi(false)} />
      <RegistarMotorista aberto={modalMotorista} onFechar={() => setModalMotorista(false)} />
      <EditarTaxi aberto={modalEditTaxi} onFechar={() => setModalEditTaxi(false)} />
      <EditarMotorista aberto={modalEditMotorista} onFechar={() => setModalEditMotorista(false)} />
      <RemoverTaxi aberto={modalRemoverTaxi} onFechar={() => setModalRemoverTaxi(false)} />
      <RemoverMotorista aberto={modalRemoverMotorista} onFechar={() => setModalRemoverMotorista(false)} />
      <DefinirPrecos aberto={modalPrecos} onFechar={() => setModalPrecos(false)} />
      <ListarPrecos aberto={modalListarPrecos} onFechar={() => setModalListarPrecos(false)} onEditar={() => setModalPrecos(true)} />
      <SimularViagem aberto={modalSimular} onFechar={() => setModalSimular(false)} />
    </div>
  );
}

function PageHead({ t, s }) {
  return (
    <>
      <h2 className="pg-title">{t}</h2>
      <p className="pg-desc">{s}</p>
    </>
  );
}

function SecDados(props) {
  return (
    <div className="pg-grid">
      <Card Icon={Car} color="blue" title="Táxis">
        <Action Icon={Plus} label="Registar táxi" accent onClick={props.onRegistarTaxi} />
        <Action Icon={Pencil} label="Editar táxi" onClick={props.onEditarTaxi} />
        <Action Icon={Trash2} label="Remover táxi" danger onClick={props.onRemoverTaxi} />
      </Card>

      <Card Icon={Users} color="green" title="Motoristas">
        <Action Icon={Plus} label="Registar motorista" accent onClick={props.onRegistarMotorista} />
        <Action Icon={Pencil} label="Editar motorista" onClick={props.onEditarMotorista} />
        <Action Icon={Trash2} label="Remover motorista" danger onClick={props.onRemoverMotorista} />
      </Card>
    </div>
  );
}

function SecConfig({ onDefinirPrecos, onListarPrecos, onSimularViagem }) {
  return (
    <div className="pg-grid">
      <Card Icon={DollarSign} color="blue" title="Preços por minuto">
        <Action Icon={DollarSign} label="Definir preços" accent onClick={onDefinirPrecos} />
        <Action Icon={DollarSign} label="Ver preços atuais" onClick={onListarPrecos} />
      </Card>

      <Card Icon={Calculator} color="green" title="Simulação de viagem">
        <Action Icon={Calculator} label="Simular custo de viagem" accent onClick={onSimularViagem} />
      </Card>
    </div>
  );
}

function Card({ Icon, color, title, children }) {
  return (
    <div className={`pg-card ${color}`}>
      <div className="pg-card-head">
        <div className="pg-card-icon">
          <Icon size={20} />
        </div>
        <h3>{title}</h3>
      </div>

      <div className="pg-actions">{children}</div>
    </div>
  );
}

function Action({ Icon, label, accent, danger, onClick }) {
  return (
    <button
      className={`pg-action ${accent ? "accent" : ""} ${danger ? "danger" : ""}`}
      onClick={onClick}
    >
      <span>
        <span className="pg-action-icon">
          <Icon size={15} />
        </span>
        {label}
      </span>
    </button>
  );
}





function SecRelatorios() {
  const [tipo, setTipo] = useState("taxi");
  const [total, setTotal] = useState("viagens");
  const [sub, setSub] = useState(null);
  const [pesquisa, setPesquisa] = useState("");
  const [turnos, setTurnos] = useState([]);
  const [loadingTurnos, setLoadingTurnos] = useState(false);

  const hoje = new Date().toISOString().slice(0, 10);
  const [dataInicio, setDataInicio] = useState(hoje);
  const [dataFim, setDataFim] = useState(hoje);

  useEffect(() => {
    async function carregarTurnos() {
      try {
        setLoadingTurnos(true);

        const token = localStorage.getItem("token");

        const res = await fetch("http://localhost:8080/api/turnos/todos", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });
     

        if (!res.ok) {
          throw new Error("Erro HTTP: " + res.status);
        }

        const contentType = res.headers.get("content-type");

        if (!contentType || !contentType.includes("application/json")) {
          throw new Error("A resposta não é JSON. Verifica a rota do backend.");
        }

        const dados = await res.json();
        setTurnos(Array.isArray(dados) ? dados : []);

      } catch (err) {
        console.error("Erro ao carregar turnos:", err);
        setTurnos([]);
      } finally {
        setLoadingTurnos(false);
      }
    }

    carregarTurnos();
  }, []);

  function formatarData(data) {
    return new Date(data).toLocaleString("pt-PT", {
      day: "2-digit",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  function horasTurno(turno) {
    const inicio = new Date(turno.data_inicio);
    const fim = new Date(turno.data_fim);
    return Math.max((fim - inicio) / (1000 * 60 * 60), 0);
  }

  function estadoTurno(turno) {
    const agora = new Date();
    const inicio = new Date(turno.data_inicio);
    const fim = new Date(turno.data_fim);

    if (agora >= inicio && agora <= fim) return "A trabalhar";
    if (agora > fim) return "Já trabalhou";
    return "Ainda não começou";
  }

  

  function mesmoDiaOuPeriodo(turno) {
    const inicioTurno = new Date(turno.data_inicio);
    const fimTurno = new Date(turno.data_fim);

    const inicio = new Date(`${dataInicio}T00:00:00`);
    const fim = new Date(`${dataFim}T23:59:59`);

    return inicioTurno <= fim && fimTurno >= inicio;
  }
  const turnosFiltrados = turnos.filter(mesmoDiaOuPeriodo);

  const turnosPesquisa = turnosFiltrados.filter((turno) => {
    const texto = `
      ${turno.motorista?.nome || ""}
      ${turno.motorista?.nif || ""}
      ${turno.taxi?.matricula || ""}
      ${turno.taxi?.marca || ""}
      ${turno.taxi?.modelo || ""}
    `.toLowerCase();

    return texto.includes(pesquisa.toLowerCase());
  });

  const aTrabalhar = turnosPesquisa.filter(
    (t) => estadoTurno(t) === "A trabalhar",
  );

  const jaTrabalharam = turnosPesquisa.filter(
    (t) => estadoTurno(t) === "Já trabalhou",
  );

  const aindaNaoComecaram = turnosPesquisa.filter(
    (t) => estadoTurno(t) === "Ainda não começou",
  );

  const totalHorasTurnos = turnosPesquisa.reduce(
    (acc, turno) => acc + horasTurno(turno),
    0,
  );

  const totais = {
    taxi: [
      ["viagens", "Total de viagens", "00"],
      ["horas", "Total de horas", "00h"],
      ["km", "Total de quilómetros", "000km"],
    ],
    clientes: [["euros", "Total cobrado", "000€"]],
    reabastecimentos: [
      ["euros", "Total pago", "00€"],
      ["horas", "Horas gastas", "00h"],
    ],
    turnos: [
      ["ativos", "A trabalhar agora", aTrabalhar.length],
      ["feitos", "Já trabalharam", jaTrabalharam.length],
      ["pendentes", "Ainda não começaram", aindaNaoComecaram.length],
      ["horas", "Horas em turnos", `${totalHorasTurnos.toFixed(1)}h`],
    ],
  };

  const dados = {
    taxi: {
      titulo: "Táxis e motoristas",
      desc: "Visualize viagens, horas e quilómetros por motorista e táxi.",
    },
    clientes: {
      titulo: "Clientes e faturação",
      desc: "Visualize totais cobrados e valores pagos por cliente.",
    },
    reabastecimentos: {
      titulo: "Reabastecimentos",
      desc: "Visualize custos e tempo gasto em reabastecimentos de táxis.",
    },
    turnos: {
      titulo: "Turnos dos motoristas",
      desc: "Veja quem está a trabalhar, quem já trabalhou e quem ainda não começou.",
    },
  };

  const subtotaisMock = [
    ["Motorista João Silva", "12 viagens", "86h", "1 240 km"],
    ["Motorista Ana Costa", "9 viagens", "61h", "920 km"],
  ];

  const viagensMock = [
    ["Viagem #1024", "AA-23-BB", "14:20 → 15:05", "45 min", "18 km"],
    ["Viagem #1018", "AA-23-BB", "10:10 → 10:42", "32 min", "11 km"],
    ["Viagem #1007", "CC-45-DD", "19:00 → 19:31", "31 min", "9 km"],
  ];

  const atual = dados[tipo];

  return (
    <div className="pg-relatorios">
      <div className="pg-relatorios-topo">
        <div>
          <h3>{atual.titulo}</h3>
          <p>{atual.desc}</p>
        </div>

        <div className="pg-filtros">
          <label>
            Data inicial
            <input
              type="date"
              value={dataInicio}
              onChange={(e) => setDataInicio(e.target.value)}
            />
          </label>

          <label>
            Data final
            <input
              type="date"
              value={dataFim}
              onChange={(e) => setDataFim(e.target.value)}
            />
          </label>
        </div>
      </div>

      <div className="pg-tabs-relatorios">
        <button
          className={tipo === "taxi" ? "active" : ""}
          onClick={() => {
            setTipo("taxi");
            setTotal("viagens");
            setSub(null);
          }}
        >
          Táxis e motoristas
        </button>

        <button
          className={tipo === "clientes" ? "active" : ""}
          onClick={() => {
            setTipo("clientes");
            setTotal("euros");
            setSub(null);
          }}
        >
          Clientes e faturação
        </button>

        <button
          className={tipo === "reabastecimentos" ? "active" : ""}
          onClick={() => {
            setTipo("reabastecimentos");
            setTotal("euros");
            setSub(null);
          }}
        >
          Reabastecimentos
        </button>

        <button
          className={tipo === "turnos" ? "active" : ""}
          onClick={() => {
            setTipo("turnos");
            setTotal("ativos");
            setSub(null);
          }}
        >
          Turnos
        </button>
      </div>

      <div className="pg-busca-wrap">
        <input
          type="text"
          placeholder="Pesquisar motorista, táxi, matrícula ou NIF..."
          value={pesquisa}
          onChange={(e) => setPesquisa(e.target.value)}
          className="pg-busca"
        />
      </div>

      <div className="pg-total-grid">
        {totais[tipo].map(([id, label, valor]) => (
          <button
            key={id}
            className={total === id ? "pg-card active" : "pg-card"}
            onClick={() => {
              setTotal(id);
              setSub(null);
            }}
          >
            <span>{label}</span>
            <strong>{valor}</strong>
            <small>Clique para ver detalhes</small>
          </button>
        ))}
      </div>

      {tipo !== "turnos" && (
        <div className="pg-sub">
          <div className="pg-panel">
            <h4>Motoristas e táxis</h4>

            {subtotaisMock.map(([nome, viagens, horas, km]) => (
              <button
                key={nome}
                className={sub === nome ? "pg-row active" : "pg-row"}
                onClick={() => setSub(nome)}
              >
                <span>{nome}</span>
                <strong>
                  {viagens} · {horas} · {km}
                </strong>
              </button>
            ))}
          </div>

          <div className="pg-panel">
            <h4>Viagens</h4>

            {viagensMock.map(([viagem, matricula, periodo, horas, km]) => (
              <button key={viagem} className="pg-row">
                <span>
                  {viagem}
                  <small>{matricula} · {periodo}</small>
                </span>
                <strong>
                  {horas} · {km}
                </strong>
              </button>
            ))}
          </div>
        </div>
      )}

      {tipo === "turnos" && (
        <div className="pg-sub">
          <div className="pg-panel">
            <h4>Resumo dos turnos</h4>

            {loadingTurnos && (
              <p className="pg-empty">A carregar turnos da base de dados...</p>
            )}

            {!loadingTurnos && turnosPesquisa.length === 0 && (
              <p className="pg-empty">Nenhum turno encontrado neste período.</p>
            )}

            {!loadingTurnos &&
              turnosPesquisa.map((turno) => (
                <button
                  key={turno._id}
                  className={sub === turno._id ? "pg-row active" : "pg-row"}
                  onClick={() => setSub(turno._id)}
                >
                  <span>
                    {turno.motorista?.nome || "Motorista sem nome"}
                    <small>
                      {turno.taxi?.matricula || "Sem matrícula"} ·{" "}
                      {estadoTurno(turno)}
                    </small>
                  </span>

                  <strong>{horasTurno(turno).toFixed(1)}h</strong>
                </button>
              ))}
          </div>

          <div className="pg-panel">
            <h4>Detalhes do turno</h4>

            {!sub && (
              <p className="pg-empty">
                Selecione um turno para ver os detalhes.
              </p>
            )}

            {sub &&
              turnosPesquisa
                .filter((turno) => turno._id === sub)
                .map((turno) => (
                  <div key={turno._id} className="pg-turno-detalhes">
                    <div>
                      <span>Motorista</span>
                      <strong>{turno.motorista?.nome || "Sem nome"}</strong>
                    </div>

                    <div>
                      <span>NIF</span>
                      <strong>{turno.motorista?.nif || "—"}</strong>
                    </div>

                    <div>
                      <span>Táxi</span>
                      <strong>
                        {turno.taxi?.marca} {turno.taxi?.modelo}
                      </strong>
                    </div>

                    <div>
                      <span>Matrícula</span>
                      <strong>{turno.taxi?.matricula || "—"}</strong>
                    </div>

                    <div>
                      <span>Início</span>
                      <strong>{formatarData(turno.data_inicio)}</strong>
                    </div>

                    <div>
                      <span>Fim</span>
                      <strong>{formatarData(turno.data_fim)}</strong>
                    </div>

                    <div>
                      <span>Estado</span>
                      <strong>{estadoTurno(turno)}</strong>
                    </div>

                    <div>
                      <span>Horas</span>
                      <strong>{horasTurno(turno).toFixed(1)}h</strong>
                    </div>

                    <div>
                      <span>Viagens associadas</span>
                      <strong>{turno.viagens?.length || 0}</strong>
                    </div>
                  </div>
                ))}
          </div>
        </div>
      )}
    </div>
  );
}