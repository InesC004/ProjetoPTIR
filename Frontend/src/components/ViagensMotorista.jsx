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
  const [processingId, setProcessingId] = useState(null);

  function carregarViagens() {
    const guardadas = JSON.parse(
      localStorage.getItem("viagensConfirmadasMotorista") || "[]",
    );

    setViagens(guardadas);
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

    localStorage.setItem(
      "viagensConfirmadasMotorista",
      JSON.stringify(atualizadas),
    );

    setViagens(atualizadas);
    setProcessingId(null);
  }

  return (
    <div className="vm-wrap">
      <div className="vm-toolbar">
        <div>
          <p className="vm-eyebrow">Viagens</p>
          <h3>Viagens em curso</h3>
          <p>
            Aqui aparecem as viagens depois de clicar em Iniciar viagem na
            confirmação aceite.
          </p>
        </div>
      </div>

      {viagens.length === 0 ? (
        <div className="vm-empty">
          <span>
            <Clock size={28} />
          </span>
          <strong>Nenhuma viagem em curso</strong>
          <p>Quando iniciar uma confirmação aceite, a viagem aparece aqui.</p>
        </div>
      ) : (
        <div className="vm-list">
          {viagens.map((pedido) => (
            <article className="vm-card" key={getId(pedido)}>
              <div className="vm-card-top">
                <div>
                  <span className="vm-badge">
                    <CheckCircle2 size={14} />
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
                className="vm-btn vm-btn-active"
                type="button"
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
    </div>
  );
}
