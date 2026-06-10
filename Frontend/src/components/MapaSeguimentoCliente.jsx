/* eslint-disable react/prop-types */
import { useEffect, useMemo, useState } from "react";
import {
  MapContainer,
  Marker,
  Polyline,
  TileLayer,
  Tooltip,
  useMap,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { getSocket } from "../socket";

function getId(valor) {
  if (!valor) return null;
  if (typeof valor === "string") return valor;
  return valor._id || valor.id || null;
}

function criarIcone(cor, label) {
  return L.divIcon({
    className: "tracking-marker",
    html: `<div style="width:34px;height:34px;border-radius:50%;background:${cor};border:3px solid white;box-shadow:0 8px 22px rgba(0,0,0,.28);display:flex;align-items:center;justify-content:center;color:white;font-weight:900;font-size:12px;">${label}</div>`,
    iconSize: [34, 34],
    iconAnchor: [17, 17],
  });
}

const origemIcon = criarIcone("#00c96e", "P");
const destinoIcon = criarIcone("#1a6eff", "D");
const motoristaIcon = criarIcone("#111827", "🚕");

function AjustarMapa({ pontos }) {
  const map = useMap();

  useEffect(() => {
    const validos = pontos.filter(Boolean);
    if (validos.length === 0) return;
    if (validos.length === 1) {
      map.setView(validos[0], 15);
      return;
    }
    map.fitBounds(L.latLngBounds(validos), { padding: [36, 36] });
  }, [map, pontos]);

  return null;
}

export default function MapaSeguimentoCliente({ pedido }) {
  const pedidoId = getId(pedido);
  const estado = pedido?.estado_visivel || pedido?.estado;
  const [posicaoMotorista, setPosicaoMotorista] = useState(null);
  const [erro, setErro] = useState("");
  const [ativo, setAtivo] = useState(
    ["confirmado", "em_viagem"].includes(estado),
  );

  const origem = useMemo(() => {
    if (pedido?.origem_lat == null || pedido?.origem_lng == null) return null;
    return [Number(pedido.origem_lat), Number(pedido.origem_lng)];
  }, [pedido]);

  const destino = useMemo(() => {
    if (pedido?.destino_lat == null || pedido?.destino_lng == null) return null;
    return [Number(pedido.destino_lat), Number(pedido.destino_lng)];
  }, [pedido]);

  useEffect(() => {
    setAtivo(["confirmado", "em_viagem"].includes(estado));
  }, [estado]);

  useEffect(() => {
    if (!pedidoId || !ativo) return undefined;

    const socket = getSocket();

    function receberLocalizacao(payload) {
      if (payload?.pedidoId !== pedidoId) return;
      setPosicaoMotorista([Number(payload.lat), Number(payload.lng)]);
      setErro("");
    }

    function parar(payload) {
      if (payload?.pedidoId !== pedidoId) return;
      setAtivo(false);
    }

    function receberErro(payload) {
      if (!payload?.pedidoId || payload.pedidoId === pedidoId) {
        setErro(payload?.message || "Erro no acompanhamento.");
      }
    }

    socket.emit("pedido:join", { pedidoId });
    socket.on("motorista:localizacao:update", receberLocalizacao);
    socket.on("pedido:finished", parar);
    socket.on("pedido:cancelled", parar);
    socket.on("tracking:error", receberErro);

    return () => {
      socket.emit("pedido:leave", { pedidoId });
      socket.off("motorista:localizacao:update", receberLocalizacao);
      socket.off("pedido:finished", parar);
      socket.off("pedido:cancelled", parar);
      socket.off("tracking:error", receberErro);
    };
  }, [pedidoId, ativo]);

  if (!pedidoId || !origem || !destino) return null;

  return (
    <div className="tracking-card">
      <div className="tracking-card-head">
        <div>
          <strong>Acompanhamento do motorista</strong>
          <p>
            {posicaoMotorista
              ? "Localização atualizada em tempo real."
              : "A aguardar a primeira localização do motorista."}
          </p>
        </div>
        <span className={ativo ? "tracking-live" : "tracking-live off"}>
          {ativo ? "online" : "terminado"}
        </span>
      </div>

      <div className="tracking-addresses">
        <div>
          <span>Cliente</span>
          <strong>{pedido.origem_morada || "Morada de partida não indicada"}</strong>
        </div>
        <div>
          <span>Destino</span>
          <strong>{pedido.destino_morada || "Morada de destino não indicada"}</strong>
        </div>
      </div>

      <div className="tracking-map">
        <MapContainer
          center={posicaoMotorista || origem}
          zoom={14}
          zoomControl={false}
          attributionControl={false}
          className="tracking-leaflet"
        >
          <TileLayer
            maxZoom={19}
            url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
          />
          <AjustarMapa pontos={[origem, destino, posicaoMotorista]} />

          <Marker position={origem} icon={origemIcon}>
            <Tooltip>Partida</Tooltip>
          </Marker>
          <Marker position={destino} icon={destinoIcon}>
            <Tooltip>Destino</Tooltip>
          </Marker>
          <Polyline
            positions={[origem, destino]}
            pathOptions={{ color: "#1a6eff", weight: 4, opacity: 0.7 }}
          />
          {posicaoMotorista && (
            <Marker position={posicaoMotorista} icon={motoristaIcon}>
              <Tooltip>Motorista</Tooltip>
            </Marker>
          )}
        </MapContainer>
      </div>

      {erro && <p className="tracking-error">{erro}</p>}
    </div>
  );
}
