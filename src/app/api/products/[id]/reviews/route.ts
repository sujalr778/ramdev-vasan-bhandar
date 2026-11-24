import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongoose";
import Review from "@/models/Review";

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    try {
      await connectToDatabase();
    } catch (e) {
      return NextResponse.json({
        averageRating: 5,
        totalReviews: 0,
        ratingCounts: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
        reviews: []
      });
    }


    const reviews = await Review.find({ product: id, status: "approved" })
      .populate("user", "name")
      .sort({ createdAt: -1 })
      .lean();

    const totalReviews = reviews.length;
    const ratingCounts = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };

    let totalSum = 0;
    reviews.forEach((r: any) => {
      totalSum += r.rating;
      const rKey = Math.min(5, Math.max(1, Math.round(r.rating))) as 1 | 2 | 3 | 4 | 5;
      ratingCounts[rKey] = (ratingCounts[rKey] || 0) + 1;
    });

    const averageRating = totalReviews > 0 ? Math.round((totalSum / totalReviews) * 10) / 10 : 5;

    const formattedReviews = reviews.map((r: any) => ({
      _id: r._id.toString(),
      user: r.user?.name || "Verified Customer",
      rating: r.rating,
      title: r.title,
      comment: r.comment,
      images: r.images,
      verifiedPurchase: r.verifiedPurchase,
      createdAt: r.createdAt
    }));

    return NextResponse.json({
      averageRating,
      totalReviews,
      ratingCounts,
      reviews: formattedReviews
    });
  } catch (error) {
    return NextResponse.json({ message: "Failed to fetch product reviews", error: (error as Error).message }, { status: 500 });
  }
}
