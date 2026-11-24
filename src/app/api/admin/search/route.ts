import { NextRequest, NextResponse } from "next/server";
import { verifyAdminSession } from "@/lib/adminAuth";
import connectToDatabase from "@/lib/mongoose";
import Product from "@/models/Product";
import Order from "@/models/Order";
import User from "@/models/User";

export async function GET(req: NextRequest) {
  const auth = await verifyAdminSession();
  if (!auth.authorized) return auth.errorResponse!;

  try {
    await connectToDatabase();
    const { searchParams } = new URL(req.url);
    const q = (searchParams.get("q") || "").trim();

    if (!q || q.length < 2) {
      return NextResponse.json({ success: true, results: { products: [], orders: [], customers: [] } });
    }

    const regex = new RegExp(q, "i");

    // Search Products
    const products = await Product.find({
      $or: [{ name: regex }, { category: regex }, { sku: regex }, { material: regex }]
    })
      .limit(5)
      .select("name image category price stock sku")
      .lean();

    // Search Orders
    const orders = await Order.find({
      $or: [
        { "shippingAddress.fullName": regex },
        { "shippingAddress.mobile": regex },
        { "shippingAddress.email": regex },
        { razorpayOrderId: regex }
      ]
    })
      .limit(5)
      .select("totalAmount status paymentStatus shippingAddress createdAt")
      .lean();

    // Search Customers
    const customers = await User.find({
      role: "customer",
      $or: [{ name: regex }, { email: regex }, { mobile: regex }]
    })
      .limit(5)
      .select("name email mobile createdAt")
      .lean();

    return NextResponse.json({
      success: true,
      results: {
        products: products.map((p: any) => ({
          id: p._id.toString(),
          title: p.name,
          subtitle: p.category + " • ₹" + p.price + " • Stock: " + p.stock,
          image: p.image,
          link: "/admin/products",
        })),
        orders: orders.map((o: any) => ({
          id: o._id.toString(),
          title: "Order #" + o._id.toString().slice(-6).toUpperCase() + " • ₹" + o.totalAmount,
          subtitle: (typeof o.shippingAddress === "object" ? o.shippingAddress?.fullName : "Customer") + " • " + o.status,
          link: "/admin/orders/" + o._id.toString(),
        })),
        customers: customers.map((c: any) => ({
          id: c._id.toString(),
          title: c.name,
          subtitle: c.email + (c.mobile ? " • " + c.mobile : ""),
          link: "/admin/customers",
        })),
      },
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}