import { NextRequest, NextResponse } from "next/server";
import { verifyAdminSession } from "@/lib/adminAuth";
import connectToDatabase from "@/lib/mongoose";
import Product from "@/models/Product";
import InventoryLog from "@/models/InventoryLog";
import { logInventoryMovement } from "@/lib/inventory";

export async function GET(req: NextRequest) {
  const auth = await verifyAdminSession();
  if (!auth.authorized) return auth.errorResponse!;

  try {
    await connectToDatabase();
    const { searchParams } = new URL(req.url);
    const filterType = searchParams.get("filter") || "all";
    const search = searchParams.get("search") || "";
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const limit = Math.max(1, Math.min(100, parseInt(searchParams.get("limit") || "20", 10)));

    const filter: any = {};
    if (filterType === "in_stock") {
      filter.stock = { $gt: 5 };
    } else if (filterType === "low_stock") {
      filter.stock = { $gt: 0, $lte: 5 };
    } else if (filterType === "out_of_stock") {
      filter.stock = { $lte: 0 };
    }

    if (search.trim()) {
      const regex = new RegExp(search.trim(), "i");
      filter.$or = [{ name: regex }, { sku: regex }, { category: regex }];
    }

    const skip = (page - 1) * limit;
    const total = await Product.countDocuments(filter);
    const products = await Product.find(filter)
      .sort({ stock: 1, name: 1 })
      .skip(skip)
      .limit(limit)
      .lean();

    // Summary counts
    const inStockCount = await Product.countDocuments({ stock: { $gt: 5 } });
    const lowStockCount = await Product.countDocuments({ stock: { $gt: 0, $lte: 5 } });
    const outOfStockCount = await Product.countDocuments({ stock: { $lte: 0 } });
    const totalProducts = await Product.countDocuments();

    // Inventory value calculation
    const valueAgg = await Product.aggregate([
      { $match: { stock: { $gt: 0 } } },
      { $group: { _id: null, totalValuation: { $sum: { $multiply: ["$price", "$stock"] } } } }
    ]);
    const totalValuation = valueAgg[0]?.totalValuation || 0;

    // Recent logs
    const recentLogs = await InventoryLog.find()
      .sort({ createdAt: -1 })
      .limit(10)
      .populate("product", "name sku")
      .lean();

    return NextResponse.json({
      success: true,
      items: products.map((p: any) => ({
        id: p._id.toString(),
        name: p.name,
        sku: p.sku || "N/A",
        image: p.image,
        category: p.category,
        stock: p.stock,
        price: p.price,
        status: p.stock <= 0 ? "Out of Stock" : (p.stock <= 5 ? "Low Stock" : "In Stock"),
        lastUpdated: p.updatedAt,
      })),
      summary: {
        totalProducts,
        inStockCount,
        lowStockCount,
        outOfStockCount,
        totalValuation,
      },
      recentLogs: recentLogs.map((l: any) => ({
        id: l._id.toString(),
        productName: l.product?.name || "Deleted Product",
        sku: l.product?.sku || "",
        previousStock: l.previousStock,
        newStock: l.newStock,
        changeQuantity: l.changeQuantity,
        reason: l.reason,
        createdAt: l.createdAt,
      })),
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

export async function PATCH(req: NextRequest) {
  const auth = await verifyAdminSession();
  if (!auth.authorized) return auth.errorResponse!;

  try {
    await connectToDatabase();
    const { productId, newStock, delta } = await req.json();

    if (!productId) {
      return NextResponse.json({ success: false, error: "Product ID is required." }, { status: 400 });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return NextResponse.json({ success: false, error: "Product not found." }, { status: 404 });
    }

    const prevStock = product.stock;
    let targetStock = prevStock;

    if (newStock !== undefined) {
      targetStock = Math.max(0, Number(newStock));
    } else if (delta !== undefined) {
      targetStock = Math.max(0, prevStock + Number(delta));
    }

    const changeQty = targetStock - prevStock;
    product.stock = targetStock;
    await product.save();

    await logInventoryMovement({
      productId: product._id.toString(),
      previousStock: prevStock,
      newStock: targetStock,
      changeQuantity: changeQty,
      reason: "admin_adjustment",
      adminUserId: auth.user!.id,
    });

    return NextResponse.json({
      success: true,
      message: "Stock updated successfully.",
      product: {
        id: product._id.toString(),
        stock: product.stock,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}