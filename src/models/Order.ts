import mongoose, { Schema, Document } from "mongoose";

export interface IOrder extends Document {
  user: mongoose.Types.ObjectId;
  products: {
    product: mongoose.Types.ObjectId;
    quantity: number;
    priceAtTime: number;
  }[];
  subtotal: number;
  deliveryCharge: number;
  discount: number;
  totalAmount: number;
  paymentMethod: "cod" | "online";
  paymentStatus: "cod_pending" | "pending" | "paid" | "failed";
  status: "pending" | "confirmed" | "processing" | "shipped" | "out_for_delivery" | "delivered" | "cancelled";
  shippingAddress: {
    fullName: string;
    mobile: string;
    email: string;
    addressLine: string;
    city: string;
    state: string;
    pincode: string;
  } | string;
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  razorpaySignature?: string;
}

const OrderSchema: Schema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    products: [
      {
        product: { type: Schema.Types.ObjectId, ref: "Product", required: true },
        quantity: { type: Number, required: true },
        priceAtTime: { type: Number, required: true },
      },
    ],
    subtotal: { type: Number, required: true, default: 0 },
    deliveryCharge: { type: Number, required: true, default: 0 },
    discount: { type: Number, default: 0 },
    totalAmount: { type: Number, required: true },
    paymentMethod: { type: String, enum: ["cod", "online"], default: "cod" },
    paymentStatus: {
      type: String,
      enum: ["cod_pending", "pending", "paid", "failed"],
      default: "cod_pending",
    },
    status: {
      type: String,
      enum: ["pending", "confirmed", "processing", "shipped", "out_for_delivery", "delivered", "cancelled"],
      default: "pending",
    },
    shippingAddress: { type: Schema.Types.Mixed, required: true },
    razorpayOrderId: { type: String },
    razorpayPaymentId: { type: String },
    razorpaySignature: { type: String },
  },
  { timestamps: true }
);

export default mongoose.models.Order || mongoose.model<IOrder>("Order", OrderSchema);


