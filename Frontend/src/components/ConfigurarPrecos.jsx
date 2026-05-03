/* eslint-disable react/prop-types */
import { useState, useEffect } from "react";
import api from "../Api";
import {
  X,
  DollarSign,
  Moon,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Sun,
  Pencil,
  Calculator,
  Clock,
  ChevronDown,
} from "lucide-react";

/* ═══════════════════════════════════════════════
   DEFINIR PREÇOS (criar/editar)
   ═══════════════════════════════════════════════ */
export function DefinirPrecos({ aberto, onFechar }) {
  const [precos, setPrecos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [basico, setBasico] = useState({
    preco_minuto: "",
    acrescimo_noturno: "",
  });
  const [luxuoso, setLuxuoso] = useState({
    preco_minuto: "",
    acrescimo_noturno: "",
  });

  useEffect(() => {
    if (!aberto) return;
    fetchPrecos();
  }, [aberto]);

  async function fetchPrecos() {
    setLoading(true);
    setError("");
    try {
      const data = await api.precos.listar();
      setPrecos(data);
      const pb = data.find((p) => p.nivel_conforto === "basico");
      const pl = data.find((p) => p.nivel_conforto === "luxuoso");
      if (pb)
        setBasico({
          preco_minuto: String(pb.preco_minuto),
          acrescimo_noturno: String(pb.acrescimo_noturno || 0),
        });
      else setBasico({ preco_minuto: "", acrescimo_noturno: "" });
      if (pl)
        setLuxuoso({
          preco_minuto: String(pl.preco_minuto),
          acrescimo_noturno: String(pl.acrescimo_noturno || 0),
        });
      else setLuxuoso({ preco_minuto: "", acrescimo_noturno: "" });
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
    if (!basico.preco_minuto || isNaN(bp) || bp <= 0)
      return "Preço/minuto básico deve ser positivo.";
    if (!luxuoso.preco_minuto || isNaN(lp) || lp <= 0)
      return "Preço/minuto luxuoso deve ser positivo.";
    if (basico.acrescimo_noturno === "" || isNaN(ba) || ba < 0)
      return "Acréscimo noturno básico inválido.";
    if (luxuoso.acrescimo_noturno === "" || isNaN(la) || la < 0)
      return "Acréscimo noturno luxuoso inválido.";
    return null;
  }

  async function handleSave() {
    const err = validar();
    if (err) {
      setError(err);
      return;
    }
    setSaving(true);
    setError("");
    setSuccess("");
    try {
      for (const [nivel, dados] of [
        ["basico", basico],
        ["luxuoso", luxuoso],
      ]) {
        const existente = precos.find((p) => p.nivel_conforto === nivel);
        const body = {
          nivel_conforto: nivel,
          preco_minuto: parseFloat(dados.preco_minuto),
          acrescimo_noturno: parseFloat(dados.acrescimo_noturno),
        };
        if (existente) {
          await api.precos.atualizar(existente._id, body);
        } else {
          await api.precos.criar(body);
        }
      }
      setSuccess("Preços guardados com sucesso!");
      await fetchPrecos();
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
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onFechar}
      />
      <div className="relative w-full max-w-[580px] mx-4 max-h-[90vh] overflow-y-auto rounded-2xl border border-[#1a6eff]/20 bg-[#0a1628]/95 backdrop-blur-2xl shadow-[0_32px_80px_rgba(0,0,0,0.5)] scrollbar-none">
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#1a6eff]/30 to-transparent" />
        <div className="flex items-center justify-between p-6 pb-4 sticky top-0 bg-[#0a1628]/95 backdrop-blur-xl z-10">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-[13px] flex items-center justify-center text-white shadow-[0_4px_16px_rgba(0,0,0,0.25)]"
              style={{
                background: "linear-gradient(135deg, #1a6eff, #7c3aed)",
              }}
            >
              <DollarSign size={18} strokeWidth={1.8} />
            </div>
            <div>
              <h3 className="font-['Syne',sans-serif] text-[18px] font-bold text-[#eaf0ff]">
                Definir Preços
              </h3>
              <p className="text-[12px] text-[#4e6a8a]">
                Preço por minuto e acréscimo noturno (21h–6h)
              </p>
            </div>
          </div>
          <button
            onClick={onFechar}
            className="w-9 h-9 rounded-xl flex items-center justify-center border border-white/[0.06] bg-white/[0.03] text-[#8ba3c7] hover:bg-red-500/10 hover:border-red-500/25 hover:text-red-400 transition-all duration-200 cursor-pointer"
          >
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
              <Loader2 size={18} className="animate-spin" /> A carregar
              preços...
            </div>
          ) : (
            <>
              <div className="mb-5 p-4 rounded-xl border border-[#1a6eff]/15 bg-[#1a6eff]/[0.04]">
                <div className="flex items-center gap-2 mb-4">
                  <span className="px-2.5 py-1 rounded-lg bg-[#1a6eff]/15 text-[#3d8bff] text-[11px] font-bold uppercase tracking-wider">
                    Básico
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-[#8ba3c7] mb-1.5 uppercase tracking-wide">
                      Preço / minuto (€)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0.01"
                      placeholder="Ex: 0.15"
                      value={basico.preco_minuto}
                      onChange={(e) =>
                        setBasico((p) => ({
                          ...p,
                          preco_minuto: e.target.value,
                        }))
                      }
                      className="w-full px-4 py-3 rounded-xl text-[14px] text-[#eaf0ff] placeholder-[#4e6a8a]/50 bg-white/[0.04] border border-white/[0.08] outline-none focus:border-[#1a6eff]/40 focus:bg-[#1a6eff]/[0.06]"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-[#8ba3c7] mb-1.5 uppercase tracking-wide">
                      Acréscimo noturno (%)
                    </label>
                    <input
                      type="number"
                      step="1"
                      min="0"
                      placeholder="Ex: 20"
                      value={basico.acrescimo_noturno}
                      onChange={(e) =>
                        setBasico((p) => ({
                          ...p,
                          acrescimo_noturno: e.target.value,
                        }))
                      }
                      className="w-full px-4 py-3 rounded-xl text-[14px] text-[#eaf0ff] placeholder-[#4e6a8a]/50 bg-white/[0.04] border border-white/[0.08] outline-none focus:border-[#1a6eff]/40 focus:bg-[#1a6eff]/[0.06]"
                    />
                  </div>
                </div>
              </div>
              <div className="mb-6 p-4 rounded-xl border border-[#c64dff]/15 bg-[#c64dff]/[0.04]">
                <div className="flex items-center gap-2 mb-4">
                  <span className="px-2.5 py-1 rounded-lg bg-[#c64dff]/15 text-[#c64dff] text-[11px] font-bold uppercase tracking-wider">
                    Luxuoso
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-[#8ba3c7] mb-1.5 uppercase tracking-wide">
                      Preço / minuto (€)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0.01"
                      placeholder="Ex: 0.25"
                      value={luxuoso.preco_minuto}
                      onChange={(e) =>
                        setLuxuoso((p) => ({
                          ...p,
                          preco_minuto: e.target.value,
                        }))
                      }
                      className="w-full px-4 py-3 rounded-xl text-[14px] text-[#eaf0ff] placeholder-[#4e6a8a]/50 bg-white/[0.04] border border-white/[0.08] outline-none focus:border-[#c64dff]/40 focus:bg-[#c64dff]/[0.06]"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-[#8ba3c7] mb-1.5 uppercase tracking-wide">
                      Acréscimo noturno (%)
                    </label>
                    <input
                      type="number"
                      step="1"
                      min="0"
                      placeholder="Ex: 20"
                      value={luxuoso.acrescimo_noturno}
                      onChange={(e) =>
                        setLuxuoso((p) => ({
                          ...p,
                          acrescimo_noturno: e.target.value,
                        }))
                      }
                      className="w-full px-4 py-3 rounded-xl text-[14px] text-[#eaf0ff] placeholder-[#4e6a8a]/50 bg-white/[0.04] border border-white/[0.08] outline-none focus:border-[#c64dff]/40 focus:bg-[#c64dff]/[0.06]"
                    />
                  </div>
                </div>
              </div>
              <div className="mb-5 flex items-center gap-2 px-3 py-2.5 rounded-xl bg-white/[0.02] border border-white/[0.05] text-[12px] text-[#6b8baa]">
                <Moon size={14} className="text-[#c64dff] shrink-0" />
                Período noturno: 21:00 – 06:00. O acréscimo é aplicado em
                percentagem sobre o preço/minuto.
              </div>
              <button
                onClick={handleSave}
                disabled={saving}
                className="w-full py-3.5 rounded-xl font-semibold text-[14px] text-white flex items-center justify-center gap-2 transition-all duration-200 hover:shadow-[0_8px_32px_rgba(26,110,255,0.3)] hover:-translate-y-0.5 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                style={{
                  background: "linear-gradient(135deg, #1a6eff, #0052cc)",
                }}
              >
                {saving ? (
                  <>
                    <Loader2 size={16} className="animate-spin" /> A guardar...
                  </>
                ) : (
                  <>
                    <CheckCircle2 size={16} /> Guardar Preços
                  </>
                )}
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
   LISTAR PREÇOS
   ═══════════════════════════════════════════════ */
export function ListarPrecos({ aberto, onFechar, onEditar }) {
  const [precos, setPrecos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!aberto) return;
    fetchPrecos();
  }, [aberto]);

  async function fetchPrecos() {
    setLoading(true);
    setError("");
    try {
      setPrecos(await api.precos.listar());
    } catch {
      setError("Erro ao carregar preços.");
    } finally {
      setLoading(false);
    }
  }

  if (!aberto) return null;
  const basico = precos.find((p) => p.nivel_conforto === "basico");
  const luxuoso = precos.find((p) => p.nivel_conforto === "luxuoso");

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onFechar}
      />
      <div className="relative w-full max-w-[560px] mx-4 max-h-[90vh] overflow-y-auto rounded-2xl border border-[#1a6eff]/20 bg-[#0a1628]/95 backdrop-blur-2xl shadow-[0_32px_80px_rgba(0,0,0,0.5)] scrollbar-none">
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#00d4ff]/30 to-transparent" />
        <div className="flex items-center justify-between p-6 pb-4 sticky top-0 bg-[#0a1628]/95 backdrop-blur-xl z-10">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-[13px] flex items-center justify-center text-white shadow-[0_4px_16px_rgba(0,0,0,0.25)]"
              style={{
                background: "linear-gradient(135deg, #00d4ff, #1a6eff)",
              }}
            >
              <DollarSign size={18} strokeWidth={1.8} />
            </div>
            <div>
              <h3 className="font-['Syne',sans-serif] text-[18px] font-bold text-[#eaf0ff]">
                Preços Atuais
              </h3>
              <p className="text-[12px] text-[#4e6a8a]">
                Tabela de preços por nível de conforto
              </p>
            </div>
          </div>
          <button
            onClick={onFechar}
            className="w-9 h-9 rounded-xl flex items-center justify-center border border-white/[0.06] bg-white/[0.03] text-[#8ba3c7] hover:bg-red-500/10 hover:border-red-500/25 hover:text-red-400 transition-all duration-200 cursor-pointer"
          >
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
          ) : precos.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 rounded-2xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-center mx-auto mb-4">
                <DollarSign size={28} className="text-[#4e6a8a]" />
              </div>
              <p className="text-[15px] text-[#8ba3c7] font-medium mb-2">
                Nenhum preço definido
              </p>
              <p className="text-[13px] text-[#4e6a8a] mb-5">
                Defina os preços para começar a cobrar viagens.
              </p>
              <button
                onClick={() => {
                  onFechar();
                  onEditar?.();
                }}
                className="px-5 py-2.5 rounded-xl text-[13px] font-semibold text-white transition-all duration-200 hover:shadow-[0_8px_24px_rgba(26,110,255,0.3)] cursor-pointer"
                style={{
                  background: "linear-gradient(135deg, #1a6eff, #0052cc)",
                }}
              >
                Definir Preços
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              <PrecoCard
                nivel="Básico"
                cor="#1a6eff"
                corBg="rgba(26,110,255,0.06)"
                corBorder="rgba(26,110,255,0.18)"
                dados={basico}
              />
              <PrecoCard
                nivel="Luxuoso"
                cor="#c64dff"
                corBg="rgba(198,77,255,0.06)"
                corBorder="rgba(198,77,255,0.18)"
                dados={luxuoso}
              />
              <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-white/[0.02] border border-white/[0.05] text-[12px] text-[#6b8baa]">
                <Moon size={14} className="text-[#c64dff] shrink-0" />
                Período noturno: 21:00 – 06:00
              </div>
              <button
                onClick={() => {
                  onFechar();
                  onEditar?.();
                }}
                className="w-full py-3 rounded-xl font-semibold text-[13px] text-[#3d8bff] flex items-center justify-center gap-2 transition-all duration-200 border border-[#1a6eff]/25 bg-[#1a6eff]/[0.08] hover:bg-[#1a6eff]/[0.15] cursor-pointer"
              >
                <Pencil size={15} /> Editar Preços
              </button>
            </div>
          )}
        </div>
        <style>{`.scrollbar-none::-webkit-scrollbar{display:none}.scrollbar-none{scrollbar-width:none}`}</style>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════
   SIMULAR CUSTO DE VIAGEM

   - Carrega preços da BD
   - Gestor seleciona um preço num dropdown que mostra
     "Básico — 0.15€/min (noturno +20%)" etc.
   - Define início e fim da viagem
   - Calcula custo minuto a minuto (diurno vs noturno)
   ═══════════════════════════════════════════════ */
export function SimularViagem({ aberto, onFechar }) {
  const [precos, setPrecos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [precoSelecionado, setPrecoSelecionado] = useState(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [inicio, setInicio] = useState("");
  const [fim, setFim] = useState("");
  const [resultado, setResultado] = useState(null);

  useEffect(() => {
    if (!aberto) return;
    fetchPrecos();
    setPrecoSelecionado(null);
    setResultado(null);
    setError("");
    setInicio("");
    setFim("");
  }, [aberto]);

  async function fetchPrecos() {
    setLoading(true);
    try {
      const data = await api.precos.listar();
      setPrecos(data);
    } catch {
      setError("Erro ao carregar preços.");
    } finally {
      setLoading(false);
    }
  }

  function isNoturno(hora) {
    return hora >= 21 || hora < 6;
  }

  function formatNivel(n) {
    return n === "basico" ? "Básico" : n === "luxuoso" ? "Luxuoso" : n;
  }

  function calcularCusto() {
    setError("");
    setResultado(null);

    if (!precoSelecionado) {
      setError("Selecione um preço por minuto.");
      return;
    }
    if (!inicio || !fim) {
      setError("Preencha a hora de início e fim.");
      return;
    }

    const dInicio = new Date(inicio);
    const dFim = new Date(fim);
    if (isNaN(dInicio.getTime()) || isNaN(dFim.getTime())) {
      setError("Datas inválidas.");
      return;
    }
    if (dFim <= dInicio) {
      setError("O fim deve ser posterior ao início (restrição 1).");
      return;
    }

    const precoMin = precoSelecionado.preco_minuto;
    const acrescimo = (precoSelecionado.acrescimo_noturno || 0) / 100;

    let minutosDiurnos = 0;
    let minutosNoturnos = 0;

    const cursor = new Date(dInicio);
    while (cursor < dFim) {
      if (isNoturno(cursor.getHours())) minutosNoturnos++;
      else minutosDiurnos++;
      cursor.setMinutes(cursor.getMinutes() + 1);
    }

    const custoDiurno = minutosDiurnos * precoMin;
    const custoNoturno = minutosNoturnos * precoMin * (1 + acrescimo);
    const total = custoDiurno + custoNoturno;

    setResultado({
      totalMinutos: minutosDiurnos + minutosNoturnos,
      minutosDiurnos,
      minutosNoturnos,
      custoDiurno,
      custoNoturno,
      total,
      precoMin,
      acrescimo: precoSelecionado.acrescimo_noturno || 0,
      nivel: precoSelecionado.nivel_conforto,
    });
  }

  if (!aberto) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onFechar}
      />
      <div className="relative w-full max-w-[560px] mx-4 max-h-[90vh] overflow-y-auto rounded-2xl border border-[#00d4ff]/20 bg-[#0a1628]/95 backdrop-blur-2xl shadow-[0_32px_80px_rgba(0,0,0,0.5)] scrollbar-none">
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#00d4ff]/30 to-transparent" />

        {/* Header */}
        <div className="flex items-center justify-between p-6 pb-4 sticky top-0 bg-[#0a1628]/95 backdrop-blur-xl z-10">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-[13px] flex items-center justify-center text-white shadow-[0_4px_16px_rgba(0,0,0,0.25)]"
              style={{
                background: "linear-gradient(135deg, #00d4ff, #1a6eff)",
              }}
            >
              <Calculator size={18} strokeWidth={1.8} />
            </div>
            <div>
              <h3 className="font-['Syne',sans-serif] text-[18px] font-bold text-[#eaf0ff]">
                Simular Viagem
              </h3>
              <p className="text-[12px] text-[#4e6a8a]">
                Calcular custo de uma viagem fictícia
              </p>
            </div>
          </div>
          <button
            onClick={onFechar}
            className="w-9 h-9 rounded-xl flex items-center justify-center border border-white/[0.06] bg-white/[0.03] text-[#8ba3c7] hover:bg-red-500/10 hover:border-red-500/25 hover:text-red-400 transition-all duration-200 cursor-pointer"
          >
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
          ) : precos.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 rounded-2xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-center mx-auto mb-4">
                <DollarSign size={28} className="text-[#4e6a8a]" />
              </div>
              <p className="text-[15px] text-[#8ba3c7] font-medium mb-2">
                Nenhum preço definido
              </p>
              <p className="text-[13px] text-[#4e6a8a]">
                Defina os preços primeiro para poder simular viagens.
              </p>
            </div>
          ) : (
            <>
              {/* ── Seletor de preço da BD ── */}
              <div className="mb-5">
                <label className="block text-[11px] font-semibold text-[#8ba3c7] mb-2 uppercase tracking-wide">
                  Preço por minuto (da base de dados)
                </label>
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setDropdownOpen((v) => !v)}
                    className={`w-full flex items-center justify-between px-4 py-3.5 rounded-xl text-[14px] border outline-none transition-all duration-200 text-left ${
                      dropdownOpen
                        ? "bg-[#1a6eff]/[0.06] border-[#1a6eff]/40 shadow-[0_0_0_3px_rgba(26,110,255,0.1)]"
                        : precoSelecionado
                          ? "bg-white/[0.04] border-[#1a6eff]/25"
                          : "bg-white/[0.04] border-white/[0.08] hover:border-white/[0.15]"
                    } cursor-pointer`}
                  >
                    {precoSelecionado ? (
                      <span className="flex items-center gap-3 text-[#eaf0ff]">
                        <span
                          className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                            precoSelecionado.nivel_conforto === "basico"
                              ? "bg-[#1a6eff]/15 text-[#3d8bff]"
                              : "bg-[#c64dff]/15 text-[#c64dff]"
                          }`}
                        >
                          {formatNivel(precoSelecionado.nivel_conforto)}
                        </span>
                        <span className="font-semibold">
                          {precoSelecionado.preco_minuto.toFixed(2)}€/min
                        </span>
                        {precoSelecionado.acrescimo_noturno > 0 && (
                          <span className="text-[12px] text-[#8ba3c7]">
                            <Moon
                              size={11}
                              className="inline mr-0.5 text-[#c64dff]"
                            />
                            +{precoSelecionado.acrescimo_noturno}% noturno
                          </span>
                        )}
                      </span>
                    ) : (
                      <span className="text-[#4e6a8a]/60">
                        Selecionar preço...
                      </span>
                    )}
                    <ChevronDown
                      size={16}
                      className={`text-[#4e6a8a] transition-transform duration-200 ${dropdownOpen ? "rotate-180" : ""}`}
                    />
                  </button>

                  {dropdownOpen && (
                    <div className="absolute top-full left-0 right-0 mt-2 z-50 rounded-xl border border-[#1a6eff]/20 bg-[#0c1c38]/98 backdrop-blur-2xl shadow-[0_20px_60px_rgba(0,0,0,0.6)] overflow-hidden">
                      {precos.map((p) => (
                        <button
                          key={p._id}
                          type="button"
                          onClick={() => {
                            setPrecoSelecionado(p);
                            setDropdownOpen(false);
                            setResultado(null);
                          }}
                          className={`w-full text-left px-4 py-3.5 flex items-center gap-3 transition-colors ${
                            precoSelecionado?._id === p._id
                              ? "bg-[#1a6eff]/15 text-[#eaf0ff]"
                              : "text-[#c8d8ee] hover:bg-[#1a6eff]/10"
                          }`}
                        >
                          <span
                            className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                              p.nivel_conforto === "basico"
                                ? "bg-[#1a6eff]/15 text-[#3d8bff]"
                                : "bg-[#c64dff]/15 text-[#c64dff]"
                            }`}
                          >
                            {formatNivel(p.nivel_conforto)}
                          </span>
                          <span className="font-semibold text-[14px]">
                            {p.preco_minuto.toFixed(2)}€
                            <span className="font-normal text-[#8ba3c7]">
                              /min
                            </span>
                          </span>
                          {p.acrescimo_noturno > 0 && (
                            <span className="text-[12px] text-[#8ba3c7] ml-auto">
                              <Moon
                                size={11}
                                className="inline mr-0.5 text-[#c64dff]"
                              />
                              +{p.acrescimo_noturno}%
                            </span>
                          )}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* ── Preço selecionado — resumo ── */}
              {precoSelecionado && (
                <div className="mb-5 p-3.5 rounded-xl border border-[#1a6eff]/12 bg-[#1a6eff]/[0.03] grid grid-cols-3 gap-3 text-center">
                  <div>
                    <div className="text-[10px] uppercase tracking-wider text-[#6b8baa] mb-1">
                      Nível
                    </div>
                    <div className="text-[13px] font-semibold text-[#eaf0ff]">
                      {formatNivel(precoSelecionado.nivel_conforto)}
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center justify-center gap-1 text-[10px] uppercase tracking-wider text-[#6b8baa] mb-1">
                      <Sun size={10} className="text-[#ffb932]" />
                      Diurno
                    </div>
                    <div className="text-[13px] font-semibold text-[#eaf0ff]">
                      {precoSelecionado.preco_minuto.toFixed(2)}€/min
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center justify-center gap-1 text-[10px] uppercase tracking-wider text-[#6b8baa] mb-1">
                      <Moon size={10} className="text-[#c64dff]" />
                      Noturno
                    </div>
                    <div className="text-[13px] font-semibold text-[#c64dff]">
                      {(
                        precoSelecionado.preco_minuto *
                        (1 + (precoSelecionado.acrescimo_noturno || 0) / 100)
                      ).toFixed(2)}
                      €/min
                    </div>
                  </div>
                </div>
              )}

              {/* ── Hora início e fim ── */}
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div>
                  <label className="block text-[11px] font-semibold text-[#8ba3c7] mb-1.5 uppercase tracking-wide">
                    Início da viagem
                  </label>
                  <input
                    type="datetime-local"
                    value={inicio}
                    onChange={(e) => {
                      setInicio(e.target.value);
                      setResultado(null);
                    }}
                    className="w-full px-3 py-3 rounded-xl text-[13px] text-[#eaf0ff] bg-white/[0.04] border border-white/[0.08] outline-none focus:border-[#1a6eff]/40 focus:bg-[#1a6eff]/[0.06]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-[#8ba3c7] mb-1.5 uppercase tracking-wide">
                    Fim da viagem
                  </label>
                  <input
                    type="datetime-local"
                    value={fim}
                    onChange={(e) => {
                      setFim(e.target.value);
                      setResultado(null);
                    }}
                    className="w-full px-3 py-3 rounded-xl text-[13px] text-[#eaf0ff] bg-white/[0.04] border border-white/[0.08] outline-none focus:border-[#1a6eff]/40 focus:bg-[#1a6eff]/[0.06]"
                  />
                </div>
              </div>

              {/* Info */}
              <div className="mb-5 flex items-center gap-2 px-3 py-2.5 rounded-xl bg-white/[0.02] border border-white/[0.05] text-[12px] text-[#6b8baa]">
                <Clock size={14} className="text-[#00d4ff] shrink-0" />A viagem
                pode cruzar o período diurno e noturno, e até dias consecutivos.
              </div>

              {/* Botão calcular */}
              <button
                onClick={calcularCusto}
                className="w-full py-3.5 rounded-xl font-semibold text-[14px] text-white flex items-center justify-center gap-2 transition-all duration-200 hover:shadow-[0_8px_32px_rgba(0,212,255,0.3)] hover:-translate-y-0.5 cursor-pointer mb-5"
                style={{
                  background: "linear-gradient(135deg, #00d4ff, #1a6eff)",
                }}
              >
                <Calculator size={16} /> Calcular Custo
              </button>

              {/* Resultado */}
              {resultado && (
                <div className="rounded-2xl border border-[#00d4ff]/20 bg-[#00d4ff]/[0.04] p-5 animate-[fadeUp_0.3s_ease_both]">
                  <div className="text-center mb-4">
                    <div className="text-[11px] uppercase tracking-wider text-[#6b8baa] mb-1">
                      Custo total da viagem
                    </div>
                    <div className="font-['Syne',sans-serif] text-[36px] font-extrabold text-[#00d4ff]">
                      {resultado.total.toFixed(2)}€
                    </div>
                    <div className="text-[12px] text-[#8ba3c7] mt-1">
                      {resultado.totalMinutos} minutos ·{" "}
                      {formatNivel(resultado.nivel)} · {resultado.precoMin}€/min
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 rounded-xl bg-white/[0.04] border border-white/[0.06] text-center">
                      <div className="flex items-center justify-center gap-1.5 mb-1.5">
                        <Sun size={13} className="text-[#ffb932]" />
                        <span className="text-[10px] uppercase tracking-wider text-[#6b8baa] font-semibold">
                          Diurno
                        </span>
                      </div>
                      <div className="font-['Syne',sans-serif] text-[18px] font-bold text-[#eaf0ff]">
                        {resultado.custoDiurno.toFixed(2)}€
                      </div>
                      <div className="text-[11px] text-[#6b8baa] mt-0.5">
                        {resultado.minutosDiurnos} min × {resultado.precoMin}€
                      </div>
                    </div>
                    <div className="p-3 rounded-xl bg-[#c64dff]/[0.06] border border-[#c64dff]/15 text-center">
                      <div className="flex items-center justify-center gap-1.5 mb-1.5">
                        <Moon size={13} className="text-[#c64dff]" />
                        <span className="text-[10px] uppercase tracking-wider text-[#6b8baa] font-semibold">
                          Noturno
                        </span>
                      </div>
                      <div className="font-['Syne',sans-serif] text-[18px] font-bold text-[#c64dff]">
                        {resultado.custoNoturno.toFixed(2)}€
                      </div>
                      <div className="text-[11px] text-[#6b8baa] mt-0.5">
                        {resultado.minutosNoturnos} min × {resultado.precoMin}€
                        × {(1 + resultado.acrescimo / 100).toFixed(2)}
                      </div>
                    </div>
                  </div>
                  {resultado.acrescimo > 0 && (
                    <div className="mt-3 text-center text-[11px] text-[#8ba3c7]">
                      <Moon size={12} className="inline mr-1 text-[#c64dff]" />
                      Acréscimo noturno de {resultado.acrescimo}% aplicado entre
                      21:00 e 06:00
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>
        <style>{`.scrollbar-none::-webkit-scrollbar{display:none}.scrollbar-none{scrollbar-width:none}@keyframes fadeUp{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}`}</style>
      </div>
    </div>
  );
}

/* ── Card de preço individual ── */
function PrecoCard({ nivel, cor, corBg, corBorder, dados }) {
  if (!dados) {
    return (
      <div className="p-4 rounded-xl border border-white/[0.06] bg-white/[0.02]">
        <div className="flex items-center gap-2 mb-2">
          <span
            className="px-2.5 py-1 rounded-lg text-[11px] font-bold uppercase tracking-wider"
            style={{
              background: corBg,
              color: cor,
              border: `1px solid ${corBorder}`,
            }}
          >
            {nivel}
          </span>
        </div>
        <p className="text-[13px] text-[#4e6a8a]">Preço não definido</p>
      </div>
    );
  }
  const precoNoturno =
    dados.preco_minuto * (1 + (dados.acrescimo_noturno || 0) / 100);
  return (
    <div
      className="p-5 rounded-xl border"
      style={{ borderColor: corBorder, background: corBg }}
    >
      <div className="flex items-center justify-between mb-4">
        <span
          className="px-2.5 py-1 rounded-lg text-[11px] font-bold uppercase tracking-wider"
          style={{ background: `${cor}22`, color: cor }}
        >
          {nivel}
        </span>
      </div>
      <div className="grid grid-cols-2 gap-3 mb-3">
        <div className="p-3 rounded-xl bg-white/[0.04] border border-white/[0.06] text-center">
          <div className="flex items-center justify-center gap-1.5 mb-1.5">
            <Sun size={13} className="text-[#ffb932]" />
            <span className="text-[10px] uppercase tracking-wider text-[#6b8baa] font-semibold">
              Diurno
            </span>
          </div>
          <div className="font-['Syne',sans-serif] text-[22px] font-extrabold text-[#eaf0ff]">
            {dados.preco_minuto.toFixed(2)}€
          </div>
          <div className="text-[11px] text-[#6b8baa] mt-0.5">por minuto</div>
        </div>
        <div className="p-3 rounded-xl bg-[#c64dff]/[0.06] border border-[#c64dff]/15 text-center">
          <div className="flex items-center justify-center gap-1.5 mb-1.5">
            <Moon size={13} className="text-[#c64dff]" />
            <span className="text-[10px] uppercase tracking-wider text-[#6b8baa] font-semibold">
              Noturno
            </span>
          </div>
          <div className="font-['Syne',sans-serif] text-[22px] font-extrabold text-[#c64dff]">
            {precoNoturno.toFixed(2)}€
          </div>
          <div className="text-[11px] text-[#6b8baa] mt-0.5">por minuto</div>
        </div>
      </div>
      {dados.acrescimo_noturno > 0 && (
        <div className="text-center text-[11px] text-[#8ba3c7]">
          <Moon size={11} className="inline mr-1 text-[#c64dff]" />
          Acréscimo noturno: +{dados.acrescimo_noturno}%
        </div>
      )}
    </div>
  );
}
