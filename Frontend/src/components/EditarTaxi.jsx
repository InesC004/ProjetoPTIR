/* eslint-disable react/prop-types */
import { useState, useEffect, useRef } from "react";
import api from "../Api";
import {
  Car,
  X,
  Zap,
  Flame,
  Crown,
  Star,
  ChevronDown,
  AlertCircle,
  Check,
  Loader2,
  CheckCircle2,
  Pencil,
  ArrowLeft,
  Search,
} from "lucide-react";

/* ═══════════════════════════════════════════════
   MARCAS E MODELOS
   ═══════════════════════════════════════════════ */
const MARCAS_MODELOS = {
  Mercedes: [
    "Classe A",
    "Classe B",
    "Classe C",
    "Classe E",
    "Classe S",
    "EQA",
    "EQB",
    "EQC",
    "EQE",
    "EQS",
    "Vito",
  ],
  BMW: [
    "Série 1",
    "Série 3",
    "Série 5",
    "Série 7",
    "X1",
    "X3",
    "iX1",
    "iX3",
    "i4",
    "i5",
    "i7",
  ],
  Audi: [
    "A3",
    "A4",
    "A6",
    "A8",
    "Q3",
    "Q5",
    "Q7",
    "e-tron",
    "Q4 e-tron",
    "Q8 e-tron",
  ],
  Volkswagen: [
    "Golf",
    "Passat",
    "Arteon",
    "Touran",
    "ID.3",
    "ID.4",
    "ID.5",
    "ID.7",
  ],
  Toyota: [
    "Corolla",
    "Camry",
    "Prius",
    "Yaris",
    "RAV4",
    "bZ4X",
    "Proace City",
    "Proace Verso",
  ],
  Renault: [
    "Clio",
    "Mégane",
    "Talisman",
    "Captur",
    "Mégane E-Tech",
    "Scenic E-Tech",
    "Zoe",
  ],
  Peugeot: ["208", "308", "508", "2008", "3008", "e-208", "e-308", "e-2008"],
  Tesla: ["Model 3", "Model S", "Model X", "Model Y"],
  Nissan: ["Leaf", "Qashqai", "X-Trail", "Ariya", "Townstar"],
  Hyundai: [
    "i20",
    "i30",
    "Tucson",
    "Ioniq 5",
    "Ioniq 6",
    "Kona",
    "Kona Electric",
  ],
  Kia: ["Ceed", "Sportage", "Niro", "EV6", "EV9", "Stonic"],
  Skoda: ["Octavia", "Superb", "Kamiq", "Karoq", "Enyaq iV"],
  SEAT: ["Ibiza", "León", "Ateca", "Tarraco"],
  Citroën: ["C3", "C4", "C5 X", "ë-C4", "ë-Berlingo"],
  Fiat: ["500", "Tipo", "500e", "Panda"],
  Volvo: ["S60", "S90", "XC40", "XC60", "XC90", "EX30", "EX90", "C40 Recharge"],
  Dacia: ["Sandero", "Duster", "Jogger", "Spring"],
};
const MARCAS = Object.keys(MARCAS_MODELOS).sort();

/* ═══════════════════════════════════════════════
   VALIDAÇÃO DE MATRÍCULA
   ═══════════════════════════════════════════════ */
function validarMatricula(valor) {
  const limpo = valor.toUpperCase().replace(/[^A-Z0-9]/g, "");
  if (limpo.length !== 6) return false;
  const g1 = limpo.slice(0, 2),
    g2 = limpo.slice(2, 4),
    g3 = limpo.slice(4, 6);
  const isL = (s) => /^[A-Z]{2}$/.test(s);
  const isD = (s) => /^[0-9]{2}$/.test(s);
  return (
    (isL(g1) && isD(g2) && isD(g3)) ||
    (isD(g1) && isD(g2) && isL(g3)) ||
    (isD(g1) && isL(g2) && isD(g3)) ||
    (isL(g1) && isD(g2) && isL(g3))
  );
}

function formatarMatricula(valor) {
  const limpo = valor
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, "")
    .slice(0, 6);
  if (limpo.length <= 2) return limpo;
  if (limpo.length <= 4) return limpo.slice(0, 2) + "-" + limpo.slice(2);
  return limpo.slice(0, 2) + "-" + limpo.slice(2, 4) + "-" + limpo.slice(4);
}

/* ═══════════════════════════════════════════════
   ESTADO BADGES
   ═══════════════════════════════════════════════ */
const ESTADO_CORES = {
  livre: {
    bg: "bg-[#00e887]/10",
    border: "border-[#00e887]/25",
    text: "text-[#00e887]",
    dot: "bg-[#00e887]",
  },
  em_uso: {
    bg: "bg-[#ff8c42]/10",
    border: "border-[#ff8c42]/25",
    text: "text-[#ff8c42]",
    dot: "bg-[#ff8c42]",
  },
  em_reabastecimento: {
    bg: "bg-[#00d4ff]/10",
    border: "border-[#00d4ff]/25",
    text: "text-[#00d4ff]",
    dot: "bg-[#00d4ff]",
  },
};
const ESTADO_LABELS = {
  livre: "Livre",
  em_uso: "Em uso",
  em_reabastecimento: "Reabastecimento",
};

/* ═══════════════════════════════════════════════
   CUSTOM DROPDOWN
   ═══════════════════════════════════════════════ */
function Dropdown({
  label,
  placeholder,
  value,
  onChange,
  options,
  disabled,
  error,
}) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const ref = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    function handler(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  useEffect(() => {
    if (open && inputRef.current) inputRef.current.focus();
  }, [open]);

  const filtered = options.filter((o) =>
    o.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div ref={ref} className="relative">
      <label className="block text-[12px] font-semibold text-[#8ba3c7] mb-2 tracking-wide uppercase">
        {label}
      </label>
      <button
        type="button"
        onClick={() => {
          if (!disabled) setOpen(!open);
        }}
        className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-[14px] border outline-none transition-all duration-200 text-left ${
          disabled
            ? "bg-white/[0.02] border-white/[0.05] text-[#4e6a8a]/40 cursor-not-allowed"
            : open
              ? "bg-[#1a6eff]/[0.06] border-[#1a6eff]/40 shadow-[0_0_0_3px_rgba(26,110,255,0.1)]"
              : error
                ? "bg-red-500/[0.04] border-red-500/40 cursor-pointer"
                : "bg-white/[0.04] border-white/[0.08] cursor-pointer hover:border-white/[0.15]"
        }`}
      >
        <span className={value ? "text-[#eaf0ff]" : "text-[#4e6a8a]/60"}>
          {value || placeholder}
        </span>
        <ChevronDown
          size={14}
          className={`text-[#4e6a8a] transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        />
      </button>
      {open && (
        <div className="absolute top-full left-0 right-0 mt-2 z-50 rounded-xl border border-[#1a6eff]/20 bg-[#0c1c38]/98 backdrop-blur-2xl shadow-[0_20px_60px_rgba(0,0,0,0.6)] overflow-hidden animate-[dropIn_0.15s_ease]">
          {options.length > 5 && (
            <div className="p-2 border-b border-white/[0.04]">
              <input
                ref={inputRef}
                type="text"
                placeholder="Pesquisar..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full px-3 py-2 rounded-lg text-[13px] text-[#eaf0ff] placeholder-[#4e6a8a]/50 bg-white/[0.04] border border-white/[0.06] outline-none focus:border-[#1a6eff]/30"
              />
            </div>
          )}
          <div className="max-h-[200px] overflow-y-auto scrollbar-none">
            {filtered.length === 0 ? (
              <div className="px-4 py-3 text-[13px] text-[#4e6a8a]">
                Nenhum resultado
              </div>
            ) : (
              filtered.map((opt) => (
                <button
                  key={opt}
                  type="button"
                  onClick={() => {
                    onChange(opt);
                    setOpen(false);
                    setSearch("");
                  }}
                  className={`w-full flex items-center justify-between px-4 py-2.5 text-[13px] text-left transition-all duration-150 cursor-pointer ${opt === value ? "bg-[#1a6eff]/10 text-[#3d8bff] font-semibold" : "text-[#eaf0ff] hover:bg-white/[0.04]"}`}
                >
                  {opt}
                  {opt === value && (
                    <Check
                      size={14}
                      strokeWidth={2.5}
                      className="text-[#3d8bff]"
                    />
                  )}
                </button>
              ))
            )}
          </div>
        </div>
      )}
      {error && (
        <p className="text-[11px] text-red-400 mt-1.5 pl-1 flex items-center gap-1">
          <AlertCircle size={12} /> {error}
        </p>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════
   COMPONENTE PRINCIPAL
   ═══════════════════════════════════════════════ */
export default function EditarTaxi({ aberto, onFechar }) {
  const [taxis, setTaxis] = useState([]);
  const [loadingList, setLoadingList] = useState(false);
  const [listError, setListError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  // Edição
  const [editing, setEditing] = useState(null); // taxi object ou null
  const [form, setForm] = useState({});
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [apiError, setApiError] = useState("");
  const [success, setSuccess] = useState(false);

  // Buscar táxis ao abrir
  useEffect(() => {
    if (!aberto) return;
    fetchTaxis();
  }, [aberto]);

  async function fetchTaxis() {
    setLoadingList(true);
    setListError("");
    try {
      const data = await api.taxis.listar();
      setTaxis(data);
    } catch {
      setListError("Erro ao carregar táxis.");
    } finally {
      setLoadingList(false);
    }
  }

  function startEdit(taxi) {
    setEditing(taxi);
    setForm({
      matricula: taxi.matricula || "",
      marca: taxi.marca || "",
      modelo: taxi.modelo || "",
      ano_compra: taxi.ano_compra?.toString() || "",
      tipo_motor: taxi.tipo_motor || "",
      nivel_conforto: taxi.nivel_conforto || "",
    });
    setErrors({});
    setApiError("");
    setSuccess(false);
  }

  function cancelEdit() {
    setEditing(null);
    setForm({});
    setErrors({});
    setApiError("");
    setSuccess(false);
  }

  if (!aberto) return null;

  const anoAtual = new Date().getFullYear();
  const modelosDisponiveis = form.marca ? MARCAS_MODELOS[form.marca] || [] : [];
  const disabled = saving || success;

  function handleChange(campo, valor) {
    setForm((prev) => {
      const novo = { ...prev, [campo]: valor };
      if (campo === "marca") novo.modelo = "";
      return novo;
    });
    if (errors[campo]) setErrors((prev) => ({ ...prev, [campo]: null }));
    if (apiError) setApiError("");
  }

  function handleMatriculaChange(valor) {
    const formatado = formatarMatricula(valor);
    setForm((prev) => ({ ...prev, matricula: formatado }));
    if (errors.matricula) setErrors((prev) => ({ ...prev, matricula: null }));
  }

  function validar() {
    const errs = {};
    if (!form.matricula.trim()) errs.matricula = "Matrícula obrigatória";
    else if (!validarMatricula(form.matricula))
      errs.matricula = "Formato inválido";
    if (!form.marca) errs.marca = "Selecione a marca";
    if (!form.modelo) errs.modelo = "Selecione o modelo";
    if (!form.ano_compra) errs.ano_compra = "Ano obrigatório";
    else {
      const ano = parseInt(form.ano_compra, 10);
      if (isNaN(ano) || ano < 1990 || ano > anoAtual)
        errs.ano_compra = `Entre 1990 e ${anoAtual}`;
    }
    if (!form.tipo_motor) errs.tipo_motor = "Selecione o tipo";
    if (!form.nivel_conforto) errs.nivel_conforto = "Selecione o nível";
    return errs;
  }

  async function handleSave() {
    const errs = validar();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }

    setSaving(true);
    setApiError("");

    try {
      const data = await api.taxis.atualizar(editing._id, {
        matricula: form.matricula.toUpperCase(),
        marca: form.marca,
        modelo: form.modelo,
        ano_compra: parseInt(form.ano_compra, 10),
        tipo_motor: form.tipo_motor,
        nivel_conforto: form.nivel_conforto,
      });
      setSuccess(true);
      setTaxis((prev) => prev.map((t) => (t._id === editing._id ? data : t)));
      setTimeout(() => {
        setSuccess(false);
        cancelEdit();
      }, 1500);
    } catch {
      setApiError("Não foi possível conectar ao servidor.");
    } finally {
      setSaving(false);
    }
  }

  // Filtrar táxis
  const filtered = taxis.filter((t) => {
    const term = searchTerm.toLowerCase();
    return (
      t.matricula?.toLowerCase().includes(term) ||
      t.marca?.toLowerCase().includes(term) ||
      t.modelo?.toLowerCase().includes(term)
    );
  });

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onFechar}
      />

      <div className="relative w-full max-w-[620px] mx-4 max-h-[90vh] overflow-y-auto rounded-2xl border border-[#1a6eff]/20 bg-[#0a1628]/95 backdrop-blur-2xl shadow-[0_32px_80px_rgba(0,0,0,0.5)] animate-[modalIn_0.3s_ease] scrollbar-none">
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#1a6eff]/30 to-transparent" />

        {/* Header */}
        <div className="flex items-center justify-between p-6 pb-4 sticky top-0 bg-[#0a1628]/95 backdrop-blur-xl z-10">
          <div className="flex items-center gap-3">
            {editing && (
              <button
                onClick={cancelEdit}
                className="w-9 h-9 rounded-xl flex items-center justify-center border border-white/[0.06] bg-white/[0.03] text-[#8ba3c7] hover:bg-white/[0.06] hover:text-[#eaf0ff] transition-all duration-200 cursor-pointer mr-1"
              >
                <ArrowLeft size={16} strokeWidth={2} />
              </button>
            )}
            <div
              className="w-10 h-10 rounded-[13px] flex items-center justify-center text-white shadow-[0_4px_16px_rgba(0,0,0,0.25)]"
              style={{
                background: editing
                  ? "linear-gradient(135deg, #ff8c42, #cc6620)"
                  : "linear-gradient(135deg, #1a6eff, #0052cc)",
              }}
            >
              {editing ? (
                <Pencil size={18} strokeWidth={1.8} />
              ) : (
                <Car size={18} strokeWidth={1.8} />
              )}
            </div>
            <div>
              <h3 className="font-['Syne',sans-serif] text-[18px] font-bold text-[#eaf0ff]">
                {editing ? "Editar Táxi" : "Editar Táxis"}
              </h3>
              <p className="text-[12px] text-[#4e6a8a]">
                {editing
                  ? editing.matricula
                  : `${taxis.length} táxi${taxis.length !== 1 ? "s" : ""} na frota`}
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

        {/* Mensagens */}
        <div className="px-6">
          {success && (
            <div className="mb-4 px-4 py-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-sm flex items-center gap-2">
              <CheckCircle2 size={16} /> Táxi atualizado com sucesso!
            </div>
          )}
          {(apiError || listError) && (
            <div className="mb-4 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm flex items-center gap-2">
              <AlertCircle size={16} /> {apiError || listError}
            </div>
          )}
        </div>

        {/* ═══ LISTA DE TÁXIS ═══ */}
        {!editing ? (
          <div className="px-6 pb-6">
            {/* Search */}
            <div className="relative mb-4">
              <Search
                size={14}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#4e6a8a]"
              />
              <input
                type="text"
                placeholder="Pesquisar por matrícula, marca ou modelo..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-xl text-[13px] text-[#eaf0ff] placeholder-[#4e6a8a]/50 bg-white/[0.04] border border-white/[0.08] outline-none focus:border-[#1a6eff]/40 focus:shadow-[0_0_0_3px_rgba(26,110,255,0.1)] transition-all duration-200"
              />
            </div>

            {loadingList ? (
              <div className="flex items-center justify-center py-12 text-[#4e6a8a] gap-2">
                <Loader2 size={18} className="animate-spin" /> A carregar
                táxis...
              </div>
            ) : filtered.length === 0 ? (
              <div className="text-center py-12 text-[#4e6a8a] text-[14px]">
                {searchTerm
                  ? "Nenhum táxi encontrado."
                  : "Nenhum táxi registado."}
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                {filtered.map((taxi) => {
                  const est = ESTADO_CORES[taxi.estado] || ESTADO_CORES.livre;
                  return (
                    <button
                      key={taxi._id}
                      onClick={() => startEdit(taxi)}
                      className="group w-full flex items-center justify-between p-4 rounded-xl border border-white/[0.04] bg-white/[0.02] hover:bg-[#1a6eff]/[0.06] hover:border-[#1a6eff]/20 transition-all duration-200 text-left cursor-pointer"
                    >
                      <div className="flex items-center gap-3.5">
                        <div className="w-10 h-10 rounded-xl bg-white/[0.04] border border-white/[0.06] flex items-center justify-center text-[#8ba3c7] group-hover:bg-[#1a6eff]/10 group-hover:text-[#3d8bff] group-hover:border-[#1a6eff]/20 transition-all duration-200">
                          <Car size={18} strokeWidth={1.6} />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-[14px] font-semibold text-[#eaf0ff] tracking-wider">
                              {taxi.matricula}
                            </span>
                            <span
                              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold ${est.bg} ${est.border} ${est.text} border`}
                            >
                              <span
                                className={`w-1 h-1 rounded-full ${est.dot}`}
                              />
                              {ESTADO_LABELS[taxi.estado] || taxi.estado}
                            </span>
                          </div>
                          <p className="text-[12px] text-[#4e6a8a] mt-0.5">
                            {taxi.marca} {taxi.modelo} · {taxi.ano_compra} ·{" "}
                            {taxi.tipo_motor === "eletrico"
                              ? "Elétrico"
                              : "Combustão"}{" "}
                            ·{" "}
                            {taxi.nivel_conforto === "luxuoso"
                              ? "Luxuoso"
                              : "Básico"}
                          </p>
                        </div>
                      </div>
                      <Pencil
                        size={14}
                        className="text-[#4e6a8a] group-hover:text-[#3d8bff] transition-all duration-200"
                      />
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        ) : (
          /* ═══ FORMULÁRIO DE EDIÇÃO ═══ */
          <div className="px-6 pb-2 space-y-5">
            {/* Matrícula */}
            <div>
              <label className="block text-[12px] font-semibold text-[#8ba3c7] mb-2 tracking-wide uppercase">
                Matrícula
              </label>
              <input
                type="text"
                value={form.matricula}
                onChange={(e) => handleMatriculaChange(e.target.value)}
                maxLength={8}
                disabled={disabled}
                className={`w-full px-4 py-3 rounded-xl text-[14px] text-[#eaf0ff] placeholder-[#4e6a8a]/60 bg-white/[0.04] border outline-none transition-all duration-200 uppercase tracking-widest font-semibold focus:bg-[#1a6eff]/[0.06] focus:border-[#1a6eff]/40 focus:shadow-[0_0_0_3px_rgba(26,110,255,0.1)] disabled:opacity-50 disabled:cursor-not-allowed ${errors.matricula ? "border-red-500/40" : "border-white/[0.08]"}`}
              />
              {errors.matricula && (
                <p className="text-[11px] text-red-400 mt-1 pl-1 flex items-center gap-1">
                  <AlertCircle size={12} /> {errors.matricula}
                </p>
              )}
            </div>

            {/* Marca + Modelo */}
            <div className="grid grid-cols-2 gap-3">
              <Dropdown
                label="Marca"
                placeholder="Selecionar"
                value={form.marca}
                onChange={(v) => handleChange("marca", v)}
                options={MARCAS}
                disabled={disabled}
                error={errors.marca}
              />
              <Dropdown
                label="Modelo"
                placeholder={form.marca ? "Selecionar" : "Escolha marca"}
                value={form.modelo}
                onChange={(v) => handleChange("modelo", v)}
                options={modelosDisponiveis}
                disabled={!form.marca || disabled}
                error={errors.modelo}
              />
            </div>

            {/* Ano */}
            <div>
              <label className="block text-[12px] font-semibold text-[#8ba3c7] mb-2 tracking-wide uppercase">
                Ano de compra
              </label>
              <input
                type="number"
                value={form.ano_compra}
                onChange={(e) => handleChange("ano_compra", e.target.value)}
                min={1990}
                max={anoAtual}
                disabled={disabled}
                className={`w-full px-4 py-3 rounded-xl text-[14px] text-[#eaf0ff] placeholder-[#4e6a8a]/60 bg-white/[0.04] border outline-none transition-all duration-200 focus:bg-[#1a6eff]/[0.06] focus:border-[#1a6eff]/40 disabled:opacity-50 disabled:cursor-not-allowed ${errors.ano_compra ? "border-red-500/40" : "border-white/[0.08]"}`}
              />
              {errors.ano_compra && (
                <p className="text-[11px] text-red-400 mt-1.5 pl-1 flex items-center gap-1">
                  <AlertCircle size={12} /> {errors.ano_compra}
                </p>
              )}
            </div>

            {/* Tipo motor */}
            <div>
              <label className="block text-[12px] font-semibold text-[#8ba3c7] mb-2 tracking-wide uppercase">
                Tipo de motor
              </label>
              <div className="grid grid-cols-2 gap-3">
                <OptionCard
                  icon={<Flame size={18} strokeWidth={1.8} />}
                  label="Combustão"
                  selected={form.tipo_motor === "combustao"}
                  onClick={() =>
                    !disabled && handleChange("tipo_motor", "combustao")
                  }
                  color="#ff8c42"
                  disabled={disabled}
                />
                <OptionCard
                  icon={<Zap size={18} strokeWidth={1.8} />}
                  label="Elétrico"
                  selected={form.tipo_motor === "eletrico"}
                  onClick={() =>
                    !disabled && handleChange("tipo_motor", "eletrico")
                  }
                  color="#00d4ff"
                  disabled={disabled}
                />
              </div>
              {errors.tipo_motor && (
                <p className="text-[11px] text-red-400 mt-1.5 pl-1 flex items-center gap-1">
                  <AlertCircle size={12} /> {errors.tipo_motor}
                </p>
              )}
            </div>

            {/* Nível conforto */}
            <div>
              <label className="block text-[12px] font-semibold text-[#8ba3c7] mb-2 tracking-wide uppercase">
                Nível de conforto
              </label>
              <div className="grid grid-cols-2 gap-3">
                <OptionCard
                  icon={<Star size={18} strokeWidth={1.8} />}
                  label="Básico"
                  selected={form.nivel_conforto === "basico"}
                  onClick={() =>
                    !disabled && handleChange("nivel_conforto", "basico")
                  }
                  color="#3d8bff"
                  disabled={disabled}
                />
                <OptionCard
                  icon={<Crown size={18} strokeWidth={1.8} />}
                  label="Luxuoso"
                  selected={form.nivel_conforto === "luxuoso"}
                  onClick={() =>
                    !disabled && handleChange("nivel_conforto", "luxuoso")
                  }
                  color="#c64dff"
                  disabled={disabled}
                />
              </div>
              {errors.nivel_conforto && (
                <p className="text-[11px] text-red-400 mt-1.5 pl-1 flex items-center gap-1">
                  <AlertCircle size={12} /> {errors.nivel_conforto}
                </p>
              )}
            </div>
          </div>
        )}

        {/* Footer (só na edição) */}
        {editing && (
          <div className="flex items-center justify-between p-6 pt-4 mt-2 border-t border-white/[0.04] sticky bottom-0 bg-[#0a1628]/95 backdrop-blur-xl">
            <p className="text-[11px] text-[#4e6a8a]">
              Estado:{" "}
              <span
                className={`font-semibold ${(ESTADO_CORES[editing.estado] || ESTADO_CORES.livre).text}`}
              >
                {ESTADO_LABELS[editing.estado] || editing.estado}
              </span>
            </p>
            <div className="flex gap-3">
              <button
                onClick={cancelEdit}
                disabled={saving}
                className="px-5 py-2.5 rounded-xl border border-white/[0.08] bg-white/[0.03] text-[13px] font-medium text-[#8ba3c7] hover:bg-white/[0.06] hover:text-[#eaf0ff] transition-all duration-200 cursor-pointer disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                onClick={handleSave}
                disabled={disabled}
                className="px-6 py-2.5 rounded-xl border-none text-[13px] font-semibold text-white cursor-pointer transition-all duration-200 hover:shadow-[0_8px_32px_rgba(255,140,66,0.4)] hover:-translate-y-0.5 disabled:opacity-60 disabled:cursor-not-allowed flex items-center gap-2"
                style={{
                  background:
                    "linear-gradient(135deg, #ff8c42 0%, #cc6620 100%)",
                }}
              >
                {saving ? (
                  <>
                    <Loader2 size={15} className="animate-spin" /> A guardar...
                  </>
                ) : success ? (
                  <>
                    <CheckCircle2 size={15} /> Guardado!
                  </>
                ) : (
                  "Guardar Alterações"
                )}
              </button>
            </div>
          </div>
        )}
      </div>

      <style>{`
        @keyframes modalIn { from { opacity: 0; transform: scale(0.95) translateY(10px); } to { opacity: 1; transform: scale(1) translateY(0); } }
        @keyframes dropIn { from { opacity: 0; transform: translateY(-4px); } to { opacity: 1; transform: translateY(0); } }
        .scrollbar-none::-webkit-scrollbar { display: none; }
        .scrollbar-none { scrollbar-width: none; }
      `}</style>
    </div>
  );
}

/* ═══════════════════════════════════════════════
   OPTION CARD
   ═══════════════════════════════════════════════ */
function OptionCard({ icon, label, selected, onClick, color, disabled }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`flex items-center gap-3 p-3.5 rounded-xl border text-[13.5px] font-medium transition-all duration-200 cursor-pointer text-left w-full disabled:opacity-50 disabled:cursor-not-allowed ${
        selected
          ? "text-[#eaf0ff]"
          : "border-white/[0.06] bg-white/[0.02] text-[#8ba3c7] hover:border-white/[0.12] hover:bg-white/[0.04]"
      }`}
      style={
        selected
          ? {
              borderColor: `${color}44`,
              background: `${color}18`,
              boxShadow: `0 0 20px ${color}15`,
            }
          : {}
      }
    >
      <span
        className="w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-200"
        style={
          selected
            ? { background: `${color}25`, color }
            : { background: "rgba(255,255,255,0.04)", color: "#8ba3c7" }
        }
      >
        {icon}
      </span>
      {label}
      {selected && (
        <span
          className="ml-auto w-2 h-2 rounded-full"
          style={{ background: color, boxShadow: `0 0 8px ${color}` }}
        />
      )}
    </button>
  );
}
