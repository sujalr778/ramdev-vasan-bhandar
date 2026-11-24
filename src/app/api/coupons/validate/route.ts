import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongoose";
import Coupon from "@/models/Coupon";
import { rateLimit } from "@/lib/rateLimit";

export async function POST(request: Request) {
  try {
    const { code, subtotal } = await request.json();

    if (!code || typeof code !== "string") {
      return NextResponse.json({ message: "Coupon code is required." }, { status: 400 });
    }

    // Rate Limiting
    const limiter = rateLimit({ identifier: `coupon_val_${code}`, limit: 20 });
    if (!limiter.success) {
      return NextResponse.json({ message: "Too many coupon validation requests." }, { status: 429 });
    }

    const cleanCode = code.trim().toUpperCase();
    const orderSubtotal = Number(subtotal) || 0;

    await connectToDatabase();
    const coupon = await Coupon.findOne({ code: cleanCode, active: true });

    if (!coupon) {
      return NextResponse.json({ message: "Invalid or inactive coupon code." }, { status: 400 });
    }

    // Check expiry
    if (coupon.expiryDate && new Date() > new Date(coupon.expiryDate)) {
      return NextResponse.json({ message: "This coupon code has expired." }, { status: 400 });
    }

    // Check usage limit
    if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
      return NextResponse.json({ message: "This coupon has reached its maximum usage limit." }, { status: 400 });
    }

    // Check minimum order amount
    if (orderSubtotal < coupon.minOrderValue) {
      return NextResponse.json({
        message: `Minimum order amount of ₹${coupon.minOrderValue} required for coupon ${cleanCode}.`
      }, { status: 400 });
    }

    // Calculate discount amount server-side
    let discountAmount = 0;
    if (coupon.discountType === "percentage") {
      discountAmount = Math.round((orderSubtotal * (coupon.discountValue / 100)) * 100) / 100;
      if (coupon.maxDiscount && discountAmount > coupon.maxDiscount) {
        discountAmount = coupon.maxDiscount;
      }
    } else if (coupon.discountType === "fixed") {
      discountAmount = Math.min(coupon.discountValue, orderSubtotal);
    }

    return NextResponse.json({
      valid: true,
      code: coupon.code,
      discountType: coupon.discountType,
      discountValue: coupon.discountValue,
      discountAmount,
      message: `Coupon ${coupon.code} applied! You save ₹${discountAmount}.`
    });

  } catch (error) {
    return NextResponse.json({ message: "Failed to validate coupon", error: (error as Error).message }, { status: 500 });
  }
}
