import mongoose, { Schema, Document } from "mongoose";

export interface IInventoryLog extends Document {
  product: mongoose.Types.ObjectId;
  previousStock: number;
  newStock: number;
  changeQuantity: number;
  reason: "order_placed" | "order_cancelled" | "admin_adjustment";
  order?: mongoose.Types.ObjectId;
  adminUser?: mongoose.Types.ObjectId;
  createdAt: Date;
}

const InventoryLogSchema: Schema = new Schema(
  {
    product: { type: Schema.Types.ObjectId, ref: "Product", required: true },
    previousStock: { type: Number, required: true },
    newStock: { type: Number, required: true },
    changeQuantity: { type: Number, required: true },
    reason: {
      type: String,
      enum: ["order_placed", "order_cancelled", "admin_adjustment"],
      required: true,
    },
    order: { type: Schema.Types.ObjectId, ref: "Order" },
    adminUser: { type: Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

InventoryLogSchema.index({ product: 1, createdAt: -1 });

export default mongoose.models.InventoryLog || mongoose.model<IInventoryLog>("InventoryLog", InventoryLogSchema);
