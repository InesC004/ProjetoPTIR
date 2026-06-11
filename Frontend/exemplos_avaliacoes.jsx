// Frontend - Exemplos de Integração com o Sistema de Avaliações

// ========================================
// 1. Serviço de Avaliações (API Helper)
// ========================================

const API_BASE = 'http://localhost:8080/api'

export const avaliacoesService = {
  // Adicionar avaliação a uma viagem
  avaliarMotorista: async (viagemId, nota, comentario, token) => {
    try {
      const response = await fetch(`${API_BASE}/viagens/${viagemId}/avaliar`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          nota: parseInt(nota),
          comentario: comentario || ''
        })
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`)
      }

      return await response.json()
    } catch (error) {
      console.error('Erro ao avaliar motorista:', error)
      throw error
    }
  },

  // Obter avaliações de um motorista
  getAvaliacoesMotorita: async (motoristaId) => {
    try {
      const response = await fetch(`${API_BASE}/motoristas/${motoristaId}/avaliacoes`)

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`)
      }

      return await response.json()
    } catch (error) {
      console.error('Erro ao obter avaliações:', error)
      throw error
    }
  },

  // Obter detalhes de uma viagem com avaliação
  getViagem: async (viagemId) => {
    try {
      const response = await fetch(`${API_BASE}/viagens/${viagemId}`)

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`)
      }

      return await response.json()
    } catch (error) {
      console.error('Erro ao obter viagem:', error)
      throw error
    }
  }
}

// ========================================
// 2. Componente React para Avaliar
// ========================================

import React, { useState } from 'react'
import { avaliacoesService } from './avaliacoesService'

export function AvaliarMotoristaModal({ viagemId, motorista, token, onClose, onSuccess }) {
  const [nota, setNota] = useState(5)
  const [comentario, setComentario] = useState('')
  const [loading, setLoading] = useState(false)
  const [erro, setErro] = useState(null)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setErro(null)

    try {
      const resultado = await avaliacoesService.avaliarMotorista(
        viagemId,
        nota,
        comentario,
        token
      )

      if (resultado.success) {
        alert('Motorista avaliado com sucesso!')
        if (onSuccess) {
          onSuccess(resultado)
        }
        onClose()
      } else {
        setErro(resultado.message || 'Erro ao avaliar')
      }
    } catch (error) {
      setErro(error.message || 'Erro de conexão')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>Avaliar Motorista</h2>
        <p>Motorista: {motorista?.nome}</p>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Nota (1-5 estrelas):</label>
            <div className="stars-rating">
              {[1, 2, 3, 4, 5].map((star) => (
                <span
                  key={star}
                  className={`star ${nota >= star ? 'active' : ''}`}
                  onClick={() => setNota(star)}
                >
                  ⭐
                </span>
              ))}
            </div>
            <p className="nota-valor">{nota}/5</p>
          </div>

          <div className="form-group">
            <label>Comentário (opcional):</label>
            <textarea
              value={comentario}
              onChange={(e) => setComentario(e.target.value)}
              placeholder="Partilhe sua experiência..."
              maxLength={500}
              rows={4}
            />
            <small>{comentario.length}/500</small>
          </div>

          {erro && <div className="erro">{erro}</div>}

          <div className="botoes">
            <button type="button" onClick={onClose} disabled={loading}>
              Cancelar
            </button>
            <button type="submit" disabled={loading}>
              {loading ? 'A enviar...' : 'Enviar Avaliação'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ========================================
// 3. Componente para Exibir Avaliações
// ========================================

export function AvaliacoesMotorita({ motoristaId }) {
  const [dados, setDados] = React.useState(null)
  const [loading, setLoading] = React.useState(true)
  const [erro, setErro] = React.useState(null)

  React.useEffect(() => {
    carregarAvaliacoes()
  }, [motoristaId])

  const carregarAvaliacoes = async () => {
    try {
      setLoading(true)
      const resultado = await avaliacoesService.getAvaliacoesMotorita(motoristaId)
      setDados(resultado)
    } catch (error) {
      setErro(error.message)
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <div>Carregando...</div>
  if (erro) return <div className="erro">{erro}</div>
  if (!dados) return <div>Sem dados</div>

  const { motorista, avaliacoes } = dados

  return (
    <div className="avaliacoes-container">
      <div className="motorista-info">
        <h3>{motorista.nome}</h3>
        <div className="rating-summary">
          <div className="media">
            <strong>{motorista.avaliacao_media.toFixed(1)}</strong>
            <span>/5</span>
          </div>
          <div className="total">
            <span>{motorista.total_avaliacoes} avaliações</span>
          </div>
        </div>
      </div>

      <div className="avaliacoes-list">
        {avaliacoes.length === 0 ? (
          <p>Nenhuma avaliação ainda</p>
        ) : (
          avaliacoes.map((avaliacao) => (
            <div key={avaliacao._id} className="avaliacao-item">
              <div className="header">
                <strong>{avaliacao.cliente_nome}</strong>
                <div className="stars">
                  {'⭐'.repeat(avaliacao.nota)}
                </div>
              </div>
              {avaliacao.comentario && (
                <p className="comentario">{avaliacao.comentario}</p>
              )}
              <small className="data">
                {new Date(avaliacao.data).toLocaleDateString('pt-PT')}
              </small>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

// ========================================
// 4. Página de Viagens Concluídas
// ========================================

export function ViagensConcluidasPage({ clienteToken }) {
  const [viagens, setViagens] = React.useState([])
  const [selectedViagem, setSelectedViagem] = React.useState(null)
  const [mostraModal, setMostraModal] = React.useState(false)

  React.useEffect(() => {
    carregarViagens()
  }, [])

  const carregarViagens = async () => {
    try {
      const response = await fetch('http://localhost:8080/api/viagens', {
        headers: {
          'Authorization': `Bearer ${clienteToken}`
        }
      })
      const data = await response.json()
      // Filtrar apenas viagens concluídas sem avaliação
      const viagensPendentes = data.viagens.filter(
        v => v.estado === 'concluida' && !v.avaliacao_motorista?.nota
      )
      setViagens(viagensPendentes)
    } catch (error) {
      console.error('Erro ao carregar viagens:', error)
    }
  }

  const handleAvaliar = (viagem) => {
    setSelectedViagem(viagem)
    setMostraModal(true)
  }

  const handleSucesso = () => {
    carregarViagens() // Recarregar lista
  }

  return (
    <div className="viagens-page">
      <h2>Minhas Viagens Concluídas</h2>

      {viagens.length === 0 ? (
        <p>Nenhuma viagem pendente de avaliação</p>
      ) : (
        <div className="viagens-list">
          {viagens.map((viagem) => (
            <div key={viagem._id} className="viagem-card">
              <div className="info">
                <h4>
                  {viagem.origem_morada} → {viagem.destino_morada}
                </h4>
                <p>Motorista: {viagem.motorista_id?.nome}</p>
                <p>Preço: €{viagem.preco_total?.toFixed(2)}</p>
              </div>
              <button onClick={() => handleAvaliar(viagem)}>
                Avaliar Motorista
              </button>
            </div>
          ))}
        </div>
      )}

      {mostraModal && selectedViagem && (
        <AvaliarMotoristaModal
          viagemId={selectedViagem._id}
          motorista={selectedViagem.motorista_id}
          token={clienteToken}
          onClose={() => setMostraModal(false)}
          onSuccess={handleSucesso}
        />
      )}
    </div>
  )
}

// ========================================
// 5. Exemplo de CSS
// ========================================

/* Estilos para os componentes de avaliação */

const styles = `
  .stars-rating {
    display: flex;
    gap: 10px;
    font-size: 30px;
  }

  .star {
    cursor: pointer;
    opacity: 0.3;
    transition: opacity 0.2s;
  }

  .star.active {
    opacity: 1;
  }

  .star:hover {
    opacity: 0.6;
  }

  .modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
  }

  .modal-content {
    background: white;
    padding: 30px;
    border-radius: 8px;
    max-width: 500px;
    width: 100%;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  }

  .form-group {
    margin-bottom: 20px;
  }

  .form-group label {
    display: block;
    margin-bottom: 8px;
    font-weight: bold;
  }

  .form-group textarea {
    width: 100%;
    padding: 8px;
    border: 1px solid #ddd;
    border-radius: 4px;
    font-family: Arial, sans-serif;
  }

  .botoes {
    display: flex;
    gap: 10px;
    justify-content: flex-end;
  }

  .botoes button {
    padding: 10px 20px;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-weight: bold;
  }

  .botoes button[type="submit"] {
    background: #007bff;
    color: white;
  }

  .botoes button[type="button"] {
    background: #6c757d;
    color: white;
  }

  .botoes button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .erro {
    background: #f8d7da;
    color: #721c24;
    padding: 12px;
    border-radius: 4px;
    margin-bottom: 15px;
  }

  .avaliacoes-list {
    max-height: 400px;
    overflow-y: auto;
  }

  .avaliacao-item {
    border-bottom: 1px solid #eee;
    padding: 15px 0;
  }

  .avaliacao-item:last-child {
    border-bottom: none;
  }

  .avaliacao-item .header {
    display: flex;
    justify-content: space-between;
    margin-bottom: 8px;
  }

  .avaliacao-item .comentario {
    color: #666;
    margin: 8px 0;
  }

  .viagem-card {
    display: flex;
    justify-content: space-between;
    align-items: center;
    border: 1px solid #ddd;
    padding: 15px;
    margin-bottom: 10px;
    border-radius: 4px;
  }

  .viagem-card button {
    background: #28a745;
    color: white;
    border: none;
    padding: 8px 16px;
    border-radius: 4px;
    cursor: pointer;
  }

  .viagem-card button:hover {
    background: #218838;
  }
`
