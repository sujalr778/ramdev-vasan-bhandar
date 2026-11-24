import mongoose, { Schema, Document } from "mongoose";

export interface IOffer extends Document {
  title: string;
  description?: string;
  badge?: string;
  bannerImage?: string;
  discountType: "percentage" | "fixed";
  discountValue: number;
  applicableTo: "all" | "category" | "product";
  targetCategories?: string[];
  targetProducts?: mongoose.Types.ObjectId[];
  startDate?: Date;
  endDate?: Date;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const OfferSchema: Schema = new Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    badge: { type: String, default: "Special Offer" },
    bannerImage: { type: String },
    discountType: { type: String, enum: ["percentage", "fixed"], default: "percentage" },
    discountValue: { type: Number, required: true, min: 0 },
    applicableTo: { type: String, enum: ["all", "category", "product"], default: "all" },
    targetCategories: [{ type: String }],
    targetProducts: [{ type: Schema.Types.ObjectId, ref: "Product" }],
    startDate: { type: Date },
    endDate: { type: Date },
    active: { type: Boolean, default: true },
  },
  { timestamps: true }
);

OfferSchema.index({ active: 1, startDate: 1, endDate: 1 });

export default mongoose.models.Offer || mongoose.model<IOffer>("Offer", OfferSchema);