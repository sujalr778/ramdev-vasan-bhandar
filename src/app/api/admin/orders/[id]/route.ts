import { NextRequest, NextResponse } from "next/server";
import { verifyAdminSession } from "@/lib/adminAuth";
import connectToDatabase from "@/lib/mongoose";
import Order from "@/models/Order";
import Product from "@/models/Product";
import { logInventoryMovement } from "@/lib/inventory";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await verifyAdminSession();
  if (!auth.authorized) return auth.errorResponse!;

  try {
    await connectToDatabase();
    const { id } = await params;

    const order = await Order.findById(id)
      .populate("user", "name email createdAt")
      .populate("products.product", "name image price category sku material")
      .lean();

    if (!order) {
      return NextResponse.json({ success: false, error: "Order not found." }, { status: 404 });
    }

    const addr = typeof (order as any).shippingAddress === "object" ? (order as any).shippingAddress : {};

    return NextResponse.json({
      success: true,
      order: {
        id: (order as any)._id.toString(),
        orderNumber: (order as any)._id.toString().slice(-6).toUpperCase(),
        createdAt: (order as any).createdAt,
        updatedAt: (order as any).updatedAt,
        status: (order as any).status,
        paymentMethod: (order as any).paymentMethod || "cod",
        paymentStatus: (order as any).paymentStatus || "pending",
        subtotal: (order as any).subtotal || (order as any).totalAmount,
        deliveryCharge: (order as any).deliveryCharge || 0,
        discount: (order as any).discount || 0,
        totalAmount: (order as any).totalAmount,
        customer: {
          name: addr.fullName || (order as any).user?.name || "Customer",
          email: addr.email || (order as any).user?.email || "",
          mobile: addr.mobile || "",
          addressLine: addr.addressLine || "",
          city: addr.city || "",
          state: addr.state || "",
          pincode: addr.pincode || "",
        },
        products: ((order as any).products || []).map((item: any) => ({
          productId: item.product?._id?.toString() || "",
          name: item.product?.name || "Product",
          image: item.product?.image || "/product-kadai.png",
          sku: item.product?.sku || "",
          category: item.product?.category || "",
          quantity: item.quantity,
          priceAtTime: item.priceAtTime,
          total: item.quantity * item.priceAtTime,
        })),
        razorpayOrderId: (order as any).razorpayOrderId,
        razorpayPaymentId: (order as any).razorpayPaymentId,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await verifyAdminSession();
  if (!auth.authorized) return auth.errorResponse!;

  try {
    await connectToDatabase();
    const { id } = await params;
    const body = await req.json();
    const { status, paymentStatus } = body;

    const order = await Order.findById(id);
    if (!order) {
      return NextResponse.json({ success: false, error: "Order not found." }, { status: 404 });
    }

    const previousStatus = order.status;

    // Inventory Rollback Safeguard if cancelled
    if (status && status === "cancelled" && previousStatus !== "cancelled") {
      for (const item of order.products) {
        if (item.product) {
          const product = await Product.findById(item.product);
          if (product) {
            const prevStock = product.stock;
            const newStock = prevStock + item.quantity;
            await Product.findByIdAndUpdate(item.product, { $inc: { stock: item.quantity } });
            await logInventoryMovement({
              productId: item.product.toString(),
              previousStock: prevStock,
              newStock,
              changeQuantity: item.quantity,
              reason: "order_cancelled",
              orderId: order._id.toString(),
              adminUserId: auth.user!.id,
            });
          }
        }
      }
    }

    if (status) order.status = status;
    if (paymentStatus) order.paymentStatus = paymentStatus;

    await order.save();

    return NextResponse.json({
      success: true,
      message: "Order updated successfully.",
      order: {
        id: order._id.toString(),
        status: order.status,
        paymentStatus: order.paymentStatus,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}