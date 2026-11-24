import { NextRequest, NextResponse } from "next/server";
import { verifyAdminSession } from "@/lib/adminAuth";
import connectToDatabase from "@/lib/mongoose";
import Category from "@/models/Category";
import Product from "@/models/Product";

const DEFAULT_CATEGORIES = [
  "Cookware",
  "Steel Utensils",
  "Kitchen Tools",
  "Pressure Cookers",
  "Plates & Bowls",
  "Storage Containers",
  "Serving Items",
  "Kitchen Accessories",
  "Specialty",
  "Other"
];

export async function GET(req: NextRequest) {
  const auth = await verifyAdminSession();
  if (!auth.authorized) return auth.errorResponse!;

  try {
    await connectToDatabase();

    // Auto-seed default categories if empty
    const count = await Category.countDocuments();
    if (count === 0) {
      for (let i = 0; i < DEFAULT_CATEGORIES.length; i++) {
        const name = DEFAULT_CATEGORIES[i];
        const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-");
        await Category.create({ name, slug, displayOrder: i, active: true });
      }
    }

    const categories = await Category.find().sort({ displayOrder: 1, name: 1 }).lean();

    // Compute live product counts for each category
    const productCounts = await Product.aggregate([
      { $group: { _id: "$category", count: { $sum: 1 } } }
    ]);

    const countMap: Record<string, number> = {};
    productCounts.forEach((c) => {
      if (c._id) countMap[c._id.toLowerCase()] = c.count;
    });

    const result = categories.map((c: any) => ({
      id: c._id.toString(),
      name: c.name,
      slug: c.slug,
      description: c.description || "",
      image: c.image || "",
      displayOrder: c.displayOrder || 0,
      active: c.active !== false,
      productCount: countMap[c.name.toLowerCase()] || 0,
    }));

    return NextResponse.json({ success: true, categories: result });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const auth = await verifyAdminSession();
  if (!auth.authorized) return auth.errorResponse!;

  try {
    await connectToDatabase();
    const { name, description, image, displayOrder, active } = await req.json();

    if (!name || !name.trim()) {
      return NextResponse.json({ success: false, error: "Category name is required." }, { status: 400 });
    }

    const slug = name.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-");

    const category = await Category.create({
      name: name.trim(),
      slug,
      description: description?.trim() || "",
      image: image || "",
      displayOrder: displayOrder ? Number(displayOrder) : 0,
      active: active !== undefined ? Boolean(active) : true,
    });

    return NextResponse.json({
      success: true,
      message: "Category created.",
      category: { ...category.toObject(), id: category._id.toString(), productCount: 0 }
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  const auth = await verifyAdminSession();
  if (!auth.authorized) return auth.errorResponse!;

  try {
    await connectToDatabase();
    const { id, name, description, image, displayOrder, active } = await req.json();

    if (!id) {
      return NextResponse.json({ success: false, error: "Category ID is required." }, { status: 400 });
    }

    const update: any = {};
    if (name) {
      update.name = name.trim();
      update.slug = name.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-");
    }
    if (description !== undefined) update.description = description;
    if (image !== undefined) update.image = image;
    if (displayOrder !== undefined) update.displayOrder = Number(displayOrder);
    if (active !== undefined) update.active = Boolean(active);

    const updated = await Category.findByIdAndUpdate(id, update, { new: true });
    return NextResponse.json({ success: true, message: "Category updated.", category: updated });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const auth = await verifyAdminSession();
  if (!auth.authorized) return auth.errorResponse!;

  try {
    await connectToDatabase();
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ success: false, error: "Category ID is required." }, { status: 400 });
    }

    await Category.findByIdAndDelete(id);
    return NextResponse.json({ success: true, message: "Category deleted." });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}