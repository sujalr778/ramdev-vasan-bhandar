import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import connectToDatabase from "@/lib/mongoose";
import Order from "@/models/Order";

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
      .populate("products.product", "name image category price description material capacity")
      .lean();

    if (!order) {
      return NextResponse.json({ message: "Order not found." }, { status: 404 });
    }

    const userId = (session.user as any).id;
    const isAdmin = (session.user as any).role === "admin";
    const orderUserId = (order as any).user?._id ? (order as any).user._id.toString() : (order as any).user?.toString();

    if (!isAdmin && orderUserId !== userId) {
      return NextResponse.json({ message: "Forbidden: You do not have permission to view this order." }, { status: 403 });
    }

    return NextResponse.json({
      ...order,
      _id: (order as any)._id.toString()
    });
  } catch (error) {
    return NextResponse.json({ message: "Failed to fetch order", error: (error as Error).message }, { status: 500 });
  }
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user || (session.user as any).role !== "admin") {
      return NextResponse.json({ message: "Unauthorized. Admin privileges required." }, { status: 401 });
    }

    const { id } = await params;
    const { status, paymentStatus } = await request.json();

    const validStatuses = ["pending", "confirmed", "processing", "shipped", "out_for_delivery", "delivered", "cancelled"];
    const validPaymentStatuses = ["cod_pending", "pending", "paid", "failed"];

    const updateFields: any = {};

    if (status) {
      if (!validStatuses.includes(status)) {
        return NextResponse.json({ message: `Invalid status: ${status}` }, { status: 400 });
      }
      updateFields.status = status;
    }

    if (paymentStatus) {
      if (!validPaymentStatuses.includes(paymentStatus)) {
        return NextResponse.json({ message: `Invalid payment status: ${paymentStatus}` }, { status: 400 });
      }
      updateFields.paymentStatus = paymentStatus;
    }

    await connectToDatabase();
    const updated = await Order.findByIdAndUpdate(id, updateFields, { new: true }).lean();

    if (!updated) {
      return NextResponse.json({ message: "Order not found" }, { status: 404 });
    }

    return NextResponse.json({
      message: "Order updated successfully",
      order: { ...updated, _id: (updated as any)._id.toString() }
    }, { status: 200 });

  } catch (error) {
    return NextResponse.json({ message: "Failed to update order", error: (error as Error).message }, { status: 500 });
  }
}
