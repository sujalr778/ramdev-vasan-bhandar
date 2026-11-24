import { MetadataRoute } from "next";
import connectToDatabase from "@/lib/mongoose";
import Product from "@/models/Product";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://ramdevvasanbhandar.com";

  let productUrls: MetadataRoute.Sitemap = [];

  try {
    await connectToDatabase();
    const products = await Product.find({ active: { $ne: false } })
      .select("_id updatedAt")
      .lean();

    productUrls = products.map((p: any) => ({
      url: `${baseUrl}/shop/${p._id.toString()}`,
      lastModified: p.updatedAt ? new Date(p.updatedAt) : new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.8,
    }));
  } catch (err) {
    console.warn("Sitemap product fetch fallback:", (err as Error).message);
  }

  const staticRoutes: MetadataRoute.Sitemap = [
    "",
    "/shop",
    "/categories",
    "/offers",
    "/recipes",
    "/advisor",
    "/gift-finder",
    "/compare",
    "/custom-set",
    "/b2b",
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: route === "" ? ("daily" as const) : ("weekly" as const),
    priority: route === "" ? 1.0 : 0.7,
  }));

  return [...staticRoutes, ...productUrls];
}
