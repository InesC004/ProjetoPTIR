import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth0 } from "@auth0/auth0-react";
import api from "../Api";

const PASSOS = [{ label: "Dados pessoais" }, { label: "Morada" }];

export default function CompletarPerfil() {
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
      await api.auth.completarPerfilCliente({
        auth0Id: user.sub,
        ...form,
      });
      setConcluido(true);
      setTimeout(() => navigate("/dashboard"), 2200);
    } catch (err) {
      console.error("Erro ao completar perfil:", err);
      alert(
        err.message ||
          "Erro ao ligar ao servidor. Verifica se o backend está a correr.",
      );
    } finally {
      setAEnviar(false);
    }
  }

  return (
    <div style={{ minHeight: "100vh", background: "var(--fundo, #050d1a)" }}>
      <div className="cp-grelha-fundo" />

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

      <div className="cp-pagina">
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
              <p className="cp-subtitulo">
                {passo === 0
                  ? "Precisamos de alguns dados para completar o teu perfil."
                  : "Indica onde resides para melhorarmos o serviço na tua zona."}
              </p>

              {/* Barra de progresso */}
              <div className="cp-passos">
                {PASSOS.map((_, i) => (
                  <div
                    key={i}
                    className={`cp-passo${i < passo ? " feito" : i === passo ? " ativo" : ""}`}
                  />
                ))}
              </div>

              {/* Passo 0 — Dados pessoais */}
              {passo === 0 && (
                <>
                  <div className="cp-grupo">
                    <label className="cp-label">NIF</label>
                    <input
                      className={`cp-input${erros.nif ? " erro" : ""}`}
                      type="text"
                      placeholder="123456789"
                      maxLength={9}
                      value={form.nif}
                      onChange={(e) => atualizar("nif", e.target.value)}
                    />
                    {erros.nif && <div className="cp-erro">{erros.nif}</div>}
                  </div>

                  <div className="cp-linha">
                    <div className="cp-grupo">
                      <label className="cp-label">Género</label>
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
                        <div className="cp-erro">{erros.genero}</div>
                      )}
                    </div>

                    <div className="cp-grupo">
                      <label className="cp-label">Data de nascimento</label>
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
                        <div className="cp-erro">{erros.dataNascimento}</div>
                      )}
                    </div>
                  </div>
                </>
              )}

              {/* Passo 1 — Morada */}
              {passo === 1 && (
                <>
                  <div className="cp-grupo">
                    <label className="cp-label">Morada</label>
                    <input
                      className={`cp-input${erros.morada ? " erro" : ""}`}
                      type="text"
                      placeholder="Rua Example, Nº 10, 2º Dto"
                      value={form.morada}
                      onChange={(e) => atualizar("morada", e.target.value)}
                    />
                    {erros.morada && (
                      <div className="cp-erro">{erros.morada}</div>
                    )}
                  </div>

                  <div className="cp-grupo">
                    <label className="cp-label">Código Postal</label>
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
                      <div className="cp-erro">{erros.codigoPostal}</div>
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
