/* eslint-disable react/prop-types */
import { useState, useEffect, useRef } from "react";
import Header from "../components/Header2";
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
        const mk = L.marker([lat, lng], {
          icon: criarIcone(L, "#00e887", "📍"),
          draggable: true,
        }).addTo(mapa);
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
            })
              .addTo(mapRef.current)
              .bindTooltip("A sua posição", { direction: "top" });
          },
          () => {},
        );
      }

      mapa.on("click", async (evento) => {
        const { lat, lng } = evento.latlng;
        if (estadoRef.current === "partida") {
          if (marcadorPartida.current) marcadorPartida.current.remove();
          const mk = L.marker([lat, lng], {
            icon: criarIcone(L, "#00e887", "📍"),
            draggable: true,
          }).addTo(mapa);
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
          const mk = L.marker([lat, lng], {
            icon: criarIcone(L, "#c64dff", "🏁"),
            draggable: true,
          }).addTo(mapa);
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
// COMPONENTE PRINCIPAL: Dashboard
// ═══════════════════════════════════════════════════════════════════════════════
export default function Dashboard() {
  const apiMapa = useRef(null);
  const [partida, setPartida] = useState(null);
  const [moradaPartida, setMoradaPartida] = useState("");
  const [destino, setDestino] = useState(null);
  const [moradaDestino, setMoradaDestino] = useState("");
  const [aLocalizarGPS, setALocalizarGPS] = useState(false);
  const [dadosRota, setDadosRota] = useState(null);
  const [aCalcular, setACalcular] = useState(false);

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

  return (
    <div className="dash-pagina">
      <div className="fundo-grelha" />
      <div className="dash-orbs">
        <div className="dash-orb-1" />
        <div className="dash-orb-2" />
        <div className="dash-orb-3" />
      </div>

      <Header isDashboard />

      <section className="hero">
        <div className="painel-esquerdo">
          <h1 className="titulo animar-1">
            <span className="linha-1">Chegue a qualquer</span>
            <br />
            <span className="titulo-gradiente">lado em minutos</span>
            <br />
          </h1>
          <p className="descricao animar-2">
            Clique no mapa para marcar a partida e o destino. A rota é calculada
            por estradas reais em tempo real.
          </p>

          <div className="card-reserva animar-2">
            <div className="step-dots" aria-hidden="true">
              <div className={`step-dot ${partida ? "feito" : "ativo"}`}>1</div>
              <div className={`step-line ${partida ? "feito" : ""}`} />
              <div
                className={`step-dot ${destino ? "feito-rosa" : partida ? "ativo" : ""}`}
              >
                2
              </div>
              <div className={`step-line ${destino ? "feito-2" : ""}`} />
              <div className={`step-dot ${partida && destino ? "ativo" : ""}`}>
                3
              </div>
            </div>

            <button
              className="btn-localizacao"
              onClick={usarLocalizacaoAtual}
              disabled={aLocalizarGPS}
            >
              <span>{aLocalizarGPS ? "⌛" : "📡"}</span>
              {aLocalizarGPS
                ? "A obter localização..."
                : "Usar a minha localização atual"}
            </button>

            <div className="rotulo-campo rotulo-verde">Partida</div>
            <div className="linha-input">
              <div className="ponto ponto-verde" />
              <input
                className={`input-morada${moradaPartida ? " preenchido-verde" : ""}`}
                type="text"
                placeholder="Clique no mapa (1º clique)…"
                value={moradaPartida}
                readOnly
              />
              {moradaPartida && (
                <button
                  className="btn-limpar"
                  type="button"
                  onClick={() => {
                    setDadosRota(null);
                    apiMapa.current?.limparPartida();
                  }}
                >
                  ✕
                </button>
              )}
            </div>

            <div className="rotulo-campo rotulo-azul">Destino</div>
            <div className="linha-input">
              <div className="ponto ponto-azul" />
              <input
                className={`input-morada${moradaDestino ? " preenchido-azul" : ""}`}
                type="text"
                placeholder={
                  moradaPartida
                    ? "Clique no mapa (2º clique)…"
                    : "Primeiro defina a partida"
                }
                value={moradaDestino}
                readOnly
              />
              {moradaDestino && (
                <button
                  className="btn-limpar"
                  type="button"
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
              <div className="faixa-rota">
                <div className="faixa-loading">
                  <div className="spinner" />A calcular rota…
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

            <button
              className="btn-pedir"
              disabled={!partida || !destino || aCalcular}
            >
              {!partida
                ? "📍 Clique no mapa para a partida"
                : !destino
                  ? "🏁 Clique no mapa para o destino"
                  : aCalcular
                    ? "A calcular rota…"
                    : "→ Pedir Viagem"}
            </button>
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
              <div className="dica-mapa">
                <div
                  className="dica-ponto"
                  style={{
                    background: corDica,
                    boxShadow: `0 0 8px ${corDica}`,
                  }}
                />
                {textoDica}
              </div>
              {(moradaPartida || moradaDestino) && (
                <button className="btn-recomecar" onClick={reiniciar}>
                  ↺ Recomeçar
                </button>
              )}
            </div>
            {aCalcular && (
              <div className="a-calcular">
                <div className="spinner" />A calcular rota…
              </div>
            )}
            {dadosRota && !aCalcular && (
              <div className="card-rota">
                <div className="rc-label">Tempo de viagem</div>
                <div className="rc-valor">{fmtTempo(dadosRota.duracaoS)}</div>
                <div className="rc-label" style={{ marginTop: 8 }}>
                  Distância
                </div>
                <div className="rc-valor2">{fmtDist(dadosRota.distanciaM)}</div>
              </div>
            )}
            <div className="barra-inferior-mapa">
              <div className="barra-esq">
                <div className="barra-icone">
                  {partida && destino ? "🗺" : partida ? "🏁" : "📍"}
                </div>
                <div>
                  <div className="barra-titulo">
                    {partida && destino
                      ? "Rota calculada · OpenRouteService"
                      : partida
                        ? "Defina o destino no mapa"
                        : "1º clique = Partida · 2º clique = Destino"}
                  </div>
                  <div className="barra-sub">
                    {partida && destino
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
              <div className="feat-num">{f.n}</div>
              <div className="feat-icone">{f.icone}</div>
              <div className="feat-titulo">{f.titulo}</div>
              <div className="feat-desc">{f.desc}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="secao" style={{ paddingTop: 0 }}>
        <div className="secao-centro">
          <span className="secao-rotulo" style={{ color: "var(--verde)" }}>
            Processo simples
          </span>
          <h2 className="secao-titulo">Como funciona</h2>
        </div>
        <div className="grelha-3">
          {passos.map((p) => (
            <div key={p.n} className="card-passo">
              <div className="passo-num">{p.n}</div>
              <div className="passo-titulo">{p.titulo}</div>
              <div className="passo-desc">{p.desc}</div>
            </div>
          ))}
        </div>
      </section>

      <div className="cta-wrap">
        <div className="cta-box">
          <div
            style={{
              position: "absolute",
              top: 0,
              right: 0,
              width: 240,
              height: 240,
              background: "rgba(26,110,255,.16)",
              borderRadius: "50%",
              filter: "blur(80px)",
            }}
          />
          <div
            style={{
              position: "absolute",
              bottom: 0,
              left: 0,
              width: 200,
              height: 200,
              background: "rgba(198,77,255,.13)",
              borderRadius: "50%",
              filter: "blur(60px)",
            }}
          />
          <div style={{ position: "relative" }}>
            <h2 className="cta-titulo">Pronto para partir?</h2>
            <p className="cta-desc">
              A sua próxima viagem está a um toque de distância. Peça uma
              viagem!
            </p>
            <div className="cta-botoes">
              <button className="btn-branco">Pedir Viagem</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
