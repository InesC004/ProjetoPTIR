/* eslint-disable react/prop-types */
import { useEffect, useState } from "react";
import {
  AlertCircle,
  CarFront,
  CheckCircle2,
  Loader2,
  Plus,
  X,
} from "lucide-react";
import api from "../Api";
import "../css/registarTaxi.css";

const FORM_INICIAL = {
  marca: "",
  modelo: "",
  ano: "",
  tipo_motor: "combustao",
  nivel_conforto: "basico",
};

export default function RegistarModeloTaxi({ aberto, onFechar }) {
  const [form, setForm] = useState(FORM_INICIAL);
  const [modelos, setModelos] = useState([]);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [loadingLista, setLoadingLista] = useState(false);
  const [apiError, setApiError] = useState("");
  const [success, setSuccess] = useState(false);

  const anoAtual = new Date().getFullYear();

  useEffect(() => {
    if (aberto) {
      carregarModelos();
      setApiError("");
      setSuccess(false);
    }
  }, [aberto]);

  async function carregarModelos() {
    try {
      setLoadingLista(true);
      const data = await api.modelosTaxi.listar();
      setModelos(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      setModelos([]);
      setApiError("Erro ao carregar modelos registados.");
    } finally {
      setLoadingLista(false);
    }
  }

  function handleChange(campo, valor) {
    setForm((prev) => ({ ...prev, [campo]: valor }));
    if (errors[campo]) setErrors((prev) => ({ ...prev, [campo]: null }));
    if (apiError) setApiError("");
  }

  function validar() {
    const errs = {};
    const ano = Number(form.ano);

    if (!form.marca.trim()) errs.marca = "Marca obrigatoria";
    if (!form.modelo.trim()) errs.modelo = "Modelo obrigatorio";

    if (!form.ano) {
      errs.ano = "Ano obrigatorio";
    } else if (!Number.isInteger(ano) || ano < 1990 || ano > anoAtual) {
      errs.ano = `Ano entre 1990 e ${anoAtual}`;
    }

    if (!form.tipo_motor) errs.tipo_motor = "Tipo de motor obrigatorio";
    if (!form.nivel_conforto) errs.nivel_conforto = "Nivel obrigatorio";

    return errs;
  }

  async function handleSubmit(e) {
    e.preventDefault();

    const errs = validar();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }

    try {
      setLoading(true);
      setApiError("");

      await api.modelosTaxi.criar({
        marca: form.marca.trim(),
        modelo: form.modelo.trim(),
        ano: Number(form.ano),
        tipo_motor: form.tipo_motor,
        nivel_conforto: form.nivel_conforto,
      });

      setSuccess(true);
      setForm(FORM_INICIAL);
      setErrors({});
      await carregarModelos();
    } catch (err) {
      console.error(err);
      setApiError(err.message || "Nao foi possivel registar o modelo.");
    } finally {
      setLoading(false);
    }
  }

  if (!aberto) return null;

  return (
    <div className="rt-overlay">
      <div className="rt-backdrop" onClick={onFechar} />

      <div className="rt-modal rt-scrollbar-none">
        <div className="rt-modal-top-line" />

        <div className="rt-header">
          <div className="rt-title-wrap">
            <div className="rt-icon-box">
              <CarFront size={18} strokeWidth={1.8} />
            </div>

            <div>
              <h3 className="rt-title">Registar Modelo</h3>
              <p className="rt-subtitle">Adicionar marca, modelo e ano</p>
            </div>
          </div>

          <button onClick={onFechar} className="rt-close-button">
            <X size={16} strokeWidth={2} />
          </button>
        </div>

        <div className="rt-alerts">
          {success && (
            <div className="rt-alert rt-alert-success">
              <CheckCircle2 size={16} />
              Modelo registado com sucesso!
            </div>
          )}

          {apiError && (
            <div className="rt-alert rt-alert-error">
              <AlertCircle size={16} />
              {apiError}
            </div>
          )}
        </div>

        <form className="rt-form" onSubmit={handleSubmit}>
          <div className="rt-grid-two">
            <CampoTexto
              label="Marca"
              value={form.marca}
              placeholder="Ex: Toyota"
              error={errors.marca}
              disabled={loading}
              onChange={(v) => handleChange("marca", v)}
            />

            <CampoTexto
              label="Modelo"
              value={form.modelo}
              placeholder="Ex: Corolla"
              error={errors.modelo}
              disabled={loading}
              onChange={(v) => handleChange("modelo", v)}
            />
          </div>

          <CampoTexto
            label="Ano"
            type="number"
            value={form.ano}
            placeholder="Ex: 2020"
            error={errors.ano}
            disabled={loading}
            onChange={(v) => handleChange("ano", v)}
          />

          <div className="rt-grid-two">
            <CampoSelect
              label="Tipo de motor"
              value={form.tipo_motor}
              error={errors.tipo_motor}
              disabled={loading}
              options={[
                { value: "combustao", label: "Combustao" },
                { value: "eletrico", label: "Eletrico" },
              ]}
              onChange={(v) => handleChange("tipo_motor", v)}
            />

            <CampoSelect
              label="Nivel de conforto"
              value={form.nivel_conforto}
              error={errors.nivel_conforto}
              disabled={loading}
              options={[
                { value: "basico", label: "Basico" },
                { value: "luxuoso", label: "Luxuoso" },
              ]}
              onChange={(v) => handleChange("nivel_conforto", v)}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="rt-submit-button rt-submit-full"
          >
            {loading ? (
              <>
                <Loader2 size={15} className="rt-spin" />A registar...
              </>
            ) : (
              <>
                <Plus size={15} />
                Registar modelo
              </>
            )}
          </button>
        </form>

        <div className="rt-modelos-lista">
          <h4>Modelos registados</h4>

          {loadingLista && <p className="rt-help">A carregar modelos...</p>}

          {!loadingLista && modelos.length === 0 && (
            <p className="rt-help">Ainda nao existem modelos registados.</p>
          )}

          {!loadingLista &&
            modelos.map((item) => (
              <div key={item._id} className="rt-modelo-row">
                <strong>
                  {item.marca} {item.modelo}
                </strong>
                <span>
                  {item.ano} - {item.tipo_motor} - {item.nivel_conforto}
                </span>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}

function CampoTexto({
  label,
  value,
  onChange,
  placeholder,
  error,
  disabled,
  type = "text",
}) {
  return (
    <div>
      <label className="rt-label">{label}</label>
      <input
        type={type}
        value={value}
        placeholder={placeholder}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value)}
        className={`rt-input ${error ? "has-error" : ""}`}
      />
      {error && (
        <p className="rt-error">
          <AlertCircle size={12} /> {error}
        </p>
      )}
    </div>
  );
}

function CampoSelect({ label, value, onChange, options, error, disabled }) {
  return (
    <div>
      <label className="rt-label">{label}</label>
      <select
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value)}
        className={`rt-input ${error ? "has-error" : ""}`}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error && (
        <p className="rt-error">
          <AlertCircle size={12} /> {error}
        </p>
      )}
    </div>
  );
}
