import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import connectToDatabase from "@/lib/mongoose";
import Review from "@/models/Review";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ message: "Unauthorized." }, { status: 401 });
    }

    const { id } = await params;
    const { status, rating, title, comment } = await request.json();

    await connectToDatabase();
    const review = await Review.findById(id);

    if (!review) {
      return NextResponse.json({ message: "Review not found." }, { status: 404 });
    }

    const userId = (session.user as any).id;
    const isAdmin = (session.user as any).role === "admin";
    const reviewUserId = review.user?.toString();

    // Admin can update moderation status; Owner can update content
    if (status && isAdmin) {
      review.status = status;
    }

    if (reviewUserId === userId && !isAdmin) {
      if (rating) review.rating = Number(rating);
      if (title !== undefined) review.title = title;
      if (comment) review.comment = comment;
    }

    if (!isAdmin && reviewUserId !== userId) {
      return NextResponse.json({ message: "Forbidden: Cannot edit another user's review." }, { status: 403 });
    }

    await review.save();
    return NextResponse.json({ message: "Review updated successfully.", review });

  } catch (error) {
    return NextResponse.json({ message: "Failed to update review", error: (error as Error).message }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ message: "Unauthorized." }, { status: 401 });
    }

    const { id } = await params;
    await connectToDatabase();

    const review = await Review.findById(id);
    if (!review) {
      return NextResponse.json({ message: "Review not found." }, { status: 404 });
    }

    const userId = (session.user as any).id;
    const isAdmin = (session.user as any).role === "admin";
    const reviewUserId = review.user?.toString();

    if (!isAdmin && reviewUserId !== userId) {
      return NextResponse.json({ message: "Forbidden: Cannot delete another user's review." }, { status: 403 });
    }

    await Review.findByIdAndDelete(id);
    return NextResponse.json({ message: "Review deleted successfully." });

  } catch (error) {
    return NextResponse.json({ message: "Failed to delete review", error: (error as Error).message }, { status: 500 });
  }
}
