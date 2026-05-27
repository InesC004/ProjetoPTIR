import { useEffect, useState } from "react";
import {
  CheckCircle2,
  Clock,
  Loader2,
  MapPin,
  Route,
  Users,
} from "lucide-react";
import "../css/ViagensMotorista.css";

function getId(pedido) {
  return pedido?._id || pedido?.id;
}

function getMorada(valor) {
  return valor || "Morada não indicada";
}

function getDistancia(pedido) {
  const distancia = pedido?.distancia_km ?? pedido?.distancia;

  if (distancia === undefined || distancia === null || distancia === "") {
    return "—";
  }

  return `${Number(distancia).toFixed(2)} km`;
}

function getTempo(pedido) {
  const tempo = pedido?.tempo_estimado_min ?? pedido?.tempo_estimado;

  if (tempo === undefined || tempo === null || tempo === "") {
    return "—";
  }

  return `${Math.round(Number(tempo))} min`;
}

export default function ViagensMotorista() {
  const [viagens, setViagens] = useState([]);
  const [viagensTerminadas, setViagensTerminadas] = useState([]);
  const [processingId, setProcessingId] = useState(null);

  function carregarViagens() {
    const guardadas = JSON.parse(
      localStorage.getItem("viagensConfirmadasMotorista") || "[]",
    );

    const terminadas = JSON.parse(
      localStorage.getItem("viagensTerminadasMotorista") || "[]",
    );

    setViagens(guardadas);
    setViagensTerminadas(terminadas);
  }

  useEffect(() => {
    carregarViagens();

    window.addEventListener("viagensConfirmadasAtualizadas", carregarViagens);

    return () => {
      window.removeEventListener(
        "viagensConfirmadasAtualizadas",
        carregarViagens,
      );
    };
  }, []);

  function terminarViagem(pedido) {
    const id = getId(pedido);
    if (!id) return;

    setProcessingId(id);

    const atualizadas = viagens.filter((v) => getId(v) !== id);

    const terminadasAtuais = JSON.parse(
      localStorage.getItem("viagensTerminadasMotorista") || "[]",
    );

    const terminada = {
      ...pedido,
      estado: "concluido",
      estadoViagem: "terminada",
      data_fim: new Date().toISOString(),
    };

    localStorage.setItem(
      "viagensConfirmadasMotorista",
      JSON.stringify(atualizadas),
    );

    localStorage.setItem(
      "viagensTerminadasMotorista",
      JSON.stringify([terminada, ...terminadasAtuais]),
    );

    const pedidosConcluidos = JSON.parse(
      localStorage.getItem("pedidosConcluidosFrontend") || "[]",
    );

    if (!pedidosConcluidos.includes(id)) {
      localStorage.setItem(
        "pedidosConcluidosFrontend",
        JSON.stringify([id, ...pedidosConcluidos]),
      );
    }

    const pedidosEmViagem = JSON.parse(
      localStorage.getItem("pedidosEmViagemFrontend") || "[]",
    );

    localStorage.setItem(
      "pedidosEmViagemFrontend",
      JSON.stringify(pedidosEmViagem.filter((item) => item !== id)),
    );

    setViagens(atualizadas);
    setViagensTerminadas([terminada, ...terminadasAtuais]);
    setProcessingId(null);

    window.dispatchEvent(new Event("viagensConfirmadasAtualizadas"));
    window.dispatchEvent(new Event("pedidoClienteAtualizado"));
    }

  return (
    <div className="vm-wrap">
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

      <div className="vm-toolbar vm-toolbar-history">
        <div>
          <p className="vm-eyebrow">Histórico</p>
          <h3>Viagens terminadas</h3>
          <p>Aqui aparecem as viagens concluídas.</p>
        </div>
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
          {viagensTerminadas.map((pedido) => (
            <article
              className="vm-card vm-card-ended"
              key={`${getId(pedido)}-terminada`}
            >
              <div className="vm-card-top">
                <div>
                  <span className="vm-badge vm-badge-ended">
                    <CheckCircle2 size={14} />
                    Terminada
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
              </div>

              <p className="vm-ended-note">Concluída</p>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
