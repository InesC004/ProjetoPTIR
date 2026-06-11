import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import PropTypes from "prop-types";
import {
  User,
  Mail,
  Hash,
  CreditCard,
  Calendar,
  MapPin,
  ArrowLeft,
} from "lucide-react";
import "../css/perfilMotorista.css";

export default function PerfilMotorista() {
  const navigate = useNavigate();
  const [motorista, setMotorista] = useState(null);

  useEffect(() => {
    const dadosGuardados = localStorage.getItem("motorista");

    if (dadosGuardados) {
      setMotorista(JSON.parse(dadosGuardados));
    } else {
      navigate("/");
    }
  }, [navigate]);

  if (!motorista) {
    return (
      <div className="perfil-pagina">
        <p>A carregar perfil do motorista...</p>
      </div>
    );
  }

  return (
    <div className="perfil-pagina">
      <button
        className="perfil-voltar"
        onClick={() => navigate("/motorista/PaginaMotorista")}
      >
        <ArrowLeft size={18} />
        Voltar
      </button>

      <div className="perfil-card">
        <div className="perfil-topo">
          <div className="perfil-avatar">
            {motorista.nome?.charAt(0)?.toUpperCase() || "M"}
          </div>

          <div>
            <h1>{motorista.nome || "Motorista"}</h1>
            <p className="perfil-subtitulo">Perfil do Motorista</p>
          </div>
        </div>

        <div className="perfil-info">
          <Info
            icon={<Mail size={18} />}
            label="Email"
            value={motorista.email}
          />
          <Info icon={<Hash size={18} />} label="NIF" value={motorista.nif} />
          <Info
            icon={<CreditCard size={18} />}
            label="Nº Carta"
            value={motorista.numero_carta}
          />
          <Info
            icon={<User size={18} />}
            label="Género"
            value={motorista.genero}
          />
          <Info
            icon={<Calendar size={18} />}
            label="Data nascimento"
            value={
              motorista.data_nascimento
                ? new Date(motorista.data_nascimento).toLocaleDateString(
                    "pt-PT",
                  )
                : null
            }
          />
          <Info
            icon={<MapPin size={18} />}
            label="Morada"
            value={motorista.morada}
          />
          <Info
            icon={<MapPin size={18} />}
            label="Código Postal"
            value={motorista.codigo_postal}
          />
        </div>
      </div>
    </div>
  );
}

function Info({ icon, label, value }) {
  return (
    <div className="perfil-info-item">
      <span className="perfil-info-icon">{icon}</span>
      <div>
        <span>{label}</span>
        <strong>{value || "Não definido"}</strong>
      </div>
    </div>
  );
}

Info.propTypes = {
  icon: PropTypes.node.isRequired,
  label: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
};
