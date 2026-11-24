import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import connectToDatabase from "@/lib/mongoose";
import Order from "@/models/Order";
import { getStoreGSTConfig, calculateOrderGST } from "@/lib/gst";

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ message: "Unauthorized. Please log in." }, { status: 401 });
    }

    const { id } = await params;
    await connectToDatabase();

    const order = await Order.findById(id)
      .populate("user", "name email")
      .populate("products.product", "name image category price")
      .lean();

    if (!order) {
      return NextResponse.json({ message: "Order not found." }, { status: 404 });
    }

    const userId = (session.user as any).id;
    const isAdmin = (session.user as any).role === "admin";
    const orderUserId = (order as any).user?._id ? (order as any).user._id.toString() : (order as any).user?.toString();

    if (!isAdmin && orderUserId !== userId) {
      return NextResponse.json({ message: "Forbidden: You do not have permission to access this invoice." }, { status: 403 });
    }

    const storeConfig = getStoreGSTConfig();
    const addr = typeof (order as any).shippingAddress === "object" ? (order as any).shippingAddress : {};
    const customerState = addr.state || "Gujarat";

    const subtotal = Number((order as any).subtotal || (order as any).totalAmount || 0);
    const discount = Number((order as any).discount || 0);
    const deliveryCharge = Number((order as any).deliveryCharge || 0);

    const gstBreakdown = calculateOrderGST({ subtotal, discount, customerState });

    const invoiceNumber = `INV-${storeConfig.invoicePrefix}-${(order as any)._id.toString().substring(0, 8).toUpperCase()}`;

    return NextResponse.json({
      invoiceNumber,
      invoiceDate: (order as any).createdAt,
      orderId: (order as any)._id.toString(),
      store: storeConfig,
      customer: {
        fullName: addr.fullName || (order as any).user?.name || "Customer",
        email: addr.email || (order as any).user?.email || "",
        mobile: addr.mobile || "",
        shippingAddress: addr
      },
      products: (order as any).products,
      subtotal,
      discount,
      deliveryCharge,
      gst: gstBreakdown,
      grandTotal: (order as any).totalAmount,
      paymentMethod: (order as any).paymentMethod,
      paymentStatus: (order as any).paymentStatus,
      status: (order as any).status
    });

  } catch (error) {
    return NextResponse.json({ message: "Failed to generate invoice", error: (error as Error).message }, { status: 500 });
  }
}
