import mongoose, { Schema } from 'mongoose';

const tokenSchema = new Schema({
  token: { type: String, required: true },
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  expiresAt: { type: Date, required: true },
});

export default mongoose.model('Token', tokenSchema);
