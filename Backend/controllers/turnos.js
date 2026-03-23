const Turno = require ('../models/turno');

exports.iniciarTurno = async (req, res) => {
  try {
    const {id_turno, motorista_nif, taxi_matricula, data_fim, data_inicio}  = req.body;

    if(!motorista_nif || !taxi_matricula || !id_turno || !data_fim || !data_inicio) {
      return res.status(400).json({ error: 'Faltam dados' });
    }

    const turno = new Turno({id_turno, motorista_nif, taxi_matricula, data_inicio, data_fim});

    
    //guarda o objeto
    await turno.save();

    res.status(201).json({
      mensagem: 'Turno criado !',turno})
  } catch (error) {
    // Se o id_turno for repetido
    if (error.code === 11000) {
      return res.status(400).json({ error: 'Esse id_turno já existe na base de dados!' });
    }
    res.status(500).json({ error: error.message });
  }
};

