/* eslint-disable react/prop-types */
import { useState, useEffect, useCallback } from "react";
import {
  UserPlus,
  X,
  AlertCircle,
  Loader2,
  CheckCircle2,
  Eye,
  EyeOff,
  MapPin,
} from "lucide-react";

/* ═══════════════════════════════════════════════
   VALIDAÇÕES (restrições 4, 12, 13, 14, 15)
   ═══════════════════════════════════════════════ */

// Restrição 12: NIF tem de ter 9 dígitos e ser positivo
function validarNIF(nif) {
  if (!/^\d{9}$/.test(nif)) return false;
  if (parseInt(nif, 10) <= 0) return false;
  return true;
}

function validarEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// Restrição 4: ano de nascimento tem de ser 18 ou mais anos anterior ao ano atual
function validarIdade(dia, mes, ano) {
  const anoAtual = new Date().getFullYear();
  if (anoAtual - ano < 18) return false;
  if (anoAtual - ano === 18) {
    const hoje = new Date();
    const nasc = new Date(ano, mes - 1, dia);
    return hoje >= nasc;
  }
  return true;
}

// Restrição 15: senha tem de ter dígitos E letras, comprimento mínimo 6
function validarPassword(pw) {
  if (pw.length < 6) return "Mínimo 6 caracteres";
  if (!/[a-zA-Z]/.test(pw)) return "Deve conter pelo menos uma letra";
  if (!/\d/.test(pw)) return "Deve conter pelo menos um dígito";
  return null;
}

// Código postal português: 0000-000
function validarCodigoPostal(cp) {
  return /^\d{4}-\d{3}$/.test(cp);
}

/* ═══════════════════════════════════════════════
   COMPONENTE PRINCIPAL
   ═══════════════════════════════════════════════ */
export default function RegistarMotorista({ aberto, onFechar }) {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    name: "",
    nif: "",
    email: "",
    genero: "",
    birth_day: "",
    birth_month: "",
    birth_year: "",
    morada: "",
    codigo_postal: "",
    localidade: "",
    password: "",
    numero_carta: "",
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState("");
  const [success, setSuccess] = useState(false);
  const [showPw, setShowPw] = useState(false);
  const [loadingCP, setLoadingCP] = useState(false);

  // Auto-preencher localidade a partir do código postal
  const fetchLocalidade = useCallback(async (cp) => {
    if (!validarCodigoPostal(cp)) {
      setForm((prev) => ({ ...prev, localidade: "" }));
      return;
    }
    setLoadingCP(true);
    try {
      const [cp4, cp3] = cp.split("-");
      const res = await fetch(`https://json.geoapi.pt/cp/${cp4}-${cp3}`);
      if (res.ok) {
        const data = await res.json();
        const loc = data.Localidade || data.localidade || data.Distrito || "";
        setForm((prev) => ({ ...prev, localidade: loc }));
      } else {
        setForm((prev) => ({ ...prev, localidade: "" }));
      }
    } catch {
      setForm((prev) => ({ ...prev, localidade: "" }));
    } finally {
      setLoadingCP(false);
    }
  }, []);

  useEffect(() => {
    if (form.codigo_postal.length === 8) {
      fetchLocalidade(form.codigo_postal);
    }
  }, [form.codigo_postal, fetchLocalidade]);

  if (!aberto) return null;

  const disabled = loading || success;

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: null }));
    if (apiError) setApiError("");
  }

  function formatCodigoPostal(value) {
    const clean = value.replace(/\D/g, "").slice(0, 7);
    if (clean.length <= 4) return clean;
    return clean.slice(0, 4) + "-" + clean.slice(4);
  }

  function handleCPChange(e) {
    const formatted = formatCodigoPostal(e.target.value);
    setForm((prev) => ({ ...prev, codigo_postal: formatted, localidade: "" }));
    if (errors.codigo_postal)
      setErrors((prev) => ({ ...prev, codigo_postal: null }));
  }

  /* ── Validação Step 1 ── */
  function validarStep1() {
    const errs = {};

    if (!form.name.trim()) errs.name = "Nome obrigatório";

    if (!form.email.trim()) errs.email = "Email obrigatório";
    else if (!validarEmail(form.email)) errs.email = "Email inválido";

    // Restrição 12: NIF 9 dígitos positivo
    if (!form.nif.trim()) errs.nif = "NIF obrigatório";
    else if (!validarNIF(form.nif))
      errs.nif = "NIF inválido (9 dígitos, positivo)";

    // Restrição 13: género feminino ou masculino
    if (!form.genero) errs.genero = "Selecione o género";

    // Restrição 14: número da carta identifica univocamente (validação no backend)
    if (!form.numero_carta.trim()) errs.numero_carta = "Nº carta obrigatório";

    // Restrição 4: 18+ anos
    if (!form.birth_day || !form.birth_month || !form.birth_year) {
      errs.birth = "Data de nascimento obrigatória";
    } else {
      const d = parseInt(form.birth_day, 10);
      const m = parseInt(form.birth_month, 10);
      const y = parseInt(form.birth_year, 10);
      if (
        d < 1 ||
        d > 31 ||
        m < 1 ||
        m > 12 ||
        y < 1930 ||
        y > new Date().getFullYear()
      ) {
        errs.birth = "Data inválida";
      } else if (!validarIdade(d, m, y)) {
        errs.birth = "O motorista deve ter pelo menos 18 anos";
      }
    }

    return errs;
  }

  /* ── Validação Step 2 ── */
  function validarStep2() {
    const errs = {};

    if (!form.morada.trim()) errs.morada = "Morada obrigatória";

    if (!form.codigo_postal.trim())
      errs.codigo_postal = "Código postal obrigatório";
    else if (!validarCodigoPostal(form.codigo_postal))
      errs.codigo_postal = "Formato: 0000-000";

    // Restrição 15: senha com dígitos e letras, min 6
    if (!form.password) errs.password = "Password obrigatória";
    else {
      const pwErr = validarPassword(form.password);
      if (pwErr) errs.password = pwErr;
    }

    return errs;
  }

  function handleNext() {
    const errs = validarStep1();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    setErrors({});
    setStep(2);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const errs = validarStep2();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }

    setLoading(true);
    setApiError("");

    const payload = {
      nome: form.name.trim(),
      nif: form.nif.trim(),
      email: form.email.trim().toLowerCase(),
      genero: form.genero,
      birth_day: parseInt(form.birth_day, 10),
      birth_month: parseInt(form.birth_month, 10),
      birth_year: parseInt(form.birth_year, 10),
      morada: form.localidade
        ? `${form.morada.trim()}, ${form.localidade}`
        : form.morada.trim(),
      codigo_postal: form.codigo_postal.trim(),
      password: form.password,
      numero_carta: form.numero_carta.trim(),
    };

    try {
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:8080/api/motoristas/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        setApiError(data.message || "Erro ao registar o motorista.");
      } else {
        setSuccess(true);
        setTimeout(() => {
          setSuccess(false);
          setStep(1);
          setForm({
            name: "",
            nif: "",
            email: "",
            genero: "",
            birth_day: "",
            birth_month: "",
            birth_year: "",
            morada: "",
            codigo_postal: "",
            localidade: "",
            password: "",
            numero_carta: "",
          });
          setErrors({});
          onFechar();
        }, 2000);
      }
    } catch {
      setApiError("Não foi possível conectar ao servidor.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onFechar}
      />

      <div className="relative w-full max-w-[540px] mx-4 max-h-[90vh] overflow-y-auto rounded-2xl border border-[#00c873]/20 bg-[#0a1628]/95 backdrop-blur-2xl shadow-[0_32px_80px_rgba(0,0,0,0.5)] animate-[modalIn_0.3s_ease] scrollbar-none">
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#00c873]/30 to-transparent" />

        {/* Header */}
        <div className="flex items-center justify-between p-6 pb-4 sticky top-0 bg-[#0a1628]/95 backdrop-blur-xl z-10">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-[13px] flex items-center justify-center text-white shadow-[0_4px_16px_rgba(0,0,0,0.25)]"
              style={{
                background: "linear-gradient(135deg, #00c873, #00a85e)",
              }}
            >
              <UserPlus size={18} strokeWidth={1.8} />
            </div>
            <div>
              <h3 className="font-['Syne',sans-serif] text-[18px] font-bold text-[#eaf0ff]">
                Registar Motorista
              </h3>
              <p className="text-[12px] text-[#4e6a8a]">Passo {step} de 2</p>
            </div>
          </div>
          <button
            onClick={onFechar}
            className="w-9 h-9 rounded-xl flex items-center justify-center border border-white/[0.06] bg-white/[0.03] text-[#8ba3c7] hover:bg-red-500/10 hover:border-red-500/25 hover:text-red-400 transition-all duration-200 cursor-pointer"
          >
            <X size={16} strokeWidth={2} />
          </button>
        </div>

        {/* Progress bar */}
        <div className="px-6 mb-4">
          <div className="h-1 bg-white/[0.06] rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: step === 1 ? "50%" : "100%",
                background: "linear-gradient(90deg, #00c873, #00e887)",
              }}
            />
          </div>
        </div>

        {/* Mensagens */}
        <div className="px-6">
          {success && (
            <div className="mb-4 px-4 py-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-sm flex items-center gap-2">
              <CheckCircle2 size={16} /> Motorista registado com sucesso!
            </div>
          )}
          {apiError && (
            <div className="mb-4 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm flex items-center gap-2">
              <AlertCircle size={16} /> {apiError}
            </div>
          )}
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="px-6 pb-2 space-y-4">
          {step === 1 ? (
            <>
              {/* Nome */}
              <Field
                label="Nome completo"
                name="name"
                placeholder="Ex: Carlos Silva"
                value={form.name}
                onChange={handleChange}
                error={errors.name}
                disabled={disabled}
              />

              {/* Email */}
              <Field
                label="Email"
                name="email"
                type="email"
                placeholder="Ex: carlos@takecab.pt"
                value={form.email}
                onChange={handleChange}
                error={errors.email}
                disabled={disabled}
              />

              {/* NIF + Género */}
              <div className="grid grid-cols-2 gap-3">
                <Field
                  label="NIF"
                  name="nif"
                  placeholder="9 dígitos"
                  value={form.nif}
                  onChange={handleChange}
                  error={errors.nif}
                  disabled={disabled}
                  maxLength={9}
                />
                <div>
                  <label className="block text-[12px] font-semibold text-[#8ba3c7] mb-2 tracking-wide uppercase">
                    Género
                  </label>
                  <select
                    name="genero"
                    value={form.genero}
                    onChange={handleChange}
                    disabled={disabled}
                    className={`w-full px-4 py-3 rounded-xl text-[14px] bg-white/[0.04] border outline-none transition-all duration-200 cursor-pointer focus:bg-[#1a6eff]/[0.06] focus:border-[#1a6eff]/40 focus:shadow-[0_0_0_3px_rgba(26,110,255,0.1)] disabled:opacity-50 disabled:cursor-not-allowed ${
                      form.genero ? "text-[#eaf0ff]" : "text-[#4e6a8a]/60"
                    } ${errors.genero ? "border-red-500/40" : "border-white/[0.08]"}`}
                  >
                    <option value="" className="bg-[#0a1628] text-[#4e6a8a]">
                      Selecionar
                    </option>
                    <option
                      value="Masculino"
                      className="bg-[#0a1628] text-[#eaf0ff]"
                    >
                      Masculino
                    </option>
                    <option
                      value="Feminino"
                      className="bg-[#0a1628] text-[#eaf0ff]"
                    >
                      Feminino
                    </option>
                  </select>
                  {errors.genero && (
                    <p className="text-[11px] text-red-400 mt-1 pl-1 flex items-center gap-1">
                      <AlertCircle size={12} /> {errors.genero}
                    </p>
                  )}
                </div>
              </div>

              {/* Nº Carta de Condução */}
              <Field
                label="Nº Carta de Condução"
                name="numero_carta"
                placeholder="Ex: ABC123456"
                value={form.numero_carta}
                onChange={handleChange}
                error={errors.numero_carta}
                disabled={disabled}
              />

              {/* Data de nascimento */}
              <div>
                <label className="block text-[12px] font-semibold text-[#8ba3c7] mb-2 tracking-wide uppercase">
                  Data de nascimento
                </label>
                <div className="grid grid-cols-3 gap-3">
                  <input
                    type="number"
                    name="birth_day"
                    placeholder="Dia"
                    value={form.birth_day}
                    onChange={handleChange}
                    min={1}
                    max={31}
                    disabled={disabled}
                    className={`w-full px-4 py-3 rounded-xl text-[14px] text-[#eaf0ff] placeholder-[#4e6a8a]/60 bg-white/[0.04] border outline-none transition-all duration-200 focus:bg-[#1a6eff]/[0.06] focus:border-[#1a6eff]/40 disabled:opacity-50 disabled:cursor-not-allowed ${errors.birth ? "border-red-500/40" : "border-white/[0.08]"}`}
                  />
                  <input
                    type="number"
                    name="birth_month"
                    placeholder="Mês"
                    value={form.birth_month}
                    onChange={handleChange}
                    min={1}
                    max={12}
                    disabled={disabled}
                    className={`w-full px-4 py-3 rounded-xl text-[14px] text-[#eaf0ff] placeholder-[#4e6a8a]/60 bg-white/[0.04] border outline-none transition-all duration-200 focus:bg-[#1a6eff]/[0.06] focus:border-[#1a6eff]/40 disabled:opacity-50 disabled:cursor-not-allowed ${errors.birth ? "border-red-500/40" : "border-white/[0.08]"}`}
                  />
                  <input
                    type="number"
                    name="birth_year"
                    placeholder="Ano"
                    value={form.birth_year}
                    onChange={handleChange}
                    min={1930}
                    max={new Date().getFullYear()}
                    disabled={disabled}
                    className={`w-full px-4 py-3 rounded-xl text-[14px] text-[#eaf0ff] placeholder-[#4e6a8a]/60 bg-white/[0.04] border outline-none transition-all duration-200 focus:bg-[#1a6eff]/[0.06] focus:border-[#1a6eff]/40 disabled:opacity-50 disabled:cursor-not-allowed ${errors.birth ? "border-red-500/40" : "border-white/[0.08]"}`}
                  />
                </div>

                {errors.birth && (
                  <p className="text-[11px] text-red-400 mt-1 pl-1 flex items-center gap-1">
                    <AlertCircle size={12} /> {errors.birth}
                  </p>
                )}
              </div>

              {/* Botão continuar */}
              <button
                type="button"
                onClick={handleNext}
                className="w-full py-3.5 rounded-xl font-semibold text-white text-[14px] flex items-center justify-center gap-2 transition-all duration-200 hover:shadow-[0_8px_32px_rgba(0,200,115,0.3)] hover:-translate-y-0.5 cursor-pointer mt-2"
                style={{
                  background: "linear-gradient(135deg, #00c873, #00a85e)",
                }}
              >
                Continuar
                <svg
                  className="w-4 h-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </button>
            </>
          ) : (
            <>
              {/* Morada */}
              <Field
                label="Morada"
                name="morada"
                placeholder="Ex: Rua do Motor, 45"
                value={form.morada}
                onChange={handleChange}
                error={errors.morada}
                disabled={disabled}
              />

              {/* Código postal + Localidade (auto-preenchida) */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[12px] font-semibold text-[#8ba3c7] mb-2 tracking-wide uppercase">
                    Código postal
                  </label>
                  <input
                    type="text"
                    name="codigo_postal"
                    placeholder="0000-000"
                    value={form.codigo_postal}
                    onChange={handleCPChange}
                    disabled={disabled}
                    maxLength={8}
                    className={`w-full px-4 py-3 rounded-xl text-[14px] text-[#eaf0ff] placeholder-[#4e6a8a]/60 bg-white/[0.04] border outline-none transition-all duration-200 tracking-wider font-semibold focus:bg-[#1a6eff]/[0.06] focus:border-[#1a6eff]/40 focus:shadow-[0_0_0_3px_rgba(26,110,255,0.1)] disabled:opacity-50 disabled:cursor-not-allowed ${
                      errors.codigo_postal
                        ? "border-red-500/40 bg-red-500/[0.04]"
                        : "border-white/[0.08]"
                    }`}
                  />
                  {errors.codigo_postal && (
                    <p className="text-[11px] text-red-400 mt-1.5 pl-1 flex items-center gap-1">
                      <AlertCircle size={12} /> {errors.codigo_postal}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-[12px] font-semibold text-[#8ba3c7] mb-2 tracking-wide uppercase">
                    Localidade
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={form.localidade}
                      readOnly
                      placeholder={
                        loadingCP ? "A procurar..." : "Preencha o código postal"
                      }
                      className="w-full px-4 py-3 pl-10 rounded-xl text-[14px] text-[#eaf0ff] placeholder-[#4e6a8a]/40 bg-white/[0.02] border border-white/[0.06] outline-none cursor-default"
                    />
                    <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#4e6a8a]">
                      {loadingCP ? (
                        <Loader2
                          size={14}
                          className="animate-spin text-[#00c873]"
                        />
                      ) : (
                        <MapPin
                          size={14}
                          className={form.localidade ? "text-[#00e887]" : ""}
                        />
                      )}
                    </div>
                  </div>
                  {form.localidade && (
                    <p className="text-[10px] text-[#00e887] mt-1 pl-1 flex items-center gap-1">
                      <CheckCircle2 size={10} /> Localidade encontrada
                    </p>
                  )}
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block text-[12px] font-semibold text-[#8ba3c7] mb-2 tracking-wide uppercase">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPw ? "text" : "password"}
                    name="password"
                    placeholder="Letras e dígitos, mín. 6 caracteres"
                    value={form.password}
                    onChange={handleChange}
                    disabled={disabled}
                    className={`w-full px-4 py-3 pr-12 rounded-xl text-[14px] text-[#eaf0ff] placeholder-[#4e6a8a]/60 bg-white/[0.04] border outline-none transition-all duration-200 focus:bg-[#1a6eff]/[0.06] focus:border-[#1a6eff]/40 focus:shadow-[0_0_0_3px_rgba(26,110,255,0.1)] disabled:opacity-50 disabled:cursor-not-allowed ${
                      errors.password
                        ? "border-red-500/40 bg-red-500/[0.04]"
                        : "border-white/[0.08]"
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPw(!showPw)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#4e6a8a] hover:text-[#8ba3c7] transition-colors cursor-pointer"
                  >
                    {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                <p className="text-[10px] text-[#4e6a8a] mt-1 pl-1">
                  Deve conter letras e dígitos
                </p>
                {errors.password && (
                  <p className="text-[11px] text-red-400 mt-1 pl-1 flex items-center gap-1">
                    <AlertCircle size={12} /> {errors.password}
                  </p>
                )}
              </div>

              {/* Botões */}
              <div className="flex gap-3 mt-2">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  disabled={disabled}
                  className="flex-1 py-3.5 rounded-xl font-semibold text-[13px] text-[#8ba3c7] bg-white/[0.04] border border-white/[0.08] hover:bg-white/[0.08] transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M15 19l-7-7 7-7"
                    />
                  </svg>
                  Voltar
                </button>
                <button
                  type="submit"
                  disabled={disabled}
                  className="flex-[2] py-3.5 rounded-xl font-semibold text-[14px] text-white flex items-center justify-center gap-2 transition-all duration-200 hover:shadow-[0_8px_32px_rgba(0,200,115,0.3)] hover:-translate-y-0.5 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:transform-none disabled:hover:shadow-none"
                  style={{
                    background: "linear-gradient(135deg, #00c873, #00a85e)",
                  }}
                >
                  {loading ? (
                    <>
                      <Loader2 size={15} className="animate-spin" /> A
                      registar...
                    </>
                  ) : success ? (
                    <>
                      <CheckCircle2 size={15} /> Registado!
                    </>
                  ) : (
                    "Registar Motorista"
                  )}
                </button>
              </div>
            </>
          )}
        </form>

        <div className="h-6" />
      </div>

      <style>{`
        @keyframes modalIn {
          from { opacity: 0; transform: scale(0.95) translateY(10px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }
        .scrollbar-none::-webkit-scrollbar { display: none; }
        .scrollbar-none { scrollbar-width: none; }
      `}</style>
    </div>
  );
}

/* ═══════════════════════════════════════════════
   INPUT FIELD REUTILIZÁVEL
   ═══════════════════════════════════════════════ */
function Field({
  label,
  name,
  placeholder,
  value,
  onChange,
  error,
  disabled,
  type = "text",
  maxLength,
  hint,
}) {
  return (
    <div>
      <label className="block text-[12px] font-semibold text-[#8ba3c7] mb-2 tracking-wide uppercase">
        {label}
      </label>
      <input
        type={type}
        name={name}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        disabled={disabled}
        maxLength={maxLength}
        className={`w-full px-4 py-3 rounded-xl text-[14px] text-[#eaf0ff] placeholder-[#4e6a8a]/60 bg-white/[0.04] border outline-none transition-all duration-200 focus:bg-[#1a6eff]/[0.06] focus:border-[#1a6eff]/40 focus:shadow-[0_0_0_3px_rgba(26,110,255,0.1)] disabled:opacity-50 disabled:cursor-not-allowed ${
          error ? "border-red-500/40 bg-red-500/[0.04]" : "border-white/[0.08]"
        }`}
      />
      {hint && <p className="text-[10px] text-[#4e6a8a] mt-1 pl-1">{hint}</p>}
      {error && (
        <p className="text-[11px] text-red-400 mt-1.5 pl-1 flex items-center gap-1">
          <AlertCircle size={12} /> {error}
        </p>
      )}
    </div>
  );
}
