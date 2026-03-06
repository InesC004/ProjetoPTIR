/* eslint-disable react/prop-types */
import image from "../pictures/carroREgistro.jpg";
export default function RegisterModal({ isOpen, onClose }) {
  return (
    <>
      {/* Background */}
      <div
        onClick={onClose}
        className={`fixed inset-0 bg-black/15 backdrop-blur-md z-[100] ${
          isOpen ? "block" : "hidden"
        }`}
      />

      {/* Modal */}
      <div
        className={`fixed inset-0 flex items-center justify-center z-[110] ${
          isOpen ? "flex" : "hidden"
        }`}
      >
        <div className="bg-[#071B33] text-white rounded-2xl overflow-hidden w-[900px] max-w-[95%] grid md:grid-cols-2 shadow-2xl">
          {/* Imagem do Carro - parte esquerda */}
          <div className="relative hidden md:block">
            <img
              src={image}
              alt="TakeCab Logo"
              className="h-full w-full object-cover"
            />

            <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center text-center p-6">
              <h2 className="text-3xl font-bold">Join TakeCab</h2>
              <p className="text-white/80 mt-3">
                Fast, safe and comfortable rides
              </p>
            </div>
          </div>

          {/* FORM */}
          <div className="p-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">User Registration</h2>

              <button
                onClick={onClose}
                className="text-2xl hover:text-gray-300"
              >
                ×
              </button>
            </div>

            <form className="space-y-5">
              <div>
                <label className="mb-2 block text-sm font-medium text-white/85">
                  Full Name
                </label>
                <input
                  name="name"
                  placeholder="Enter your full name"
                  className="w-full rounded-xl border border-white/10 bg-white/10 px-4 py-3 text-white placeholder:text-white/35 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                />
              </div>

              <div className="grid gap-5 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-medium text-white/85">
                    NIF
                  </label>
                  <input
                    name="nif"
                    placeholder="Enter your NIF"
                    className="w-full rounded-xl border border-white/10 bg-white/10 px-4 py-3 text-white placeholder:text-white/35 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-white/85">
                    Gender
                  </label>
                  <select
                    name="gender"
                    className="w-full rounded-xl border border-white/10 bg-white/10 px-4 py-3 text-white focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                  >
                    <option value="" className="text-black">
                      Select gender
                    </option>
                    <option value="Male" className="text-black">
                      Male
                    </option>
                    <option value="Female" className="text-black">
                      Female
                    </option>
                    <option value="Other" className="text-black">
                      Other
                    </option>
                  </select>
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-white/85">
                  Date of Birth
                </label>

                <div className="grid gap-5 md:grid-cols-3">
                  <input
                    type="number"
                    name="birth_day"
                    min="1"
                    max="31"
                    placeholder="Day"
                    className="w-full rounded-xl border border-white/10 bg-white/10 px-4 py-3 text-white placeholder:text-white/35 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                  />

                  <input
                    type="number"
                    name="birth_month"
                    min="1"
                    max="12"
                    placeholder="Month"
                    className="w-full rounded-xl border border-white/10 bg-white/10 px-4 py-3 text-white placeholder:text-white/35 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                  />

                  <input
                    type="number"
                    name="birth_year"
                    min="1926"
                    max="2008"
                    placeholder="Year"
                    className="w-full rounded-xl border border-white/10 bg-white/10 px-4 py-3 text-white placeholder:text-white/35 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                  />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-white/85">
                  Address
                </label>
                <input
                  name="address"
                  placeholder="Enter your address"
                  className="w-full rounded-xl border border-white/10 bg-white/10 px-4 py-3 text-white placeholder:text-white/35 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-white/85">
                  Postal Code
                </label>
                <input
                  name="postal_code"
                  placeholder="e.g. 1000-200"
                  className="w-full rounded-xl border border-white/10 bg-white/10 px-4 py-3 text-white placeholder:text-white/35 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-white/85">
                  Password
                </label>
                <input
                  type="password"
                  name="access_password"
                  placeholder="Create a secure password"
                  className="w-full rounded-xl border border-white/10 bg-white/10 px-4 py-3 text-white placeholder:text-white/35 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                />
              </div>

              <button
                type="submit"
                className="mt-2 w-full rounded-xl bg-gradient-to-r from-[#1d5eff] to-[#2b7bff] px-4 py-3.5 font-semibold transition hover:opacity-90"
              >
                Register
              </button>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}
