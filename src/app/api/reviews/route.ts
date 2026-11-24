import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import connectToDatabase from "@/lib/mongoose";
import Review from "@/models/Review";
import Order from "@/models/Order";
import Product from "@/models/Product";

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ message: "Please log in to submit a review." }, { status: 401 });
    }

    const userId = (session.user as any).id;
    const { productId, rating, title, comment, images } = await request.json();

    if (!productId || !rating || !comment) {
      return NextResponse.json({ message: "Product, rating (1-5), and comment are required." }, { status: 400 });
    }

    const numRating = Number(rating);
    if (numRating < 1 || numRating > 5) {
      return NextResponse.json({ message: "Rating must be between 1 and 5 stars." }, { status: 400 });
    }

    await connectToDatabase();

    // 1. Verify product exists
    const productDoc = await Product.findById(productId);
    if (!productDoc) {
      return NextResponse.json({ message: "Product not found." }, { status: 404 });
    }

    // 2. Server-side Verified Purchase Check: Must have a delivered order containing this product
    const deliveredOrder = await Order.findOne({
      user: userId,
      status: "delivered",
      "products.product": productId
    });

    if (!deliveredOrder) {
      return NextResponse.json({
        message: "Verified purchase required. You can only review products from delivered orders."
      }, { status: 400 });
    }

    // 3. Prevent duplicate review for the same product by the same user
    const existingReview = await Review.findOne({ user: userId, product: productId });
    if (existingReview) {
      return NextResponse.json({ message: "You have already submitted a review for this product." }, { status: 400 });
    }

    // 4. Save Verified Review
    const newReview = await Review.create({
      user: userId,
      product: productId,
      order: deliveredOrder._id,
      rating: numRating,
      title: title ? title.trim() : "",
      comment: comment.trim(),
      images: Array.isArray(images) ? images : [],
      verifiedPurchase: true,
      status: "approved"
    });

    // Update product rating and reviews count on Product model
    const reviews = await Review.find({ product: productId, status: "approved" });
    const totalReviews = reviews.length;
    const avgRating = totalReviews > 0
      ? Math.round((reviews.reduce((acc, r) => acc + r.rating, 0) / totalReviews) * 10) / 10
      : 5;

    await Product.findByIdAndUpdate(productId, {
      rating: avgRating,
      reviews: totalReviews
    });

    return NextResponse.json({ message: "Review submitted successfully!", review: newReview }, { status: 201 });

  } catch (error) {
    return NextResponse.json({ message: "Failed to submit review", error: (error as Error).message }, { status: 500 });
  }
}

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user || (session.user as any).role !== "admin") {
      return NextResponse.json({ message: "Unauthorized. Admin access required." }, { status: 401 });
    }

    await connectToDatabase();
    const reviews = await Review.find()
      .populate("user", "name email")
      .populate("product", "name image category")
      .sort({ createdAt: -1 })
      .lean();

    const formatted = reviews.map((r: any) => ({
      ...r,
      _id: r._id.toString()
    }));

    return NextResponse.json(formatted);
  } catch (error) {
    return NextResponse.json({ message: "Failed to fetch reviews", error: (error as Error).message }, { status: 500 });
  }
}
