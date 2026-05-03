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
  Square,
} from "lucide-react";

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
  if (!res.ok) {
    throw new Error(data.message || data.error || "Erro no servidor.");
  }
  return data;
}

function toDateTimeLocalValue(date = new Date()) {
  const d = new Date(date);
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toISOString().slice(0, 16);
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

  if (turno.estado === "cancelado" || turno.status === "cancelado") {
    return "cancelado";
  }

  if (!Number.isNaN(fim.getTime()) && fim < agora) {
    return "terminado";
  }

  if (!Number.isNaN(inicio.getTime()) && inicio > agora) {
    return "agendado";
  }

  return "ativo";
}

function getEstadoClass(estado) {
  if (estado === "terminado") {
    return "border-white/10 bg-white/[0.04] text-[#8ba3c7]";
  }

  if (estado === "cancelado") {
    return "border-red-500/20 bg-red-500/[0.06] text-red-300";
  }

  if (estado === "agendado") {
    return "border-yellow-500/20 bg-yellow-500/[0.06] text-yellow-300";
  }

  return "border-[#00e887]/20 bg-[#00e887]/[0.06] text-[#8fffd0]";
}

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
      setErro(err.message || "Erro ao carregar dados dos turnos.");
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

    if (new Date(form.fim) <= new Date(form.inicio)) {
      return "O fim do turno deve ser depois do início.";
    }

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
        headers: authHeaders({
          "Content-Type": "application/json",
        }),
      });

      const data = await res.json().catch(() => ({}));
      console.log("CANCELAR TURNO RESPONSE:", data);

      if (!res.ok) {
        setErro(data.message || data.error || "Erro ao cancelar turno.");
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
    <div className="grid grid-cols-1 xl:grid-cols-[1fr_1.2fr] gap-5">
      <Panel
        icon={<Calendar size={18} />}
        iconBg="linear-gradient(135deg,#00e887,#00a85e)"
        title="Novo Turno"
        subtitle="Escolha o período e um táxi disponível"
      >
        {erro && <Message type="error" text={erro} />}
        {sucesso && <Message type="success" text={sucesso} />}

        <form onSubmit={criarTurno} className="space-y-4">
          <Field label="Início">
            <input
              name="inicio"
              type="datetime-local"
              value={form.inicio}
              onChange={handleChange}
              className="input-tc"
            />
          </Field>

          <Field label="Fim">
            <input
              name="fim"
              type="datetime-local"
              value={form.fim}
              onChange={handleChange}
              className="input-tc"
            />
          </Field>

          <Field label="Táxi disponível">
            <select
              name="taxi_id"
              value={form.taxi_id}
              onChange={handleChange}
              className="input-tc"
            >
              <option value="" className="bg-[#0a1628]">
                Selecionar táxi
              </option>

              {taxis.map((taxi) => (
                <option
                  key={taxi._id}
                  value={taxi._id}
                  className="bg-[#0a1628]"
                >
                  {getTaxiLabel(taxi)}
                  {taxi.nivel_conforto ? ` · ${taxi.nivel_conforto}` : ""}
                </option>
              ))}
            </select>
          </Field>

          <button
            type="submit"
            disabled={saving || loading}
            className="w-full py-3 rounded-xl font-semibold text-white bg-[linear-gradient(135deg,#00e887,#00a85e)] disabled:opacity-60 flex items-center justify-center gap-2"
          >
            {saving ? (
              <>
                <Loader2 size={16} className="animate-spin" />A criar...
              </>
            ) : (
              <>
                <CarFront size={16} />
                Criar turno
              </>
            )}
          </button>
        </form>
      </Panel>

      <Panel
        icon={<Clock size={18} />}
        iconBg="linear-gradient(135deg,#1a6eff,#3d8bff)"
        title="Os Meus Turnos"
        subtitle="Turnos carregados do backend"
        action={
          <button
            type="button"
            onClick={carregarDados}
            className="w-10 h-10 rounded-xl border border-white/[0.06] bg-white/[0.03] text-[#8ba3c7] flex items-center justify-center"
          >
            <RefreshCw size={16} />
          </button>
        }
      >
        {loading ? (
          <Loading text="A carregar turnos..." />
        ) : turnos.length === 0 ? (
          <Empty text="Ainda não existem turnos." />
        ) : (
          <div className="space-y-3">
            {turnos.map((turno) => {
              const estado = getEstadoTurno(turno);
              const podeCancelar =
                estado !== "terminado" && estado !== "cancelado";

              return (
                <div
                  key={turno._id}
                  className="rounded-2xl border border-white/[0.06] bg-white/[0.03] p-4"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="font-semibold text-[#eaf0ff] flex items-center gap-2">
                        <CarFront size={15} />
                        {getTaxiLabel(turno.taxi || turno.taxi_id)}
                      </div>

                      <p className="text-[12px] text-[#8ba3c7] mt-1">
                        Início: {formatDateTime(turno.data_inicio || turno.inicio)}
                      </p>

                      <p className="text-[12px] text-[#8ba3c7]">
                        Fim: {formatDateTime(turno.data_fim || turno.fim)}
                      </p>

                      <span
                        className={`inline-flex mt-2 px-2.5 py-1 rounded-full text-[11px] border ${getEstadoClass(
                          estado,
                        )}`}
                      >
                        {estado}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => cancelarTurno(turno._id)}
                      disabled={!podeCancelar || cancelandoId === turno._id}
                      className={`px-3 py-2 rounded-xl border text-[12px] flex items-center gap-2 disabled:opacity-50 ${
                        podeCancelar
                          ? "bg-red-500/10 border-red-500/20 text-red-300"
                          : "bg-white/[0.03] border-white/[0.06] text-[#8ba3c7] cursor-not-allowed"
                      }`}
                    >
                      {cancelandoId === turno._id ? (
                        <Loader2 size={14} className="animate-spin" />
                      ) : (
                        <Square size={14} />
                      )}
                      Cancelar
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {turnoAtivo && (
          <p className="mt-4 text-[12px] text-[#00e887]">
            Turno ativo detetado:{" "}
            {getTaxiLabel(turnoAtivo.taxi || turnoAtivo.taxi_id)}
          </p>
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