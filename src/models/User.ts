import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  email: { type: String, required: true },
  username: { type: String, required: true },
  password: { type: String, required: true, select: false },
  nome: { type: String },
});

export interface IUser extends mongoose.Document {
  _id: mongoose.Types.ObjectId;
  email: string;
  username: string;
  password: string;
  nome?: string;
}

export default mongoose.model<IUser>('User', userSchema);
