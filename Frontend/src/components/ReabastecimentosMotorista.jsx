/* eslint-disable react/prop-types */
import { useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  CheckCircle2,
  Fuel,
  Loader2,
  ReceiptText,
  RefreshCw,
} from "lucide-react";

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
  if (!value) return "-";

  return new Date(value).toLocaleString("pt-PT", {
    day: "2-digit",
    month: "2-digit",
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

  async function carregarTurnos() {
    setLoading(true);
    setErro("");

    try {
      const res = await fetch(`${TURNOS_URL}/meus`, {
        headers: authHeaders(),
      });

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
    if (turnoSelecionado) {
      carregarReabastecimentos(turnoSelecionado);
    }
  }, [turnoSelecionado]);

  function handleChange(e) {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));

    setErro("");
    setSucesso("");
  }

  function validar() {
    if (!turnoSelecionado) return "Selecione um turno.";

    if (!turnoAtual) return "Turno inválido.";

    if (!turnoAtual.data_inicio && !turnoAtual.inicio) {
      return "Este turno não tem data de início.";
    }

    if (!turnoAtual.data_fim && !turnoAtual.fim) {
      return "Este turno não tem data de fim.";
    }

    if (!form.litros || Number(form.litros) <= 0) {
      return "Indique os litros/kWh reabastecidos.";
    }

    if (!form.custo || Number(form.custo) <= 0) {
      return "Indique o custo total.";
    }

    if (!form.quilometragem || Number(form.quilometragem) < 0) {
      return "Indique uma quilometragem válida.";
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
      const tipoMotor = getTipoMotor(turnoAtual);

      const payload = {
        turno_id: turnoSelecionado,
        data_inicio: turnoAtual.data_inicio || turnoAtual.inicio,
        data_fim: turnoAtual.data_fim || turnoAtual.fim,
        quilometros: Number(form.quilometragem),
        euros: Number(form.custo),
      };

      if (tipoMotor === "eletrico") {
        payload.kwh = Number(form.litros);
      } else {
        payload.litros = Number(form.litros);
      }

      console.log("REABASTECIMENTO PAYLOAD:", payload);

      const res = await fetch(`${REABASTECIMENTOS_URL}/create`, {
        method: "POST",
        headers: authHeaders({
          "Content-Type": "application/json",
        }),
        body: JSON.stringify(payload),
      });

      const data = await readJson(res);

      setSucesso(data.message || "Reabastecimento registado com sucesso.");
      setForm({
        litros: "",
        custo: "",
        quilometragem: "",
      });

      await carregarReabastecimentos(turnoSelecionado);
    } catch (err) {
      setErro(err.message || "Erro ao registar reabastecimento.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="grid grid-cols-1 xl:grid-cols-[1fr_1.2fr] gap-5">
      <Panel
        icon={<Fuel size={18} />}
        iconBg="linear-gradient(135deg,#00d4ff,#1a6eff)"
        title="Novo Reabastecimento"
        subtitle="Registe combustível para um turno"
      >
        {erro && <Message type="error" text={erro} />}
        {sucesso && <Message type="success" text={sucesso} />}

        {loading ? (
          <Loading text="A carregar turnos..." />
        ) : (
          <form onSubmit={criarReabastecimento} className="space-y-4">
            <Field label="Turno">
              <select
                value={turnoSelecionado}
                onChange={(e) => {
                  setTurnoSelecionado(e.target.value);
                  setErro("");
                  setSucesso("");
                }}
                className="input-tc"
              >
                <option value="" className="bg-[#0a1628]">
                  Selecionar turno
                </option>

                {turnos.map((turno) => (
                  <option
                    key={turno._id}
                    value={turno._id}
                    className="bg-[#0a1628]"
                  >
                    {formatDateTime(turno.data_inicio || turno.inicio)} ·{" "}
                    {getTaxiLabel(turno)}
                  </option>
                ))}
              </select>
            </Field>

            <Field
              label={
                getTipoMotor(turnoAtual) === "eletrico"
                  ? "kWh"
                  : "Litros"
              }
            >
              <input
                name="litros"
                type="number"
                min="0"
                step="0.01"
                value={form.litros}
                onChange={handleChange}
                className="input-tc"
                placeholder={
                  getTipoMotor(turnoAtual) === "eletrico"
                    ? "Ex: 35.5"
                    : "Ex: 35.5"
                }
              />
            </Field>

            <Field label="Custo total (€)">
              <input
                name="custo"
                type="number"
                min="0"
                step="0.01"
                value={form.custo}
                onChange={handleChange}
                className="input-tc"
                placeholder="Ex: 62.40"
              />
            </Field>

            <Field label="Quilometragem">
              <input
                name="quilometragem"
                type="number"
                min="0"
                value={form.quilometragem}
                onChange={handleChange}
                className="input-tc"
                placeholder="Ex: 120500"
              />
            </Field>

            <button
              type="submit"
              disabled={saving}
              className="w-full py-3 rounded-xl font-semibold text-white bg-[linear-gradient(135deg,#00d4ff,#1a6eff)] disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {saving ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  A registar...
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
      </Panel>

      <Panel
        icon={<ReceiptText size={18} />}
        iconBg="linear-gradient(135deg,#c64dff,#7c3aed)"
        title="Reabastecimentos do Turno"
        subtitle="Lista carregada do backend"
        action={
          <button
            type="button"
            onClick={() => carregarReabastecimentos()}
            className="w-10 h-10 rounded-xl border border-white/[0.06] bg-white/[0.03] text-[#8ba3c7] flex items-center justify-center"
          >
            <RefreshCw size={16} />
          </button>
        }
      >
        {loadingLista ? (
          <Loading text="A carregar reabastecimentos..." />
        ) : reabastecimentos.length === 0 ? (
          <Empty text="Nenhum reabastecimento neste turno." />
        ) : (
          <div className="space-y-3">
            {reabastecimentos.map((r) => (
              <div
                key={r._id}
                className="rounded-2xl border border-white/[0.06] bg-white/[0.03] p-4"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="font-semibold text-[#eaf0ff] flex items-center gap-2">
                      <Fuel size={15} />
                      {r.litros != null
                        ? `${r.litros} L`
                        : r.kwh != null
                          ? `${r.kwh} kWh`
                          : "-"}
                    </div>

                    <p className="text-[12px] text-[#8ba3c7] mt-1">
                      Início: {formatDateTime(r.data_inicio)}
                    </p>

                    <p className="text-[12px] text-[#8ba3c7]">
                      Fim: {formatDateTime(r.data_fim)}
                    </p>

                    <p className="text-[12px] text-[#8ba3c7]">
                      Quilometragem: {r.quilometros ?? r.quilometragem ?? "-"}
                    </p>
                  </div>

                  <div className="text-right text-[#8fffd0] font-semibold">
                    € {Number(r.euros ?? r.custo ?? 0).toFixed(2)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Panel>

      <style>{`
        .input-tc {
          width: 100%;
          padding: 12px 14px;
          border-radius: 12px;
          background: rgba(255,255,255,.04);
          border: 1px solid rgba(255,255,255,.08);
          color: #eaf0ff;
          outline: none;
        }

        .input-tc:focus {
          border-color: rgba(0,232,135,.35);
          background: rgba(0,232,135,.05);
        }
      `}</style>
    </div>
  );
}

function Panel({ icon, iconBg, title, subtitle, action, children }) {
  return (
    <div className="rounded-[20px] border border-[#00e887]/[0.08] bg-[rgba(12,28,56,0.55)] p-6 backdrop-blur-xl">
      <div className="flex items-center justify-between mb-5 pb-4 border-b border-white/[0.04]">
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-[13px] flex items-center justify-center text-white"
            style={{ background: iconBg }}
          >
            {icon}
          </div>

          <div>
            <h3 className="font-['Syne',sans-serif] text-[16px] font-bold">
              {title}
            </h3>
            <p className="text-[12px] text-[#8ba3c7]">{subtitle}</p>
          </div>
        </div>

        {action}
      </div>

      {children}
    </div>
  );
}

function Field({ label, children }) {
  return (
    <label className="block">
      <span className="block text-[12px] font-semibold text-[#8ba3c7] mb-2 uppercase tracking-wide">
        {label}
      </span>
      {children}
    </label>
  );
}

function Message({ type, text }) {
  const isError = type === "error";

  return (
    <div
      className={`mb-4 flex items-center gap-2 rounded-xl border px-4 py-3 text-[13px] ${
        isError
          ? "border-red-500/20 bg-red-500/[0.05] text-red-300"
          : "border-[#00e887]/20 bg-[#00e887]/[0.06] text-[#8fffd0]"
      }`}
    >
      {isError ? <AlertCircle size={16} /> : <CheckCircle2 size={16} />}
      {text}
    </div>
  );
}

function Loading({ text }) {
  return (
    <div className="flex items-center justify-center gap-3 py-10 text-[#8ba3c7] text-[14px]">
      <Loader2 size={18} className="animate-spin" />
      {text}
    </div>
  );
}

function Empty({ text }) {
  return (
    <div className="text-center py-10 text-[#8ba3c7] text-[14px]">
      {text}
    </div>
  );
}