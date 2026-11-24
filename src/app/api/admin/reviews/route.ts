import { NextRequest, NextResponse } from "next/server";
import { verifyAdminSession } from "@/lib/adminAuth";
import connectToDatabase from "@/lib/mongoose";
import Review from "@/models/Review";
import Product from "@/models/Product";

export async function GET(req: NextRequest) {
  const auth = await verifyAdminSession();
  if (!auth.authorized) return auth.errorResponse!;

  try {
    await connectToDatabase();
    const reviews = await Review.find()
      .sort({ createdAt: -1 })
      .populate("product", "name image")
      .populate("user", "name email")
      .lean();

    return NextResponse.json({
      success: true,
      reviews: reviews.map((r: any) => ({
        id: r._id.toString(),
        productName: r.product?.name || "Product",
        productImage: r.product?.image || "/product-kadai.png",
        customerName: r.user?.name || "Customer",
        customerEmail: r.user?.email || "",
        rating: r.rating,
        title: r.title || "",
        comment: r.comment,
        status: r.status || "approved",
        verifiedPurchase: r.verifiedPurchase !== false,
        createdAt: r.createdAt,
      })),
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  const auth = await verifyAdminSession();
  if (!auth.authorized) return auth.errorResponse!;

  try {
    await connectToDatabase();
    const { id, status } = await req.json();

    if (!id || !status) {
      return NextResponse.json({ success: false, error: "Review ID and status are required." }, { status: 400 });
    }

    const updated = await Review.findByIdAndUpdate(id, { status }, { new: true });
    return NextResponse.json({ success: true, message: "Review status updated.", review: updated });
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
      return NextResponse.json({ success: false, error: "Review ID is required." }, { status: 400 });
    }

    await Review.findByIdAndDelete(id);
    return NextResponse.json({ success: true, message: "Review deleted." });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}