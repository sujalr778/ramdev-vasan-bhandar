import { NextRequest, NextResponse } from "next/server";
import { verifyAdminSession } from "@/lib/adminAuth";
import connectToDatabase from "@/lib/mongoose";
import Product from "@/models/Product";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await verifyAdminSession();
  if (!auth.authorized) return auth.errorResponse!;

  try {
    await connectToDatabase();
    const { id } = await params;
    const product = await Product.findById(id).lean();

    if (!product) {
      return NextResponse.json({ success: false, error: "Product not found." }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      product: { ...product, id: (product as any)._id.toString() },
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await verifyAdminSession();
  if (!auth.authorized) return auth.errorResponse!;

  try {
    await connectToDatabase();
    const { id } = await params;
    const body = await req.json();

    if (body.price !== undefined && (isNaN(Number(body.price)) || Number(body.price) < 0)) {
      return NextResponse.json({ success: false, error: "Price cannot be negative." }, { status: 400 });
    }
    if (body.stock !== undefined && (isNaN(Number(body.stock)) || Number(body.stock) < 0)) {
      return NextResponse.json({ success: false, error: "Stock cannot be negative." }, { status: 400 });
    }

    const updateData: any = { ...body };
    delete updateData._id;
    delete updateData.id;

    const updated = await Product.findByIdAndUpdate(id, updateData, { new: true }).lean();

    if (!updated) {
      return NextResponse.json({ success: false, error: "Product not found." }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: "Product updated successfully.",
      product: { ...updated, id: (updated as any)._id.toString() },
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await verifyAdminSession();
  if (!auth.authorized) return auth.errorResponse!;

  try {
    await connectToDatabase();
    const { id } = await params;
    const deleted = await Product.findByIdAndDelete(id);

    if (!deleted) {
      return NextResponse.json({ success: false, error: "Product not found." }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: "Product deleted successfully." });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}