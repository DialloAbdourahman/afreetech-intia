import mongoose, { Schema, Document, Model } from 'mongoose';

export type Branch = 'Douala' | 'Yaounde';

export interface IClient extends Document {
  name: string;
  phone: string;
  email: string;
  address: string;
  cniNumber: string;
  branch: Branch;
  createdAt: Date;
  updatedAt: Date;
}

const ClientSchema: Schema<IClient> = new Schema<IClient>(
  {
    name: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true },
    address: { type: String, required: true, trim: true },
    cniNumber: { type: String, required: true, unique: true, trim: true },
    branch: { type: String, required: true, enum: ['Douala', 'Yaounde'] },
  },
  {
    timestamps: true,
  }
);

export const Client: Model<IClient> = mongoose.model<IClient>('Client', ClientSchema);
