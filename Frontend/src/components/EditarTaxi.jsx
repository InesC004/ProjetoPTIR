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
import "../css/editarTaxi.css";

/* ═══════════════════════════════════════════════
   HELPERS PARA CAMPOS DO TÁXI
   Aceita várias formas vindas da API:
   taxi.matricula
   taxi.id_taxi.matricula
   taxi.taxi.matricula
   ═══════════════════════════════════════════════ */
function getCampoTaxi(taxi, campo) {
  return (
    taxi?.[campo] ||
    taxi?.taxi?.[campo] ||
    taxi?.id_taxi?.[campo] ||
    taxi?.veiculo?.[campo] ||
    ""
  );
}

function normalizarListaTaxis(data) {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.data)) return data.data;
  if (Array.isArray(data?.Data)) return data.Data;
  if (Array.isArray(data?.taxis)) return data.taxis;
  return [];
}

/* ═══════════════════════════════════════════════
   VALIDAÇÃO DE MATRÍCULA
   ═══════════════════════════════════════════════ */
function validarMatricula(valor) {
  const limpo = valor.toUpperCase().replace(/[^A-Z0-9]/g, "");

  if (limpo.length !== 6) return false;

  const g1 = limpo.slice(0, 2);
  const g2 = limpo.slice(2, 4);
  const g3 = limpo.slice(4, 6);

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
const ESTADO_LABELS = {
  livre: "Livre",
  em_uso: "Em uso",
  em_reabastecimento: "Reabastecimento",
};

function getEstadoClass(estado) {
  if (estado === "em_uso") return "et-state-use";
  if (estado === "em_reabastecimento") return "et-state-fuel";
  return "et-state-free";
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
    <div ref={ref} className="et-dropdown">
      <label className="et-label">{label}</label>

      <button
        type="button"
        onClick={() => {
          if (!disabled) setOpen(!open);
        }}
        className={`et-dropdown-button ${disabled ? "is-disabled" : ""} ${
          open ? "is-open" : ""
        } ${error ? "has-error" : ""}`}
      >
        <span
          className={value ? "et-dropdown-value" : "et-dropdown-placeholder"}
        >
          {value || placeholder}
        </span>

        <ChevronDown
          size={14}
          className={`et-dropdown-chevron ${open ? "is-open" : ""}`}
        />
      </button>

      {open && (
        <div className="et-dropdown-menu">
          {safeOptions.length > 5 && (
            <div className="et-dropdown-search-wrap">
              <input
                ref={inputRef}
                type="text"
                placeholder="Pesquisar..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="et-dropdown-search"
              />
            </div>
          )}

          <div className="et-dropdown-list et-scrollbar-none">
            {filtered.length === 0 ? (
              <div className="et-dropdown-empty">Nenhum resultado</div>
            ) : (
              filtered.map((opt) => (
                <button
                  key={opt}
                  type="button"
                  onClick={() => handleSelect(opt)}
                  className={`et-dropdown-option ${
                    opt === value ? "is-selected" : ""
                  }`}
                >
                  {opt}

                  {opt === value && (
                    <Check
                      size={14}
                      strokeWidth={2.5}
                      className="et-dropdown-check"
                    />
                  )}
                </button>
              ))
            )}
          </div>
        </div>
      )}

      {error && (
        <p className="et-error">
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
  const [marcas, setMarcas] = useState([]);
  const [modelosDisponiveis, setModelosDisponiveis] = useState([]);

  const [loadingList, setLoadingList] = useState(false);
  const [loadingMarcas, setLoadingMarcas] = useState(false);
  const [loadingModelos, setLoadingModelos] = useState(false);

  const [listError, setListError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({});
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [apiError, setApiError] = useState("");
  const [success, setSuccess] = useState(false);

  const anoAtual = new Date().getFullYear();
  const disabled = saving || success;

  useEffect(() => {
    if (!aberto) return;

    fetchTaxis();
    carregarMarcas();
  }, [aberto]);

  async function fetchTaxis() {
    setLoadingList(true);
    setListError("");

    try {
      const data = await api.taxis.listar();
      const lista = normalizarListaTaxis(data);

      setTaxis(lista);
    } catch (err) {
      console.error("Erro ao carregar táxis:", err);
      setListError("Erro ao carregar táxis.");
    } finally {
      setLoadingList(false);
    }
  }

  async function carregarMarcas() {
    setLoadingMarcas(true);

    try {
      const data = await api.modelosTaxi.listarMarcas();
      setMarcas(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Erro ao carregar marcas:", err);
      setListError("Erro ao carregar marcas.");
    } finally {
      setLoadingMarcas(false);
    }
  }

  async function carregarModelos(marca) {
    if (!marca) {
      setModelosDisponiveis([]);
      return [];
    }

    setLoadingModelos(true);
    setModelosDisponiveis([]);

    try {
      const data = await api.modelosTaxi.listarModelosPorMarca(marca);
      const lista = Array.isArray(data) ? data : [];

      setModelosDisponiveis(lista);
      return lista;
    } catch (err) {
      console.error("Erro ao carregar modelos:", err);
      setApiError("Erro ao carregar modelos.");
      return [];
    } finally {
      setLoadingModelos(false);
    }
  }

  function getModeloEscolhido(
    lista = modelosDisponiveis,
    modelo = form.modelo,
  ) {
    return lista.find((m) => m.modelo === modelo);
  }

  function getAnosPermitidos() {
    const modeloEscolhido = getModeloEscolhido();

    if (!modeloEscolhido) return [];

    const inicio = Number(modeloEscolhido.ano_inicio);
    const fim = Math.min(Number(modeloEscolhido.ano_fim || anoAtual), anoAtual);

    if (!inicio || !fim || fim < inicio) return [];

    return Array.from({ length: fim - inicio + 1 }, (_, i) => String(fim - i));
  }

  async function startEdit(taxi) {
    const marca = getCampoTaxi(taxi, "marca");
    const modelo = getCampoTaxi(taxi, "modelo");

    setEditing(taxi);
    setErrors({});
    setApiError("");
    setSuccess(false);

    const modelos = await carregarModelos(marca);
    const modeloEncontrado = modelos.find((m) => m.modelo === modelo);

    setForm({
      matricula: getCampoTaxi(taxi, "matricula"),
      marca,
      modelo,
      ano_compra: String(getCampoTaxi(taxi, "ano_compra") || ""),
      tipo_motor:
        modeloEncontrado?.tipo_motor || getCampoTaxi(taxi, "tipo_motor"),
      nivel_conforto:
        modeloEncontrado?.nivel_conforto ||
        getCampoTaxi(taxi, "nivel_conforto"),
    });
  }

  function cancelEdit() {
    setEditing(null);
    setForm({});
    setErrors({});
    setApiError("");
    setSuccess(false);
    setModelosDisponiveis([]);
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

        const modeloEscolhido = getModeloEscolhido(modelosDisponiveis, valor);

        if (modeloEscolhido) {
          novo.tipo_motor = modeloEscolhido.tipo_motor;
          novo.nivel_conforto = modeloEscolhido.nivel_conforto;
        } else {
          novo.tipo_motor = "";
          novo.nivel_conforto = "";
        }
      }

      return novo;
    });

    if (errors[campo]) {
      setErrors((prev) => ({ ...prev, [campo]: null }));
    }

    if (apiError) setApiError("");
  }

  function handleMatriculaChange(valor) {
    const formatado = formatarMatricula(valor);

    setForm((prev) => ({ ...prev, matricula: formatado }));

    if (errors.matricula) {
      setErrors((prev) => ({ ...prev, matricula: null }));
    }
  }

  function validar() {
    const errs = {};

    if (!form.matricula?.trim()) {
      errs.matricula = "Matrícula obrigatória";
    } else if (!validarMatricula(form.matricula)) {
      errs.matricula = "Formato inválido";
    }

    if (!form.marca) errs.marca = "Selecione a marca";
    if (!form.modelo) errs.modelo = "Selecione o modelo";

    const anosPermitidos = getAnosPermitidos();

    if (!form.ano_compra) {
      errs.ano_compra = "Ano obrigatório";
    } else if (
      anosPermitidos.length > 0 &&
      !anosPermitidos.includes(String(form.ano_compra))
    ) {
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

  async function handleSave() {
    const errs = validar();

    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }

    setSaving(true);
    setApiError("");

    try {
      const id = editing?._id || editing?.id_taxi?._id || editing?.taxi?._id;

      const data = await api.taxis.atualizar(id, {
        matricula: form.matricula.toUpperCase(),
        marca: form.marca,
        modelo: form.modelo,
        ano_compra: parseInt(form.ano_compra, 10),
        tipo_motor: form.tipo_motor,
        nivel_conforto: form.nivel_conforto,
      });

      setSuccess(true);

      setTaxis((prev) =>
        prev.map((t) => {
          const taxiId = t?._id || t?.id_taxi?._id || t?.taxi?._id;
          return taxiId === id ? data : t;
        }),
      );

      setTimeout(() => {
        setSuccess(false);
        cancelEdit();
        fetchTaxis();
      }, 1500);
    } catch (err) {
      console.error("Erro ao atualizar táxi:", err);
      setApiError("Não foi possível conectar ao servidor.");
    } finally {
      setSaving(false);
    }
  }

  const filtered = taxis.filter((t) => {
    const term = searchTerm.toLowerCase();

    return (
      getCampoTaxi(t, "matricula").toLowerCase().includes(term) ||
      getCampoTaxi(t, "marca").toLowerCase().includes(term) ||
      getCampoTaxi(t, "modelo").toLowerCase().includes(term)
    );
  });

  return (
    <div className="et-overlay">
      <div className="et-backdrop" onClick={onFechar} />

      <div className="et-modal et-scrollbar-none">
        <div className="et-header">
          <div className="et-title-wrap">
            {editing && (
              <button onClick={cancelEdit} className="et-icon-button">
                <ArrowLeft size={16} strokeWidth={2} />
              </button>
            )}

            <div className={`et-icon-box ${editing ? "edit" : ""}`}>
              {editing ? (
                <Pencil size={18} strokeWidth={1.8} />
              ) : (
                <Car size={18} strokeWidth={1.8} />
              )}
            </div>

            <div>
              <h3 className="et-title">
                {editing ? "Editar Táxi" : "Editar Táxis"}
              </h3>

              <p className="et-subtitle">
                {editing
                  ? form.matricula || getCampoTaxi(editing, "matricula")
                  : `${taxis.length} táxi${taxis.length !== 1 ? "s" : ""} na frota`}
              </p>
            </div>
          </div>

          <button onClick={onFechar} className="et-close-button">
            <X size={16} strokeWidth={2} />
          </button>
        </div>

        <div className="et-alerts">
          {success && (
            <div className="et-alert et-alert-success">
              <CheckCircle2 size={16} />
              Táxi atualizado com sucesso!
            </div>
          )}

          {(apiError || listError) && (
            <div className="et-alert et-alert-error">
              <AlertCircle size={16} />
              {apiError || listError}
            </div>
          )}
        </div>

        {!editing ? (
          <div className="et-list-area">
            <div className="et-search-wrap">
              <Search size={15} className="et-search-icon" />

              <input
                type="text"
                placeholder="Pesquisar por matrícula, marca ou modelo..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="et-search-input"
              />
            </div>

            {loadingList ? (
              <div className="et-empty">
                <Loader2 size={18} className="et-spin" />A carregar táxis...
              </div>
            ) : filtered.length === 0 ? (
              <div className="et-empty">
                {searchTerm
                  ? "Nenhum táxi encontrado."
                  : "Nenhum táxi registado."}
              </div>
            ) : (
              <div className="et-taxi-list">
                {filtered.map((taxi) => {
                  const matricula = getCampoTaxi(taxi, "matricula");
                  const marca = getCampoTaxi(taxi, "marca");
                  const modelo = getCampoTaxi(taxi, "modelo");
                  const anoCompra = getCampoTaxi(taxi, "ano_compra");
                  const tipoMotor = getCampoTaxi(taxi, "tipo_motor");
                  const nivelConforto = getCampoTaxi(taxi, "nivel_conforto");
                  const estado = getCampoTaxi(taxi, "estado") || taxi.estado;
                  const estadoClass = getEstadoClass(estado);

                  return (
                    <button
                      key={taxi._id || taxi.id_taxi?._id || taxi.taxi?._id}
                      onClick={() => startEdit(taxi)}
                      className="et-taxi-row"
                    >
                      <div className="et-taxi-left">
                        <div className="et-taxi-icon">
                          <Car size={18} strokeWidth={1.7} />
                        </div>

                        <div>
                          <div className="et-taxi-main">
                            <span className="et-taxi-matricula">
                              {matricula || "Sem matrícula"}
                            </span>

                            <span className={`et-state ${estadoClass}`}>
                              <span />
                              {ESTADO_LABELS[estado] || estado || "Livre"}
                            </span>
                          </div>

                          <p className="et-taxi-info">
                            {marca || "Sem marca"} {modelo || "Sem modelo"} ·{" "}
                            {anoCompra || "Sem ano"} ·{" "}
                            {tipoMotor === "eletrico"
                              ? "Elétrico"
                              : "Combustão"}{" "}
                            ·{" "}
                            {nivelConforto === "luxuoso" ? "Luxuoso" : "Básico"}
                          </p>
                        </div>
                      </div>

                      <Pencil size={15} className="et-row-edit-icon" />
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        ) : (
          <div className="et-form">
            <div>
              <label className="et-label">Matrícula</label>

              <input
                type="text"
                value={form.matricula}
                onChange={(e) => handleMatriculaChange(e.target.value)}
                maxLength={8}
                disabled={disabled}
                className={`et-input et-input-matricula ${
                  errors.matricula ? "has-error" : ""
                }`}
              />

              {errors.matricula && (
                <p className="et-error">
                  <AlertCircle size={12} /> {errors.matricula}
                </p>
              )}
            </div>

            <div className="et-grid-two">
              <Dropdown
                label="Marca"
                placeholder={loadingMarcas ? "A carregar..." : "Selecionar"}
                value={form.marca}
                onChange={(v) => handleChange("marca", v)}
                options={marcas}
                disabled={disabled || loadingMarcas}
                error={errors.marca}
              />

              <Dropdown
                label="Modelo"
                placeholder={
                  loadingModelos
                    ? "A carregar..."
                    : form.marca
                      ? "Selecionar"
                      : "Escolha marca"
                }
                value={form.modelo}
                onChange={(v) => handleChange("modelo", v)}
                options={modelosDisponiveis.map((m) => m.modelo)}
                disabled={!form.marca || disabled || loadingModelos}
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
              disabled={!form.modelo || disabled}
              error={errors.ano_compra}
            />

            <div>
              <label className="et-label">Tipo de motor</label>

              <div className="et-readonly-field">
                {form.tipo_motor === "eletrico" ? (
                  <>
                    <Zap size={16} className="et-electric-icon" />
                    Elétrico
                  </>
                ) : form.tipo_motor === "combustao" ? (
                  <>
                    <Flame size={16} className="et-combustion-icon" />
                    Combustão
                  </>
                ) : (
                  <span className="et-muted">
                    Escolha primeiro o modelo do táxi
                  </span>
                )}
              </div>

              {errors.tipo_motor && (
                <p className="et-error">
                  <AlertCircle size={12} /> {errors.tipo_motor}
                </p>
              )}
            </div>

            <div>
              <label className="et-label">Nível de conforto</label>

              <div className="et-readonly-field">
                {form.nivel_conforto === "luxuoso" ? (
                  <>
                    <Crown size={16} className="et-luxury-icon" />
                    Luxuoso
                  </>
                ) : form.nivel_conforto === "basico" ? (
                  <>
                    <Star size={16} className="et-basic-icon" />
                    Básico
                  </>
                ) : (
                  <span className="et-muted">
                    Escolha primeiro o modelo do táxi
                  </span>
                )}
              </div>

              {errors.nivel_conforto && (
                <p className="et-error">
                  <AlertCircle size={12} /> {errors.nivel_conforto}
                </p>
              )}
            </div>
          </div>
        )}

        {editing && (
          <div className="et-footer">
            <p className="et-footer-state">
              Estado:{" "}
              <span className={getEstadoClass(editing.estado)}>
                {ESTADO_LABELS[editing.estado] || editing.estado || "Livre"}
              </span>
            </p>

            <div className="et-actions">
              <button
                onClick={cancelEdit}
                disabled={saving}
                className="et-cancel-button"
              >
                Cancelar
              </button>

              <button
                onClick={handleSave}
                disabled={disabled}
                className="et-submit-button"
              >
                {saving ? (
                  <>
                    <Loader2 size={15} className="et-spin" />A guardar...
                  </>
                ) : success ? (
                  <>
                    <CheckCircle2 size={15} />
                    Guardado!
                  </>
                ) : (
                  "Guardar Alterações"
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
