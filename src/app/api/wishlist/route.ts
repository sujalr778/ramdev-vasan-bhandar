import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import connectToDatabase from "@/lib/mongoose";
import Wishlist from "@/models/Wishlist";
import Product from "@/models/Product";
import { rateLimit } from "@/lib/rateLimit";

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ message: "Unauthorized. Please log in." }, { status: 401 });
    }

    const userId = (session.user as any).id;
    await connectToDatabase();

    const wishlist = await Wishlist.findOne({ user: userId })
      .populate("products")
      .lean();

    const products = wishlist && Array.isArray(wishlist.products)
      ? wishlist.products.map((p: any) => ({ ...p, _id: p._id.toString() }))
      : [];

    return NextResponse.json({ products });
  } catch (error) {
    return NextResponse.json({ message: "Failed to fetch wishlist", error: (error as Error).message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ message: "Please log in to save items to your wishlist." }, { status: 401 });
    }

    const userId = (session.user as any).id;

    // Rate Limiting
    const limiter = rateLimit({ identifier: `wishlist_${userId}`, limit: 30 });
    if (!limiter.success) {
      return NextResponse.json({ message: "Too many requests. Please wait a moment." }, { status: 429 });
    }

    const { productId } = await request.json();

    if (!productId) {
      return NextResponse.json({ message: "productId is required." }, { status: 400 });
    }

    await connectToDatabase();

    // Verify product exists
    const productDoc = await Product.findById(productId);
    if (!productDoc) {
      return NextResponse.json({ message: "Product not found." }, { status: 404 });
    }

    const updatedWishlist = await Wishlist.findOneAndUpdate(
      { user: userId },
      { $addToSet: { products: productId } },
      { upsert: true, new: true }
    ).populate("products");

    return NextResponse.json({ message: "Item added to wishlist!", wishlist: updatedWishlist });

  } catch (error) {
    return NextResponse.json({ message: "Failed to add to wishlist", error: (error as Error).message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ message: "Unauthorized." }, { status: 401 });
    }

    const userId = (session.user as any).id;
    const { searchParams } = new URL(request.url);
    const productId = searchParams.get("productId");

    if (!productId) {
      return NextResponse.json({ message: "productId parameter is required." }, { status: 400 });
    }

    await connectToDatabase();

    await Wishlist.findOneAndUpdate(
      { user: userId },
      { $pull: { products: productId } }
    );

    return NextResponse.json({ message: "Item removed from wishlist." });

  } catch (error) {
    return NextResponse.json({ message: "Failed to remove from wishlist", error: (error as Error).message }, { status: 500 });
  }
}
