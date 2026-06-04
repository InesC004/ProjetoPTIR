import { useEffect, useState } from "react";
import {
  CheckCircle2,
  Clock,
  FileText,
  Loader2,
  MapPin,
  Receipt,
  Route,
  Users,
  Euro,
  AlertCircle,
} from "lucide-react";
import api from "../Api";
import "../css/viagensMotorista.css";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function getId(pedido) {
  return pedido?._id || pedido?.id;
}

function getMongoId(valor) {
  if (!valor) return null;
  if (typeof valor === "string") return valor;
  return valor._id || valor.id || null;
}

function getViagemId(pedido) {
  return getMongoId(pedido?.viagem_id) || null;
}

function getMorada(valor) {
  return valor || "Morada não indicada";
}

function getDistancia(pedido) {
  const distancia = pedido?.distancia_km ?? pedido?.distancia;
  if (distancia === undefined || distancia === null || distancia === "")
    return "—";
  return `${Number(distancia).toFixed(2)} km`;
}

function getTempo(pedido) {
  const tempo = pedido?.tempo_estimado_min ?? pedido?.tempo_estimado;
  if (tempo === undefined || tempo === null || tempo === "") return "—";
  return `${Math.round(Number(tempo))} min`;
}

function getPreco(pedido) {
  const preco =
    pedido?.preco_final ?? pedido?.preco ?? pedido?.valor ?? pedido?.preco_viagem;
  if (preco === undefined || preco === null) return null;
  return `${Number(preco).toFixed(2)} €`;
}

function normalizarTerminada(pedido) {
  const pagamentoOk =
    pedido?.pagamento_estado === "pago" || !!pedido?.pagamento_confirmado;

  return {
    ...pedido,
    estado: pagamentoOk ? "concluido" : "pagamento_pendente",
    estadoViagem: "terminada",
    pagamento_confirmado: pagamentoOk,
  };
}

// ---------------------------------------------------------------------------
// Componente principal
// ---------------------------------------------------------------------------

export default function ViagensMotorista() {
  const [viagens, setViagens] = useState([]);
  const [viagensTerminadas, setViagensTerminadas] = useState([]);
  const [processingId, setProcessingId] = useState(null);

  // Estado para emissão de faturas: { [id]: 'loading' | 'ok' | 'erro' | msg }
  const [faturaEstado, setFaturaEstado] = useState({});

  async function carregarViagens() {
    const guardadas = JSON.parse(
      localStorage.getItem("viagensConfirmadasMotorista") || "[]",
    );
    const terminadas = JSON.parse(
      localStorage.getItem("viagensTerminadasMotorista") || "[]",
    );
    setViagens(guardadas);
    setViagensTerminadas(terminadas.map(normalizarTerminada));

    const atualizadas = await Promise.all(
      terminadas.map(async (pedido) => {
        try {
          const data = await api.pedidos.obter(getId(pedido));
          return normalizarTerminada({
            ...pedido,
            ...(data.pedido || {}),
          });
        } catch {
          return normalizarTerminada(pedido);
        }
      }),
    );

    localStorage.setItem(
      "viagensTerminadasMotorista",
      JSON.stringify(atualizadas),
    );
    setViagensTerminadas(atualizadas);
  }

  useEffect(() => {
    carregarViagens();
    const interval = setInterval(carregarViagens, 4000);
    window.addEventListener("viagensConfirmadasAtualizadas", carregarViagens);
    window.addEventListener("storage", carregarViagens);
    return () => {
      clearInterval(interval);
      window.removeEventListener(
        "viagensConfirmadasAtualizadas",
        carregarViagens,
      );
      window.removeEventListener("storage", carregarViagens);
    };
  }, []);

  // ── Terminar viagem ──────────────────────────────────────────────────────
  async function terminarViagem(pedido) {
    const id = getId(pedido);
    if (!id) return;

    setProcessingId(id);

    try {
      const data = await api.pedidos.terminarViagem(id);
      const pedidoAtualizado = data?.pedido || pedido;

      const atualizadas = viagens.filter((v) => getId(v) !== id);
      const terminadasAtuais = JSON.parse(
        localStorage.getItem("viagensTerminadasMotorista") || "[]",
      );

      const terminada = {
        ...pedido,
        ...pedidoAtualizado,
        estado: "pagamento_pendente",
        estadoViagem: "terminada",
        data_fim: new Date().toISOString(),
        pagamento_estado: pedidoAtualizado.pagamento_estado || "pendente",
        pagamento_confirmado: false,
      };

      localStorage.setItem(
        "viagensConfirmadasMotorista",
        JSON.stringify(atualizadas),
      );
      localStorage.setItem(
        "viagensTerminadasMotorista",
        JSON.stringify([terminada, ...terminadasAtuais]),
      );

      setViagens(atualizadas);
      setViagensTerminadas([terminada, ...terminadasAtuais]);
      window.dispatchEvent(new Event("viagensConfirmadasAtualizadas"));
    } catch (err) {
      alert(err.message || "Não foi possível terminar a viagem.");
    } finally {
      setProcessingId(null);
    }
  }

  // ── Emitir fatura ────────────────────────────────────────────────────────
  async function emitirFatura(pedido) {
    const id = getId(pedido);
    const viagemId = getViagemId(pedido);
    if (!viagemId) return;

    setFaturaEstado((prev) => ({ ...prev, [id]: "loading" }));

    try {
      await api.faturas.emitir(viagemId);

      const terminadasAtuais = JSON.parse(
        localStorage.getItem("viagensTerminadasMotorista") || "[]",
      );
      const atualizadas = terminadasAtuais.map((v) =>
        getId(v) === id || getViagemId(v) === viagemId
          ? { ...v, fatura_emitida: true }
          : v,
      );
      localStorage.setItem(
        "viagensTerminadasMotorista",
        JSON.stringify(atualizadas),
      );
      setViagensTerminadas(atualizadas);

      setFaturaEstado((prev) => ({ ...prev, [id]: "ok" }));
    } catch (err) {
      setFaturaEstado((prev) => ({
        ...prev,
        [id]: err.message || "Erro ao emitir fatura.",
      }));
    }
  }

  // ── Eliminar ─────────────────────────────────────────────────────────────
  function eliminarViagemTerminada(pedido) {
    const id = getId(pedido);
    if (!id) return;
    const atualizadas = viagensTerminadas.filter((v) => getId(v) !== id);
    localStorage.setItem(
      "viagensTerminadasMotorista",
      JSON.stringify(atualizadas),
    );
    setViagensTerminadas(atualizadas);
  }

  function eliminarTodasViagensTerminadas() {
    localStorage.removeItem("viagensTerminadasMotorista");
    setViagensTerminadas([]);
  }

  // ── Render ───────────────────────────────────────────────────────────────
  return (
    <div className="vm-wrap">
      {/* ══ Viagens em curso ══ */}
      <div className="vm-toolbar">
        <div>
          <p className="vm-eyebrow">Viagens</p>
          <h3>Viagens em curso</h3>
          <p>Aqui aparecem as viagens iniciadas.</p>
        </div>
      </div>

      {viagens.length === 0 ? (
        <div className="vm-empty">
          <span>
            <Clock size={28} />
          </span>
          <strong>Nenhuma viagem em curso</strong>
          <p>Quando iniciar uma viagem, ela aparece aqui.</p>
        </div>
      ) : (
        <div className="vm-list">
          {viagens.map((pedido) => (
            <article className="vm-card" key={getId(pedido)}>
              <div className="vm-card-top">
                <div>
                  <span className="vm-badge">
                    <Clock size={14} />
                    Em curso
                  </span>
                  <h4>{getMorada(pedido.origem_morada)}</h4>
                  <p>Destino: {getMorada(pedido.destino_morada)}</p>
                </div>
              </div>

              <div className="vm-metrics">
                <div>
                  <Users size={15} />
                  <span>{pedido.numero_pessoas || "—"} pessoa(s)</span>
                </div>
                <div>
                  <MapPin size={15} />
                  <span>{getDistancia(pedido)}</span>
                </div>
                <div>
                  <Route size={15} />
                  <span>{getTempo(pedido)}</span>
                </div>
                {getPreco(pedido) && (
                  <div>
                    <Euro size={15} />
                    <span>{getPreco(pedido)}</span>
                  </div>
                )}
              </div>

              <button
                type="button"
                className="vm-btn"
                onClick={() => terminarViagem(pedido)}
                disabled={processingId === getId(pedido)}
              >
                {processingId === getId(pedido) ? (
                  <Loader2 size={16} className="vm-spin" />
                ) : (
                  <CheckCircle2 size={16} />
                )}
                Terminar viagem
              </button>
            </article>
          ))}
        </div>
      )}

      {/* ══ Viagens terminadas ══ */}
      <div className="vm-toolbar vm-toolbar-history">
        <div>
          <p className="vm-eyebrow">Histórico</p>
          <h3>Viagens terminadas</h3>
          <p>Aqui aparecem as viagens concluídas.</p>
        </div>
        {viagensTerminadas.length > 0 && (
          <button
            type="button"
            className="vm-btn vm-btn-danger"
            onClick={eliminarTodasViagensTerminadas}
          >
            Eliminar todas
          </button>
        )}
      </div>

      {viagensTerminadas.length === 0 ? (
        <div className="vm-empty vm-empty-small">
          <span>
            <CheckCircle2 size={28} />
          </span>
          <strong>Nenhuma viagem terminada</strong>
          <p>Quando terminar uma viagem, ela aparece aqui.</p>
        </div>
      ) : (
        <div className="vm-list">
          {viagensTerminadas.map((pedido) => {
            const id = getId(pedido);
            const faturaOk = pedido.fatura_emitida || faturaEstado[id] === "ok";
            const faturaLoading = faturaEstado[id] === "loading";
            const faturaErro =
              faturaEstado[id] &&
              faturaEstado[id] !== "loading" &&
              faturaEstado[id] !== "ok";
            const pagamentoOk =
              !!pedido.pagamento_confirmado || pedido.pagamento_estado === "pago";

            return (
              <article
                className="vm-card vm-card-ended"
                key={`${id}-terminada`}
              >
                <div className="vm-card-top">
                  <div>
                    <span className="vm-badge vm-badge-ended">
                      <CheckCircle2 size={14} />
                      {pagamentoOk ? "Concluída" : "Pagamento pendente"}
                    </span>
                    <h4>{getMorada(pedido.origem_morada)}</h4>
                    <p>Destino: {getMorada(pedido.destino_morada)}</p>
                  </div>
                </div>

                <div className="vm-metrics">
                  <div>
                    <Users size={15} />
                    <span>{pedido.numero_pessoas || "—"} pessoa(s)</span>
                  </div>
                  <div>
                    <MapPin size={15} />
                    <span>{getDistancia(pedido)}</span>
                  </div>
                  <div>
                    <Route size={15} />
                    <span>{getTempo(pedido)}</span>
                  </div>
                  {getPreco(pedido) && (
                    <div>
                      <Euro size={15} />
                      <span className="vm-price">{getPreco(pedido)}</span>
                    </div>
                  )}
                </div>

                {/* TODO: mostrar estado do pagamento quando estiver implementado
                <div className="vm-payment-status">
                  {pagamentoOk ? (
                    <span className="vm-payment-ok">
                      <CheckCircle2 size={13} />
                      Pagamento confirmado
                    </span>
                  ) : (
                    <span className="vm-payment-pending">
                      <Clock size={13} />
                      A aguardar pagamento do cliente…
                    </span>
                  )}
                </div>
                */}

                {/* Botão emitir fatura — desbloqueado temporariamente para testes
                    TODO: adicionar disabled={!pagamentoOk} quando pagamento estiver pronto */}
                {faturaOk ? (
                  <div className="vm-fatura-ok">
                    <Receipt size={14} />
                    Fatura emitida
                  </div>
                ) : (
                  <>
                    <button
                      type="button"
                      className={`vm-btn vm-btn-fatura ${!pagamentoOk ? "vm-btn-disabled" : ""}`}
                      onClick={() => emitirFatura(pedido)}
                      disabled={!pagamentoOk || faturaLoading}
                      title={
                        !pagamentoOk
                          ? "Aguarda confirmação do pagamento para emitir a fatura"
                          : "Emitir fatura desta viagem"
                      }
                    >
                      {faturaLoading ? (
                        <Loader2 size={15} className="vm-spin" />
                      ) : (
                        <FileText size={15} />
                      )}
                      {faturaLoading ? "A emitir…" : "Emitir fatura"}
                    </button>

                    {faturaErro && (
                      <p className="vm-fatura-erro">
                        <AlertCircle size={13} />
                        {faturaEstado[id]}
                      </p>
                    )}
                  </>
                )}

                <div className="vm-ended-actions">
                  <button
                    type="button"
                    className="vm-ended-delete"
                    onClick={() => eliminarViagemTerminada(pedido)}
                  >
                    Eliminar
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
