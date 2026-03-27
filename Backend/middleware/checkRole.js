const jwt = require('jsonwebtoken')

module.exports = (...roles) => (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1]
  if (!token) return res.status(401).json({ message: 'Não autenticado.' })

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET)
    if (!roles.includes(payload.role)) {
      return res.status(403).json({ message: 'Sem permissão.' })
    }
    req.user = payload
    next()
  } catch {
    res.status(401).json({ message: 'Token inválido.' })
  }
}