import RegisterBox from "../components/RegisterBox";

export default function RegisterPage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-6">
      {/* background overlay igual ao home */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#132439]/90 via-[#132439]/60 to-[#071B33]" />

      {/* box */}
      <div className="relative z-10">
        <RegisterBox />
      </div>
    </div>
  );
}
