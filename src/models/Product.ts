import mongoose, { Schema, Document } from "mongoose";

export interface IProduct extends Document {
  name: string;
  slug?: string;
  sku?: string;
  brand?: string;
  category: string;
  price: number;
  originalPrice?: number;
  mrp?: number;
  rating: number;
  reviews: number;
  image: string;
  images?: string[];
  badge?: string;
  description: string;
  material?: string;
  capacity?: string;
  weight?: string;
  dimensions?: string;
  stock: number;
  specifications?: Record<string, string>;
  stoveCompatibility?: string;
  discount?: number;
  gstRate?: number;
  active?: boolean;
  featured?: boolean;
  bestseller?: boolean;
}

const ProductSchema: Schema = new Schema(
  {
    name: { type: String, required: true },
    slug: { type: String, trim: true, lowercase: true },
    sku: { type: String, trim: true, uppercase: true },
    brand: { type: String, default: "Ramdev Vasan Bhandar" },
    category: { type: String, required: true },
    price: { type: Number, required: true },
    originalPrice: { type: Number },
    mrp: { type: Number },
    rating: { type: Number, default: 5 },
    reviews: { type: Number, default: 0 },
    image: { type: String, required: true },
    images: [{ type: String }],
    badge: { type: String },
    description: { type: String, required: true },
    material: { type: String },
    capacity: { type: String },
    weight: { type: String },
    dimensions: { type: String },
    stock: { type: Number, default: 0 },
    specifications: { type: Map, of: String },
    stoveCompatibility: { type: String },
    discount: { type: Number },
    gstRate: { type: Number, default: 18 },
    active: { type: Boolean, default: true },
    featured: { type: Boolean, default: false },
    bestseller: { type: Boolean, default: false },
  },
  { timestamps: true }
);

ProductSchema.index({ category: 1, price: 1 });
ProductSchema.index({ slug: 1 });
ProductSchema.index({ active: 1, featured: 1, bestseller: 1 });

export default mongoose.models.Product || mongoose.model<IProduct>("Product", ProductSchema);
