import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const keyId = process.env.RAZORPAY_KEY_ID || "rzp_test_RamdevVasanKey2026";
    return NextResponse.json({ keyId });
  } catch (error) {
    return NextResponse.json({ message: "Failed to load payment configuration" }, { status: 500 });
  }
}
