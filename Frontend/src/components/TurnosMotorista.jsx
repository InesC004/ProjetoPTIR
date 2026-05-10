/* eslint-disable react/prop-types */
import { useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  Calendar,
  CarFront,
  CheckCircle2,
  Clock,
  Loader2,
  RefreshCw,
  Plus,
  Ban,
} from "lucide-react";
import "../css/TurnosMotorista.css";

const API_URL = "http://localhost:8080/api";
const TURNOS_URL = `${API_URL}/turnos`;
const TAXIS_URL = `${API_URL}/taxis`;

function authHeaders(extra = {}) {
  const token = localStorage.getItem("token");
  return {
    ...extra,
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

async function readJson(res) {
  const data = await res.json().catch(() => ({}));
  if (!res.ok)
    throw new Error(data.message || data.error || "Erro no servidor.");
  return data;
}

function toDateTimeLocalValue(date = new Date()) {
  const d = new Date(date);
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toISOString().slice(0, 16);
}

function formatDateTime(value) {
  if (!value) return "—";
  return new Date(value).toLocaleString("pt-PT", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function normalizarLista(data, chave) {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.[chave])) return data[chave];
  if (Array.isArray(data?.data)) return data.data;
  return [];
}

function getTaxiLabel(taxi) {
  if (!taxi) return "Táxi não associado";
  if (typeof taxi === "string") return taxi;
  return (
    [taxi.matricula, taxi.marca, taxi.modelo].filter(Boolean).join(" · ") ||
    "Táxi"
  );
}

function getEstadoTurno(turno) {
  const agora = new Date();
  const inicio = new Date(turno.data_inicio || turno.inicio);
  const fim = new Date(turno.data_fim || turno.fim);

  if (turno.estado === "cancelado" || turno.status === "cancelado")
    return "cancelado";
  if (!Number.isNaN(fim.getTime()) && fim < agora) return "terminado";
  if (!Number.isNaN(inicio.getTime()) && inicio > agora) return "agendado";
  return "ativo";
}

const ESTADO_CONFIG = {
  ativo: {
    label: "Ativo",
    dot: "#10d98a",
    bg: "rgba(16,217,138,0.1)",
    border: "rgba(16,217,138,0.28)",
    color: "#059669",
  },
  agendado: {
    label: "Agendado",
    dot: "#f59e0b",
    bg: "rgba(245,158,11,0.1)",
    border: "rgba(245,158,11,0.28)",
    color: "#b45309",
  },
  terminado: {
    label: "Terminado",
    dot: "#94a3b8",
    bg: "rgba(148,163,184,0.1)",
    border: "rgba(148,163,184,0.25)",
    color: "#64748b",
  },
  cancelado: {
    label: "Cancelado",
    dot: "#ef4444",
    bg: "rgba(239,68,68,0.08)",
    border: "rgba(239,68,68,0.22)",
    color: "#dc2626",
  },
};

export default function TurnosMotorista() {
  const [turnos, setTurnos] = useState([]);
  const [taxis, setTaxis] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [cancelandoId, setCancelandoId] = useState(null);
  const [erro, setErro] = useState("");
  const [sucesso, setSucesso] = useState("");

  const [form, setForm] = useState({
    taxi_id: "",
    inicio: toDateTimeLocalValue(),
    fim: toDateTimeLocalValue(new Date(Date.now() + 8 * 60 * 60 * 1000)),
  });

  const turnoAtivo = useMemo(
    () => turnos.find((t) => getEstadoTurno(t) === "ativo"),
    [turnos],
  );

  async function carregarDados() {
    setLoading(true);
    setErro("");
    try {
      const [resTurnos, resTaxis] = await Promise.all([
        fetch(`${TURNOS_URL}/meus`, { headers: authHeaders() }),
        fetch(`${TAXIS_URL}/disponiveis`),
      ]);
      const dataTurnos = await readJson(resTurnos);
      const dataTaxis = await readJson(resTaxis);
      setTurnos(normalizarLista(dataTurnos, "turnos"));
      setTaxis(normalizarLista(dataTaxis, "taxis"));
    } catch (err) {
      setErro(err.message || "Erro ao carregar dados.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    carregarDados();
  }, []);

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setErro("");
    setSucesso("");
  }

  function validar() {
    if (!form.taxi_id) return "Escolha um táxi disponível.";
    if (!form.inicio || !form.fim) return "Preencha o início e o fim do turno.";
    if (new Date(form.fim) <= new Date(form.inicio))
      return "O fim deve ser depois do início.";
    return "";
  }

  async function criarTurno(e) {
    e.preventDefault();
    const validacao = validar();
    if (validacao) {
      setErro(validacao);
      return;
    }

    setSaving(true);
    setErro("");
    setSucesso("");

    try {
      const res = await fetch(`${TURNOS_URL}/create`, {
        method: "POST",
        headers: authHeaders({ "Content-Type": "application/json" }),
        body: JSON.stringify({
          taxi_id: form.taxi_id,
          data_inicio: form.inicio,
          data_fim: form.fim,
          inicio: form.inicio,
          fim: form.fim,
        }),
      });
      const data = await readJson(res);
      setSucesso(data.message || "Turno criado com sucesso.");
      setForm((prev) => ({ ...prev, taxi_id: "" }));
      await carregarDados();
    } catch (err) {
      setErro(err.message || "Erro ao criar turno.");
    } finally {
      setSaving(false);
    }
  }

  async function cancelarTurno(id) {
    if (!id) return;
    setCancelandoId(id);
    setErro("");
    setSucesso("");

    try {
      const res = await fetch(`${TURNOS_URL}/cancelar/${id}`, {
        method: "PUT",
        headers: authHeaders({ "Content-Type": "application/json" }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setErro(data.message || data.error || "Erro ao cancelar.");
        return;
      }
      setSucesso(data.message || "Turno cancelado com sucesso.");
      await carregarDados();
    } catch (err) {
      setErro(err.message || "Não foi possível ligar ao servidor.");
    } finally {
      setCancelandoId(null);
    }
  }

  return (
    <div className="tc-grid">
      {/* ───── CARD: NOVO TURNO ───── */}
      <div className="tc-card">
        <div className="tc-card-head">
          <div className="tc-card-head-left">
            <div className="tc-icon-box tc-icon-green">
              <Plus size={20} />
            </div>
            <div>
              <p className="tc-card-title">Novo Turno</p>
              <p className="tc-card-sub">Escolha o período e o táxi</p>
            </div>
          </div>
        </div>

        <div className="tc-card-body">
          {erro && (
            <div className="tc-alert tc-alert-error">
              <AlertCircle size={16} className="tc-alert-icon" />
              {erro}
            </div>
          )}
          {sucesso && (
            <div className="tc-alert tc-alert-success">
              <CheckCircle2 size={16} className="tc-alert-icon" />
              {sucesso}
            </div>
          )}

          <form onSubmit={criarTurno}>
            <div className="tc-field">
              <label className="tc-label">Início do turno</label>
              <input
                name="inicio"
                type="datetime-local"
                value={form.inicio}
                onChange={handleChange}
                className="tc-input"
              />
            </div>

            <div className="tc-field">
              <label className="tc-label">Fim do turno</label>
              <input
                name="fim"
                type="datetime-local"
                value={form.fim}
                onChange={handleChange}
                className="tc-input"
              />
            </div>

            <div className="tc-field tc-field-last">
              <label className="tc-label">Táxi disponível</label>
              <select
                name="taxi_id"
                value={form.taxi_id}
                onChange={handleChange}
                className="tc-input tc-select"
              >
                <option value="">Selecionar táxi…</option>
                {taxis.map((taxi) => (
                  <option key={taxi._id} value={taxi._id}>
                    {getTaxiLabel(taxi)}
                    {taxi.nivel_conforto ? ` · ${taxi.nivel_conforto}` : ""}
                  </option>
                ))}
              </select>
            </div>

            <button
              type="submit"
              disabled={saving || loading}
              className="tc-btn-submit"
            >
              {saving ? (
                <>
                  <Loader2 size={16} className="tc-spin" />A criar…
                </>
              ) : (
                <>
                  <CarFront size={17} />
                  Criar turno
                </>
              )}
            </button>
          </form>
        </div>
      </div>

      {/* ───── CARD: OS MEUS TURNOS ───── */}
      <div className="tc-card">
        <div className="tc-card-head">
          <div className="tc-card-head-left">
            <div className="tc-icon-box tc-icon-blue">
              <Clock size={20} />
            </div>
            <div>
              <p className="tc-card-title">Os Meus Turnos</p>
              <p className="tc-card-sub">
                {loading
                  ? "A carregar…"
                  : `${turnos.length} turno${turnos.length !== 1 ? "s" : ""} encontrado${turnos.length !== 1 ? "s" : ""}`}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={carregarDados}
            className="tc-btn-refresh"
            title="Atualizar"
          >
            <RefreshCw size={16} />
          </button>
        </div>

        <div className="tc-card-body">
          {loading ? (
            <div className="tc-loading">
              <Loader2 size={18} className="tc-spin tc-spin-blue" />A carregar
              turnos…
            </div>
          ) : turnos.length === 0 ? (
            <div className="tc-empty">
              <div className="tc-empty-icon">
                <Calendar size={22} />
              </div>
              <p>Ainda não existem turnos registados.</p>
            </div>
          ) : (
            <div className="tc-list">
              {turnos.map((turno) => {
                const estado = getEstadoTurno(turno);
                const cfg = ESTADO_CONFIG[estado];
                const podeCancelar =
                  estado !== "terminado" && estado !== "cancelado";

                return (
                  <div key={turno._id} className="tc-item">
                    <div className="tc-item-left">
                      <div className="tc-item-taxi">
                        <CarFront size={15} />
                        {getTaxiLabel(turno.taxi || turno.taxi_id)}
                      </div>

                      <div className="tc-item-times">
                        <span className="tc-item-time">
                          <Clock size={12} />
                          Início:{" "}
                          {formatDateTime(turno.data_inicio || turno.inicio)}
                        </span>
                        <span className="tc-item-time">
                          <Clock size={12} />
                          Fim: {formatDateTime(turno.data_fim || turno.fim)}
                        </span>
                      </div>

                      <span
                        className={`tc-badge tc-badge-${estado}`}
                        style={{
                          background: cfg.bg,
                          borderColor: cfg.border,
                          color: cfg.color,
                        }}
                      >
                        <span
                          className="tc-badge-dot"
                          style={{ background: cfg.dot }}
                        />
                        {cfg.label}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => cancelarTurno(turno._id)}
                      disabled={!podeCancelar || cancelandoId === turno._id}
                      className="tc-btn-cancel"
                      title={
                        podeCancelar
                          ? "Cancelar turno"
                          : "Não é possível cancelar"
                      }
                    >
                      {cancelandoId === turno._id ? (
                        <Loader2 size={14} className="tc-spin" />
                      ) : (
                        <Ban size={14} />
                      )}
                      Cancelar
                    </button>
                  </div>
                );
              })}
            </div>
          )}

          {turnoAtivo && (
            <div className="tc-active-banner">
              <CheckCircle2 size={16} />
              Turno ativo: {getTaxiLabel(turnoAtivo.taxi || turnoAtivo.taxi_id)}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
