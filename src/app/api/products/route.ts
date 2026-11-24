import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const q = searchParams.get("q");
    const category = searchParams.get("category");
    const minPrice = searchParams.get("minPrice");
    const maxPrice = searchParams.get("maxPrice");
    const sort = searchParams.get("sort");
    const page = searchParams.get("page");
    const limit = searchParams.get("limit");
    const raw = searchParams.get("raw");

    const result = await db.products.findMany({
      q,
      category,
      minPrice,
      maxPrice,
      sort,
      page,
      limit,
      rawArray: raw === "true"
    });

    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({ message: "Failed to fetch products", error: (error as Error).message }, { status: 500 });
  }
}


export async function POST(request: Request) {
  try {
    const data = await request.json();
    
    const newProducts = await db.products.createMany([data]);
    
    return NextResponse.json(newProducts[0], { status: 201 });
  } catch (error) {
    return NextResponse.json({ message: "Failed to create product", error }, { status: 400 });
  }
}
