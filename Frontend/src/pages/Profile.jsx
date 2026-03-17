/* eslint-disable react/prop-types */
import { useState } from "react";

const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;1,9..40,300&display=swap');

  * { box-sizing: border-box; margin: 0; padding: 0; }

  .pf-root {
    min-height: 100vh;
    background: #050d1a;
    color: #f0f6ff;
    font-family: 'DM Sans', sans-serif;
    padding-top: 80px;
    overflow-x: hidden;
  }

  /* ── ambient background ── */
  .pf-bg {
    position: fixed; inset: 0; z-index: 0; pointer-events: none;
  }
  .pf-bg-blob {
    position: absolute; border-radius: 50%; filter: blur(120px); opacity: 0.12;
  }
  .pf-bg-blob:nth-child(1) {
    width: 600px; height: 600px; top: -200px; left: -100px;
    background: radial-gradient(circle, #1a6eff, transparent);
  }
  .pf-bg-blob:nth-child(2) {
    width: 400px; height: 400px; bottom: 0; right: -50px;
    background: radial-gradient(circle, #00d4ff, transparent); opacity: 0.08;
  }

  /* ── layout ── */
  .pf-container {
    position: relative; z-index: 1;
    max-width: 900px; margin: 0 auto;
    padding: 40px 24px 80px;
  }

  /* ── page title ── */
  .pf-page-title {
    font-family: 'Syne', sans-serif;
    font-size: 1.15rem; font-weight: 600;
    color: #6b8baa; letter-spacing: 0.1em;
    text-transform: uppercase; margin-bottom: 32px;
    display: flex; align-items: center; gap: 10px;
  }
  .pf-page-title::before {
    content: '';
    display: block; width: 24px; height: 2px;
    background: linear-gradient(90deg, #1a6eff, #00d4ff);
    border-radius: 2px;
  }

  /* ── hero card ── */
  .pf-hero {
    background: linear-gradient(135deg, rgba(26,110,255,0.12) 0%, rgba(0,212,255,0.06) 100%);
    border: 1px solid rgba(26,110,255,0.2);
    border-radius: 28px;
    padding: 40px;
    margin-bottom: 24px;
    display: flex; align-items: center; gap: 32px;
    position: relative; overflow: hidden;
    animation: fadeUp 0.5s ease both;
  }
  .pf-hero::before {
    content: '';
    position: absolute; top: 0; left: 0; right: 0; height: 1px;
    background: linear-gradient(90deg, transparent, rgba(26,110,255,0.5), rgba(0,212,255,0.4), transparent);
  }
  .pf-hero::after {
    content: '';
    position: absolute; inset: 0; pointer-events: none;
    background: radial-gradient(ellipse at 20% 50%, rgba(26,110,255,0.06), transparent 60%);
  }

  /* avatar */
  .pf-avatar-wrap {
    position: relative; flex-shrink: 0;
  }
  .pf-avatar-ring {
    width: 100px; height: 100px; border-radius: 50%;
    padding: 3px;
    background: linear-gradient(135deg, #1a6eff, #00d4ff, #1a6eff);
    background-size: 200% 200%;
    animation: gradSpin 4s linear infinite;
  }
  @keyframes gradSpin {
    0%   { background-position: 0% 50%; }
    50%  { background-position: 100% 50%; }
    100% { background-position: 0% 50%; }
  }
  .pf-avatar-inner {
    width: 100%; height: 100%; border-radius: 50%; overflow: hidden;
    background: #050d1a;
    border: 2px solid #050d1a;
  }
  .pf-avatar-inner img { width: 100%; height: 100%; object-fit: cover; display: block; }
  .pf-avatar-badge {
    position: absolute; bottom: 4px; right: 4px;
    width: 18px; height: 18px; border-radius: 50%;
    background: #00e887; border: 3px solid #050d1a;
  }

  /* hero info */
  .pf-hero-info { flex: 1; }
  .pf-hero-name {
    font-family: 'Syne', sans-serif;
    font-size: 1.8rem; font-weight: 800;
    color: #f0f6ff; line-height: 1.1;
    margin-bottom: 4px;
  }
  .pf-hero-email {
    font-size: 0.9rem; color: #6b8baa; margin-bottom: 16px;
  }
  .pf-hero-tags { display: flex; gap: 8px; flex-wrap: wrap; }
  .pf-tag {
    display: inline-flex; align-items: center; gap: 5px;
    padding: 4px 12px; border-radius: 100px;
    font-size: 0.75rem; font-weight: 500;
    border: 1px solid rgba(26,110,255,0.25);
    background: rgba(26,110,255,0.1); color: #5599ff;
  }
  .pf-tag.green { border-color: rgba(0,232,135,0.25); background: rgba(0,232,135,0.08); color: #00e887; }
  .pf-tag.gold  { border-color: rgba(255,185,50,0.25); background: rgba(255,185,50,0.08); color: #ffb932; }

  /* stats row */
  .pf-stats {
    margin-left: auto; display: flex; gap: 24px; text-align: center;
    flex-shrink: 0;
  }
  .pf-stat-val {
    font-family: 'Syne', sans-serif;
    font-size: 1.6rem; font-weight: 800; color: #f0f6ff; line-height: 1;
  }
  .pf-stat-val span { color: #1a6eff; }
  .pf-stat-label { font-size: 0.7rem; color: #6b8baa; margin-top: 4px; text-transform: uppercase; letter-spacing: 0.08em; }

  /* ── edit btn ── */
  .pf-edit-btn {
    display: inline-flex; align-items: center; gap: 8px;
    padding: 10px 22px; border-radius: 14px;
    font-family: 'DM Sans', sans-serif; font-size: 0.875rem; font-weight: 500;
    cursor: pointer; transition: all 0.2s;
    border: 1px solid rgba(26,110,255,0.35);
    background: rgba(26,110,255,0.12); color: #5599ff;
    margin-top: 14px;
  }
  .pf-edit-btn:hover { background: rgba(26,110,255,0.22); border-color: rgba(26,110,255,0.6); color: #80b8ff; }
  .pf-edit-btn.save {
    background: linear-gradient(135deg, #1a6eff, #0051cc);
    border-color: transparent; color: white;
  }
  .pf-edit-btn.save:hover { filter: brightness(1.15); }

  /* ── sections grid ── */
  .pf-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 20px;
  }
  .pf-card {
    background: rgba(255,255,255,0.025);
    border: 1px solid rgba(255,255,255,0.07);
    border-radius: 22px;
    padding: 28px;
    animation: fadeUp 0.5s ease both;
    transition: border-color 0.3s;
  }
  .pf-card:hover { border-color: rgba(26,110,255,0.2); }
  .pf-card.full { grid-column: 1 / -1; }

  .pf-card-title {
    font-family: 'Syne', sans-serif; font-size: 0.8rem; font-weight: 700;
    text-transform: uppercase; letter-spacing: 0.12em;
    color: #3d8bff; margin-bottom: 22px;
    display: flex; align-items: center; gap: 8px;
  }
  .pf-card-title-icon {
    width: 28px; height: 28px; border-radius: 8px;
    background: rgba(26,110,255,0.12);
    border: 1px solid rgba(26,110,255,0.2);
    display: flex; align-items: center; justify-content: center;
    font-size: 0.85rem;
  }

  /* field */
  .pf-field { margin-bottom: 18px; }
  .pf-field:last-child { margin-bottom: 0; }
  .pf-field-label {
    font-size: 0.7rem; font-weight: 500; letter-spacing: 0.08em;
    text-transform: uppercase; color: #6b8baa; margin-bottom: 6px;
  }
  .pf-field-value {
    font-size: 0.95rem; color: #c8d8ee; font-weight: 400;
    padding: 10px 14px;
    background: rgba(255,255,255,0.04);
    border: 1px solid rgba(255,255,255,0.07);
    border-radius: 12px;
    transition: all 0.2s;
  }
  .pf-field-input {
    width: 100%; font-size: 0.95rem; color: #f0f6ff;
    font-family: 'DM Sans', sans-serif; font-weight: 400;
    padding: 10px 14px;
    background: rgba(26,110,255,0.07);
    border: 1px solid rgba(26,110,255,0.35);
    border-radius: 12px;
    outline: none; transition: all 0.2s;
  }
  .pf-field-input:focus {
    border-color: rgba(26,110,255,0.7);
    background: rgba(26,110,255,0.1);
    box-shadow: 0 0 0 3px rgba(26,110,255,0.12);
  }

  /* two col inside card */
  .pf-field-row { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }

  /* ── activity list ── */
  .pf-activity { display: flex; flex-direction: column; gap: 12px; }
  .pf-activity-item {
    display: flex; align-items: center; gap: 14px;
    padding: 14px 16px;
    background: rgba(255,255,255,0.03);
    border: 1px solid rgba(255,255,255,0.06);
    border-radius: 14px;
    transition: all 0.2s;
  }
  .pf-activity-item:hover {
    background: rgba(26,110,255,0.06);
    border-color: rgba(26,110,255,0.15);
  }
  .pf-activity-icon {
    width: 38px; height: 38px; border-radius: 11px; flex-shrink: 0;
    display: flex; align-items: center; justify-content: center;
    font-size: 1rem;
  }
  .pf-activity-icon.blue { background: rgba(26,110,255,0.12); border: 1px solid rgba(26,110,255,0.2); }
  .pf-activity-icon.green { background: rgba(0,232,135,0.1); border: 1px solid rgba(0,232,135,0.2); }
  .pf-activity-icon.gold  { background: rgba(255,185,50,0.1); border: 1px solid rgba(255,185,50,0.2); }
  .pf-activity-info { flex: 1; }
  .pf-activity-name { font-size: 0.88rem; color: #c8d8ee; font-weight: 500; }
  .pf-activity-date { font-size: 0.72rem; color: #6b8baa; margin-top: 2px; }
  .pf-activity-amount { font-family: 'Syne', sans-serif; font-size: 0.95rem; font-weight: 700; color: #f0f6ff; }

  /* ── progress bar ── */
  .pf-progress-wrap { margin-bottom: 6px; }
  .pf-progress-label { display: flex; justify-content: space-between; margin-bottom: 6px; font-size: 0.8rem; color: #6b8baa; }
  .pf-progress-label span:last-child { color: #5599ff; }
  .pf-progress-track {
    height: 6px; border-radius: 100px;
    background: rgba(255,255,255,0.06);
    overflow: hidden;
  }
  .pf-progress-fill {
    height: 100%; border-radius: 100px;
    background: linear-gradient(90deg, #1a6eff, #00d4ff);
    animation: barGrow 1s ease both;
    transform-origin: left;
  }
  @keyframes barGrow { from { transform: scaleX(0); } to { transform: scaleX(1); } }

  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(20px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  .pf-card:nth-child(1) { animation-delay: 0.05s; }
  .pf-card:nth-child(2) { animation-delay: 0.1s; }
  .pf-card:nth-child(3) { animation-delay: 0.15s; }
  .pf-card:nth-child(4) { animation-delay: 0.2s; }

  @media (max-width: 700px) {
    .pf-hero { flex-direction: column; text-align: center; }
    .pf-stats { margin-left: 0; justify-content: center; }
    .pf-hero-tags { justify-content: center; }
    .pf-grid { grid-template-columns: 1fr; }
    .pf-card.full { grid-column: auto; }
    .pf-field-row { grid-template-columns: 1fr; }
  }
`;

const INITIAL_DATA = {
  nome: "João Silva",
  email: "joao@takecab.pt",
  nif: "234 567 890",
  genero: "Masculino",
  data_nascimento: "12 / 03 / 1990",
  morada: "Rua das Flores, 47, 2.º Esq.",
  codigo_postal: "1200-192 Lisboa",
  telefone: "+351 912 345 678",
};

export default function Profile() {
  const [editing, setEditing] = useState(false);
  const [data, setData] = useState(INITIAL_DATA);
  const [draft, setDraft] = useState(INITIAL_DATA);

  function startEdit() {
    setDraft({ ...data });
    setEditing(true);
  }
  function saveEdit() {
    setData({ ...draft });
    setEditing(false);
  }
  function cancelEdit() {
    setEditing(false);
  }

  function Field({ label, field, fullWidth }) {
    return (
      <div className={`pf-field${fullWidth ? " pf-field-full" : ""}`}>
        <div className="pf-field-label">{label}</div>
        {editing ? (
          <input
            className="pf-field-input"
            value={draft[field]}
            onChange={(e) =>
              setDraft((d) => ({ ...d, [field]: e.target.value }))
            }
          />
        ) : (
          <div className="pf-field-value">{data[field]}</div>
        )}
      </div>
    );
  }

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
      <style>{STYLES}</style>
      <div className="pf-root">
        <div className="pf-bg">
          <div className="pf-bg-blob" />
          <div className="pf-bg-blob" />
        </div>

        <div className="pf-container">
          <div className="pf-page-title">O meu perfil</div>

          {/* ── HERO ── */}
          <div className="pf-hero">
            <div className="pf-avatar-wrap">
              <div className="pf-avatar-ring">
                <div className="pf-avatar-inner">
                  <img
                    src="https://api.dicebear.com/7.x/thumbs/svg?seed=Joao"
                    alt="Avatar"
                  />
                </div>
              </div>
              <span className="pf-avatar-badge" />
            </div>

            <div className="pf-hero-info">
              <div className="pf-hero-name">{data.nome}</div>
              <div className="pf-hero-email">{data.email}</div>
              <div className="pf-hero-tags">
                <span className="pf-tag green">● Ativo</span>
                <span className="pf-tag">🛡 Verificado</span>
              </div>
              {editing ? (
                <div style={{ display: "flex", gap: 10, marginTop: 14 }}>
                  <button className="pf-edit-btn save" onClick={saveEdit}>
                    💾 Guardar
                  </button>
                  <button className="pf-edit-btn" onClick={cancelEdit}>
                    Cancelar
                  </button>
                </div>
              ) : (
                <button className="pf-edit-btn" onClick={startEdit}>
                  ✏️ Editar perfil
                </button>
              )}
            </div>

            <div className="pf-stats">
              <div>
                <div className="pf-stat-val">47</div>
                <div className="pf-stat-label">Viagens</div>
              </div>
              <div>
                <div className="pf-stat-val">
                  4.<span>9</span>
                </div>
                <div className="pf-stat-label">Avaliação</div>
              </div>
            </div>
          </div>

          {/* ── GRID ── */}
          <div className="pf-grid">
            {/* Dados Pessoais */}
            <div className="pf-card">
              <div className="pf-card-title">
                <span className="pf-card-title-icon">👤</span>
                Dados Pessoais
              </div>
              <Field label="Nome completo" field="nome" />
              <Field label="NIF" field="nif" />
              <div className="pf-field-row">
                <Field label="Género" field="genero" />
                <Field label="Data de nascimento" field="data_nascimento" />
              </div>
            </div>

            {/* Contacto */}
            <div className="pf-card">
              <div className="pf-card-title">
                <span className="pf-card-title-icon">📱</span>
                Contacto &amp; Morada
              </div>
              <Field label="Email" field="email" />
              <Field label="Telemóvel" field="telefone" />
              <Field label="Morada" field="morada" />
              <Field label="Código postal" field="codigo_postal" />
            </div>

            {/* Atividade Recente */}
            <div className="pf-card">
              <div className="pf-card-title">
                <span className="pf-card-title-icon">🕐</span>
                Atividade Recente
              </div>
              <div className="pf-activity">
                {activity.map((a, i) => (
                  <div className="pf-activity-item" key={i}>
                    <div className={`pf-activity-icon ${a.color}`}>
                      {a.icon}
                    </div>
                    <div className="pf-activity-info">
                      <div className="pf-activity-name">{a.name}</div>
                      <div className="pf-activity-date">{a.date}</div>
                    </div>
                    <div className="pf-activity-amount">{a.amount}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
