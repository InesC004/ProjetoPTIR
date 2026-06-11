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
import "../css/registarTaxi.css";

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
    <div ref={ref} className="rt-dropdown">
      <label className="rt-label">{label}</label>

      <button
        type="button"
        onClick={() => {
          if (!disabled) setOpen(!open);
        }}
        className={`rt-dropdown-button ${disabled ? "is-disabled" : ""} ${
          open ? "is-open" : ""
        } ${error ? "has-error" : ""}`}
      >
        <span
          className={value ? "rt-dropdown-value" : "rt-dropdown-placeholder"}
        >
          {value || placeholder}
        </span>

        <ChevronDown
          size={14}
          className={`rt-dropdown-chevron ${open ? "is-open" : ""}`}
        />
      </button>

      {open && (
        <div className="rt-dropdown-menu">
          {safeOptions.length > 5 && (
            <div className="rt-dropdown-search-wrap">
              <input
                ref={inputRef}
                type="text"
                placeholder="Pesquisar..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="rt-dropdown-search"
              />
            </div>
          )}

          <div className="rt-dropdown-list rt-scrollbar-none">
            {filtered.length === 0 ? (
              <div className="rt-dropdown-empty">Nenhum resultado</div>
            ) : (
              filtered.map((opt) => (
                <button
                  key={opt}
                  type="button"
                  onClick={() => handleSelect(opt)}
                  className={`rt-dropdown-option ${
                    opt === value ? "is-selected" : ""
                  }`}
                >
                  {opt}

                  {opt === value && (
                    <Check
                      size={14}
                      strokeWidth={2.5}
                      className="rt-dropdown-check"
                    />
                  )}
                </button>
              ))
            )}
          </div>
        </div>
      )}

      {error && (
        <p className="rt-error">
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

      // Guarda o objeto completo, porque tambem precisamos do ano,
      // tipo_motor e nivel_conforto vindos da base de dados.
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
        const modeloEscolhido = modelosDisponiveis.find(
          (m) => labelModelo(m) === valor,
        );

        if (modeloEscolhido) {
          novo.ano_compra = String(modeloEscolhido.ano);
          novo.tipo_motor = modeloEscolhido.tipo_motor;
          novo.nivel_conforto = modeloEscolhido.nivel_conforto;
        } else {
          novo.ano_compra = "";
          novo.tipo_motor = "";
          novo.nivel_conforto = "";
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

  function getModeloEscolhido() {
    return modelosDisponiveis.find((m) => labelModelo(m) === form.modelo);
  }

  function getAnosPermitidos() {
    const modeloEscolhido = getModeloEscolhido();

    if (!modeloEscolhido) return [];

    const ano = Number(modeloEscolhido.ano);

    if (!ano || ano > anoAtual) return [];

    return [String(ano)];
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

    const anosPermitidos = getAnosPermitidos();

    if (!form.ano_compra) {
      errs.ano_compra = "Ano obrigatório";
    } else if (!anosPermitidos.includes(String(form.ano_compra))) {
      errs.ano_compra = "Selecione um ano válido para este modelo";
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
      modelo: getModeloEscolhido()?.modelo || form.modelo,
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

  return (
    <div className="rt-overlay">
      <div className="rt-backdrop" onClick={onFechar} />

      <div className="rt-modal rt-scrollbar-none">
        <div className="rt-modal-top-line" />

        <div className="rt-header">
          <div className="rt-title-wrap">
            <div className="rt-icon-box">
              <Car size={18} strokeWidth={1.8} />
            </div>

            <div>
              <h3 className="rt-title">Registar Táxi</h3>
              <p className="rt-subtitle">Adicionar novo veículo à frota</p>
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
              Táxi registado com sucesso!
            </div>
          )}

          {apiError && (
            <div className="rt-alert rt-alert-error">
              <AlertCircle size={16} />
              {apiError}
            </div>
          )}
        </div>

        <div className="rt-form">
          <div>
            <label className="rt-label">Matrícula</label>

            <input
              type="text"
              placeholder="Ex: AA-00-BB"
              value={form.matricula}
              onChange={(e) => handleMatriculaChange(e.target.value)}
              maxLength={8}
              disabled={loading || success}
              className={`rt-input rt-input-matricula ${
                errors.matricula ? "has-error" : ""
              }`}
            />

            <p className="rt-help">
              Formatos: AA-00-00 · 00-00-AA · 00-AA-00 · AA-00-AA
            </p>

            {errors.matricula && (
              <p className="rt-error">
                <AlertCircle size={12} /> {errors.matricula}
              </p>
            )}
          </div>

          <div className="rt-grid-two">
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
              options={modelosDisponiveis.map(labelModelo)}
              disabled={!form.marca || loading || success || loadingModelos}
              error={errors.modelo}
            />
          </div>

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

          <div>
            <label className="rt-label">Tipo de motor</label>

            <div className="rt-readonly-field">
              {form.tipo_motor === "eletrico" ? (
                <>
                  <Zap size={16} className="rt-electric-icon" />
                  Elétrico
                </>
              ) : form.tipo_motor === "combustao" ? (
                <>
                  <Flame size={16} className="rt-combustion-icon" />
                  Combustão
                </>
              ) : (
                <span className="rt-muted">
                  Escolha primeiro o modelo do táxi
                </span>
              )}
            </div>

            {errors.tipo_motor && (
              <p className="rt-error">
                <AlertCircle size={12} /> {errors.tipo_motor}
              </p>
            )}
          </div>

          <div>
            <label className="rt-label">Nível de conforto</label>

            <div className="rt-readonly-field">
              {form.nivel_conforto === "luxuoso" ? (
                <>
                  <Crown size={16} className="rt-luxury-icon" />
                  Luxuoso
                </>
              ) : form.nivel_conforto === "basico" ? (
                <>
                  <Star size={16} className="rt-basic-icon" />
                  Básico
                </>
              ) : (
                <span className="rt-muted">
                  Escolha primeiro o modelo do táxi
                </span>
              )}
            </div>

            {errors.nivel_conforto && (
              <p className="rt-error">
                <AlertCircle size={12} /> {errors.nivel_conforto}
              </p>
            )}
          </div>
        </div>

        <div className="rt-footer">
          <p className="rt-state">
            Estado inicial: <span>livre</span>
          </p>

          <div className="rt-actions">
            <button
              onClick={onFechar}
              disabled={loading}
              className="rt-cancel-button"
            >
              Cancelar
            </button>

            <button
              onClick={handleSubmit}
              disabled={loading || success}
              className="rt-submit-button"
            >
              {loading ? (
                <>
                  <Loader2 size={15} className="rt-spin" />A registar...
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
    </div>
  );
}

function labelModelo(modelo) {
  if (!modelo) return "";
  return `${modelo.modelo} (${modelo.ano})`;
}
