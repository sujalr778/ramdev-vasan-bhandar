import { NextRequest, NextResponse } from "next/server";
import { verifyAdminSession } from "@/lib/adminAuth";
import connectToDatabase from "@/lib/mongoose";
import Banner from "@/models/Banner";

export async function GET(req: NextRequest) {
  const auth = await verifyAdminSession();
  if (!auth.authorized) return auth.errorResponse!;

  try {
    await connectToDatabase();
    const banners = await Banner.find().sort({ displayOrder: 1, createdAt: -1 }).lean();

    return NextResponse.json({
      success: true,
      banners: banners.map((b: any) => ({ ...b, id: b._id.toString() })),
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
    const { title, subtitle, imageUrl, linkUrl, type, displayOrder, active } = await req.json();

    if (!title || !imageUrl) {
      return NextResponse.json({ success: false, error: "Title and Image URL are required." }, { status: 400 });
    }

    const banner = await Banner.create({
      title: title.trim(),
      subtitle: subtitle?.trim() || "",
      imageUrl: imageUrl.trim(),
      linkUrl: linkUrl?.trim() || "/shop",
      type: type || "hero",
      displayOrder: Number(displayOrder) || 0,
      active: active !== undefined ? Boolean(active) : true,
    });

    return NextResponse.json({ success: true, message: "Banner created.", banner });
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
      return NextResponse.json({ success: false, error: "Banner ID is required." }, { status: 400 });
    }

    const updated = await Banner.findByIdAndUpdate(id, updateData, { new: true });
    return NextResponse.json({ success: true, message: "Banner updated.", banner: updated });
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
      return NextResponse.json({ success: false, error: "Banner ID is required." }, { status: 400 });
    }

    await Banner.findByIdAndDelete(id);
    return NextResponse.json({ success: true, message: "Banner deleted." });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}