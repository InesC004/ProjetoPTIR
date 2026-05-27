/* eslint-disable react/prop-types */
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  CarFront,
  Route,
  Receipt,
  Fuel,
  Clock,
  Navigation,
  User,
  LogOut,
  Settings,
  ChevronDown,
  Loader2,
  CheckCircle2,
  MapPin,
  Users,
} from "lucide-react";
import logo from "../Pictures/logo1.jpeg";
import TurnosMotorista from "../components/TurnosMotorista";
import ReabastecimentosMotorista from "../components/ReabastecimentosMotorista";
import api from "../Api";
import "../css/PaginaMotorista.css";
import PedidosMotorista from "../components/PedidosMotorista";
import ViagensMotorista from "../components/ViagensMotorista";
import FaturasMotorista from "../components/FaturasMotorista";

const NAV = [
  { id: "turno", label: "Requisitar Táxi", Icon: CarFront, tag: "Turno" },
  { id: "pedidos", label: "Pedidos de Táxi", Icon: Navigation, tag: "Pedidos" },
  { id: "viagem", label: "Viagens", Icon: Route, tag: "Viagem" },
  { id: "fatura", label: "Faturas", Icon: Receipt, tag: "Faturação" },
  { id: "reabastecimento", label: "Reabastecimento", Icon: Fuel, tag: "Táxi" },
];

export default function PaginaMotorista() {
  const navigate = useNavigate();
  const [active, setActive] = useState("turno");
  const [profileOpen, setProfileOpen] = useState(false);
  const [turnoAtivo, setTurnoAtivo] = useState(null);
  const current = NAV.find((n) => n.id === active);

  useEffect(() => {
    async function fetchTurnoAtivo() {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch("http://localhost:8080/api/turnos/meus", {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        if (!res.ok) return;
        const data = await res.json().catch(() => ({}));
        const lista = Array.isArray(data)
          ? data
          : Array.isArray(data?.turnos)
            ? data.turnos
            : Array.isArray(data?.data)
              ? data.data
              : [];
        const agora = new Date();
        const ativo = lista.find((t) => {
          if (t.estado === "cancelado" || t.status === "cancelado")
            return false;
          const inicio = new Date(t.data_inicio || t.inicio);
          const fim = new Date(t.data_fim || t.fim);
          return inicio <= agora && fim >= agora;
        });
        setTurnoAtivo(ativo || null);
      } catch {
        setTurnoAtivo(null);
      }
    }
    fetchTurnoAtivo();
    const interval = setInterval(fetchTurnoAtivo, 60000);
    return () => clearInterval(interval);
  }, []);

  function getTaxiLabel(turno) {
    const taxi = turno?.taxi || turno?.taxi_id;
    if (!taxi) return "Táxi não associado";
    if (typeof taxi === "string") return taxi;
    return (
      [taxi.matricula, taxi.marca, taxi.modelo].filter(Boolean).join(" · ") ||
      "Táxi"
    );
  }

  function terminarSessao() {
    localStorage.removeItem("token");
    localStorage.removeItem("cliente");
    localStorage.removeItem("role");
    setProfileOpen(false);
    navigate("/");
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "var(--fundo)",
        fontFamily: "'DM Sans', sans-serif",
        color: "var(--branco)",
      }}
    >
      <div className="fundo-grelha" />
      <div
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 0,
          pointerEvents: "none",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: -180,
            left: "50%",
            transform: "translateX(-50%)",
            width: 900,
            height: 900,
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(0,232,135,0.06) 0%, transparent 70%)",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: -100,
            right: -100,
            width: 600,
            height: 600,
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(26,110,255,0.05) 0%, transparent 70%)",
          }}
        />
      </div>

      <header
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 300,
          height: 64,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 28px",
          backdropFilter: "blur(24px)",
          borderBottom: "1px solid rgba(26,110,255,0.15)",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            cursor: "pointer",
          }}
          onClick={() => navigate("/")}
        >
          <img
            src={logo}
            alt="TakeCab"
            style={{
              height: 40,
              width: "auto",
              borderRadius: 10,
              border: "1px solid rgba(255,255,255,0.1)",
            }}
          />
          <div style={{ display: "flex", flexDirection: "column" }}>
            <span
              style={{
                fontFamily: "'Syne', sans-serif",
                fontWeight: 800,
                fontSize: "1rem",
                letterSpacing: "-0.02em",
                color: "var(--branco)",
                lineHeight: 1,
              }}
            >
              Take<span style={{ color: "var(--azul-claro)" }}>Cab</span>
            </span>
            <span
              style={{
                fontSize: "0.55rem",
                color: "var(--cinza)",
                letterSpacing: "0.2em",
                textTransform: "uppercase",
              }}
            >
              Premium Rides
            </span>
          </div>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            position: "relative",
          }}
        >
          <span className="badge" style={{ marginBottom: 0 }}>
            <span
              className="badge-ponto"
              style={{
                background: "var(--verde)",
                boxShadow: "0 0 8px var(--verde)",
              }}
            />
            Motorista
          </span>

          <div style={{ position: "relative" }}>
            <button
              onClick={() => setProfileOpen(!profileOpen)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                background: "none",
                border: "none",
                cursor: "pointer",
                padding: 0,
              }}
              type="button"
            >
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: "50%",
                  background:
                    "linear-gradient(135deg, var(--verde), var(--azul))",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#fff",
                  fontWeight: 700,
                  fontSize: "0.9rem",
                  fontFamily: "'Syne', sans-serif",
                }}
              >
                M
              </div>
              <ChevronDown
                size={16}
                style={{
                  color: "var(--cinza)",
                  transition: "transform 0.2s",
                  transform: profileOpen ? "rotate(180deg)" : "rotate(0deg)",
                }}
              />
            </button>

            {profileOpen && (
              <div className="perfil-menu">
                <div className="perfil-menu-topo">
                  <div
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: "50%",
                      background:
                        "linear-gradient(135deg, var(--verde), var(--azul))",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "#fff",
                      fontWeight: 700,
                      fontSize: "0.9rem",
                      flexShrink: 0,
                    }}
                  >
                    M
                  </div>
                  <div>
                    <div className="perfil-menu-nome">Motorista</div>
                    <div className="perfil-menu-email">
                      motorista@takecab.pt
                    </div>
                  </div>
                </div>
                <div className="perfil-menu-lista">
                  <button
                    className="perfil-menu-item"
                    onClick={() => {
                      setProfileOpen(false);
                      navigate("/perfil-motorista");
                    }}
                    type="button"
                  >
                    <span className="perfil-menu-icone">
                      <User size={14} />
                    </span>
                    Ver perfil
                  </button>
                  <button
                    className="perfil-menu-item"
                    onClick={() => {
                      setProfileOpen(false);
                      navigate("/configuracoes-motorista");
                    }}
                    type="button"
                  >
                    <span className="perfil-menu-icone">
                      <Settings size={14} />
                    </span>
                    Definições
                  </button>
                  <div className="perfil-menu-divisor" />
                  <button
                    className="perfil-menu-item danger"
                    onClick={terminarSessao}
                    type="button"
                  >
                    <span className="perfil-menu-icone">
                      <LogOut size={14} />
                    </span>
                    Terminar sessão
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      <div
        style={{
          display: "flex",
          paddingTop: 64,
          position: "relative",
          zIndex: 1,
          minHeight: "100vh",
        }}
      >
        <aside
          style={{
            width: 290,
            minHeight: "calc(100vh - 64px)",
            background: "#071a35",
            backdropFilter: "blur(24px)",
            borderRight: "1px solid rgba(0,232,135,0.08)",
            padding: "28px 14px 24px",
            position: "sticky",
            top: 64,
            alignSelf: "flex-start",
            display: "flex",
            flexDirection: "column",
            flexShrink: 0,
          }}
        >
          <p
            style={{
              fontSize: "0.85rem",
              fontWeight: 900,
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              color: "var(--cinza)",
              padding: "0 10px",
              marginBottom: 18,
            }}
          >
            Painel do Motorista
          </p>

          <nav style={{ display: "flex", flexDirection: "column", gap: 3 }}>
            {NAV.map((item) => {
              const Ic = item.Icon;
              const isActive = active === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActive(item.id)}
                  style={{
                    position: "relative",
                    display: "flex",
                    alignItems: "center",
                    gap: 11,
                    width: "100%",
                    padding: "11px 14px",
                    borderRadius: 12,
                    border: "none",
                    fontSize: "1.1rem",
                    fontWeight: 500,
                    textAlign: "left",
                    cursor: "pointer",
                    transition: "all 0.2s",
                    fontFamily: "'DM Sans', sans-serif",
                    background: isActive
                      ? "rgba(0,232,135,0.1)"
                      : "transparent",
                    color: isActive ? "var(--verde)" : "var(--cinza)",
                  }}
                  type="button"
                >
                  <span
                    style={{
                      position: "absolute",
                      left: 0,
                      top: 6,
                      bottom: 6,
                      width: 3,
                      borderRadius: "0 3px 3px 0",
                      background: "var(--verde)",
                      transform: isActive ? "scaleY(1)" : "scaleY(0)",
                      transition: "transform 0.2s",
                      transformOrigin: "center",
                    }}
                  />
                  <Ic
                    size={17}
                    strokeWidth={isActive ? 2.2 : 1.6}
                    style={{ opacity: isActive ? 1 : 0.5 }}
                  />
                  {item.label}
                </button>
              );
            })}
          </nav>

          <div
            style={{
              marginTop: "auto",
              padding: 16,
              borderRadius: 16,
              background: turnoAtivo
                ? "linear-gradient(135deg, rgba(0,232,135,0.1), rgba(0,232,135,0.04))"
                : "linear-gradient(135deg, rgba(255,255,255,0.04), rgba(255,255,255,0.02))",
              border: turnoAtivo
                ? "1px solid rgba(0,232,135,0.22)"
                : "1px solid rgba(255,255,255,0.07)",
              transition: "all 0.4s ease",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                marginBottom: 10,
              }}
            >
              <span
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: "50%",
                  background: turnoAtivo ? "var(--verde)" : "var(--cinza)",
                  boxShadow: turnoAtivo ? "0 0 8px var(--verde)" : "none",
                  animation: turnoAtivo ? "piscar 2s ease infinite" : "none",
                  flexShrink: 0,
                }}
              />
              <span
                style={{
                  fontSize: "0.72rem",
                  fontWeight: 800,
                  color: turnoAtivo ? "var(--verde)" : "var(--cinza)",
                  textTransform: "uppercase",
                  letterSpacing: "0.12em",
                }}
              >
                {turnoAtivo ? "Turno ativo" : "Sem turno ativo"}
              </span>
            </div>

            {turnoAtivo ? (
              <>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    marginBottom: 6,
                  }}
                >
                  <div
                    style={{
                      width: 30,
                      height: 30,
                      borderRadius: 9,
                      background: "rgba(0,232,135,0.12)",
                      border: "1px solid rgba(0,232,135,0.22)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}
                  >
                    <CarFront size={15} style={{ color: "var(--verde)" }} />
                  </div>
                  <span
                    style={{
                      fontSize: "0.88rem",
                      fontWeight: 700,
                      color: "var(--branco)",
                      lineHeight: 1.2,
                    }}
                  >
                    {getTaxiLabel(turnoAtivo)}
                  </span>
                </div>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    fontSize: "0.72rem",
                    color: "var(--cinza)",
                    marginTop: 8,
                    paddingTop: 8,
                    borderTop: "1px solid rgba(255,255,255,0.06)",
                  }}
                >
                  <Clock size={11} style={{ flexShrink: 0 }} />
                  {new Date(
                    turnoAtivo.data_inicio || turnoAtivo.inicio,
                  ).toLocaleTimeString("pt-PT", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}{" "}
                  →{" "}
                  {new Date(
                    turnoAtivo.data_fim || turnoAtivo.fim,
                  ).toLocaleTimeString("pt-PT", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </div>
              </>
            ) : (
              <p
                style={{
                  fontSize: "0.82rem",
                  color: "var(--cinza)",
                  lineHeight: 1.5,
                  margin: 0,
                }}
              >
                Nenhum turno em curso.
                <br />
                <span style={{ fontSize: "0.72rem", opacity: 0.7 }}>
                  Crie um turno para começar.
                </span>
              </p>
            )}
          </div>
        </aside>

        <main className="motorista-main" key={active}>
          <div style={{ marginBottom: 32, animation: "subir 0.5s ease both" }}>
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 7,
                fontSize: "1rem",
                fontWeight: 700,
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                color: "var(--verde)",
                marginBottom: 10,
              }}
            >
              <span
                style={{
                  width: 9,
                  height: 9,
                  borderRadius: "50%",
                  background: "var(--verde)",
                  boxShadow: "0 0 8px var(--verde)",
                  animation: "piscar 2s ease infinite",
                }}
              />
              {current?.tag}
            </div>
            <h2
              style={{
                fontFamily: "'Syne', sans-serif",
                fontSize: "1.8rem",
                fontWeight: 800,
                letterSpacing: "-0.03em",
                color: "#06112a",
                marginBottom: 6,
              }}
            >
              {current?.label}
            </h2>
            <p
              style={{
                fontSize: "1rem",
                color: "var(--cinza)",
                lineHeight: 1.6,
              }}
            >
              {active === "turno" &&
                "Registe um turno e escolha um táxi disponível para conduzir."}
              {active === "pedidos" &&
                "Visualize e aceite pedidos de clientes que aguardam motorista."}
              {active === "viagem" &&
                "Registe e consulte as suas viagens com clientes."}
              {active === "fatura" &&
                "Emita e consulte faturas das viagens realizadas."}
              {active === "reabastecimento" &&
                "Registe reabastecimentos de combustível ou energia elétrica."}
            </p>
          </div>

          <div style={{ animation: "subir 0.5s 0.08s ease both" }}>
            {active === "turno" && <TurnosMotorista />}
            {active === "pedidos" && <PedidosMotorista />}
            {active === "viagem" && <ViagensMotorista />}
            {active === "fatura" && <FaturasMotorista />}
            {active === "__placeholder__" && (
              <SecPlaceholder
                icone="🧾"
                titulo="Faturas"
                desc="Aqui poderá emitir e consultar as faturas das suas viagens."
              />
            )}
            {active === "reabastecimento" && <ReabastecimentosMotorista />}
          </div>
        </main>
      </div>
      <PedidoNovoFlutuante />
      <ViagemAtivaFlutuante />
    </div>
  );
}

function getId(item) {
  return item?._id || item?.id;
}

function getMorada(valor) {
  return valor || "Morada não indicada";
}

function getPreco(pedido) {
  const preco =
    pedido?.preco_final ?? pedido?.preco ?? pedido?.valor ?? pedido?.preco_viagem;
  if (preco === undefined || preco === null) return null;
  return `${Number(preco).toFixed(2)} €`;
}

function getDistancia(pedido) {
  const distancia = pedido?.distancia_km ?? pedido?.distancia;
  if (distancia === undefined || distancia === null || distancia === "") return "—";
  return `${Number(distancia).toFixed(2)} km`;
}

function getConforto(pedido) {
  if (!pedido?.nivel_conforto) return "—";
  return pedido.nivel_conforto === "luxuoso" ? "Luxuoso" : "Básico";
}

function getPedidosIgnorados() {
  return JSON.parse(localStorage.getItem("pedidosIgnoradosMotorista") || "[]");
}

function guardarPedidoIgnorado(id) {
  const ignorados = new Set(getPedidosIgnorados());
  ignorados.add(id);
  localStorage.setItem("pedidosIgnoradosMotorista", JSON.stringify([...ignorados]));
}

function PedidoNovoFlutuante() {
  const [pedido, setPedido] = useState(null);
  const [aAceitar, setAAceitar] = useState(false);
  const [erro, setErro] = useState("");

  async function procurarPedido() {
    const emCurso = JSON.parse(
      localStorage.getItem("viagensConfirmadasMotorista") || "[]",
    );
    const aceites = JSON.parse(
      localStorage.getItem("pedidosAceitesMotorista") || "[]",
    );

    if (pedido && aceites.some((item) => getId(item) === getId(pedido))) {
      setPedido(null);
      return;
    }

    if (emCurso.length > 0) {
      setPedido(null);
      return;
    }

    try {
      const data = await api.pedidos.listarDisponiveis();
      const lista = Array.isArray(data?.pedidos) ? data.pedidos : [];
      const ignorados = new Set(getPedidosIgnorados());
      const proximo = lista.find((item) => !ignorados.has(getId(item)));
      setPedido((atual) => {
        if (!atual) return proximo || null;
        const atualAindaDisponivel = lista.some((item) => getId(item) === getId(atual));
        return atualAindaDisponivel ? atual : proximo || null;
      });
    } catch {
      setPedido(null);
    }
  }

  useEffect(() => {
    procurarPedido();
    const interval = setInterval(procurarPedido, 4000);
    window.addEventListener("viagensConfirmadasAtualizadas", procurarPedido);
    window.addEventListener("pedidosAceitesAtualizados", procurarPedido);
    window.addEventListener("pedidosMotoristaAtualizados", procurarPedido);
    return () => {
      clearInterval(interval);
      window.removeEventListener("viagensConfirmadasAtualizadas", procurarPedido);
      window.removeEventListener("pedidosAceitesAtualizados", procurarPedido);
      window.removeEventListener("pedidosMotoristaAtualizados", procurarPedido);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pedido]);

  async function aceitarPedido() {
    const id = getId(pedido);
    if (!id) return;

    setAAceitar(true);
    setErro("");

    try {
      const data = await api.pedidos.aceitar(id);
      const pedidoAceite = {
        ...(data?.pedido || {}),
        ...pedido,
        estado: data?.pedido?.estado || "aceite",
      };
      const aceites = JSON.parse(
        localStorage.getItem("pedidosAceitesMotorista") || "[]",
      );
      localStorage.setItem(
        "pedidosAceitesMotorista",
        JSON.stringify([pedidoAceite, ...aceites.filter((p) => getId(p) !== id)]),
      );
      setPedido(null);
      window.dispatchEvent(new Event("pedidosAceitesAtualizados"));
      window.dispatchEvent(new Event("pedidosMotoristaAtualizados"));
    } catch (err) {
      setErro(err.message || "Não foi possível aceitar o pedido.");
    } finally {
      setAAceitar(false);
    }
  }

  function ignorarPedido() {
    const id = getId(pedido);
    if (id) guardarPedidoIgnorado(id);
    setPedido(null);
  }

  if (!pedido) return null;

  return (
    <aside className="pedido-flutuante" aria-live="polite">
      <div className="vf-topo">
        <span className="vf-badge">
          <span className="vf-ponto" />
          Novo pedido
        </span>
        <Navigation size={18} />
      </div>

      <div className="vf-rota">
        <div>
          <MapPin size={14} />
          <span>{getMorada(pedido.origem_morada)}</span>
        </div>
        <div>
          <CheckCircle2 size={14} />
          <span>{getMorada(pedido.destino_morada)}</span>
        </div>
      </div>

      <div className="pf-metricas">
        <span>
          <Users size={13} />
          {pedido.numero_pessoas || "—"}
        </span>
        <span>{getDistancia(pedido)}</span>
        <span>{getConforto(pedido)}</span>
      </div>

      {erro && <p className="vf-erro">{erro}</p>}

      <div className="pf-acoes">
        <button
          type="button"
          className="pf-btn-sec"
          onClick={ignorarPedido}
          disabled={aAceitar}
        >
          Ignorar
        </button>
        <button
          type="button"
          className="vf-btn"
          onClick={aceitarPedido}
          disabled={aAceitar}
        >
          {aAceitar ? <Loader2 size={16} className="vf-spin" /> : <CheckCircle2 size={16} />}
          {aAceitar ? "A aceitar..." : "Aceitar"}
        </button>
      </div>
    </aside>
  );
}

function ViagemAtivaFlutuante() {
  const [viagem, setViagem] = useState(null);
  const [aTerminar, setATerminar] = useState(false);
  const [erro, setErro] = useState("");

  function carregarViagemAtiva() {
    const emCurso = JSON.parse(
      localStorage.getItem("viagensConfirmadasMotorista") || "[]",
    );
    setViagem(emCurso[0] || null);
  }

  useEffect(() => {
    carregarViagemAtiva();

    const interval = setInterval(carregarViagemAtiva, 2000);
    window.addEventListener("viagensConfirmadasAtualizadas", carregarViagemAtiva);
    window.addEventListener("storage", carregarViagemAtiva);

    return () => {
      clearInterval(interval);
      window.removeEventListener(
        "viagensConfirmadasAtualizadas",
        carregarViagemAtiva,
      );
      window.removeEventListener("storage", carregarViagemAtiva);
    };
  }, []);

  async function terminarViagem() {
    const id = getId(viagem);
    if (!id) return;

    setATerminar(true);
    setErro("");

    try {
      const data = await api.pedidos.terminarViagem(id);
      const pedidoAtualizado = data?.pedido || viagem;
      const emCurso = JSON.parse(
        localStorage.getItem("viagensConfirmadasMotorista") || "[]",
      );
      const terminadas = JSON.parse(
        localStorage.getItem("viagensTerminadasMotorista") || "[]",
      );

      const atualizadas = emCurso.filter((item) => getId(item) !== id);
      const terminada = {
        ...viagem,
        ...pedidoAtualizado,
        estado: "pagamento_pendente",
        estadoViagem: "terminada",
        data_fim: new Date().toISOString(),
        pagamento_estado: pedidoAtualizado.pagamento_estado || "pendente",
        pagamento_confirmado: false,
      };

      localStorage.setItem(
        "viagensConfirmadasMotorista",
        JSON.stringify(atualizadas),
      );
      localStorage.setItem(
        "viagensTerminadasMotorista",
        JSON.stringify([terminada, ...terminadas]),
      );

      setViagem(null);
      window.dispatchEvent(new Event("viagensConfirmadasAtualizadas"));
    } catch (err) {
      setErro(err.message || "Não foi possível terminar a viagem.");
    } finally {
      setATerminar(false);
    }
  }

  if (!viagem) return null;

  return (
    <aside className="viagem-flutuante" aria-live="polite">
      <div className="vf-topo">
        <span className="vf-badge">
          <span className="vf-ponto" />
          Viagem em curso
        </span>
        <Route size={18} />
      </div>

      <div className="vf-rota">
        <div>
          <MapPin size={14} />
          <span>{getMorada(viagem.origem_morada)}</span>
        </div>
        <div>
          <CheckCircle2 size={14} />
          <span>{getMorada(viagem.destino_morada)}</span>
        </div>
      </div>

      {getPreco(viagem) && <div className="vf-preco">{getPreco(viagem)}</div>}
      {erro && <p className="vf-erro">{erro}</p>}

      <button
        type="button"
        className="vf-btn"
        onClick={terminarViagem}
        disabled={aTerminar}
      >
        {aTerminar ? <Loader2 size={16} className="vf-spin" /> : <CheckCircle2 size={16} />}
        {aTerminar ? "A terminar..." : "Terminar viagem"}
      </button>
    </aside>
  );
}

function SecPlaceholder({ icone, titulo, desc }) {
  return (
    <div
      className="card-feat"
      style={{ textAlign: "center", padding: "64px 40px" }}
    >
      <div
        className="feat-icone"
        style={{
          margin: "0 auto 20px",
          fontSize: "2rem",
          width: 64,
          height: 64,
        }}
      >
        {icone}
      </div>
      <div
        className="feat-titulo"
        style={{ fontSize: "1.1rem", marginBottom: 10 }}
      >
        {titulo}
      </div>
      <p className="feat-desc">{desc}</p>
    </div>
  );
}
