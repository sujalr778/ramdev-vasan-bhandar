import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongoose";
import Product from "@/models/Product";

const mockProducts = [
  {
    name: "Premium Triply Stainless Steel Kadai with Lid",
    category: "Kadai",
    price: 2499,
    originalPrice: 3299,
    rating: 4.8,
    reviews: 124,
    image: "/product-kadai.png",
    badge: "Best Seller",
    description: "Experience professional-grade cooking with our premium triply stainless steel kadai. The aluminum core ensures even heat distribution, while the stainless steel interior provides a safe and durable cooking surface. Perfect for deep frying, sautéing, and making curries.",
    material: "Triply Stainless Steel",
    capacity: "3.5L",
    stock: 50
  },
  {
    name: "Hard Anodized Deep Fry Pan (2.5L)",
    category: "Fry Pan",
    price: 1899,
    originalPrice: 2499,
    rating: 4.6,
    reviews: 89,
    image: "/product-fry-pan.png",
    description: "Our hard anodized deep fry pan is twice as hard as stainless steel, ensuring incredible durability and scratch resistance. The curved sides make it easy to stir and toss ingredients. Ideal for stir-fries and shallow frying.",
    material: "Hard Anodized Aluminum",
    capacity: "2.5L",
    stock: 35
  },
  {
    name: "Cast Iron Dosa Tawa (10 inch)",
    category: "Tawa",
    price: 1499,
    originalPrice: 1999,
    rating: 4.9,
    reviews: 210,
    image: "/product-kadai.png",
    badge: "New Arrival",
    description: "Get perfectly crisp dosas every time with our pre-seasoned cast iron tawa. It retains heat exceptionally well and fortifies your food with dietary iron. A must-have for every Indian kitchen.",
    material: "Cast Iron",
    capacity: "10 inch diameter",
    stock: 120
  },
  {
    name: "Non-Stick Appam Patra with Lid",
    category: "Specialty",
    price: 899,
    originalPrice: 1299,
    rating: 4.5,
    reviews: 56,
    image: "/product-fry-pan.png",
    description: "Make healthy and delicious appams with minimal oil using our premium non-stick appam patra. It comes with a glass lid and cool-touch handles for safe and convenient cooking.",
    material: "Aluminum with Non-Stick Coating",
    capacity: "12 cavities",
    stock: 45
  },
  {
    name: "Stainless Steel Pressure Cooker (5L)",
    category: "Pressure Cooker",
    price: 3499,
    originalPrice: 4299,
    rating: 4.7,
    reviews: 312,
    image: "/product-pressure-cooker.png",
    description: "Cook meals up to 70% faster with our secure and efficient stainless steel pressure cooker. It features a heavy sandwich bottom for even heating and multiple safety valves for peace of mind.",
    material: "18/8 Stainless Steel",
    capacity: "5L",
    stock: 80
  },
  {
    name: "Premium Copper Bottom Handi Set",
    category: "Handi",
    price: 2199,
    originalPrice: 2899,
    rating: 4.4,
    reviews: 78,
    image: "/product-cookware-set.png",
    description: "Serve your signature biryanis and curries in style with this elegant copper bottom handi set. The copper base ensures fast heating while the stainless steel body keeps food warm for longer.",
    material: "Stainless Steel with Copper Base",
    capacity: "Set of 3 (1L, 1.5L, 2L)",
    stock: 25
  }
];

export async function GET() {
  try {
    await connectToDatabase();
    
    const insertedProducts = [];
    for (const prod of mockProducts) {
      const existing = await Product.findOne({ name: prod.name });
      if (!existing) {
        const created = await Product.create(prod);
        insertedProducts.push(created);
      }
    }
    
    return NextResponse.json({ 
      message: "Database seed operation completed idempotently.", 
      insertedCount: insertedProducts.length,
      insertedProducts 
    });
  } catch (error) {
    console.error("Seeding error:", error);
    return NextResponse.json({ message: "Failed to seed database", error: (error as Error).message }, { status: 500 });
  }
}

