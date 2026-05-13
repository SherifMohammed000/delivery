export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin/config";

const PRODUCTS = [
  {
    name: "LPG Cylinder (14.5kg)",
    description: "Standard household size cylinder refill.",
    price: 12000, // GH₵ 120.00 in pesewas
    image: "https://images.unsplash.com/photo-1585314062340-f1a5a7c9328d?auto=format&fit=crop&q=80&w=400",
    category: "refill",
    weight: 14.5,
    inStock: true,
  },
  {
    name: "LPG Cylinder (6kg)",
    description: "Medium size cylinder refill, ideal for small families.",
    price: 6500, // GH₵ 65.00
    image: "https://images.unsplash.com/photo-1585314062340-f1a5a7c9328d?auto=format&fit=crop&q=80&w=400",
    category: "refill",
    weight: 6,
    inStock: true,
  },
  {
    name: "LPG Cylinder (3kg)",
    description: "Compact size cylinder refill for camping or quick use.",
    price: 3500, // GH₵ 35.00
    image: "https://images.unsplash.com/photo-1585314062340-f1a5a7c9328d?auto=format&fit=crop&q=80&w=400",
    category: "refill",
    weight: 3,
    inStock: true,
  },
];

const ZONES = [
  {
    name: "Ho Technical University (HTU)",
    description: "HTU Campus and immediate surroundings.",
    deliveryFee: 1000, // GH₵ 10.00
    isActive: true,
  },
  {
    name: "Ho Central / Market",
    description: "Central business district and stadium area.",
    deliveryFee: 1500, // GH₵ 15.00
    isActive: true,
  },
  {
    name: "Bankoe / Dome",
    description: "Residential areas within Ho municipality.",
    deliveryFee: 1500, // GH₵ 15.00
    isActive: true,
  },
  {
    name: "Sokode Gbogame",
    description: "Nearby town on the outskirts of Ho.",
    deliveryFee: 2500, // GH₵ 25.00
    isActive: true,
  },
];

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const secret = searchParams.get("secret");

  if (secret !== "seed_ho_data") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const batch = adminDb.batch();

    // Seed Products
    PRODUCTS.forEach((product) => {
      const docRef = adminDb.collection("products").doc();
      batch.set(docRef, {
        ...product,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    });

    // Seed Zones
    ZONES.forEach((zone) => {
      const docRef = adminDb.collection("zones").doc();
      batch.set(docRef, {
        ...zone,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    });

    await batch.commit();

    return NextResponse.json({
      success: true,
      message: "Database seeded successfully with Ho, Volta Region data.",
    });
  } catch (error: any) {
    console.error("Seeding error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
