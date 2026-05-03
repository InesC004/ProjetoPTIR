/* eslint-disable react/prop-types */
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  User,
  Mail,
  Hash,
  Calendar,
  MapPin,
  ArrowLeft,
  ShieldCheck,
} from "lucide-react";
import api from "../Api";
import "../css/profile.css";
import Header from "../components/Header2";

function formatDate(isoString) {
  if (!isoString) return "—";
  const d = new Date(isoString);
  if (isNaN(d.getTime())) return isoString;
  return d.toLocaleDateString("pt-PT");
}

function Field({ icon, label, field, data }) {
  const value =
    field === "data_nascimento"
      ? formatDate(data?.[field])
      : data?.[field] || "—";

  return (
    <div className="perfil-campo">
      <div className="perfil-campo-icon">{icon}</div>
      <div>
        <div className="perfil-campo-label">{label}</div>
        <div className="perfil-campo-valor">{value}</div>
      </div>
    </div>
  );
}

export default function Profile() {
  const navigate = useNavigate();
  const [data, setData] = useState(null);

  useEffect(() => {
    async function fetchPerfil() {
      const resposta = await api.clientes.obterPerfil();
      setData(resposta.cliente || resposta);
    }

    fetchPerfil();
  }, []);

  if (!data) return <div className="perfil-pagina">A carregar...</div>;

  return (
    <>
      <Header isDashboard />
      <div className="perfil-pagina">
        <button className="perfil-voltar" onClick={() => navigate(-1)}>
          <ArrowLeft size={18} />
          Voltar
        </button>

        <main className="perfil-shell">
          <section className="perfil-hero">
            <div className="perfil-avatar">
              {data.nome?.charAt(0)?.toUpperCase() || "U"}
            </div>

            <div>
              <span className="perfil-kicker">O meu perfil</span>
              <h1>{data.nome}</h1>
              <p>{data.email}</p>
            </div>

            <div className="perfil-badge">
              <ShieldCheck size={16} />
              Cliente verificado
            </div>
          </section>

          <section className="perfil-grid">
            <div className="perfil-card">
              <div className="perfil-card-header">
                <div className="perfil-card-icon green">
                  <User size={20} />
                </div>
                <div>
                  <h2>Dados pessoais</h2>
                  <p>Informação principal da conta</p>
                </div>
              </div>

              <div className="perfil-lista">
                <Field icon={<User size={18} />} label="Nome" field="nome" data={data} />
                <Field icon={<Hash size={18} />} label="NIF" field="nif" data={data} />
                <Field icon={<User size={18} />} label="Género" field="genero" data={data} />
                <Field icon={<Calendar size={18} />} label="Nascimento" field="data_nascimento" data={data} />
              </div>
            </div>

            <div className="perfil-card">
              <div className="perfil-card-header">
                <div className="perfil-card-icon blue">
                  <Mail size={20} />
                </div>
                <div>
                  <h2>Contacto</h2>
                  <p>Dados usados para comunicação</p>
                </div>
              </div>

              <div className="perfil-lista">
                <Field icon={<Mail size={18} />} label="Email" field="email" data={data} />
                <Field icon={<MapPin size={18} />} label="Morada" field="morada" data={data} />
                <Field icon={<MapPin size={18} />} label="Código postal" field="codigo_postal" data={data} />
              </div>
            </div>
          </section>
        </main>
    </div>
    </>
  );
}