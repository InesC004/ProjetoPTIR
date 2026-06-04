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

  return (
    <div ref={ref} className="relative">
      <label className="block text-[12px] font-semibold text-[#8ba3c7] mb-2 tracking-wide uppercase">
        {label}
      </label>
      <button
        type="button"
        onClick={() => !disabled && setOpen((v) => !v)}
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
        <div className="absolute top-full left-0 right-0 mt-2 z-50 rounded-xl border border-[#1a6eff]/20 bg-[#0c1c38]/98 backdrop-blur-2xl shadow-[0_20px_60px_rgba(0,0,0,0.6)] overflow-hidden">
          {options.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => {
                onChange(opt.value);
                setOpen(false);
              }}
              className="w-full text-left px-4 py-3 text-[13.5px] text-[#eaf0ff] hover:bg-[#1a6eff]/10 transition-colors"
            >
              {opt.label}
            </button>
          ))}
        </div>
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
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onFechar}
      />

      <div className="relative w-full max-w-[720px] mx-4 max-h-[90vh] overflow-y-auto rounded-2xl border border-[#1a6eff]/20 bg-[#0a1628]/95 backdrop-blur-2xl shadow-[0_32px_80px_rgba(0,0,0,0.5)]">
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#1a6eff]/30 to-transparent" />

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
                  : "linear-gradient(135deg, #00c873, #00a85e)",
              }}
            >
              {editing ? (
                <Pencil size={18} strokeWidth={1.8} />
              ) : (
                <User size={18} strokeWidth={1.8} />
              )}
            </div>
            <div>
              <h3 className="font-['Syne',sans-serif] text-[18px] font-bold text-[#eaf0ff]">
                {editing ? "Editar Motorista" : "Editar Motoristas"}
              </h3>
              <p className="text-[12px] text-[#4e6a8a]">
                {editing
                  ? "Atualize os dados do motorista selecionado"
                  : "Selecione um motorista para editar"}
              </p>
            </div>
          </div>
          <button
            onClick={editing ? cancelEdit : onFechar}
            className="w-10 h-10 rounded-xl flex items-center justify-center border border-white/[0.06] bg-white/[0.03] text-[#8ba3c7] hover:bg-white/[0.06] hover:text-[#eaf0ff] transition-all duration-200 cursor-pointer"
          >
            <X size={18} strokeWidth={2} />
          </button>
        </div>

        {!editing ? (
          <div className="p-6 pt-2">
            <div className="relative mb-5">
              <Search
                size={16}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-[#4e6a8a]"
              />
              <input
                type="text"
                placeholder="Pesquisar por nome, NIF, email ou carta..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-11 pr-4 py-3 rounded-xl text-[14px] text-[#eaf0ff] placeholder-[#4e6a8a]/60 bg-white/[0.04] border border-white/[0.08] outline-none focus:border-[#1a6eff]/35 focus:bg-[#1a6eff]/[0.04]"
              />
            </div>

            {loadingList ? (
              <div className="flex items-center justify-center gap-3 py-10 text-[#8ba3c7] text-[14px]">
                <Loader2 size={18} className="animate-spin" />A carregar
                motoristas...
              </div>
            ) : listError ? (
              <div className="flex items-center gap-2 rounded-xl border border-red-500/20 bg-red-500/[0.05] px-4 py-3 text-[13px] text-red-300">
                <AlertCircle size={16} />
                {listError}
              </div>
            ) : filtrados.length === 0 ? (
              <div className="text-center py-10 text-[#8ba3c7] text-[14px]">
                Nenhum motorista encontrado.
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {filtrados.map((m) => (
                  <button
                    key={m._id}
                    type="button"
                    onClick={() => startEdit(m)}
                    className="w-full text-left rounded-2xl border border-white/[0.06] bg-white/[0.03] hover:bg-[#1a6eff]/[0.06] hover:border-[#1a6eff]/20 transition-all duration-200 p-4"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <div className="font-semibold text-[#eaf0ff] text-[15px]">
                          {m.nome}
                        </div>
                        <div className="text-[12px] text-[#8ba3c7] mt-1">
                          NIF: {m.nif}
                        </div>
                        <div className="text-[12px] text-[#8ba3c7]">
                          Email: {m.email}
                        </div>
                        <div className="text-[12px] text-[#8ba3c7]">
                          Carta: {m.numero_carta}
                        </div>
                      </div>
                      <div className="shrink-0 w-9 h-9 rounded-xl flex items-center justify-center bg-[#1a6eff]/10 border border-[#1a6eff]/20 text-[#3d8bff]">
                        <Pencil size={15} />
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="p-6 pt-2">
            {apiError && (
              <div className="mb-4 flex items-center gap-2 rounded-xl border border-red-500/20 bg-red-500/[0.05] px-4 py-3 text-[13px] text-red-300">
                <AlertCircle size={16} />
                {apiError}
              </div>
            )}
            {success && (
              <div className="mb-4 flex items-center gap-2 rounded-xl border border-[#00e887]/20 bg-[#00e887]/[0.06] px-4 py-3 text-[13px] text-[#8fffd0]">
                <CheckCircle2 size={16} />
                Motorista atualizado com sucesso.
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
              <div className="md:col-span-2">
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

            <div className="flex items-center justify-end gap-3 mt-6 pt-5 border-t border-white/[0.05]">
              <button
                type="button"
                onClick={cancelEdit}
                disabled={saving}
                className="px-4 py-2.5 rounded-xl border border-white/[0.08] bg-white/[0.03] text-[#8ba3c7] hover:bg-white/[0.06] hover:text-[#eaf0ff] transition-all duration-200 disabled:opacity-50 cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleSave}
                disabled={saving || success}
                className="px-5 py-2.5 rounded-xl bg-[linear-gradient(135deg,#1a6eff,#0052cc)] text-white font-semibold hover:shadow-[0_8px_24px_rgba(26,110,255,0.35)] transition-all duration-200 disabled:opacity-60 cursor-pointer flex items-center gap-2"
              >
                {saving ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />A guardar...
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
      <label className="block text-[12px] font-semibold text-[#8ba3c7] mb-2 tracking-wide uppercase">
        {label}
      </label>
      <div className="relative">
        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#4e6a8a]">
          {icon}
        </span>
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={`w-full pl-11 pr-4 py-3 rounded-xl text-[14px] text-[#eaf0ff] placeholder-[#4e6a8a]/60 border outline-none transition-all duration-200 ${
            error
              ? "bg-red-500/[0.04] border-red-500/40"
              : "bg-white/[0.04] border-white/[0.08] focus:border-[#1a6eff]/35 focus:bg-[#1a6eff]/[0.04]"
          }`}
        />
      </div>
      {error && (
        <div className="mt-2 flex items-center gap-1.5 text-[12px] text-red-300">
          <AlertCircle size={13} />
          {error}
        </div>
      )}
    </div>
  );
}
