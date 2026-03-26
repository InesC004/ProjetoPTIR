/* eslint-disable react/prop-types */
import { useState, useEffect } from "react";
import {
  X,
  DollarSign,
  Moon,
  Calculator,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Clock,
  ArrowRight,
} from "lucide-react";

const API = "http://localhost:8080/api/precos";

function getToken() {
  return localStorage.getItem("token");
}

/* ═══════════════════════════════════════════════
   US3-a: Definir preço por minuto + acréscimo noturno
   ═══════════════════════════════════════════════ */
export function DefinirPrecos({ aberto, onFechar }) {
  const [precos, setPrecos] = useState([]); // preços vindos da BD
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Campos do formulário
  const [basico, setBasico] = useState({ preco_minuto: "", acrescimo_noturno: "" });
  const [luxuoso, setLuxuoso] = useState({ preco_minuto: "", acrescimo_noturno: "" });

  // Carrega preços existentes ao abrir
  useEffect(() => {
    if (!aberto) return;
    fetchPrecos();
  }, [aberto]);

  async function fetchPrecos() {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(API);
      if (!res.ok) throw new Error();
      const data = await res.json();
      setPrecos(data);

      const pb = data.find((p) => p.nivel_conforto === "basico");
      const pl = data.find((p) => p.nivel_conforto === "luxuoso");

      if (pb) setBasico({ preco_minuto: String(pb.preco_minuto), acrescimo_noturno: String(pb.acrescimo_noturno || 0) });
      if (pl) setLuxuoso({ preco_minuto: String(pl.preco_minuto), acrescimo_noturno: String(pl.acrescimo_noturno || 0) });
    } catch {
      setError("Erro ao carregar preços.");
    } finally {
      setLoading(false);
    }
  }

  function validar() {
    const bp = parseFloat(basico.preco_minuto);
    const ba = parseFloat(basico.acrescimo_noturno);
    const lp = parseFloat(luxuoso.preco_minuto);
    const la = parseFloat(luxuoso.acrescimo_noturno);

    if (!basico.preco_minuto || isNaN(bp) || bp <= 0) return "Preço/minuto básico deve ser positivo.";
    if (!luxuoso.preco_minuto || isNaN(lp) || lp <= 0) return "Preço/minuto luxuoso deve ser positivo.";
    if (basico.acrescimo_noturno === "" || isNaN(ba) || ba < 0) return "Acréscimo noturno básico inválido.";
    if (luxuoso.acrescimo_noturno === "" || isNaN(la) || la < 0) return "Acréscimo noturno luxuoso inválido.";
    return null;
  }

  async function handleSave() {
    const err = validar();
    if (err) { setError(err); return; }

    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const token = getToken();
      const headers = { "Content-Type": "application/json", Authorization: `Bearer ${token}` };

      // Para cada nível: se já existe faz PUT, senão faz POST
      for (const [nivel, dados] of [["basico", basico], ["luxuoso", luxuoso]]) {
        const existente = precos.find((p) => p.nivel_conforto === nivel);
        const body = {
          nivel_conforto: nivel,
          preco_minuto: parseFloat(dados.preco_minuto),
          acrescimo_noturno: parseFloat(dados.acrescimo_noturno),
        };

        if (existente) {
          const res = await fetch(`${API}/${existente._id}`, { method: "PUT", headers, body: JSON.stringify(body) });
          if (!res.ok) { const d = await res.json().catch(() => ({})); throw new Error(d.error || `Erro ao atualizar ${nivel}`); }
        } else {
          const res = await fetch(API, { method: "POST", headers, body: JSON.stringify(body) });
          if (!res.ok) { const d = await res.json().catch(() => ({})); throw new Error(d.error || `Erro ao criar ${nivel}`); }
        }
      }

      setSuccess("Preços guardados com sucesso!");
      await fetchPrecos(); // recarrega
      setTimeout(() => setSuccess(""), 3000);
    } catch (e) {
      setError(e.message || "Erro ao guardar preços.");
    } finally {
      setSaving(false);
    }
  }

  if (!aberto) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onFechar} />

      <div className="relative w-full max-w-[580px] mx-4 max-h-[90vh] overflow-y-auto rounded-2xl border border-[#1a6eff]/20 bg-[#0a1628]/95 backdrop-blur-2xl shadow-[0_32px_80px_rgba(0,0,0,0.5)] scrollbar-none">
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#1a6eff]/30 to-transparent" />

        {/* Header */}
        <div className="flex items-center justify-between p-6 pb-4 sticky top-0 bg-[#0a1628]/95 backdrop-blur-xl z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-[13px] flex items-center justify-center text-white shadow-[0_4px_16px_rgba(0,0,0,0.25)]"
              style={{ background: "linear-gradient(135deg, #1a6eff, #7c3aed)" }}>
              <DollarSign size={18} strokeWidth={1.8} />
            </div>
            <div>
              <h3 className="font-['Syne',sans-serif] text-[18px] font-bold text-[#eaf0ff]">Definir Preços</h3>
              <p className="text-[12px] text-[#4e6a8a]">Preço por minuto e acréscimo noturno (21h–6h)</p>
            </div>
          </div>
          <button onClick={onFechar}
            className="w-9 h-9 rounded-xl flex items-center justify-center border border-white/[0.06] bg-white/[0.03] text-[#8ba3c7] hover:bg-red-500/10 hover:border-red-500/25 hover:text-red-400 transition-all duration-200 cursor-pointer">
            <X size={16} strokeWidth={2} />
          </button>
        </div>

        <div className="px-6 pb-6">
          {error && (
            <div className="mb-4 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm flex items-center gap-2">
              <AlertCircle size={16} /> {error}
            </div>
          )}
          {success && (
            <div className="mb-4 px-4 py-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-sm flex items-center gap-2">
              <CheckCircle2 size={16} /> {success}
            </div>
          )}

          {loading ? (
            <div className="flex items-center justify-center gap-3 py-10 text-[#8ba3c7] text-[14px]">
              <Loader2 size={18} className="animate-spin" /> A carregar preços...
            </div>
          ) : (
            <>
              {/* ── BÁSICO ── */}
              <div className="mb-5 p-4 rounded-xl border border-[#1a6eff]/15 bg-[#1a6eff]/[0.04]">
                <div className="flex items-center gap-2 mb-4">
                  <span className="px-2.5 py-1 rounded-lg bg-[#1a6eff]/15 text-[#3d8bff] text-[11px] font-bold uppercase tracking-wider">Básico</span>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-[#8ba3c7] mb-1.5 uppercase tracking-wide">Preço / minuto (€)</label>
                    <input type="number" step="0.01" min="0.01" placeholder="Ex: 0.15"
                      value={basico.preco_minuto} onChange={(e) => setBasico((p) => ({ ...p, preco_minuto: e.target.value }))}
                      className="w-full px-4 py-3 rounded-xl text-[14px] text-[#eaf0ff] placeholder-[#4e6a8a]/50 bg-white/[0.04] border border-white/[0.08] outline-none focus:border-[#1a6eff]/40 focus:bg-[#1a6eff]/[0.06]" />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-[#8ba3c7] mb-1.5 uppercase tracking-wide">Acréscimo noturno (%)</label>
                    <input type="number" step="1" min="0" placeholder="Ex: 20"
                      value={basico.acrescimo_noturno} onChange={(e) => setBasico((p) => ({ ...p, acrescimo_noturno: e.target.value }))}
                      className="w-full px-4 py-3 rounded-xl text-[14px] text-[#eaf0ff] placeholder-[#4e6a8a]/50 bg-white/[0.04] border border-white/[0.08] outline-none focus:border-[#1a6eff]/40 focus:bg-[#1a6eff]/[0.06]" />
                  </div>
                </div>
              </div>

              {/* ── LUXUOSO ── */}
              <div className="mb-6 p-4 rounded-xl border border-[#c64dff]/15 bg-[#c64dff]/[0.04]">
                <div className="flex items-center gap-2 mb-4">
                  <span className="px-2.5 py-1 rounded-lg bg-[#c64dff]/15 text-[#c64dff] text-[11px] font-bold uppercase tracking-wider">Luxuoso</span>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-[#8ba3c7] mb-1.5 uppercase tracking-wide">Preço / minuto (€)</label>
                    <input type="number" step="0.01" min="0.01" placeholder="Ex: 0.25"
                      value={luxuoso.preco_minuto} onChange={(e) => setLuxuoso((p) => ({ ...p, preco_minuto: e.target.value }))}
                      className="w-full px-4 py-3 rounded-xl text-[14px] text-[#eaf0ff] placeholder-[#4e6a8a]/50 bg-white/[0.04] border border-white/[0.08] outline-none focus:border-[#c64dff]/40 focus:bg-[#c64dff]/[0.06]" />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-[#8ba3c7] mb-1.5 uppercase tracking-wide">Acréscimo noturno (%)</label>
                    <input type="number" step="1" min="0" placeholder="Ex: 20"
                      value={luxuoso.acrescimo_noturno} onChange={(e) => setLuxuoso((p) => ({ ...p, acrescimo_noturno: e.target.value }))}
                      className="w-full px-4 py-3 rounded-xl text-[14px] text-[#eaf0ff] placeholder-[#4e6a8a]/50 bg-white/[0.04] border border-white/[0.08] outline-none focus:border-[#c64dff]/40 focus:bg-[#c64dff]/[0.06]" />
                  </div>
                </div>
              </div>

              {/* Info noturno */}
              <div className="mb-5 flex items-center gap-2 px-3 py-2.5 rounded-xl bg-white/[0.02] border border-white/[0.05] text-[12px] text-[#6b8baa]">
                <Moon size={14} className="text-[#c64dff] shrink-0" />
                Período noturno: 21:00 – 06:00. O acréscimo é aplicado em percentagem sobre o preço/minuto.
              </div>

              {/* Botão guardar */}
              <button onClick={handleSave} disabled={saving}
                className="w-full py-3.5 rounded-xl font-semibold text-[14px] text-white flex items-center justify-center gap-2 transition-all duration-200 hover:shadow-[0_8px_32px_rgba(26,110,255,0.3)] hover:-translate-y-0.5 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                style={{ background: "linear-gradient(135deg, #1a6eff, #0052cc)" }}>
                {saving ? (<><Loader2 size={16} className="animate-spin" /> A guardar...</>) :
                  (<><CheckCircle2 size={16} /> Guardar Preços</>)}
              </button>
            </>
          )}
        </div>

        <style>{`.scrollbar-none::-webkit-scrollbar{display:none}.scrollbar-none{scrollbar-width:none}`}</style>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════
   US3-c: Simular custo de viagem fictícia
   
   Algoritmo do enunciado:
   - Período diurno (06:00–21:00): minutos × preço_minuto
   - Período noturno (21:00–06:00): minutos × preço_minuto × (1 + acrescimo%)
   - Viagem pode cruzar dia/noite e até dias consecutivos
   ═══════════════════════════════════════════════ */
export function SimularViagem({ aberto, onFechar }) {
  const [precos, setPrecos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [nivel, setNivel] = useState("basico");
  const [inicio, setInicio] = useState(""); // "HH:MM" ou "YYYY-MM-DDTHH:MM"
  const [fim, setFim] = useState("");
  const [resultado, setResultado] = useState(null);

  useEffect(() => {
    if (!aberto) return;
    fetchPrecos();
    setResultado(null);
  }, [aberto]);

  async function fetchPrecos() {
    setLoading(true);
    try {
      const res = await fetch(API);
      if (!res.ok) throw new Error();
      setPrecos(await res.json());
    } catch {
      setError("Erro ao carregar preços.");
    } finally {
      setLoading(false);
    }
  }

  // Verifica se uma hora (0-23) está no período noturno (21h-6h)
  function isNoturno(hora) {
    return hora >= 21 || hora < 6;
  }

  // Calcula custo minuto a minuto (abordagem precisa)
  function calcularCusto() {
    setError("");
    setResultado(null);

    const preco = precos.find((p) => p.nivel_conforto === nivel);
    if (!preco) { setError("Preço não definido para este nível. Defina primeiro os preços."); return; }
    if (!inicio || !fim) { setError("Preencha a hora de início e fim."); return; }

    const dInicio = new Date(inicio);
    const dFim = new Date(fim);

    if (isNaN(dInicio.getTime()) || isNaN(dFim.getTime())) { setError("Datas inválidas."); return; }
    if (dFim <= dInicio) { setError("O fim deve ser posterior ao início."); return; }

    const precoMin = preco.preco_minuto;
    const acrescimo = preco.acrescimo_noturno / 100; // ex: 20 → 0.20

    let minutosDiurnos = 0;
    let minutosNoturnos = 0;

    // Itera minuto a minuto
    const cursor = new Date(dInicio);
    while (cursor < dFim) {
      if (isNoturno(cursor.getHours())) {
        minutosNoturnos++;
      } else {
        minutosDiurnos++;
      }
      cursor.setMinutes(cursor.getMinutes() + 1);
    }

    const custoDiurno = minutosDiurnos * precoMin;
    const custoNoturno = minutosNoturnos * precoMin * (1 + acrescimo);
    const total = custoDiurno + custoNoturno;
    const totalMinutos = minutosDiurnos + minutosNoturnos;

    setResultado({
      totalMinutos,
      minutosDiurnos,
      minutosNoturnos,
      custoDiurno,
      custoNoturno,
      total,
      precoMin,
      acrescimo: preco.acrescimo_noturno,
    });
  }

  if (!aberto) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onFechar} />

      <div className="relative w-full max-w-[560px] mx-4 max-h-[90vh] overflow-y-auto rounded-2xl border border-[#00d4ff]/20 bg-[#0a1628]/95 backdrop-blur-2xl shadow-[0_32px_80px_rgba(0,0,0,0.5)] scrollbar-none">
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#00d4ff]/30 to-transparent" />

        {/* Header */}
        <div className="flex items-center justify-between p-6 pb-4 sticky top-0 bg-[#0a1628]/95 backdrop-blur-xl z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-[13px] flex items-center justify-center text-white shadow-[0_4px_16px_rgba(0,0,0,0.25)]"
              style={{ background: "linear-gradient(135deg, #00d4ff, #1a6eff)" }}>
              <Calculator size={18} strokeWidth={1.8} />
            </div>
            <div>
              <h3 className="font-['Syne',sans-serif] text-[18px] font-bold text-[#eaf0ff]">Simular Viagem</h3>
              <p className="text-[12px] text-[#4e6a8a]">Calcular custo de uma viagem fictícia</p>
            </div>
          </div>
          <button onClick={onFechar}
            className="w-9 h-9 rounded-xl flex items-center justify-center border border-white/[0.06] bg-white/[0.03] text-[#8ba3c7] hover:bg-red-500/10 hover:border-red-500/25 hover:text-red-400 transition-all duration-200 cursor-pointer">
            <X size={16} strokeWidth={2} />
          </button>
        </div>

        <div className="px-6 pb-6">
          {error && (
            <div className="mb-4 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm flex items-center gap-2">
              <AlertCircle size={16} /> {error}
            </div>
          )}

          {loading ? (
            <div className="flex items-center justify-center gap-3 py-10 text-[#8ba3c7] text-[14px]">
              <Loader2 size={18} className="animate-spin" /> A carregar...
            </div>
          ) : (
            <>
              {/* Nível de conforto */}
              <div className="mb-4">
                <label className="block text-[11px] font-semibold text-[#8ba3c7] mb-2 uppercase tracking-wide">Nível de conforto</label>
                <div className="flex gap-2">
                  {["basico", "luxuoso"].map((n) => (
                    <button key={n} type="button" onClick={() => { setNivel(n); setResultado(null); }}
                      className={`flex-1 py-2.5 rounded-xl text-[13px] font-semibold transition-all duration-200 border ${
                        nivel === n
                          ? n === "basico"
                            ? "bg-[#1a6eff]/15 border-[#1a6eff]/40 text-[#3d8bff]"
                            : "bg-[#c64dff]/15 border-[#c64dff]/40 text-[#c64dff]"
                          : "bg-white/[0.03] border-white/[0.08] text-[#6b8baa] hover:bg-white/[0.06]"
                      }`}>
                      {n === "basico" ? "Básico" : "Luxuoso"}
                    </button>
                  ))}
                </div>
              </div>

              {/* Hora início e fim */}
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div>
                  <label className="block text-[11px] font-semibold text-[#8ba3c7] mb-1.5 uppercase tracking-wide">Início da viagem</label>
                  <input type="datetime-local" value={inicio} onChange={(e) => { setInicio(e.target.value); setResultado(null); }}
                    className="w-full px-3 py-3 rounded-xl text-[13px] text-[#eaf0ff] bg-white/[0.04] border border-white/[0.08] outline-none focus:border-[#1a6eff]/40 focus:bg-[#1a6eff]/[0.06]" />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-[#8ba3c7] mb-1.5 uppercase tracking-wide">Fim da viagem</label>
                  <input type="datetime-local" value={fim} onChange={(e) => { setFim(e.target.value); setResultado(null); }}
                    className="w-full px-3 py-3 rounded-xl text-[13px] text-[#eaf0ff] bg-white/[0.04] border border-white/[0.08] outline-none focus:border-[#1a6eff]/40 focus:bg-[#1a6eff]/[0.06]" />
                </div>
              </div>

              {/* Info */}
              <div className="mb-5 flex items-center gap-2 px-3 py-2.5 rounded-xl bg-white/[0.02] border border-white/[0.05] text-[12px] text-[#6b8baa]">
                <Clock size={14} className="text-[#00d4ff] shrink-0" />
                A viagem pode cruzar o período diurno e noturno, e até dias consecutivos.
              </div>

              {/* Botão calcular */}
              <button onClick={calcularCusto}
                className="w-full py-3.5 rounded-xl font-semibold text-[14px] text-white flex items-center justify-center gap-2 transition-all duration-200 hover:shadow-[0_8px_32px_rgba(0,212,255,0.3)] hover:-translate-y-0.5 cursor-pointer mb-5"
                style={{ background: "linear-gradient(135deg, #00d4ff, #1a6eff)" }}>
                <Calculator size={16} /> Calcular Custo
              </button>

              {/* Resultado */}
              {resultado && (
                <div className="rounded-2xl border border-[#00d4ff]/20 bg-[#00d4ff]/[0.04] p-5 animate-[fadeUp_0.3s_ease_both]">
                  <div className="text-center mb-4">
                    <div className="text-[11px] uppercase tracking-wider text-[#6b8baa] mb-1">Custo total da viagem</div>
                    <div className="font-['Syne',sans-serif] text-[36px] font-extrabold text-[#00d4ff]">
                      {resultado.total.toFixed(2)}€
                    </div>
                    <div className="text-[12px] text-[#8ba3c7] mt-1">
                      {resultado.totalMinutos} minutos · {nivel === "basico" ? "Básico" : "Luxuoso"} · {resultado.precoMin}€/min
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.06] text-center">
                      <div className="text-[10px] uppercase tracking-wider text-[#6b8baa] mb-1">Período diurno</div>
                      <div className="font-['Syne',sans-serif] text-[18px] font-bold text-[#eaf0ff]">
                        {resultado.custoDiurno.toFixed(2)}€
                      </div>
                      <div className="text-[11px] text-[#6b8baa] mt-0.5">{resultado.minutosDiurnos} min × {resultado.precoMin}€</div>
                    </div>
                    <div className="p-3 rounded-xl bg-[#c64dff]/[0.06] border border-[#c64dff]/15 text-center">
                      <div className="text-[10px] uppercase tracking-wider text-[#6b8baa] mb-1">Período noturno</div>
                      <div className="font-['Syne',sans-serif] text-[18px] font-bold text-[#c64dff]">
                        {resultado.custoNoturno.toFixed(2)}€
                      </div>
                      <div className="text-[11px] text-[#6b8baa] mt-0.5">
                        {resultado.minutosNoturnos} min × {resultado.precoMin}€ × {(1 + resultado.acrescimo / 100).toFixed(2)}
                      </div>
                    </div>
                  </div>

                  {resultado.acrescimo > 0 && (
                    <div className="mt-3 text-center text-[11px] text-[#8ba3c7]">
                      <Moon size={12} className="inline mr-1 text-[#c64dff]" />
                      Acréscimo noturno de {resultado.acrescimo}% aplicado entre 21:00 e 06:00
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>

        <style>{`
          .scrollbar-none::-webkit-scrollbar{display:none}.scrollbar-none{scrollbar-width:none}
          @keyframes fadeUp{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}
        `}</style>
      </div>
    </div>
  );
}
