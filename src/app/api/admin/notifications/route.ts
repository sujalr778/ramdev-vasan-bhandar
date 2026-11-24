import { NextRequest, NextResponse } from "next/server";
import { verifyAdminSession } from "@/lib/adminAuth";
import connectToDatabase from "@/lib/mongoose";
import Order from "@/models/Order";
import Product from "@/models/Product";

export async function GET(req: NextRequest) {
  const auth = await verifyAdminSession();
  if (!auth.authorized) return auth.errorResponse!;

  try {
    await connectToDatabase();

    // Generate real dynamic notifications based on store state
    const notifications: any[] = [];

    // 1. Pending orders
    const pendingOrders = await Order.find({ status: "pending" })
      .sort({ createdAt: -1 })
      .limit(5)
      .lean();

    pendingOrders.forEach((o: any) => {
      notifications.push({
        id: "order_" + o._id.toString(),
        type: "new_order",
        title: "New Order Pending",
        message: "Order #" + o._id.toString().slice(-6).toUpperCase() + " of ₹" + o.totalAmount + " requires processing.",
        link: "/admin/orders/" + o._id.toString(),
        date: o.createdAt,
      });
    });

    // 2. Out of stock products
    const outOfStock = await Product.find({ stock: { $lte: 0 } })
      .limit(5)
      .select("name stock")
      .lean();

    outOfStock.forEach((p: any) => {
      notifications.push({
        id: "out_stock_" + p._id.toString(),
        type: "out_of_stock",
        title: "Out of Stock Alert",
        message: p.name + " is completely out of stock!",
        link: "/admin/inventory",
        date: new Date(),
      });
    });

    // 3. Low stock products
    const lowStock = await Product.find({ stock: { $gt: 0, $lte: 5 } })
      .limit(5)
      .select("name stock")
      .lean();

    lowStock.forEach((p: any) => {
      notifications.push({
        id: "low_stock_" + p._id.toString(),
        type: "low_stock",
        title: "Low Inventory Warning",
        message: p.name + " has only " + p.stock + " units left.",
        link: "/admin/inventory",
        date: new Date(),
      });
    });

    // 4. Failed payments
    const failedPayments = await Order.find({ paymentStatus: "failed" })
      .limit(3)
      .lean();

    failedPayments.forEach((o: any) => {
      notifications.push({
        id: "pay_failed_" + o._id.toString(),
        type: "payment_failed",
        title: "Payment Failed",
        message: "Order #" + o._id.toString().slice(-6).toUpperCase() + " online payment failed.",
        link: "/admin/orders/" + o._id.toString(),
        date: o.updatedAt || o.createdAt,
      });
    });

    return NextResponse.json({
      success: true,
      unreadCount: notifications.length,
      notifications,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}