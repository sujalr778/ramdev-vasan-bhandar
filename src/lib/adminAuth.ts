import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: "admin";
}

export async function verifyAdminSession(): Promise<{ authorized: boolean; user?: AdminUser; errorResponse?: NextResponse }> {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return {
        authorized: false,
        errorResponse: NextResponse.json(
          { success: false, error: "Unauthorized. Please login as admin." },
          { status: 401 }
        ),
      };
    }

    const userRole = (session.user as any).role;

    if (userRole !== "admin") {
      return {
        authorized: false,
        errorResponse: NextResponse.json(
          { success: false, error: "Forbidden. Admin privileges required." },
          { status: 403 }
        ),
      };
    }

    return {
      authorized: true,
      user: {
        id: (session.user as any).id || "",
        name: session.user.name || "Admin",
        email: session.user.email || "",
        role: "admin",
      },
    };
  } catch (err: any) {
    return {
      authorized: false,
      errorResponse: NextResponse.json(
        { success: false, error: "Authentication error: " + err.message },
        { status: 500 }
      ),
    };
  }
}