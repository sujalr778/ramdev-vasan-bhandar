import mongoose, { Schema, Document } from "mongoose";

export interface IBanner extends Document {
  title: string;
  subtitle?: string;
  imageUrl: string;
  linkUrl?: string;
  type: "hero" | "promotional" | "category";
  displayOrder: number;
  active: boolean;
  startDate?: Date;
  endDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const BannerSchema: Schema = new Schema(
  {
    title: { type: String, required: true, trim: true },
    subtitle: { type: String, trim: true },
    imageUrl: { type: String, required: true, trim: true },
    linkUrl: { type: String, trim: true, default: "/shop" },
    type: {
      type: String,
      enum: ["hero", "promotional", "category"],
      default: "hero",
    },
    displayOrder: { type: Number, default: 0 },
    active: { type: Boolean, default: true },
    startDate: { type: Date },
    endDate: { type: Date },
  },
  { timestamps: true }
);

BannerSchema.index({ type: 1, active: 1, displayOrder: 1 });

export default mongoose.models.Banner || mongoose.model<IBanner>("Banner", BannerSchema);