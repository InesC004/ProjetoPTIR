/* eslint-disable react/prop-types */
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import image from "../Pictures/carroRegistro.jpg";
import api from "../Api";

export default function LoginModal({ isOpen, onClose }) {
  const [formData, setFormData] = useState({ nif: "", access_password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  if (!isOpen) return null;

  function handleChange(e) {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const data = await api.auth.login(formData);

      localStorage.setItem("token", data.token);
      localStorage.setItem("role", data.role);

      if (data.role === "cliente") {
        localStorage.setItem("cliente", JSON.stringify(data.cliente || {}));
        navigate("/dashboard");
      } else if (data.role === "motorista") {
        localStorage.setItem("motorista", JSON.stringify(data.motorista || {}));
        navigate("/motorista/PaginaMotorista");
      } else if (data.role === "gestor") {
        localStorage.setItem("gestor", JSON.stringify(data.gestor || {}));
        navigate("/gestor/PaginaGestores");
      }

      onClose();
    } catch (err) {
      setError(err.message || "Não foi possível conectar ao servidor.");
    } finally {
      setLoading(false);
    }
  }
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
                Bem-vindo <span>TakeCab</span>
              </p>
              <p className="modal-imagem-sub">
                Entre para continuar a sua jornada.
              </p>
            </div>
          </div>

          {/* Formulário */}
          <div className="modal-form-area">
            <button className="modal-fechar" onClick={onClose}>
              ✕
            </button>

            <h2 className="modal-titulo">Entrar</h2>
            <p className="modal-sub">Entrar na sua conta</p>

            {error && <div className="modal-erro">{error}</div>}

            <form className="modal-form" onSubmit={handleSubmit}>
              <div className="modal-campo">
                <label className="modal-label">NIF</label>
                <input
                  className="modal-input"
                  type="text"
                  name="nif"
                  value={formData.nif}
                  onChange={handleChange}
                  placeholder="Coloque o seu NIF"
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
                  placeholder="Coloque a sua palavra-passe"
                  required
                />
              </div>

              <button
                type="submit"
                className="modal-btn-principal"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="spinner-inline" />A entrar...
                  </>
                ) : (
                  "Entrar"
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}
