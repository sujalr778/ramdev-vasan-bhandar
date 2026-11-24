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
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const limit = Math.max(1, Math.min(100, parseInt(searchParams.get("limit") || "15", 10)));
    const status = searchParams.get("status") || "";
    const paymentStatus = searchParams.get("paymentStatus") || "";
    const paymentMethod = searchParams.get("paymentMethod") || "";
    const search = searchParams.get("search") || "";

    const filter: any = {};

    if (status && status !== "all") {
      if (status === "processing") {
        filter.status = { $in: ["processing", "confirmed"] };
      } else {
        filter.status = status;
      }
    }

    if (paymentStatus && paymentStatus !== "all") {
      filter.paymentStatus = paymentStatus;
    }

    if (paymentMethod && paymentMethod !== "all") {
      filter.paymentMethod = paymentMethod;
    }

    if (search.trim()) {
      const regex = new RegExp(search.trim(), "i");
      filter.$or = [
        { "shippingAddress.fullName": regex },
        { "shippingAddress.mobile": regex },
        { "shippingAddress.email": regex },
        { "shippingAddress.city": regex },
        { "shippingAddress.pincode": regex },
        { razorpayOrderId: regex },
      ];
    }

    const skip = (page - 1) * limit;
    const total = await Order.countDocuments(filter);

    const orders = await Order.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("user", "name email")
      .populate("products.product", "name image price")
      .lean();

    // Counts for tabs
    const statusCountsAgg = await Order.aggregate([
      { $group: { _id: "$status", count: { $sum: 1 } } }
    ]);
    const tabCounts: Record<string, number> = {
      all: 0,
      pending: 0,
      processing: 0,
      shipped: 0,
      delivered: 0,
      cancelled: 0,
    };
    statusCountsAgg.forEach((s) => {
      const st = (s._id || "").toLowerCase();
      if (st in tabCounts) {
        tabCounts[st] += s.count;
      } else if (st === "confirmed") {
        tabCounts["processing"] += s.count;
      }
      tabCounts.all += s.count;
    });

    const formatted = orders.map((o: any) => {
      const addr = typeof o.shippingAddress === "object" ? o.shippingAddress : {};
      return {
        id: o._id.toString(),
        orderNumber: o._id.toString().slice(-6).toUpperCase(),
        customer: {
          name: addr.fullName || o.user?.name || "Customer",
          email: addr.email || o.user?.email || "",
          mobile: addr.mobile || "",
          city: addr.city || "",
          state: addr.state || "",
          pincode: addr.pincode || "",
          addressLine: addr.addressLine || "",
        },
        itemsCount: (o.products || []).reduce((acc: number, item: any) => acc + (item.quantity || 1), 0),
        products: (o.products || []).map((item: any) => ({
          name: item.product?.name || "Product",
          image: item.product?.image || "/product-kadai.png",
          quantity: item.quantity,
          price: item.priceAtTime,
          total: (item.quantity || 1) * (item.priceAtTime || 0),
        })),
        subtotal: o.subtotal || o.totalAmount,
        deliveryCharge: o.deliveryCharge || 0,
        discount: o.discount || 0,
        totalAmount: o.totalAmount,
        paymentMethod: o.paymentMethod || "cod",
        paymentStatus: o.paymentStatus || "pending",
        status: o.status || "pending",
        createdAt: o.createdAt,
      };
    });

    return NextResponse.json({
      success: true,
      orders: formatted,
      tabCounts,
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