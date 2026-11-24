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
    const timeframe = searchParams.get("timeframe") || "30d";
    const startDateParam = searchParams.get("startDate");
    const endDateParam = searchParams.get("endDate");

    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    const dayOfWeek = now.getDay();
    const diffToMonday = now.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
    const startOfWeek = new Date(now.getFullYear(), now.getMonth(), diffToMonday);
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    let chartStartDate = new Date();
    switch (timeframe) {
      case "today":
        chartStartDate = startOfToday;
        break;
      case "7d":
        chartStartDate.setDate(now.getDate() - 7);
        break;
      case "30d":
        chartStartDate.setDate(now.getDate() - 30);
        break;
      case "3m":
        chartStartDate.setMonth(now.getMonth() - 3);
        break;
      case "6m":
        chartStartDate.setMonth(now.getMonth() - 6);
        break;
      case "1y":
        chartStartDate.setFullYear(now.getFullYear() - 1);
        break;
      case "custom":
        if (startDateParam) chartStartDate = new Date(startDateParam);
        break;
      default:
        chartStartDate.setDate(now.getDate() - 30);
    }

    const chartEndDate = (timeframe === "custom" && endDateParam) ? new Date(endDateParam) : now;

    // Revenue aggregations
    const revenueStats = await Order.aggregate([
      { $match: { status: { $ne: "cancelled" } } },
      {
        $facet: {
          total: [{ $group: { _id: null, total: { $sum: "$totalAmount" } } }],
          today: [
            { $match: { createdAt: { $gte: startOfToday } } },
            { $group: { _id: null, total: { $sum: "$totalAmount" } } }
          ],
          thisWeek: [
            { $match: { createdAt: { $gte: startOfWeek } } },
            { $group: { _id: null, total: { $sum: "$totalAmount" } } }
          ],
          thisMonth: [
            { $match: { createdAt: { $gte: startOfMonth } } },
            { $group: { _id: null, total: { $sum: "$totalAmount" } } }
          ]
        }
      }
    ]);

    const totalRevenue = revenueStats[0]?.total[0]?.total || 0;
    const todayRevenue = revenueStats[0]?.today[0]?.total || 0;
    const thisWeekRevenue = revenueStats[0]?.thisWeek[0]?.total || 0;
    const thisMonthRevenue = revenueStats[0]?.thisMonth[0]?.total || 0;

    // Order status counts
    const orderStatusCounts = await Order.aggregate([
      { $group: { _id: "$status", count: { $sum: 1 } } }
    ]);

    const statusMap: Record<string, number> = {
      pending: 0,
      processing: 0,
      shipped: 0,
      delivered: 0,
      cancelled: 0,
    };
    let totalOrdersCount = 0;

    orderStatusCounts.forEach((s) => {
      const st = (s._id || "pending").toLowerCase();
      if (st in statusMap) {
        statusMap[st] += s.count;
      } else if (st === "confirmed") {
        statusMap["processing"] += s.count;
      }
      totalOrdersCount += s.count;
    });

    const todayOrdersCount = await Order.countDocuments({
      createdAt: { $gte: startOfToday }
    });

    // Product counts
    const totalProducts = await Product.countDocuments();
    const activeProducts = await Product.countDocuments({ active: { $ne: false } });
    const lowStockCount = await Product.countDocuments({ stock: { $gt: 0, $lte: 5 } });
    const outOfStockCount = await Product.countDocuments({ stock: { $lte: 0 } });

    // Customer counts
    const totalCustomers = await User.countDocuments({ role: "customer" });
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(now.getDate() - 30);
    const newCustomersCount = await User.countDocuments({
      role: "customer",
      createdAt: { $gte: thirtyDaysAgo }
    });

    const returningCustomersAgg = await Order.aggregate([
      { $group: { _id: "$user", orderCount: { $sum: 1 } } },
      { $match: { orderCount: { $gt: 1 } } },
      { $count: "returningCount" }
    ]);
    const returningCustomersCount = returningCustomersAgg[0]?.returningCount || 0;

    // Time-series sales chart
    const chartAgg = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: chartStartDate, $lte: chartEndDate },
          status: { $ne: "cancelled" }
        }
      },
      {
        $project: {
          dateStr: {
            $dateToString: {
              format: timeframe === "today" ? "%H:00" : "%Y-%m-%d",
              date: "$createdAt"
            }
          },
          totalAmount: 1,
          itemsCount: { $sum: "$products.quantity" }
        }
      },
      {
        $group: {
          _id: "$dateStr",
          revenue: { $sum: "$totalAmount" },
          orders: { $sum: 1 },
          productsSold: { $sum: "$itemsCount" }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    const salesChart = chartAgg.map((item) => ({
      date: item._id,
      revenue: item.revenue || 0,
      orders: item.orders || 0,
      productsSold: item.productsSold || 0,
    }));

    // Recent orders
    const recentOrders = await Order.find()
      .sort({ createdAt: -1 })
      .limit(6)
      .populate("user", "name email")
      .lean();

    // Low stock items
    const lowStockItems = await Product.find({ stock: { $lte: 5 } })
      .sort({ stock: 1 })
      .limit(8)
      .select("name stock price image category")
      .lean();

    return NextResponse.json({
      success: true,
      revenue: {
        total: totalRevenue,
        today: todayRevenue,
        thisWeek: thisWeekRevenue,
        thisMonth: thisMonthRevenue,
      },
      orders: {
        total: totalOrdersCount,
        today: todayOrdersCount,
        pending: statusMap.pending,
        processing: statusMap.processing,
        shipped: statusMap.shipped,
        delivered: statusMap.delivered,
        cancelled: statusMap.cancelled,
      },
      products: {
        total: totalProducts,
        active: activeProducts,
        lowStock: lowStockCount,
        outOfStock: outOfStockCount,
      },
      customers: {
        total: totalCustomers,
        new: newCustomersCount,
        returning: returningCustomersCount,
      },
      salesChart,
      recentOrders: recentOrders.map((o: any) => ({
        id: o._id.toString(),
        orderNumber: o._id.toString().slice(-6).toUpperCase(),
        customer: (typeof o.shippingAddress === "object" && o.shippingAddress?.fullName)
          ? o.shippingAddress.fullName
          : (o.user?.name || "Customer"),
        date: o.createdAt,
        amount: o.totalAmount,
        paymentMethod: o.paymentMethod || "cod",
        paymentStatus: o.paymentStatus || "pending",
        status: o.status,
      })),
      lowStockItems: lowStockItems.map((p: any) => ({
        id: p._id.toString(),
        name: p.name,
        stock: p.stock,
        price: p.price,
        image: p.image,
        category: p.category,
      })),
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}