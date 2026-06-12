/* eslint-disable react/prop-types */
import { useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  CalendarDays,
  Car,
  Clock,
  Euro,
  Fuel,
  Loader2,
  Route,
  TrendingUp,
} from "lucide-react";
import api from "../Api";
import "../css/relatorioMotorista.css";

function hojeIso() {
  return new Date().toISOString().slice(0, 10);
}

function inicioMesIso() {
  const agora = new Date();
  return new Date(agora.getFullYear(), agora.getMonth(), 1)
    .toISOString()
    .slice(0, 10);
}

function fmtNumero(valor, casas = 2) {
  return Number(valor || 0).toLocaleString("pt-PT", {
    minimumFractionDigits: casas,
    maximumFractionDigits: casas,
  });
}

function fmtEuro(valor) {
  return `${fmtNumero(valor)} €`;
}

function fmtData(valor) {
  if (!valor) return "—";
  return new Date(valor).toLocaleDateString("pt-PT", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function fmtHora(valor) {
  if (!valor) return "—";
  return new Date(valor).toLocaleTimeString("pt-PT", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getTaxiLabel(taxi) {
  if (!taxi) return "Táxi não indicado";
  return [taxi.matricula, taxi.marca, taxi.modelo].filter(Boolean).join(" · ");
}

function getNomeCliente(cliente) {
  return cliente?.nome || cliente?.nif || "Cliente";
}

export default function RelatorioMotorista() {
  const [dataInicio, setDataInicio] = useState(inicioMesIso());
  const [dataFim, setDataFim] = useState(hojeIso());
  const [relatorio, setRelatorio] = useState(null);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState("");

  const maiorDia = useMemo(() => {
    const dias = relatorio?.por_dia || [];
    return Math.max(...dias.map((dia) => Number(dia.faturado) || 0), 1);
  }, [relatorio]);

  async function carregar() {
    setLoading(true);
    setErro("");

    try {
      const data = await api.relatorios.motoristaMeu({
        data_inicio: dataInicio,
        data_fim: dataFim,
      });
      setRelatorio(data);
    } catch (err) {
      setErro(err.message || "Não foi possível carregar o relatório.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    carregar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const totais = relatorio?.totais || {};
  const viagens = relatorio?.viagens || [];
  const reabastecimentos = relatorio?.reabastecimentos || [];
  const dias = relatorio?.por_dia || [];

  return (
    <div className="rm-wrap">
      <section className="rm-toolbar">
        <div>
          <p className="rm-eyebrow">Relatório pessoal</p>
          <h3>Desempenho do período</h3>
          <p>Consulte viagens, faturação, quilómetros e reabastecimentos.</p>
        </div>

        <div className="rm-filtros">
          <label>
            Início
            <input
              type="date"
              value={dataInicio}
              onChange={(e) => setDataInicio(e.target.value)}
            />
          </label>
          <label>
            Fim
            <input
              type="date"
              value={dataFim}
              onChange={(e) => setDataFim(e.target.value)}
            />
          </label>
          <button type="button" onClick={carregar} disabled={loading}>
            {loading ? <Loader2 size={16} className="rm-spin" /> : <CalendarDays size={16} />}
            Atualizar
          </button>
        </div>
      </section>

      {erro && (
        <div className="rm-alert">
          <AlertCircle size={18} />
          {erro}
        </div>
      )}

      <section className="rm-kpis">
        <Kpi icon={<Route size={20} />} label="Viagens" value={totais.total_viagens || 0} />
        <Kpi icon={<Car size={20} />} label="Quilómetros" value={`${fmtNumero(totais.total_km)} km`} />
        <Kpi icon={<Clock size={20} />} label="Horas" value={`${fmtNumero(totais.total_horas)} h`} />
        <Kpi icon={<Euro size={20} />} label="Faturado" value={fmtEuro(totais.total_faturado)} />
        <Kpi icon={<TrendingUp size={20} />} label="Valor médio" value={fmtEuro(totais.preco_medio)} />
        <Kpi icon={<Fuel size={20} />} label="Reabastecimentos" value={fmtEuro(totais.total_reabastecimento_euros)} />
      </section>

      {loading ? (
        <div className="rm-loading">
          <Loader2 size={24} className="rm-spin" />
          A carregar relatório...
        </div>
      ) : (
        <>
          <section className="rm-grid">
            <div className="rm-panel">
              <div className="rm-panel-head">
                <h4>Faturação diária</h4>
                <span>{dias.length} dias</span>
              </div>
              {dias.length === 0 ? (
                <Empty text="Sem viagens no período." />
              ) : (
                <div className="rm-bars">
                  {dias.map((dia) => (
                    <div className="rm-bar-row" key={dia.data}>
                      <span>{fmtData(dia.data)}</span>
                      <div>
                        <i style={{ width: `${Math.max(5, (dia.faturado / maiorDia) * 100)}%` }} />
                      </div>
                      <strong>{fmtEuro(dia.faturado)}</strong>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="rm-panel">
              <div className="rm-panel-head">
                <h4>Resumo operacional</h4>
              </div>
              <div className="rm-summary-list">
                <Metric label="Pagas" value={totais.viagens_pagas || 0} />
                <Metric label="Pagamento pendente" value={totais.viagens_pagamento_pendente || 0} />
                <Metric label="Km médio por viagem" value={`${fmtNumero(totais.km_medio)} km`} />
                <Metric label="Litros" value={`${fmtNumero(totais.total_litros)} L`} />
                <Metric label="Energia" value={`${fmtNumero(totais.total_kwh)} kWh`} />
              </div>
            </div>
          </section>

          <section className="rm-panel">
            <div className="rm-panel-head">
              <h4>Viagens concluídas</h4>
              <span>{viagens.length}</span>
            </div>
            {viagens.length === 0 ? (
              <Empty text="Sem viagens concluídas neste período." />
            ) : (
              <div className="rm-table-wrap">
                <table className="rm-table">
                  <thead>
                    <tr>
                      <th>Data</th>
                      <th>Hora</th>
                      <th>Cliente</th>
                      <th>Rota</th>
                      <th>Táxi</th>
                      <th>Km</th>
                      <th>Horas</th>
                      <th>Valor</th>
                    </tr>
                  </thead>
                  <tbody>
                    {viagens.map((viagem) => (
                      <tr key={viagem._id}>
                        <td>{fmtData(viagem.data_inicio)}</td>
                        <td>{fmtHora(viagem.data_inicio)}</td>
                        <td>{getNomeCliente(viagem.cliente)}</td>
                        <td>
                          <strong>{viagem.origem_morada || "Origem"}</strong>
                          <span>{viagem.destino_morada || "Destino"}</span>
                        </td>
                        <td>{getTaxiLabel(viagem.taxi)}</td>
                        <td>{fmtNumero(viagem.km)}</td>
                        <td>{fmtNumero(viagem.horas)}</td>
                        <td>{fmtEuro(viagem.preco_total)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>

          <section className="rm-panel">
            <div className="rm-panel-head">
              <h4>Reabastecimentos</h4>
              <span>{reabastecimentos.length}</span>
            </div>
            {reabastecimentos.length === 0 ? (
              <Empty text="Sem reabastecimentos neste período." />
            ) : (
              <div className="rm-refuels">
                {reabastecimentos.map((item) => (
                  <article key={item._id}>
                    <div>
                      <strong>{fmtData(item.data_inicio)}</strong>
                      <span>{getTaxiLabel(item.taxi)}</span>
                    </div>
                    <p>{fmtEuro(item.euros)}</p>
                    <small>
                      {item.litros ? `${fmtNumero(item.litros)} L` : ""}
                      {item.kwh ? `${fmtNumero(item.kwh)} kWh` : ""}
                      {item.quilometros ? ` · ${fmtNumero(item.quilometros)} km` : ""}
                    </small>
                  </article>
                ))}
              </div>
            )}
          </section>
        </>
      )}
    </div>
  );
}

function Kpi({ icon, label, value }) {
  return (
    <article className="rm-kpi">
      <span>{icon}</span>
      <p>{label}</p>
      <strong>{value}</strong>
    </article>
  );
}

function Metric({ label, value }) {
  return (
    <div className="rm-metric">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function Empty({ text }) {
  return <div className="rm-empty">{text}</div>;
}
