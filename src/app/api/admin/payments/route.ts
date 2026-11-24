import { NextRequest, NextResponse } from "next/server";
import { verifyAdminSession } from "@/lib/adminAuth";
import connectToDatabase from "@/lib/mongoose";
import Order from "@/models/Order";

export async function GET(req: NextRequest) {
  const auth = await verifyAdminSession();
  if (!auth.authorized) return auth.errorResponse!;

  try {
    await connectToDatabase();
    const { searchParams } = new URL(req.url);
    const method = searchParams.get("method") || "all";
    const status = searchParams.get("status") || "all";
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const limit = Math.max(1, Math.min(100, parseInt(searchParams.get("limit") || "15", 10)));

    const filter: any = {};
    if (method && method !== "all") filter.paymentMethod = method;
    if (status && status !== "all") filter.paymentStatus = status;

    // Overview KPIs
    const kpiAgg = await Order.aggregate([
      {
        $facet: {
          paid: [
            { $match: { paymentStatus: "paid" } },
            { $group: { _id: null, count: { $sum: 1 }, total: { $sum: "$totalAmount" } } }
          ],
          pending: [
            { $match: { paymentStatus: { $in: ["pending", "cod_pending"] } } },
            { $group: { _id: null, count: { $sum: 1 }, total: { $sum: "$totalAmount" } } }
          ],
          failed: [
            { $match: { paymentStatus: "failed" } },
            { $group: { _id: null, count: { $sum: 1 }, total: { $sum: "$totalAmount" } } }
          ],
          cod: [
            { $match: { paymentMethod: "cod" } },
            { $group: { _id: null, count: { $sum: 1 }, total: { $sum: "$totalAmount" } } }
          ],
          online: [
            { $match: { paymentMethod: "online" } },
            { $group: { _id: null, count: { $sum: 1 }, total: { $sum: "$totalAmount" } } }
          ]
        }
      }
    ]);

    const kpi = kpiAgg[0] || {};
    const summary = {
      totalPaid: kpi.paid?.[0]?.total || 0,
      paidCount: kpi.paid?.[0]?.count || 0,
      totalPending: kpi.pending?.[0]?.total || 0,
      pendingCount: kpi.pending?.[0]?.count || 0,
      totalFailed: kpi.failed?.[0]?.total || 0,
      failedCount: kpi.failed?.[0]?.count || 0,
      codTotal: kpi.cod?.[0]?.total || 0,
      codCount: kpi.cod?.[0]?.count || 0,
      onlineTotal: kpi.online?.[0]?.total || 0,
      onlineCount: kpi.online?.[0]?.count || 0,
    };

    const skip = (page - 1) * limit;
    const total = await Order.countDocuments(filter);
    const orders = await Order.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("user", "name email")
      .lean();

    const payments = orders.map((o: any) => {
      const addr = typeof o.shippingAddress === "object" ? o.shippingAddress : {};
      return {
        id: o._id.toString(),
        orderNumber: o._id.toString().slice(-6).toUpperCase(),
        customer: addr.fullName || o.user?.name || "Customer",
        amount: o.totalAmount,
        method: o.paymentMethod || "cod",
        status: o.paymentStatus || "pending",
        transactionId: o.razorpayPaymentId || o.razorpayOrderId || "COD",
        date: o.createdAt,
      };
    });

    return NextResponse.json({
      success: true,
      summary,
      payments,
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