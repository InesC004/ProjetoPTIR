/* eslint-disable react/prop-types */
import { useState } from "react";
import image from "../pictures/carroREgistro.jpg";

export default function RegisterModal({ isOpen, onClose }) {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    nif: "",
    gender: "",
    birth_day: "",
    birth_month: "",
    birth_year: "",
    address: "",
    postal_code: "",
    access_password: "",
  });

  if (!isOpen) return null;

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("http://localhost:5000/api/passengers/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Erro ao registar.");
      } else {
        setSuccess(true);
        setTimeout(() => {
          setSuccess(false);
          setStep(1);
          setFormData({
            name: "",
            nif: "",
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
      }
    } catch {
      setError("Não foi possível conectar ao servidor.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Background */}
      <div
        onClick={onClose}
        className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm"
      />

      {/* Modal */}
      <div className="fixed inset-0 flex items-center justify-center z-[110] p-4">
        <div className="relative bg-[#0a1628] text-white rounded-2xl overflow-hidden w-[900px] max-w-full max-h-[90vh] grid md:grid-cols-2 shadow-2xl border border-white/10">
          {/* Image - Left */}
          <div className="relative hidden md:block">
            <img
              src={image}
              alt="TakeCab"
              className="h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-[#0a1628]/80 to-transparent" />
            <div className="absolute inset-0 flex flex-col justify-end p-8">
              <h2 className="text-2xl font-light mb-2">
                Join{" "}
                <span className="font-semibold text-[#60a5fa]">TakeCab</span>
              </h2>
              <p className="text-white/60 text-sm">
                Fast, safe and comfortable rides.
              </p>
            </div>
          </div>

          {/* Form - Right */}
          <div className="p-8 overflow-y-auto">
            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 w-9 h-9 rounded-lg bg-white/10 hover:bg-white/20 
                         flex items-center justify-center transition-colors"
            >
              <svg
                className="w-5 h-5 text-white/70"
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
              <h2 className="text-xl font-semibold">Create Account</h2>
              <p className="text-sm text-white/50 mt-1">Step {step} of 2</p>
              <div className="h-1 bg-white/10 rounded-full overflow-hidden mt-4">
                <div
                  className="h-full bg-gradient-to-r from-[#1d5eff] to-[#3b82f6] rounded-full transition-all duration-300"
                  style={{ width: step === 1 ? "50%" : "100%" }}
                />
              </div>
            </div>

            {/* Success Message */}
            {success && (
              <div className="mb-4 px-4 py-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-sm text-center">
                ✓ Account created successfully! Welcome to TakeCab.
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="mb-4 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {step === 1 ? (
                <>
                  {/* Full Name */}
                  <div>
                    <label className="block text-sm font-medium text-white/70 mb-2">
                      Full Name
                    </label>
                    <input
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="Enter your full name"
                      required
                      className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white 
                                 placeholder:text-white/30 focus:border-[#3b82f6]/50 focus:outline-none"
                    />
                  </div>

                  {/* NIF & Gender */}
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <label className="block text-sm font-medium text-white/70 mb-2">
                        NIF
                      </label>
                      <input
                        name="nif"
                        value={formData.nif}
                        onChange={handleChange}
                        placeholder="Enter your NIF"
                        required
                        className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white 
                                   placeholder:text-white/30 focus:border-[#3b82f6]/50 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-white/70 mb-2">
                        Gender
                      </label>
                      <select
                        name="gender"
                        value={formData.gender}
                        onChange={handleChange}
                        required
                        className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white 
                                   focus:border-[#3b82f6]/50 focus:outline-none"
                      >
                        <option value="" className="bg-[#0a1628]">
                          Select gender
                        </option>
                        <option value="Male" className="bg-[#0a1628]">
                          Male
                        </option>
                        <option value="Female" className="bg-[#0a1628]">
                          Female
                        </option>
                        <option value="Other" className="bg-[#0a1628]">
                          Other
                        </option>
                      </select>
                    </div>
                  </div>

                  {/* Date of Birth */}
                  <div>
                    <label className="block text-sm font-medium text-white/70 mb-2">
                      Date of Birth
                    </label>
                    <div className="grid grid-cols-3 gap-3">
                      <input
                        type="number"
                        name="birth_day"
                        value={formData.birth_day}
                        onChange={handleChange}
                        placeholder="Day"
                        min="1"
                        max="31"
                        required
                        className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white 
                                   placeholder:text-white/30 focus:border-[#3b82f6]/50 focus:outline-none"
                      />
                      <input
                        type="number"
                        name="birth_month"
                        value={formData.birth_month}
                        onChange={handleChange}
                        placeholder="Month"
                        min="1"
                        max="12"
                        required
                        className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white 
                                   placeholder:text-white/30 focus:border-[#3b82f6]/50 focus:outline-none"
                      />
                      <input
                        type="number"
                        name="birth_year"
                        value={formData.birth_year}
                        onChange={handleChange}
                        placeholder="Year"
                        min="1926"
                        max="2008"
                        required
                        className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white 
                                   placeholder:text-white/30 focus:border-[#3b82f6]/50 focus:outline-none"
                      />
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setStep(2)}
                    className="w-full py-3.5 rounded-xl font-semibold text-white bg-gradient-to-r from-[#1d5eff] to-[#3b82f6] 
                               hover:opacity-90 transition-opacity mt-2 flex items-center justify-center gap-2"
                  >
                    Continue
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
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </button>
                </>
              ) : (
                <>
                  {/* Address */}
                  <div>
                    <label className="block text-sm font-medium text-white/70 mb-2">
                      Address
                    </label>
                    <input
                      name="address"
                      value={formData.address}
                      onChange={handleChange}
                      placeholder="Enter your address"
                      required
                      className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white 
                                 placeholder:text-white/30 focus:border-[#3b82f6]/50 focus:outline-none"
                    />
                  </div>

                  {/* Postal Code */}
                  <div>
                    <label className="block text-sm font-medium text-white/70 mb-2">
                      Postal Code
                    </label>
                    <input
                      name="postal_code"
                      value={formData.postal_code}
                      onChange={handleChange}
                      placeholder="e.g. 1000-200"
                      required
                      className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white 
                                 placeholder:text-white/30 focus:border-[#3b82f6]/50 focus:outline-none"
                    />
                  </div>

                  {/* Password */}
                  <div>
                    <label className="block text-sm font-medium text-white/70 mb-2">
                      Password
                    </label>
                    <input
                      type="password"
                      name="access_password"
                      value={formData.access_password}
                      onChange={handleChange}
                      placeholder="Create a secure password"
                      required
                      className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white 
                                 placeholder:text-white/30 focus:border-[#3b82f6]/50 focus:outline-none"
                    />
                  </div>

                  {/* Buttons */}
                  <div className="flex gap-3 mt-2">
                    <button
                      type="button"
                      onClick={() => setStep(1)}
                      className="flex-1 py-3.5 rounded-xl font-semibold text-white/80 bg-white/5 border border-white/10 
                                 hover:bg-white/10 transition-colors flex items-center justify-center gap-2"
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
                      Back
                    </button>

                    <button
                      type="submit"
                      disabled={loading}
                      className="flex-[2] py-3.5 rounded-xl font-semibold text-white bg-gradient-to-r from-[#1d5eff] to-[#3b82f6] 
                                 hover:opacity-90 transition-opacity flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      {loading ? (
                        <>
                          <svg
                            className="w-4 h-4 animate-spin"
                            fill="none"
                            viewBox="0 0 24 24"
                          >
                            <circle
                              className="opacity-25"
                              cx="12"
                              cy="12"
                              r="10"
                              stroke="currentColor"
                              strokeWidth="4"
                            />
                            <path
                              className="opacity-75"
                              fill="currentColor"
                              d="M4 12a8 8 0 018-8v8z"
                            />
                          </svg>
                          Registering...
                        </>
                      ) : (
                        <>
                          Register
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

            <p className="text-center text-white/50 text-sm mt-6">
              Already have an account?{" "}
              <a href="#" className="text-[#60a5fa] hover:underline">
                Log in
              </a>
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
