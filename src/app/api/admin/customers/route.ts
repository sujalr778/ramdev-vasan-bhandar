import { NextRequest, NextResponse } from "next/server";
import { verifyAdminSession } from "@/lib/adminAuth";
import connectToDatabase from "@/lib/mongoose";
import User from "@/models/User";
import Order from "@/models/Order";

export async function GET(req: NextRequest) {
  const auth = await verifyAdminSession();
  if (!auth.authorized) return auth.errorResponse!;

  try {
    await connectToDatabase();
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") || "";
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const limit = Math.max(1, Math.min(100, parseInt(searchParams.get("limit") || "15", 10)));
    const customerId = searchParams.get("id");

    // Single customer details request
    if (customerId) {
      const user = await User.findById(customerId).select("-password").lean();
      if (!user) {
        return NextResponse.json({ success: false, error: "Customer not found." }, { status: 404 });
      }

      const orders = await Order.find({ user: customerId })
        .sort({ createdAt: -1 })
        .populate("products.product", "name image price")
        .lean();

      const totalSpent = orders.reduce((acc, o: any) => o.status !== "cancelled" ? acc + o.totalAmount : acc, 0);

      return NextResponse.json({
        success: true,
        customer: {
          id: (user as any)._id.toString(),
          name: (user as any).name,
          email: (user as any).email,
          mobile: (user as any).mobile || "",
          address: (user as any).address || "",
          createdAt: (user as any).createdAt,
          totalSpent,
          ordersCount: orders.length,
          orders: orders.map((o: any) => ({
            id: o._id.toString(),
            orderNumber: o._id.toString().slice(-6).toUpperCase(),
            amount: o.totalAmount,
            status: o.status,
            paymentStatus: o.paymentStatus,
            createdAt: o.createdAt,
            products: o.products || [],
          })),
        },
      });
    }

    // List customers with aggregated spend and order counts
    const filter: any = { role: "customer" };
    if (search.trim()) {
      const regex = new RegExp(search.trim(), "i");
      filter.$or = [{ name: regex }, { email: regex }, { mobile: regex }];
    }

    const skip = (page - 1) * limit;
    const total = await User.countDocuments(filter);
    const users = await User.find(filter)
      .select("-password")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    // Aggregate spend and order counts for these users
    const userIds = users.map((u: any) => u._id);
    const orderStats = await Order.aggregate([
      { $match: { user: { $in: userIds } } },
      {
        $group: {
          _id: "$user",
          orderCount: { $sum: 1 },
          totalSpent: {
            $sum: { $cond: [{ $ne: ["$status", "cancelled"] }, "$totalAmount", 0] }
          },
          lastOrderDate: { $max: "$createdAt" }
        }
      }
    ]);

    const statsMap: Record<string, any> = {};
    orderStats.forEach((s) => {
      statsMap[s._id.toString()] = s;
    });

    const customers = users.map((u: any) => {
      const id = u._id.toString();
      const stats = statsMap[id] || { orderCount: 0, totalSpent: 0, lastOrderDate: null };
      return {
        id,
        name: u.name,
        email: u.email,
        mobile: u.mobile || "N/A",
        ordersCount: stats.orderCount,
        totalSpent: stats.totalSpent,
        lastOrder: stats.lastOrderDate,
        joinedDate: u.createdAt,
      };
    });

    return NextResponse.json({
      success: true,
      customers,
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