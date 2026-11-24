import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import connectToDatabase from "@/lib/mongoose";
import Coupon from "@/models/Coupon";

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user || (session.user as any).role !== "admin") {
      return NextResponse.json({ message: "Unauthorized. Admin privileges required." }, { status: 401 });
    }

    await connectToDatabase();
    const coupons = await Coupon.find().sort({ createdAt: -1 }).lean();

    const formatted = coupons.map((c: any) => ({
      ...c,
      _id: c._id.toString()
    }));

    return NextResponse.json(formatted);
  } catch (error) {
    return NextResponse.json({ message: "Failed to fetch coupons", error: (error as Error).message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user || (session.user as any).role !== "admin") {
      return NextResponse.json({ message: "Unauthorized. Admin privileges required." }, { status: 401 });
    }

    const { code, description, discountType, discountValue, minOrderValue, maxDiscount, expiryDate, usageLimit, active } = await request.json();

    if (!code || !discountType || discountValue === undefined) {
      return NextResponse.json({ message: "Code, discountType, and discountValue are required." }, { status: 400 });
    }

    await connectToDatabase();

    const cleanCode = code.trim().toUpperCase();
    const existing = await Coupon.findOne({ code: cleanCode });
    if (existing) {
      return NextResponse.json({ message: `Coupon code '${cleanCode}' already exists.` }, { status: 400 });
    }

    const newCoupon = await Coupon.create({
      code: cleanCode,
      description: description ? description.trim() : "",
      discountType,
      discountValue: Number(discountValue),
      minOrderValue: Number(minOrderValue) || 0,
      maxDiscount: maxDiscount ? Number(maxDiscount) : undefined,
      expiryDate: expiryDate ? new Date(expiryDate) : undefined,
      usageLimit: usageLimit ? Number(usageLimit) : undefined,
      active: active !== undefined ? Boolean(active) : true,
    });

    return NextResponse.json({ message: "Coupon created successfully!", coupon: newCoupon }, { status: 201 });

  } catch (error) {
    return NextResponse.json({ message: "Failed to create coupon", error: (error as Error).message }, { status: 500 });
  }
}
