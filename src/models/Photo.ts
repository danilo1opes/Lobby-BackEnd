import mongoose, { Schema, Document } from 'mongoose';

export interface IPhoto extends Document {
  title: string;
  content: string;
  author: mongoose.Types.ObjectId;
  imageUrl: string;
  peso: string;
  idade: string;
  acessos: number;
  createdAt: Date;
}

const PhotoSchema: Schema = new Schema({
  title: { type: String, required: true },
  content: { type: String, required: true },
  author: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  imageUrl: { type: String, required: true },
  peso: { type: String, required: true },
  idade: { type: String, required: true },
  acessos: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model<IPhoto>('Photo', PhotoSchema);
