/* eslint-disable react/prop-types */
import { useState, useEffect } from "react";
import api from "../Api";
import {
  X,
  DollarSign,
  Moon,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Sun,
  Pencil,
  Calculator,
  Clock,
  ChevronDown,
} from "lucide-react";
import "../css/paginaGestores.css";

/* ═══════════════════════════════════════════════
   DEFINIR PREÇOS (criar/editar)
   ═══════════════════════════════════════════════ */
export function DefinirPrecos({ aberto, onFechar }) {
  const [precos, setPrecos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [basico, setBasico] = useState({
    preco_minuto: "",
    acrescimo_noturno: "",
  });
  const [luxuoso, setLuxuoso] = useState({
    preco_minuto: "",
    acrescimo_noturno: "",
  });

  useEffect(() => {
    if (!aberto) return;
    fetchPrecos();
  }, [aberto]);

  async function fetchPrecos() {
    setLoading(true);
    setError("");
    try {
      const data = await api.precos.listar();
      setPrecos(data);
      const pb = data.find((p) => p.nivel_conforto === "basico");
      const pl = data.find((p) => p.nivel_conforto === "luxuoso");
      if (pb)
        setBasico({
          preco_minuto: String(pb.preco_minuto),
          acrescimo_noturno: String(pb.acrescimo_noturno || 0),
        });
      else setBasico({ preco_minuto: "", acrescimo_noturno: "" });
      if (pl)
        setLuxuoso({
          preco_minuto: String(pl.preco_minuto),
          acrescimo_noturno: String(pl.acrescimo_noturno || 0),
        });
      else setLuxuoso({ preco_minuto: "", acrescimo_noturno: "" });
    } catch {
      setError("Erro ao carregar preços.");
    } finally {
      setLoading(false);
    }
  }

  function validar() {
    const bp = parseFloat(basico.preco_minuto);
    const ba = parseFloat(basico.acrescimo_noturno);
    const lp = parseFloat(luxuoso.preco_minuto);
    const la = parseFloat(luxuoso.acrescimo_noturno);
    if (!basico.preco_minuto || isNaN(bp) || bp <= 0)
      return "Preço/minuto básico deve ser positivo.";
    if (!luxuoso.preco_minuto || isNaN(lp) || lp <= 0)
      return "Preço/minuto luxuoso deve ser positivo.";
    if (basico.acrescimo_noturno === "" || isNaN(ba) || ba < 0)
      return "Acréscimo noturno básico inválido.";
    if (luxuoso.acrescimo_noturno === "" || isNaN(la) || la < 0)
      return "Acréscimo noturno luxuoso inválido.";
    return null;
  }

  async function handleSave() {
    const err = validar();
    if (err) {
      setError(err);
      return;
    }
    setSaving(true);
    setError("");
    setSuccess("");
    try {
      for (const [nivel, dados] of [
        ["basico", basico],
        ["luxuoso", luxuoso],
      ]) {
        const existente = precos.find((p) => p.nivel_conforto === nivel);
        const body = {
          nivel_conforto: nivel,
          preco_minuto: parseFloat(dados.preco_minuto),
          acrescimo_noturno: parseFloat(dados.acrescimo_noturno),
        };
        if (existente) {
          await api.precos.atualizar(existente._id, body);
        } else {
          await api.precos.criar(body);
        }
      }
      setSuccess("Preços guardados com sucesso!");
      await fetchPrecos();
      setTimeout(() => setSuccess(""), 3000);
    } catch (e) {
      setError(e.message || "Erro ao guardar preços.");
    } finally {
      setSaving(false);
    }
  }

  if (!aberto) return null;

  return (
    <div className="cp-overlay">
      <div className="cp-backdrop" onClick={onFechar} />

      <div className="cp-modal cp-scrollbar-none">
        <div className="cp-header">
          <div className="cp-title-wrap">
            <div className="cp-icon-box is-def">
              <DollarSign size={18} strokeWidth={1.8} />
            </div>
            <div className="cp-title-text">
              <h3 className="cp-title">Definir Preços</h3>
              <p className="cp-subtitle">
                Preço por minuto e acréscimo noturno (21h–6h)
              </p>
            </div>
          </div>
          <button onClick={onFechar} className="cp-close-button">
            <X size={16} strokeWidth={2} />
          </button>
        </div>

        <div className="cp-body">
          {error && (
            <div className="cp-alert cp-alert-error">
              <AlertCircle size={16} /> {error}
            </div>
          )}
          {success && (
            <div className="cp-alert cp-alert-success">
              <CheckCircle2 size={16} /> {success}
            </div>
          )}

          {loading ? (
            <div className="cp-loading">
              <Loader2 size={18} className="cp-spin" /> A carregar preços...
            </div>
          ) : (
            <>
              {/* Básico */}
              <div className="cp-section is-basico">
                <span className="cp-badge is-basico">Básico</span>
                <div className="cp-grid-two">
                  <div>
                    <label className="cp-label">Preço / minuto (€)</label>
                    <input
                      type="number"
                      step="0.01"
                      min="0.01"
                      placeholder="Ex: 0.15"
                      value={basico.preco_minuto}
                      onChange={(e) =>
                        setBasico((p) => ({
                          ...p,
                          preco_minuto: e.target.value,
                        }))
                      }
                      className="cp-input"
                    />
                  </div>
                  <div>
                    <label className="cp-label">Acréscimo noturno (%)</label>
                    <input
                      type="number"
                      step="1"
                      min="0"
                      placeholder="Ex: 20"
                      value={basico.acrescimo_noturno}
                      onChange={(e) =>
                        setBasico((p) => ({
                          ...p,
                          acrescimo_noturno: e.target.value,
                        }))
                      }
                      className="cp-input"
                    />
                  </div>
                </div>
              </div>

              {/* Luxuoso */}
              <div className="cp-section is-luxuoso">
                <span className="cp-badge is-luxuoso">Luxuoso</span>
                <div className="cp-grid-two">
                  <div>
                    <label className="cp-label">Preço / minuto (€)</label>
                    <input
                      type="number"
                      step="0.01"
                      min="0.01"
                      placeholder="Ex: 0.25"
                      value={luxuoso.preco_minuto}
                      onChange={(e) =>
                        setLuxuoso((p) => ({
                          ...p,
                          preco_minuto: e.target.value,
                        }))
                      }
                      className="cp-input is-luxuoso"
                    />
                  </div>
                  <div>
                    <label className="cp-label">Acréscimo noturno (%)</label>
                    <input
                      type="number"
                      step="1"
                      min="0"
                      placeholder="Ex: 20"
                      value={luxuoso.acrescimo_noturno}
                      onChange={(e) =>
                        setLuxuoso((p) => ({
                          ...p,
                          acrescimo_noturno: e.target.value,
                        }))
                      }
                      className="cp-input is-luxuoso"
                    />
                  </div>
                </div>
              </div>

              <div className="cp-note">
                <Moon
                  size={14}
                  className="cp-ico-moon"
                  style={{ flex: "none" }}
                />
                Período noturno: 21:00 – 06:00. O acréscimo é aplicado em
                percentagem sobre o preço/minuto.
              </div>

              <button
                onClick={handleSave}
                disabled={saving}
                className="cp-btn cp-btn-primary"
              >
                {saving ? (
                  <>
                    <Loader2 size={16} className="cp-spin" /> A guardar...
                  </>
                ) : (
                  <>
                    <CheckCircle2 size={16} /> Guardar Preços
                  </>
                )}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════
   LISTAR PREÇOS
   ═══════════════════════════════════════════════ */
export function ListarPrecos({ aberto, onFechar, onEditar }) {
  const [precos, setPrecos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!aberto) return;
    fetchPrecos();
  }, [aberto]);

  async function fetchPrecos() {
    setLoading(true);
    setError("");
    try {
      setPrecos(await api.precos.listar());
    } catch {
      setError("Erro ao carregar preços.");
    } finally {
      setLoading(false);
    }
  }

  if (!aberto) return null;
  const basico = precos.find((p) => p.nivel_conforto === "basico");
  const luxuoso = precos.find((p) => p.nivel_conforto === "luxuoso");

  return (
    <div className="cp-overlay">
      <div className="cp-backdrop" onClick={onFechar} />

      <div className="cp-modal cp-scrollbar-none">
        <div className="cp-header">
          <div className="cp-title-wrap">
            <div className="cp-icon-box is-cyan">
              <DollarSign size={18} strokeWidth={1.8} />
            </div>
            <div className="cp-title-text">
              <h3 className="cp-title">Preços Atuais</h3>
              <p className="cp-subtitle">
                Tabela de preços por nível de conforto
              </p>
            </div>
          </div>
          <button onClick={onFechar} className="cp-close-button">
            <X size={16} strokeWidth={2} />
          </button>
        </div>

        <div className="cp-body">
          {error && (
            <div className="cp-alert cp-alert-error">
              <AlertCircle size={16} /> {error}
            </div>
          )}

          {loading ? (
            <div className="cp-loading">
              <Loader2 size={18} className="cp-spin" /> A carregar...
            </div>
          ) : precos.length === 0 ? (
            <div className="cp-empty">
              <div className="cp-empty-icon">
                <DollarSign size={28} />
              </div>
              <p className="cp-empty-title">Nenhum preço definido</p>
              <p className="cp-empty-text">
                Defina os preços para começar a cobrar viagens.
              </p>
              <button
                onClick={() => {
                  onFechar();
                  onEditar?.();
                }}
                className="cp-btn cp-btn-primary cp-btn-inline"
              >
                Definir Preços
              </button>
            </div>
          ) : (
            <div className="cp-list">
              <PrecoCard nivel="Básico" variante="basico" dados={basico} />
              <PrecoCard nivel="Luxuoso" variante="luxuoso" dados={luxuoso} />

              <div className="cp-note" style={{ marginBottom: 0 }}>
                <Moon
                  size={14}
                  className="cp-ico-moon"
                  style={{ flex: "none" }}
                />
                Período noturno: 21:00 – 06:00
              </div>

              <button
                onClick={() => {
                  onFechar();
                  onEditar?.();
                }}
                className="cp-btn cp-btn-soft"
              >
                <Pencil size={15} /> Editar Preços
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════
   SIMULAR CUSTO DE VIAGEM
   ═══════════════════════════════════════════════ */
export function SimularViagem({ aberto, onFechar }) {
  const [precos, setPrecos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [precoSelecionado, setPrecoSelecionado] = useState(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [inicio, setInicio] = useState("");
  const [fim, setFim] = useState("");
  const [resultado, setResultado] = useState(null);

  useEffect(() => {
    if (!aberto) return;
    fetchPrecos();
    setPrecoSelecionado(null);
    setResultado(null);
    setError("");
    setInicio("");
    setFim("");
  }, [aberto]);

  async function fetchPrecos() {
    setLoading(true);
    try {
      const data = await api.precos.listar();
      setPrecos(data);
    } catch {
      setError("Erro ao carregar preços.");
    } finally {
      setLoading(false);
    }
  }

  function isNoturno(hora) {
    return hora >= 21 || hora < 6;
  }

  function formatNivel(n) {
    return n === "basico" ? "Básico" : n === "luxuoso" ? "Luxuoso" : n;
  }

  function calcularCusto() {
    setError("");
    setResultado(null);

    if (!precoSelecionado) {
      setError("Selecione um preço por minuto.");
      return;
    }
    if (!inicio || !fim) {
      setError("Preencha a hora de início e fim.");
      return;
    }

    const dInicio = new Date(inicio);
    const dFim = new Date(fim);
    if (isNaN(dInicio.getTime()) || isNaN(dFim.getTime())) {
      setError("Datas inválidas.");
      return;
    }
    if (dFim <= dInicio) {
      setError("O fim deve ser posterior ao início (restrição 1).");
      return;
    }

    const precoMin = precoSelecionado.preco_minuto;
    const acrescimo = (precoSelecionado.acrescimo_noturno || 0) / 100;

    let minutosDiurnos = 0;
    let minutosNoturnos = 0;

    const cursor = new Date(dInicio);
    while (cursor < dFim) {
      if (isNoturno(cursor.getHours())) minutosNoturnos++;
      else minutosDiurnos++;
      cursor.setMinutes(cursor.getMinutes() + 1);
    }

    const custoDiurno = minutosDiurnos * precoMin;
    const custoNoturno = minutosNoturnos * precoMin * (1 + acrescimo);
    const total = custoDiurno + custoNoturno;

    setResultado({
      totalMinutos: minutosDiurnos + minutosNoturnos,
      minutosDiurnos,
      minutosNoturnos,
      custoDiurno,
      custoNoturno,
      total,
      precoMin,
      acrescimo: precoSelecionado.acrescimo_noturno || 0,
      nivel: precoSelecionado.nivel_conforto,
    });
  }

  if (!aberto) return null;

  return (
    <div className="cp-overlay">
      <div className="cp-backdrop" onClick={onFechar} />

      <div className="cp-modal cp-scrollbar-none">
        <div className="cp-header">
          <div className="cp-title-wrap">
            <div className="cp-icon-box is-cyan">
              <Calculator size={18} strokeWidth={1.8} />
            </div>
            <div className="cp-title-text">
              <h3 className="cp-title">Simular Viagem</h3>
              <p className="cp-subtitle">
                Calcular custo de uma viagem fictícia
              </p>
            </div>
          </div>
          <button onClick={onFechar} className="cp-close-button">
            <X size={16} strokeWidth={2} />
          </button>
        </div>

        <div className="cp-body">
          {error && (
            <div className="cp-alert cp-alert-error">
              <AlertCircle size={16} /> {error}
            </div>
          )}

          {loading ? (
            <div className="cp-loading">
              <Loader2 size={18} className="cp-spin" /> A carregar...
            </div>
          ) : precos.length === 0 ? (
            <div className="cp-empty">
              <div className="cp-empty-icon">
                <DollarSign size={28} />
              </div>
              <p className="cp-empty-title">Nenhum preço definido</p>
              <p className="cp-empty-text">
                Defina os preços primeiro para poder simular viagens.
              </p>
            </div>
          ) : (
            <>
              {/* Seletor de preço da BD */}
              <div>
                <label className="cp-label">
                  Preço por minuto (da base de dados)
                </label>
                <div className="cp-dropdown">
                  <button
                    type="button"
                    onClick={() => setDropdownOpen((v) => !v)}
                    className={`cp-dropdown-button ${
                      dropdownOpen ? "is-open" : ""
                    } ${precoSelecionado ? "has-value" : ""}`}
                  >
                    {precoSelecionado ? (
                      <span className="cp-dropdown-value">
                        <span
                          className={`cp-pill ${
                            precoSelecionado.nivel_conforto === "basico"
                              ? "is-basico"
                              : "is-luxuoso"
                          }`}
                        >
                          {formatNivel(precoSelecionado.nivel_conforto)}
                        </span>
                        <span className="cp-price-strong">
                          {precoSelecionado.preco_minuto.toFixed(2)}€/min
                        </span>
                        {precoSelecionado.acrescimo_noturno > 0 && (
                          <span className="cp-noturno-tag">
                            <Moon size={11} className="cp-ico-moon" />+
                            {precoSelecionado.acrescimo_noturno}% noturno
                          </span>
                        )}
                      </span>
                    ) : (
                      <span className="cp-dropdown-placeholder">
                        Selecionar preço...
                      </span>
                    )}
                    <ChevronDown
                      size={16}
                      className={`cp-dropdown-chevron ${
                        dropdownOpen ? "is-open" : ""
                      }`}
                    />
                  </button>

                  {dropdownOpen && (
                    <div className="cp-dropdown-menu">
                      {precos.map((p) => (
                        <button
                          key={p._id}
                          type="button"
                          onClick={() => {
                            setPrecoSelecionado(p);
                            setDropdownOpen(false);
                            setResultado(null);
                          }}
                          className={`cp-dropdown-option ${
                            precoSelecionado?._id === p._id ? "is-selected" : ""
                          }`}
                        >
                          <span
                            className={`cp-pill ${
                              p.nivel_conforto === "basico"
                                ? "is-basico"
                                : "is-luxuoso"
                            }`}
                          >
                            {formatNivel(p.nivel_conforto)}
                          </span>
                          <span className="cp-price-strong">
                            {p.preco_minuto.toFixed(2)}€
                            <span className="cp-price-unit">/min</span>
                          </span>
                          {p.acrescimo_noturno > 0 && (
                            <span className="cp-noturno-tag is-right">
                              <Moon size={11} className="cp-ico-moon" />+
                              {p.acrescimo_noturno}%
                            </span>
                          )}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Resumo do preço selecionado */}
              {precoSelecionado && (
                <div className="cp-summary">
                  <div>
                    <div className="cp-summary-label">Nível</div>
                    <div className="cp-summary-value">
                      {formatNivel(precoSelecionado.nivel_conforto)}
                    </div>
                  </div>
                  <div>
                    <div className="cp-summary-label">
                      <Sun size={10} className="cp-ico-sun" />
                      Diurno
                    </div>
                    <div className="cp-summary-value">
                      {precoSelecionado.preco_minuto.toFixed(2)}€/min
                    </div>
                  </div>
                  <div>
                    <div className="cp-summary-label">
                      <Moon size={10} className="cp-ico-moon" />
                      Noturno
                    </div>
                    <div className="cp-summary-value is-noturno">
                      {(
                        precoSelecionado.preco_minuto *
                        (1 + (precoSelecionado.acrescimo_noturno || 0) / 100)
                      ).toFixed(2)}
                      €/min
                    </div>
                  </div>
                </div>
              )}

              {/* Hora início e fim */}
              <div className="cp-grid-two" style={{ marginBottom: 16 }}>
                <div>
                  <label className="cp-label">Início da viagem</label>
                  <input
                    type="datetime-local"
                    value={inicio}
                    onChange={(e) => {
                      setInicio(e.target.value);
                      setResultado(null);
                    }}
                    className="cp-input"
                  />
                </div>
                <div>
                  <label className="cp-label">Fim da viagem</label>
                  <input
                    type="datetime-local"
                    value={fim}
                    onChange={(e) => {
                      setFim(e.target.value);
                      setResultado(null);
                    }}
                    className="cp-input"
                  />
                </div>
              </div>

              <div className="cp-note">
                <Clock
                  size={14}
                  className="cp-ico-clock"
                  style={{ flex: "none" }}
                />
                A viagem pode cruzar o período diurno e noturno, e até dias
                consecutivos.
              </div>

              <button
                onClick={calcularCusto}
                className="cp-btn cp-btn-cyan"
                style={{ marginBottom: 20 }}
              >
                <Calculator size={16} /> Calcular Custo
              </button>

              {/* Resultado */}
              {resultado && (
                <div className="cp-result">
                  <div className="cp-result-total-label">
                    Custo total da viagem
                  </div>
                  <div className="cp-result-total">
                    {resultado.total.toFixed(2)}€
                  </div>
                  <div className="cp-result-meta">
                    {resultado.totalMinutos} minutos ·{" "}
                    {formatNivel(resultado.nivel)} · {resultado.precoMin}€/min
                  </div>

                  <div className="cp-result-grid">
                    <div className="cp-stat">
                      <div className="cp-stat-head">
                        <Sun size={13} className="cp-ico-sun" />
                        Diurno
                      </div>
                      <div className="cp-stat-value">
                        {resultado.custoDiurno.toFixed(2)}€
                      </div>
                      <div className="cp-stat-sub">
                        {resultado.minutosDiurnos} min × {resultado.precoMin}€
                      </div>
                    </div>
                    <div className="cp-stat is-noturno">
                      <div className="cp-stat-head">
                        <Moon size={13} className="cp-ico-moon" />
                        Noturno
                      </div>
                      <div className="cp-stat-value">
                        {resultado.custoNoturno.toFixed(2)}€
                      </div>
                      <div className="cp-stat-sub">
                        {resultado.minutosNoturnos} min × {resultado.precoMin}€
                        × {(1 + resultado.acrescimo / 100).toFixed(2)}
                      </div>
                    </div>
                  </div>

                  {resultado.acrescimo > 0 && (
                    <div className="cp-result-foot">
                      <Moon size={12} className="cp-ico-moon" />
                      Acréscimo noturno de {resultado.acrescimo}% aplicado entre
                      21:00 e 06:00
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

/* ── Card de preço individual ── */
function PrecoCard({ nivel, variante, dados }) {
  if (!dados) {
    return (
      <div className="cp-preco-card is-empty">
        <span className={`cp-badge is-${variante}`}>{nivel}</span>
        <p className="cp-preco-empty-text">Preço não definido</p>
      </div>
    );
  }

  const precoNoturno =
    dados.preco_minuto * (1 + (dados.acrescimo_noturno || 0) / 100);

  return (
    <div className={`cp-preco-card is-${variante}`}>
      <span className={`cp-badge is-${variante}`}>{nivel}</span>

      <div className="cp-preco-grid">
        <div className="cp-stat">
          <div className="cp-stat-head">
            <Sun size={13} className="cp-ico-sun" />
            Diurno
          </div>
          <div className="cp-stat-value">{dados.preco_minuto.toFixed(2)}€</div>
          <div className="cp-stat-sub">por minuto</div>
        </div>
        <div className="cp-stat is-noturno">
          <div className="cp-stat-head">
            <Moon size={13} className="cp-ico-moon" />
            Noturno
          </div>
          <div className="cp-stat-value">{precoNoturno.toFixed(2)}€</div>
          <div className="cp-stat-sub">por minuto</div>
        </div>
      </div>

      {dados.acrescimo_noturno > 0 && (
        <div className="cp-preco-foot">
          <Moon size={11} className="cp-ico-moon" />
          Acréscimo noturno: +{dados.acrescimo_noturno}%
        </div>
      )}
    </div>
  );
}
