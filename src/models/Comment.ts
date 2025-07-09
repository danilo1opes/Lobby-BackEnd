import mongoose, { Schema } from 'mongoose';

const commentSchema = new Schema(
  {
    text: { type: String, required: true },
    author: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    photo: { type: Schema.Types.ObjectId, ref: 'Photo', required: true },
  },
  { timestamps: true }
);

export default mongoose.model('Comment', commentSchema);
