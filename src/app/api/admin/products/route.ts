import { NextRequest, NextResponse } from "next/server";
import { verifyAdminSession } from "@/lib/adminAuth";
import connectToDatabase from "@/lib/mongoose";
import Product from "@/models/Product";

export async function GET(req: NextRequest) {
  const auth = await verifyAdminSession();
  if (!auth.authorized) return auth.errorResponse!;

  try {
    await connectToDatabase();

    const { searchParams } = new URL(req.url);
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const limit = Math.max(1, Math.min(100, parseInt(searchParams.get("limit") || "15", 10)));
    const search = searchParams.get("search") || "";
    const category = searchParams.get("category") || "";
    const status = searchParams.get("status") || "";
    const sort = searchParams.get("sort") || "newest";

    const filter: any = {};

    if (search.trim()) {
      const regex = new RegExp(search.trim(), "i");
      filter.$or = [
        { name: regex },
        { category: regex },
        { material: regex },
        { sku: regex },
        { description: regex }
      ];
    }

    if (category && category !== "all") {
      filter.category = { $regex: new RegExp("^" + category.trim() + "$", "i") };
    }

    if (status === "active") {
      filter.active = true;
    } else if (status === "inactive") {
      filter.active = false;
    } else if (status === "low_stock") {
      filter.stock = { $gt: 0, $lte: 5 };
    } else if (status === "out_of_stock") {
      filter.stock = { $lte: 0 };
    }

    let sortObj: any = { createdAt: -1 };
    switch (sort) {
      case "price_asc":
        sortObj = { price: 1 };
        break;
      case "price_desc":
        sortObj = { price: -1 };
        break;
      case "stock_asc":
        sortObj = { stock: 1 };
        break;
      case "stock_desc":
        sortObj = { stock: -1 };
        break;
      case "name_asc":
        sortObj = { name: 1 };
        break;
      default:
        sortObj = { createdAt: -1 };
    }

    const skip = (page - 1) * limit;
    const total = await Product.countDocuments(filter);
    const products = await Product.find(filter)
      .sort(sortObj)
      .skip(skip)
      .limit(limit)
      .lean();

    return NextResponse.json({
      success: true,
      products: products.map((p: any) => ({ ...p, id: p._id.toString() })),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit) || 1,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const auth = await verifyAdminSession();
  if (!auth.authorized) return auth.errorResponse!;

  try {
    await connectToDatabase();
    const body = await req.json();

    const { name, category, price, description } = body;
    if (!name || !category || price === undefined || !description) {
      return NextResponse.json(
        { success: false, error: "Name, category, price, and description are required." },
        { status: 400 }
      );
    }

    const numPrice = Number(price);
    const numStock = Number(body.stock || 0);
    const numDiscount = Number(body.discount || 0);

    if (isNaN(numPrice) || numPrice < 0) {
      return NextResponse.json({ success: false, error: "Price cannot be negative." }, { status: 400 });
    }
    if (isNaN(numStock) || numStock < 0) {
      return NextResponse.json({ success: false, error: "Stock cannot be negative." }, { status: 400 });
    }
    if (isNaN(numDiscount) || numDiscount < 0 || numDiscount > 100) {
      return NextResponse.json({ success: false, error: "Discount must be between 0 and 100%." }, { status: 400 });
    }

    const slug = body.slug || name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
    const sku = body.sku || ("RVB-" + Math.random().toString(36).substring(2, 7).toUpperCase());

    const newProduct = await Product.create({
      name: name.trim(),
      slug,
      sku,
      brand: body.brand || "Ramdev Vasan Bhandar",
      category: category.trim(),
      price: numPrice,
      originalPrice: body.originalPrice ? Number(body.originalPrice) : undefined,
      discount: numDiscount,
      mrp: body.mrp ? Number(body.mrp) : undefined,
      image: body.image || "/product-kadai.png",
      images: Array.isArray(body.images) ? body.images : (body.image ? [body.image] : ["/product-kadai.png"]),
      badge: body.badge || "",
      description: description.trim(),
      material: body.material || "Stainless Steel",
      capacity: body.capacity || "",
      weight: body.weight || "",
      dimensions: body.dimensions || "",
      stock: numStock,
      active: body.active !== undefined ? Boolean(body.active) : true,
      featured: Boolean(body.featured),
      bestseller: Boolean(body.bestseller),
      gstRate: body.gstRate ? Number(body.gstRate) : 18,
    });

    return NextResponse.json({
      success: true,
      message: "Product created successfully.",
      product: { ...newProduct.toObject(), id: newProduct._id.toString() },
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}