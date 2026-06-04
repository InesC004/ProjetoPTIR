/* eslint-disable react/prop-types */
import { useState, useEffect, useRef } from "react";
import Header from "../components/Header2";
import api from "../Api";
import "../css/dashboardCliente.css";

// ═══════════════════════════════════════════════════════════════════════════════
// UTILITÁRIOS
// ═══════════════════════════════════════════════════════════════════════════════

async function carregarLeaflet() {
  return new Promise((resolve, reject) => {
    if (!document.querySelector('link[data-leaflet-css="true"]')) {
      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
      link.dataset.leafletCss = "true";
      document.head.appendChild(link);
    }
    if (window.L) return resolve(window.L);
    const script = document.createElement("script");
    script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
    script.onload = () => resolve(window.L);
    script.onerror = reject;
    document.head.appendChild(script);
  });
}

function criarIcone(L, cor, emoji, tamanho = 38) {
  return L.divIcon({
    className: "",
    html: `<div style="width:${tamanho}px;height:${tamanho}px;border-radius:50%;background:${cor};display:flex;align-items:center;justify-content:center;font-size:${Math.round(tamanho * 0.44)}px;box-shadow:0 0 18px ${cor}99,0 4px 14px rgba(0,0,0,.65);border:2.5px solid rgba(255,255,255,.2);">${emoji}</div>`,
    iconSize: [tamanho, tamanho],
    iconAnchor: [tamanho / 2, tamanho / 2],
  });
}

// FIX AXE: helper para aplicar aria-label ao marcador Leaflet após addTo()
// Os marcadores Leaflet geram role="button" mas sem aria-label — o axe apanha isto.
function aplicarAriaLabel(marker, label) {
  // Leaflet demora um tick a inserir o elemento no DOM
  setTimeout(() => {
    const el = marker.getElement();
    if (el) el.setAttribute("aria-label", label);
  }, 0);
}

async function coordenadasParaMorada(lat, lng) {
  try {
    const resposta = await fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`,
      { headers: { "Accept-Language": "pt-PT" } },
    );
    const dados = await resposta.json();
    const partes = dados.display_name?.split(",") ?? [];
    return (
      partes.slice(0, 2).join(", ") || `${lat.toFixed(5)}, ${lng.toFixed(5)}`
    );
  } catch {
    return `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
  }
}

const CHAVE_ORS = "5b3ce3597851110001cf6248a8d6e04a30ed45e6b3a20d5e0b3c7d26";

async function obterRota(lngOrigem, latOrigem, lngDestino, latDestino) {
  const resposta = await fetch(
    `https://api.openrouteservice.org/v2/directions/driving-car?api_key=${CHAVE_ORS}&start=${lngOrigem},${latOrigem}&end=${lngDestino},${latDestino}`,
  );
  if (!resposta.ok) throw new Error("Erro ORS: " + resposta.status);
  const dados = await resposta.json();
  const feature = dados.features[0];
  const segmento = feature.properties.segments[0];
  return {
    coordenadas: feature.geometry.coordinates.map(([lng, lat]) => [lat, lng]),
    distanciaM: segmento.distance,
    duracaoS: segmento.duration,
  };
}

async function desenharRota(refs, origem, destino) {
  const { mapRef, camadaRotaRef, leafletRef } = refs;
  const L = leafletRef.current;
  const mapa = mapRef.current;
  if (!L || !mapa) return;

  if (camadaRotaRef.current) {
    camadaRotaRef.current.remove();
    camadaRotaRef.current = null;
  }

  try {
    const { coordenadas } = await obterRota(
      origem.lng,
      origem.lat,
      destino.lng,
      destino.lat,
    );
    if (!mapRef.current) return;

    const grupo = L.layerGroup();
    L.polyline(coordenadas, {
      color: "#1a6eff",
      weight: 10,
      opacity: 0.13,
    }).addTo(grupo);
    L.polyline(coordenadas, {
      color: "#3d8bff",
      weight: 4,
      opacity: 0.95,
    }).addTo(grupo);
    L.polyline(coordenadas, {
      color: "#00d4ff",
      weight: 2,
      opacity: 0.7,
      dashArray: "10 8",
    }).addTo(grupo);
    grupo.addTo(mapa);
    camadaRotaRef.current = grupo;
    mapa.fitBounds(L.polyline(coordenadas).getBounds(), { padding: [60, 60] });
  } catch {
    if (!mapRef.current) return;
    const grupo2 = L.layerGroup();
    L.polyline([origem, destino], {
      color: "#1a6eff",
      weight: 8,
      opacity: 0.13,
    }).addTo(grupo2);
    L.polyline([origem, destino], {
      color: "#00d4ff",
      weight: 3,
      opacity: 0.9,
      dashArray: "10 8",
    }).addTo(grupo2);
    grupo2.addTo(mapa);
    camadaRotaRef.current = grupo2;
    mapa.fitBounds(L.latLngBounds([origem, destino]), { padding: [60, 60] });
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// COMPONENTE: Mapa Interativo
// ═══════════════════════════════════════════════════════════════════════════════
function MapaInterativo({ apiRef, aoDefinirPartida, aoDefinirDestino }) {
  const divRef = useRef(null);
  const mapRef = useRef(null);
  const leafletRef = useRef(null);
  const marcadorPartida = useRef(null);
  const marcadorDestino = useRef(null);
  const marcadorPosicao = useRef(null);
  const camadaRotaRef = useRef(null);
  const estadoRef = useRef("partida");

  const refs = { mapRef, camadaRotaRef, leafletRef };

  useEffect(() => {
    if (!apiRef) return;
    apiRef.current = {
      reiniciar() {
        estadoRef.current = "partida";
        if (marcadorPartida.current) {
          marcadorPartida.current.remove();
          marcadorPartida.current = null;
        }
        if (marcadorDestino.current) {
          marcadorDestino.current.remove();
          marcadorDestino.current = null;
        }
        if (camadaRotaRef.current) {
          camadaRotaRef.current.remove();
          camadaRotaRef.current = null;
        }
        aoDefinirPartida(null, "");
        aoDefinirDestino(null, "");
      },
      limparPartida() {
        if (marcadorPartida.current) {
          marcadorPartida.current.remove();
          marcadorPartida.current = null;
        }
        if (camadaRotaRef.current) {
          camadaRotaRef.current.remove();
          camadaRotaRef.current = null;
        }
        estadoRef.current = "partida";
        aoDefinirPartida(null, "");
      },
      limparDestino() {
        if (marcadorDestino.current) {
          marcadorDestino.current.remove();
          marcadorDestino.current = null;
        }
        if (camadaRotaRef.current) {
          camadaRotaRef.current.remove();
          camadaRotaRef.current = null;
        }
        estadoRef.current = marcadorPartida.current ? "destino" : "partida";
        aoDefinirDestino(null, "");
      },
      async colocarPartidaNaLocalizacao(lat, lng) {
        const L = leafletRef.current;
        const mapa = mapRef.current;
        if (!L || !mapa) return;
        if (marcadorPartida.current) {
          marcadorPartida.current.remove();
          marcadorPartida.current = null;
        }
        if (camadaRotaRef.current) {
          camadaRotaRef.current.remove();
          camadaRotaRef.current = null;
        }

        // FIX AXE: alt="Ponto de partida" + aplicarAriaLabel
        const mk = L.marker([lat, lng], {
          icon: criarIcone(L, "#00e887", "📍"),
          draggable: true,
          alt: "Ponto de partida",
        }).addTo(mapa);
        aplicarAriaLabel(mk, "Ponto de partida");

        mk.on("dragend", async () => {
          const pos = mk.getLatLng();
          const morada = await coordenadasParaMorada(pos.lat, pos.lng);
          aoDefinirPartida([pos.lat, pos.lng], morada);
          if (marcadorDestino.current)
            desenharRota(refs, pos, marcadorDestino.current.getLatLng());
        });
        marcadorPartida.current = mk;
        if (marcadorDestino.current) {
          desenharRota(
            refs,
            mk.getLatLng(),
            marcadorDestino.current.getLatLng(),
          );
          estadoRef.current = "concluido";
        } else {
          estadoRef.current = "destino";
        }
        mapa.setView([lat, lng], 15);
      },
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    let ativo = true;
    async function iniciar() {
      if (!divRef.current || mapRef.current) return;
      const L = await carregarLeaflet();
      if (!ativo || !divRef.current) return;
      leafletRef.current = L;
      const mapa = L.map(divRef.current, {
        zoomControl: false,
        attributionControl: false,
      }).setView([38.7223, -9.1393], 14);
      L.tileLayer(
        "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png",
        { maxZoom: 19 },
      ).addTo(mapa);
      L.control.zoom({ position: "bottomright" }).addTo(mapa);
      mapRef.current = mapa;

      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          ({ coords: { latitude: lat, longitude: lng } }) => {
            if (!mapRef.current) return;
            mapRef.current.setView([lat, lng], 15);

            // FIX AXE: alt + aria-label no marcador de posição atual
            marcadorPosicao.current = L.marker([lat, lng], {
              icon: L.divIcon({
                className: "",
                html: `<div style="position:relative;width:48px;height:48px;display:flex;align-items:center;justify-content:center;">
                  <div style="position:absolute;width:48px;height:48px;border-radius:50%;background:rgba(26,110,255,0.18);border:2px solid rgba(26,110,255,0.5);animation:piscar 2s ease infinite;"></div>
                  <div style="width:14px;height:14px;border-radius:50%;background:#1a6eff;border:3px solid white;box-shadow:0 2px 8px rgba(0,0,0,.5);"></div>
                </div>`,
                iconSize: [48, 48],
                iconAnchor: [24, 24],
              }),
              zIndexOffset: 5,
              alt: "A sua posição atual",
            })
              .addTo(mapRef.current)
              .bindTooltip("A sua posição", { direction: "top" });
            aplicarAriaLabel(marcadorPosicao.current, "A sua posição atual");
          },
          () => {},
        );
      }

      mapa.on("click", async (evento) => {
        const { lat, lng } = evento.latlng;

        if (estadoRef.current === "partida") {
          if (marcadorPartida.current) marcadorPartida.current.remove();

          // FIX AXE: aria-label no marcador de partida
          const mk = L.marker([lat, lng], {
            icon: criarIcone(L, "#00e887", "📍"),
            draggable: true,
            alt: "Ponto de partida",
          }).addTo(mapa);
          aplicarAriaLabel(mk, "Ponto de partida");

          mk.on("dragend", async () => {
            const pos = mk.getLatLng();
            const morada = await coordenadasParaMorada(pos.lat, pos.lng);
            aoDefinirPartida([pos.lat, pos.lng], morada);
            if (marcadorDestino.current)
              desenharRota(refs, pos, marcadorDestino.current.getLatLng());
          });
          marcadorPartida.current = mk;
          aoDefinirPartida([lat, lng], await coordenadasParaMorada(lat, lng));
          estadoRef.current = "destino";
        } else if (estadoRef.current === "destino") {
          if (marcadorDestino.current) marcadorDestino.current.remove();

          // FIX AXE: aria-label no marcador de destino
          const mk = L.marker([lat, lng], {
            icon: criarIcone(L, "#c64dff", "🏁"),
            draggable: true,
            alt: "Ponto de destino",
          }).addTo(mapa);
          aplicarAriaLabel(mk, "Ponto de destino");

          mk.on("dragend", async () => {
            const pos = mk.getLatLng();
            const morada = await coordenadasParaMorada(pos.lat, pos.lng);
            aoDefinirDestino([pos.lat, pos.lng], morada);
            if (marcadorPartida.current)
              desenharRota(refs, marcadorPartida.current.getLatLng(), pos);
          });
          marcadorDestino.current = mk;
          aoDefinirDestino([lat, lng], await coordenadasParaMorada(lat, lng));
          estadoRef.current = "concluido";
          if (marcadorPartida.current)
            desenharRota(
              refs,
              marcadorPartida.current.getLatLng(),
              evento.latlng,
            );
        }
      });
    }
    iniciar();
    return () => {
      ativo = false;
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return <div ref={divRef} style={{ position: "absolute", inset: 0 }} />;
}

// ═══════════════════════════════════════════════════════════════════════════════
// HELPERS DE ESTADO
// ═══════════════════════════════════════════════════════════════════════════════
const PEDIDO_PAGAMENTO_PENDENTE_KEY = "pedidoPagamentoPendenteCliente";
const PEDIDOS_PAGOS_KEY = "pedidosPagosCliente";

function getMongoId(valor) {
  if (!valor) return null;
  if (typeof valor === "string") return valor;
  return valor._id || valor.id || null;
}

function getEstadoVisivel(pedido) {
  if (!pedido) return "";
  if (pedido.pagamento_estado === "pago" || pedido.pagamento_confirmado)
    return "concluido";
  if (
    pedido.estado === "concluido" &&
    pedido.pagamento_estado !== "pago" &&
    !pedido.pagamento_confirmado
  )
    return "pagamento_pendente";
  return pedido.estado;
}

function getIdsPedido(pedido) {
  return [getMongoId(pedido), getMongoId(pedido?.viagem_id)].filter(Boolean);
}

function getPedidosPagos() {
  return JSON.parse(localStorage.getItem(PEDIDOS_PAGOS_KEY) || "[]");
}

function pedidoFoiPagoLocalmente(pedido) {
  const pagos = getPedidosPagos();
  return getIdsPedido(pedido).some((id) => pagos.includes(id));
}

function guardarPedidoPago(pedido) {
  const ids = getIdsPedido(pedido);
  if (ids.length === 0) return;
  const pagos = new Set(getPedidosPagos());
  ids.forEach((id) => pagos.add(id));
  localStorage.setItem(PEDIDOS_PAGOS_KEY, JSON.stringify([...pagos]));
}

function aplicarEstadoFrontend(pedido) {
  if (!pedido) return pedido;
  const pagoLocal = pedidoFoiPagoLocalmente(pedido);
  const normalizado = pagoLocal
    ? {
        ...pedido,
        estado: "concluido",
        pagamento_estado: "pago",
        pagamento_confirmado: true,
      }
    : pedido;
  return { ...normalizado, estado_visivel: getEstadoVisivel(normalizado) };
}

function guardarPedidoPagamentoPendente(pedido) {
  if (!pedido) return;
  if (getEstadoVisivel(pedido) === "pagamento_pendente")
    localStorage.setItem(PEDIDO_PAGAMENTO_PENDENTE_KEY, JSON.stringify(pedido));
}

function limparPedidoPagamentoPendente() {
  localStorage.removeItem(PEDIDO_PAGAMENTO_PENDENTE_KEY);
}

function atualizarViagemMotoristaComoPaga(pedido) {
  const pedidoId = getMongoId(pedido);
  const viagemId = getMongoId(pedido?.viagem_id);
  const idsPagos = getIdsPedido(pedido);
  const terminadas = JSON.parse(
    localStorage.getItem("viagensTerminadasMotorista") || "[]",
  );
  const atualizadas = terminadas.map((viagem) => {
    const id = getMongoId(viagem);
    const idViagem = getMongoId(viagem?.viagem_id);
    const corresponde =
      id === pedidoId ||
      id === viagemId ||
      idViagem === pedidoId ||
      idViagem === viagemId ||
      idsPagos.includes(id) ||
      idsPagos.includes(idViagem);
    return corresponde
      ? {
          ...viagem,
          pagamento_confirmado: true,
          pagamento_estado: "pago",
          estado: "concluido",
        }
      : viagem;
  });
  localStorage.setItem(
    "viagensTerminadasMotorista",
    JSON.stringify(atualizadas),
  );
  window.dispatchEvent(new Event("viagensConfirmadasAtualizadas"));
}

// ═══════════════════════════════════════════════════════════════════════════════
// COMPONENTE PRINCIPAL: Dashboard
// ═══════════════════════════════════════════════════════════════════════════════
export default function Dashboard() {
  const apiMapa = useRef(null);
  const popupPagamentoAbertoParaPedidoRef = useRef(null);
  const nomeCartaoRef = useRef(null);
  const numeroCartaoRef = useRef(null);
  const validadeCartaoRef = useRef(null);
  const cvvCartaoRef = useRef(null);
  const telefoneMbwayRef = useRef(null);

  const [partida, setPartida] = useState(null);
  const [moradaPartida, setMoradaPartida] = useState("");
  const [destino, setDestino] = useState(null);
  const [moradaDestino, setMoradaDestino] = useState("");
  const [aLocalizarGPS, setALocalizarGPS] = useState(false);
  const [dadosRota, setDadosRota] = useState(null);
  const [aCalcular, setACalcular] = useState(false);
  const [nivelConforto, setNivelConforto] = useState("basico");
  const [numeroPessoas, setNumeroPessoas] = useState(1);
  const [pedidoAtual, setPedidoAtual] = useState(null);
  const [aPedir, setAPedir] = useState(false);
  const [erroPedido, setErroPedido] = useState("");
  const [mostrarPopupPagamento, setMostrarPopupPagamento] = useState(false);
  const [aPagar, setAPagar] = useState(false);
  const [erroPagamento, setErroPagamento] = useState("");
  const [metodoPagamento, setMetodoPagamento] = useState("cartao");
  const [aResponderMotorista, setAResponderMotorista] = useState(false);

  function apenasDigitos(valor) {
    return valor.replace(/\D/g, "");
  }

  function limitarDigitos(evento, limite) {
    evento.target.value = apenasDigitos(evento.target.value).slice(0, limite);
  }

  function formatarValidadeCartao(evento) {
    const digitos = apenasDigitos(evento.target.value).slice(0, 4);
    evento.target.value =
      digitos.length > 2
        ? `${digitos.slice(0, 2)}/${digitos.slice(2)}`
        : digitos;
  }

  function validadeCartaoValida(valor) {
    const match = valor.match(/^(\d{2})\/(\d{2})$/);
    if (!match) return false;
    const mes = Number(match[1]);
    const ano = 2000 + Number(match[2]);
    if (mes < 1 || mes > 12) return false;
    const agora = new Date();
    const fimDoMes = new Date(ano, mes, 0, 23, 59, 59);
    return fimDoMes >= agora;
  }

  function validarFormularioPagamento() {
    if (metodoPagamento === "cartao") {
      const nome = nomeCartaoRef.current?.value.trim() || "";
      const numero = apenasDigitos(numeroCartaoRef.current?.value || "");
      const validade = validadeCartaoRef.current?.value.trim() || "";
      const cvv = apenasDigitos(cvvCartaoRef.current?.value || "");
      if (
        !nome ||
        numero.length !== 16 ||
        !validadeCartaoValida(validade) ||
        cvv.length !== 3
      ) {
        setErroPagamento(
          "Preencha os dados do cartao: nome, 16 digitos, validade valida e CVV com 3 digitos.",
        );
        return false;
      }
    }
    if (metodoPagamento === "mbway") {
      const telefone = apenasDigitos(telefoneMbwayRef.current?.value || "");
      if (telefone.length !== 9 || !telefone.startsWith("9")) {
        setErroPagamento("Introduza um numero MB Way valido com 9 digitos.");
        return false;
      }
    }
    return true;
  }

  useEffect(() => {
    async function carregarPedidoAtivo() {
      try {
        const token = localStorage.getItem("token");
        const resposta = await fetch(
          "http://localhost:8080/api/pedidos/ativo",
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        );
        if (resposta.status === 404) return;
        const dados = await resposta.json();
        if (dados.success && dados.pedido) {
          const pedido = aplicarEstadoFrontend(dados.pedido);
          setPedidoAtual(pedido);
          guardarPedidoPagamentoPendente(pedido);
          return;
        }
        const pendente = JSON.parse(
          localStorage.getItem(PEDIDO_PAGAMENTO_PENDENTE_KEY) || "null",
        );
        if (pendente) setPedidoAtual(aplicarEstadoFrontend(pendente));
      } catch {
        const pendente = JSON.parse(
          localStorage.getItem(PEDIDO_PAGAMENTO_PENDENTE_KEY) || "null",
        );
        if (pendente) setPedidoAtual(aplicarEstadoFrontend(pendente));
        else console.log("Erro ao carregar pedido ativo");
      }
    }
    carregarPedidoAtivo();
  }, []);

  useEffect(() => {
    if (!pedidoAtual) return;
    const interval = setInterval(async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(
          `http://localhost:8080/api/pedidos/${pedidoAtual._id}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        );
        const data = await res.json();
        if (data.success) {
          const pedidoAtualizado = aplicarEstadoFrontend({
            ...data.pedido,
            motorista_distancia_km: data.motorista_distancia_km,
            motorista_tempo_chegada_min: data.motorista_tempo_chegada_min,
            viagem_distancia_km: data.viagem_distancia_km,
            viagem_tempo_estimado_min: data.viagem_tempo_estimado_min,
            custo_estimado: data.viagem_tempo_estimado_min
              ? (Number(data.viagem_tempo_estimado_min) * 0.75).toFixed(2)
              : null,
            taxi: data.taxi,
          });
          setPedidoAtual(pedidoAtualizado);
          if (getEstadoVisivel(pedidoAtualizado) === "pagamento_pendente")
            guardarPedidoPagamentoPendente(pedidoAtualizado);
          else if (getEstadoVisivel(pedidoAtualizado) === "concluido")
            limparPedidoPagamentoPendente();
        }
      } catch {
        console.log("Erro ao atualizar pedido");
      }
    }, 3000);
    return () => clearInterval(interval);
  }, [pedidoAtual]);

  useEffect(() => {
    function atualizarPedidoCliente() {
      setPedidoAtual((atual) => aplicarEstadoFrontend(atual));
    }
    window.addEventListener("pedidoClienteAtualizado", atualizarPedidoCliente);
    window.addEventListener("storage", atualizarPedidoCliente);
    return () => {
      window.removeEventListener(
        "pedidoClienteAtualizado",
        atualizarPedidoCliente,
      );
      window.removeEventListener("storage", atualizarPedidoCliente);
    };
  }, []);

  useEffect(() => {
    const estadoAtual = getEstadoVisivel(pedidoAtual);
    if (estadoAtual !== "pagamento_pendente") return;
    guardarPedidoPagamentoPendente(pedidoAtual);
    const pedidoId = getMongoId(pedidoAtual);
    if (popupPagamentoAbertoParaPedidoRef.current === pedidoId) return;
    popupPagamentoAbertoParaPedidoRef.current = pedidoId;
    setMostrarPopupPagamento(true);
  }, [pedidoAtual]);

  useEffect(() => {
    if (!partida || !destino) {
      setDadosRota(null);
      return;
    }
    setACalcular(true);
    obterRota(partida[1], partida[0], destino[1], destino[0])
      .then(({ distanciaM, duracaoS }) =>
        setDadosRota({ distanciaM, duracaoS }),
      )
      .catch(() => {
        const R = 6371;
        const dLat = ((destino[0] - partida[0]) * Math.PI) / 180;
        const dLng = ((destino[1] - partida[1]) * Math.PI) / 180;
        const a =
          Math.sin(dLat / 2) ** 2 +
          Math.cos((partida[0] * Math.PI) / 180) *
            Math.cos((destino[0] * Math.PI) / 180) *
            Math.sin(dLng / 2) ** 2;
        const km = R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        setDadosRota({ distanciaM: km * 1000, duracaoS: km * 2.5 * 60 });
      })
      .finally(() => setACalcular(false));
  }, [partida, destino]);

  const fmtDist = (m) =>
    m < 1000 ? `${Math.round(m)} m` : `${(m / 1000).toFixed(1)} km`;
  const fmtTempo = (s) => {
    const m = Math.round(s / 60);
    return m < 60 ? `${m} min` : `${Math.floor(m / 60)}h ${m % 60}m`;
  };

  const semPartida = !moradaPartida;
  const semDestino = !moradaDestino;
  const textoDica = semPartida
    ? "1º clique = Partida  ·  2º clique = Destino"
    : semDestino
      ? "Clique para definir o destino"
      : "Arraste os marcadores para ajustar";
  const corDica = semPartida ? "#00e887" : semDestino ? "#3d8bff" : "#c64dff";

  function reiniciar() {
    setPartida(null);
    setMoradaPartida("");
    setDestino(null);
    setMoradaDestino("");
    setDadosRota(null);
    setPedidoAtual(null);
    apiMapa.current?.reiniciar();
  }

  async function usarLocalizacaoAtual() {
    setALocalizarGPS(true);
    navigator.geolocation?.getCurrentPosition(
      async ({ coords: { latitude: lat, longitude: lng } }) => {
        if (moradaPartida) reiniciar();
        const morada = await coordenadasParaMorada(lat, lng);
        await apiMapa.current?.colocarPartidaNaLocalizacao(lat, lng);
        setPartida([lat, lng]);
        setMoradaPartida(morada);
        setALocalizarGPS(false);
      },
      () => setALocalizarGPS(false),
    );
  }

  async function pedirViagem() {
    setErroPedido("");
    if (!partida || !destino) {
      setErroPedido("Defina a partida e o destino.");
      return;
    }
    setAPedir(true);
    try {
      const token = localStorage.getItem("token");
      const resposta = await fetch("http://localhost:8080/api/pedidos/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          origem_morada: moradaPartida,
          origem_lat: partida[0],
          origem_lng: partida[1],
          destino_morada: moradaDestino,
          destino_lat: destino[0],
          destino_lng: destino[1],
          numero_pessoas: numeroPessoas,
          nivel_conforto: nivelConforto,
        }),
      });
      const texto = await resposta.text();
      const dados = texto ? JSON.parse(texto) : {};
      if (!resposta.ok) {
        setErroPedido(dados.message || "Erro ao pedir viagem.");
        if (dados.pedido) setPedidoAtual(dados.pedido);
        return;
      }
      setPedidoAtual(dados.pedido);
    } catch {
      setErroPedido("Erro de ligação ao servidor.");
    } finally {
      setAPedir(false);
    }
  }

  async function cancelarPedido() {
    if (!pedidoAtual) return;
    const token = localStorage.getItem("token");
    const res = await fetch(
      `http://localhost:8080/api/pedidos/${pedidoAtual._id}/cancelar`,
      {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
      },
    );
    const data = await res.json();
    if (!res.ok) {
      setErroPedido(data.message || "Erro ao cancelar pedido.");
      return;
    }
    setPedidoAtual(null);
  }

  async function responderMotorista(respostaCliente) {
    if (!pedidoAtual || getEstadoVisivel(pedidoAtual) !== "aceite") return;
    const token = localStorage.getItem("token");
    setAResponderMotorista(true);
    setErroPedido("");
    try {
      const res = await fetch(
        `http://localhost:8080/api/pedidos/${pedidoAtual._id}/responder`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ resposta: respostaCliente }),
        },
      );
      const data = await res.json();
      if (data.success) setPedidoAtual(aplicarEstadoFrontend(data.pedido));
      else {
        if (data.pedido) setPedidoAtual(aplicarEstadoFrontend(data.pedido));
        setErroPedido(data.message || "Erro ao responder ao motorista.");
      }
    } catch {
      setErroPedido("Erro de ligação ao servidor.");
    } finally {
      setAResponderMotorista(false);
    }
  }

  async function efetuarPagamento() {
    if (!pedidoAtual) return;
    const viagemId =
      getMongoId(pedidoAtual.viagem_id) || getMongoId(pedidoAtual);
    const clienteId = getMongoId(pedidoAtual.cliente_id);
    const valor = Number(
      pedidoAtual.preco_final ||
        pedidoAtual.custo_estimado ||
        pedidoAtual.preco ||
        0,
    );
    if (!viagemId || !clienteId || valor <= 0) {
      setErroPagamento("Não foi possível obter os dados do pagamento.");
      return;
    }
    if (!validarFormularioPagamento()) return;
    setAPagar(true);
    setErroPagamento("");
    try {
      const data = await api.pagamentos.criar({
        viagem_id: viagemId,
        cliente_id: clienteId,
        metodo: metodoPagamento,
        valor,
      });
      const pedidoPago = aplicarEstadoFrontend({
        ...pedidoAtual,
        ...(data?.pedido || {}),
        estado: "concluido",
        estado_visivel: "concluido",
        pagamento_estado: "pago",
        pagamento_confirmado: true,
      });
      guardarPedidoPago(pedidoPago);
      limparPedidoPagamentoPendente();
      atualizarViagemMotoristaComoPaga(pedidoPago);
      setPedidoAtual(pedidoPago);
      setMostrarPopupPagamento(false);
    } catch (err) {
      setErroPagamento(err.message || "Não foi possível efetuar o pagamento.");
    } finally {
      setAPagar(false);
    }
  }

  const funcionalidades = [
    {
      n: "01",
      icone: "📍",
      titulo: "Rastreio em Tempo Real",
      desc: "Acompanhe o seu motorista no mapa ao segundo. Saiba exatamente quando ele chega.",
    },
    {
      n: "02",
      icone: "✅",
      titulo: "Motoristas Verificados",
      desc: "Todos os motoristas passam por verificação de antecedentes e formação de qualidade.",
    },
    {
      n: "03",
      icone: "🛡️",
      titulo: "Viagem Segura",
      desc: "Partilhe a sua rota com alguém de confiança e viaje com total tranquilidade.",
    },
  ];
  const passos = [
    {
      n: "1",
      titulo: "Defina no mapa",
      desc: "1º clique = partida · 2º clique = destino, diretamente no mapa",
    },
    {
      n: "2",
      titulo: "Encontramos motorista",
      desc: "Ligamos ao motorista disponível mais próximo de si",
    },
    {
      n: "3",
      titulo: "Aproveite a viagem",
      desc: "Relaxe e chegue com conforto e segurança ao destino",
    },
  ];

  const estadoPedido = getEstadoVisivel(pedidoAtual);
  const pedidoBloqueiaNovaViagem = Boolean(
    pedidoAtual && estadoPedido !== "concluido",
  );
  const passoAtual = !pedidoAtual
    ? 1
    : estadoPedido === "em_viagem"
      ? 3
      : ["pagamento_pendente", "concluido"].includes(estadoPedido)
        ? 4
        : 2;

  return (
    <div className="dash-pagina">
      <div className="fundo-grelha" />
      <div className="dash-orbs">
        <div className="dash-orb-1" />
        <div className="dash-orb-2" />
        <div className="dash-orb-3" />
      </div>

      <Header isDashboard />

      <main id="conteudo-principal">
        <section className="hero">
          <div className="painel-esquerdo">
            <h1 className="titulo animar-1">
              <span className="linha-1">Chegue a qualquer</span>
              <br />
              <span className="titulo-gradiente">lado em minutos</span>
              <br />
            </h1>
            <p className="descricao animar-2">
              Clique no mapa para marcar a partida e o destino. A rota é
              calculada por estradas reais em tempo real.
            </p>

            <div className="card-reserva animar-2">
              <div className="step-dots" aria-hidden="true">
                <div
                  className={`step-dot ${passoAtual >= 1 ? "feito" : "ativo"}`}
                >
                  1
                </div>
                <div
                  className={`step-line ${passoAtual >= 2 ? "feito" : ""}`}
                />
                <div
                  className={`step-dot ${passoAtual >= 2 ? "feito-rosa" : ""}`}
                >
                  2
                </div>
                <div
                  className={`step-line ${passoAtual >= 3 ? "feito-2" : ""}`}
                />
                <div className={`step-dot ${passoAtual >= 3 ? "ativo" : ""}`}>
                  3
                </div>
                <div
                  className={`step-line ${passoAtual >= 4 ? "feito-2" : ""}`}
                />
                <div className={`step-dot ${passoAtual >= 4 ? "ativo" : ""}`}>
                  4
                </div>
              </div>

              <button
                className="btn-localizacao"
                onClick={usarLocalizacaoAtual}
                disabled={aLocalizarGPS || pedidoBloqueiaNovaViagem}
                type="button"
              >
                <span aria-hidden="true">{aLocalizarGPS ? "⌛" : "📡"}</span>
                {aLocalizarGPS
                  ? "A obter localização..."
                  : "Usar a minha localização atual"}
              </button>

              <label
                htmlFor="input-partida"
                className="rotulo-campo rotulo-verde"
              >
                Partida
              </label>
              <div className="linha-input">
                <div className="ponto ponto-verde" aria-hidden="true" />
                <input
                  id="input-partida"
                  className={`input-morada${moradaPartida ? " preenchido-verde" : ""}`}
                  type="text"
                  placeholder="Clique no mapa (1º clique)…"
                  value={moradaPartida}
                  readOnly
                  aria-readonly="true"
                />
                {moradaPartida && !pedidoBloqueiaNovaViagem && (
                  <button
                    className="btn-limpar"
                    type="button"
                    aria-label="Limpar ponto de partida"
                    onClick={() => {
                      setDadosRota(null);
                      apiMapa.current?.limparPartida();
                    }}
                  >
                    ✕
                  </button>
                )}
              </div>

              <label
                htmlFor="input-destino"
                className="rotulo-campo rotulo-azul"
              >
                Destino
              </label>
              <div className="linha-input">
                <div className="ponto ponto-azul" aria-hidden="true" />
                <input
                  id="input-destino"
                  className={`input-morada${moradaDestino ? " preenchido-azul" : ""}`}
                  type="text"
                  placeholder={
                    moradaPartida
                      ? "Clique no mapa (2º clique)…"
                      : "Primeiro defina a partida"
                  }
                  value={moradaDestino}
                  readOnly
                  aria-readonly="true"
                />
                {moradaDestino && !pedidoBloqueiaNovaViagem && (
                  <button
                    className="btn-limpar"
                    type="button"
                    aria-label="Limpar ponto de destino"
                    onClick={() => {
                      setDadosRota(null);
                      apiMapa.current?.limparDestino();
                    }}
                  >
                    ✕
                  </button>
                )}
              </div>

              {aCalcular && (
                <div className="faixa-rota" role="status" aria-live="polite">
                  <div className="faixa-loading">
                    <div className="spinner" aria-hidden="true" />A calcular
                    rota…
                  </div>
                </div>
              )}
              {dadosRota && !aCalcular && (
                <div className="faixa-rota">
                  <div className="faixa-item">
                    <div className="faixa-valor">
                      {fmtDist(dadosRota.distanciaM)}
                    </div>
                    <div className="faixa-label">Distância</div>
                  </div>
                  <div className="faixa-item">
                    <div className="faixa-valor ciano">
                      {fmtTempo(dadosRota.duracaoS)}
                    </div>
                    <div className="faixa-label">Tempo estimado</div>
                  </div>
                </div>
              )}

              <label htmlFor="nivel-conforto" className="rotulo-campo">
                Nível de conforto
              </label>
              <div className="linha-input">
                <select
                  id="nivel-conforto"
                  className="input-morada"
                  value={nivelConforto}
                  onChange={(e) => setNivelConforto(e.target.value)}
                  style={{ paddingLeft: 16 }}
                  disabled={pedidoBloqueiaNovaViagem}
                >
                  <option value="basico">Básico</option>
                  <option value="luxuoso">Luxuoso</option>
                </select>
              </div>

              <label htmlFor="numero-pessoas" className="rotulo-campo">
                Número de pessoas
              </label>
              <div className="linha-input">
                <input
                  id="numero-pessoas"
                  className="input-morada"
                  type="number"
                  min="1"
                  max="4"
                  value={numeroPessoas}
                  onChange={(e) => setNumeroPessoas(Number(e.target.value))}
                  style={{ paddingLeft: 16 }}
                  disabled={pedidoBloqueiaNovaViagem}
                />
              </div>

              <button
                className="btn-pedir"
                type="button"
                onClick={pedirViagem}
                disabled={
                  !partida ||
                  !destino ||
                  aCalcular ||
                  aPedir ||
                  pedidoBloqueiaNovaViagem
                }
              >
                {!partida
                  ? "📍 Clique no mapa para a partida"
                  : !destino
                    ? "🏁 Clique no mapa para o destino"
                    : aCalcular
                      ? "A calcular rota…"
                      : aPedir
                        ? "A pedir viagem..."
                        : pedidoBloqueiaNovaViagem
                          ? "Pedido ativo"
                          : "→ Pedir Viagem"}
              </button>

              {erroPedido && (
                <p
                  role="alert"
                  style={{ color: "#c62828", marginTop: 10, fontWeight: 700 }}
                >
                  {erroPedido}
                </p>
              )}

              {pedidoAtual && (
                <div
                  className="pedido-estado-card"
                  role="status"
                  aria-live="polite"
                >
                  <div className="pedido-estado-topo">
                    <div className="pedido-estado-titulo">Pedido ativo</div>
                    <div className={`pedido-estado-badge ${estadoPedido}`}>
                      {estadoPedido}
                    </div>
                  </div>
                  <p className="pedido-estado-texto">
                    {estadoPedido === "pendente" && "A aguardar motorista..."}
                    {estadoPedido === "aceite" && "Motorista encontrado!"}
                    {estadoPedido === "confirmado" && "Viagem confirmada"}
                    {estadoPedido === "em_viagem" &&
                      "A viagem está em curso. Aguarde o motorista terminar."}
                    {estadoPedido === "pagamento_pendente" &&
                      "A viagem terminou. O pagamento está pendente."}
                    {estadoPedido === "concluido" && "Viagem concluída e paga."}
                  </p>
                  {estadoPedido === "pagamento_pendente" && (
                    <button
                      className="btn-localizacao"
                      type="button"
                      onClick={() => setMostrarPopupPagamento(true)}
                    >
                      Efetuar pagamento
                    </button>
                  )}
                  {estadoPedido === "concluido" && (
                    <button
                      className="btn-localizacao"
                      type="button"
                      onClick={reiniciar}
                    >
                      Nova viagem
                    </button>
                  )}
                  {["pendente", "aceite", "confirmado"].includes(
                    estadoPedido,
                  ) && (
                    <button
                      className="btn-localizacao"
                      type="button"
                      onClick={cancelarPedido}
                    >
                      Cancelar pedido
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="painel-mapa animar-dir">
            <div className="caixa-mapa">
              <MapaInterativo
                apiRef={apiMapa}
                aoDefinirPartida={(c, m) => {
                  setPartida(c);
                  setMoradaPartida(m);
                }}
                aoDefinirDestino={(c, m) => {
                  setDestino(c);
                  setMoradaDestino(m);
                }}
              />
              <div className="barra-topo-mapa">
                <div className="dica-mapa" aria-live="polite">
                  <div
                    className="dica-ponto"
                    aria-hidden="true"
                    style={{
                      background: corDica,
                      boxShadow: `0 0 8px ${corDica}`,
                    }}
                  />
                  {textoDica}
                </div>
                {(moradaPartida || moradaDestino) &&
                  !pedidoBloqueiaNovaViagem && (
                    <button
                      className="btn-recomecar"
                      type="button"
                      onClick={reiniciar}
                    >
                      ↺ Recomeçar
                    </button>
                  )}
              </div>
              {aCalcular && (
                <div className="a-calcular" aria-hidden="true">
                  <div className="spinner" />A calcular rota…
                </div>
              )}
              {dadosRota && !aCalcular && (
                <div className="card-rota" aria-hidden="true">
                  <div className="rc-label">Tempo de viagem</div>
                  <div className="rc-valor">{fmtTempo(dadosRota.duracaoS)}</div>
                  <div className="rc-label" style={{ marginTop: 8 }}>
                    Distância
                  </div>
                  <div className="rc-valor2">
                    {fmtDist(dadosRota.distanciaM)}
                  </div>
                </div>
              )}
              <div className="barra-inferior-mapa">
                <div className="barra-esq">
                  <div className="barra-icone" aria-hidden="true">
                    {partida && destino ? "🗺" : partida ? "🏁" : "📍"}
                  </div>
                  <div>
                    <div className="barra-titulo">
                      {pedidoAtual
                        ? `Pedido ${estadoPedido}`
                        : partida && destino
                          ? "Rota calculada · OpenRouteService"
                          : partida
                            ? "Defina o destino no mapa"
                            : "1º clique = Partida · 2º clique = Destino"}
                    </div>
                    <div className="barra-sub">
                      {pedidoBloqueiaNovaViagem
                        ? "Tem um pedido ativo. Cancele ou termine a viagem para pedir outra."
                        : partida && destino
                          ? "Rota real por estradas · Arraste os marcadores para ajustar"
                          : "OpenStreetMap · Leaflet · ORS"}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="secao">
          <div className="secao-centro">
            <span className="secao-rotulo">Porquê TakeCab</span>
            <h2 className="secao-titulo">
              A forma mais inteligente
              <br />
              de se mover.
            </h2>
          </div>
          <div className="grelha-3">
            {funcionalidades.map((f) => (
              <div key={f.n} className="card-feat">
                <div className="feat-num" aria-hidden="true">
                  {f.n}
                </div>
                <div className="feat-icone" aria-hidden="true">
                  {f.icone}
                </div>
                <div className="feat-titulo">{f.titulo}</div>
                <div className="feat-desc">{f.desc}</div>
              </div>
            ))}
          </div>
        </section>

        <section className="secao" style={{ paddingTop: 0 }}>
          <div className="secao-centro">
            {/*
              FIX AXE: removido style={{ color: "#00884f" }} inline que sobrepunha
              o .secao-rotulo do CSS. A cor #00884f está agora definida em .secao-rotulo-verde
              no CSS, com !important para garantir especificidade.
            */}
            <span className="secao-rotulo secao-rotulo-verde">
              Processo simples
            </span>
            <h2 className="secao-titulo">Como funciona</h2>
          </div>
          <div className="grelha-3">
            {passos.map((p) => (
              <div key={p.n} className="card-passo">
                <div className="passo-num" aria-hidden="true">
                  {p.n}
                </div>
                {/* Inline style como fallback absoluto */}
                <div
                  className="passo-titulo"
                  style={{ color: "#0d1829", WebkitTextFillColor: "#0d1829" }}
                >
                  {p.titulo}
                </div>
                <div
                  className="passo-desc"
                  style={{ color: "#3d506a", WebkitTextFillColor: "#3d506a" }}
                >
                  {p.desc}
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>

      {estadoPedido === "aceite" && (
        <div
          className="popup-motorista-fundo"
          role="dialog"
          aria-modal="true"
          aria-labelledby="popup-motorista-titulo"
        >
          <div className="popup-motorista">
            <div className="popup-motorista-header">
              <div>
                <h2 id="popup-motorista-titulo">Motorista encontrado</h2>
                <p>Um motorista respondeu ao seu pedido.</p>
              </div>
              <div className="popup-motorista-icon" aria-hidden="true">
                🚕
              </div>
            </div>
            <div className="popup-motorista-info">
              <div className="popup-linha">
                <span>Motorista</span>
                <strong>{pedidoAtual.motorista_id?.nome || "Motorista"}</strong>
              </div>
              <div className="popup-linha">
                <span>Distância até si</span>
                <strong>{pedidoAtual.motorista_distancia_km || "--"} km</strong>
              </div>
              <div className="popup-linha">
                <span>Tempo até chegar</span>
                <strong>
                  {pedidoAtual.motorista_tempo_chegada_min || "--"} min
                </strong>
              </div>
              <div className="popup-linha">
                <span>Custo estimado</span>
                <strong>
                  {pedidoAtual.custo_estimado
                    ? `${pedidoAtual.custo_estimado} €`
                    : "A calcular"}
                </strong>
              </div>
              <div className="popup-linha">
                <span>Táxi</span>
                <strong>
                  {pedidoAtual.taxi
                    ? `${pedidoAtual.taxi.matricula} · ${pedidoAtual.taxi.marca || ""} ${pedidoAtual.taxi.modelo || ""}`
                    : "Detalhes indisponíveis"}
                </strong>
              </div>
            </div>
            <div className="popup-motorista-acoes">
              <button
                className="btn-rejeitar"
                type="button"
                onClick={() => responderMotorista("rejeitar")}
                disabled={aResponderMotorista}
              >
                {aResponderMotorista ? "A responder..." : "Rejeitar"}
              </button>
              <button
                className="btn-aceitar"
                type="button"
                onClick={() => responderMotorista("confirmar")}
                disabled={aResponderMotorista}
              >
                {aResponderMotorista ? "A responder..." : "Aceitar motorista"}
              </button>
            </div>
          </div>
        </div>
      )}

      {mostrarPopupPagamento && estadoPedido === "pagamento_pendente" && (
        <div
          className="popup-motorista-fundo"
          role="dialog"
          aria-modal="true"
          aria-labelledby="popup-pagamento-titulo"
        >
          <div className="popup-motorista">
            <div className="popup-motorista-header">
              <div>
                <h2 id="popup-pagamento-titulo">Viagem terminada</h2>
                <p>
                  A sua viagem foi concluída. Efetue o pagamento para finalizar.
                </p>
              </div>
              <div className="popup-motorista-icon" aria-hidden="true">
                💳
              </div>
            </div>
            <div className="popup-motorista-info">
              <div className="popup-linha">
                <span>Origem</span>
                <strong>{pedidoAtual.origem_morada || "—"}</strong>
              </div>
              <div className="popup-linha">
                <span>Destino</span>
                <strong>{pedidoAtual.destino_morada || "—"}</strong>
              </div>
              <div className="popup-linha">
                <span>Duração</span>
                <strong>
                  {pedidoAtual.duracao_minutos
                    ? `${pedidoAtual.duracao_minutos} min`
                    : "—"}
                </strong>
              </div>
              <div className="popup-linha">
                <span>Quilómetros</span>
                <strong>
                  {pedidoAtual.quilometros_percorridos
                    ? `${pedidoAtual.quilometros_percorridos} km`
                    : "—"}
                </strong>
              </div>
              <div className="popup-linha">
                <span>Total a pagar</span>
                <strong>
                  {pedidoAtual.preco_final
                    ? `${pedidoAtual.preco_final} €`
                    : "A calcular"}
                </strong>
              </div>
            </div>
            <div className="pagamento-simulado">
              <div
                className="pagamento-metodos"
                role="group"
                aria-label="Método de pagamento"
              >
                <button
                  type="button"
                  aria-pressed={metodoPagamento === "cartao"}
                  className={metodoPagamento === "cartao" ? "ativo" : ""}
                  onClick={() => {
                    setMetodoPagamento("cartao");
                    setErroPagamento("");
                  }}
                  disabled={aPagar}
                >
                  Cartão
                </button>
                <button
                  type="button"
                  aria-pressed={metodoPagamento === "mbway"}
                  className={metodoPagamento === "mbway" ? "ativo" : ""}
                  onClick={() => {
                    setMetodoPagamento("mbway");
                    setErroPagamento("");
                  }}
                  disabled={aPagar}
                >
                  MB Way
                </button>
              </div>
              {metodoPagamento === "cartao" ? (
                <div className="pagamento-form-grid">
                  <label className="pagamento-campo pagamento-campo-full">
                    <span>Nome no cartão</span>
                    <input
                      ref={nomeCartaoRef}
                      type="text"
                      placeholder="Nome do titular"
                      autoComplete="cc-name"
                      maxLength={60}
                    />
                  </label>
                  <label className="pagamento-campo pagamento-campo-full">
                    <span>Número do cartão</span>
                    <input
                      ref={numeroCartaoRef}
                      type="text"
                      inputMode="numeric"
                      placeholder="0000 0000 0000 0000"
                      autoComplete="cc-number"
                      maxLength={16}
                      onInput={(e) => limitarDigitos(e, 16)}
                    />
                  </label>
                  <label className="pagamento-campo">
                    <span>Validade</span>
                    <input
                      ref={validadeCartaoRef}
                      type="text"
                      inputMode="numeric"
                      placeholder="MM/AA"
                      autoComplete="cc-exp"
                      maxLength={5}
                      onInput={formatarValidadeCartao}
                    />
                  </label>
                  <label className="pagamento-campo">
                    <span>CVV</span>
                    <input
                      ref={cvvCartaoRef}
                      type="text"
                      inputMode="numeric"
                      placeholder="123"
                      autoComplete="cc-csc"
                      maxLength={3}
                      onInput={(e) => limitarDigitos(e, 3)}
                    />
                  </label>
                </div>
              ) : (
                <div className="pagamento-form-grid">
                  <label className="pagamento-campo pagamento-campo-full">
                    <span>Telemóvel MB Way</span>
                    <input
                      ref={telefoneMbwayRef}
                      type="tel"
                      placeholder="912 345 678"
                      autoComplete="tel"
                      maxLength={9}
                      onInput={(e) => limitarDigitos(e, 9)}
                    />
                  </label>
                </div>
              )}
              <p className="pagamento-nota">
                Estes dados servem apenas para validar a simulação. Não são
                guardados.
              </p>
            </div>
            <div className="popup-motorista-acoes">
              <button
                className="btn-rejeitar"
                type="button"
                onClick={() => setMostrarPopupPagamento(false)}
                disabled={aPagar}
              >
                Fechar
              </button>
              <button
                className="btn-aceitar"
                type="button"
                onClick={efetuarPagamento}
                disabled={aPagar}
              >
                {aPagar ? "A processar..." : "Pagar"}
              </button>
            </div>
            {erroPagamento && (
              <p
                role="alert"
                style={{ color: "#c62828", marginTop: 12, fontWeight: 700 }}
              >
                {erroPagamento}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
