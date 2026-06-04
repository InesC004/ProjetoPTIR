/* eslint-disable react/prop-types */
import { useState, useEffect, useCallback } from "react";
import api from "../Api";
import {
  UserPlus,
  X,
  AlertCircle,
  Loader2,
  CheckCircle2,
  Eye,
  EyeOff,
  MapPin,
  ArrowLeft,
  ArrowRight,
} from "lucide-react";
import "../css/registarMotorista.css";

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
      await api.motoristas.criar(payload);
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
    } catch {
      setApiError("Não foi possível conectar ao servidor.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="rm-overlay">
      <div className="rm-backdrop" onClick={onFechar} />

      <div className="rm-modal rm-scrollbar-none">
        {/* HEADER */}
        <div className="rm-header">
          <div className="rm-title-wrap">
            <div className="rm-icon-box">
              <UserPlus size={18} strokeWidth={1.8} />
            </div>
            <div>
              <h3 className="rm-title">Registar Motorista</h3>
              <p className="rm-subtitle">Passo {step} de 2</p>
            </div>
          </div>

          <button onClick={onFechar} className="rm-close-button">
            <X size={16} strokeWidth={2} />
          </button>
        </div>

        {/* PROGRESSO */}
        <div className="rm-progress">
          <div className="rm-progress-track">
            <div
              className="rm-progress-bar"
              style={{ width: step === 1 ? "50%" : "100%" }}
            />
          </div>
        </div>

        {/* ALERTAS */}
        <div className="rm-alerts">
          {success && (
            <div className="rm-alert rm-alert-success">
              <CheckCircle2 size={16} />
              Motorista registado com sucesso!
            </div>
          )}

          {apiError && (
            <div className="rm-alert rm-alert-error">
              <AlertCircle size={16} />
              {apiError}
            </div>
          )}
        </div>

        {/* FORM */}
        <form onSubmit={handleSubmit}>
          <div className="rm-form">
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
                <div className="rm-grid-two">
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
                    <label className="rm-label">Género</label>
                    <select
                      name="genero"
                      value={form.genero}
                      onChange={handleChange}
                      disabled={disabled}
                      className={`rm-select ${
                        form.genero ? "" : "is-placeholder"
                      } ${errors.genero ? "has-error" : ""}`}
                    >
                      <option value="">Selecionar</option>
                      <option value="Masculino">Masculino</option>
                      <option value="Feminino">Feminino</option>
                    </select>
                    {errors.genero && (
                      <p className="rm-error">
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
                  <label className="rm-label">Data de nascimento</label>
                  <div className="rm-grid-three">
                    <input
                      type="number"
                      name="birth_day"
                      placeholder="Dia"
                      value={form.birth_day}
                      onChange={handleChange}
                      min={1}
                      max={31}
                      disabled={disabled}
                      className={`rm-input ${errors.birth ? "has-error" : ""}`}
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
                      className={`rm-input ${errors.birth ? "has-error" : ""}`}
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
                      className={`rm-input ${errors.birth ? "has-error" : ""}`}
                    />
                  </div>

                  {errors.birth && (
                    <p className="rm-error">
                      <AlertCircle size={12} /> {errors.birth}
                    </p>
                  )}
                </div>
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
                <div className="rm-grid-two">
                  <div>
                    <label className="rm-label">Código postal</label>
                    <input
                      type="text"
                      name="codigo_postal"
                      placeholder="0000-000"
                      value={form.codigo_postal}
                      onChange={handleCPChange}
                      disabled={disabled}
                      maxLength={8}
                      className={`rm-input ${
                        errors.codigo_postal ? "has-error" : ""
                      }`}
                    />
                    {errors.codigo_postal && (
                      <p className="rm-error">
                        <AlertCircle size={12} /> {errors.codigo_postal}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="rm-label">Localidade</label>
                    <div
                      className={`rm-readonly-field ${
                        form.localidade ? "" : "is-empty"
                      }`}
                    >
                      {loadingCP ? (
                        <Loader2 size={15} className="rm-loc-icon rm-spin" />
                      ) : (
                        <MapPin
                          size={15}
                          className={`rm-loc-icon ${
                            form.localidade ? "is-found" : ""
                          }`}
                        />
                      )}
                      {form.localidade ||
                        (loadingCP
                          ? "A procurar..."
                          : "Preencha o código postal")}
                    </div>
                    {form.localidade && (
                      <p className="rm-loc-found">
                        <CheckCircle2 size={11} /> Localidade encontrada
                      </p>
                    )}
                  </div>
                </div>

                {/* Password */}
                <div>
                  <label className="rm-label">Password</label>
                  <div className="rm-input-wrap">
                    <input
                      type={showPw ? "text" : "password"}
                      name="password"
                      placeholder="Letras e dígitos, mín. 6 caracteres"
                      value={form.password}
                      onChange={handleChange}
                      disabled={disabled}
                      className={`rm-input rm-input-password ${
                        errors.password ? "has-error" : ""
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPw(!showPw)}
                      className="rm-eye-button"
                    >
                      {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                  <p className="rm-help">Deve conter letras e dígitos</p>
                  {errors.password && (
                    <p className="rm-error">
                      <AlertCircle size={12} /> {errors.password}
                    </p>
                  )}
                </div>
              </>
            )}
          </div>

          {/* FOOTER / AÇÕES */}
          <div className="rm-footer">
            {step === 1 ? (
              <button
                type="button"
                onClick={handleNext}
                disabled={disabled}
                className="rm-next-button"
              >
                Continuar
                <ArrowRight size={16} />
              </button>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  disabled={disabled}
                  className="rm-back-button"
                >
                  <ArrowLeft size={16} />
                  Voltar
                </button>

                <button
                  type="submit"
                  disabled={disabled}
                  className="rm-submit-button"
                >
                  {loading ? (
                    <>
                      <Loader2 size={15} className="rm-spin" />A registar...
                    </>
                  ) : success ? (
                    <>
                      <CheckCircle2 size={15} />
                      Registado!
                    </>
                  ) : (
                    "Registar Motorista"
                  )}
                </button>
              </>
            )}
          </div>
        </form>
      </div>
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
      <label className="rm-label">{label}</label>
      <input
        type={type}
        name={name}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        disabled={disabled}
        maxLength={maxLength}
        className={`rm-input ${error ? "has-error" : ""}`}
      />
      {hint && <p className="rm-help">{hint}</p>}
      {error && (
        <p className="rm-error">
          <AlertCircle size={12} /> {error}
        </p>
      )}
    </div>
  );
}
