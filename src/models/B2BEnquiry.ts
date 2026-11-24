import mongoose, { Schema, Document } from "mongoose";

export interface IB2BEnquiry extends Document {
  companyName?: string;
  contactPerson: string;
  mobile: string;
  email: string;
  gstin?: string;
  productName?: string;
  quantity?: number;
  message: string;
  status: "new" | "contacted" | "quoted" | "closed";
  createdAt: Date;
  updatedAt: Date;
}

const B2BEnquirySchema: Schema = new Schema(
  {
    companyName: { type: String, trim: true },
    contactPerson: { type: String, required: true, trim: true },
    mobile: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true },
    gstin: { type: String, trim: true },
    productName: { type: String, trim: true },
    quantity: { type: Number, default: 50 },
    message: { type: String, required: true, trim: true },
    status: {
      type: String,
      enum: ["new", "contacted", "quoted", "closed"],
      default: "new",
    },
  },
  { timestamps: true }
);

B2BEnquirySchema.index({ status: 1, createdAt: -1 });

export default mongoose.models.B2BEnquiry || mongoose.model<IB2BEnquiry>("B2BEnquiry", B2BEnquirySchema);
