// Backend/testes/avaliacoes.test.js
// Script de testes para o sistema de avaliações

const axios = require('axios')

const API = 'http://localhost:8080/api'
const TOKEN = process.env.AUTH_TOKEN || 'seu_token_aqui'

// Cores para terminal
const cores = {
  reset: '\x1b[0m',
  verde: '\x1b[32m',
  vermelho: '\x1b[31m',
  amarelo: '\x1b[33m',
  azul: '\x1b[34m'
}

function log(msg, cor = 'reset') {
  console.log(`${cores[cor]}${msg}${cores.reset}`)
}

function sucesso(msg) {
  log(`✓ ${msg}`, 'verde')
}

function erro(msg) {
  log(`✗ ${msg}`, 'vermelho')
}

function info(msg) {
  log(`ℹ ${msg}`, 'azul')
}

function aviso(msg) {
  log(`⚠ ${msg}`, 'amarelo')
}

// ========================================
// TESTES
// ========================================

const testes = {
  async teste1_obterViagens() {
    info('Teste 1: Obter todas as viagens')
    try {
      const response = await axios.get(`${API}/viagens`)
      sucesso(`Viagens obtidas: ${response.data.viagens.length}`)
      
      // Encontrar uma viagem concluída
      const viagemConcluida = response.data.viagens.find(v => v.estado === 'concluida')
      if (viagemConcluida) {
        sucesso(`Viagem concluída encontrada: ${viagemConcluida._id}`)
        return viagemConcluida
      } else {
        aviso('Nenhuma viagem concluída encontrada para testar avaliação')
        return null
      }
    } catch (err) {
      erro(`Erro: ${err.response?.data?.message || err.message}`)
      return null
    }
  },

  async teste2_avaliarMotorista(viagemId) {
    info('Teste 2: Avaliar motorista')
    
    if (!viagemId) {
      aviso('ID de viagem não disponível. Pulando teste.')
      return null
    }

    try {
      const response = await axios.put(
        `${API}/viagens/${viagemId}/avaliar`,
        {
          nota: 5,
          comentario: 'Excelente motorista, muito profissional e atencioso!'
        },
        {
          headers: {
            'Authorization': `Bearer ${TOKEN}`,
            'Content-Type': 'application/json'
          }
        }
      )

      if (response.data.success) {
        sucesso('Motorista avaliado com sucesso!')
        sucesso(`Nova média: ${response.data.motorista.avaliacao_media}`)
        sucesso(`Total de avaliações: ${response.data.motorista.total_avaliacoes}`)
        return response.data.motorista
      } else {
        erro(`Erro: ${response.data.message}`)
        return null
      }
    } catch (err) {
      erro(`Erro ao avaliar: ${err.response?.data?.message || err.message}`)
      return null
    }
  },

  async teste3_obterAvaliacoesMotorita(motoristaId) {
    info('Teste 3: Obter avaliações de um motorista')
    
    if (!motoristaId) {
      aviso('ID de motorista não disponível. Pulando teste.')
      return null
    }

    try {
      const response = await axios.get(
        `${API}/motoristas/${motoristaId}/avaliacoes`
      )

      if (response.data.success) {
        sucesso('Avaliações obtidas com sucesso!')
        info(`Motorista: ${response.data.motorista.nome}`)
        info(`Média: ${response.data.motorista.avaliacao_media}/5`)
        info(`Total: ${response.data.motorista.total_avaliacoes} avaliações`)
        
        if (response.data.avaliacoes.length > 0) {
          info('Avaliações recentes:')
          response.data.avaliacoes.slice(0, 3).forEach(av => {
            log(`  - ${av.cliente_nome}: ${av.nota}⭐ - "${av.comentario}"`)
          })
        } else {
          aviso('Nenhuma avaliação ainda')
        }
        return response.data
      } else {
        erro(`Erro: ${response.data.message}`)
        return null
      }
    } catch (err) {
      erro(`Erro ao obter avaliações: ${err.response?.data?.message || err.message}`)
      return null
    }
  },

  async teste4_validacoes() {
    info('Teste 4: Validações de entrada')
    
    aviso('Este teste verifica se o servidor rejeita dados inválidos')
    
    const viagens = await axios.get(`${API}/viagens`)
    const viagem = viagens.data.viagens.find(v => v.estado === 'concluida')
    
    if (!viagem) {
      aviso('Nenhuma viagem concluída para testar validações')
      return
    }

    // Teste 1: Nota inválida (fora do intervalo)
    info('  - Testando nota fora do intervalo (0)...')
    try {
      await axios.put(
        `${API}/viagens/${viagem._id}/avaliar`,
        { nota: 0 },
        { headers: { 'Authorization': `Bearer ${TOKEN}` } }
      )
      erro('Servidor deveria rejeitar nota 0')
    } catch (err) {
      if (err.response?.status === 400) {
        sucesso('Servidor rejeitou nota 0 corretamente')
      }
    }

    // Teste 2: Comentário muito longo
    info('  - Testando comentário muito longo...')
    const comentarioLongo = 'a'.repeat(501)
    try {
      await axios.put(
        `${API}/viagens/${viagem._id}/avaliar`,
        { nota: 3, comentario: comentarioLongo },
        { headers: { 'Authorization': `Bearer ${TOKEN}` } }
      )
      erro('Servidor deveria rejeitar comentário com >500 caracteres')
    } catch (err) {
      if (err.response?.status === 400) {
        sucesso('Servidor rejeitou comentário muito longo corretamente')
      }
    }

    // Teste 3: ID de viagem inválido
    info('  - Testando ID de viagem inválido...')
    try {
      await axios.put(
        `${API}/viagens/id_invalido/avaliar`,
        { nota: 5 },
        { headers: { 'Authorization': `Bearer ${TOKEN}` } }
      )
      erro('Servidor deveria rejeitar ID inválido')
    } catch (err) {
      if (err.response?.status === 404 || err.response?.status === 400) {
        sucesso('Servidor rejeitou ID inválido corretamente')
      }
    }
  },

  async teste5_fluxoCompleto() {
    info('Teste 5: Fluxo completo de avaliação')
    
    try {
      // 1. Obter viagens
      info('  1. Obtendo viagens...')
      const viagensResp = await axios.get(`${API}/viagens`)
      const viagem = viagensResp.data.viagens.find(v => v.estado === 'concluida')
      
      if (!viagem) {
        aviso('Nenhuma viagem concluída disponível')
        return
      }

      info(`  2. Viagem encontrada: ${viagem._id}`)
      info(`     Origem: ${viagem.origem_morada}`)
      info(`     Destino: ${viagem.destino_morada}`)
      info(`     Motorista: ${viagem.motorista_id?.nome}`)
      info(`     Preço: €${viagem.preco_total}`)

      // 2. Verificar se já tem avaliação
      if (viagem.avaliacao_motorista?.nota) {
        aviso(`  3. Esta viagem já tem avaliação: ${viagem.avaliacao_motorista.nota}⭐`)
        return
      }

      // 3. Avaliar
      info('  3. Enviando avaliação...')
      const avaliacaoResp = await axios.put(
        `${API}/viagens/${viagem._id}/avaliar`,
        {
          nota: 4,
          comentario: 'Teste automático - boa experiência'
        },
        {
          headers: {
            'Authorization': `Bearer ${TOKEN}`
          }
        }
      )

      if (avaliacaoResp.data.success) {
        sucesso(`  4. Avaliação registada!`)
        info(`     Nota: ${avaliacaoResp.data.avaliacao.nota}⭐`)
        info(`     Nova média do motorista: ${avaliacaoResp.data.motorista.avaliacao_media}`)

        // 4. Obter avaliações do motorista
        info('  5. Obtendo avaliações do motorista...')
        const avaliacoesResp = await axios.get(
          `${API}/motoristas/${viagem.motorista_id._id}/avaliacoes`
        )

        sucesso(`  6. Total de avaliações: ${avaliacoesResp.data.total}`)
      }
    } catch (err) {
      erro(`Erro no fluxo completo: ${err.response?.data?.message || err.message}`)
    }
  }
}

// ========================================
// EXECUTAR TESTES
// ========================================

async function executarTestes() {
  console.clear()
  log('╔════════════════════════════════════════╗', 'azul')
  log('║  TESTES - SISTEMA DE AVALIAÇÕES      ║', 'azul')
  log('╚════════════════════════════════════════╝', 'azul')
  console.log()

  // Verificar token
  if (TOKEN === 'seu_token_aqui') {
    aviso('Token não configurado. Use: export AUTH_TOKEN="seu_token_jwt"')
    aviso('Alguns testes que requerem autenticação falharão.')
  }

  console.log()

  try {
    // Teste 1
    const viagem = await testes.teste1_obterViagens()
    console.log()

    // Teste 2
    if (viagem) {
      const motorista = await testes.teste2_avaliarMotorista(viagem._id)
      console.log()

      // Teste 3
      if (motorista) {
        await testes.teste3_obterAvaliacoesMotorita(motorista._id)
      }
    }
    console.log()

    // Teste 4
    await testes.teste4_validacoes()
    console.log()

    // Teste 5
    await testes.teste5_fluxoCompleto()

  } catch (err) {
    erro(`Erro geral: ${err.message}`)
  }

  console.log()
  log('╔════════════════════════════════════════╗', 'azul')
  log('║  TESTES CONCLUÍDOS                   ║', 'azul')
  log('╚════════════════════════════════════════╝', 'azul')
}

// Executar se for script principal
if (require.main === module) {
  executarTestes().catch(console.error)
}

module.exports = testes
