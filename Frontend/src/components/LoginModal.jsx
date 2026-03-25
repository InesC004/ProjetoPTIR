/* eslint-disable react/prop-types */
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import image from "../pictures/carroREgistro.jpg";

// Endpoints a tentar por ordem — todos usam NIF + access_password
const LOGIN_ENDPOINTS = [
  "http://localhost:8080/api/clientes/login",
  "http://localhost:8080/api/motoristas/login",
  "http://localhost:8080/api/gestores/login",
];

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
      // Tenta cada endpoint até encontrar o utilizador
      for (const endpoint of LOGIN_ENDPOINTS) {
        const res = await fetch(endpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });

        const data = await res.json();

        if (res.ok && data.success) {
          // Login bem sucedido — guardar dados e redirecionar
          localStorage.setItem("token", data.token);
          localStorage.setItem("role", data.role);
          localStorage.setItem("cliente", JSON.stringify(data.cliente || {}));
          onClose();

          if (data.role === "cliente") navigate("/dashboard");
          else if (data.role === "motorista") navigate("/motorista/dashboard");
          else if (data.role === "gestor") navigate("/gestor/dashboard");
          return;
        }

        // Se o erro NÃO é "credenciais inválidas" (ex: erro de servidor), para aqui
        if (res.status >= 500) {
          setError("Erro no servidor. Tente novamente.");
          setLoading(false);
          return;
        }

        // Se é 401 (credenciais inválidas), tenta o próximo endpoint
      }

      // Nenhum endpoint aceitou → NIF ou password errados
      setError("Credenciais inválidas. Verifique o NIF e a palavra-passe.");
    } catch {
      setError("Não foi possível conectar ao servidor.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <div
        onClick={onClose}
        className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm"
      />

      <div className="fixed inset-0 flex items-center justify-center z-[110] p-4">
        <div className="relative bg-[#0a1628] text-white rounded-2xl overflow-hidden w-[900px] max-w-full max-h-[90vh] grid md:grid-cols-2 shadow-2xl border border-white/10">
          <div className="relative hidden md:block">
            <img
              src={image}
              alt="TakeCab"
              className="h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-[#0a1628]/80 to-transparent" />
            <div className="absolute inset-0 flex flex-col justify-end p-8">
              <h2 className="text-2xl font-light mb-2">
                Bem-vindo{" "}
                <span className="font-semibold text-[#60a5fa]">TakeCab</span>
              </h2>
              <p className="text-white/60 text-sm">
                Entre para continuar a sua Jornada.
              </p>
            </div>
          </div>

          <div className="p-8 overflow-y-auto">
            <button
              onClick={onClose}
              className="absolute top-4 right-4 w-9 h-9 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center"
            >
              ✕
            </button>

            <div className="mb-6">
              <h2 className="text-xl font-semibold">Entrar</h2>
              <p className="text-sm text-white/50 mt-1">Entrar na sua conta</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm text-white/70 mb-2">NIF</label>
                <input
                  type="text"
                  name="nif"
                  value={formData.nif}
                  onChange={handleChange}
                  placeholder="Coloque o seu NIF"
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3"
                  required
                />
              </div>

              <div>
                <label className="block text-sm text-white/70 mb-2">
                  Palavra-passe
                </label>
                <input
                  type="password"
                  name="access_password"
                  value={formData.access_password}
                  onChange={handleChange}
                  placeholder="Coloque a sua Palavra-passe"
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3"
                  required
                />
              </div>

              {error && <div className="text-red-400 text-sm">{error}</div>}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-[#1d5eff] to-[#3b82f6] disabled:opacity-60"
              >
                {loading ? "A entrar..." : "Entrar"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}
