import mongoose, { Schema, Document } from "mongoose";

export interface ISetting extends Document {
  storeName: string;
  storePhone: string;
  storeEmail: string;
  storeAddress: string;
  storeCity: string;
  storeState: string;
  storePincode: string;
  storeGstin?: string;
  freeShippingThreshold: number;
  standardDeliveryFee: number;
  maintenanceMode: boolean;
  announcementText?: string;
  updatedAt: Date;
}

const SettingSchema: Schema = new Schema(
  {
    storeName: { type: String, default: "Ramdev Vasan Bhandar" },
    storePhone: { type: String, default: "+91 98765 43210" },
    storeEmail: { type: String, default: "support@ramdevvasanbhandar.com" },
    storeAddress: { type: String, default: "Main Market, Station Road" },
    storeCity: { type: String, default: "Ahmedabad" },
    storeState: { type: String, default: "Gujarat" },
    storePincode: { type: String, default: "380001" },
    storeGstin: { type: String, default: "24AAAAA0000A1Z5" },
    freeShippingThreshold: { type: Number, default: 999 },
    standardDeliveryFee: { type: Number, default: 99 },
    maintenanceMode: { type: Boolean, default: false },
    announcementText: { type: String, default: "" },
  },
  { timestamps: true }
);

export default mongoose.models.Setting || mongoose.model<ISetting>("Setting", SettingSchema);