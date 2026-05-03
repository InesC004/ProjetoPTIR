/* eslint-disable react/prop-types */
import { useState } from "react";
import image from "../pictures/carroREgistro.jpg";
import api from "../Api";

export default function RegisterModal({ isOpen, onClose }) {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    nif: "",
    email: "",
    gender: "",
    birth_day: "",
    birth_month: "",
    birth_year: "",
    address: "",
    postal_code: "",
    access_password: "",
  });

  if (!isOpen) return null;

  const handleChange = (e) =>
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await api.auth.registarCliente(formData);
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        setStep(1);
        setFormData({
          name: "",
          nif: "",
          email: "",
          gender: "",
          birth_day: "",
          birth_month: "",
          birth_year: "",
          address: "",
          postal_code: "",
          access_password: "",
        });
        onClose();
      }, 2000);
    } catch (err) {
      setError(err.message || "Não foi possível conectar ao servidor.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="modal-fundo" onClick={onClose} />
      <div className="modal-centro">
        <div className="modal-caixa">
          {/* Imagem lateral */}
          <div className="modal-imagem">
            <img src={image} alt="TakeCab" />
            <div className="modal-imagem-overlay" />
            <div className="modal-imagem-texto">
              <p className="modal-imagem-titulo">
                Join <span>TakeCab</span>
              </p>
              <p className="modal-imagem-sub">Rápido, Seguro e Confortável</p>
            </div>
          </div>

          {/* Formulário */}
          <div className="modal-form-area">
            <button className="modal-fechar" onClick={onClose}>
              <svg
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>

            <h2 className="modal-titulo">Criar Conta</h2>
            <p className="modal-sub">Passo {step} de 2</p>
            <div className="modal-progresso-wrap">
              <div
                className="modal-progresso-barra"
                style={{ width: step === 1 ? "50%" : "100%" }}
              />
            </div>

            {success && (
              <div className="modal-sucesso">
                ✓ Conta criada com sucesso! Bem-vindo ao TakeCab!
              </div>
            )}
            {error && <div className="modal-erro">{error}</div>}

            <form className="modal-form" onSubmit={handleSubmit}>
              {step === 1 ? (
                <>
                  <div className="modal-campo">
                    <label className="modal-label">Nome Completo</label>
                    <input
                      className="modal-input"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="O seu nome completo"
                      required
                    />
                  </div>

                  <div className="modal-campo">
                    <label className="modal-label">Email</label>
                    <input
                      className="modal-input"
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="O seu email"
                      required
                    />
                  </div>

                  <div className="modal-campo-2">
                    <div className="modal-campo">
                      <label className="modal-label">NIF</label>
                      <input
                        className="modal-input"
                        name="nif"
                        value={formData.nif}
                        onChange={handleChange}
                        placeholder="9 dígitos"
                        required
                      />
                    </div>
                    <div className="modal-campo">
                      <label className="modal-label">Género</label>
                      <select
                        className="modal-select"
                        name="gender"
                        value={formData.gender}
                        onChange={handleChange}
                        required
                      >
                        <option value="">Selecionar</option>
                        <option value="Male">Masculino</option>
                        <option value="Female">Feminino</option>
                      </select>
                    </div>
                  </div>

                  <div className="modal-campo">
                    <label className="modal-label">Data de Nascimento</label>
                    <div className="modal-campo-3">
                      <input
                        className="modal-input"
                        type="number"
                        name="birth_day"
                        value={formData.birth_day}
                        onChange={handleChange}
                        placeholder="Dia"
                        min="1"
                        max="31"
                        required
                      />
                      <input
                        className="modal-input"
                        type="number"
                        name="birth_month"
                        value={formData.birth_month}
                        onChange={handleChange}
                        placeholder="Mês"
                        min="1"
                        max="12"
                        required
                      />
                      <input
                        className="modal-input"
                        type="number"
                        name="birth_year"
                        value={formData.birth_year}
                        onChange={handleChange}
                        placeholder="Ano"
                        min="1940"
                        max="2008"
                        required
                      />
                    </div>
                  </div>

                  <button
                    type="button"
                    className="modal-btn-principal"
                    onClick={() => setStep(2)}
                  >
                    Continuar
                    <svg
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </button>
                </>
              ) : (
                <>
                  <div className="modal-campo">
                    <label className="modal-label">Morada</label>
                    <input
                      className="modal-input"
                      name="address"
                      value={formData.address}
                      onChange={handleChange}
                      placeholder="A sua morada"
                      required
                    />
                  </div>

                  <div className="modal-campo">
                    <label className="modal-label">Código Postal</label>
                    <input
                      className="modal-input"
                      name="postal_code"
                      value={formData.postal_code}
                      onChange={handleChange}
                      placeholder="0000-000"
                      required
                    />
                  </div>

                  <div className="modal-campo">
                    <label className="modal-label">Palavra-passe</label>
                    <input
                      className="modal-input"
                      type="password"
                      name="access_password"
                      value={formData.access_password}
                      onChange={handleChange}
                      placeholder="Crie uma palavra-passe segura"
                      required
                    />
                  </div>

                  <div className="modal-btn-linha">
                    <button
                      type="button"
                      className="modal-btn-secundario"
                      onClick={() => setStep(1)}
                    >
                      <svg
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M15 19l-7-7 7-7"
                        />
                      </svg>
                      Voltar
                    </button>
                    <button
                      type="submit"
                      className="modal-btn-principal"
                      disabled={loading}
                    >
                      {loading ? (
                        <>
                          <span className="spinner-inline" />A registar...
                        </>
                      ) : (
                        <>
                          Registar{" "}
                          <svg
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth="2"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M5 13l4 4L19 7"
                            />
                          </svg>
                        </>
                      )}
                    </button>
                  </div>
                </>
              )}
            </form>

            <p className="modal-link">
              Já tem uma conta? <a href="#">Entrar</a>
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
