export default function RegisterBox() {
  return (
    <div className="w-full max-w-md bg-[#0D2B4F]/80 backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-2xl text-white">
      {/* Título */}
      <h2 className="text-2xl font-semibold text-center mb-6">
        Create Account
      </h2>

      {/* Form */}
      <form className="space-y-4">
        {/* Name */}
        <input
          type="text"
          placeholder="Full name"
          className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/10 focus:outline-none focus:border-white/30"
        />

        {/* Email */}
        <input
          type="email"
          placeholder="Email"
          className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/10 focus:outline-none focus:border-white/30"
        />

        {/* Password */}
        <input
          type="password"
          placeholder="Password"
          className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/10 focus:outline-none focus:border-white/30"
        />

        {/* Confirm Password */}
        <input
          type="password"
          placeholder="Confirm password"
          className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/10 focus:outline-none focus:border-white/30"
        />

        {/* Botão */}
        <button
          type="submit"
          className="w-full py-3 rounded-lg font-semibold bg-gradient-to-r from-[#1E5AA8] via-[#1B62B8] to-[#2A74D6] hover:opacity-90 transition"
        >
          Register
        </button>
      </form>

      {/* Link login */}
      <p className="text-sm text-white/60 text-center mt-6">
        Already have an account?{" "}
        <span className="text-white hover:underline cursor-pointer">Login</span>
      </p>
    </div>
  );
}
