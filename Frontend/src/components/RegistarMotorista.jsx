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

function validarNIF(nif) {
  return /^\d{9}$/.test(nif) && parseInt(nif, 10) > 0;
}

function validarEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function validarCodigoPostal(cp) {
  return /^\d{4}-\d{3}$/.test(cp);
}

function validarIdade(dia, mes, ano) {
  const d = Number(dia);
  const m = Number(mes);
  const y = Number(ano);

  if (!d || !m || !y) return false;
  if (d < 1 || d > 31 || m < 1 || m > 12) return false;
  if (y < 1930 || y > new Date().getFullYear()) return false;

  const nasc = new Date(y, m - 1, d);

  if (
    nasc.getFullYear() !== y ||
    nasc.getMonth() !== m - 1 ||
    nasc.getDate() !== d
  ) {
    return false;
  }

  const hoje = new Date();
  let idade = hoje.getFullYear() - nasc.getFullYear();

  const aindaNaoFezAnos =
    hoje.getMonth() < nasc.getMonth() ||
    (hoje.getMonth() === nasc.getMonth() && hoje.getDate() < nasc.getDate());

  if (aindaNaoFezAnos) idade--;

  return idade >= 18;
}

function validarPassword(pw) {
  if (!pw) return "Password obrigatória";
  if (pw.length < 6) return "Mínimo 6 caracteres";
  if (!/[a-zA-Z]/.test(pw)) return "Deve conter pelo menos uma letra";
  if (!/\d/.test(pw)) return "Deve conter pelo menos um dígito";
  return null;
}

function validarCampo(name, value, form) {
  const atual = { ...form, [name]: value };

  switch (name) {
    case "name":
      if (!value.trim()) return "Nome obrigatório";
      if (value.trim().length < 3) return "Nome demasiado curto";
      return null;

    case "email":
      if (!value.trim()) return "Email obrigatório";
      if (!validarEmail(value)) return "Email inválido";
      return null;

    case "nif":
      if (!value.trim()) return "NIF obrigatório";
      if (!/^\d+$/.test(value)) return "O NIF só pode ter dígitos";
      if (value.length !== 9) return "O NIF tem de ter 9 dígitos";
      if (!validarNIF(value)) return "NIF inválido";
      return null;

    case "genero":
      if (!value) return "Selecione o género";
      return null;

    case "numero_carta":
      if (!value.trim()) return "Nº carta obrigatório";
      if (value.trim().length < 5) return "Nº carta demasiado curto";
      return null;

    case "birth_day":
    case "birth_month":
    case "birth_year":
      if (!atual.birth_day || !atual.birth_month || !atual.birth_year) {
        return "Data de nascimento obrigatória";
      }

      if (
        Number(atual.birth_day) < 1 ||
        Number(atual.birth_day) > 31 ||
        Number(atual.birth_month) < 1 ||
        Number(atual.birth_month) > 12 ||
        Number(atual.birth_year) < 1930 ||
        Number(atual.birth_year) > new Date().getFullYear()
      ) {
        return "Data inválida";
      }

      if (!validarIdade(atual.birth_day, atual.birth_month, atual.birth_year)) {
        return "O motorista deve ter pelo menos 18 anos";
      }

      return null;

    case "morada":
      if (!value.trim()) return "Morada obrigatória";
      if (value.trim().length < 5) return "Morada demasiado curta";
      return null;

    case "codigo_postal":
      if (!value.trim()) return "Código postal obrigatório";
      if (!validarCodigoPostal(value)) return "Formato: 0000-000";
      return null;

    case "password":
      return validarPassword(value);

    default:
      return null;
  }
}

const FORM_INICIAL = {
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
};

export default function RegistarMotorista({ aberto, onFechar }) {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState(FORM_INICIAL);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState("");
  const [success, setSuccess] = useState(false);
  const [showPw, setShowPw] = useState(false);
  const [loadingCP, setLoadingCP] = useState(false);

  const disabled = loading || success;

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
    if (form.codigo_postal.length === 8 && !errors.codigo_postal) {
      fetchLocalidade(form.codigo_postal);
    }
  }, [form.codigo_postal, errors.codigo_postal, fetchLocalidade]);

  useEffect(() => {
    if (!aberto) return;

    setStep(1);
    setForm(FORM_INICIAL);
    setErrors({});
    setTouched({});
    setApiError("");
    setSuccess(false);
    setShowPw(false);
  }, [aberto]);

  if (!aberto) return null;

  function campoErroKey(name) {
    return ["birth_day", "birth_month", "birth_year"].includes(name)
      ? "birth"
      : name;
  }

  function atualizarErro(name, value, novoForm, marcarTouched = true) {
    const key = campoErroKey(name);
    const erro = validarCampo(name, value, novoForm);

    setErrors((prev) => {
      const novo = { ...prev };

      if (erro) novo[key] = erro;
      else delete novo[key];

      return novo;
    });

    if (marcarTouched) {
      setTouched((prev) => ({ ...prev, [key]: true }));
    }
  }

  function handleChange(e) {
    const { name, value } = e.target;

    let novoValor = value;

    if (name === "nif") novoValor = value.replace(/\D/g, "").slice(0, 9);
    if (name === "birth_day") novoValor = value.replace(/\D/g, "").slice(0, 2);
    if (name === "birth_month")
      novoValor = value.replace(/\D/g, "").slice(0, 2);
    if (name === "birth_year") novoValor = value.replace(/\D/g, "").slice(0, 4);

    const novoForm = { ...form, [name]: novoValor };

    setForm(novoForm);
    atualizarErro(name, novoValor, novoForm);

    if (apiError) setApiError("");
  }

  function handleBlur(e) {
    const { name, value } = e.target;
    atualizarErro(name, value, form, true);
  }

  function formatCodigoPostal(value) {
    const clean = value.replace(/\D/g, "").slice(0, 7);
    if (clean.length <= 4) return clean;
    return clean.slice(0, 4) + "-" + clean.slice(4);
  }

  function handleCPChange(e) {
    const formatted = formatCodigoPostal(e.target.value);
    const novoForm = { ...form, codigo_postal: formatted, localidade: "" };

    setForm(novoForm);
    atualizarErro("codigo_postal", formatted, novoForm);

    if (apiError) setApiError("");
  }

  function validarStep1() {
    const campos = [
      "name",
      "email",
      "nif",
      "genero",
      "numero_carta",
      "birth_day",
    ];
    const errs = {};

    campos.forEach((campo) => {
      const erro = validarCampo(campo, form[campo], form);
      const key = campo === "birth_day" ? "birth" : campo;
      if (erro) errs[key] = erro;
    });

    return errs;
  }

  function validarStep2() {
    const campos = ["morada", "codigo_postal", "password"];
    const errs = {};

    campos.forEach((campo) => {
      const erro = validarCampo(campo, form[campo], form);
      if (erro) errs[campo] = erro;
    });

    return errs;
  }

  function handleNext() {
    const errs = validarStep1();

    setTouched((prev) => ({
      ...prev,
      name: true,
      email: true,
      nif: true,
      genero: true,
      numero_carta: true,
      birth: true,
    }));

    if (Object.keys(errs).length > 0) {
      setErrors((prev) => ({ ...prev, ...errs }));
      return;
    }

    setStep(2);
  }

  async function handleSubmit(e) {
    e.preventDefault();

    const errs = validarStep2();

    setTouched((prev) => ({
      ...prev,
      morada: true,
      codigo_postal: true,
      password: true,
    }));

    if (Object.keys(errs).length > 0) {
      setErrors((prev) => ({ ...prev, ...errs }));
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
        setForm(FORM_INICIAL);
        setErrors({});
        setTouched({});
        onFechar();
      }, 2000);
    } catch (err) {
      setApiError(
        err?.message ||
          "Não foi possível conectar ao servidor ou registar o motorista.",
      );
    } finally {
      setLoading(false);
    }
  }

  function mostrarErro(campo) {
    return touched[campo] && errors[campo] ? errors[campo] : null;
  }

  return (
    <div className="rm-overlay">
      <div className="rm-backdrop" onClick={onFechar} />

      <div className="rm-modal rm-scrollbar-none">
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

        <div className="rm-progress">
          <div className="rm-progress-track">
            <div
              className="rm-progress-bar"
              style={{ width: step === 1 ? "50%" : "100%" }}
            />
          </div>
        </div>

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

        <form onSubmit={handleSubmit}>
          <div className="rm-form">
            {step === 1 ? (
              <>
                <Field
                  label="Nome completo"
                  name="name"
                  placeholder="Ex: Carlos Silva"
                  value={form.name}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={mostrarErro("name")}
                  disabled={disabled}
                />

                <Field
                  label="Email"
                  name="email"
                  type="email"
                  placeholder="Ex: carlos@takecab.pt"
                  value={form.email}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={mostrarErro("email")}
                  disabled={disabled}
                />

                <div className="rm-grid-two">
                  <Field
                    label="NIF"
                    name="nif"
                    placeholder="9 dígitos"
                    value={form.nif}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={mostrarErro("nif")}
                    disabled={disabled}
                    maxLength={9}
                  />

                  <div>
                    <label className="rm-label">Género</label>
                    <select
                      name="genero"
                      value={form.genero}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      disabled={disabled}
                      className={`rm-select ${
                        form.genero ? "" : "is-placeholder"
                      } ${mostrarErro("genero") ? "has-error" : ""}`}
                    >
                      <option value="">Selecionar</option>
                      <option value="Masculino">Masculino</option>
                      <option value="Feminino">Feminino</option>
                    </select>

                    {mostrarErro("genero") && (
                      <p className="rm-error">
                        <AlertCircle size={12} /> {mostrarErro("genero")}
                      </p>
                    )}
                  </div>
                </div>

                <Field
                  label="Nº Carta de Condução"
                  name="numero_carta"
                  placeholder="Ex: ABC123456"
                  value={form.numero_carta}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={mostrarErro("numero_carta")}
                  disabled={disabled}
                />

                <div>
                  <label className="rm-label">Data de nascimento</label>

                  <div className="rm-grid-three">
                    <input
                      type="number"
                      name="birth_day"
                      placeholder="Dia"
                      value={form.birth_day}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      min={1}
                      max={31}
                      disabled={disabled}
                      className={`rm-input ${
                        mostrarErro("birth") ? "has-error" : ""
                      }`}
                    />

                    <input
                      type="number"
                      name="birth_month"
                      placeholder="Mês"
                      value={form.birth_month}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      min={1}
                      max={12}
                      disabled={disabled}
                      className={`rm-input ${
                        mostrarErro("birth") ? "has-error" : ""
                      }`}
                    />

                    <input
                      type="number"
                      name="birth_year"
                      placeholder="Ano"
                      value={form.birth_year}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      min={1930}
                      max={new Date().getFullYear()}
                      disabled={disabled}
                      className={`rm-input ${
                        mostrarErro("birth") ? "has-error" : ""
                      }`}
                    />
                  </div>

                  {mostrarErro("birth") && (
                    <p className="rm-error">
                      <AlertCircle size={12} /> {mostrarErro("birth")}
                    </p>
                  )}
                </div>
              </>
            ) : (
              <>
                <Field
                  label="Morada"
                  name="morada"
                  placeholder="Ex: Rua do Motor, 45"
                  value={form.morada}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={mostrarErro("morada")}
                  disabled={disabled}
                />

                <div className="rm-grid-two">
                  <div>
                    <label className="rm-label">Código postal</label>

                    <input
                      type="text"
                      name="codigo_postal"
                      placeholder="0000-000"
                      value={form.codigo_postal}
                      onChange={handleCPChange}
                      onBlur={handleBlur}
                      disabled={disabled}
                      maxLength={8}
                      className={`rm-input ${
                        mostrarErro("codigo_postal") ? "has-error" : ""
                      }`}
                    />

                    {mostrarErro("codigo_postal") && (
                      <p className="rm-error">
                        <AlertCircle size={12} /> {mostrarErro("codigo_postal")}
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

                <div>
                  <label className="rm-label">Password</label>

                  <div className="rm-input-wrap">
                    <input
                      type={showPw ? "text" : "password"}
                      name="password"
                      placeholder="Letras e dígitos, mín. 6 caracteres"
                      value={form.password}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      disabled={disabled}
                      className={`rm-input rm-input-password ${
                        mostrarErro("password") ? "has-error" : ""
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

                  {mostrarErro("password") && (
                    <p className="rm-error">
                      <AlertCircle size={12} /> {mostrarErro("password")}
                    </p>
                  )}
                </div>
              </>
            )}
          </div>

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

function Field({
  label,
  name,
  placeholder,
  value,
  onChange,
  onBlur,
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
        onBlur={onBlur}
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
