/* eslint-disable react/prop-types */
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
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

function getTaxi(turno) {
  return turno?.taxi || turno?.taxi_id;
}

function getTaxiId(turno) {
  const taxi = getTaxi(turno);
  if (!taxi) return "";
  if (typeof taxi === "string") return taxi;
  return taxi._id || "";
}

function getTaxiLabel(turno) {
  const taxi = getTaxi(turno);
  if (!taxi) return "Táxi não associado";
  if (typeof taxi === "string") return taxi;
  return (
    [taxi.matricula, taxi.marca, taxi.modelo].filter(Boolean).join(" · ") ||
    "Táxi"
  );
}

function getTipoMotor(turno) {
  const taxi = getTaxi(turno);
  if (!taxi || typeof taxi === "string") return "";
  return taxi.tipo_motor || "";
}

function toDateTimeLocalValue(date = new Date()) {
  const d = new Date(date);
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toISOString().slice(0, 16);
}

function getQuilometragemAtual(reabastecimentos) {
  return reabastecimentos.reduce((max, item) => {
    const valor = Number(item.quilometros ?? item.quilometragem ?? 0);
    return Number.isFinite(valor) && valor > max ? valor : max;
  }, 0);
}

export default function ReabastecimentosMotorista({ turnoAtivo }) {
  const [turnos, setTurnos] = useState([]);
  const [reabastecimentos, setReabastecimentos] = useState([]);
  const [loading, setLoading] = useState(!turnoAtivo);
  const [loadingLista, setLoadingLista] = useState(false);
  const [saving, setSaving] = useState(false);
  const [erro, setErro] = useState("");
  const [sucesso, setSucesso] = useState("");
  const [turnoSelecionado, setTurnoSelecionado] = useState("");
  const listaCarregadaRef = useRef(false);
  const taxiIdAnteriorRef = useRef("");
  const turnoAtivoId = turnoAtivo?._id || "";

  const [form, setForm] = useState({
    data_inicio: "",
    data_fim: "",
    quantidade: "",
    custo: "",
    quilometragem: "",
  });

  const turnoAtual = useMemo(() => {
    if (turnoAtivo) return turnoAtivo;

    return turnos.find((t) => String(t._id) === String(turnoSelecionado));
  }, [turnoAtivo, turnos, turnoSelecionado]);
  const isEletrico = getTipoMotor(turnoAtual) === "eletrico";
  const taxiIdAtual = useMemo(() => getTaxiId(turnoAtual), [turnoAtual]);
  const quilometragemAtual = getQuilometragemAtual(reabastecimentos);

  const carregarTurnos = useCallback(async ({ silencioso = false } = {}) => {
    if (!silencioso) setLoading(true);
    if (!silencioso) setErro("");

    try {
      const res = await fetch(`${TURNOS_URL}/meus`, {
        headers: authHeaders(),
      });

      const data = await readJson(res);
      const lista = normalizarLista(data, "turnos");

      setTurnos(lista);

      setTurnoSelecionado((atual) => {
        if (turnoAtivoId) return turnoAtivoId;
        if (!atual && lista[0]?._id) return lista[0]._id;
        return atual;
      });
    } catch (err) {
      if (!silencioso) setErro(err.message || "Erro ao carregar turnos.");
    } finally {
      if (!silencioso) setLoading(false);
    }
  }, [turnoAtivoId]);

  const carregarReabastecimentos = useCallback(async (
    taxiId = taxiIdAtual,
    { silencioso = false } = {},
  ) => {
    if (!taxiId) {
      setReabastecimentos([]);
      return;
    }

    if (!silencioso) setLoadingLista(true);
    if (!silencioso) setErro("");

    try {
      const res = await fetch(`${REABASTECIMENTOS_URL}/taxi/${taxiId}`, {
        headers: authHeaders(),
      });

      const data = await readJson(res);
      setReabastecimentos(normalizarLista(data, "reabastecimentos"));
      listaCarregadaRef.current = true;
    } catch (err) {
      if (!silencioso)
        setErro(err.message || "Erro ao carregar reabastecimentos.");
    } finally {
      if (!silencioso) setLoadingLista(false);
    }
  }, [taxiIdAtual]);

  useEffect(() => {
    carregarTurnos();
  }, [carregarTurnos]);

  useEffect(() => {
    if (taxiIdAnteriorRef.current !== taxiIdAtual) {
      listaCarregadaRef.current = false;
      taxiIdAnteriorRef.current = taxiIdAtual;
    }

    if (taxiIdAtual) {
      carregarReabastecimentos(taxiIdAtual, {
        silencioso: listaCarregadaRef.current,
      });
    } else {
      setReabastecimentos([]);
    }
  }, [taxiIdAtual, carregarReabastecimentos]);

  const atualizarSilenciosamente = useCallback(() => {
    if (taxiIdAtual) carregarReabastecimentos(taxiIdAtual, { silencioso: true });
  }, [taxiIdAtual, carregarReabastecimentos]);

  useEffect(() => {
    const interval = setInterval(() => {
      atualizarSilenciosamente();
    }, 30000);

    return () => clearInterval(interval);
  }, [atualizarSilenciosamente]);

  useEffect(() => {
    if (!turnoAtual || form.data_inicio || form.data_fim) return;

    const agora = new Date();
    const inicioSugerido = new Date(agora.getTime() - 15 * 60 * 1000);

    setForm((prev) => ({
      ...prev,
      data_inicio: toDateTimeLocalValue(inicioSugerido),
      data_fim: toDateTimeLocalValue(agora),
    }));
  }, [turnoAtual, form.data_inicio, form.data_fim]);

  useEffect(() => {
    if (!quilometragemAtual || form.quilometragem) return;

    setForm((prev) => ({
      ...prev,
      quilometragem: String(quilometragemAtual),
    }));
  }, [quilometragemAtual, form.quilometragem]);

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setErro("");
    setSucesso("");
  }

  function validar() {
    if (!turnoSelecionado) return "Selecione um turno.";
    if (!turnoAtual) return "Turno inválido.";
    if (!getTaxiId(turnoAtual)) return "Este turno não tem táxi associado.";

    if (!form.data_inicio) return "Indique a data de início.";
    if (!form.data_fim) return "Indique a data de fim.";

    if (new Date(form.data_fim) <= new Date(form.data_inicio)) {
      return "A data de início tem de ser anterior à data de fim.";
    }

    if (!form.quantidade || Number(form.quantidade) <= 0) {
      return `Indique ${isEletrico ? "os kWh carregados" : "os litros de combustível"}.`;
    }

    if (!form.custo || Number(form.custo) <= 0) {
      return "Indique o custo total.";
    }

    if (!form.quilometragem || Number(form.quilometragem) <= 0) {
      return "Indique uma quilometragem válida.";
    }

    if (quilometragemAtual && Number(form.quilometragem) <= quilometragemAtual) {
      return `A quilometragem deve ser superior aos ${quilometragemAtual} km atuais do táxi.`;
    }

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
        data_inicio: form.data_inicio,
        data_fim: form.data_fim,
        quilometros: Number(form.quilometragem),
        euros: Number(form.custo),
        ...(isEletrico
          ? { kwh: Number(form.quantidade) }
          : { litros: Number(form.quantidade) }),
      };

      const res = await fetch(`${REABASTECIMENTOS_URL}/create`, {
        method: "POST",
        headers: authHeaders({ "Content-Type": "application/json" }),
        body: JSON.stringify(payload),
      });

      const data = await readJson(res);

      setSucesso(data.message || "Reabastecimento registado com sucesso.");
      setForm({
        data_inicio: "",
        data_fim: "",
        quantidade: "",
        custo: "",
        quilometragem: String(form.quilometragem),
      });

      await carregarReabastecimentos(getTaxiId(turnoAtual));
    } catch (err) {
      setErro(err.message || "Erro ao registar reabastecimento.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="rc-grid">
      <div className="rc-card">
        <div className="rc-card-head">
          <div className="rc-card-head-left">
            <div className="rc-icon-box rc-icon-cyan">
              <Fuel size={20} />
            </div>
            <div>
              <p className="rc-card-title">Novo Reabastecimento</p>
              <p className="rc-card-sub">
                Registe combustível ou carregamento para um turno
              </p>
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
                <div className="rc-input">
                  {turnoAtivo
                    ? `${formatDateTime(turnoAtivo.data_inicio || turnoAtivo.inicio)} · ${getTaxiLabel(turnoAtivo)}`
                    : "Sem turno ativo"}
                </div>
              </div>

              <div className="rc-field">
                <label className="rc-label">Tipo de motor</label>
                <input
                  type="text"
                  value={
                    isEletrico
                      ? "Elétrico"
                      : getTipoMotor(turnoAtual) === "combustao"
                        ? "Combustão"
                        : "—"
                  }
                  disabled
                  className="rc-input"
                />
              </div>

              <div className="rc-field">
                <label className="rc-label">Início do reabastecimento</label>
                <input
                  name="data_inicio"
                  type="datetime-local"
                  value={form.data_inicio}
                  max={toDateTimeLocalValue()}
                  onChange={handleChange}
                  className="rc-input"
                />
              </div>

              <div className="rc-field">
                <label className="rc-label">Fim do reabastecimento</label>
                <input
                  name="data_fim"
                  type="datetime-local"
                  value={form.data_fim}
                  max={toDateTimeLocalValue()}
                  onChange={handleChange}
                  className="rc-input"
                />
              </div>

              <div className="rc-field">
                <label className="rc-label">
                  {isEletrico ? "kWh carregados" : "Litros de combustível"}
                </label>
                <input
                  name="quantidade"
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.quantidade}
                  onChange={handleChange}
                  className="rc-input"
                  placeholder={isEletrico ? "Ex: 42.5" : "Ex: 35.5"}
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
                  min={quilometragemAtual ? quilometragemAtual + 1 : 0}
                  value={form.quilometragem}
                  onChange={handleChange}
                  className="rc-input"
                  placeholder={
                    quilometragemAtual
                      ? `Atual: ${quilometragemAtual} km`
                      : "Ex: 120500"
                  }
                />
                <p className="rc-help">
                  Quilometragem atual conhecida:{" "}
                  <strong>
                    {quilometragemAtual ? `${quilometragemAtual} km` : "sem registo"}
                  </strong>
                </p>
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

      <div className="rc-card">
        <div className="rc-card-head">
          <div className="rc-card-head-left">
            <div className="rc-icon-box rc-icon-purple">
              <ReceiptText size={20} />
            </div>
            <div>
              <p className="rc-card-title">Reabastecimentos do Táxi</p>
              <p className="rc-card-sub">
                {loadingLista
                  ? "A carregar…"
                  : `${reabastecimentos.length} registo${
                      reabastecimentos.length !== 1 ? "s" : ""
                    }`}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={atualizarSilenciosamente}
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
              <p>Nenhum reabastecimento neste táxi.</p>
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
