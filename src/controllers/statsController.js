const Photo = require('../models/Photo');

const statsController = {
  async getStats(req, res) {
    try {
      const userId = req.user._id;

      const photos = await Photo.find({ author: userId });

      const stats = photos.map((photo) => ({
        id: photo._id,
        title: photo.title,
        acessos: photo.acessos,
      }));

      res.json(stats);
    } catch (error) {
      console.error('Erro ao obter estatísticas:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  },
};

module.exports = statsController;
