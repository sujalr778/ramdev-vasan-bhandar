import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongoose";
import User from "@/models/User";
import bcrypt from "bcryptjs";

export async function POST(req: NextRequest) {
  try {
    const { name, email, password, setupKey } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: "Email and password are required." },
        { status: 400 }
      );
    }

    await connectToDatabase();

    // Check if an admin already exists
    const existingAdmin = await User.findOne({ role: "admin" });
    if (existingAdmin && setupKey !== process.env.NEXTAUTH_SECRET) {
      return NextResponse.json(
        { success: false, error: "Admin already configured. Please login or provide master setupKey." },
        { status: 403 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.findOneAndUpdate(
      { email: email.toLowerCase().trim() },
      {
        name: name || "Ramdev Admin",
        email: email.toLowerCase().trim(),
        password: hashedPassword,
        role: "admin",
      },
      { upsert: true, new: true }
    );

    return NextResponse.json({
      success: true,
      message: "Admin user created/updated successfully.",
      admin: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}