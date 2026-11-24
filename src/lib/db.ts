import fs from "fs/promises";
import path from "path";
import connectToDatabase from "./mongoose";
import Product from "@/models/Product";
import User from "@/models/User";
import Order from "@/models/Order";
import bundledBackupDB from "@/data/db.json";

const DB_PATH = path.join(process.cwd(), "src/data/db.json");

// Local JSON backup reader (Falls back to bundled JSON on read-only serverless hosts like Vercel)
async function getBackupDB() {
  try {
    const data = await fs.readFile(DB_PATH, "utf-8");
    return JSON.parse(data);
  } catch (error) {
    return JSON.parse(JSON.stringify(bundledBackupDB));
  }
}

// Auto-seed initial catalog from backup JSON into MongoDB Atlas if MongoDB collection is empty
let isSeeded = false;
async function ensureMongoSeeded() {
  if (isSeeded) return;
  try {
    const count = await Product.countDocuments();
    if (count === 0) {
      const backup = await getBackupDB();
      if (backup.products && backup.products.length > 0) {
        const seedProducts = backup.products.map(({ _id, ...rest }: any) => rest);
        await Product.insertMany(seedProducts);
        console.log("Successfully seeded MongoDB Atlas with initial product catalog.");
      }
    }
    isSeeded = true;
  } catch (e) {
    console.warn("Auto-seed check skipped:", (e as Error).message);
  }
}

export const db = {
  products: {
    findMany: async (query?: any) => {
      try {
        await connectToDatabase();
        await ensureMongoSeeded();
        const filter: any = {};

        if (query?.q) {
          const searchRegex = new RegExp(query.q.trim(), "i");
          filter.$or = [
            { name: searchRegex },
            { category: searchRegex },
            { material: searchRegex },
            { description: searchRegex }
          ];
        }

        if (query?.category && query.category !== "All" && query.category !== "All Products") {
          filter.category = { $regex: new RegExp(`^${query.category.trim()}$`, "i") };
        }

        if (query?.minPrice !== undefined && query.minPrice !== null && query.minPrice !== "") {
          const minP = Number(query.minPrice);
          if (!isNaN(minP) && minP >= 0) {
            filter.price = { ...(filter.price || {}), $gte: minP };
          }
        }

        if (query?.maxPrice !== undefined && query.maxPrice !== null && query.maxPrice !== "") {
          const maxP = Number(query.maxPrice);
          if (!isNaN(maxP) && maxP > 0) {
            filter.price = { ...(filter.price || {}), $lte: maxP };
          }
        }

        let sortOption: any = { createdAt: -1 };
        if (query?.sort) {
          switch (query.sort) {
            case "price_asc":
            case "Price: Low to High":
              sortOption = { price: 1 };
              break;
            case "price_desc":
            case "Price: High to Low":
              sortOption = { price: -1 };
              break;
            case "rating_desc":
            case "Customer Rating":
              sortOption = { rating: -1 };
              break;
            case "newest":
            case "Newest":
              sortOption = { createdAt: -1 };
              break;
            default:
              sortOption = { createdAt: -1 };
          }
        }

        const page = Math.max(1, parseInt(query?.page || "1", 10));
        const limit = query?.limit ? Math.max(1, parseInt(query.limit, 10)) : 20;
        const skip = (page - 1) * limit;

        const totalProducts = await Product.countDocuments(filter);
        const docs = await Product.find(filter)
          .sort(sortOption)
          .skip(skip)
          .limit(limit)
          .lean();

        const products = docs.map((doc: any) => ({ ...doc, _id: doc._id.toString() }));
        const totalPages = Math.ceil(totalProducts / limit) || 1;

        if (query?.rawArray || (!query?.q && !query?.category && !query?.minPrice && !query?.maxPrice && !query?.sort && !query?.page && !query?.limit)) {
          return products;
        }

        return {
          products,
          pagination: {
            page,
            limit,
            totalProducts,
            totalPages,
            hasMore: page < totalPages
          }
        };
      } catch (error) {
        console.warn("MongoDB query fallback to db.json backup:", (error as Error).message);
        const backup = await getBackupDB();
        let results = backup.products || [];

        if (query?.q) {
          const qLower = query.q.toLowerCase();
          results = results.filter((p: any) =>
            (p.name && p.name.toLowerCase().includes(qLower)) ||
            (p.category && p.category.toLowerCase().includes(qLower)) ||
            (p.material && p.material.toLowerCase().includes(qLower)) ||
            (p.description && p.description.toLowerCase().includes(qLower))
          );
        }

        if (query?.category && query.category !== "All" && query.category !== "All Products") {
          results = results.filter((p: any) => p.category.toLowerCase() === query.category.toLowerCase());
        }

        if (query?.minPrice) {
          results = results.filter((p: any) => p.price >= Number(query.minPrice));
        }

        if (query?.maxPrice) {
          results = results.filter((p: any) => p.price <= Number(query.maxPrice));
        }

        if (query?.rawArray || (!query?.q && !query?.category && !query?.minPrice && !query?.maxPrice && !query?.sort && !query?.page && !query?.limit)) {
          return results;
        }

        return {
          products: results,
          pagination: {
            page: 1,
            limit: results.length,
            totalProducts: results.length,
            totalPages: 1,
            hasMore: false
          }
        };
      }
    },


    findById: async (id: string) => {
      try {
        await connectToDatabase();
        await ensureMongoSeeded();
        const doc = await Product.findById(id).lean();
        if (doc) return { ...doc, _id: (doc as any)._id.toString() };
      } catch (error) {
        console.warn("MongoDB findById fallback to db.json backup:", (error as Error).message);
        const backup = await getBackupDB();
        return backup.products.find((p: any) => p._id === id);
      }
      return null;
    },

    createOne: async (productData: any) => {
      await connectToDatabase();
      const newDoc = await Product.create(productData);
      return { ...newDoc.toObject(), _id: newDoc._id.toString() };
    },

    createMany: async (products: any[]) => {
      await connectToDatabase();
      const cleanProducts = products.map(({ _id, ...rest }: any) => rest);
      const docs = await Product.insertMany(cleanProducts);
      return docs.map((d: any) => ({ ...d.toObject(), _id: d._id.toString() }));
    },

    updateOne: async (id: string, updateData: any) => {
      await connectToDatabase();
      const updated = await Product.findByIdAndUpdate(id, updateData, { new: true }).lean();
      if (updated) return { ...updated, _id: (updated as any)._id.toString() };
      return null;
    },

    deleteOne: async (id: string) => {
      await connectToDatabase();
      await Product.findByIdAndDelete(id);
      return true;
    },

    deleteMany: async () => {
      await connectToDatabase();
      await Product.deleteMany({});
      return true;
    }
  },

  users: {
    findOne: async (query: any) => {
      try {
        await connectToDatabase();
        const user = await User.findOne(query).lean();
        if (user) return { ...user, _id: (user as any)._id.toString() };
      } catch (error) {
        console.warn("MongoDB user findOne fallback to db.json backup:", (error as Error).message);
        const backup = await getBackupDB();
        return backup.users.find((u: any) => u.email === query.email);
      }
      return null;
    },

    findById: async (id: string) => {
      try {
        await connectToDatabase();
        const user = await User.findById(id).lean();
        if (user) return { ...user, _id: (user as any)._id.toString() };
      } catch (error) {
        console.warn("MongoDB user findById fallback to db.json backup:", (error as Error).message);
        const backup = await getBackupDB();
        return backup.users.find((u: any) => u._id === id);
      }
      return null;
    },

    create: async (userData: any) => {
      try {
        await connectToDatabase();
        const newUser = await User.create(userData);
        return { ...newUser.toObject(), _id: newUser._id.toString() };
      } catch (error) {
        console.warn("MongoDB user create fallback:", (error as Error).message);
        const backup = await getBackupDB();
        const newUser = {
          _id: "user_" + Date.now(),
          ...userData,
          createdAt: new Date().toISOString()
        };
        backup.users.push(newUser);
        try {
          await fs.writeFile(DB_PATH, JSON.stringify(backup, null, 2), "utf-8");
        } catch (e) {
          // ignore write errors in restricted environments
        }
        return newUser;
      }
    },


    deleteOne: async (id: string) => {
      await connectToDatabase();
      await User.findByIdAndDelete(id);
      return true;
    }
  },

  orders: {
    findMany: async (query?: any) => {
      try {
        await connectToDatabase();
        const filter: any = {};
        if (query?.user) {
          filter.user = query.user;
        }
        const orders = await Order.find(filter).populate("user", "name email").sort({ createdAt: -1 }).lean();
        return orders.map((o: any) => ({ ...o, _id: o._id.toString() }));
      } catch (error) {
        console.warn("MongoDB orders findMany fallback to db.json backup:", (error as Error).message);
        const backup = await getBackupDB();
        let results = backup.orders || [];
        if (query?.user) {
          results = results.filter((o: any) => o.user === query.user);
        }
        return results.map((order: any) => {
          const user = backup.users.find((u: any) => u._id === order.user);
          return { ...order, user: user ? { name: user.name, email: user.email } : null };
        });
      }
    },

    findById: async (id: string) => {
      try {
        await connectToDatabase();
        const order = await Order.findById(id).populate("user", "name email").populate("products.product").lean();
        if (order) return { ...order, _id: (order as any)._id.toString() };
      } catch (error) {
        console.warn("MongoDB order findById fallback to db.json backup:", (error as Error).message);
        const backup = await getBackupDB();
        return backup.orders ? backup.orders.find((o: any) => o._id === id) : null;
      }
      return null;
    },

    create: async (orderData: any) => {
      try {
        await connectToDatabase();
        const newOrder = await Order.create(orderData);
        return { ...newOrder.toObject(), _id: newOrder._id.toString() };
      } catch (error) {
        console.warn("MongoDB order create fallback:", (error as Error).message);
        const backup = await getBackupDB();
        const newOrder = {
          _id: "order_" + Date.now(),
          ...orderData,
          createdAt: new Date().toISOString()
        };
        backup.orders = backup.orders || [];
        backup.orders.push(newOrder);
        try {
          await fs.writeFile(DB_PATH, JSON.stringify(backup, null, 2), "utf-8");
        } catch (e) {
          // ignore write errors in restricted environments
        }
        return newOrder;
      }
    },


    updateStatus: async (id: string, status: string) => {
      try {
        await connectToDatabase();
        const updated = await Order.findByIdAndUpdate(id, { status }, { new: true });
        return !!updated;
      } catch (e) {
        return true;
      }
    },

    updateOne: async (id: string, updateData: any) => {
      try {
        await connectToDatabase();
        await Order.findByIdAndUpdate(id, updateData, { new: true });
      } catch (error) {
        const backup = await getBackupDB();
        const orderIndex = backup.orders ? backup.orders.findIndex((o: any) => o._id === id) : -1;
        if (orderIndex !== -1) {
          backup.orders[orderIndex] = { ...backup.orders[orderIndex], ...updateData };
          try {
            await fs.writeFile(DB_PATH, JSON.stringify(backup, null, 2), "utf-8");
          } catch (e) {}
        }
      }
      return true;
    },

    deleteOne: async (id: string) => {
      try {
        await connectToDatabase();
        await Order.findByIdAndDelete(id);
      } catch (e) {}
      return true;
    }
  }
};



export { Product };
