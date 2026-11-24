import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import connectToDatabase from "@/lib/mongoose";
import B2BEnquiry from "@/models/B2BEnquiry";
import { rateLimit } from "@/lib/rateLimit";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { companyName, contactPerson, mobile, email, gstin, productName, quantity, message } = body;

    if (!contactPerson || !mobile || !email || !message) {
      return NextResponse.json({ message: "Contact person, mobile number, email, and enquiry message are required." }, { status: 400 });
    }

    if (!/^[6-9][0-9]{9}$/.test(mobile.trim())) {
      return NextResponse.json({ message: "Please enter a valid 10-digit Indian mobile number." }, { status: 400 });
    }

    // Rate Limiting
    const limiter = rateLimit({ identifier: `b2b_${mobile.trim()}`, limit: 5 });
    if (!limiter.success) {
      return NextResponse.json({ message: "Too many enquiry submissions. Please try again shortly." }, { status: 429 });
    }

    await connectToDatabase();

    const enquiry = await B2BEnquiry.create({
      companyName: companyName ? companyName.trim() : "",
      contactPerson: contactPerson.trim(),
      mobile: mobile.trim(),
      email: email.trim().toLowerCase(),
      gstin: gstin ? gstin.trim() : "",
      productName: productName ? productName.trim() : "",
      quantity: quantity ? Number(quantity) : 50,
      message: message.trim(),
      status: "new"
    });

    return NextResponse.json({
      message: "Your B2B / Bulk order enquiry has been received! Our wholesale team will contact you within 24 hours.",
      enquiry
    }, { status: 201 });

  } catch (error) {
    return NextResponse.json({ message: "Failed to submit B2B enquiry", error: (error as Error).message }, { status: 500 });
  }
}

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user || (session.user as any).role !== "admin") {
      return NextResponse.json({ message: "Unauthorized. Admin privileges required." }, { status: 401 });
    }

    await connectToDatabase();
    const enquiries = await B2BEnquiry.find().sort({ createdAt: -1 }).lean();

    const formatted = enquiries.map((e: any) => ({
      ...e,
      _id: e._id.toString()
    }));

    return NextResponse.json(formatted);

  } catch (error) {
    return NextResponse.json({ message: "Failed to fetch B2B enquiries", error: (error as Error).message }, { status: 500 });
  }
}
