import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import connectToDatabase from "@/lib/mongoose";
import InventoryLog from "@/models/InventoryLog";

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user || (session.user as any).role !== "admin") {
      return NextResponse.json({ message: "Unauthorized. Admin privileges required." }, { status: 401 });
    }

    await connectToDatabase();
    const logs = await InventoryLog.find()
      .populate("product", "name category image")
      .populate("order", "_id status")
      .sort({ createdAt: -1 })
      .limit(100)
      .lean();

    const formatted = logs.map((l: any) => ({
      ...l,
      _id: l._id.toString()
    }));

    return NextResponse.json(formatted);

  } catch (error) {
    return NextResponse.json({ message: "Failed to fetch inventory logs", error: (error as Error).message }, { status: 500 });
  }
}
