/* eslint-disable react/prop-types */
import { useEffect, useState } from "react";
import api from "../Api";
import {
  X,
  Search,
  Trash2,
  AlertCircle,
  Loader2,
  CheckCircle2,
  Car,
} from "lucide-react";
import "../css/removerTaxi.css";

function normalizarListaTaxis(data) {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.data)) return data.data;
  if (Array.isArray(data?.Data)) return data.Data;
  if (Array.isArray(data?.taxis)) return data.taxis;
  return [];
}

function getCampoTaxi(taxi, campo) {
  return (
    taxi?.[campo] ||
    taxi?.taxi?.[campo] ||
    taxi?.id_taxi?.[campo] ||
    taxi?.veiculo?.[campo] ||
    ""
  );
}

function getTaxiId(taxi) {
  return (
    taxi?._id || taxi?.taxi?._id || taxi?.id_taxi?._id || taxi?.veiculo?._id
  );
}

function formatarTipoMotor(valor) {
  if (valor === "eletrico") return "Elétrico";
  if (valor === "combustao") return "Combustão";
  return "-";
}

function formatarConforto(valor) {
  if (valor === "luxuoso") return "Luxuoso";
  if (valor === "basico") return "Básico";
  return "-";
}

export default function RemoverTaxi({ aberto, onFechar }) {
  const [taxis, setTaxis] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState("");
  const [removendoId, setRemovendoId] = useState(null);
  const [sucesso, setSucesso] = useState("");
  const [taxiAConfirmar, setTaxiAConfirmar] = useState(null);

  useEffect(() => {
    if (!aberto) return;
    fetchTaxis();
  }, [aberto]);

  async function fetchTaxis() {
    setLoading(true);
    setErro("");

    try {
      const data = await api.taxis.listar();
      setTaxis(normalizarListaTaxis(data));
    } catch (err) {
      console.error("Erro ao carregar táxis:", err);
      setErro("Erro ao carregar táxis.");
    } finally {
      setLoading(false);
    }
  }

  function removerTaxi(taxi) {
    setTaxiAConfirmar(taxi);
    setErro("");
    setSucesso("");
  }

  async function confirmarRemocaoTaxi() {
    if (!taxiAConfirmar) return;

    const id = getTaxiId(taxiAConfirmar);

    if (!id) {
      setErro("Não foi possível identificar o táxi.");
      return;
    }

    setRemovendoId(id);
    setErro("");
    setSucesso("");

    try {
      await api.taxis.remover(id);

      setTaxis((prev) => prev.filter((t) => getTaxiId(t) !== id));
      setSucesso("Táxi removido com sucesso.");
      setTaxiAConfirmar(null);
    } catch (err) {
      console.error("Erro ao remover táxi:", err);
      setErro(err?.message || "Não foi possível ligar ao servidor.");
    } finally {
      setRemovendoId(null);
    }
  }

  if (!aberto) return null;

  const filtrados = taxis.filter((t) => {
    const termo = searchTerm.toLowerCase();

    return (
      getCampoTaxi(t, "matricula").toLowerCase().includes(termo) ||
      getCampoTaxi(t, "marca").toLowerCase().includes(termo) ||
      getCampoTaxi(t, "modelo").toLowerCase().includes(termo) ||
      getCampoTaxi(t, "tipo_motor").toLowerCase().includes(termo) ||
      getCampoTaxi(t, "nivel_conforto").toLowerCase().includes(termo)
    );
  });

  const matriculaConfirmar = taxiAConfirmar
    ? getCampoTaxi(taxiAConfirmar, "matricula")
    : "";

  return (
    <div className="dt-overlay">
      <div className="dt-backdrop" onClick={onFechar} />

      <div className="dt-modal dt-scrollbar-none">
        <div className="dt-header">
          <div className="dt-title-wrap">
            <div className="dt-icon-box">
              <Trash2 size={18} strokeWidth={1.8} />
            </div>

            <div>
              <h3 className="dt-title">Remover Táxis</h3>
              <p className="dt-subtitle">Selecione o táxi a remover</p>
            </div>
          </div>

          <button onClick={onFechar} className="dt-close-button">
            <X size={16} strokeWidth={2} />
          </button>
        </div>

        <div className="dt-content">
          <div className="dt-search-wrap">
            <Search size={15} className="dt-search-icon" />

            <input
              type="text"
              placeholder="Pesquisar por matrícula, marca ou modelo..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="dt-search-input"
            />
          </div>

          {erro && (
            <div className="dt-alert dt-alert-error">
              <AlertCircle size={16} />
              {erro}
            </div>
          )}

          {sucesso && (
            <div className="dt-alert dt-alert-success">
              <CheckCircle2 size={16} />
              {sucesso}
            </div>
          )}

          {taxiAConfirmar && (
            <div className="dt-confirm-box">
              <div className="dt-confirm-icon">
                <Trash2 size={18} />
              </div>

              <div className="dt-confirm-body">
                <h4>Confirmar remoção</h4>

                <p>
                  Tem a certeza que quer remover o táxi com matrícula{" "}
                  <strong>{matriculaConfirmar || "sem matrícula"}</strong>?
                </p>

                <div className="dt-confirm-actions">
                  <button
                    type="button"
                    onClick={() => setTaxiAConfirmar(null)}
                    disabled={removendoId === getTaxiId(taxiAConfirmar)}
                    className="dt-cancel-button"
                  >
                    Cancelar
                  </button>

                  <button
                    type="button"
                    onClick={confirmarRemocaoTaxi}
                    disabled={removendoId === getTaxiId(taxiAConfirmar)}
                    className="dt-danger-button"
                  >
                    {removendoId === getTaxiId(taxiAConfirmar) ? (
                      <>
                        <Loader2 size={15} className="dt-spin" />A remover...
                      </>
                    ) : (
                      <>
                        <Trash2 size={15} />
                        Confirmar remoção
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}

          {loading ? (
            <div className="dt-empty">
              <Loader2 size={18} className="dt-spin" />A carregar táxis...
            </div>
          ) : filtrados.length === 0 ? (
            <div className="dt-empty">Nenhum táxi encontrado.</div>
          ) : (
            <div className="dt-taxi-list">
              {filtrados.map((taxi) => {
                const id = getTaxiId(taxi);
                const matricula = getCampoTaxi(taxi, "matricula");
                const marca = getCampoTaxi(taxi, "marca");
                const modelo = getCampoTaxi(taxi, "modelo");
                const anoCompra = getCampoTaxi(taxi, "ano_compra");
                const tipoMotor = getCampoTaxi(taxi, "tipo_motor");
                const nivelConforto = getCampoTaxi(taxi, "nivel_conforto");

                return (
                  <div key={id || matricula} className="dt-taxi-row">
                    <div className="dt-taxi-left">
                      <div className="dt-taxi-icon">
                        <Car size={18} strokeWidth={1.7} />
                      </div>

                      <div>
                        <div className="dt-taxi-matricula">
                          {matricula || "Sem matrícula"}
                        </div>

                        <div className="dt-taxi-info">
                          {marca || "Sem marca"} {modelo || "Sem modelo"}
                          {anoCompra ? ` · ${anoCompra}` : ""}
                        </div>

                        <div className="dt-taxi-extra">
                          {formatarTipoMotor(tipoMotor)} ·{" "}
                          {formatarConforto(nivelConforto)}
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => removerTaxi(taxi)}
                      disabled={removendoId === id}
                      className="dt-remove-button"
                    >
                      <Trash2 size={15} />
                      Remover
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
