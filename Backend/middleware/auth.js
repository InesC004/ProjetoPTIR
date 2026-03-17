const { expressjwt: jwt } = require('express-jwt')
const jwksRsa = require('jwks-rsa')

const auth = jwt({
  secret: jwksRsa.expressJwtSecret({
    cache: true,
    rateLimit: true,
    jwksRequestsPerMinute: 5,
    jwksUri: 'https://SEU-DOMINIO-AUTH0/.well-known/jwks.json'
  }),
  audience: 'SUA-AUDIENCE',
  issuer: 'https://SEU-DOMINIO-AUTH0/',
  algorithms: ['RS256']
})

module.exports = auth