import { NextRequest, NextResponse } from "next/server";
import { verifyAdminSession } from "@/lib/adminAuth";
import { checkPincodeServiceability, calculateDeliveryCharge } from "@/lib/delivery";
import connectToDatabase from "@/lib/mongoose";
import Setting from "@/models/Setting";

export async function GET(req: NextRequest) {
  const auth = await verifyAdminSession();
  if (!auth.authorized) return auth.errorResponse!;

  try {
    await connectToDatabase();
    const setting = await Setting.findOne().lean();

    const { searchParams } = new URL(req.url);
    const testPincode = searchParams.get("testPincode");
    const testSubtotal = searchParams.get("testSubtotal");

    let pincodeTestResult = null;
    let deliveryChargeTestResult = null;

    if (testPincode) {
      pincodeTestResult = checkPincodeServiceability(testPincode);
    }

    if (testSubtotal !== null && testSubtotal !== undefined) {
      deliveryChargeTestResult = calculateDeliveryCharge({
        subtotal: Number(testSubtotal) || 0,
        pincode: testPincode || undefined,
      });
    }

    return NextResponse.json({
      success: true,
      rules: {
        freeShippingThreshold: setting?.freeShippingThreshold || 999,
        standardDeliveryFee: setting?.standardDeliveryFee || 99,
        description: "Orders ₹999 and above receive FREE Delivery. Orders below ₹999 incur a standard delivery fee of ₹99.",
      },
      pincodeTestResult,
      deliveryChargeTestResult,
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
    const { freeShippingThreshold, standardDeliveryFee } = await req.json();

    const updated = await Setting.findOneAndUpdate(
      {},
      {
        freeShippingThreshold: Number(freeShippingThreshold) || 999,
        standardDeliveryFee: Number(standardDeliveryFee) || 99,
      },
      { upsert: true, new: true }
    );

    return NextResponse.json({
      success: true,
      message: "Delivery settings updated.",
      rules: {
        freeShippingThreshold: updated.freeShippingThreshold,
        standardDeliveryFee: updated.standardDeliveryFee,
      }
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}