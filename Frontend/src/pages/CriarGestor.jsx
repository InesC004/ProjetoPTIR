import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../Api";

const FORM_INICIAL = {
  nome: "",
  nif: "",
  email: "",
  password: "",
  confirmar_password: "",
};

function validarNIF(nif) {
  return /^\d{9}$/.test(nif) && parseInt(nif, 10) > 0;
}
function validarEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}
function validarPassword(pw) {
  if (pw.length < 6) return "Mínimo 6 caracteres";
  if (!/[a-zA-Z]/.test(pw)) return "Deve conter pelo menos uma letra";
  if (!/\d/.test(pw)) return "Deve conter pelo menos um dígito";
  return null;
}

export default function CriarGestor() {
  const navigate = useNavigate();
  const [form, setForm] = useState(FORM_INICIAL);
  const [erros, setErros] = useState({});
  const [loading, setLoading] = useState(false);
  const [alerta, setAlerta] = useState(null); // { tipo: "sucesso"|"erro", msg }

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (erros[name]) setErros((prev) => ({ ...prev, [name]: null }));
    if (alerta) setAlerta(null);
  }

  function validar() {
    const novosErros = {};
    if (!form.nome.trim()) novosErros.nome = "Nome obrigatório";
    if (!form.nif.trim()) novosErros.nif = "NIF obrigatório";
    else if (!validarNIF(form.nif)) novosErros.nif = "NIF inválido (9 dígitos)";
    if (!form.email.trim()) novosErros.email = "Email obrigatório";
    else if (!validarEmail(form.email)) novosErros.email = "Email inválido";
    const pwErro = validarPassword(form.password);
    if (!form.password) novosErros.password = "Password obrigatória";
    else if (pwErro) novosErros.password = pwErro;
    if (!form.confirmar_password)
      novosErros.confirmar_password = "Confirme a password";
    else if (form.password !== form.confirmar_password)
      novosErros.confirmar_password = "As passwords não coincidem";
    return novosErros;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const errosValidacao = validar();
    if (Object.keys(errosValidacao).length > 0) {
      setErros(errosValidacao);
      return;
    }

    setLoading(true);
    setAlerta(null);
    try {
      await api.gestores.criar({
        nome: form.nome.trim(),
        nif: form.nif.trim(),
        email: form.email.trim().toLowerCase(),
        password: form.password,
      });
      setAlerta({
        tipo: "sucesso",
        msg: `Gestor "${form.nome}" criado com sucesso!`,
      });
      setForm(FORM_INICIAL);
      setErros({});
    } catch (err) {
      setAlerta({ tipo: "erro", msg: err.message || "Erro ao criar gestor." });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="criar-gestor-pagina">
      <div className="criar-gestor-card">
        <button className="criar-gestor-voltar" onClick={() => navigate(-1)}>
          ← Voltar
        </button>

        <div className="criar-gestor-icone">👔</div>
        <h1 className="criar-gestor-titulo">Criar Gestor</h1>
        <p className="criar-gestor-sub">
          Cria uma nova conta de gestor. Os gestores têm acesso à administração
          de motoristas, táxis e preços.
        </p>

        {alerta && (
          <div
            className={`criar-gestor-alerta ${alerta.tipo}`}
            style={{ marginBottom: 20 }}
          >
            {alerta.tipo === "sucesso" ? "✓" : "⚠"} {alerta.msg}
          </div>
        )}

        <form className="criar-gestor-form" onSubmit={handleSubmit}>
          {/* Nome */}
          <div className="criar-gestor-campo">
            <label className="criar-gestor-label">Nome completo</label>
            <input
              className={`criar-gestor-input${erros.nome ? " erro" : ""}`}
              name="nome"
              value={form.nome}
              onChange={handleChange}
              placeholder="Ex: Ana Rodrigues"
              disabled={loading}
            />
            {erros.nome && (
              <span className="criar-gestor-erro-campo">{erros.nome}</span>
            )}
          </div>

          {/* NIF + Email em linha */}
          <div className="criar-gestor-linha">
            <div className="criar-gestor-campo">
              <label className="criar-gestor-label">NIF</label>
              <input
                className={`criar-gestor-input${erros.nif ? " erro" : ""}`}
                name="nif"
                value={form.nif}
                onChange={handleChange}
                placeholder="9 dígitos"
                maxLength={9}
                disabled={loading}
              />
              {erros.nif && (
                <span className="criar-gestor-erro-campo">{erros.nif}</span>
              )}
            </div>
            <div className="criar-gestor-campo">
              <label className="criar-gestor-label">Email</label>
              <input
                className={`criar-gestor-input${erros.email ? " erro" : ""}`}
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="gestor@takecab.pt"
                disabled={loading}
              />
              {erros.email && (
                <span className="criar-gestor-erro-campo">{erros.email}</span>
              )}
            </div>
          </div>

          {/* Password */}
          <div className="criar-gestor-campo">
            <label className="criar-gestor-label">Password</label>
            <input
              className={`criar-gestor-input${erros.password ? " erro" : ""}`}
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              placeholder="Mínimo 6 caracteres, letras e dígitos"
              disabled={loading}
            />
            {erros.password && (
              <span className="criar-gestor-erro-campo">{erros.password}</span>
            )}
          </div>

          {/* Confirmar Password */}
          <div className="criar-gestor-campo">
            <label className="criar-gestor-label">Confirmar Password</label>
            <input
              className={`criar-gestor-input${erros.confirmar_password ? " erro" : ""}`}
              type="password"
              name="confirmar_password"
              value={form.confirmar_password}
              onChange={handleChange}
              placeholder="Repita a password"
              disabled={loading}
            />
            {erros.confirmar_password && (
              <span className="criar-gestor-erro-campo">
                {erros.confirmar_password}
              </span>
            )}
          </div>

          <button type="submit" className="criar-gestor-btn" disabled={loading}>
            {loading ? (
              <>
                <span className="spinner-inline" />A criar gestor...
              </>
            ) : (
              "Criar Gestor"
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
