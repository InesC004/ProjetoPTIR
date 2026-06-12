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
  Search,
  RefreshCw,
  CarFront,
  Star,
} from "lucide-react";

import logo from "../../Pictures/logo1.jpeg";
import api from "../../Api";
import RegistarTaxi from "../../components/RegistarTaxi";
import RegistarModeloTaxi from "../../components/RegistarModeloTaxi";
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
  const [modalModeloTaxi, setModalModeloTaxi] = useState(false);
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
                onRegistarModeloTaxi={() => setModalModeloTaxi(true)}
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
      <RegistarModeloTaxi
        aberto={modalModeloTaxi}
        onFechar={() => setModalModeloTaxi(false)}
      />
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
  const [taxis, setTaxis] = useState([]);
  const [motoristas, setMotoristas] = useState([]);
  const [turnos, setTurnos] = useState([]);
  const [pesquisa, setPesquisa] = useState("");
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState("");

  useEffect(() => {
    carregarDisponiveis();
  }, []);

  async function carregarDisponiveis() {
    try {
      setLoading(true);
      setErro("");

      const [dadosTaxis, dadosMotoristas, dadosTurnos] = await Promise.all([
        api.taxis.listar(),
        api.motoristas.listar(),
        api.turnos.listarTodos(),
      ]);

      const listaTaxis = Array.isArray(dadosTaxis)
        ? dadosTaxis
        : dadosTaxis.taxis || dadosTaxis.data || [];

      const listaMotoristas = Array.isArray(dadosMotoristas)
        ? dadosMotoristas
        : dadosMotoristas.motoristas || dadosMotoristas.data || [];

      const listaTurnos = Array.isArray(dadosTurnos)
        ? dadosTurnos
        : dadosTurnos.turnos || dadosTurnos.data || [];

      setTaxis(listaTaxis);
      setMotoristas(listaMotoristas);
      setTurnos(listaTurnos);
    } catch (err) {
      console.error("Erro ao carregar táxis/motoristas:", err);
      setErro(err.message || "Erro ao carregar dados.");
      setTaxis([]);
      setMotoristas([]);
      setTurnos([]);
    } finally {
      setLoading(false);
    }
  }

  function getId(valor) {
    if (!valor) return "";
    return String(valor._id || valor.id || valor);
  }

  function formatarData(data) {
    if (!data) return "Sem data";

    const date = new Date(data);
    if (Number.isNaN(date.getTime())) return "Sem data";

    return date.toLocaleString("pt-PT", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  function turnosDaEntidade(tipo, entidadeId) {
    const agora = new Date();

    return turnos
      .filter((turno) => getId(turno[tipo]) === entidadeId)
      .filter((turno) => new Date(turno.data_fim) >= agora)
      .sort((a, b) => new Date(a.data_inicio) - new Date(b.data_inicio));
  }

  function getEstadoOperacional(turnosEntidade, estadoOriginal) {
    const agora = new Date();
    const turnoAtivo = turnosEntidade.find((turno) => {
      const inicio = new Date(turno.data_inicio);
      const fim = new Date(turno.data_fim);
      return inicio <= agora && fim >= agora;
    });

    if (turnoAtivo) {
      return { texto: "Em turno", tipo: "ocupado", turno: turnoAtivo };
    }

    const turnoFuturo = turnosEntidade.find(
      (turno) => new Date(turno.data_inicio) > agora,
    );

    if (turnoFuturo) {
      return { texto: "Turno agendado", tipo: "agendado", turno: turnoFuturo };
    }

    return {
      texto: estadoOriginal || "Livre",
      tipo: "livre",
      turno: null,
    };
  }

  function getTaxiComTurnos(taxi) {
    const entidadeTurnos = turnosDaEntidade("taxi", getId(taxi));
    return {
      ...taxi,
      turnosEntidade: entidadeTurnos,
      estadoOperacional: getEstadoOperacional(entidadeTurnos, taxi.estado),
    };
  }

  function getMotoristaComTurnos(motorista) {
    const entidadeTurnos = turnosDaEntidade("motorista", getId(motorista));
    return {
      ...motorista,
      turnosEntidade: entidadeTurnos,
      estadoOperacional: getEstadoOperacional(
        entidadeTurnos,
        motorista.estado || motorista.status,
      ),
    };
  }

  function formatarAvaliacao(motorista) {
    const total = Number(motorista.total_avaliacoes || 0);
    const media = Number(motorista.avaliacao_media || 0);

    if (!total) return "Novo";

    return `${media.toFixed(1)} (${total})`;
  }

  function textoTaxi(taxi) {
    return `
      ${taxi.matricula || ""}
      ${taxi.marca || ""}
      ${taxi.modelo || ""}
      ${taxi.tipo_motor || ""}
      ${taxi.nivel_conforto || ""}
      ${taxi.estado || ""}
      ${taxi.estadoOperacional?.texto || ""}
      ${taxi.turnosEntidade
        ?.map((turno) => `${turno.motorista?.nome || ""} ${turno.motorista?.nif || ""}`)
        .join(" ") || ""}
    `.toLowerCase();
  }

  function textoMotorista(motorista) {
    return `
      ${motorista.nome || ""}
      ${motorista.nif || ""}
      ${motorista.email || ""}
      ${motorista.numero_carta || ""}
      ${motorista.estado || ""}
      ${motorista.estadoOperacional?.texto || ""}
      ${formatarAvaliacao(motorista)}
      ${motorista.turnosEntidade
        ?.map((turno) => `${turno.taxi?.matricula || ""} ${turno.taxi?.marca || ""} ${turno.taxi?.modelo || ""}`)
        .join(" ") || ""}
    `.toLowerCase();
  }

  const pesquisaNormalizada = pesquisa.trim().toLowerCase();

  const taxisExistentes = taxis
    .map(getTaxiComTurnos)
    .filter((taxi) => textoTaxi(taxi).includes(pesquisaNormalizada));

  const motoristasExistentes = motoristas
    .map(getMotoristaComTurnos)
    .filter((motorista) =>
      textoMotorista(motorista).includes(pesquisaNormalizada),
    );

  return (
    <div className="pg-dados-wrap">
      <div className="pg-grid">
        <Card Icon={Car} color="blue" title="Táxis">
          <Action
            Icon={Plus}
            label="Registar táxi"
            accent
            onClick={props.onRegistarTaxi}
          />
          <Action
            Icon={CarFront}
            label="Registar marca/modelo"
            onClick={props.onRegistarModeloTaxi}
          />
          <Action
            Icon={Pencil}
            label="Editar táxi"
            onClick={props.onEditarTaxi}
          />
          <Action
            Icon={Trash2}
            label="Remover táxi"
            danger
            onClick={props.onRemoverTaxi}
          />
        </Card>

        <Card Icon={Users} color="green" title="Motoristas">
          <Action
            Icon={Plus}
            label="Registar motorista"
            accent
            onClick={props.onRegistarMotorista}
          />
          <Action
            Icon={Pencil}
            label="Editar motorista"
            onClick={props.onEditarMotorista}
          />
          <Action
            Icon={Trash2}
            label="Remover motorista"
            danger
            onClick={props.onRemoverMotorista}
          />
        </Card>
      </div>

      <section className="pg-disponiveis pg-disponiveis-inline">
        <div className="pg-disponiveis-topo">
          <div>
            <h3>Táxis e Motoristas</h3>
            <p>Lista de táxis e motoristas com estado calculado pelos turnos.</p>
          </div>

          <button
            className="pg-refresh"
            onClick={carregarDisponiveis}
            disabled={loading}
          >
            <RefreshCw size={16} />
            {loading ? "A carregar..." : "Atualizar"}
          </button>
        </div>

        <div className="pg-search-wrap">
          <Search className="pg-search-icon" size={18} />
          <input
            className="pg-search"
            type="text"
            value={pesquisa}
            onChange={(e) => setPesquisa(e.target.value)}
            placeholder="Pesquisar por matrícula, nome, NIF, email..."
          />
        </div>

        {erro && <p className="pg-alerta-erro">{erro}</p>}

        <div className="pg-disponiveis-grid">
          <div className="pg-panel">
            <h4>
              Táxis Existentes ({loading ? "..." : taxisExistentes.length})
            </h4>

            {loading && <p className="pg-empty">A carregar táxis...</p>}

            {!loading && taxisExistentes.length === 0 && (
              <p className="pg-empty">Nenhum táxi encontrado.</p>
            )}

            {!loading && taxisExistentes.length > 0 && (
              <div className="pg-lista-cards">
                {taxisExistentes.map((taxi) => (
                  <div
                    key={taxi._id || taxi.matricula}
                    className="pg-mini-card"
                  >
                    <div className="pg-mini-icon blue">
                      <Car size={18} />
                    </div>

                    <div className="pg-mini-info">
                      <div className="pg-mini-title-row">
                        <strong>{taxi.matricula || "Sem matrícula"}</strong>
                        <small
                          className={`pg-status ${taxi.estadoOperacional.tipo}`}
                        >
                          {taxi.estadoOperacional.texto}
                        </small>
                      </div>
                      <span>
                        {taxi.marca || "Sem marca"} {taxi.modelo || ""}
                      </span>

                      <details className="pg-mini-details">
                        <summary>Detalhes</summary>
                        <div className="pg-detail-grid">
                          <Detail label="Motor" value={taxi.tipo_motor} />
                          <Detail
                            label="Conforto"
                            value={taxi.nivel_conforto}
                          />
                          <Detail
                            label="Ano de compra"
                            value={taxi.ano_compra}
                          />
                          <Detail label="Estado base" value={taxi.estado} />
                        </div>

                        {taxi.turnosEntidade.length > 0 && (
                          <div className="pg-turnos-mini">
                            <strong>Turnos</strong>
                            {taxi.turnosEntidade.slice(0, 3).map((turno) => (
                              <p key={turno._id}>
                                {formatarData(turno.data_inicio)} -{" "}
                                {formatarData(turno.data_fim)}
                                {turno.motorista?.nome
                                  ? ` · ${turno.motorista.nome}`
                                  : ""}
                              </p>
                            ))}
                          </div>
                        )}
                      </details>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="pg-panel">
            <h4>
              Motoristas Existentes (
              {loading ? "..." : motoristasExistentes.length})
            </h4>

            {loading && <p className="pg-empty">A carregar motoristas...</p>}

            {!loading && motoristasExistentes.length === 0 && (
              <p className="pg-empty">Nenhum motorista encontrado.</p>
            )}

            {!loading && motoristasExistentes.length > 0 && (
              <div className="pg-lista-cards">
                {motoristasExistentes.map((motorista) => (
                  <div
                    key={motorista._id || motorista.nif}
                    className="pg-mini-card"
                  >
                    <div className="pg-mini-icon green">
                      <Users size={18} />
                    </div>

                    <div className="pg-mini-info">
                      <div className="pg-mini-title-row">
                        <strong>{motorista.nome || "Sem nome"}</strong>
                        <small
                          className={`pg-status ${motorista.estadoOperacional.tipo}`}
                        >
                          {motorista.estadoOperacional.texto}
                        </small>
                      </div>
                      <span>{motorista.email || "Sem email"}</span>

                      <div className="pg-rating-row">
                        <Star size={15} />
                        <span>{formatarAvaliacao(motorista)}</span>
                      </div>

                      <details className="pg-mini-details">
                        <summary>Detalhes</summary>
                        <div className="pg-detail-grid">
                          <Detail label="NIF" value={motorista.nif} />
                          <Detail
                            label="Carta"
                            value={motorista.numero_carta}
                          />
                          <Detail label="Género" value={motorista.genero} />
                          <Detail label="Morada" value={motorista.morada} />
                          <Detail
                            label="Código postal"
                            value={motorista.codigo_postal}
                          />
                          <Detail
                            label="Avaliações"
                            value={`${motorista.total_avaliacoes || 0}`}
                          />
                        </div>

                        {motorista.turnosEntidade.length > 0 && (
                          <div className="pg-turnos-mini">
                            <strong>Turnos</strong>
                            {motorista.turnosEntidade
                              .slice(0, 3)
                              .map((turno) => (
                                <p key={turno._id}>
                                  {formatarData(turno.data_inicio)} -{" "}
                                  {formatarData(turno.data_fim)}
                                  {turno.taxi?.matricula
                                    ? ` · ${turno.taxi.matricula}`
                                    : ""}
                                </p>
                              ))}
                          </div>
                        )}
                      </details>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}

function Detail({ label, value }) {
  if (value === undefined || value === null || value === "") return null;

  return (
    <div className="pg-detail-item">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function SecConfig({ onDefinirPrecos, onListarPrecos, onSimularViagem }) {
  return (
    <div className="pg-grid">
      <Card Icon={DollarSign} color="blue" title="Preços por minuto">
        <Action
          Icon={DollarSign}
          label="Definir preços"
          accent
          onClick={onDefinirPrecos}
        />
        <Action
          Icon={DollarSign}
          label="Ver preços atuais"
          onClick={onListarPrecos}
        />
      </Card>

      <Card Icon={Calculator} color="green" title="Simulação de viagem">
        <Action
          Icon={Calculator}
          label="Simular custo de viagem"
          accent
          onClick={onSimularViagem}
        />
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

  const [resumo, setResumo] = useState(null);
  const [lista, setLista] = useState([]);
  const [detalhes, setDetalhes] = useState([]);
  const [loadingRelatorios, setLoadingRelatorios] = useState(false);
  const [loadingDetalhes, setLoadingDetalhes] = useState(false);
  const [erroRelatorios, setErroRelatorios] = useState("");

  const hoje = new Date().toISOString().slice(0, 10);
  const [dataInicio, setDataInicio] = useState(hoje);
  const [dataFim, setDataFim] = useState(hoje);

  useEffect(() => {
    carregarRelatorio();
  }, [tipo, total, dataInicio, dataFim]);

  useEffect(() => {
    async function carregarTurnos() {
      try {
        setLoadingTurnos(true);
        const token = localStorage.getItem("token");

        const res = await fetch("http://localhost:8080/api/turnos/todos", {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

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
  function LinhaDetalhe({ label, valor }) {
    return (
      <div className="pg-turno-detalhe-row">
        <span>{label}</span>
        <strong>{valor}</strong>
      </div>
    );
  }
  async function carregarRelatorio() {
    if (tipo === "turnos") {
      setResumo(null);
      setLista([]);
      setDetalhes([]);
      setSub(null);
      setErroRelatorios("");
      return;
    }

    try {
      setLoadingRelatorios(true);
      setErroRelatorios("");

      const token = localStorage.getItem("token");
      const params = `?data_inicio=${dataInicio}&data_fim=${dataFim}`;
      const headers = {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      };

      let urlTotais = "";
      let urlLista = "";

      if (tipo === "taxi") {
        urlTotais = `http://localhost:8080/api/relatorios/viagens/totais${params}`;
        urlLista =
          total === "km"
            ? `http://localhost:8080/api/relatorios/viagens/por-taxi${params}&tipo=km`
            : `http://localhost:8080/api/relatorios/viagens/por-motorista${params}&tipo=${total}`;
      }

      if (tipo === "clientes") {
        urlTotais = `http://localhost:8080/api/relatorios/faturacao/totais${params}`;
        urlLista = `http://localhost:8080/api/relatorios/faturacao/por-cliente${params}`;
      }

      if (tipo === "reabastecimentos") {
        urlTotais = `http://localhost:8080/api/relatorios/reabastecimentos/totais${params}`;
        urlLista = `http://localhost:8080/api/relatorios/reabastecimentos/por-tipo-motor${params}&tipo=${total}`;
      }

      const [resTotais, resLista] = await Promise.all([
        fetch(urlTotais, { headers }),
        fetch(urlLista, { headers }),
      ]);

      const dadosTotais = await resTotais.json();
      const dadosLista = await resLista.json();

      if (!resTotais.ok || !resLista.ok) {
        throw new Error(
          dadosTotais.message ||
            dadosLista.message ||
            "Não foi possível carregar o relatório.",
        );
      }

      setResumo(dadosTotais);
      setLista(dadosLista.subtotais || []);
      setDetalhes([]);
      setSub(null);
    } catch (err) {
      console.error("Erro ao carregar relatório:", err);
      setErroRelatorios(
        err.message || "Não foi possível carregar o relatório.",
      );
      setResumo(null);
      setLista([]);
      setDetalhes([]);
      setSub(null);
    } finally {
      setLoadingRelatorios(false);
    }
  }

  async function carregarDetalhes(item) {
    if (!item) return;

    try {
      setLoadingDetalhes(true);
      setErroRelatorios("");
      const token = localStorage.getItem("token");
      const params = `?data_inicio=${dataInicio}&data_fim=${dataFim}`;

      const headers = {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      };

      let url = "";

      if (tipo === "taxi") {
        if (item.motorista) {
          url = `http://localhost:8080/api/relatorios/viagens/motorista/${item.motorista._id}${params}`;
        }

        if (item.taxi) {
          url = `http://localhost:8080/api/relatorios/viagens/taxi/${item.taxi._id}${params}`;
        }
      }

      if (tipo === "clientes") {
        url = `http://localhost:8080/api/relatorios/faturacao/cliente/${item.cliente._id}${params}`;
      }

      if (tipo === "reabastecimentos") {
        const tipoMotor = item.tipo_motor || item._id;

        url = `http://localhost:8080/api/relatorios/reabastecimentos/${tipoMotor}${params}&tipo=${total}`;
      }

      if (!url) return;

      const res = await fetch(url, { headers });
      const dados = await res.json();

      if (!res.ok) {
        throw new Error(dados.message || "Não foi possível carregar detalhes.");
      }

      setDetalhes(
        dados.reabastecimentos ||
          dados.detalhes ||
          dados.viagens ||
          dados.data ||
          [],
      );
    } catch (err) {
      console.error("Erro ao carregar detalhes:", err);
      setErroRelatorios(err.message || "Não foi possível carregar detalhes.");
      setDetalhes([]);
    } finally {
      setLoadingDetalhes(false);
    }
  }

  function formatarData(data) {
    if (!data) return "Sem data";
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

  const listaPesquisa = lista.filter((item) => {
    const entidade = item.motorista || item.taxi || item.cliente || {};
    const texto = `
      ${entidade.nome || ""}
      ${entidade.nif || ""}
      ${entidade.email || ""}
      ${entidade.matricula || ""}
      ${entidade.marca || ""}
      ${entidade.modelo || ""}
      ${item.tipo_motor || ""}
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
      ["viagens", "Total de viagens"],
      ["horas", "Total de horas"],
      ["km", "Total de quilómetros"],
    ],
    clientes: [["euros", "Total cobrado"]],
    reabastecimentos: [
      ["euros", "Total pago"],
      ["horas", "Horas gastas"],
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

  const atual = dados[tipo];
  const placeholderPesquisa =
    tipo === "clientes"
      ? "Pesquisar cliente, NIF ou email"
      : tipo === "turnos"
        ? "Pesquisar motorista, NIF ou matrícula"
        : tipo === "reabastecimentos"
          ? "Pesquisar tipo de motor ou táxi"
          : "Pesquisar motorista, NIF, táxi ou matrícula";

  function valorResumo(id, valorTurnos) {
    if (tipo === "turnos") return valorTurnos;

    if (tipo === "taxi") {
      if (id === "viagens") return resumo?.total_viagens ?? 0;
      if (id === "horas") return `${resumo?.total_horas ?? 0}h`;
      if (id === "km") return `${resumo?.total_km ?? 0}km`;
    }

    if (tipo === "clientes") {
      return `${resumo?.total_euros ?? 0}€`;
    }

    if (tipo === "reabastecimentos") {
      if (id === "euros") return `${resumo?.total_euros ?? 0}€`;
      if (id === "horas") return `${resumo?.total_horas ?? 0}h`;
    }

    return "—";
  }

  function metricasResumoItem(item) {
    return [
      item.total_reabastecimentos
        ? `${item.total_reabastecimentos} registos`
        : null,
      item.total_viagens ? `${item.total_viagens} viagens` : null,
      item.total_km ? `${item.total_km} km` : null,
      item.total_quilometros ? `${item.total_quilometros} km` : null,
      item.total_litros ? `${item.total_litros} L` : null,
      item.total_kwh ? `${item.total_kwh} kWh` : null,
      item.total_horas ? `${item.total_horas}h` : null,
      item.total_euros ? `${item.total_euros}€` : null,
    ].filter(Boolean);
  }

  function metricasDetalhe(item) {
    if (tipo === "reabastecimentos") {
      return [
        item.total_reabastecimentos
          ? `${item.total_reabastecimentos} registos`
          : null,
        item.total_litros ? `${item.total_litros} L` : null,
        item.total_kwh ? `${item.total_kwh} kWh` : null,
        item.total_quilometros ? `${item.total_quilometros} km` : null,
        item.total_horas ? `${item.total_horas}h` : null,
        item.total_euros ? `${item.total_euros}€` : null,
        item.litros != null ? `${item.litros} L` : null,
        item.kwh != null ? `${item.kwh} kWh` : null,
        item.euros != null ? `${item.euros}€` : null,
        item.quilometros != null ? `${item.quilometros} km` : null,
      ].filter(Boolean);
    }

    return [
      item.preco_total ? `${item.preco_total}€` : null,
      item.total_euros ? `${item.total_euros}€` : null,
      item.km ? `${item.km} km` : null,
      item.horas ? `${item.horas}h` : null,
      item.total_horas ? `${item.total_horas}h` : null,
    ].filter(Boolean);
  }

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
            setPesquisa("");
            setDetalhes([]);
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
            setPesquisa("");
            setDetalhes([]);
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
            setPesquisa("");
            setDetalhes([]);
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
            setPesquisa("");
            setDetalhes([]);
          }}
        >
          Turnos
        </button>
      </div>

      <div className="pg-total-grid">
        {totais[tipo].map(([id, label, valor]) => (
          <button
            key={id}
            className={total === id ? "pg-card active" : "pg-card"}
            onClick={() => {
              setTotal(id);
              setSub(null);
              setDetalhes([]);
            }}
          >
            <span>{label}</span>
            <strong>{valorResumo(id, valor)}</strong>
          </button>
        ))}
      </div>

      <div className="pg-search-wrap">
        <Search size={18} />
        <input
          className="pg-search"
          value={pesquisa}
          onChange={(e) => setPesquisa(e.target.value)}
          placeholder={placeholderPesquisa}
        />
      </div>

      {erroRelatorios && <p className="pg-alert">{erroRelatorios}</p>}

      {tipo !== "turnos" && (
        <div className="pg-sub">
          <div className="pg-panel">
            <h4>
              {tipo === "taxi" && (total === "km" ? "Táxis" : "Motoristas")}
              {tipo === "clientes" && "Clientes"}
              {tipo === "reabastecimentos" && "Tipos de motor"}
            </h4>

            {loadingRelatorios && (
              <p className="pg-empty">A carregar relatório...</p>
            )}

            {!loadingRelatorios &&
              !erroRelatorios &&
              listaPesquisa.length === 0 && (
                <p className="pg-empty">Sem dados neste período.</p>
              )}

            {!loadingRelatorios &&
              listaPesquisa.map((item) => {
                const entidade =
                  item.motorista || item.taxi || item.cliente || {};
                const id = entidade._id || item.tipo_motor || item._id;

                const nome =
                  entidade.nome ||
                  entidade.matricula ||
                  item.tipo_motor ||
                  item._id ||
                  "Sem nome";
                const metricas = metricasResumoItem(item);

                return (
                  <button
                    key={id}
                    className={sub === id ? "pg-row active" : "pg-row"}
                    onClick={() => {
                      setSub(id);
                      carregarDetalhes(item);
                    }}
                  >
                    <span>
                      {nome}
                      <small>
                        {entidade.nif ||
                          entidade.email ||
                          entidade.marca ||
                          item.tipo_motor ||
                          ""}
                      </small>
                    </span>

                    <div className="pg-row-metrics">
                      {metricas.length > 0 ? (
                        metricas.map((metrica) => (
                          <strong key={metrica}>{metrica}</strong>
                        ))
                      ) : (
                        <strong>—</strong>
                      )}
                    </div>
                  </button>
                );
              })}
          </div>

          <div className="pg-panel">
            <h4>Detalhes</h4>

            {!sub && (
              <p className="pg-empty">
                Selecione um item para ver os detalhes.
              </p>
            )}

            {loadingDetalhes && (
              <p className="pg-empty">A carregar detalhes...</p>
            )}

            {sub && !loadingDetalhes && detalhes.length === 0 && (
              <p className="pg-empty">Sem detalhes para apresentar.</p>
            )}

            {!loadingDetalhes &&
              detalhes.map((item) => {
                const metricas = metricasDetalhe(item);

                return (
                  <div key={item._id || item.taxi?._id} className="pg-row">
                    <span>
                      {tipo === "reabastecimentos"
                        ? item.taxi?.matricula || "Táxi sem matrícula"
                        : `Viagem ${item._id?.slice(-5) || ""}`}

                      <small>
                        {tipo === "clientes" &&
                          `${formatarData(item.data_inicio)} · ${
                            item.taxi?.matricula || "Sem matrícula"
                          } · ${item.motorista?.nome || "Sem motorista"}`}

                        {tipo === "taxi" &&
                          `${formatarData(item.data_inicio)} · ${
                            item.taxi?.matricula || item.motorista?.nome || ""
                          } · ${item.cliente?.nome || "Sem cliente"}`}

                        {tipo === "reabastecimentos" &&
                          `${item.taxi?.marca || "Sem marca"} ${item.taxi?.modelo || ""}`}
                      </small>
                    </span>

                    <div className="pg-row-metrics">
                      {metricas.length > 0 ? (
                        metricas.map((metrica) => (
                          <strong key={metrica}>{metrica}</strong>
                        ))
                      ) : (
                        <strong>—</strong>
                      )}
                    </div>
                  </div>
                );
              })}
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

                  <div className="pg-row-metrics">
                    <strong>{horasTurno(turno).toFixed(1)}h</strong>
                  </div>
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
                  <div key={turno._id} className="pg-turno-detalhes-lista">
                    <LinhaDetalhe
                      label="Motorista"
                      valor={turno.motorista?.nome || "Sem nome"}
                    />
                    <LinhaDetalhe
                      label="NIF"
                      valor={turno.motorista?.nif || "—"}
                    />
                    <LinhaDetalhe
                      label="Táxi"
                      valor={`${turno.taxi?.marca || ""} ${turno.taxi?.modelo || ""}`}
                    />
                    <LinhaDetalhe
                      label="Matrícula"
                      valor={turno.taxi?.matricula || "—"}
                    />
                    <LinhaDetalhe
                      label="Início"
                      valor={formatarData(turno.data_inicio)}
                    />
                    <LinhaDetalhe
                      label="Fim"
                      valor={formatarData(turno.data_fim)}
                    />
                    <LinhaDetalhe label="Estado" valor={estadoTurno(turno)} />
                    <LinhaDetalhe
                      label="Horas"
                      valor={`${horasTurno(turno).toFixed(1)}h`}
                    />
                    <LinhaDetalhe
                      label="Viagens associadas"
                      valor={turno.viagens?.length || 0}
                    />
                  </div>
                ))}
          </div>
        </div>
      )}
    </div>
  );
}
