import mongoose, { Schema, Document, Model, Types } from 'mongoose';

export type InsuranceStatus = 'active' | 'expired';

export interface IInsurance extends Document {
  client: Types.ObjectId;
  type: string;
  policyNumber: string;
  startDate: Date;
  endDate: Date;
  amount: number;
  status: InsuranceStatus;
  createdAt: Date;
  updatedAt: Date;
}

const InsuranceSchema: Schema<IInsurance> = new Schema<IInsurance>(
  {
    client: { type: Schema.Types.ObjectId, ref: 'Client', required: true },
    type: { type: String, required: true, trim: true },
    policyNumber: { type: String, required: true, unique: true, trim: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    amount: { type: Number, required: true },
    status: { type: String, required: true, enum: ['active', 'expired'], default: 'active' },
  },
  {
    timestamps: true,
  }
);

export const Insurance: Model<IInsurance> = mongoose.model<IInsurance>('Insurance', InsuranceSchema);
