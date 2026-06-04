/* eslint-disable react/prop-types */
import { useState, useRef, useEffect } from "react";
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
} from "lucide-react";
import "../css/RegistarTaxi.css";
/* ═══════════════════════════════════════════════
   VALIDAÇÃO DE MATRÍCULA PORTUGUESA
   ═══════════════════════════════════════════════ */
function validarMatricula(valor) {
  const limpo = valor.toUpperCase().replace(/[^A-Z0-9]/g, "");

  if (limpo.length !== 6) return false;

  const g1 = limpo.slice(0, 2);
  const g2 = limpo.slice(2, 4);
  const g3 = limpo.slice(4, 6);

  const isL = (s) => /^[A-Z]{2}$/.test(s);
  const isD = (s) => /^[0-9]{2}$/.test(s);

  if (isL(g1) && isD(g2) && isD(g3)) return true;
  if (isD(g1) && isD(g2) && isL(g3)) return true;
  if (isD(g1) && isL(g2) && isD(g3)) return true;
  if (isL(g1) && isD(g2) && isL(g3)) return true;

  return false;
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

  const safeOptions = Array.isArray(options) ? options : [];

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

  const filtered = safeOptions.filter((o) =>
    String(o).toLowerCase().includes(search.toLowerCase()),
  );

  function handleSelect(opt) {
    onChange(opt);
    setOpen(false);
    setSearch("");
  }

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
          className={`text-[#4e6a8a] transition-transform duration-200 ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>

      {open && (
        <div className="absolute top-full left-0 right-0 mt-2 z-50 rounded-xl border border-[#1a6eff]/20 bg-[#0c1c38]/98 backdrop-blur-2xl shadow-[0_20px_60px_rgba(0,0,0,0.6)] overflow-hidden animate-[dropIn_0.15s_ease]">
          {safeOptions.length > 5 && (
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
                  onClick={() => handleSelect(opt)}
                  className={`w-full flex items-center justify-between px-4 py-2.5 text-[13px] text-left transition-all duration-150 cursor-pointer ${
                    opt === value
                      ? "bg-[#1a6eff]/10 text-[#3d8bff] font-semibold"
                      : "text-[#eaf0ff] hover:bg-white/[0.04]"
                  }`}
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
export default function RegistarTaxi({ aberto, onFechar }) {
  const [form, setForm] = useState({
    matricula: "",
    marca: "",
    modelo: "",
    ano_compra: "",
    tipo_motor: "",
    nivel_conforto: "",
  });

  const [marcas, setMarcas] = useState([]);
  const [modelosDisponiveis, setModelosDisponiveis] = useState([]);

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [loadingMarcas, setLoadingMarcas] = useState(false);
  const [loadingModelos, setLoadingModelos] = useState(false);
  const [apiError, setApiError] = useState("");
  const [success, setSuccess] = useState(false);

  const anoAtual = new Date().getFullYear();

  useEffect(() => {
    async function carregarMarcas() {
      setLoadingMarcas(true);

      try {
        const data = await api.modelosTaxi.listarMarcas();
        setMarcas(data);
      } catch (err) {
        console.error(err);
        setApiError("Erro ao carregar marcas.");
      } finally {
        setLoadingMarcas(false);
      }
    }

    if (aberto) carregarMarcas();
  }, [aberto]);

  async function carregarModelos(marca) {
    setLoadingModelos(true);
    setModelosDisponiveis([]);

    try {
      const data = await api.modelosTaxi.listarModelosPorMarca(marca);

      // Guarda o objeto completo, porque também precisamos do tipo_motor
      // que vem da base de dados para o modelo escolhido.
      setModelosDisponiveis(data);
    } catch (err) {
      console.error(err);
      setApiError("Erro ao carregar modelos.");
    } finally {
      setLoadingModelos(false);
    }
  }

  if (!aberto) return null;

  function handleChange(campo, valor) {
    setForm((prev) => {
      const novo = { ...prev, [campo]: valor };

      if (campo === "marca") {
        novo.modelo = "";
        novo.ano_compra = "";
        novo.tipo_motor = "";
        novo.nivel_conforto = "";
        carregarModelos(valor);
      }

      if (campo === "modelo") {
        novo.ano_compra = "";

        const modeloEscolhido = modelosDisponiveis.find(
          (m) => m.modelo === valor,
        );

        if (modeloEscolhido) {
          novo.tipo_motor = modeloEscolhido.tipo_motor;
          novo.nivel_conforto = modeloEscolhido.nivel_conforto;
        }
      }
      return novo;
    });

    if (errors[campo]) {
      setErrors((prev) => ({
        ...prev,
        [campo]: null,
      }));
    }

    if (apiError) setApiError("");
  }

  function handleMatriculaChange(valor) {
    const formatado = formatarMatricula(valor);

    setForm((prev) => ({
      ...prev,
      matricula: formatado,
    }));

    if (errors.matricula) {
      setErrors((prev) => ({
        ...prev,
        matricula: null,
      }));
    }

    if (apiError) setApiError("");
  }

  function validar() {
    const errs = {};

    if (!form.matricula.trim()) {
      errs.matricula = "Matrícula obrigatória";
    } else if (!validarMatricula(form.matricula)) {
      errs.matricula =
        "Formato inválido. Use: AA-00-00, 00-00-AA, 00-AA-00 ou AA-00-AA";
    }

    if (!form.marca) errs.marca = "Selecione a marca";
    if (!form.modelo) errs.modelo = "Selecione o modelo";

    if (!form.ano_compra) {
      errs.ano_compra = "Ano obrigatório";
    } else {
      const ano = parseInt(form.ano_compra, 10);

      if (isNaN(ano) || ano < 1990 || ano > anoAtual) {
        errs.ano_compra = `O ano deve estar entre 1990 e ${anoAtual}`;
      }
    }

    if (!form.tipo_motor) {
      errs.tipo_motor = "O tipo de motor não foi encontrado para este modelo";
    }
    if (!form.nivel_conforto) {
      errs.nivel_conforto =
        "O nível de conforto não foi encontrado para este modelo";
    }

    return errs;
  }

  async function handleSubmit() {
    const errs = validar();

    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }

    setLoading(true);
    setApiError("");

    const novoTaxi = {
      matricula: form.matricula.toUpperCase(),
      marca: form.marca,
      modelo: form.modelo,
      ano_compra: parseInt(form.ano_compra, 10),
      tipo_motor: form.tipo_motor,
      nivel_conforto: form.nivel_conforto,
      estado: "livre",
    };

    try {
      await api.taxis.criar(novoTaxi);

      setSuccess(true);

      setTimeout(() => {
        setSuccess(false);

        setForm({
          matricula: "",
          marca: "",
          modelo: "",
          ano_compra: "",
          tipo_motor: "",
          nivel_conforto: "",
        });

        setModelosDisponiveis([]);
        setErrors({});
        onFechar();
      }, 2000);
    } catch (err) {
      console.error(err);
      setApiError(err.message || "Não foi possível conectar ao servidor.");
    } finally {
      setLoading(false);
    }
  }

  function getAnosPermitidos() {
    const modeloEscolhido = modelosDisponiveis.find(
      (m) => m.modelo === form.modelo,
    );

    if (!modeloEscolhido) return [];

    const inicio = modeloEscolhido.ano_inicio;
    const fim = Math.min(modeloEscolhido.ano_fim || anoAtual, anoAtual);

    return Array.from({ length: fim - inicio + 1 }, (_, i) => String(fim - i));
  }
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onFechar}
      />

      <div className="relative w-full max-w-[540px] mx-4 max-h-[90vh] overflow-y-auto rounded-2xl border border-[#1a6eff]/20 bg-[#0a1628]/95 backdrop-blur-2xl shadow-[0_32px_80px_rgba(0,0,0,0.5)] animate-[modalIn_0.3s_ease] scrollbar-none">
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#1a6eff]/30 to-transparent" />

        <div className="flex items-center justify-between p-6 pb-4 sticky top-0 bg-[#0a1628]/95 backdrop-blur-xl z-10">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-[13px] flex items-center justify-center text-white shadow-[0_4px_16px_rgba(0,0,0,0.25)]"
              style={{
                background: "linear-gradient(135deg, #1a6eff, #0052cc)",
              }}
            >
              <Car size={18} strokeWidth={1.8} />
            </div>

            <div>
              <h3 className="font-['Syne',sans-serif] text-[18px] font-bold text-[#eaf0ff]">
                Registar Táxi
              </h3>

              <p className="text-[12px] text-[#4e6a8a]">
                Adicionar novo veículo à frota
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

        <div className="px-6">
          {success && (
            <div className="mb-4 px-4 py-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-sm flex items-center gap-2">
              <CheckCircle2 size={16} />
              Táxi registado com sucesso!
            </div>
          )}

          {apiError && (
            <div className="mb-4 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm flex items-center gap-2">
              <AlertCircle size={16} />
              {apiError}
            </div>
          )}
        </div>

        <div className="px-6 pb-2 space-y-5">
          <div>
            <label className="block text-[12px] font-semibold text-[#8ba3c7] mb-2 tracking-wide uppercase">
              Matrícula
            </label>

            <input
              type="text"
              placeholder="Ex: AA-00-BB"
              value={form.matricula}
              onChange={(e) => handleMatriculaChange(e.target.value)}
              maxLength={8}
              disabled={loading || success}
              className={`w-full px-4 py-3 rounded-xl text-[14px] text-[#eaf0ff] placeholder-[#4e6a8a]/60 bg-white/[0.04] border outline-none transition-all duration-200 uppercase tracking-widest font-semibold focus:bg-[#1a6eff]/[0.06] focus:border-[#1a6eff]/40 focus:shadow-[0_0_0_3px_rgba(26,110,255,0.1)] disabled:opacity-50 disabled:cursor-not-allowed ${
                errors.matricula
                  ? "border-red-500/40 bg-red-500/[0.04]"
                  : "border-white/[0.08]"
              }`}
            />

            <p className="text-[10.5px] text-[#4e6a8a] mt-1.5 pl-1">
              Formatos: AA-00-00 · 00-00-AA · 00-AA-00 · AA-00-AA
            </p>

            {errors.matricula && (
              <p className="text-[11px] text-red-400 mt-1 pl-1 flex items-center gap-1">
                <AlertCircle size={12} /> {errors.matricula}
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Dropdown
              label="Marca"
              placeholder={loadingMarcas ? "A carregar..." : "Selecionar marca"}
              value={form.marca}
              onChange={(v) => handleChange("marca", v)}
              options={marcas}
              disabled={loading || success || loadingMarcas}
              error={errors.marca}
            />

            <Dropdown
              label="Modelo"
              placeholder={
                loadingModelos
                  ? "A carregar..."
                  : form.marca
                    ? "Selecionar modelo"
                    : "Escolha a marca"
              }
              value={form.modelo}
              onChange={(v) => handleChange("modelo", v)}
              options={modelosDisponiveis.map((m) => m.modelo)}
              disabled={!form.marca || loading || success || loadingModelos}
              error={errors.modelo}
            />
          </div>

          <div>
            <Dropdown
              label="Ano de compra"
              placeholder={
                form.modelo ? "Selecionar ano" : "Escolha primeiro o modelo"
              }
              value={form.ano_compra}
              onChange={(v) => handleChange("ano_compra", v)}
              options={getAnosPermitidos()}
              disabled={!form.modelo || loading || success}
              error={errors.ano_compra}
            />

            {errors.ano_compra && (
              <p className="text-[11px] text-red-400 mt-1.5 pl-1 flex items-center gap-1">
                <AlertCircle size={12} /> {errors.ano_compra}
              </p>
            )}
          </div>

          <div>
            <label className="block text-[12px] font-semibold text-[#8ba3c7] mb-2 tracking-wide uppercase">
              Tipo de motor
            </label>

            <div className="px-4 py-3 rounded-xl border border-white/[0.08] bg-white/[0.04] text-[14px] text-[#eaf0ff] flex items-center gap-2">
              {form.tipo_motor === "eletrico" ? (
                <>
                  <Zap size={16} className="text-[#00d4ff]" />
                  Elétrico
                </>
              ) : form.tipo_motor === "combustao" ? (
                <>
                  <Flame size={16} className="text-[#ff8c42]" />
                  Combustão
                </>
              ) : (
                <span className="text-[#4e6a8a]/70">
                  Escolha primeiro o modelo do táxi
                </span>
              )}
            </div>

            <p className="text-[10.5px] text-[#4e6a8a] mt-1.5 pl-1">
              Este valor vem automaticamente da base de dados do modelo
              escolhido.
            </p>

            {errors.tipo_motor && (
              <p className="text-[11px] text-red-400 mt-1.5 pl-1 flex items-center gap-1">
                <AlertCircle size={12} /> {errors.tipo_motor}
              </p>
            )}
          </div>

          <div>
            <label className="block text-[12px] font-semibold text-[#8ba3c7] mb-2 tracking-wide uppercase">
              Nível de conforto
            </label>

            <div className="px-4 py-3 rounded-xl border border-white/[0.08] bg-white/[0.04] text-[14px] text-[#eaf0ff] flex items-center gap-2">
              {form.nivel_conforto === "luxuoso" ? (
                <>
                  <Crown size={16} className="text-[#c64dff]" />
                  Luxuoso
                </>
              ) : form.nivel_conforto === "basico" ? (
                <>
                  <Star size={16} className="text-[#3d8bff]" />
                  Básico
                </>
              ) : (
                <span className="text-[#4e6a8a]/70">
                  Escolha primeiro o modelo do táxi
                </span>
              )}
            </div>

            <p className="text-[10.5px] text-[#4e6a8a] mt-1.5 pl-1">
              Este valor vem automaticamente da base de dados do modelo
              escolhido.
            </p>

            {errors.nivel_conforto && (
              <p className="text-[11px] text-red-400 mt-1.5 pl-1 flex items-center gap-1">
                <AlertCircle size={12} /> {errors.nivel_conforto}
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between p-6 pt-4 mt-2 border-t border-white/[0.04] sticky bottom-0 bg-[#0a1628]/95 backdrop-blur-xl">
          <p className="text-[11px] text-[#4e6a8a]">
            Estado inicial:{" "}
            <span className="text-[#00e887] font-semibold">livre</span>
          </p>

          <div className="flex gap-3">
            <button
              onClick={onFechar}
              disabled={loading}
              className="px-5 py-2.5 rounded-xl border border-white/[0.08] bg-white/[0.03] text-[13px] font-medium text-[#8ba3c7] hover:bg-white/[0.06] hover:text-[#eaf0ff] transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancelar
            </button>

            <button
              onClick={handleSubmit}
              disabled={loading || success}
              className="px-6 py-2.5 rounded-xl border-none text-[13px] font-semibold text-white cursor-pointer transition-all duration-200 hover:shadow-[0_8px_32px_rgba(26,110,255,0.4)] hover:-translate-y-0.5 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:transform-none disabled:hover:shadow-none flex items-center gap-2"
              style={{
                background:
                  "linear-gradient(135deg, #1a6eff 0%, #0052cc 50%, #1a6eff 100%)",
                backgroundSize: "200% 100%",
              }}
            >
              {loading ? (
                <>
                  <Loader2 size={15} className="animate-spin" />A registar...
                </>
              ) : success ? (
                <>
                  <CheckCircle2 size={15} />
                  Registado!
                </>
              ) : (
                "Registar Táxi"
              )}
            </button>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes modalIn {
          from { opacity: 0; transform: scale(0.95) translateY(10px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }

        @keyframes dropIn {
          from { opacity: 0; transform: translateY(-4px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .scrollbar-none::-webkit-scrollbar {
          display: none;
        }

        .scrollbar-none {
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
}
