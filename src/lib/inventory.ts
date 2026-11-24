import connectToDatabase from "@/lib/mongoose";
import InventoryLog from "@/models/InventoryLog";

export async function logInventoryMovement({
  productId,
  previousStock,
  newStock,
  changeQuantity,
  reason,
  orderId,
  adminUserId
}: {
  productId: string;
  previousStock: number;
  newStock: number;
  changeQuantity: number;
  reason: "order_placed" | "order_cancelled" | "admin_adjustment";
  orderId?: string;
  adminUserId?: string;
}) {
  try {
    await connectToDatabase();
    await InventoryLog.create({
      product: productId,
      previousStock,
      newStock,
      changeQuantity,
      reason,
      order: orderId,
      adminUser: adminUserId
    });
  } catch (error) {
    console.warn("Failed to record inventory log:", (error as Error).message);
  }
}
