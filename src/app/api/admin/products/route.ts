export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin/config";
import { verifyAdmin } from "@/lib/firebase-admin/auth-utils";
import { Product } from "@/types/product";

export async function GET() {
  try {
    await verifyAdmin();

    const snapshot = await adminDb.collection("products")
      .orderBy("createdAt", "desc")
      .get();

    const products = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    return NextResponse.json(products);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 401 });
  }
}

export async function POST(request: Request) {
  try {
    await verifyAdmin();
    const data = await request.json();

    const docRef = await adminDb.collection("products").add({
      ...data,
      isAvailable: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    return NextResponse.json({ id: docRef.id, ...data });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 401 });
  }
}
