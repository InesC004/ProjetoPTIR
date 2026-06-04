/* eslint-disable react/prop-types */
import { useState, useEffect, useRef } from "react";
import api from "../Api";
import {
  User,
  X,
  AlertCircle,
  Loader2,
  CheckCircle2,
  Pencil,
  ArrowLeft,
  Search,
  ChevronDown,
  Mail,
  MapPin,
  CreditCard,
  CalendarDays,
} from "lucide-react";
import "../css/editarMotorista.css";

function validarNIF(valor) {
  return /^\d{9}$/.test(valor);
}

function validarEmail(valor) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(valor);
}

function formatarDataInput(valor) {
  if (!valor) return "";
  // Se já vier no formato YYYY-MM-DD, usar diretamente
  if (/^\d{4}-\d{2}-\d{2}$/.test(valor)) return valor;
  // Cortar apenas a parte da data sem converter timezone
  if (valor.includes("T")) return valor.split("T")[0];
  const d = new Date(valor);
  if (Number.isNaN(d.getTime())) return "";
  // Usar data local em vez de UTC
  const ano = d.getFullYear();
  const mes = String(d.getMonth() + 1).padStart(2, "0");
  const dia = String(d.getDate()).padStart(2, "0");
  return `${ano}-${mes}-${dia}`;
}

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
  const ref = useRef(null);

  useEffect(() => {
    function handleClickOutside(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selecionado = options.find((o) => o.value === value);

  return (
    <div ref={ref} className="em-dropdown">
      <label className="em-label">{label}</label>

      <button
        type="button"
        onClick={() => !disabled && setOpen((v) => !v)}
        className={`em-dropdown-button ${disabled ? "is-disabled" : ""} ${
          open ? "is-open" : ""
        } ${error ? "has-error" : ""}`}
      >
        <span
          className={value ? "em-dropdown-value" : "em-dropdown-placeholder"}
        >
          {selecionado ? selecionado.label : placeholder}
        </span>
        <ChevronDown
          size={14}
          className={`em-dropdown-chevron ${open ? "is-open" : ""}`}
        />
      </button>

      {open && (
        <div className="em-dropdown-menu">
          {options.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => {
                onChange(opt.value);
                setOpen(false);
              }}
              className="em-dropdown-option"
            >
              {opt.label}
            </button>
          ))}
        </div>
      )}

      {error && (
        <p className="em-error">
          <AlertCircle size={12} /> {error}
        </p>
      )}
    </div>
  );
}

export default function EditarMotorista({ aberto, onFechar }) {
  const [motoristas, setMotoristas] = useState([]);
  const [loadingList, setLoadingList] = useState(false);
  const [listError, setListError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({
    nome: "",
    nif: "",
    genero: "",
    data_nascimento: "",
    email: "",
    morada: "",
    codigo_postal: "",
    numero_carta: "",
  });

  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [apiError, setApiError] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!aberto) return;
    fetchMotoristas();
  }, [aberto]);

  async function fetchMotoristas() {
    setLoadingList(true);
    setListError("");
    try {
      const data = await api.motoristas.listar();
      setMotoristas(data);
    } catch {
      setListError("Erro ao carregar motoristas.");
    } finally {
      setLoadingList(false);
    }
  }

  function startEdit(motorista) {
    setEditing(motorista);
    setForm({
      nome: motorista.nome || "",
      nif: motorista.nif || "",
      genero: motorista.genero || "",
      data_nascimento: formatarDataInput(motorista.data_nascimento),
      email: motorista.email || "",
      morada: motorista.morada || "",
      codigo_postal: motorista.codigo_postal || "",
      numero_carta: motorista.numero_carta || "",
    });
    setErrors({});
    setApiError("");
    setSuccess(false);
  }

  function cancelEdit() {
    setEditing(null);
    setErrors({});
    setApiError("");
    setSuccess(false);
  }

  function handleChange(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: null }));
    if (apiError) setApiError("");
  }

  function validar() {
    const newErrors = {};
    if (!form.nome.trim()) newErrors.nome = "Nome obrigatório";
    if (!form.nif.trim()) newErrors.nif = "NIF obrigatório";
    else if (!validarNIF(form.nif)) newErrors.nif = "NIF inválido";
    if (!form.genero) newErrors.genero = "Género obrigatório";
    if (!form.data_nascimento) {
      newErrors.data_nascimento = "Data obrigatória";
    } else {
      const nasc = new Date(form.data_nascimento);
      const hoje = new Date();
      let idade = hoje.getFullYear() - nasc.getFullYear();
      const m = hoje.getMonth() - nasc.getMonth();
      if (m < 0 || (m === 0 && hoje.getDate() < nasc.getDate())) idade--;
      if (idade < 18) newErrors.data_nascimento = "Deve ter pelo menos 18 anos";
    }
    if (!form.email.trim()) newErrors.email = "Email obrigatório";
    else if (!validarEmail(form.email)) newErrors.email = "Email inválido";
    if (!form.morada.trim()) newErrors.morada = "Morada obrigatória";
    if (!form.numero_carta.trim())
      newErrors.numero_carta = "Número da carta obrigatório";
    return newErrors;
  }

  async function handleSave() {
    const newErrors = validar();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setSaving(true);
    setApiError("");

    try {
      const payload = {
        nome: form.nome.trim(),
        nif: form.nif.trim(),
        genero: form.genero,
        data_nascimento: form.data_nascimento,
        email: form.email.trim().toLowerCase(),
        morada: form.morada.trim(),
        codigo_postal: form.codigo_postal.trim(),
        numero_carta: form.numero_carta.trim(),
      };

      const data = await api.motoristas.atualizar(editing._id, payload);
      {
        setMotoristas((prev) =>
          prev.map((m) => (m._id === editing._id ? data.motorista || data : m)),
        );
        setSuccess(true);
        setTimeout(() => {
          setSuccess(false);
          cancelEdit();
        }, 1200);
      }
    } catch {
      setApiError("Não foi possível ligar ao servidor.");
    } finally {
      setSaving(false);
    }
  }

  if (!aberto) return null;

  const filtrados = motoristas.filter((m) => {
    const termo = searchTerm.toLowerCase();
    return (
      (m.nome || "").toLowerCase().includes(termo) ||
      (m.nif || "").toLowerCase().includes(termo) ||
      (m.email || "").toLowerCase().includes(termo) ||
      (m.numero_carta || "").toLowerCase().includes(termo)
    );
  });

  return (
    <div className="em-overlay">
      <div className="em-backdrop" onClick={onFechar} />

      <div className="em-modal em-scrollbar-none">
        {/* HEADER */}
        <div className="em-header">
          <div className="em-title-wrap">
            {editing && (
              <button onClick={cancelEdit} className="em-back-icon">
                <ArrowLeft size={16} strokeWidth={2} />
              </button>
            )}

            <div className={`em-icon-box ${editing ? "is-editing" : ""}`}>
              {editing ? (
                <Pencil size={18} strokeWidth={1.8} />
              ) : (
                <User size={18} strokeWidth={1.8} />
              )}
            </div>

            <div className="em-title-text">
              <h3 className="em-title">
                {editing ? "Editar Motorista" : "Editar Motoristas"}
              </h3>
              <p className="em-subtitle">
                {editing
                  ? "Atualize os dados do motorista selecionado"
                  : "Selecione um motorista para editar"}
              </p>
            </div>
          </div>

          <button
            onClick={editing ? cancelEdit : onFechar}
            className="em-close-button"
          >
            <X size={18} strokeWidth={2} />
          </button>
        </div>

        {!editing ? (
          /* ─────────── VISTA LISTA ─────────── */
          <div className="em-body">
            <div className="em-search">
              <Search size={16} className="em-search-icon" />
              <input
                type="text"
                placeholder="Pesquisar por nome, NIF, email ou carta..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="em-search-input"
              />
            </div>

            {loadingList ? (
              <div className="em-loading">
                <Loader2 size={18} className="em-spin" />A carregar
                motoristas...
              </div>
            ) : listError ? (
              <div className="em-alert em-alert-error">
                <AlertCircle size={16} />
                {listError}
              </div>
            ) : filtrados.length === 0 ? (
              <div className="em-empty">Nenhum motorista encontrado.</div>
            ) : (
              <div className="em-list">
                {filtrados.map((m) => (
                  <button
                    key={m._id}
                    type="button"
                    onClick={() => startEdit(m)}
                    className="em-card"
                  >
                    <div className="em-card-row">
                      <div className="em-card-info">
                        <div className="em-card-name">{m.nome}</div>
                        <div className="em-card-meta">NIF: {m.nif}</div>
                        <div className="em-card-meta">Email: {m.email}</div>
                        <div className="em-card-meta">
                          Carta: {m.numero_carta}
                        </div>
                      </div>
                      <div className="em-card-badge">
                        <Pencil size={15} />
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        ) : (
          /* ─────────── VISTA EDIÇÃO ─────────── */
          <div className="em-body">
            {apiError && (
              <div className="em-alert em-alert-error">
                <AlertCircle size={16} />
                {apiError}
              </div>
            )}
            {success && (
              <div className="em-alert em-alert-success">
                <CheckCircle2 size={16} />
                Motorista atualizado com sucesso.
              </div>
            )}

            <div className="em-grid">
              <Field
                label="Nome"
                icon={<User size={15} />}
                value={form.nome}
                onChange={(v) => handleChange("nome", v)}
                error={errors.nome}
                placeholder="Nome completo"
              />
              <Field
                label="NIF"
                icon={<CreditCard size={15} />}
                value={form.nif}
                onChange={(v) =>
                  handleChange("nif", v.replace(/\D/g, "").slice(0, 9))
                }
                error={errors.nif}
                placeholder="9 dígitos"
              />
              <Dropdown
                label="Género"
                placeholder="Selecionar género"
                value={form.genero}
                onChange={(v) => handleChange("genero", v)}
                options={[
                  { value: "Masculino", label: "Masculino" },
                  { value: "Feminino", label: "Feminino" },
                ]}
                error={errors.genero}
              />
              <Field
                label="Data de nascimento"
                type="date"
                icon={<CalendarDays size={15} />}
                value={form.data_nascimento}
                onChange={(v) => handleChange("data_nascimento", v)}
                error={errors.data_nascimento}
              />
              <Field
                label="Email"
                icon={<Mail size={15} />}
                value={form.email}
                onChange={(v) => handleChange("email", v)}
                error={errors.email}
                placeholder="email@exemplo.com"
              />
              <Field
                label="Número da carta"
                icon={<CreditCard size={15} />}
                value={form.numero_carta}
                onChange={(v) => handleChange("numero_carta", v)}
                error={errors.numero_carta}
                placeholder="Número da carta"
              />
              <div className="em-col-span">
                <Field
                  label="Morada"
                  icon={<MapPin size={15} />}
                  value={form.morada}
                  onChange={(v) => handleChange("morada", v)}
                  error={errors.morada}
                  placeholder="Morada completa"
                />
              </div>
            </div>

            <div className="em-footer">
              <button
                type="button"
                onClick={cancelEdit}
                disabled={saving}
                className="em-cancel-button"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleSave}
                disabled={saving || success}
                className="em-save-button"
              >
                {saving ? (
                  <>
                    <Loader2 size={16} className="em-spin" />A guardar...
                  </>
                ) : success ? (
                  <>
                    <CheckCircle2 size={16} />
                    Guardado
                  </>
                ) : (
                  <>
                    <Pencil size={16} />
                    Guardar alterações
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function Field({
  label,
  icon,
  value,
  onChange,
  error,
  placeholder,
  type = "text",
}) {
  return (
    <div>
      <label className="em-label">{label}</label>
      <div className="em-field-wrap">
        <span className="em-field-icon">{icon}</span>
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={`em-input ${error ? "has-error" : ""}`}
        />
      </div>
      {error && (
        <p className="em-error">
          <AlertCircle size={13} /> {error}
        </p>
      )}
    </div>
  );
}
