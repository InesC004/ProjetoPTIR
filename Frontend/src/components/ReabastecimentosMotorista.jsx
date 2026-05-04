/* eslint-disable react/prop-types */
import { useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  CheckCircle2,
  Clock,
  Fuel,
  Gauge,
  Loader2,
  ReceiptText,
  RefreshCw,
  Euro,
} from "lucide-react";
import "../css/reabastecimentosMotorista.css";

const API_URL = "http://localhost:8080/api";
const TURNOS_URL = `${API_URL}/turnos`;
const REABASTECIMENTOS_URL = `${API_URL}/reabastecimentos`;

function authHeaders(extra = {}) {
  const token = localStorage.getItem("token");
  return {
    ...extra,
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

async function readJson(res) {
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(
      data.message || data.error || `Erro no servidor. Status: ${res.status}`,
    );
  }
  return data;
}

function normalizarLista(data, chave) {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.[chave])) return data[chave];
  if (Array.isArray(data?.data)) return data.data;
  return [];
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

function getTaxiLabel(turno) {
  const taxi = turno?.taxi || turno?.taxi_id;
  if (!taxi) return "Táxi não associado";
  if (typeof taxi === "string") return taxi;
  return (
    [taxi.matricula, taxi.marca, taxi.modelo].filter(Boolean).join(" · ") ||
    "Táxi"
  );
}

function getTipoMotor(turno) {
  const taxi = turno?.taxi || turno?.taxi_id;
  if (!taxi || typeof taxi === "string") return "";
  return taxi.tipo_motor || "";
}

export default function ReabastecimentosMotorista() {
  const [turnos, setTurnos] = useState([]);
  const [reabastecimentos, setReabastecimentos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingLista, setLoadingLista] = useState(false);
  const [saving, setSaving] = useState(false);
  const [erro, setErro] = useState("");
  const [sucesso, setSucesso] = useState("");
  const [turnoSelecionado, setTurnoSelecionado] = useState("");
  const [form, setForm] = useState({
    litros: "",
    custo: "",
    quilometragem: "",
  });

  const turnoAtual = useMemo(
    () => turnos.find((t) => String(t._id) === String(turnoSelecionado)),
    [turnos, turnoSelecionado],
  );

  const isEletrico = getTipoMotor(turnoAtual) === "eletrico";

  async function carregarTurnos() {
    setLoading(true);
    setErro("");
    try {
      const res = await fetch(`${TURNOS_URL}/meus`, { headers: authHeaders() });
      const data = await readJson(res);
      const lista = normalizarLista(data, "turnos");
      setTurnos(lista);
      if (!turnoSelecionado && lista[0]?._id) {
        setTurnoSelecionado(lista[0]._id);
      }
    } catch (err) {
      setErro(err.message || "Erro ao carregar turnos.");
    } finally {
      setLoading(false);
    }
  }

  async function carregarReabastecimentos(id = turnoSelecionado) {
    if (!id) {
      setReabastecimentos([]);
      return;
    }
    setLoadingLista(true);
    setErro("");
    try {
      const res = await fetch(`${REABASTECIMENTOS_URL}/turno/${id}`, {
        headers: authHeaders(),
      });
      const data = await readJson(res);
      setReabastecimentos(normalizarLista(data, "reabastecimentos"));
    } catch (err) {
      setErro(err.message || "Erro ao carregar reabastecimentos.");
    } finally {
      setLoadingLista(false);
    }
  }

  useEffect(() => {
    carregarTurnos();
  }, []);
  useEffect(() => {
    if (turnoSelecionado) carregarReabastecimentos(turnoSelecionado);
  }, [turnoSelecionado]);

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setErro("");
    setSucesso("");
  }

  function validar() {
    if (!turnoSelecionado) return "Selecione um turno.";
    if (!turnoAtual) return "Turno inválido.";
    if (!turnoAtual.data_inicio && !turnoAtual.inicio)
      return "Este turno não tem data de início.";
    if (!turnoAtual.data_fim && !turnoAtual.fim)
      return "Este turno não tem data de fim.";
    if (!form.litros || Number(form.litros) <= 0)
      return `Indique os ${isEletrico ? "kWh" : "litros"} reabastecidos.`;
    if (!form.custo || Number(form.custo) <= 0) return "Indique o custo total.";
    if (!form.quilometragem || Number(form.quilometragem) < 0)
      return "Indique uma quilometragem válida.";
    return "";
  }

  async function criarReabastecimento(e) {
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
      const payload = {
        turno_id: turnoSelecionado,
        data_inicio: turnoAtual.data_inicio || turnoAtual.inicio,
        data_fim: turnoAtual.data_fim || turnoAtual.fim,
        quilometros: Number(form.quilometragem),
        euros: Number(form.custo),
        ...(isEletrico
          ? { kwh: Number(form.litros) }
          : { litros: Number(form.litros) }),
      };

      const res = await fetch(`${REABASTECIMENTOS_URL}/create`, {
        method: "POST",
        headers: authHeaders({ "Content-Type": "application/json" }),
        body: JSON.stringify(payload),
      });

      const data = await readJson(res);
      setSucesso(data.message || "Reabastecimento registado com sucesso.");
      setForm({ litros: "", custo: "", quilometragem: "" });
      await carregarReabastecimentos(turnoSelecionado);
    } catch (err) {
      setErro(err.message || "Erro ao registar reabastecimento.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="rc-grid">
      {/* ───── CARD: NOVO REABASTECIMENTO ───── */}
      <div className="rc-card">
        <div className="rc-card-head">
          <div className="rc-card-head-left">
            <div className="rc-icon-box rc-icon-cyan">
              <Fuel size={20} />
            </div>
            <div>
              <p className="rc-card-title">Novo Reabastecimento</p>
              <p className="rc-card-sub">Registe combustível para um turno</p>
            </div>
          </div>
        </div>

        <div className="rc-card-body">
          {erro && (
            <div className="rc-alert rc-alert-error">
              <AlertCircle size={16} className="rc-alert-icon" />
              {erro}
            </div>
          )}
          {sucesso && (
            <div className="rc-alert rc-alert-success">
              <CheckCircle2 size={16} className="rc-alert-icon" />
              {sucesso}
            </div>
          )}

          {loading ? (
            <div className="rc-loading">
              <Loader2 size={18} className="rc-spin rc-spin-blue" />A carregar
              turnos…
            </div>
          ) : (
            <form onSubmit={criarReabastecimento}>
              <div className="rc-field">
                <label className="rc-label">Turno</label>
                <select
                  value={turnoSelecionado}
                  onChange={(e) => {
                    setTurnoSelecionado(e.target.value);
                    setErro("");
                    setSucesso("");
                  }}
                  className="rc-input rc-select"
                >
                  <option value="">Selecionar turno…</option>
                  {turnos.map((turno) => (
                    <option key={turno._id} value={turno._id}>
                      {formatDateTime(turno.data_inicio || turno.inicio)} ·{" "}
                      {getTaxiLabel(turno)}
                    </option>
                  ))}
                </select>
              </div>

              <div className="rc-field">
                <label className="rc-label">
                  {isEletrico ? "kWh" : "Litros"}
                </label>
                <input
                  name="litros"
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.litros}
                  onChange={handleChange}
                  className="rc-input"
                  placeholder="Ex: 35.5"
                />
              </div>

              <div className="rc-field">
                <label className="rc-label">Custo total (€)</label>
                <input
                  name="custo"
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.custo}
                  onChange={handleChange}
                  className="rc-input"
                  placeholder="Ex: 62.40"
                />
              </div>

              <div className="rc-field rc-field-last">
                <label className="rc-label">Quilometragem</label>
                <input
                  name="quilometragem"
                  type="number"
                  min="0"
                  value={form.quilometragem}
                  onChange={handleChange}
                  className="rc-input"
                  placeholder="Ex: 120500"
                />
              </div>

              <button type="submit" disabled={saving} className="rc-btn-submit">
                {saving ? (
                  <>
                    <Loader2 size={16} className="rc-spin" />A registar…
                  </>
                ) : (
                  <>
                    <Fuel size={16} />
                    Registar reabastecimento
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      </div>

      {/* ───── CARD: LISTA DE REABASTECIMENTOS ───── */}
      <div className="rc-card">
        <div className="rc-card-head">
          <div className="rc-card-head-left">
            <div className="rc-icon-box rc-icon-purple">
              <ReceiptText size={20} />
            </div>
            <div>
              <p className="rc-card-title">Reabastecimentos do Turno</p>
              <p className="rc-card-sub">
                {loadingLista
                  ? "A carregar…"
                  : `${reabastecimentos.length} registo${reabastecimentos.length !== 1 ? "s" : ""}`}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => carregarReabastecimentos()}
            className="rc-btn-refresh"
            title="Atualizar"
          >
            <RefreshCw size={16} />
          </button>
        </div>

        <div className="rc-card-body">
          {loadingLista ? (
            <div className="rc-loading">
              <Loader2
                size={18}
                className="rc-spin"
                style={{ color: "#7c3aed" }}
              />
              A carregar reabastecimentos…
            </div>
          ) : reabastecimentos.length === 0 ? (
            <div className="rc-empty">
              <div className="rc-empty-icon">
                <Fuel size={22} />
              </div>
              <p>Nenhum reabastecimento neste turno.</p>
            </div>
          ) : (
            <div className="rc-list">
              {reabastecimentos.map((r) => (
                <div key={r._id} className="rc-item">
                  <div className="rc-item-top">
                    <div className="rc-item-fuel">
                      <Fuel size={16} />
                      {r.litros != null
                        ? `${r.litros} L`
                        : r.kwh != null
                          ? `${r.kwh} kWh`
                          : "—"}
                    </div>
                    <div className="rc-item-cost">
                      € {Number(r.euros ?? r.custo ?? 0).toFixed(2)}
                    </div>
                  </div>

                  <div className="rc-item-divider" />

                  <div className="rc-item-meta">
                    <span className="rc-item-meta-row">
                      <Clock size={12} />
                      Início: {formatDateTime(r.data_inicio)}
                    </span>
                    <span className="rc-item-meta-row">
                      <Clock size={12} />
                      Fim: {formatDateTime(r.data_fim)}
                    </span>
                    <span className="rc-item-meta-row">
                      <Gauge size={12} />
                      {r.quilometros ?? r.quilometragem ?? "—"} km
                    </span>
                    <span className="rc-item-meta-row">
                      <Euro size={12} />
                      {Number(r.euros ?? r.custo ?? 0).toFixed(2)} €
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
