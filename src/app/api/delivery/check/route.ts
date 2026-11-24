import { NextResponse } from "next/server";
import { checkPincodeServiceability } from "@/lib/delivery";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const pincode = searchParams.get("pincode") || "";

    const result = checkPincodeServiceability(pincode);
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      { serviceable: false, estimatedDays: null, message: "Invalid pincode check request" },
      { status: 400 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const { pincode } = await request.json();
    const result = checkPincodeServiceability(pincode || "");
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      { serviceable: false, estimatedDays: null, message: "Invalid pincode check request" },
      { status: 400 }
    );
  }
}
