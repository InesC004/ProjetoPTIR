import { useEffect, useMemo, useState } from "react";
import Header from "../components/Header2";
import "../css/historicoCliente.css";

import { Link } from "react-router-dom";

const HISTORICO_CLIENTE_KEY = "historicoViagensCliente";

function obterHistorico() {
  try {
    return JSON.parse(localStorage.getItem(HISTORICO_CLIENTE_KEY) || "[]");
  } catch {
    return [];
  }
}
function guardarHistorico(historico) {
  localStorage.setItem(
    HISTORICO_CLIENTE_KEY,
    JSON.stringify(historico),
  );

  window.dispatchEvent(new Event("historicoClienteAtualizado"));
}

function formatarData(valor) {
  if (!valor) return "Data indisponível";

  const data = new Date(valor);

  if (Number.isNaN(data.getTime())) {
    return "Data indisponível";
  }

  return new Intl.DateTimeFormat("pt-PT", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(data);
}

function formatarPreco(valor) {
  const preco = Number(valor);

  if (!Number.isFinite(preco) || preco <= 0) {
    return null;
  }

  return `${preco.toFixed(2).replace(".", ",")} €`;
}

function obterId(viagem) {
  return viagem.id || viagem._id || `${viagem.data}-${viagem.origem}`;
}

export default function HistoricoCliente() {
  const [filtro, setFiltro] = useState("todas");
const [historico, setHistorico] = useState(() => obterHistorico());
const [confirmacao, setConfirmacao] = useState(null);

useEffect(() => {
  function atualizarHistorico() {
    setHistorico(obterHistorico());
  }

  window.addEventListener("historicoClienteAtualizado", atualizarHistorico);
  window.addEventListener("storage", atualizarHistorico);

  return () => {
    window.removeEventListener(
      "historicoClienteAtualizado",
      atualizarHistorico,
    );

    window.removeEventListener("storage", atualizarHistorico);
  };
}, []);
function pedirEliminacaoViagem(id) {
  setConfirmacao({
    tipo: "uma",
    id,
    titulo: "Tem a certeza que quer eliminar esta viagem?",
    mensagem:
      "Esta viagem será removida do seu histórico. Esta ação não pode ser anulada.",
  });
}

function pedirEliminacaoHistorico() {
  setConfirmacao({
    tipo: "todas",
    titulo: "Tem a certeza que quer eliminar todo o histórico?",
    mensagem:
      "Todas as viagens concluídas e canceladas serão removidas. Esta ação não pode ser anulada.",
  });
}

function fecharConfirmacao() {
  setConfirmacao(null);
}

function confirmarEliminacao() {
  if (!confirmacao) return;

  if (confirmacao.tipo === "uma") {
    const historicoAtualizado = historico.filter(
      (viagem) => String(obterId(viagem)) !== String(confirmacao.id),
    );

    guardarHistorico(historicoAtualizado);
    setHistorico(historicoAtualizado);
  }

  if (confirmacao.tipo === "todas") {
    guardarHistorico([]);
    setHistorico([]);
  }

  fecharConfirmacao();
}
  const viagensFiltradas = useMemo(() => {
    if (filtro === "todas") return historico;

    return historico.filter((viagem) => viagem.estado === filtro);
  }, [filtro, historico]);

  return (
    <div className="historico-pagina">
      <Header />

      <main className="historico-conteudo">
        <section className="historico-topo">
            <Link className="btn-voltar-dashboard" to="/Dashboard">
                ← Voltar à página principal
                </Link>
          <span className="historico-eyebrow">TakeCab</span>

          <h1>Histórico de viagens</h1>

          <p>
            Consulte as suas viagens concluídas e os pedidos que foram
            cancelados.
          </p>
        </section>

        <section className="historico-filtros" aria-label="Filtros do histórico">
          <button
            type="button"
            className={filtro === "todas" ? "ativo" : ""}
            onClick={() => setFiltro("todas")}
          >
            Todas
          </button>

          <button
            type="button"
            className={filtro === "concluida" ? "ativo" : ""}
            onClick={() => setFiltro("concluida")}
          >
            Concluídas
          </button>

          <button
            type="button"
            className={filtro === "cancelada" ? "ativo" : ""}
            onClick={() => setFiltro("cancelada")}
          >
            Canceladas
          </button>
          {historico.length > 0 && (
            <button
            type="button"
            className="btn-limpar-historico"
            onClick={pedirEliminacaoHistorico}
            >
            🗑️ Apagar todo o histórico
            </button>
)}
        </section>

        {viagensFiltradas.length === 0 ? (
          <section className="historico-vazio">
            <span aria-hidden="true">🚕</span>

            <h2>Ainda não existem viagens neste histórico</h2>

            <p>
              As viagens concluídas e canceladas passam a aparecer aqui.
            </p>
          </section>
        ) : (
          <section className="historico-lista">
            {viagensFiltradas.map((viagem) => {
              const preco = formatarPreco(viagem.preco);

              return (
                <article className="historico-card" key={obterId(viagem)}>
                  <div className="historico-card-topo">
                    <span
                      className={`historico-estado ${viagem.estado}`}
                    >
                      {viagem.estado === "concluida"
                        ? "Concluída"
                        : "Cancelada"}
                    </span>

                    <span className="historico-data">
                      {formatarData(viagem.data)}
                    </span>
                  </div>

                  <div className="historico-rota">
                    <div>
                      <span
                        className="historico-ponto partida"
                        aria-hidden="true"
                      />

                      <p>
                        <small>Partida</small>
                        <strong>{viagem.origem || "Origem não indicada"}</strong>
                      </p>
                    </div>

                    <div>
                      <span
                        className="historico-ponto destino"
                        aria-hidden="true"
                      />

                      <p>
                        <small>Destino</small>
                        <strong>
                          {viagem.destino || "Destino não indicado"}
                        </strong>
                      </p>
                    </div>
                  </div>

                  <div className="historico-card-rodape">
                        <span>
                            {viagem.estado === "concluida"
                            ? "Viagem terminada"
                            : "Pedido cancelado"}
                        </span>

                        <div className="historico-card-acoes">
                            {preco && <strong>{preco}</strong>}

                            <button
                                        type="button"
                                        className="btn-eliminar-viagem"
                                        onClick={() => pedirEliminacaoViagem(obterId(viagem))}
                                        aria-label="Eliminar esta viagem do histórico"
                                        title="Eliminar viagem"
                                        >
                                        🗑️
                                        </button>
                        </div>
                        </div>
                </article>
              );
            })}
          </section>
        )}
      </main>

      {confirmacao && (
        <div
          className="modal-confirmacao-fundo"
          role="presentation"
          onMouseDown={fecharConfirmacao}
        >
          <div
            className="modal-confirmacao"
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-confirmacao-titulo"
            onMouseDown={(evento) => evento.stopPropagation()}
          >

            <h2 id="modal-confirmacao-titulo">
              {confirmacao.titulo}
            </h2>

            <p>{confirmacao.mensagem}</p>

            <div className="modal-confirmacao-acoes">
              <button
                type="button"
                className="btn-modal-cancelar"
                onClick={fecharConfirmacao}
              >
                Cancelar
              </button>

              <button
                type="button"
                className="btn-modal-eliminar"
                onClick={confirmarEliminacao}
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}