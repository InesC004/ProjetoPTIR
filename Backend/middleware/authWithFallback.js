// middleware/authWithFallback.js
// Middleware de autenticação com fallback para desenvolvimento

const authCheck = (req, res, next) => {
  try {
    // Tentar extrair ID de diferentes fontes possíveis
    
    // 1. Verificar se já existe req.user (de middleware anterior)
    if (req.user) {
      // Auth0 usa 'sub' como claim principal
      req.user.id = req.user.id || req.user.sub || req.user.email || null
      
      if (req.user.id) {
        console.log(`[AUTH] User autenticado: ${req.user.id}`)
        return next()
      }
    }
    
    // 2. Verificar se há um token Bearer no header
    const authHeader = req.headers.authorization
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7)
      
      // Decodificar o token (sem verificação para desenvolvimento)
      try {
        const decoded = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString())
        req.user = {
          id: decoded.sub || decoded.user_id || decoded.id,
          email: decoded.email,
          name: decoded.name || decoded.username
        }
        console.log(`[AUTH] User autenticado via token: ${req.user.id}`)
        return next()
      } catch (tokenErr) {
        console.error('[AUTH] Erro ao decodificar token:', tokenErr.message)
      }
    }
    
    // 3. Fallback: permitir em desenvolvimento
    if (process.env.NODE_ENV === 'development') {
      console.warn('[AUTH] Modo desenvolvimento: autenticação desabilitada')
      req.user = {
        id: req.headers['x-user-id'] || 'dev-user-id',
        email: req.headers['x-user-email'] || 'dev@example.com',
        name: 'Dev User'
      }
      return next()
    }
    
    // Nenhum método funcionou
    return res.status(401).json({
      success: false,
      message: 'Não autenticado. Envie um token JWT no header Authorization.'
    })
    
  } catch (error) {
    console.error('[AUTH] Erro na autenticação:', error)
    return res.status(401).json({
      success: false,
      message: 'Erro na autenticação.'
    })
  }
}

module.exports = authCheck
