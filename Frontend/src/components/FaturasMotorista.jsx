import { useEffect, useState, useCallback } from "react";
import {
  FileText,
  Receipt,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Euro,
  Hash,
  Calendar,
  User,
} from "lucide-react";
import api from "../Api";
import "../css/faturasMotorista.css";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatData(isoString) {
  if (!isoString) return "—";
  return new Date(isoString).toLocaleDateString("pt-PT", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatEuros(valor) {
  if (valor === undefined || valor === null) return "—";
  return `${Number(valor).toFixed(2)} €`;
}

function getMongoId(valor) {
  if (!valor) return null;
  if (typeof valor === "string") return valor;
  return valor._id || valor.id || null;
}

function getViagemId(pedido) {
  return getMongoId(pedido?.viagem_id) || getMongoId(pedido?.viagem) || null;
}

function getFaturaNumero(fatura) {
  if (fatura.numero_fatura) return fatura.numero_fatura;
  if (fatura.numero_sequencial && fatura.ano) {
    return `${fatura.ano}/${String(fatura.numero_sequencial).padStart(4, "0")}`;
  }
  return fatura._id?.slice(-6) || "—";
}

// ---------------------------------------------------------------------------
// Componente principal
// ---------------------------------------------------------------------------

export default function FaturasMotorista() {
  const [faturas, setFaturas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState(null);

  // Viagens terminadas que ainda não têm fatura emitida
  const [pendentes, setPendentes] = useState([]);
  const [emitindoId, setEmitindoId] = useState(null);
  const [feedback, setFeedback] = useState(null); // { tipo: 'ok'|'erro', msg }

  // Carregar faturas do motorista autenticado
  const carregarFaturas = useCallback(async () => {
    setLoading(true);
    setErro(null);
    try {
      const data = await api.faturas.listarMinhas();
      setFaturas(data.faturas || []);
    } catch (e) {
      setErro(e.message || "Não foi possível carregar as faturas.");
    } finally {
      setLoading(false);
    }
  }, []);

  // Carregar viagens terminadas (sem fatura emitida) do localStorage
  const carregarPendentes = useCallback(() => {
    const terminadas = JSON.parse(
      localStorage.getItem("viagensTerminadasMotorista") || "[]",
    );
    setPendentes(
      terminadas.filter(
        (viagem) =>
          !viagem.fatura_emitida &&
          (viagem.pagamento_confirmado || viagem.pagamento_estado === "pago"),
      ),
    );
  }, []);

  useEffect(() => {
    carregarFaturas();
    carregarPendentes();

    window.addEventListener("viagensConfirmadasAtualizadas", carregarPendentes);
    return () =>
      window.removeEventListener(
        "viagensConfirmadasAtualizadas",
        carregarPendentes,
      );
  }, [carregarFaturas, carregarPendentes]);

  // Emitir fatura para uma viagem
  async function emitirFatura(pedido) {
    const viagemId = getViagemId(pedido);
    if (!viagemId) {
      setFeedback({ tipo: "erro", msg: "ID de viagem inválido." });
      return;
    }

    setEmitindoId(viagemId);
    setFeedback(null);

    try {
      await api.faturas.emitir(viagemId);
      setFeedback({ tipo: "ok", msg: "Fatura emitida com sucesso!" });

      const terminadas = JSON.parse(
        localStorage.getItem("viagensTerminadasMotorista") || "[]",
      );
      const atualizadas = terminadas.map((viagem) =>
        getViagemId(viagem) === viagemId
          ? { ...viagem, fatura_emitida: true }
          : viagem,
      );
      localStorage.setItem(
        "viagensTerminadasMotorista",
        JSON.stringify(atualizadas),
      );
      carregarPendentes();
      await carregarFaturas();
      window.dispatchEvent(new Event("viagensConfirmadasAtualizadas"));
    } catch (e) {
      setFeedback({ tipo: "erro", msg: e.message || "Erro ao emitir fatura." });
    } finally {
      setEmitindoId(null);
      setTimeout(() => setFeedback(null), 4000);
    }
  }

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <div className="ft-wrap">
      {/* ── Cabeçalho ── */}
      <div className="ft-toolbar">
        <div className="ft-toolbar-left">
          <span className="ft-icon-box">
            <Receipt size={20} />
          </span>
          <div>
            <p className="ft-eyebrow">Faturas</p>
            <h3 className="ft-title">Emissão de Faturas</h3>
          </div>
        </div>
      </div>

      {/* ── Feedback global ── */}
      {feedback && (
        <div className={`ft-feedback ft-feedback--${feedback.tipo}`}>
          {feedback.tipo === "ok" ? (
            <CheckCircle2 size={16} />
          ) : (
            <AlertCircle size={16} />
          )}
          {feedback.msg}
        </div>
      )}

      {/* ══════════════════════════════════════════
          SECÇÃO 1 — Viagens terminadas / pendentes
      ══════════════════════════════════════════ */}
      <section className="ft-section">
        <div className="ft-section-head">
          <p className="ft-eyebrow">Pendentes</p>
          <h4>Viagens sem fatura emitida</h4>
          <p className="ft-section-sub">
            Após o pagamento confirmado, clique em Emitir fatura.
          </p>
        </div>

        {pendentes.length === 0 ? (
          <div className="ft-empty">
            <CheckCircle2 size={26} />
            <strong>Sem viagens pendentes</strong>
            <p>
              Todas as viagens já têm fatura emitida ou não há viagens
              concluídas.
            </p>
          </div>
        ) : (
          <div className="ft-list">
            {pendentes.map((pedido, idx) => {
              const vid = getViagemId(pedido) || pedido?._id || pedido?.id || idx;
              const isLoading = emitindoId === vid;
              return (
                <article className="ft-card ft-card--pendente" key={vid}>
                  <div className="ft-card-info">
                    <div className="ft-row">
                      <span className="ft-meta-label">Origem</span>
                      <span className="ft-meta-value">
                        {pedido.origem_morada || "—"}
                      </span>
                    </div>
                    <div className="ft-row">
                      <span className="ft-meta-label">Destino</span>
                      <span className="ft-meta-value">
                        {pedido.destino_morada || "—"}
                      </span>
                    </div>
                    {(pedido.preco_final ?? pedido.preco) !== undefined && (
                      <div className="ft-row">
                        <span className="ft-meta-label">Valor</span>
                        <span className="ft-meta-value ft-price">
                          {formatEuros(pedido.preco_final ?? pedido.preco)}
                        </span>
                      </div>
                    )}
                  </div>

                  <button
                    type="button"
                    className="ft-btn ft-btn--primary"
                    onClick={() => emitirFatura(pedido)}
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <Loader2 size={15} className="ft-spin" />
                    ) : (
                      <FileText size={15} />
                    )}
                    {isLoading ? "A emitir…" : "Emitir fatura"}
                  </button>
                </article>
              );
            })}
          </div>
        )}
      </section>

      {/* ══════════════════════════════════════════
          SECÇÃO 2 — Histórico de faturas emitidas
      ══════════════════════════════════════════ */}
      <section className="ft-section">
        <div className="ft-section-head">
          <p className="ft-eyebrow">Histórico</p>
          <h4>Faturas emitidas</h4>
          <p className="ft-section-sub">
            Ordenadas da mais recente para a mais antiga.
          </p>
        </div>

        {loading ? (
          <div className="ft-loading">
            <Loader2 size={26} className="ft-spin" />
            <span>A carregar faturas…</span>
          </div>
        ) : erro ? (
          <div className="ft-error">
            <AlertCircle size={22} />
            <span>{erro}</span>
            <button
              type="button"
              className="ft-btn ft-btn--ghost"
              onClick={carregarFaturas}
            >
              Tentar novamente
            </button>
          </div>
        ) : faturas.length === 0 ? (
          <div className="ft-empty">
            <FileText size={26} />
            <strong>Nenhuma fatura emitida</strong>
            <p>As faturas que emitir aparecem aqui.</p>
          </div>
        ) : (
          <div className="ft-list">
            {faturas.map((f) => (
              <article className="ft-card ft-card--emitida" key={f._id}>
                {/* Número */}
                <div className="ft-card-badge">
                  <Hash size={13} />
                  {getFaturaNumero(f)}
                </div>

                <div className="ft-card-body">
                  <div className="ft-row">
                    <span className="ft-meta-label">
                      <Calendar size={13} /> Data
                    </span>
                    <span className="ft-meta-value">
                      {formatData(f.data_emissao || f.data || f.createdAt)}
                    </span>
                  </div>

                  <div className="ft-row">
                    <span className="ft-meta-label">
                      <User size={13} /> NIF Cliente
                    </span>
                    <span className="ft-meta-value">
                      {f.nif_cliente || "—"}
                    </span>
                  </div>

                  {f.cliente_id?.nome && (
                    <div className="ft-row">
                      <span className="ft-meta-label">
                        <User size={13} /> Nome
                      </span>
                      <span className="ft-meta-value">{f.cliente_id.nome}</span>
                    </div>
                  )}

                  <div className="ft-row ft-row--highlight">
                    <span className="ft-meta-label">
                      <Euro size={13} /> Total
                    </span>
                    <span className="ft-price">
                      {formatEuros(f.valor_total ?? f.valor)}
                    </span>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
