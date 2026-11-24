import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import connectToDatabase from "@/lib/mongoose";
import Product from "@/models/Product";

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await connectToDatabase();
    const product = await Product.findById(id).lean();

    if (!product) {
      return NextResponse.json({ message: "Product not found" }, { status: 404 });
    }

    return NextResponse.json({
      ...product,
      _id: (product as any)._id.toString()
    });
  } catch (error) {
    return NextResponse.json({ message: "Failed to fetch product", error: (error as Error).message }, { status: 500 });
  }
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user || (session.user as any).role !== "admin") {
      return NextResponse.json({ message: "Unauthorized. Admin access required." }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();

    const {
      name,
      category,
      price,
      originalPrice,
      discount,
      stock,
      material,
      capacity,
      description,
      specifications,
      stoveCompatibility,
      image,
      images
    } = body;

    if (!name || price === undefined || stock === undefined) {
      return NextResponse.json({ message: "Name, price, and stock are required." }, { status: 400 });
    }

    await connectToDatabase();

    const updateFields: any = {
      name: name.trim(),
      category: category ? category.trim() : "Cookware",
      price: Number(price),
      stock: Math.max(0, Number(stock)),
    };

    if (originalPrice !== undefined) updateFields.originalPrice = Number(originalPrice);
    if (discount !== undefined) updateFields.discount = Number(discount);
    if (material !== undefined) updateFields.material = material.trim();
    if (capacity !== undefined) updateFields.capacity = capacity.trim();
    if (description !== undefined) updateFields.description = description.trim();
    if (specifications !== undefined) updateFields.specifications = specifications;
    if (stoveCompatibility !== undefined) updateFields.stoveCompatibility = stoveCompatibility.trim();
    if (image !== undefined) updateFields.image = image.trim();
    if (images !== undefined && Array.isArray(images)) updateFields.images = images.map((i: string) => i.trim());

    const updatedProduct = await Product.findByIdAndUpdate(id, updateFields, { new: true }).lean();

    if (!updatedProduct) {
      return NextResponse.json({ message: "Product not found" }, { status: 404 });
    }

    return NextResponse.json({
      message: "Product updated successfully",
      product: { ...updatedProduct, _id: (updatedProduct as any)._id.toString() }
    }, { status: 200 });

  } catch (error) {
    return NextResponse.json({ message: "Failed to update product", error: (error as Error).message }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user || (session.user as any).role !== "admin") {
      return NextResponse.json({ message: "Unauthorized. Admin access required." }, { status: 401 });
    }

    const { id } = await params;
    await connectToDatabase();
    const deleted = await Product.findByIdAndDelete(id);

    if (!deleted) {
      return NextResponse.json({ message: "Product not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Product deleted successfully" }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: "Failed to delete product", error: (error as Error).message }, { status: 500 });
  }
}
