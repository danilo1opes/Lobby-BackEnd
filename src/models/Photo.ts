import mongoose from 'mongoose';

const photoSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    content: { type: String, required: true },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    src: { type: String, required: true },
    peso: { type: Number },
    idade: { type: Number },
    acessos: { type: Number, default: 0 },
  },
  { timestamps: true }
);
interface IPhoto extends mongoose.Document {
  title: string;
  content: string;
  author: mongoose.Types.ObjectId;
  src: string;
  peso?: number;
  idade?: number;
  acessos: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export default mongoose.model<IPhoto>('Photo', photoSchema);
