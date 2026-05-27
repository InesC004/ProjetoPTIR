/* eslint-disable react/prop-types */
import { useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  Ban,
  CheckCircle2,
  Clock,
  Loader2,
  MapPin,
  Navigation,
  PlayCircle,
  Route,
  Timer,
  Users,
} from "lucide-react";
import api from "../Api";
import "../css/pedidosMotorista.css";

function normalizarLista(data, chave) {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.[chave])) return data[chave];
  if (Array.isArray(data?.data)) return data.data;
  return [];
}

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

function getConforto(pedido) {
  if (!pedido?.nivel_conforto) return "—";
  return pedido.nivel_conforto === "luxuoso" ? "Luxuoso" : "Básico";
}
function normalizarConforto(valor) {
  if (!valor) return "";

  const texto = String(valor).toLowerCase();

  if (texto.includes("lux")) return "luxuoso";
  if (texto.includes("basic") || texto.includes("básic")) return "basico";

  return texto;
}

function getTipoMotoristaAtual() {
  const possiveisChaves = [ "turnoAtivoMotorista",
    "turnoMotorista",
    "turnoAtivo",
    "turno","utilizador", "user", "motorista", "authUser"];

  for (const chave of possiveisChaves) {
    try {
      const dados = JSON.parse(localStorage.getItem(chave) || "null");

      const tipo =
        dados?.tipo_viatura ||
        dados?.tipo_carro ||
        dados?.tipo_carro_turno ||
        dados?.nivel_conforto ||
        dados?.conforto ||
        dados?.categoria ||
        dados?.viatura?.tipo ||
        dados?.veiculo?.tipo ||
        dados?.veiculo?.tipo_viatura ||
        dados?.carro?.tipo ||
        dados?.carro?.tipo_viatura ||
        dados?.viatura?.tipo ||
        dados?.viatura?.nivel_conforto;

      if (tipo) return normalizarConforto(tipo);
    } catch {
      // ignora
    }
  }

  return "";
}

function pedidoCompativelComMotorista(pedido) {
  const tipoMotorista = getTipoMotoristaAtual();

  if (!tipoMotorista) return false;

  const tipoPedido = normalizarConforto(
    pedido?.nivel_conforto || pedido?.tipo_viatura || pedido?.tipo_carro,
  );

  if (!tipoPedido) return false;

  return tipoPedido === tipoMotorista;
}
export default function PedidosMotorista() {
  const [pedidos, setPedidos] = useState([]);
  const [aceites, setAceites] = useState([]);
  const [confirmacoes, setConfirmacoes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState("");
  const [sucesso, setSucesso] = useState("");
  const [processingId, setProcessingId] = useState(null);
  const [posicao, setPosicao] = useState(null);

  const pedidosOrdenados = useMemo(
    () =>
      [...pedidos].sort(
        (a, b) =>
          Number(a.distancia_km ?? 999999) -
          Number(b.distancia_km ?? 999999),
      ),
    [pedidos],
  );

  useEffect(() => {
    if (!sucesso) return;

    const timeout = setTimeout(() => {
      setSucesso("");
    }, 3500);

    return () => clearTimeout(timeout);
  }, [sucesso]);

  async function carregarPedidos(posicaoAtual = posicao, mostrarLoading = true) {
    if (mostrarLoading) {
      setLoading(true);
    }

    setErro("");

    try {
      const data = await api.pedidos.listarDisponiveis(posicaoAtual || {});
      const lista = normalizarLista(data, "pedidos");

      const idsAceites = new Set(aceites.map(getId));
      const idsConfirmacoes = new Set(confirmacoes.map(getId));

      setPedidos(
        lista.filter(
          (p) =>
            !idsAceites.has(getId(p)) &&
            !idsConfirmacoes.has(getId(p)) &&
            !foiCanceladoPeloCliente(p),
        ),
      );
    } catch (err) {
      setErro(err.message || "Não foi possível carregar os pedidos.");
    } finally {
      if (mostrarLoading) {
        setLoading(false);
      }
    }
  }

  useEffect(() => {
    let cancelado = false;

    function carregarComPosicao(posicaoAtual) {
      if (cancelado) return;
      setPosicao(posicaoAtual);
      carregarPedidos(posicaoAtual);
    }

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (geo) =>
          carregarComPosicao({
            lat: geo.coords.latitude,
            lng: geo.coords.longitude,
          }),
        () => carregarComPosicao(null),
        {
          enableHighAccuracy: true,
          timeout: 3500,
          maximumAge: 60000,
        },
      );
    } else {
      carregarComPosicao(null);
    }

    return () => {
      cancelado = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      verificarPedidosAceites();
    }, 5000);

    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [aceites.length]);

  useEffect(() => {
    const interval = setInterval(() => {
      carregarPedidos(posicao, false);
    }, 1000);

    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [posicao, aceites.length, confirmacoes.length]);

  useEffect(() => {
    carregarConfirmacoes();

    window.addEventListener(
      "confirmacoesAceitesAtualizadas",
      carregarConfirmacoes,
    );

    return () => {
      window.removeEventListener(
        "confirmacoesAceitesAtualizadas",
        carregarConfirmacoes,
      );
    };
  }, []);

  async function aceitarPedido(pedido) {
    const id = getId(pedido);
    if (!id) return;

    setProcessingId(id);
    setErro("");
    setSucesso("");

    try {
      const data = await api.pedidos.aceitar(id);
      const pedidoAceite = {
        ...(data?.pedido || {}),
        ...pedido,
        estado: data?.pedido?.estado || "aceite",
      };

      setPedidos((prev) => prev.filter((p) => getId(p) !== id));
      setAceites((prev) => [
        pedidoAceite,
        ...prev.filter((p) => getId(p) !== id),
      ]);

      setSucesso(
        data?.message || "Pedido aceite. Aguarde a confirmação do cliente.",
      );
    } catch (err) {
      setErro(err.message || "Não foi possível aceitar o pedido.");
    } finally {
      setProcessingId(null);
    }
  }

  async function cancelarAceitacao(pedido) {
    const id = getId(pedido);
    if (!id) return;

    setProcessingId(id);
    setErro("");
    setSucesso("");

    try {
      const data = await api.pedidos.cancelarAceitacao(id);
      const pedidoPendente = data?.pedido || { ...pedido, estado: "pendente" };

      setAceites((prev) => prev.filter((p) => getId(p) !== id));
      setPedidos((prev) => [
        pedidoPendente,
        ...prev.filter((p) => getId(p) !== id),
      ]);

      setSucesso(data?.message || "Aceitação cancelada com sucesso.");
      await carregarPedidos(posicao);
    } catch (err) {
      setErro(err.message || "Não foi possível cancelar a aceitação.");
    } finally {
      setProcessingId(null);
    }
  }

  async function verificarPedidosAceites() {
    if (aceites.length === 0) return;

    try {
      const atualizados = await Promise.all(
        aceites.map(async (pedido) => {
          const id = getId(pedido);

          try {
            const data = await api.pedidos.obter(id);
            const pedidoAtualizado = data?.pedido || data;

            return {
              ...pedido,
              ...pedidoAtualizado,
              distancia_km:
                pedido.distancia_km ??
                pedido.distancia ??
                pedidoAtualizado?.distancia_km ??
                pedidoAtualizado?.distancia,
              tempo_estimado_min:
                pedido.tempo_estimado_min ??
                pedido.tempo_estimado ??
                pedidoAtualizado?.tempo_estimado_min ??
                pedidoAtualizado?.tempo_estimado,
            };
          } catch {
            return {
              ...pedido,
              estado: "cancelado_cliente",
            };
          }
          //} catch (err) {
            //console.error("Erro ao obter pedido aceite:", err);
            //return pedido;
          //}
        }),
      );

      const confirmados = atualizados.filter(foiConfirmadoPeloCliente);
      const rejeitados = atualizados.filter(foiRejeitadoPeloCliente);

      confirmados.forEach(guardarConfirmacaoAceite);

      if (confirmados.length > 0) {
        carregarConfirmacoes();
        setSucesso(
          "Cliente confirmou o pedido. Clique em Iniciar viagem para criar a viagem.",
        );
      }

      if (rejeitados.length > 0) {
        setSucesso("");
        await carregarPedidos(posicao, false);
      }

      setAceites(
        atualizados.filter(
          (pedido) =>
            !foiConfirmadoPeloCliente(pedido) &&
            !foiCanceladoPeloCliente(pedido) &&
            !foiRejeitadoPeloCliente(pedido),
        ),
      );
    } catch (err) {
        console.error("Erro ao verificar pedidos aceites:", err);
    }
  }

  function carregarConfirmacoes() {
    const guardadas = JSON.parse(
      localStorage.getItem("confirmacoesAceitesMotorista") || "[]",
    );

    setConfirmacoes(guardadas);
  }

  async function iniciarViagemConfirmada(pedido) {
    const id = getId(pedido);
    if (!id) return;

    setProcessingId(id);
    setErro("");
    setSucesso("");

    try {
      const data = await api.pedidos.iniciarViagem(id);

      const confirmacoesAtuais = JSON.parse(
        localStorage.getItem("confirmacoesAceitesMotorista") || "[]",
      );

      const viagensAtuais = JSON.parse(
        localStorage.getItem("viagensConfirmadasMotorista") || "[]",
      );

      const jaExiste = viagensAtuais.some((v) => getId(v) === id);

      const novaViagem = {
        ...(data?.pedido || pedido),
        estado: "em_viagem",
        estadoViagem: "em_curso",
        data_inicio: new Date().toISOString(),
      };

      if (!jaExiste) {
        localStorage.setItem(
          "viagensConfirmadasMotorista",
          JSON.stringify([novaViagem, ...viagensAtuais]),
        );
      }

      localStorage.setItem(
        "confirmacoesAceitesMotorista",
        JSON.stringify(confirmacoesAtuais.filter((p) => getId(p) !== id)),
      );

      setConfirmacoes((prev) => prev.filter((p) => getId(p) !== id));

      window.dispatchEvent(new Event("viagensConfirmadasAtualizadas"));
      window.dispatchEvent(new Event("confirmacoesAceitesAtualizadas"));

      setSucesso("Viagem iniciada. Consulte a secção Viagens.");
    } catch (err) {
      setErro(err.message || "Não foi possível iniciar a viagem.");
    } finally {
      setProcessingId(null);
    }
  }

  return (
    <div className="pm-wrap">
      <div className="pm-toolbar">
        <div>
          <p className="pm-eyebrow">Fila de pedidos</p>
          <h3>Pedidos por proximidade</h3>
          <p>
            Os pedidos disponíveis aparecem ordenados pela distância até ao
            cliente e apenas quando ainda cabem no turno ativo.
          </p>
        </div>
      </div>

      {erro && (
        <div className="pm-alert pm-alert-error">
          <AlertCircle size={17} />
          <span>{erro}</span>
        </div>
      )}

      {sucesso && (
        <div className="pm-alert pm-alert-success">
          <CheckCircle2 size={17} />
          <span>{sucesso}</span>
        </div>
      )}

      <div className="pm-grid">
        <section className="pm-card">
          <div className="pm-card-head">
            <div className="pm-title-left">
              <span className="pm-icon pm-icon-green">
                <Navigation size={20} />
              </span>

              <div>
                <p className="pm-title">Pedidos pendentes</p>
                <p className="pm-sub">Clientes à espera de motorista</p>
              </div>
            </div>

            <span className="pm-count">{pedidosOrdenados.length}</span>
          </div>

          <div className="pm-card-body">
            {loading ? (
              <div className="pm-state">
                <Loader2 size={24} className="pm-spin" />
                <p>A carregar pedidos...</p>
              </div>
            ) : pedidosOrdenados.length === 0 ? (
              <EmptyState
                icon={<MapPin size={26} />}
                title="Sem pedidos disponíveis"
                text="Crie ou mantenha um turno ativo para receber pedidos compatíveis."
              />
            ) : (
              <div className="pm-list">
                {pedidosOrdenados.map((pedido) => (
                  <PedidoCard
                    key={getId(pedido)}
                    pedido={pedido}
                    primaryLabel="Aceitar pedido"
                    primaryIcon={<CheckCircle2 size={16} />}
                    onPrimary={() => aceitarPedido(pedido)}
                    disabled={processingId === getId(pedido)}
                  />
                ))}
              </div>
            )}
          </div>
        </section>

        <section className="pm-card">
          <div className="pm-card-head">
            <div className="pm-title-left">
              <span className="pm-icon pm-icon-blue">
                <Timer size={20} />
              </span>

              <div>
                <p className="pm-title">A aguardar confirmação</p>
                <p className="pm-sub">Pedidos aceites por si</p>
              </div>
            </div>

            <span className="pm-count">{aceites.length}</span>
          </div>

          <div className="pm-card-body">
            {aceites.length === 0 ? (
              <EmptyState
                icon={<Clock size={26} />}
                title="Nenhum pedido aceite"
                text="Quando aceitar um pedido, ele fica aqui até o cliente confirmar ou até cancelar a aceitação."
              />
            ) : (
              <div className="pm-list">
                {aceites.map((pedido) => (
                  <PedidoCard
                    key={getId(pedido)}
                    pedido={pedido}
                    waiting
                    primaryLabel="Cancelar aceitação"
                    primaryIcon={<Ban size={16} />}
                    onPrimary={() => cancelarAceitacao(pedido)}
                    disabled={processingId === getId(pedido)}
                    danger
                  />
                ))}
              </div>
            )}
          </div>
        </section>

        <section className="pm-card pm-confirmados-card">
            <div className="pm-card-head">
                <div className="pm-title-left">
                <span className="pm-icon pm-icon-green">
                    <CheckCircle2 size={20} />
                </span>

                <div>
                    <p className="pm-title">Confirmação aceite</p>
                    <p className="pm-sub">Clientes que confirmaram o motorista</p>
                </div>
                </div>

                <span className="pm-count">{confirmacoes.length}</span>
            </div>

            <div className="pm-card-body">
                {confirmacoes.length === 0 ? (
                <EmptyState
                    icon={<CheckCircle2 size={26} />}
                    title="Nenhuma confirmação aceite"
                    text="Quando o cliente confirmar o motorista, o pedido aparece aqui para iniciar a viagem."
                />
                ) : (
                <div className="pm-list">
                    {confirmacoes.map((pedido) => (
                    <PedidoCard
                        key={getId(pedido)}
                        pedido={pedido}
                        waiting
                        primaryLabel="Iniciar viagem"
                        primaryIcon={<PlayCircle size={16} />}
                        onPrimary={() => iniciarViagemConfirmada(pedido)}
                        disabled={processingId === getId(pedido)}
                    />
                    ))}
                </div>
                )}
            </div>
            </section>
      </div>
    </div>
  );
}

function PedidoCard({
  pedido,
  primaryLabel,
  primaryIcon,
  onPrimary,
  disabled,
  waiting,
  danger,
}) {
  return (
    <article className="pm-item">
      <div className="pm-item-top">
        <div>
          <p className="pm-item-title">{getMorada(pedido.origem_morada)}</p>
          <p className="pm-item-sub">
            Destino: {getMorada(pedido.destino_morada)}
          </p>
        </div>

        <span
          className={
            foiCanceladoPeloCliente(pedido)
              ? "pm-status pm-status-cancelled"
              : waiting
                ? "pm-status pm-status-wait"
                : "pm-status pm-status-open"
          }
        >
          {foiCanceladoPeloCliente(pedido)
            ? "Cancelado pelo cliente"
            : waiting
              ? "A aguardar"
              : "Pendente"}
        </span>
      </div>

      <div className="pm-metrics">
        <Metric
          icon={<Users size={15} />}
          label="Pessoas"
          value={pedido.numero_pessoas || "—"}
        />

        <Metric
          icon={<MapPin size={15} />}
          label="Distância"
          value={getDistancia(pedido)}
        />

        <Metric
          icon={<Route size={15} />}
          label="Tempo estimado"
          value={getTempo(pedido)}
        />
      </div>

      <div className="pm-extra">
        <span>
          Conforto: <strong>{getConforto(pedido)}</strong>
        </span>

        {pedido.createdAt && (
          <span>
            Pedido às{" "}
            <strong>
              {new Date(pedido.createdAt).toLocaleTimeString("pt-PT", {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </strong>
          </span>
        )}
      </div>

      <button
        className={danger ? "pm-action pm-action-danger" : "pm-action"}
        onClick={onPrimary}
        disabled={disabled || foiCanceladoPeloCliente(pedido)}
        type="button"
      >
        {disabled ? <Loader2 size={16} className="pm-spin" /> : primaryIcon}
        {primaryLabel}
      </button>
    </article>
  );
}

function Metric({ icon, label, value }) {
  return (
    <div className="pm-metric">
      <span>{icon}</span>

      <div>
        <p>{label}</p>
        <strong>{value}</strong>
      </div>
    </div>
  );
}

function EmptyState({ icon, title, text }) {
  return (
    <div className="pm-empty">
      <span className="pm-empty-icon">{icon}</span>
      <strong>{title}</strong>
      <p>{text}</p>
    </div>
  );
}

function foiCanceladoPeloCliente(pedido) {
  return [
    "cancelado",
    "cancelada",
    "cancelado_cliente",
    "canceladoPorCliente",
    "cancelado_pelo_cliente",
  ].includes(pedido?.estado);
}

function foiConfirmadoPeloCliente(pedido) {
  return [
    "confirmado",
    "confirmada",
    "aceite_cliente",
    "aceita_cliente",
    "aceite_pelo_cliente",
    "confirmado_cliente",
    "cliente_confirmou",
    "em_viagem",
  ].includes(pedido?.estado);
}

function foiRejeitadoPeloCliente(pedido) {
  return [
    "rejeitado",
    "rejeitada",
    "rejeitado_cliente",
    "cliente_rejeitou",
  ].includes(pedido?.estado);
}

function guardarConfirmacaoAceite(pedido) {
  const chave = "confirmacoesAceitesMotorista";
  const atuais = JSON.parse(localStorage.getItem(chave) || "[]");
  const id = getId(pedido);

  const jaExiste = atuais.some((v) => getId(v) === id);

  if (!jaExiste) {
    localStorage.setItem(chave, JSON.stringify([pedido, ...atuais]));
    window.dispatchEvent(new Event("confirmacoesAceitesAtualizadas"));
  }
}
