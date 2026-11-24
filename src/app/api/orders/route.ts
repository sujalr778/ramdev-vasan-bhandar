import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import connectToDatabase from "@/lib/mongoose";
import Product from "@/models/Product";
import Order from "@/models/Order";
import Coupon from "@/models/Coupon";
import { checkPincodeServiceability, calculateDeliveryCharge } from "@/lib/delivery";
import { logInventoryMovement } from "@/lib/inventory";
import { rateLimit } from "@/lib/rateLimit";
import { db } from "@/lib/db";

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ message: "Please log in to place an order." }, { status: 401 });
    }

    const userId = (session.user as any).id;

    // Rate Limiting
    const limiter = rateLimit({ identifier: `order_${userId}`, limit: 15 });
    if (!limiter.success) {
      return NextResponse.json({ message: "Too many order requests. Please wait a moment." }, { status: 429 });
    }

    const body = await request.json();

    const { items, products: rawProducts, shippingAddress, paymentMethod = "cod", couponCode } = body;
    const cartItems = items || rawProducts || [];

    if (!cartItems || !Array.isArray(cartItems) || cartItems.length === 0) {
      return NextResponse.json({ message: "Your cart is empty." }, { status: 400 });
    }

    // 1. Customer Shipping Address & Contact Validation
    if (!shippingAddress || typeof shippingAddress !== "object") {
      return NextResponse.json({ message: "Invalid shipping address format." }, { status: 400 });
    }

    const { fullName, mobile, email, addressLine, city, state, pincode } = shippingAddress;

    if (!fullName || !fullName.trim()) {
      return NextResponse.json({ message: "Full Name is required." }, { status: 400 });
    }

    // 10-digit Indian Mobile Validation
    const cleanedMobile = (mobile || "").trim();
    if (!/^[6-9][0-9]{9}$/.test(cleanedMobile)) {
      return NextResponse.json({ message: "Please enter a valid 10-digit Indian mobile number." }, { status: 400 });
    }

    // Email format validation
    const cleanedEmail = (email || "").trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanedEmail)) {
      return NextResponse.json({ message: "Please enter a valid email address." }, { status: 400 });
    }

    if (!addressLine || !addressLine.trim() || !city || !city.trim() || !state || !state.trim()) {
      return NextResponse.json({ message: "Complete shipping address (street, city, state) is required." }, { status: 400 });
    }

    // Pincode validation & serviceability check
    const cleanedPincode = (pincode || "").trim();
    const pincodeCheck = checkPincodeServiceability(cleanedPincode);
    if (!pincodeCheck.serviceable) {
      return NextResponse.json({ message: pincodeCheck.message }, { status: 400 });
    }

    // 2. Connect to MongoDB (with graceful fallback if unconfigured locally)
    try {
      await connectToDatabase();
    } catch (dbError) {
      console.warn("MongoDB connection fallback for order placement:", (dbError as Error).message);
    }

    // 3. Server-side Product, Stock, and Price Validation
    const verifiedOrderItems = [];
    let serverSubtotal = 0;

    for (const item of cartItems) {
      const productId = item.id || item.product || item._id;
      const requestedQty = Math.max(1, parseInt(item.quantity || 1, 10));

      const productDoc: any = await db.products.findById(productId);

      if (!productDoc) {
        return NextResponse.json({
          message: `Product "${item.name || productId}" no longer exists in our catalog.`
        }, { status: 400 });
      }

      if (productDoc.stock !== undefined && productDoc.stock < requestedQty) {
        return NextResponse.json({
          message: `Insufficient stock for "${productDoc.name}". Available: ${productDoc.stock}, requested: ${requestedQty}.`
        }, { status: 400 });
      }

      const currentPrice = Number(productDoc.price);
      const itemTotal = currentPrice * requestedQty;
      serverSubtotal += itemTotal;

      verifiedOrderItems.push({
        product: productDoc._id,
        quantity: requestedQty,
        priceAtTime: currentPrice,
        productName: productDoc.name,
        previousStock: productDoc.stock || 100
      });
    }

    // 4. Server-Side Coupon Discount Calculation
    let serverDiscount = 0;
    let appliedCouponCode = "";

    if (couponCode && typeof couponCode === "string" && couponCode.trim()) {
      const cleanCode = couponCode.trim().toUpperCase();
      let couponDoc: any = null;
      try {
        couponDoc = await Coupon.findOne({ code: cleanCode, active: true });
      } catch (e) {
        // fallback ignore coupon check if mongo unconfigured
      }

      if (couponDoc) {
        const isNotExpired = !couponDoc.expiryDate || new Date() <= new Date(couponDoc.expiryDate);
        const isUnderLimit = !couponDoc.usageLimit || couponDoc.usedCount < couponDoc.usageLimit;
        const meetsMinOrder = serverSubtotal >= couponDoc.minOrderValue;

        if (isNotExpired && isUnderLimit && meetsMinOrder) {
          if (couponDoc.discountType === "percentage") {
            serverDiscount = Math.round((serverSubtotal * (couponDoc.discountValue / 100)) * 100) / 100;
            if (couponDoc.maxDiscount && serverDiscount > couponDoc.maxDiscount) {
              serverDiscount = couponDoc.maxDiscount;
            }
          } else if (couponDoc.discountType === "fixed") {
            serverDiscount = Math.min(couponDoc.discountValue, serverSubtotal);
          }

          appliedCouponCode = couponDoc.code;
          try {
            await Coupon.updateOne({ _id: couponDoc._id }, { $inc: { usedCount: 1 } });
          } catch (e) {}
        }
      }
    }

    // 5. Server-Side Delivery & Total Amount Calculation
    const deliveryRes = calculateDeliveryCharge({ subtotal: serverSubtotal, pincode: cleanedPincode });
    const serverDeliveryCharge = deliveryRes.deliveryCharge;
    const taxableSubtotal = Math.max(0, serverSubtotal - serverDiscount);
    const serverTotalAmount = taxableSubtotal + serverDeliveryCharge;

    // 6. Inventory Decrement Safeguard & Logging
    const decrementedProducts: { id: any; qty: number; prev: number }[] = [];

    try {
      for (const item of verifiedOrderItems) {
        try {
          await db.products.updateOne(item.product, { $inc: { stock: -item.quantity } });
        } catch (e) {}

        decrementedProducts.push({ id: item.product, qty: item.quantity, prev: item.previousStock });
      }
    } catch (stockError) {
      return NextResponse.json({ message: (stockError as Error).message }, { status: 400 });
    }

    // 7. Create Order Record (MongoDB Atlas with fallback)
    const isCod = paymentMethod.toLowerCase() === "cod";
    const orderStatus = isCod ? "confirmed" : "pending";
    const paymentStatus = isCod ? "cod_pending" : "pending";

    const orderPayload = {
      user: userId,
      products: verifiedOrderItems.map(({ product, quantity, priceAtTime }) => ({
        product,
        quantity,
        priceAtTime
      })),
      subtotal: serverSubtotal,
      deliveryCharge: serverDeliveryCharge,
      discount: serverDiscount,
      totalAmount: serverTotalAmount,
      couponCode: appliedCouponCode,
      paymentMethod: isCod ? "cod" : "online",
      paymentStatus,
      status: orderStatus,
      shippingAddress: {
        fullName: fullName.trim(),
        mobile: cleanedMobile,
        email: cleanedEmail,
        addressLine: addressLine.trim(),
        city: city.trim(),
        state: state.trim(),
        pincode: cleanedPincode
      }
    };

    const newOrder: any = await db.orders.create(orderPayload);

    // 8. Record Inventory Logs
    for (const item of decrementedProducts) {
      try {
        await logInventoryMovement({
          productId: item.id.toString(),
          previousStock: item.prev,
          newStock: Math.max(0, item.prev - item.qty),
          changeQuantity: -item.qty,
          reason: "order_placed",
          orderId: newOrder._id ? newOrder._id.toString() : "ord_" + Date.now()
        });
      } catch (e) {}
    }

    const orderIdStr = newOrder._id ? newOrder._id.toString() : newOrder.id;

    return NextResponse.json({
      message: isCod ? "Order placed successfully via Cash on Delivery!" : "Order created. Payment pending.",
      orderId: orderIdStr,
      totalAmount: serverTotalAmount,
      discount: serverDiscount,
      paymentMethod: newOrder.paymentMethod || (isCod ? "cod" : "online"),
      paymentStatus: newOrder.paymentStatus || paymentStatus,
      status: newOrder.status || orderStatus
    }, { status: 201 });

  } catch (error) {
    console.error("Order creation error:", error);
    return NextResponse.json({ message: "Failed to place order", error: (error as Error).message }, { status: 500 });
  }
}

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const userId = (session.user as any).id;
    const isAdmin = (session.user as any).role === "admin";

    const query = isAdmin ? {} : { user: userId };
    const orders = await db.orders.findMany(query);

    return NextResponse.json(orders);
  } catch (error) {
    return NextResponse.json({ message: "Failed to fetch orders", error: (error as Error).message }, { status: 500 });
  }
}
