// Backend/tests/precos_api.test.js
const request = require('supertest')
const app = require('../app')
const Preco = require('../models/preco')

describe('Preços API', () => {
  let token = 'seu_token_jwt_aqui'
  let precoId

  // Listar preços
  test('GET /api/precos - listar todos', async () => {
    const res = await request(app).get('/api/precos')
    expect(res.status).toBe(200)
    expect(Array.isArray(res.body)).toBe(true)
  })

  // Criar preço
  test('POST /api/precos - criar novo', async () => {
    const res = await request(app)
      .post('/api/precos')
      .set('Authorization', `Bearer ${token}`)
      .send({
        nivel_conforto: 'basico',
        preco_minuto: 0.5,
        acrescimo_noturno: 0.1
      })

    expect(res.status).toBe(201)
    expect(res.body.nivel_conforto).toBe('basico')
    precoId = res.body._id
  })

  // Obter preço
  test('GET /api/precos/:id - obter um', async () => {
    const res = await request(app).get(`/api/precos/${precoId}`)
    expect(res.status).toBe(200)
    expect(res.body._id).toBe(precoId)
  })

  // Atualizar preço
  test('PUT /api/precos/:id - atualizar', async () => {
    const res = await request(app)
      .put(`/api/precos/${precoId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ preco_minuto: 0.6 })

    expect(res.status).toBe(200)
    expect(res.body.preco_minuto).toBe(0.6)
  })

  // Deletar preço
  test('DELETE /api/precos/:id - deletar', async () => {
    const res = await request(app)
      .delete(`/api/precos/${precoId}`)
      .set('Authorization', `Bearer ${token}`)

    expect(res.status).toBe(204)
  })
})