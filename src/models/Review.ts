import mongoose, { Schema, Document } from "mongoose";

export interface IReview extends Document {
  user: mongoose.Types.ObjectId;
  product: mongoose.Types.ObjectId;
  order?: mongoose.Types.ObjectId;
  rating: number;
  title?: string;
  comment: string;
  images?: string[];
  verifiedPurchase: boolean;
  status: "approved" | "pending" | "hidden";
  createdAt: Date;
  updatedAt: Date;
}

const ReviewSchema: Schema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    product: { type: Schema.Types.ObjectId, ref: "Product", required: true },
    order: { type: Schema.Types.ObjectId, ref: "Order" },
    rating: { type: Number, required: true, min: 1, max: 5 },
    title: { type: String, trim: true },
    comment: { type: String, required: true, trim: true },
    images: [{ type: String }],
    verifiedPurchase: { type: Boolean, default: true },
    status: {
      type: String,
      enum: ["approved", "pending", "hidden"],
      default: "approved",
    },
  },
  { timestamps: true }
);

// Index to quickly query product reviews & user reviews
ReviewSchema.index({ product: 1, status: 1, createdAt: -1 });
ReviewSchema.index({ user: 1, product: 1 });

export default mongoose.models.Review || mongoose.model<IReview>("Review", ReviewSchema);
