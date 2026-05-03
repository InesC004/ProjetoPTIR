/* eslint-disable react/prop-types */
import { useState, useEffect } from "react";
import Header from "../components/Header2";
import api from "../Api";

function formatDate(isoString) {
  if (!isoString) return "—";
  const d = new Date(isoString);
  if (isNaN(d.getTime())) return isoString;
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yyyy = d.getFullYear();
  return `${dd} / ${mm} / ${yyyy}`;
}

// ─────────────────────────────────────────────────────────────
// Field definido FORA do Profile — não é recriado a cada render
// ─────────────────────────────────────────────────────────────
function Field({ label, field, data, editing, draft, setDraft, readOnly }) {
  const displayValue =
    field === "data_nascimento"
      ? formatDate(data?.[field])
      : data?.[field] || "—";

  return (
    <div className="perfil-campo">
      <div className="perfil-campo-label">{label}</div>
      {editing && !readOnly ? (
        <input
          className="perfil-campo-input"
          value={draft[field] || ""}
          onChange={(e) =>
            setDraft((prev) => ({ ...prev, [field]: e.target.value }))
          }
        />
      ) : (
        <div className="perfil-campo-valor">{displayValue}</div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Componente principal
// ─────────────────────────────────────────────────────────────
export default function Profile() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState({});
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);

  function showToast(type, msg) {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 3000);
  }

  useEffect(() => {
    async function fetchPerfil() {
      try {
        const cliente = await api.clientes.obterPerfil();
        setData(cliente);
      } catch (err) {
        console.error(err);
        showToast("error", "Não foi possível carregar o perfil.");
      } finally {
        setLoading(false);
      }
    }
    fetchPerfil();
  }, []);

  function startEdit() {
    setDraft({
      nome: data.nome || "",
      email: data.email || "",
      genero: data.genero || "",
      morada: data.morada || "",
      codigo_postal: data.codigo_postal || "",
    });
    setEditing(true);
  }

  async function saveEdit() {
    setSaving(true);
    try {
      const updated = await api.clientes.atualizarPerfil(draft);
      setData(updated.cliente || { ...data, ...draft });

      const stored = JSON.parse(localStorage.getItem("cliente") || "{}");
      localStorage.setItem(
        "cliente",
        JSON.stringify({ ...stored, nome: draft.nome, email: draft.email }),
      );

      setEditing(false);
      showToast("success", "Perfil atualizado com sucesso!");
    } catch (err) {
      console.error(err);
      showToast("error", err.message || "Erro ao guardar alterações.");
    } finally {
      setSaving(false);
    }
  }

  function cancelEdit() {
    setEditing(false);
  }

  const fp = { data, editing, draft, setDraft };

  const activity = [
    {
      icon: "🚕",
      color: "blue",
      name: "Aeroporto → Marquês de Pombal",
      date: "Hoje, 14:32",
      amount: "€18.50",
    },
    {
      icon: "🚕",
      color: "blue",
      name: "Belém → Chiado",
      date: "15 Mar, 20:44",
      amount: "€11.20",
    },
  ];

  return (
    <>
      <Header isDashboard />
      <div className="perfil-pagina">
        <div className="perfil-fundo">
          <div className="perfil-fundo-bola" />
          <div className="perfil-fundo-bola" />
        </div>

        <div className="perfil-conteudo">
          <div className="perfil-titulo-pagina">O meu perfil</div>

          {loading ? (
            <div className="perfil-a-carregar">
              <div className="spinner" />
              <span style={{ color: "#6b8baa", fontSize: "0.9rem" }}>
                A carregar perfil...
              </span>
            </div>
          ) : !data ? (
            <div className="perfil-a-carregar">
              <span style={{ color: "#ff6b6b", fontSize: "0.95rem" }}>
                Não foi possível carregar o perfil.
              </span>
            </div>
          ) : (
            <>
              <div className="perfil-hero">
                <div className="perfil-avatar">
                  <div className="perfil-avatar-anel">
                    <div className="perfil-avatar-interior">
                      <img
                        src={`https://api.dicebear.com/7.x/thumbs/svg?seed=${data.nome || "user"}`}
                        alt="Avatar"
                      />
                    </div>
                  </div>
                  <span className="perfil-avatar-ponto" />
                </div>

                <div className="perfil-hero-info">
                  <div className="perfil-hero-nome">{data.nome}</div>
                  <div className="perfil-hero-email">{data.email}</div>
                  <div className="perfil-hero-tags">
                    <span className="perfil-tag green">● Ativo</span>
                    <span className="perfil-tag">🛡 Verificado</span>
                  </div>
                  {editing ? (
                    <div style={{ display: "flex", gap: 10, marginTop: 14 }}>
                      <button
                        className="perfil-btn-editar save"
                        onClick={saveEdit}
                        disabled={saving}
                      >
                        {saving ? "A guardar..." : "💾 Guardar"}
                      </button>
                      <button
                        className="perfil-btn-editar"
                        onClick={cancelEdit}
                        disabled={saving}
                      >
                        Cancelar
                      </button>
                    </div>
                  ) : (
                    <button className="perfil-btn-editar" onClick={startEdit}>
                      ✏️ Editar perfil
                    </button>
                  )}
                </div>

                <div className="perfil-stats">
                  <div>
                    <div className="perfil-stat-valor">47</div>
                    <div className="perfil-stat-label">Viagens</div>
                  </div>
                  <div>
                    <div className="perfil-stat-valor">
                      4.<span>9</span>
                    </div>
                    <div className="perfil-stat-label">Avaliação</div>
                  </div>
                </div>
              </div>

              <div className="perfil-grelha">
                <div className="perfil-card">
                  <div className="perfil-card-titulo">
                    <span className="perfil-card-titulo-icone">👤</span>
                    Dados Pessoais
                  </div>
                  <Field {...fp} label="Nome completo" field="nome" />
                  <Field {...fp} label="NIF" field="nif" readOnly />
                  <div className="perfil-campo-linha">
                    <Field {...fp} label="Género" field="genero" />
                    <Field
                      {...fp}
                      label="Data de nascimento"
                      field="data_nascimento"
                      readOnly
                    />
                  </div>
                </div>

                <div className="perfil-card">
                  <div className="perfil-card-titulo">
                    <span className="perfil-card-titulo-icone">📱</span>
                    Contacto &amp; Morada
                  </div>
                  <Field {...fp} label="Email" field="email" />
                  <Field {...fp} label="Morada" field="morada" />
                  <Field {...fp} label="Código postal" field="codigo_postal" />
                </div>

                <div className="perfil-card">
                  <div className="perfil-card-titulo">
                    <span className="perfil-card-titulo-icone">🕐</span>
                    Atividade Recente
                  </div>
                  <div className="perfil-atividade">
                    {activity.map((a, i) => (
                      <div className="perfil-atividade-item" key={i}>
                        <div className={`perfil-atividade-icone ${a.color}`}>
                          {a.icon}
                        </div>
                        <div className="perfil-atividade-info">
                          <div className="perfil-atividade-nome">{a.name}</div>
                          <div className="perfil-atividade-data">{a.date}</div>
                        </div>
                        <div className="perfil-atividade-valor">{a.amount}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {toast && <div className={`notificacao ${toast.type}`}>{toast.msg}</div>}
    </>
  );
}
