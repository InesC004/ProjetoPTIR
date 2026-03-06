/* eslint-disable react/prop-types */
import { useState, useEffect } from "react";
import image from "../pictures/carroREgistro.jpg";

export default function RegisterModal({ isOpen, onClose }) {
  const [mounted, setMounted] = useState(false);
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: "",
    nif: "",
    gender: "",
    birth_day: "",
    birth_month: "",
    birth_year: "",
    address: "",
    postal_code: "",
    email: "",
    phone: "",
    access_password: "",
  });

  useEffect(() => {
    if (isOpen) {
      setMounted(true);
      setStep(1);
    } else {
      const timer = setTimeout(() => setMounted(false), 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  if (!mounted && !isOpen) return null;

  return (
    <>
      {/* Background */}
      <div
        onClick={onClose}
        className={`fixed inset-0 z-[100] transition-all duration-500 ${
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        style={{
          background:
            "radial-gradient(ellipse at center, rgba(0,0,0,0.6) 0%, rgba(0,0,0,0.85) 100%)",
          backdropFilter: isOpen ? "blur(12px)" : "blur(0px)",
        }}
      />

      {/* Modal */}
      <div
        className={`fixed inset-0 flex items-center justify-center z-[110] p-4 transition-all duration-500 ${
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
      >
        <div
          className={`relative bg-[#0a1628] text-white rounded-3xl overflow-hidden w-[950px] max-w-full max-h-[90vh] grid md:grid-cols-[1.1fr_1fr] shadow-2xl border border-white/10 transform transition-all duration-500 ${
            isOpen ? "scale-100 translate-y-0" : "scale-95 translate-y-8"
          }`}
        >
          {/* Decorative Glow */}
          <div className="absolute -top-32 -right-32 w-64 h-64 bg-[#3b82f6]/20 rounded-full blur-[100px]" />
          <div className="absolute -bottom-32 -left-32 w-64 h-64 bg-[#f59e0b]/10 rounded-full blur-[100px]" />

          {/* Imagem do Carro - parte esquerda */}
          <div className="relative hidden md:block overflow-hidden">
            <img
              src={image}
              alt="TakeCab"
              className="h-full w-full object-cover scale-110 transition-transform duration-700"
            />

            {/* Overlay Gradient */}
            <div className="absolute inset-0 bg-gradient-to-r from-[#0a1628] via-[#0a1628]/50 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0a1628] via-transparent to-[#0a1628]/30" />

            {/* Content */}
            <div className="absolute inset-0 flex flex-col justify-end p-8">
              <div className="space-y-4">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-sm border border-white/10 w-fit">
                  <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
                  <span className="text-white/80 text-xs font-medium">
                    50k+ viagens realizadas
                  </span>
                </div>

                <h2 className="text-3xl font-light">
                  Junta-te ao{" "}
                  <span className="font-semibold bg-gradient-to-r from-[#3b82f6] to-[#60a5fa] bg-clip-text text-transparent">
                    TakeCab
                  </span>
                </h2>

                <p className="text-white/50 text-sm leading-relaxed max-w-xs">
                  Viagens rápidas, seguras e confortáveis. Regista-te e começa a
                  viajar hoje.
                </p>

                {/* Features */}
                <div className="space-y-2 pt-4">
                  <Feature icon="shield" text="Viagens 100% seguras" />
                  <Feature icon="clock" text="Disponível 24/7" />
                  <Feature icon="star" text="Motoristas verificados" />
                </div>
              </div>
            </div>
          </div>

          {/* FORM */}
          <div className="relative p-6 md:p-8 overflow-y-auto max-h-[90vh]">
            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 w-10 h-10 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 
                         flex items-center justify-center transition-all duration-300 group z-10
                         hover:rotate-90 hover:border-white/20"
            >
              <svg
                className="w-5 h-5 text-white/70 group-hover:text-white"
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

            {/* Header */}
            <div className="mb-6">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#3b82f6]/20 to-[#60a5fa]/10 flex items-center justify-center">
                  <svg
                    className="w-5 h-5 text-[#60a5fa]"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
                    />
                  </svg>
                </div>
                <div>
                  <h2 className="text-xl font-semibold">Criar Conta</h2>
                  <p className="text-xs text-white/50">Passo {step} de 2</p>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="h-1 bg-white/10 rounded-full overflow-hidden mt-4">
                <div
                  className="h-full bg-gradient-to-r from-[#3b82f6] to-[#60a5fa] rounded-full transition-all duration-500"
                  style={{ width: step === 1 ? "50%" : "100%" }}
                />
              </div>
            </div>

            <form className="space-y-4">
              {step === 1 ? (
                <>
                  {/* Nome */}
                  <InputField
                    label="Nome Completo"
                    name="name"
                    placeholder="O teu nome completo"
                    value={formData.name}
                    onChange={handleChange}
                    icon="user"
                  />

                  {/* Email e Telefone */}
                  <div className="grid gap-4 md:grid-cols-2">
                    <InputField
                      label="Email"
                      name="email"
                      type="email"
                      placeholder="email@exemplo.com"
                      value={formData.email}
                      onChange={handleChange}
                      icon="mail"
                    />
                    <InputField
                      label="Telefone"
                      name="phone"
                      placeholder="+351 912 345 678"
                      value={formData.phone}
                      onChange={handleChange}
                      icon="phone"
                    />
                  </div>

                  {/* NIF e Género */}
                  <div className="grid gap-4 md:grid-cols-2">
                    <InputField
                      label="NIF"
                      name="nif"
                      placeholder="O teu NIF"
                      value={formData.nif}
                      onChange={handleChange}
                      icon="id"
                    />
                    <SelectField
                      label="Género"
                      name="gender"
                      value={formData.gender}
                      onChange={handleChange}
                      options={[
                        { value: "", label: "Seleciona" },
                        { value: "Male", label: "Masculino" },
                        { value: "Female", label: "Feminino" },
                        { value: "Other", label: "Outro" },
                      ]}
                    />
                  </div>

                  {/* Data de Nascimento */}
                  <div>
                    <label className="block text-sm font-medium text-white/70 mb-2">
                      Data de Nascimento
                    </label>
                    <div className="grid grid-cols-3 gap-3">
                      <InputField
                        name="birth_day"
                        type="number"
                        placeholder="Dia"
                        value={formData.birth_day}
                        onChange={handleChange}
                        min="1"
                        max="31"
                        noLabel
                      />
                      <InputField
                        name="birth_month"
                        type="number"
                        placeholder="Mês"
                        value={formData.birth_month}
                        onChange={handleChange}
                        min="1"
                        max="12"
                        noLabel
                      />
                      <InputField
                        name="birth_year"
                        type="number"
                        placeholder="Ano"
                        value={formData.birth_year}
                        onChange={handleChange}
                        min="1926"
                        max="2008"
                        noLabel
                      />
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setStep(2)}
                    className="w-full mt-4 py-3.5 rounded-xl font-semibold text-white relative overflow-hidden group transition-all duration-300 hover:shadow-[0_0_30px_rgba(59,130,246,0.4)] hover:scale-[1.02]"
                  >
                    <span className="absolute inset-0 bg-gradient-to-r from-[#1d5eff] via-[#3b82f6] to-[#60a5fa]" />
                    <span className="absolute inset-0 bg-gradient-to-r from-[#60a5fa] to-[#1d5eff] opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    <span className="relative flex items-center justify-center gap-2">
                      Continuar
                      <svg
                        className="w-4 h-4 group-hover:translate-x-1 transition-transform"
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
                    </span>
                  </button>
                </>
              ) : (
                <>
                  {/* Morada */}
                  <InputField
                    label="Morada"
                    name="address"
                    placeholder="A tua morada completa"
                    value={formData.address}
                    onChange={handleChange}
                    icon="location"
                  />

                  {/* Código Postal */}
                  <InputField
                    label="Código Postal"
                    name="postal_code"
                    placeholder="1000-200"
                    value={formData.postal_code}
                    onChange={handleChange}
                    icon="map"
                  />

                  {/* Password */}
                  <InputField
                    label="Password"
                    name="access_password"
                    type="password"
                    placeholder="Cria uma password segura"
                    value={formData.access_password}
                    onChange={handleChange}
                    icon="lock"
                  />

                  {/* Terms */}
                  <div className="flex items-start gap-3 p-4 rounded-xl bg-white/5 border border-white/10">
                    <input
                      type="checkbox"
                      id="terms"
                      className="mt-1 w-4 h-4 rounded border-white/20 bg-white/10 checked:bg-[#3b82f6] focus:ring-[#3b82f6]/50"
                    />
                    <label
                      htmlFor="terms"
                      className="text-sm text-white/60 leading-relaxed"
                    >
                      Concordo com os{" "}
                      <a href="#" className="text-[#60a5fa] hover:underline">
                        Termos de Serviço
                      </a>{" "}
                      e{" "}
                      <a href="#" className="text-[#60a5fa] hover:underline">
                        Política de Privacidade
                      </a>
                    </label>
                  </div>

                  <div className="flex gap-3 mt-4">
                    <button
                      type="button"
                      onClick={() => setStep(1)}
                      className="flex-1 py-3.5 rounded-xl font-semibold text-white/80 bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all duration-300 flex items-center justify-center gap-2"
                    >
                      <svg
                        className="w-4 h-4"
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
                      className="flex-[2] py-3.5 rounded-xl font-semibold text-white relative overflow-hidden group transition-all duration-300 hover:shadow-[0_0_30px_rgba(59,130,246,0.4)] hover:scale-[1.02]"
                    >
                      <span className="absolute inset-0 bg-gradient-to-r from-[#1d5eff] via-[#3b82f6] to-[#60a5fa]" />
                      <span className="absolute inset-0 bg-gradient-to-r from-[#60a5fa] to-[#1d5eff] opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                      <span className="relative flex items-center justify-center gap-2">
                        <svg
                          className="w-5 h-5"
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
                        Criar Conta
                      </span>
                    </button>
                  </div>
                </>
              )}
            </form>

            {/* Login Link */}
            <p className="text-center text-white/50 text-sm mt-6">
              Já tens conta?{" "}
              <a
                href="#"
                className="text-[#60a5fa] hover:underline font-medium"
              >
                Faz login aqui
              </a>
            </p>
          </div>
        </div>
      </div>
    </>
  );
}

function InputField({
  label,
  name,
  type = "text",
  placeholder,
  value,
  onChange,
  icon,
  noLabel,
  ...props
}) {
  const icons = {
    user: "M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z",
    mail: "M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z",
    phone:
      "M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z",
    id: "M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2",
    location:
      "M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z M15 11a3 3 0 11-6 0 3 3 0 016 0z",
    map: "M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7",
    lock: "M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z",
  };

  return (
    <div>
      {!noLabel && label && (
        <label className="block text-sm font-medium text-white/70 mb-2">
          {label}
        </label>
      )}
      <div className="relative">
        {icon && icons[icon] && (
          <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none">
            <svg
              className="w-5 h-5 text-white/30"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="1.5"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d={icons[icon]}
              />
            </svg>
          </div>
        )}
        <input
          name={name}
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          className={`w-full rounded-xl border border-white/10 bg-white/5 py-3 text-white placeholder:text-white/30 
                     focus:border-[#3b82f6]/50 focus:outline-none focus:ring-2 focus:ring-[#3b82f6]/20 
                     transition-all duration-300 ${icon ? "pl-12 pr-4" : "px-4"}`}
          {...props}
        />
      </div>
    </div>
  );
}

function SelectField({ label, name, value, onChange, options }) {
  return (
    <div>
      <label className="block text-sm font-medium text-white/70 mb-2">
        {label}
      </label>
      <select
        name={name}
        value={value}
        onChange={onChange}
        className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white 
                   focus:border-[#3b82f6]/50 focus:outline-none focus:ring-2 focus:ring-[#3b82f6]/20 
                   transition-all duration-300 appearance-none cursor-pointer"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='rgba(255,255,255,0.3)'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
          backgroundRepeat: "no-repeat",
          backgroundPosition: "right 12px center",
          backgroundSize: "20px",
        }}
      >
        {options.map((opt) => (
          <option
            key={opt.value}
            value={opt.value}
            className="bg-[#0a1628] text-white"
          >
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}

function Feature({ icon, text }) {
  const icons = {
    shield:
      "M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z",
    clock: "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z",
    star: "M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z",
  };

  return (
    <div className="flex items-center gap-3">
      <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center">
        <svg
          className="w-4 h-4 text-[#60a5fa]"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d={icons[icon]} />
        </svg>
      </div>
      <span className="text-white/70 text-sm">{text}</span>
    </div>
  );
}
