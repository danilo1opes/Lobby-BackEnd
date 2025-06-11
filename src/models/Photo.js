const mongoose = require('mongoose');

const photoSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  src: {
    type: String,
    required: true,
  },
  peso: {
    type: String,
    required: true,
  },
  idade: {
    type: String,
    required: true,
  },
  acessos: {
    type: Number,
    default: 0,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Atualizar updatedAt antes de salvar
photoSchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  next();
});

// Populate automático do author
photoSchema.pre(/^find/, function (next) {
  this.populate({
    path: 'author',
    select: 'username nome',
  });
  next();
});

module.exports = mongoose.model('Photo', photoSchema);
