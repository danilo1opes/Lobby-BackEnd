const fs = require('fs');
const path = require('path');
const Photo = require('../models/Photo');
const Comment = require('../models/Comment');
const User = require('../models/User');

class PhotoController {
  // Listar fotos
  static async list(req, res) {
    try {
      const _total = parseInt(req.query._total) || 6;
      const _page = parseInt(req.query._page) || 1;
      const _user = req.query._user || null;

      let query = {};

      // Filtrar por usuário se especificado
      if (_user) {
        let userId = _user;

        // Se _user não é um ObjectId, buscar por username
        if (!_user.match(/^[0-9a-fA-F]{24}$/)) {
          const user = await User.findOne({ username: _user });
          if (user) {
            userId = user._id;
          } else {
            return res.json([]);
          }
        }

        query.author = userId;
      }

      const skip = (_page - 1) * _total;

      const photos = await Photo.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(_total)
        .populate('author', 'username nome');

      // Contar comentários para cada foto
      const photosWithComments = await Promise.all(
        photos.map(async (photo) => {
          const totalComments = await Comment.countDocuments({
            comment_post_ID: photo._id,
          });

          return {
            id: photo._id,
            author: photo.author.username,
            title: photo.title,
            date: photo.createdAt,
            src: `${req.protocol}://${req.get('host')}/${photo.src}`,
            peso: photo.peso,
            idade: photo.idade,
            acessos: photo.acessos,
            total_comments: totalComments,
          };
        })
      );

      res.json(photosWithComments);
    } catch (error) {
      console.error('Erro ao listar fotos:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  // Criar nova foto
  static async create(req, res) {
    try {
      const { nome, peso, idade } = req.body;
      const userId = req.user._id;

      if (!req.file) {
        return res.status(400).json({
          error: 'Imagem é obrigatória',
        });
      }

      // Criar nova foto
      const photo = new Photo({
        title: nome,
        author: userId,
        src: req.file.path,
        peso: peso,
        idade: idade,
      });

      await photo.save();

      // Populate do author antes de retornar
      await photo.populate('author', 'username nome');

      res.status(201).json({
        id: photo._id,
        author: photo.author.username,
        title: photo.title,
        date: photo.createdAt,
        src: `${req.protocol}://${req.get('host')}/${photo.src}`,
        peso: photo.peso,
        idade: photo.idade,
        acessos: photo.acessos,
      });
    } catch (error) {
      console.error('Erro ao criar foto:', error);

      // Deletar arquivo se houver erro
      if (req.file && fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }

      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  // Obter foto específica
  static async get(req, res) {
    try {
      const { id } = req.params;

      const photo = await Photo.findById(id).populate(
        'author',
        'username nome'
      );

      if (!photo) {
        return res.status(404).json({
          error: 'Foto não encontrada',
        });
      }

      // Incrementar acessos
      photo.acessos += 1;
      await photo.save();

      // Buscar comentários da foto
      const comments = await Comment.find({ comment_post_ID: id })
        .sort({ comment_date: -1 })
        .populate('comment_author', 'username nome');

      const formattedComments = comments.map((comment) => ({
        comment_ID: comment._id,
        comment_post_ID: comment.comment_post_ID,
        comment_author: comment.comment_author.username,
        comment_content: comment.comment_content,
        comment_date: comment.comment_date,
      }));

      res.json({
        photo: {
          id: photo._id,
          author: photo.author.username,
          title: photo.title,
          date: photo.createdAt,
          src: `${req.protocol}://${req.get('host')}/${photo.src}`,
          peso: photo.peso,
          idade: photo.idade,
          acessos: photo.acessos,
        },
        comments: formattedComments,
      });
    } catch (error) {
      console.error('Erro ao obter foto:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  // Deletar foto
  static async delete(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user._id;

      const photo = await Photo.findById(id);

      if (!photo) {
        return res.status(404).json({
          error: 'Foto não encontrada',
        });
      }

      // Verificar se o usuário é o dono da foto
      if (photo.author.toString() !== userId.toString()) {
        return res.status(403).json({
          error: 'Não autorizado',
        });
      }

      // Deletar arquivo da foto
      const filePath = path.join(process.cwd(), photo.src);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }

      // Deletar comentários da foto
      await Comment.deleteMany({ comment_post_ID: id });

      // Deletar foto do banco
      await Photo.findByIdAndDelete(id);

      res.json({ message: 'Foto deletada com sucesso' });
    } catch (error) {
      console.error('Erro ao deletar foto:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  // Atualizar foto
  static async update(req, res) {
    try {
      const { id } = req.params;
      const { nome, peso, idade } = req.body;
      const userId = req.user._id;

      const photo = await Photo.findById(id);

      if (!photo) {
        return res.status(404).json({
          error: 'Foto não encontrada',
        });
      }

      // Verificar se o usuário é o dono da foto
      if (photo.author.toString() !== userId.toString()) {
        return res.status(403).json({
          error: 'Não autorizado',
        });
      }

      // Atualizar dados
      if (nome) photo.title = nome;
      if (peso) photo.peso = peso;
      if (idade) photo.idade = idade;

      await photo.save();
      await photo.populate('author', 'username nome');

      res.json({
        id: photo._id,
        author: photo.author.username,
        title: photo.title,
        date: photo.createdAt,
        src: `${req.protocol}://${req.get('host')}/${photo.src}`,
        peso: photo.peso,
        idade: photo.idade,
        acessos: photo.acessos,
      });
    } catch (error) {
      console.error('Erro ao atualizar foto:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  // Buscar fotos por termo
  static async search(req, res) {
    try {
      const { q } = req.query;
      const _total = parseInt(req.query._total) || 6;
      const _page = parseInt(req.query._page) || 1;

      if (!q) {
        return res.status(400).json({
          error: 'Termo de busca é obrigatório',
        });
      }

      const skip = (_page - 1) * _total;

      const photos = await Photo.find({
        $or: [
          { title: { $regex: q, $options: 'i' } },
          { peso: { $regex: q, $options: 'i' } },
          { idade: { $regex: q, $options: 'i' } },
        ],
      })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(_total)
        .populate('author', 'username nome');

      const photosWithComments = await Promise.all(
        photos.map(async (photo) => {
          const totalComments = await Comment.countDocuments({
            comment_post_ID: photo._id,
          });

          return {
            id: photo._id,
            author: photo.author.username,
            title: photo.title,
            date: photo.createdAt,
            src: `${req.protocol}://${req.get('host')}/${photo.src}`,
            peso: photo.peso,
            idade: photo.idade,
            acessos: photo.acessos,
            total_comments: totalComments,
          };
        })
      );

      res.json(photosWithComments);
    } catch (error) {
      console.error('Erro na busca:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }
}

module.exports = PhotoController;
