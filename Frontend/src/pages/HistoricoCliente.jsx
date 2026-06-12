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

                    {preco && <strong>{preco}</strong>}
                  </div>
                </article>
              );
            })}
          </section>
        )}
      </main>
    </div>
  );
}