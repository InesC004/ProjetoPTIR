/* eslint-disable react/prop-types */
import { useAuth0 } from "@auth0/auth0-react";
import image from "../pictures/carroREgistro.jpg";
import { useNavigate } from "react-router-dom";

export default function LoginModal({ isOpen, onClose }) {
  const { loginWithPopup, isLoading, isAuthenticated } = useAuth0();
  const navigate = useNavigate();

  if (!isOpen) return null;

  // Se já está logado, vai direto para o dashboard
  if (isAuthenticated) {
    navigate("/dashboard");
    return null;
  }
  async function handleLogin() {
    try {
      await loginWithPopup({ prompt: "login" }); // 👈 força o popup sempre
      onClose();
      navigate("/dashboard");
    } catch (err) {
      console.error("Erro ao fazer login:", err);
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
                Welcome back to{" "}
                <span className="font-semibold text-[#60a5fa]">TakeCab</span>
              </h2>
              <p className="text-white/60 text-sm">
                Log in to continue your journey.
              </p>
            </div>
          </div>

          <div className="p-8 flex flex-col justify-center">
            <button
              onClick={onClose}
              className="absolute top-4 right-4 w-9 h-9 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center"
            >
              ✕
            </button>

            <div className="mb-8">
              <h2 className="text-xl font-semibold">Log In</h2>
              <p className="text-sm text-white/50 mt-1">Access your account</p>
            </div>

            <button
              onClick={handleLogin}
              disabled={isLoading}
              className="w-full py-3.5 rounded-xl font-semibold text-white bg-gradient-to-r from-[#1d5eff] to-[#3b82f6] hover:opacity-90 transition-opacity disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isLoading ? "Loading..." : "Log In with Auth0"}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
