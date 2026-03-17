/* eslint-disable react/prop-types */
import { useState, useEffect, useRef } from "react";
import Header from "../components/Header2";

// ═══════════════════════════════════════════════════════════════════════════════
// ESTILOS GLOBAIS
// Injetados uma única vez no <head> do documento
// ═══════════════════════════════════════════════════════════════════════════════
const ESTILOS = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500&display=swap');
  @import url('https://unpkg.com/leaflet@1.9.4/dist/leaflet.css');

  :root {
    --fundo:       #050d1a;
    --azul:        #1a6eff;
    --azul-claro:  #3d8bff;
    --ciano:       #00d4ff;
    --rosa:        #c64dff;
    --verde:       #00e887;
    --branco:      #f0f6ff;
    --cinza:       #6b8baa;
    --card:        rgba(10,30,60,0.6);
    --borda:       rgba(26,110,255,0.18);
  }

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  html { scroll-behavior: smooth; }
  body { font-family: 'DM Sans', sans-serif; background: var(--fundo); color: var(--branco); overflow-x: hidden; }

  /* Grelha de fundo decorativa */
  .fundo-grelha {
    position: fixed; inset: 0; z-index: 0; pointer-events: none;
    background-image:
      linear-gradient(rgba(26,110,255,0.04) 1px, transparent 1px),
      linear-gradient(90deg, rgba(26,110,255,0.04) 1px, transparent 1px);
    background-size: 60px 60px;
    mask-image: radial-gradient(ellipse 100% 80% at 50% 50%, black 40%, transparent 100%);
  }

  /* ── Layout principal: dois painéis lado a lado ── */
  .hero {
    position: relative; z-index: 1;
    display: grid;
    grid-template-columns: 540px 1fr;
    gap: 32px;
    padding: 86px 48px 48px;
    max-width: 1600px;
    margin: 0 auto;
    /* stretch: ambas as colunas ficam com a mesma altura */
    align-items: stretch;
    /* min-height garante que o mapa nunca fica esmagado */
    min-height: 100vh;
  }

  /* Coluna esquerda: scroll interno se o conteúdo for muito alto */
  .painel-esquerdo {
    display: flex; flex-direction: column;
    position: sticky;
    top: 86px;
    /* altura = viewport - header - padding bottom */
    max-height: calc(100vh - 86px - 48px);
    overflow-y: auto;
    scrollbar-width: none;
  }
  .painel-esquerdo::-webkit-scrollbar { display: none; }



  /* Badge de estado (ex: "3 motoristas disponíveis") */
  .badge {
    display: inline-flex; align-items: center; gap: 8px;
    background: rgba(26,110,255,0.1);
    border: 1px solid rgba(26,110,255,0.28);
    border-radius: 100px;
    padding: 6px 16px 6px 10px;
    font-size: 0.8rem; color: var(--ciano);
    margin-bottom: 22px; align-self: flex-start;
  }
  .badge-ponto {
    width: 7px; height: 7px; border-radius: 50%;
    background: var(--ciano); box-shadow: 0 0 8px var(--ciano);
    animation: piscar 2s ease infinite;
  }
  @keyframes piscar { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:.4;transform:scale(.7)} }

  /* Título principal */
  .titulo {
    font-family: 'Syne', sans-serif;
    font-size: clamp(2.8rem, 3.5vw, 4.6rem);
    font-weight: 800; line-height: 1.02;
    letter-spacing: -0.04em; margin-bottom: 16px;
  }
  .titulo-gradiente {
    background: linear-gradient(90deg, var(--azul-claro), var(--ciano) 50%, var(--rosa));
    -webkit-background-clip: text; -webkit-text-fill-color: transparent;
    background-clip: text;
  }
  .descricao {
    color: var(--cinza); font-size: 1.05rem;
    line-height: 1.65; margin-bottom: 28px;
  }

  /* ── Card de reserva ── */
  .card-reserva {
    background: var(--card); backdrop-filter: blur(24px);
    border: 1px solid var(--borda); border-radius: 24px;
    padding: 26px; margin-bottom: 28px;
    box-shadow: 0 20px 60px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.05);
  }

  /* Botão "Usar localização atual" */
  .btn-localizacao {
    width: 100%; display: flex; align-items: center; justify-content: center;
    gap: 9px;
    background: rgba(0,232,135,0.08); border: 1px solid rgba(0,232,135,0.22);
    border-radius: 13px; padding: 13px;
    color: var(--verde); font-size: 0.88rem; font-weight: 500;
    cursor: pointer; transition: all 0.2s; margin-bottom: 20px;
    font-family: 'DM Sans', sans-serif;
  }
  .btn-localizacao:hover  { background: rgba(0,232,135,0.15); border-color: rgba(0,232,135,0.45); }
  .btn-localizacao:disabled { opacity: 0.45; cursor: not-allowed; }

  /* Rótulos dos campos (PARTIDA / DESTINO) */
  .rotulo-campo {
    font-size: 0.72rem; font-weight: 700;
    letter-spacing: 0.08em; text-transform: uppercase;
    margin-bottom: 9px; padding-left: 2px;
  }
  .rotulo-verde { color: var(--verde); }
  .rotulo-azul  { color: var(--azul-claro); }

  /* Linha de input com ponto colorido à esquerda */
  .linha-input { display: flex; align-items: center; gap: 8px; margin-bottom: 18px; position: relative; }
  .ponto {
    position: absolute; left: 15px; top: 50%; transform: translateY(-50%);
    width: 10px; height: 10px; border-radius: 50%;
    z-index: 2; pointer-events: none;
  }
  .ponto-verde { background: var(--verde); box-shadow: 0 0 8px var(--verde); }
  .ponto-azul  { background: var(--azul);  box-shadow: 0 0 8px var(--azul);  }

  .input-morada {
    flex: 1;
    background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08);
    border-radius: 13px; padding: 15px 15px 15px 40px;
    color: var(--branco); font-family: 'DM Sans', sans-serif; font-size: 0.94rem;
    outline: none; transition: all 0.2s; min-width: 0;
  }
  .input-morada::placeholder { color: rgba(107,139,170,.6); }
  .input-morada:focus { border-color: rgba(26,110,255,.45); background: rgba(26,110,255,.06); box-shadow: 0 0 0 3px rgba(26,110,255,.1); }
  .input-morada.preenchido-verde { border-color: rgba(0,232,135,0.35); background: rgba(0,232,135,0.05); }
  .input-morada.preenchido-azul  { border-color: rgba(26,110,255,0.4);  background: rgba(26,110,255,0.06); }

  /* Botão X para limpar um campo */
  .btn-limpar {
    background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.09);
    border-radius: 10px; color: var(--cinza);
    width: 38px; height: 38px; min-width: 38px;
    display: flex; align-items: center; justify-content: center;
    cursor: pointer; transition: all 0.2s; font-size: 0.8rem;
  }
  .btn-limpar:hover { background: rgba(255,80,80,0.14); border-color: rgba(255,80,80,0.3); color: #ff6b6b; }

  /* Faixa com distância + tempo da rota */
  .faixa-rota {
    display: flex; margin-bottom: 20px;
    background: rgba(26,110,255,0.07); border: 1px solid rgba(26,110,255,0.18);
    border-radius: 14px; overflow: hidden;
  }
  .faixa-item { flex: 1; display: flex; flex-direction: column; align-items: center; padding: 14px 8px; gap: 4px; }
  .faixa-item + .faixa-item { border-left: 1px solid rgba(26,110,255,0.15); }
  .faixa-valor { font-family: 'Syne', sans-serif; font-size: 1.15rem; font-weight: 800; color: var(--branco); line-height: 1; }
  .faixa-valor.ciano { color: var(--ciano); }
  .faixa-label { font-size: 0.68rem; color: var(--cinza); }
  .faixa-loading { padding: 15px; color: var(--cinza); font-size: 0.84rem; display: flex; align-items: center; gap: 9px; width: 100%; justify-content: center; }

  /* Botão principal "Pedir Viagem" */
  .btn-pedir {
    width: 100%; padding: 17px;
    background: linear-gradient(135deg, var(--azul) 0%, #0052cc 50%, var(--azul) 100%);
    background-size: 200% 100%;
    border: none; border-radius: 14px; color: #fff;
    font-family: 'Syne', sans-serif; font-size: 1.02rem; font-weight: 700;
    letter-spacing: 0.02em; cursor: pointer; transition: all 0.3s;
  }
  .btn-pedir:hover:not(:disabled) { background-position: 100% 0; box-shadow: 0 8px 32px rgba(26,110,255,.4); transform: translateY(-1px); }
  .btn-pedir:disabled { opacity: 0.36; cursor: not-allowed; transform: none; }

  /* Estatísticas rápidas (3min, 50k+, 4.9★) */
  .estatisticas { display: flex; gap: 28px; padding-top: 22px; border-top: 1px solid var(--borda); }
  .stat-numero { font-family: 'Syne', sans-serif; font-size: 1.8rem; font-weight: 800; color: var(--branco); line-height: 1; }
  .stat-numero span { color: var(--ciano); }
  .stat-label  { font-size: 0.76rem; color: var(--cinza); margin-top: 4px; }
  .stat-divider { width: 1px; background: var(--borda); }

  /* ── Painel do mapa: flex coluna para a caixa-mapa crescer ── */
  .painel-mapa { position: relative; display: flex; flex-direction: column; }
  .caixa-mapa {
    position: relative; border-radius: 24px; overflow: hidden;
    border: 1px solid var(--borda); box-shadow: 0 24px 60px rgba(0,0,0,.5);
    /* Preenche toda a altura disponível no grid */
    flex: 1;
    min-height: 480px;
  }
  .caixa-mapa .leaflet-container { background: #060f1e !important; }
  .caixa-mapa .leaflet-tile-pane { filter: brightness(0.85) saturate(0.75); }

  /* Barra superior do mapa: dica + botão recomeçar */
  .barra-topo-mapa {
    position: absolute; top: 14px; left: 14px; right: 14px;
    z-index: 500;
    display: flex; align-items: center; justify-content: space-between;
    gap: 10px; pointer-events: none;
  }
  .dica-mapa {
    display: flex; align-items: center; gap: 8px;
    background: rgba(5,13,26,0.92); backdrop-filter: blur(16px);
    border: 1px solid var(--borda); border-radius: 100px;
    padding: 8px 18px; font-size: 0.78rem; color: var(--branco);
    box-shadow: 0 4px 20px rgba(0,0,0,.4); white-space: nowrap; pointer-events: none;
  }
  .dica-ponto { width: 7px; height: 7px; border-radius: 50%; flex-shrink: 0; }
  .btn-recomecar {
    background: rgba(5,13,26,0.92); backdrop-filter: blur(12px);
    border: 1px solid var(--borda); border-radius: 100px;
    padding: 8px 16px; color: var(--cinza); font-size: 0.76rem;
    cursor: pointer; transition: all 0.2s; display: flex; align-items: center; gap: 6px;
    pointer-events: all; white-space: nowrap; box-shadow: 0 4px 20px rgba(0,0,0,.4);
    font-family: 'DM Sans', sans-serif;
  }
  .btn-recomecar:hover { border-color: rgba(255,80,80,0.45); color: #ff6b6b; background: rgba(40,5,5,0.94); }

  /* Card flutuante com tempo + distância (canto inferior direito do mapa) */
  .card-rota {
    position: absolute; bottom: 70px; right: 14px; z-index: 500;
    background: rgba(5,13,26,0.92); backdrop-filter: blur(18px);
    border: 1px solid var(--borda); border-radius: 16px;
    padding: 14px 18px; min-width: 130px; text-align: right;
    box-shadow: 0 8px 32px rgba(0,0,0,.45);
    animation: flutuar 4s ease-in-out infinite;
  }
  @keyframes flutuar { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-4px)} }
  .rc-label  { color: var(--cinza); font-size: 0.66rem; margin-bottom: 2px; }
  .rc-valor  { font-family: 'Syne', sans-serif; font-size: 1.3rem; font-weight: 800; color: var(--ciano); line-height: 1; }
  .rc-valor2 { font-family: 'Syne', sans-serif; font-size: 0.95rem; font-weight: 700; color: var(--branco); margin-top: 8px; line-height: 1; }

  /* Indicador de carregamento da rota */
  .a-calcular {
    position: absolute; bottom: 70px; right: 14px; z-index: 500;
    background: rgba(5,13,26,0.92); backdrop-filter: blur(16px);
    border: 1px solid var(--borda); border-radius: 100px;
    padding: 8px 16px; font-size: 0.76rem; color: var(--cinza);
    display: flex; align-items: center; gap: 8px;
    box-shadow: 0 4px 20px rgba(0,0,0,.4); font-family: 'DM Sans', sans-serif;
  }
  @keyframes girar { to { transform: rotate(360deg); } }
  .spinner { width: 12px; height: 12px; flex-shrink: 0; border: 2px solid rgba(26,110,255,0.3); border-top-color: var(--azul); border-radius: 50%; animation: girar 0.8s linear infinite; }

  /* Barra inferior do mapa */
  .barra-inferior-mapa {
    position: absolute; bottom: 0; left: 0; right: 0; z-index: 500;
    background: rgba(5,13,26,0.93); backdrop-filter: blur(20px);
    border-top: 1px solid var(--borda); border-radius: 0 0 24px 24px;
    padding: 12px 18px; display: flex; align-items: center; justify-content: space-between;
  }
  .barra-esq   { display: flex; align-items: center; gap: 11px; }
  .barra-icone { width: 36px; height: 36px; border-radius: 10px; background: linear-gradient(135deg, var(--azul), #7c3aed); display: flex; align-items: center; justify-content: center; font-size: 0.9rem; }
  .barra-titulo { color: var(--branco); font-weight: 600; font-size: 0.84rem; }
  .barra-sub    { color: var(--cinza); font-size: 0.69rem; }
  .barra-dir    { text-align: right; }
  .barra-valor  { color: var(--verde); font-weight: 600; font-size: 0.86rem; }
  .barra-valor2 { color: var(--cinza); font-size: 0.68rem; }

  /* ── Secções abaixo do hero ── */
  .secao { position: relative; z-index: 1; padding: 96px 48px; max-width: 1600px; margin: 0 auto; }
  .secao-centro { text-align: center; margin-bottom: 56px; }
  .secao-rotulo { display: inline-block; color: var(--ciano); font-size: 0.72rem; letter-spacing: 0.2em; text-transform: uppercase; font-weight: 500; margin-bottom: 14px; }
  .secao-titulo { font-family: 'Syne', sans-serif; font-size: clamp(2rem,3vw,3.4rem); font-weight: 800; letter-spacing: -0.03em; }

  /* Grelha das funcionalidades */
  .grelha-3 { display: grid; grid-template-columns: repeat(3,1fr); gap: 22px; }
  .card-feat { background: var(--card); border: 1px solid var(--borda); border-radius: 24px; padding: 36px 30px; position: relative; overflow: hidden; transition: all 0.3s; }
  .card-feat::before { content:''; position:absolute; top:0; left:0; right:0; height:2px; background:linear-gradient(90deg,transparent,var(--azul),transparent); opacity:0; transition:opacity 0.3s; }
  .card-feat:hover { border-color:rgba(26,110,255,.35); transform:translateY(-4px); box-shadow:0 24px 60px rgba(0,0,0,.3); }
  .card-feat:hover::before { opacity:1; }
  .feat-num   { font-family:'Syne',sans-serif; font-size:3.5rem; font-weight:800; color:rgba(26,110,255,.11); line-height:1; margin-bottom:20px; }
  .feat-icone { width:48px; height:48px; background:rgba(26,110,255,.1); border:1px solid rgba(26,110,255,.2); border-radius:14px; display:flex; align-items:center; justify-content:center; font-size:1.4rem; margin-bottom:18px; transition:all 0.3s; }
  .card-feat:hover .feat-icone { background:rgba(26,110,255,.2); border-color:rgba(26,110,255,.4); box-shadow:0 0 22px rgba(26,110,255,.2); }
  .feat-titulo { font-family:'Syne',sans-serif; font-size:1.1rem; font-weight:700; margin-bottom:10px; }
  .feat-desc   { color:var(--cinza); font-size:0.9rem; line-height:1.6; }

  /* Cards "Como funciona" */
  .card-passo { text-align:center; padding:44px 28px; background:var(--card); border:1px solid var(--borda); border-radius:24px; transition:all 0.3s; }
  .card-passo:hover { transform:translateY(-4px); border-color:rgba(26,110,255,.3); }
  .passo-num  { width:64px; height:64px; margin:0 auto 24px; border-radius:20px; background:linear-gradient(135deg,var(--azul),#7c3aed); display:flex; align-items:center; justify-content:center; font-family:'Syne',sans-serif; font-size:1.6rem; font-weight:800; color:#fff; box-shadow:0 8px 28px rgba(26,110,255,.35); }
  .passo-titulo { font-family:'Syne',sans-serif; font-size:1.1rem; font-weight:700; margin-bottom:10px; }
  .passo-desc   { color:var(--cinza); font-size:0.9rem; line-height:1.55; }

  /* Secção CTA */
  .cta-wrap { position:relative; z-index:1; padding:0 48px 96px; max-width:1600px; margin:0 auto; }
  .cta-box  { background:linear-gradient(135deg,rgba(26,110,255,.22) 0%,rgba(124,58,237,.14) 50%,rgba(198,77,255,.07) 100%); border:1px solid rgba(255,255,255,.1); border-radius:2rem; padding:88px 56px; text-align:center; position:relative; overflow:hidden; }
  .cta-titulo { font-family:'Syne',sans-serif; font-size:clamp(2rem,3vw,3.2rem); font-weight:800; letter-spacing:-0.03em; margin-bottom:16px; }
  .cta-desc   { color:var(--cinza); font-size:1.05rem; max-width:440px; margin:0 auto 36px; line-height:1.6; }
  .cta-botoes { display:flex; gap:14px; justify-content:center; flex-wrap:wrap; }
  .btn-branco { padding:17px 40px; border-radius:14px; background:var(--branco); color:var(--fundo); font-family:'Syne',sans-serif; font-weight:700; border:none; cursor:pointer; transition:all 0.2s; font-size:0.98rem; }
  .btn-branco:hover { transform:scale(1.04); box-shadow:0 0 28px rgba(255,255,255,.3); }
  .btn-fantasma { padding:17px 40px; border-radius:14px; background:rgba(255,255,255,.08); border:1px solid rgba(255,255,255,.2); color:var(--branco); font-family:'Syne',sans-serif; font-weight:700; cursor:pointer; transition:all 0.2s; font-size:0.98rem; }
  .btn-fantasma:hover { background:rgba(255,255,255,.14); }

  /* Rodapé */
  .rodape { position:relative; z-index:1; border-top:1px solid rgba(255,255,255,.05); padding:64px 48px 44px; max-width:1600px; margin:0 auto; }
  .rodape-grelha { display:grid; grid-template-columns:1.6fr 1fr 1fr 1fr; gap:52px; margin-bottom:52px; }
  .rodape-marca  { font-family:'Syne',sans-serif; font-size:1.5rem; font-weight:800; margin-bottom:12px; }
  .rodape-marca span { color:var(--azul-claro); }
  .rodape-tagline  { color:var(--cinza); font-size:0.88rem; line-height:1.65; }
  .rodape-titulo   { color:var(--branco); font-weight:600; font-size:0.92rem; margin-bottom:18px; }
  .rodape a { display:block; color:var(--cinza); font-size:0.86rem; text-decoration:none; margin-bottom:11px; transition:color 0.2s; }
  .rodape a:hover { color:var(--branco); }
  .rodape-base { display:flex; justify-content:space-between; align-items:center; padding-top:24px; border-top:1px solid rgba(255,255,255,.05); }
  .rodape-copy     { color:rgba(107,139,170,.45); font-size:0.82rem; }
  .rodape-sociais  { display:flex; gap:22px; }
  .rodape-sociais a { color:rgba(107,139,170,.45) !important; margin:0 !important; }

  /* Animações de entrada */
  .animar    { animation: subir 0.7s ease both; }
  .animar-1  { animation: subir 0.7s 0.08s ease both; }
  .animar-2  { animation: subir 0.7s 0.2s  ease both; }
  .animar-3  { animation: subir 0.7s 0.34s ease both; }
  .animar-dir { animation: direita 0.7s 0.12s ease both; }
  @keyframes subir   { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
  @keyframes direita { from{opacity:0;transform:translateX(20px)} to{opacity:1;transform:translateX(0)} }

  /* ════════════════════════════════
     RESPONSIVIDADE
  ════════════════════════════════ */
  @media (max-width: 1400px) {
    .hero { grid-template-columns: 500px 1fr; padding: 80px 36px 44px; }
  }
  @media (max-width: 1200px) {
    .hero { grid-template-columns: 460px 1fr; padding: 80px 28px 40px; gap: 24px; }
    .titulo { font-size: clamp(2.4rem, 3.2vw, 3.8rem); }
    .painel-esquerdo { position: static; } /* sem sticky em tablets */
  }
  @media (max-width: 1024px) {
    .hero { grid-template-columns: 1fr; padding: 76px 24px 40px; min-height: auto; gap: 28px; }
    .painel-esquerdo { position: static; padding-top: 16px; }
    .caixa-mapa { height: 500px; min-height: 400px; max-height: 500px; }
    .secao  { padding: 72px 24px; }
    .cta-wrap { padding: 0 24px 72px; }
    .rodape { padding: 52px 24px 36px; }
    .rodape-grelha { grid-template-columns: 1fr 1fr; gap: 32px; }
  }
  @media (max-width: 768px) {
    .hero { padding: 72px 16px 32px; gap: 22px; }
    .grelha-3 { grid-template-columns: 1fr 1fr; gap: 14px; }
    .caixa-mapa { height: 420px; max-height: 420px; }
    .secao  { padding: 56px 16px; }
    .cta-wrap { padding: 0 16px 56px; }
    .rodape { padding: 44px 16px 28px; }
    .cta-box { padding: 60px 24px; }
    .titulo { font-size: 2.6rem; }
  }
  @media (max-width: 480px) {
    .grelha-3 { grid-template-columns: 1fr; }
    .rodape-grelha { grid-template-columns: 1fr; gap: 28px; }
    .caixa-mapa { height: 360px; max-height: 360px; }
    .titulo { font-size: 2.2rem; }
    .estatisticas { gap: 16px; }
    .dica-mapa { font-size: 0.7rem; padding: 6px 12px; }
    .hero { padding: 68px 12px 28px; }
    .card-reserva { padding: 18px; }
  }
`;

// ═══════════════════════════════════════════════════════════════════════════════
// UTILITÁRIOS
// ═══════════════════════════════════════════════════════════════════════════════

// Injeta os estilos no <head> uma única vez
let estilosInjetados = false;
function injetarEstilos() {
  if (estilosInjetados || typeof document === "undefined") return;
  const el = document.createElement("style");
  el.textContent = ESTILOS;
  document.head.appendChild(el);
  estilosInjetados = true;
}

// Carrega a biblioteca Leaflet de forma assíncrona (só uma vez)
function carregarLeaflet() {
  return new Promise((resolve) => {
    if (window.L) return resolve(window.L);
    const script = document.createElement("script");
    script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
    script.onload = () => resolve(window.L);
    document.head.appendChild(script);
  });
}

// Cria um marcador circular personalizado no mapa
function criarIcone(L, cor, emoji, tamanho = 38) {
  return L.divIcon({
    className: "",
    html: `<div style="width:${tamanho}px;height:${tamanho}px;border-radius:50%;background:${cor};display:flex;align-items:center;justify-content:center;font-size:${Math.round(tamanho * 0.44)}px;box-shadow:0 0 18px ${cor}99,0 4px 14px rgba(0,0,0,.65);border:2.5px solid rgba(255,255,255,.2);">${emoji}</div>`,
    iconSize: [tamanho, tamanho],
    iconAnchor: [tamanho / 2, tamanho / 2],
  });
}

// Converte coordenadas GPS em nome de rua (via Nominatim / OpenStreetMap)
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

// Chave da API OpenRouteService (gratuita, 5000 pedidos/dia)
const CHAVE_ORS = "5b3ce3597851110001cf6248a8d6e04a30ed45e6b3a20d5e0b3c7d26";

// Obtém rota real por estradas entre dois pontos (coordenadas)
async function obterRota(lngOrigem, latOrigem, lngDestino, latDestino) {
  const resposta = await fetch(
    `https://api.openrouteservice.org/v2/directions/driving-car?api_key=${CHAVE_ORS}&start=${lngOrigem},${latOrigem}&end=${lngDestino},${latDestino}`,
  );
  if (!resposta.ok) throw new Error("Erro ORS: " + resposta.status);
  const dados = await resposta.json();
  const feature = dados.features[0];
  const segmento = feature.properties.segments[0];
  return {
    // ORS devolve [lng,lat] — Leaflet precisa [lat,lng]
    coordenadas: feature.geometry.coordinates.map(([lng, lat]) => [lat, lng]),
    distanciaM: segmento.distance, // metros
    duracaoS: segmento.duration, // segundos
  };
}

// ═══════════════════════════════════════════════════════════════════════════════
// FUNÇÃO GLOBAL: desenhar rota no mapa
//
// É definida fora dos componentes para não ter problemas de closure.
// Recebe um objeto "refs" com as referências ao mapa e à camada de rota.
// ═══════════════════════════════════════════════════════════════════════════════
async function desenharRota(refs, origem, destino) {
  const { mapRef, camadaRotaRef, leafletRef } = refs;
  const L = leafletRef.current;
  const mapa = mapRef.current;
  if (!L || !mapa) return;

  // Limpa rota anterior
  if (camadaRotaRef.current) {
    camadaRotaRef.current.remove();
    camadaRotaRef.current = null;
  }

  try {
    // Tenta obter rota real por estradas
    const { coordenadas } = await obterRota(
      origem.lng,
      origem.lat,
      destino.lng,
      destino.lat,
    );
    if (!mapRef.current) return; // componente pode ter desmontado

    const grupo = L.layerGroup();
    L.polyline(coordenadas, {
      color: "#1a6eff",
      weight: 10,
      opacity: 0.13,
    }).addTo(grupo); // sombra
    L.polyline(coordenadas, {
      color: "#3d8bff",
      weight: 4,
      opacity: 0.95,
    }).addTo(grupo); // linha principal
    L.polyline(coordenadas, {
      color: "#00d4ff",
      weight: 2,
      opacity: 0.7,
      dashArray: "10 8",
    }).addTo(grupo); // brilho
    grupo.addTo(mapa);
    camadaRotaRef.current = grupo;
    mapa.fitBounds(L.polyline(coordenadas).getBounds(), { padding: [60, 60] });
  } catch {
    // Fallback: linha reta se a API falhar
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
//
// Lógica de clique:
//   1º clique → define PARTIDA
//   2º clique → define DESTINO + desenha rota
//   Cliques seguintes são ignorados até "Recomeçar"
// ═══════════════════════════════════════════════════════════════════════════════
function MapaInterativo({ apiRef, aoDefinirPartida, aoDefinirDestino }) {
  const divRef = useRef(null); // div onde o mapa é renderizado
  const mapRef = useRef(null); // instância do mapa Leaflet
  const leafletRef = useRef(null); // instância da biblioteca L
  const marcadorPartida = useRef(null);
  const marcadorDestino = useRef(null);
  const marcadorPosicao = useRef(null); // ponto azul pulsante (GPS do utilizador)
  const camadaRotaRef = useRef(null);
  const estadoRef = useRef("partida"); // "partida" | "destino" | "concluido"

  // Bag de refs passada à função desenharRota
  const refs = { mapRef, camadaRotaRef, leafletRef };

  // ── Expõe métodos ao componente pai (Dashboard) via apiRef ──────────────────
  useEffect(() => {
    if (!apiRef) return;
    apiRef.current = {
      // Limpa tudo e volta ao estado inicial
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

      // Coloca o marcador de partida na posição GPS do utilizador
      // (chamado pelo botão "Usar a minha localização atual")
      async colocarPartidaNaLocalizacao(lat, lng) {
        const L = leafletRef.current;
        const mapa = mapRef.current;
        if (!L || !mapa) return;

        // Remove marcador de partida anterior, se existir
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
          draggable: true, // o utilizador pode arrastar para ajustar
        }).addTo(mapa);

        // Ao arrastar, atualiza a morada
        mk.on("dragend", async () => {
          const pos = mk.getLatLng();
          const morada = await coordenadasParaMorada(pos.lat, pos.lng);
          aoDefinirPartida([pos.lat, pos.lng], morada);
          if (marcadorDestino.current)
            desenharRota(refs, pos, marcadorDestino.current.getLatLng());
        });

        marcadorPartida.current = mk;
        estadoRef.current = "destino"; // próximo clique será o destino
        mapa.setView([lat, lng], 15);
      },
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Inicialização do mapa ───────────────────────────────────────────────────
  useEffect(() => {
    let ativo = true; // controla se o componente ainda está montado

    async function iniciar() {
      if (!divRef.current || mapRef.current) return;

      const L = await carregarLeaflet();
      if (!ativo || !divRef.current) return;

      leafletRef.current = L;

      // Cria o mapa centrado em Lisboa
      const mapa = L.map(divRef.current, {
        zoomControl: false,
        attributionControl: false,
      }).setView([38.7223, -9.1393], 14);

      // Tiles escuros (CartoCDN Dark)
      L.tileLayer(
        "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
        { maxZoom: 19 },
      ).addTo(mapa);
      L.control.zoom({ position: "bottomright" }).addTo(mapa);
      mapRef.current = mapa;

      // Geolocalização: mostra ponto azul pulsante SEM definir partida
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          ({ coords: { latitude: lat, longitude: lng } }) => {
            if (!mapRef.current) return;
            mapRef.current.setView([lat, lng], 15);

            // Marcador especial: ponto azul com anel pulsante
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

            // NÃO muda estadoRef — utilizador tem de clicar explicitamente
          },
          () => {}, // ignora silenciosamente se o utilizador recusar permissão
        );
      }

      // ── Gestor de cliques no mapa ──────────────────────────────────────────
      mapa.on("click", async (evento) => {
        const { lat, lng } = evento.latlng;

        if (estadoRef.current === "partida") {
          // Primeiro clique → PARTIDA
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
          estadoRef.current = "destino"; // próximo clique será destino
        } else if (estadoRef.current === "destino") {
          // Segundo clique → DESTINO + traça rota
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

          // Desenha a rota entre partida e destino
          if (marcadorPartida.current) {
            desenharRota(
              refs,
              marcadorPartida.current.getLatLng(),
              evento.latlng,
            );
          }
        }
        // Estado "concluido": cliques ignorados até reiniciar
      });
    }

    iniciar();

    // Limpeza ao desmontar o componente
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
// COMPONENTE PRINCIPAL: Dashboard do passageiro
// ═══════════════════════════════════════════════════════════════════════════════
export default function Dashboard() {
  injetarEstilos();

  // Referência à API do mapa (para chamar reiniciar/colocarPartida externamente)
  const apiMapa = useRef(null);

  // Estado da viagem
  const [partida, setPartida] = useState(null); // [lat, lng]
  const [moradaPartida, setMoradaPartida] = useState("");
  const [destino, setDestino] = useState(null); // [lat, lng]
  const [moradaDestino, setMoradaDestino] = useState("");
  const [aLocalizarGPS, setALocalizarGPS] = useState(false);

  // Estado da rota calculada
  const [dadosRota, setDadosRota] = useState(null); // { distanciaM, duracaoS }
  const [aCalcular, setACalcular] = useState(false);

  // Sempre que ambos os pontos estão definidos, calcula a rota
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
        // Fallback: fórmula Haversine (distância em linha reta)
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

  // Formata metros em "X km" ou "X m"
  const fmtDist = (m) =>
    m < 1000 ? `${Math.round(m)} m` : `${(m / 1000).toFixed(1)} km`;

  // Formata segundos em "X min" ou "Xh Ym"
  const fmtTempo = (s) => {
    const m = Math.round(s / 60);
    return m < 60 ? `${m} min` : `${Math.floor(m / 60)}h ${m % 60}m`;
  };

  // Texto e cor da dica no topo do mapa
  const semPartida = !moradaPartida;
  const semDestino = !moradaDestino;
  const textoDica = semPartida
    ? "1º clique = Partida  ·  2º clique = Destino"
    : semDestino
      ? "Clique para definir o destino"
      : "Arraste os marcadores para ajustar";
  const corDica = semPartida ? "#00e887" : semDestino ? "#3d8bff" : "#c64dff";

  // Limpa tudo e volta ao estado inicial
  function reiniciar() {
    setPartida(null);
    setMoradaPartida("");
    setDestino(null);
    setMoradaDestino("");
    setDadosRota(null);
    apiMapa.current?.reiniciar();
  }

  // Usa GPS do dispositivo como ponto de partida
  async function usarLocalizacaoAtual() {
    setALocalizarGPS(true);
    navigator.geolocation?.getCurrentPosition(
      async ({ coords: { latitude: lat, longitude: lng } }) => {
        if (moradaPartida) reiniciar(); // limpa estado anterior
        const morada = await coordenadasParaMorada(lat, lng);
        await apiMapa.current?.colocarPartidaNaLocalizacao(lat, lng);
        setPartida([lat, lng]);
        setMoradaPartida(morada);
        setALocalizarGPS(false);
      },
      () => setALocalizarGPS(false), // utilizador recusou permissão
    );
  }

  // Dados para as secções abaixo do hero
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
    <div style={{ minHeight: "100vh", background: "var(--fundo)" }}>
      {/* Decoração: grelha + manchas de luz coloridas */}
      <div className="fundo-grelha" />
      <div
        style={{
          position: "fixed",
          inset: 0,
          pointerEvents: "none",
          zIndex: 0,
        }}
      >
        <div
          style={{
            position: "absolute",
            top: "-20%",
            left: "20%",
            width: 700,
            height: 700,
            background: "rgba(26,110,255,0.12)",
            borderRadius: "50%",
            filter: "blur(160px)",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: "-15%",
            right: "-5%",
            width: 540,
            height: 540,
            background: "rgba(198,77,255,0.07)",
            borderRadius: "50%",
            filter: "blur(140px)",
          }}
        />
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "-8%",
            width: 380,
            height: 380,
            background: "rgba(0,212,255,0.06)",
            borderRadius: "50%",
            filter: "blur(120px)",
          }}
        />
      </div>

      {/* Cabeçalho reutilizável */}
      <Header isDashboard />

      {/* ════════════════════ HERO ════════════════════ */}
      <section className="hero">
        {/* ── COLUNA ESQUERDA: formulário de reserva ── */}
        <div className="painel-esquerdo">
          {/* Título */}
          <h1 className="titulo animar-1">
            Chegue a qualquer
            <br />
            <span className="titulo-gradiente">lado em minutos.</span>
          </h1>

          {/* Descrição curta */}
          <p className="descricao animar-2">
            Clique no mapa para marcar a partida e o destino. A rota é calculada
            por estradas reais em tempo real.
          </p>

          {/* Card de reserva */}
          <div className="card-reserva animar-2">
            {/* Botão GPS */}
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

            {/* Campo Partida */}
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
                  onClick={() => {
                    setPartida(null);
                    setMoradaPartida("");
                    setDadosRota(null);
                  }}
                >
                  ✕
                </button>
              )}
            </div>

            {/* Campo Destino */}
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
                  onClick={() => {
                    setDestino(null);
                    setMoradaDestino("");
                    setDadosRota(null);
                  }}
                >
                  ✕
                </button>
              )}
            </div>

            {/* Faixa de resultado: distância + tempo */}
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

            {/* Botão principal */}
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

          {/* Estatísticas rápidas */}
          <div className="estatisticas animar-3">
            <div>
              <div className="stat-numero">
                3<span>min</span>
              </div>
              <div className="stat-label">Tempo médio</div>
            </div>
            <div className="stat-divider" />
            <div>
              <div className="stat-numero">
                50<span>k+</span>
              </div>
              <div className="stat-label">Passageiros</div>
            </div>
            <div className="stat-divider" />
            <div>
              <div className="stat-numero">
                4.9<span>★</span>
              </div>
              <div className="stat-label">Avaliação</div>
            </div>
          </div>
        </div>

        {/* ── COLUNA DIREITA: mapa interativo ── */}
        <div className="painel-mapa animar-dir">
          <div className="caixa-mapa">
            {/* Mapa Leaflet */}
            <MapaInterativo
              apiRef={apiMapa}
              aoDefinirPartida={(coords, morada) => {
                setPartida(coords);
                setMoradaPartida(morada);
              }}
              aoDefinirDestino={(coords, morada) => {
                setDestino(coords);
                setMoradaDestino(morada);
              }}
            />

            {/* Dica no topo + botão Recomeçar */}
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

            {/* Indicador de cálculo / card de resultado */}
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

            {/* Barra informativa na base do mapa */}
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
              <div className="barra-dir">
                {dadosRota ? (
                  <>
                    <div className="barra-valor">
                      {fmtTempo(dadosRota.duracaoS)}
                    </div>
                    <div className="barra-valor2">tempo estimado</div>
                  </>
                ) : (
                  <>
                    <div className="barra-valor">~2 min</div>
                    <div className="barra-valor2">ETA médio</div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ════════ FUNCIONALIDADES ════════ */}
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

      {/* ════════ COMO FUNCIONA ════════ */}
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

      {/* ════════ CTA ════════ */}
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
