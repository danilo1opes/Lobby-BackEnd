const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
  comment_content: {
    type: String,
    required: true,
    trim: true,
  },
  comment_author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  comment_post_ID: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Photo',
    required: true,
  },
  comment_date: {
    type: Date,
    default: Date.now,
  },
});

// Populate automático do author
commentSchema.pre(/^find/, function (next) {
  this.populate({
    path: 'comment_author',
    select: 'username nome',
  });
  next();
});

module.exports = mongoose.model('Comment', commentSchema);
