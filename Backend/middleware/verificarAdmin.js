
//verifica se é admin para criar Turnos
const verificarAdmin = (req, res, next) => {
  const permissoes = req.auth?.payload?.permissions || [];

  // Verificamos se dentro do token vem a permissão de admin
  if (permissoes.includes('admin') || permissoes.includes('write:turnos')) {
    next(); //  Deixa passar para o Controller.
  } else {
    res.status(403).json({ error: 'Acesso negado. Apenas administradores podem criar turnos.' });
  }
};

module.exports = verificarAdmin;
