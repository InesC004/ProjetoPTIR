/* eslint-disable react/prop-types */
import { useEffect, useState } from "react";
import {
  X,
  Search,
  Trash2,
  AlertCircle,
  Loader2,
  CheckCircle2,
  User,
} from "lucide-react";

export default function RemoverMotorista({ aberto, onFechar }) {
  const [motoristas, setMotoristas] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState("");
  const [removendoId, setRemovendoId] = useState(null);
  const [sucesso, setSucesso] = useState("");

  useEffect(() => {
    if (!aberto) return;
    fetchMotoristas();
  }, [aberto]);

  async function fetchMotoristas() {
    setLoading(true);
    setErro("");
    try {
      const res = await fetch("http://localhost:8080/api/motoristas");
      if (!res.ok) throw new Error();
      const data = await res.json();
      setMotoristas(data);
    } catch {
      setErro("Erro ao carregar motoristas.");
    } finally {
      setLoading(false);
    }
  }

  async function removerMotorista(motorista) {
    const ok = window.confirm(
      `Tem a certeza que quer remover o motorista ${motorista.nome}?`,
    );
    if (!ok) return;

    setRemovendoId(motorista._id);
    setErro("");
    setSucesso("");

    try {
      const res = await fetch(
        `http://localhost:8080/api/motoristas/${motorista._id}`,
        {
          method: "DELETE",
        },
      );

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setErro(data.error || "Erro ao remover motorista.");
      } else {
        setMotoristas((prev) => prev.filter((m) => m._id !== motorista._id));
        setSucesso("Motorista removido com sucesso.");
      }
    } catch {
      setErro("Não foi possível ligar ao servidor.");
    } finally {
      setRemovendoId(null);
    }
  }

  if (!aberto) return null;

  const filtrados = motoristas.filter((m) => {
    const termo = searchTerm.toLowerCase();
    return (
      (m.nome || "").toLowerCase().includes(termo) ||
      (m.nif || "").toLowerCase().includes(termo) ||
      (m.email || "").toLowerCase().includes(termo) ||
      (m.numero_carta_conducao || "").toLowerCase().includes(termo)
    );
  });

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onFechar}
      />

      <div className="relative w-full max-w-[680px] mx-4 max-h-[90vh] overflow-y-auto rounded-2xl border border-[#1a6eff]/20 bg-[#0a1628]/95 backdrop-blur-2xl shadow-[0_32px_80px_rgba(0,0,0,0.5)]">
        <div className="flex items-center justify-between p-6 border-b border-white/[0.06]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-[13px] flex items-center justify-center text-white bg-[linear-gradient(135deg,#ef4444,#b91c1c)]">
              <Trash2 size={18} />
            </div>
            <div>
              <h3 className="font-['Syne',sans-serif] text-[18px] font-bold text-[#eaf0ff]">
                Remover Motoristas
              </h3>
              <p className="text-[12px] text-[#4e6a8a]">
                Selecione o motorista a remover
              </p>
            </div>
          </div>

          <button
            onClick={onFechar}
            className="w-10 h-10 rounded-xl flex items-center justify-center border border-white/[0.06] bg-white/[0.03] text-[#8ba3c7]"
          >
            <X size={18} />
          </button>
        </div>

        <div className="p-6">
          <div className="relative mb-5">
            <Search
              size={16}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-[#4e6a8a]"
            />
            <input
              type="text"
              placeholder="Pesquisar por nome, NIF, email ou carta..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-11 pr-4 py-3 rounded-xl text-[14px] text-[#eaf0ff] placeholder-[#4e6a8a]/60 bg-white/[0.04] border border-white/[0.08] outline-none"
            />
          </div>

          {erro && (
            <div className="mb-4 flex items-center gap-2 rounded-xl border border-red-500/20 bg-red-500/[0.05] px-4 py-3 text-[13px] text-red-300">
              <AlertCircle size={16} />
              {erro}
            </div>
          )}

          {sucesso && (
            <div className="mb-4 flex items-center gap-2 rounded-xl border border-[#00e887]/20 bg-[#00e887]/[0.06] px-4 py-3 text-[13px] text-[#8fffd0]">
              <CheckCircle2 size={16} />
              {sucesso}
            </div>
          )}

          {loading ? (
            <div className="flex items-center justify-center gap-3 py-10 text-[#8ba3c7] text-[14px]">
              <Loader2 size={18} className="animate-spin" />
              A carregar motoristas...
            </div>
          ) : filtrados.length === 0 ? (
            <div className="text-center py-10 text-[#8ba3c7] text-[14px]">
              Nenhum motorista encontrado.
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {filtrados.map((motorista) => (
                <div
                  key={motorista._id}
                  className="rounded-2xl border border-white/[0.06] bg-white/[0.03] p-4"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="font-semibold text-[#eaf0ff] text-[15px] flex items-center gap-2">
                        <User size={15} />
                        {motorista.nome}
                      </div>
                      <div className="text-[12px] text-[#8ba3c7] mt-1">
                        NIF: {motorista.nif}
                      </div>
                      <div className="text-[12px] text-[#8ba3c7]">
                        Email: {motorista.email}
                      </div>
                      <div className="text-[12px] text-[#8ba3c7]">
                        Carta: {motorista.numero_carta_conducao}
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => removerMotorista(motorista)}
                      disabled={removendoId === motorista._id}
                      className="px-4 py-2 rounded-xl bg-red-500/10 border border-red-500/20 text-red-300 hover:bg-red-500/15 disabled:opacity-50 flex items-center gap-2"
                    >
                      {removendoId === motorista._id ? (
                        <>
                          <Loader2 size={15} className="animate-spin" />
                          A remover...
                        </>
                      ) : (
                        <>
                          <Trash2 size={15} />
                          Remover
                        </>
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}