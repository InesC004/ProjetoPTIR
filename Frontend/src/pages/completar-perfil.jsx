import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth0 } from "@auth0/auth0-react";

const ESTILOS = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500&display=swap');

  :root {
    --fundo:      #050d1a;
    --azul:       #1a6eff;
    --azul-claro: #3d8bff;
    --ciano:      #00d4ff;
    --verde:      #00e887;
    --branco:     #f0f6ff;
    --cinza:      #6b8baa;
    --card:       rgba(10,30,60,0.6);
    --borda:      rgba(26,110,255,0.18);
  }

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  html { scroll-behavior: smooth; }
  body { font-family: 'DM Sans', sans-serif; background: var(--fundo); color: var(--branco); overflow-x: hidden; }

  .cp-fundo-grelha {
    position: fixed; inset: 0; z-index: 0; pointer-events: none;
    background-image:
      linear-gradient(rgba(26,110,255,0.04) 1px, transparent 1px),
      linear-gradient(90deg, rgba(26,110,255,0.04) 1px, transparent 1px);
    background-size: 60px 60px;
    mask-image: radial-gradient(ellipse 100% 80% at 50% 50%, black 40%, transparent 100%);
  }

  .cp-wrap {
    position: relative; z-index: 1;
    min-height: 100vh;
    display: flex; align-items: center; justify-content: center;
    padding: 48px 24px;
  }

  .cp-card {
    width: 100%; max-width: 560px;
    background: var(--card);
    backdrop-filter: blur(24px);
    border: 1px solid var(--borda);
    border-radius: 28px;
    padding: 44px 40px;
    box-shadow: 0 32px 80px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.05);
    animation: cpSubir 0.6s ease both;
  }
  @keyframes cpSubir { from{opacity:0;transform:translateY(24px)} to{opacity:1;transform:translateY(0)} }

  .cp-badge {
    display: inline-flex; align-items: center; gap: 8px;
    background: rgba(0,232,135,0.08);
    border: 1px solid rgba(0,232,135,0.22);
    border-radius: 100px; padding: 5px 14px 5px 8px;
    font-size: 0.75rem; color: var(--verde);
    margin-bottom: 20px;
  }
  .cp-badge-ponto {
    width: 7px; height: 7px; border-radius: 50%;
    background: var(--verde); box-shadow: 0 0 8px var(--verde);
    animation: cpPiscar 2s ease infinite;
  }
  @keyframes cpPiscar { 0%,100%{opacity:1} 50%{opacity:.3} }

  .cp-titulo {
    font-family: 'Syne', sans-serif;
    font-size: 2rem; font-weight: 800;
    letter-spacing: -0.03em; line-height: 1.1;
    margin-bottom: 8px;
  }
  .cp-titulo span {
    background: linear-gradient(90deg, var(--azul-claro), var(--ciano));
    -webkit-background-clip: text; -webkit-text-fill-color: transparent;
    background-clip: text;
  }
  .cp-sub {
    color: var(--cinza); font-size: 0.9rem;
    line-height: 1.55; margin-bottom: 32px;
  }

  /* Steps */
  .cp-steps {
    display: flex; gap: 6px; margin-bottom: 32px;
  }
  .cp-step {
    flex: 1; height: 3px; border-radius: 2px;
    background: rgba(26,110,255,0.15);
    transition: background 0.3s;
  }
  .cp-step.ativo { background: var(--azul); box-shadow: 0 0 8px rgba(26,110,255,0.5); }
  .cp-step.feito { background: var(--verde); }

  /* Campos */
  .cp-grupo { margin-bottom: 20px; }
  .cp-rotulo {
    display: block;
    font-size: 0.72rem; font-weight: 700;
    letter-spacing: 0.08em; text-transform: uppercase;
    color: var(--cinza); margin-bottom: 8px; padding-left: 2px;
  }
  .cp-input, .cp-select {
    width: 100%;
    background: rgba(255,255,255,0.04);
    border: 1px solid rgba(255,255,255,0.08);
    border-radius: 13px; padding: 14px 16px;
    color: var(--branco);
    font-family: 'DM Sans', sans-serif; font-size: 0.94rem;
    outline: none; transition: all 0.2s;
    appearance: none;
  }
  .cp-input::placeholder { color: rgba(107,139,170,0.5); }
  .cp-input:focus, .cp-select:focus {
    border-color: rgba(26,110,255,0.45);
    background: rgba(26,110,255,0.06);
    box-shadow: 0 0 0 3px rgba(26,110,255,0.1);
  }
  .cp-input.erro { border-color: rgba(255,80,80,0.5); background: rgba(255,50,50,0.05); }
  .cp-select { cursor: pointer; }
  .cp-select option { background: #0a1628; color: var(--branco); }

  .cp-row { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }

  .cp-erro-msg {
    color: #ff6b6b; font-size: 0.75rem;
    margin-top: 5px; padding-left: 2px;
  }

  /* Botões de navegação */
  .cp-botoes {
    display: flex; gap: 12px; margin-top: 28px;
  }
  .cp-btn-voltar {
    flex: 1; padding: 15px;
    background: rgba(255,255,255,0.05);
    border: 1px solid rgba(255,255,255,0.1);
    border-radius: 13px; color: var(--cinza);
    font-family: 'DM Sans', sans-serif; font-size: 0.94rem;
    cursor: pointer; transition: all 0.2s;
  }
  .cp-btn-voltar:hover { background: rgba(255,255,255,0.1); color: var(--branco); }

  .cp-btn-avancar {
    flex: 2; padding: 15px;
    background: linear-gradient(135deg, var(--azul) 0%, #0052cc 50%, var(--azul) 100%);
    background-size: 200% 100%;
    border: none; border-radius: 13px; color: #fff;
    font-family: 'Syne', sans-serif; font-size: 0.98rem; font-weight: 700;
    cursor: pointer; transition: all 0.3s;
  }
  .cp-btn-avancar:hover:not(:disabled) {
    background-position: 100% 0;
    box-shadow: 0 8px 28px rgba(26,110,255,0.4);
    transform: translateY(-1px);
  }
  .cp-btn-avancar:disabled { opacity: 0.4; cursor: not-allowed; transform: none; }

  /* Sucesso */
  .cp-sucesso {
    text-align: center; padding: 16px 0;
    animation: cpSubir 0.5s ease both;
  }
  .cp-sucesso-icone {
    width: 72px; height: 72px; border-radius: 50%;
    background: rgba(0,232,135,0.1);
    border: 2px solid rgba(0,232,135,0.3);
    display: flex; align-items: center; justify-content: center;
    font-size: 2rem; margin: 0 auto 20px;
    box-shadow: 0 0 32px rgba(0,232,135,0.2);
  }
  .cp-sucesso-titulo {
    font-family: 'Syne', sans-serif;
    font-size: 1.6rem; font-weight: 800;
    margin-bottom: 10px;
  }
  .cp-sucesso-desc { color: var(--cinza); font-size: 0.9rem; line-height: 1.6; }

  @media (max-width: 480px) {
    .cp-card { padding: 28px 20px; }
    .cp-row { grid-template-columns: 1fr; }
    .cp-titulo { font-size: 1.6rem; }
  }
`;

let estilosInjetados = false;
function injetarEstilos() {
  if (estilosInjetados || typeof document === "undefined") return;
  const el = document.createElement("style");
  el.textContent = ESTILOS;
  document.head.appendChild(el);
  estilosInjetados = true;
}

const PASSOS = [{ label: "Dados pessoais" }, { label: "Morada" }];

export default function CompletarPerfil() {
  injetarEstilos();
  const navigate = useNavigate();
  const { user } = useAuth0();

  const [passo, setPasso] = useState(0);
  const [aEnviar, setAEnviar] = useState(false);
  const [concluido, setConcluido] = useState(false);
  const [erros, setErros] = useState({});

  const [form, setForm] = useState({
    nif: "",
    genero: "",
    dataNascimento: "",
    morada: "",
    codigoPostal: "",
  });

  function atualizar(campo, valor) {
    setForm((f) => ({ ...f, [campo]: valor }));
    setErros((e) => ({ ...e, [campo]: "" }));
  }

  function validarPasso0() {
    const novosErros = {};
    if (!form.nif || form.nif.length !== 9 || isNaN(form.nif))
      novosErros.nif = "NIF deve ter 9 dígitos";
    if (!form.genero) novosErros.genero = "Seleciona o género";
    if (!form.dataNascimento)
      novosErros.dataNascimento = "Data de nascimento obrigatória";
    setErros(novosErros);
    return Object.keys(novosErros).length === 0;
  }

  function validarPasso1() {
    const novosErros = {};
    if (!form.morada || form.morada.length < 5)
      novosErros.morada = "Morada inválida";
    if (!form.codigoPostal || !/^\d{4}-\d{3}$/.test(form.codigoPostal))
      novosErros.codigoPostal = "Formato: 0000-000";
    setErros(novosErros);
    return Object.keys(novosErros).length === 0;
  }

  function avancar() {
    if (passo === 0 && !validarPasso0()) return;
    setPasso((p) => p + 1);
  }

  async function submeter() {
    if (!validarPasso1()) return;
    setAEnviar(true);
    try {
      const resposta = await fetch(
        "http://localhost:8080/api/clientes/completar",
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            auth0Id: user.sub,
            ...form,
          }),
        },
      );

      const dados = await resposta.json();
      console.log("Resposta do servidor:", dados); // 👈 ver o que responde

      if (!resposta.ok) {
        console.error("Erro do servidor:", dados);
        return;
      }

      setConcluido(true);
      setTimeout(() => navigate("/dashboard"), 2200);
    } catch (err) {
      console.error("Erro ao completar perfil:", err);
      alert("Erro ao ligar ao servidor. Verifica se o backend está a correr.");
    } finally {
      setAEnviar(false);
    }
  }

  return (
    <div style={{ minHeight: "100vh", background: "var(--fundo, #050d1a)" }}>
      <div className="cp-fundo-grelha" />

      {/* Manchas de luz */}
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
            top: "-10%",
            left: "30%",
            width: 600,
            height: 600,
            background: "rgba(26,110,255,0.1)",
            borderRadius: "50%",
            filter: "blur(140px)",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: "-10%",
            right: "10%",
            width: 400,
            height: 400,
            background: "rgba(0,212,255,0.07)",
            borderRadius: "50%",
            filter: "blur(120px)",
          }}
        />
      </div>

      <div className="cp-wrap">
        <div className="cp-card">
          {concluido ? (
            <div className="cp-sucesso">
              <div className="cp-sucesso-icone">✓</div>
              <div className="cp-sucesso-titulo">Perfil completo!</div>
              <p className="cp-sucesso-desc">
                Bem-vindo ao TakeCab.
                <br />A redirecionar para o dashboard…
              </p>
            </div>
          ) : (
            <>
              {/* Badge */}
              <div className="cp-badge">
                <div className="cp-badge-ponto" />
                Passo {passo + 1} de {PASSOS.length}
              </div>

              {/* Título */}
              <h1 className="cp-titulo">
                {passo === 0 ? (
                  <>
                    Dados <span>pessoais</span>
                  </>
                ) : (
                  <>
                    A tua <span>morada</span>
                  </>
                )}
              </h1>
              <p className="cp-sub">
                {passo === 0
                  ? "Precisamos de alguns dados para completar o teu perfil."
                  : "Indica onde resides para melhorarmos o serviço na tua zona."}
              </p>

              {/* Barra de progresso */}
              <div className="cp-steps">
                {PASSOS.map((_, i) => (
                  <div
                    key={i}
                    className={`cp-step${i < passo ? " feito" : i === passo ? " ativo" : ""}`}
                  />
                ))}
              </div>

              {/* Passo 0 — Dados pessoais */}
              {passo === 0 && (
                <>
                  <div className="cp-grupo">
                    <label className="cp-rotulo">NIF</label>
                    <input
                      className={`cp-input${erros.nif ? " erro" : ""}`}
                      type="text"
                      placeholder="123456789"
                      maxLength={9}
                      value={form.nif}
                      onChange={(e) => atualizar("nif", e.target.value)}
                    />
                    {erros.nif && (
                      <div className="cp-erro-msg">{erros.nif}</div>
                    )}
                  </div>

                  <div className="cp-row">
                    <div className="cp-grupo">
                      <label className="cp-rotulo">Género</label>
                      <select
                        className={`cp-select${erros.genero ? " erro" : ""}`}
                        value={form.genero}
                        onChange={(e) => atualizar("genero", e.target.value)}
                      >
                        <option value="">Selecionar…</option>
                        <option value="Male">Masculino</option>
                        <option value="Female">Feminino</option>
                        <option value="Outro">Outro</option>
                      </select>
                      {erros.genero && (
                        <div className="cp-erro-msg">{erros.genero}</div>
                      )}
                    </div>

                    <div className="cp-grupo">
                      <label className="cp-rotulo">Data de nascimento</label>
                      <input
                        className={`cp-input${erros.dataNascimento ? " erro" : ""}`}
                        type="date"
                        value={form.dataNascimento}
                        onChange={(e) =>
                          atualizar("dataNascimento", e.target.value)
                        }
                        style={{ colorScheme: "dark" }}
                      />
                      {erros.dataNascimento && (
                        <div className="cp-erro-msg">
                          {erros.dataNascimento}
                        </div>
                      )}
                    </div>
                  </div>
                </>
              )}

              {/* Passo 1 — Morada */}
              {passo === 1 && (
                <>
                  <div className="cp-grupo">
                    <label className="cp-rotulo">Morada</label>
                    <input
                      className={`cp-input${erros.morada ? " erro" : ""}`}
                      type="text"
                      placeholder="Rua Example, Nº 10, 2º Dto"
                      value={form.morada}
                      onChange={(e) => atualizar("morada", e.target.value)}
                    />
                    {erros.morada && (
                      <div className="cp-erro-msg">{erros.morada}</div>
                    )}
                  </div>

                  <div className="cp-grupo">
                    <label className="cp-rotulo">Código Postal</label>
                    <input
                      className={`cp-input${erros.codigoPostal ? " erro" : ""}`}
                      type="text"
                      placeholder="0000-000"
                      maxLength={8}
                      value={form.codigoPostal}
                      onChange={(e) =>
                        atualizar("codigoPostal", e.target.value)
                      }
                    />
                    {erros.codigoPostal && (
                      <div className="cp-erro-msg">{erros.codigoPostal}</div>
                    )}
                  </div>
                </>
              )}

              {/* Botões */}
              <div className="cp-botoes">
                {passo > 0 && (
                  <button
                    className="cp-btn-voltar"
                    onClick={() => setPasso((p) => p - 1)}
                  >
                    ← Voltar
                  </button>
                )}
                <button
                  className="cp-btn-avancar"
                  disabled={aEnviar}
                  onClick={passo < PASSOS.length - 1 ? avancar : submeter}
                >
                  {aEnviar
                    ? "A guardar…"
                    : passo < PASSOS.length - 1
                      ? "Continuar →"
                      : "Concluir ✓"}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
