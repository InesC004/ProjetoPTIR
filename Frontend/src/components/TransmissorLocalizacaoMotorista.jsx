import { useEffect, useState } from "react";
import { getSocket } from "../socket";

function getId(pedido) {
  return pedido?._id || pedido?.id || null;
}

function lerJson(chave) {
  try {
    return JSON.parse(localStorage.getItem(chave) || "[]");
  } catch {
    return [];
  }
}

function obterPedidoAtivo() {
  const confirmados = lerJson("confirmacoesAceitesMotorista");
  const viagens = lerJson("viagensConfirmadasMotorista");

  return [...viagens, ...confirmados].find((pedido) =>
    ["confirmado", "em_viagem"].includes(pedido?.estado),
  );
}

export default function TransmissorLocalizacaoMotorista() {
  const [pedidoAtivo, setPedidoAtivo] = useState(() => obterPedidoAtivo());

  useEffect(() => {
    function atualizar() {
      const proximo = obterPedidoAtivo();
      setPedidoAtivo((atual) => {
        if (getId(atual) === getId(proximo) && atual?.estado === proximo?.estado) {
          return atual;
        }
        return proximo;
      });
    }

    atualizar();
    const interval = setInterval(atualizar, 3000);
    window.addEventListener("storage", atualizar);
    window.addEventListener("confirmacoesAceitesAtualizadas", atualizar);
    window.addEventListener("viagensConfirmadasAtualizadas", atualizar);

    return () => {
      clearInterval(interval);
      window.removeEventListener("storage", atualizar);
      window.removeEventListener("confirmacoesAceitesAtualizadas", atualizar);
      window.removeEventListener("viagensConfirmadasAtualizadas", atualizar);
    };
  }, []);

  useEffect(() => {
    const pedidoId = getId(pedidoAtivo);
    if (!pedidoId || !navigator.geolocation) return undefined;

    const socket = getSocket();
    let ultimoEnvio = 0;

    function enviarLocalizacao(posicao) {
      const agora = Date.now();
      if (agora - ultimoEnvio < 2000) return;
      ultimoEnvio = agora;

      socket.emit("motorista:localizacao", {
        pedidoId,
        lat: posicao.coords.latitude,
        lng: posicao.coords.longitude,
        accuracy: posicao.coords.accuracy,
        heading: posicao.coords.heading,
        speed: posicao.coords.speed,
        timestamp: new Date(posicao.timestamp || agora).toISOString(),
      });
    }

    socket.emit("pedido:join", { pedidoId });
    const watchId = navigator.geolocation.watchPosition(
      enviarLocalizacao,
      () => {},
      {
        enableHighAccuracy: true,
        maximumAge: 3000,
        timeout: 10000,
      },
    );

    return () => {
      navigator.geolocation.clearWatch(watchId);
      socket.emit("pedido:leave", { pedidoId });
    };
  }, [pedidoAtivo]);

  return null;
}
