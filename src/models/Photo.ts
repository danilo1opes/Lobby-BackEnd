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
    personagem: { type: String },
    epoca: { type: String },
    acessos: { type: Number, default: 0 },
  },
  { timestamps: true },
);

interface IPhoto extends mongoose.Document {
  title: string;
  content: string;
  author: mongoose.Types.ObjectId;
  src: string;
  personagem?: string;
  epoca?: string;
  acessos: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export default mongoose.model<IPhoto>('Photo', photoSchema);
