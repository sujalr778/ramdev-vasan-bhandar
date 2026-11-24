import { NextRequest, NextResponse } from "next/server";
import { verifyAdminSession } from "@/lib/adminAuth";
import connectToDatabase from "@/lib/mongoose";
import Offer from "@/models/Offer";

export async function GET(req: NextRequest) {
  const auth = await verifyAdminSession();
  if (!auth.authorized) return auth.errorResponse!;

  try {
    await connectToDatabase();
    const offers = await Offer.find().sort({ createdAt: -1 }).lean();

    return NextResponse.json({
      success: true,
      offers: offers.map((o: any) => ({ ...o, id: o._id.toString() })),
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

    const { title, discountValue } = body;
    if (!title || discountValue === undefined) {
      return NextResponse.json({ success: false, error: "Title and discount value are required." }, { status: 400 });
    }

    const offer = await Offer.create({
      title: title.trim(),
      description: body.description?.trim() || "",
      badge: body.badge?.trim() || "Special Offer",
      bannerImage: body.bannerImage || "",
      discountType: body.discountType || "percentage",
      discountValue: Number(discountValue),
      applicableTo: body.applicableTo || "all",
      targetCategories: body.targetCategories || [],
      startDate: body.startDate ? new Date(body.startDate) : undefined,
      endDate: body.endDate ? new Date(body.endDate) : undefined,
      active: body.active !== undefined ? Boolean(body.active) : true,
    });

    return NextResponse.json({ success: true, message: "Offer created.", offer });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  const auth = await verifyAdminSession();
  if (!auth.authorized) return auth.errorResponse!;

  try {
    await connectToDatabase();
    const { id, ...updateData } = await req.json();

    if (!id) {
      return NextResponse.json({ success: false, error: "Offer ID required." }, { status: 400 });
    }

    const updated = await Offer.findByIdAndUpdate(id, updateData, { new: true });
    return NextResponse.json({ success: true, message: "Offer updated.", offer: updated });
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
      return NextResponse.json({ success: false, error: "Offer ID required." }, { status: 400 });
    }

    await Offer.findByIdAndDelete(id);
    return NextResponse.json({ success: true, message: "Offer deleted." });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}