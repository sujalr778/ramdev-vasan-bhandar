import { NextRequest, NextResponse } from "next/server";
import { verifyAdminSession } from "@/lib/adminAuth";
import connectToDatabase from "@/lib/mongoose";
import Order from "@/models/Order";
import Product from "@/models/Product";
import User from "@/models/User";

export async function GET(req: NextRequest) {
  const auth = await verifyAdminSession();
  if (!auth.authorized) return auth.errorResponse!;

  try {
    await connectToDatabase();
    const { searchParams } = new URL(req.url);
    const range = searchParams.get("range") || "30d";

    const now = new Date();
    let startDate = new Date();
    if (range === "7d") startDate.setDate(now.getDate() - 7);
    else if (range === "30d") startDate.setDate(now.getDate() - 30);
    else if (range === "90d" || range === "3m") startDate.setMonth(now.getMonth() - 3);
    else if (range === "1y") startDate.setFullYear(now.getFullYear() - 1);
    else startDate.setDate(now.getDate() - 30);

    // 1. Sales Report
    const salesReportAgg = await Order.aggregate([
      { $match: { createdAt: { $gte: startDate }, status: { $ne: "cancelled" } } },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: "$totalAmount" },
          totalOrders: { $sum: 1 },
          avgOrderValue: { $avg: "$totalAmount" },
          totalItemsSold: { $sum: { $sum: "$products.quantity" } }
        }
      }
    ]);
    const sales = salesReportAgg[0] || { totalRevenue: 0, totalOrders: 0, avgOrderValue: 0, totalItemsSold: 0 };

    // 2. Best Sellers & Slow Sellers
    const productSalesAgg = await Order.aggregate([
      { $match: { createdAt: { $gte: startDate }, status: { $ne: "cancelled" } } },
      { $unwind: "$products" },
      {
        $group: {
          _id: "$products.product",
          unitsSold: { $sum: "$products.quantity" },
          revenue: { $sum: { $multiply: ["$products.quantity", "$products.priceAtTime"] } }
        }
      },
      { $sort: { unitsSold: -1 } }
    ]);

    const soldProductIds = productSalesAgg.map((p) => p._id);
    const allProducts = await Product.find().select("name category price stock sku").lean();

    const productMap: Record<string, any> = {};
    allProducts.forEach((p: any) => {
      productMap[p._id.toString()] = p;
    });

    const bestSellers = productSalesAgg.slice(0, 10).map((ps) => {
      const p = productMap[ps._id?.toString()] || {};
      return {
        id: ps._id?.toString(),
        name: p.name || "Unknown Product",
        category: p.category || "",
        sku: p.sku || "",
        unitsSold: ps.unitsSold,
        revenue: ps.revenue,
      };
    });

    // Zero sales products
    const soldSet = new Set(soldProductIds.map((id) => id?.toString()));
    const zeroSalesProducts = allProducts
      .filter((p: any) => !soldSet.has(p._id.toString()))
      .slice(0, 10)
      .map((p: any) => ({
        id: p._id.toString(),
        name: p.name,
        category: p.category,
        sku: p.sku,
        stock: p.stock,
        price: p.price,
      }));

    // 3. Category Revenue
    const categoryRevenueAgg = await Order.aggregate([
      { $match: { createdAt: { $gte: startDate }, status: { $ne: "cancelled" } } },
      { $unwind: "$products" },
      {
        $lookup: {
          from: "products",
          localField: "products.product",
          foreignField: "_id",
          as: "productDoc"
        }
      },
      { $unwind: "$productDoc" },
      {
        $group: {
          _id: "$productDoc.category",
          totalRevenue: { $sum: { $multiply: ["$products.quantity", "$products.priceAtTime"] } },
          unitsSold: { $sum: "$products.quantity" },
          ordersCount: { $sum: 1 }
        }
      },
      { $sort: { totalRevenue: -1 } }
    ]);

    const categoryReport = categoryRevenueAgg.map((c) => ({
      category: c._id || "Uncategorized",
      revenue: c.totalRevenue,
      unitsSold: c.unitsSold,
      ordersCount: c.ordersCount,
    }));

    // 4. Inventory Valuation
    const inventoryValuation = allProducts.reduce((acc: number, p: any) => acc + (p.stock > 0 ? p.price * p.stock : 0), 0);
    const lowStockCount = allProducts.filter((p: any) => p.stock > 0 && p.stock <= 5).length;
    const outOfStockCount = allProducts.filter((p: any) => p.stock <= 0).length;

    return NextResponse.json({
      success: true,
      range,
      sales: {
        totalRevenue: sales.totalRevenue,
        totalOrders: sales.totalOrders,
        avgOrderValue: Math.round(sales.avgOrderValue || 0),
        totalItemsSold: sales.totalItemsSold,
      },
      bestSellers,
      zeroSalesProducts,
      categoryReport,
      inventory: {
        totalValuation: inventoryValuation,
        totalSkus: allProducts.length,
        lowStockCount,
        outOfStockCount,
      }
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}