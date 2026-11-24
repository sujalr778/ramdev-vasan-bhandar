import { NextRequest, NextResponse } from "next/server";
import { verifyAdminSession } from "@/lib/adminAuth";
import connectToDatabase from "@/lib/mongoose";
import Setting from "@/models/Setting";
import User from "@/models/User";
import bcrypt from "bcryptjs";

export async function GET(req: NextRequest) {
  const auth = await verifyAdminSession();
  if (!auth.authorized) return auth.errorResponse!;

  try {
    await connectToDatabase();
    let setting = await Setting.findOne().lean();

    if (!setting) {
      setting = await Setting.create({
        storeName: "Ramdev Vasan Bhandar",
        storePhone: "+91 98765 43210",
        storeEmail: "support@ramdevvasanbhandar.com",
        storeAddress: "Main Market, Station Road",
        storeCity: "Ahmedabad",
        storeState: "Gujarat",
        storePincode: "380001",
        storeGstin: "24AAAAA0000A1Z5",
        freeShippingThreshold: 999,
        standardDeliveryFee: 99,
      });
    }

    return NextResponse.json({
      success: true,
      settings: {
        storeName: setting.storeName,
        storePhone: setting.storePhone,
        storeEmail: setting.storeEmail,
        storeAddress: setting.storeAddress,
        storeCity: setting.storeCity,
        storeState: setting.storeState,
        storePincode: setting.storePincode,
        storeGstin: setting.storeGstin,
        freeShippingThreshold: setting.freeShippingThreshold || 999,
        standardDeliveryFee: setting.standardDeliveryFee || 99,
        maintenanceMode: setting.maintenanceMode || false,
        announcementText: setting.announcementText || "",
      },
      adminProfile: {
        name: auth.user!.name,
        email: auth.user!.email,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  const auth = await verifyAdminSession();
  if (!auth.authorized) return auth.errorResponse!;

  try {
    await connectToDatabase();
    const body = await req.json();

    const { storeSettings, adminProfile } = body;

    if (storeSettings) {
      await Setting.findOneAndUpdate(
        {},
        {
          ...storeSettings,
          freeShippingThreshold: Number(storeSettings.freeShippingThreshold) || 999,
          standardDeliveryFee: Number(storeSettings.standardDeliveryFee) || 99,
        },
        { upsert: true, new: true }
      );
    }

    if (adminProfile) {
      const updateAdmin: any = {};
      if (adminProfile.name) updateAdmin.name = adminProfile.name.trim();
      if (adminProfile.password && adminProfile.password.length >= 6) {
        updateAdmin.password = await bcrypt.hash(adminProfile.password, 10);
      }

      if (Object.keys(updateAdmin).length > 0) {
        await User.findByIdAndUpdate(auth.user!.id, updateAdmin);
      }
    }

    return NextResponse.json({ success: true, message: "Settings saved successfully." });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}