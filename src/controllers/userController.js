const User = require('../models/User');
const Photo = require('../models/Photo');
const Comment = require('../models/Comment');

class UserController {
  // Criar usuário
  static async create(req, res) {
    try {
      const { email, username, password } = req.body;

      // Verificar se usuário já existe
      const existingUser = await User.findOne({
        $or: [{ email: email }, { username: username }],
      });

      if (existingUser) {
        return res.status(403).json({
          error: 'Email já cadastrado',
        });
      }

      // Criar usuário
      const user = new User({
        username,
        email,
        password,
        nome: username,
      });

      await user.save();

      res.status(201).json({
        id: user._id,
        username: user.username,
        email: user.email,
        nome: user.nome,
      });
    } catch (error) {
      console.error('Erro ao criar usuário:', error);

      if (error.code === 11000) {
        // Erro de duplicação do MongoDB
        return res.status(403).json({
          error: 'Email já cadastrado',
        });
      }

      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  // Obter dados do usuário logado
  static async get(req, res) {
    try {
      const user = req.user;

      res.json({
        id: user._id,
        username: user.username,
        nome: user.nome,
        email: user.email,
      });
    } catch (error) {
      console.error('Erro ao obter usuário:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  // Atualizar perfil do usuário
  static async update(req, res) {
    try {
      const { nome, email } = req.body;
      const userId = req.user._id;

      // Verificar se email já está em uso por outro usuário
      if (email && email !== req.user.email) {
        const existingUser = await User.findOne({
          email: email,
          _id: { $ne: userId },
        });

        if (existingUser) {
          return res.status(403).json({
            error: 'Email já está em uso',
          });
        }
      }

      const updateData = {};
      if (nome) updateData.nome = nome;
      if (email) updateData.email = email;

      const user = await User.findByIdAndUpdate(userId, updateData, {
        new: true,
        runValidators: true,
      });

      res.json({
        id: user._id,
        username: user.username,
        nome: user.nome,
        email: user.email,
      });
    } catch (error) {
      console.error('Erro ao atualizar usuário:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  // Obter perfil público do usuário
  static async getProfile(req, res) {
    try {
      const { username } = req.params;

      const user = await User.findOne({ username }).select(
        'username nome createdAt'
      );

      if (!user) {
        return res.status(404).json({
          error: 'Usuário não encontrado',
        });
      }

      // Contar fotos do usuário
      const totalPhotos = await Photo.countDocuments({ author: user._id });

      // Contar comentários do usuário
      const totalComments = await Comment.countDocuments({
        comment_author: user._id,
      });

      res.json({
        id: user._id,
        username: user.username,
        nome: user.nome,
        createdAt: user.createdAt,
        stats: {
          totalPhotos,
          totalComments,
        },
      });
    } catch (error) {
      console.error('Erro ao obter perfil:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  // Deletar conta do usuário
  static async delete(req, res) {
    try {
      const userId = req.user._id;

      // Deletar todas as fotos do usuário
      const userPhotos = await Photo.find({ author: userId });

      // Deletar arquivos de foto do servidor
      const fs = require('fs');
      const path = require('path');

      userPhotos.forEach((photo) => {
        const filePath = path.join(process.cwd(), photo.src);
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      });

      // Deletar fotos do banco
      await Photo.deleteMany({ author: userId });

      // Deletar comentários do usuário
      await Comment.deleteMany({ comment_author: userId });

      // Deletar usuário
      await User.findByIdAndDelete(userId);

      res.json({ message: 'Conta deletada com sucesso' });
    } catch (error) {
      console.error('Erro ao deletar usuário:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  // Alterar senha
  static async changePassword(req, res) {
    try {
      const { currentPassword, newPassword } = req.body;
      const userId = req.user._id;

      if (!currentPassword || !newPassword) {
        return res.status(400).json({
          error: 'Senha atual e nova senha são obrigatórias',
        });
      }

      if (newPassword.length < 6) {
        return res.status(400).json({
          error: 'Nova senha deve ter pelo menos 6 caracteres',
        });
      }

      const user = await User.findById(userId);

      // Verificar senha atual
      const isCurrentPasswordValid = await user.comparePassword(
        currentPassword
      );
      if (!isCurrentPasswordValid) {
        return res.status(401).json({
          error: 'Senha atual incorreta',
        });
      }

      // Atualizar senha
      user.password = newPassword;
      await user.save();

      res.json({ message: 'Senha alterada com sucesso' });
    } catch (error) {
      console.error('Erro ao alterar senha:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }
}

module.exports = UserController;
