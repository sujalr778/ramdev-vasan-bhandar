import mongoose, { Schema, Document } from "mongoose";

export interface IAdminNotification extends Document {
  title: string;
  message: string;
  type: "new_order" | "low_stock" | "out_of_stock" | "payment_failed" | "info";
  referenceId?: string;
  referenceModel?: string;
  read: boolean;
  createdAt: Date;
}

const AdminNotificationSchema: Schema = new Schema(
  {
    title: { type: String, required: true },
    message: { type: String, required: true },
    type: {
      type: String,
      enum: ["new_order", "low_stock", "out_of_stock", "payment_failed", "info"],
      default: "info",
    },
    referenceId: { type: String },
    referenceModel: { type: String },
    read: { type: Boolean, default: false },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

AdminNotificationSchema.index({ read: 1, createdAt: -1 });

export default mongoose.models.AdminNotification || mongoose.model<IAdminNotification>("AdminNotification", AdminNotificationSchema);