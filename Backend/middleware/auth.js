const { auth } = require('express-oauth2-jwt-bearer')

const jwtCheck = auth({
  audience: 'https://takeacab-api',
  issuerBaseURL: 'https://dev-wgz277zrovymotmr.us.auth0.com/',
  tokenSigningAlg: 'RS256'
})

module.exports = jwtCheck