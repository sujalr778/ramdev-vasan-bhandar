import { NextRequest, NextResponse } from "next/server";
import { verifyAdminSession } from "@/lib/adminAuth";
import connectToDatabase from "@/lib/mongoose";
import Coupon from "@/models/Coupon";

export async function GET(req: NextRequest) {
  const auth = await verifyAdminSession();
  if (!auth.authorized) return auth.errorResponse!;

  try {
    await connectToDatabase();
    const coupons = await Coupon.find().sort({ createdAt: -1 }).lean();

    return NextResponse.json({
      success: true,
      coupons: coupons.map((c: any) => ({
        id: c._id.toString(),
        code: c.code,
        description: c.description || "",
        discountType: c.discountType,
        discountValue: c.discountValue,
        minOrderValue: c.minOrderValue || 0,
        maxDiscount: c.maxDiscount,
        expiryDate: c.expiryDate,
        usageLimit: c.usageLimit,
        usedCount: c.usedCount || 0,
        active: c.active !== false,
        createdAt: c.createdAt,
      })),
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const auth = await verifyAdminSession();
  if (!auth.authorized) return auth.errorResponse!;

  try {
    await connectToDatabase();
    const body = await req.json();

    const { code, discountType, discountValue } = body;
    if (!code || !discountType || discountValue === undefined) {
      return NextResponse.json(
        { success: false, error: "Coupon code, discount type, and discount value are required." },
        { status: 400 }
      );
    }

    const numValue = Number(discountValue);
    if (isNaN(numValue) || numValue <= 0) {
      return NextResponse.json({ success: false, error: "Discount value must be positive." }, { status: 400 });
    }

    const existing = await Coupon.findOne({ code: code.trim().toUpperCase() });
    if (existing) {
      return NextResponse.json({ success: false, error: "A coupon with this code already exists." }, { status: 400 });
    }

    const coupon = await Coupon.create({
      code: code.trim().toUpperCase(),
      description: body.description?.trim() || "",
      discountType: discountType === "percentage" ? "percentage" : "fixed",
      discountValue: numValue,
      minOrderValue: body.minOrderValue ? Number(body.minOrderValue) : 0,
      maxDiscount: body.maxDiscount ? Number(body.maxDiscount) : undefined,
      expiryDate: body.expiryDate ? new Date(body.expiryDate) : undefined,
      usageLimit: body.usageLimit ? Number(body.usageLimit) : undefined,
      active: body.active !== undefined ? Boolean(body.active) : true,
    });

    return NextResponse.json({
      success: true,
      message: "Coupon created successfully.",
      coupon: { ...coupon.toObject(), id: coupon._id.toString() },
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  const auth = await verifyAdminSession();
  if (!auth.authorized) return auth.errorResponse!;

  try {
    await connectToDatabase();
    const body = await req.json();
    const { id, ...updateData } = body;

    if (!id) {
      return NextResponse.json({ success: false, error: "Coupon ID is required." }, { status: 400 });
    }

    if (updateData.code) {
      updateData.code = updateData.code.trim().toUpperCase();
    }

    const updated = await Coupon.findByIdAndUpdate(id, updateData, { new: true });
    if (!updated) {
      return NextResponse.json({ success: false, error: "Coupon not found." }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: "Coupon updated.", coupon: updated });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const auth = await verifyAdminSession();
  if (!auth.authorized) return auth.errorResponse!;

  try {
    await connectToDatabase();
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ success: false, error: "Coupon ID is required." }, { status: 400 });
    }

    await Coupon.findByIdAndDelete(id);
    return NextResponse.json({ success: true, message: "Coupon deleted." });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}