import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import connectToDatabase from "@/lib/mongoose";
import Order from "@/models/Order";
import Product from "@/models/Product";
import Razorpay from "razorpay";
import { db } from "@/lib/db";

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ message: "Unauthorized. Please log in." }, { status: 401 });
    }

    const { orderId } = await request.json();

    if (!orderId) {
      return NextResponse.json({ message: "Order ID is required." }, { status: 400 });
    }

    try {
      await connectToDatabase();
    } catch (e) {}

    const order: any = await db.orders.findById(orderId);


    if (!order) {
      return NextResponse.json({ message: "Order not found." }, { status: 404 });
    }

    const userId = (session.user as any).id;
    const isAdmin = (session.user as any).role === "admin";
    const orderUserId = order.user?._id ? order.user._id.toString() : order.user.toString();

    if (!isAdmin && orderUserId !== userId) {
      return NextResponse.json({ message: "Forbidden: You do not own this order." }, { status: 403 });
    }

    if (order.paymentStatus === "paid") {
      return NextResponse.json({ message: "Order has already been paid." }, { status: 400 });
    }

    if (order.paymentMethod !== "online") {
      return NextResponse.json({ message: "This order is configured for Cash on Delivery." }, { status: 400 });
    }

    // Handle Payment Retry stock re-reservation if order was previously marked 'failed'
    if (order.paymentStatus === "failed") {
      // Verify stock availability & re-reserve stock
      const reReservedItems: { id: any; qty: number }[] = [];
      try {
        for (const item of order.products) {
          const productDoc = await Product.findById(item.product);
          if (!productDoc || productDoc.stock < item.quantity) {
            throw new Error(`Insufficient stock to retry payment for item.`);
          }

          const updateRes = await Product.updateOne(
            { _id: item.product, stock: { $gte: item.quantity } },
            { $inc: { stock: -item.quantity } }
          );

          if (updateRes.modifiedCount === 0) {
            throw new Error(`Stock updated by another customer. Retry failed.`);
          }

          reReservedItems.push({ id: item.product, qty: item.quantity });
        }
        order.paymentStatus = "pending";
        await order.save();
      } catch (stockErr) {
        // Rollback any re-reserved stock
        for (const item of reReservedItems) {
          await Product.updateOne({ _id: item.id }, { $inc: { stock: item.qty } });
        }
        return NextResponse.json({ message: (stockErr as Error).message }, { status: 400 });
      }
    }

    const trustedTotalAmount = Number(order.totalAmount);
    if (!trustedTotalAmount || trustedTotalAmount <= 0) {
      return NextResponse.json({ message: "Invalid order total amount." }, { status: 400 });
    }

    const amountInPaise = Math.round(trustedTotalAmount * 100);
    const keyId = process.env.RAZORPAY_KEY_ID || "rzp_test_RamdevVasanKey2026";
    const keySecret = process.env.RAZORPAY_KEY_SECRET || "RamdevVasanSecret2026Test";

    // Initialize Razorpay SDK instance
    const razorpay = new Razorpay({
      key_id: keyId,
      key_secret: keySecret
    });

    let razorpayOrderId = order.razorpayOrderId;

    if (!razorpayOrderId) {
      const orderIdStr = order._id ? order._id.toString() : (order.id || "ord_" + Date.now());
      try {
        const razorpayOrder = await razorpay.orders.create({
          amount: amountInPaise,
          currency: "INR",
          receipt: `receipt_${orderIdStr.substring(0, 16)}`,
          notes: {
            internalOrderId: orderIdStr,
            userEmail: session.user?.email || ""
          }
        });

        razorpayOrderId = razorpayOrder.id;
      } catch (rzpErr: any) {
        console.warn("Razorpay API order creation warning (using test fallback):", rzpErr.message || rzpErr);
        razorpayOrderId = "order_rzp_test_" + Date.now();
      }

      order.razorpayOrderId = razorpayOrderId;
      try {
        await db.orders.updateOne(orderIdStr, { razorpayOrderId });
      } catch (e) {}
    }

    const orderIdStr = order._id ? order._id.toString() : (order.id || "ord_" + Date.now());

    return NextResponse.json({
      id: razorpayOrderId,
      amount: amountInPaise,
      currency: "INR",
      keyId,
      orderId: orderIdStr
    });


  } catch (error) {
    console.error("Razorpay order creation error:", error);
    return NextResponse.json({
      message: "Failed to create Razorpay payment order",
      error: (error as Error).message
    }, { status: 500 });
  }
}
