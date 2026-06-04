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
  User,
} from "lucide-react";
import "../css/removerMotorista.css";

export default function RemoverMotorista({ aberto, onFechar }) {
  const [motoristas, setMotoristas] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState("");
  const [removendoId, setRemovendoId] = useState(null);
  const [sucesso, setSucesso] = useState("");
  const [motoristaAConfirmar, setMotoristaAConfirmar] = useState(null);

  useEffect(() => {
    if (!aberto) return;
    fetchMotoristas();
  }, [aberto]);

  async function fetchMotoristas() {
    setLoading(true);
    setErro("");
    try {
      const data = await api.motoristas.listar();
      setMotoristas(data);
    } catch {
      setErro("Erro ao carregar motoristas.");
    } finally {
      setLoading(false);
    }
  }

  function removerMotorista(motorista) {
    setMotoristaAConfirmar(motorista);
    setErro("");
    setSucesso("");
  }

  async function confirmarRemocaoMotorista() {
    if (!motoristaAConfirmar) return;

    setRemovendoId(motoristaAConfirmar._id);
    setErro("");
    setSucesso("");

    try {
      await api.motoristas.remover(motoristaAConfirmar._id);
      setMotoristas((prev) =>
        prev.filter((m) => m._id !== motoristaAConfirmar._id),
      );
      setSucesso("Motorista removido com sucesso.");
      setMotoristaAConfirmar(null);
    } catch {
      setErro("Não foi possível ligar ao servidor.");
    } finally {
      setRemovendoId(null);
    }
  }

  if (!aberto) return null;

  const filtrados = motoristas.filter((m) => {
    const termo = searchTerm.toLowerCase();
    return (
      (m.nome || "").toLowerCase().includes(termo) ||
      (m.nif || "").toLowerCase().includes(termo) ||
      (m.email || "").toLowerCase().includes(termo) ||
      (m.numero_carta || "").toLowerCase().includes(termo)
    );
  });

  return (
    <div className="rmv-overlay">
      <div className="rmv-backdrop" onClick={onFechar} />

      <div className="rmv-modal rmv-scrollbar-none">
        {/* HEADER */}
        <div className="rmv-header">
          <div className="rmv-title-wrap">
            <div className="rmv-icon-box">
              <Trash2 size={18} />
            </div>

            <div className="rmv-title-text">
              <h3 className="rmv-title">Remover Motoristas</h3>
            </div>
          </div>

          <button onClick={onFechar} className="rmv-close-button">
            <X size={18} />
          </button>
        </div>

        {/* CORPO */}
        <div className="rmv-body">
          <div className="rmv-search">
            <Search size={16} className="rmv-search-icon" />
            <input
              type="text"
              placeholder="Pesquisar por nome, NIF, email ou carta..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="rmv-search-input"
            />
          </div>

          {erro && (
            <div className="rmv-alert rmv-alert-error">
              <AlertCircle size={16} />
              {erro}
            </div>
          )}

          {sucesso && (
            <div className="rmv-alert rmv-alert-success">
              <CheckCircle2 size={16} />
              {sucesso}
            </div>
          )}

          {/* CONFIRMAÇÃO */}
          {motoristaAConfirmar && (
            <div className="rmv-confirm">
              <div className="rmv-confirm-row">
                <div className="rmv-confirm-icon">
                  <Trash2 size={18} />
                </div>

                <div className="rmv-confirm-body">
                  <h4 className="rmv-confirm-title">Confirmar remoção</h4>

                  <p className="rmv-confirm-text">
                    Tem a certeza que quer remover o motorista{" "}
                    <strong>{motoristaAConfirmar.nome}</strong>?
                  </p>

                  <div className="rmv-confirm-actions">
                    <button
                      type="button"
                      onClick={() => setMotoristaAConfirmar(null)}
                      disabled={removendoId === motoristaAConfirmar._id}
                      className="rmv-btn rmv-btn-ghost"
                    >
                      Cancelar
                    </button>

                    <button
                      type="button"
                      onClick={confirmarRemocaoMotorista}
                      disabled={removendoId === motoristaAConfirmar._id}
                      className="rmv-btn rmv-btn-danger-solid"
                    >
                      {removendoId === motoristaAConfirmar._id ? (
                        <>
                          <Loader2 size={15} className="rmv-spin" />A remover...
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
            </div>
          )}

          {/* LISTA */}
          {loading ? (
            <div className="rmv-loading">
              <Loader2 size={18} className="rmv-spin" />A carregar motoristas...
            </div>
          ) : filtrados.length === 0 ? (
            <div className="rmv-empty">Nenhum motorista encontrado.</div>
          ) : (
            <div className="rmv-list">
              {filtrados.map((motorista) => (
                <div key={motorista._id} className="rmv-card">
                  <div className="rmv-card-row">
                    <div className="rmv-card-info">
                      <div className="rmv-card-name">
                        <User size={15} />
                        <span>{motorista.nome}</span>
                      </div>
                      <div className="rmv-card-meta">NIF: {motorista.nif}</div>
                      <div className="rmv-card-meta">
                        Email: {motorista.email}
                      </div>
                      <div className="rmv-card-meta">
                        Carta: {motorista.numero_carta}
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => removerMotorista(motorista)}
                      disabled={removendoId === motorista._id}
                      className="rmv-btn rmv-btn-danger"
                    >
                      <Trash2 size={15} />
                      Remover
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
