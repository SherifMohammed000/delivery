import { NextRequest, NextResponse } from "next/server";
export const dynamic = "force-dynamic";
import { adminDb } from "@/lib/firebase-admin/config";
import { verifyAdmin } from "@/lib/firebase-admin/auth-utils";

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    await verifyAdmin();
    const { id } = await context.params;

    const doc = await adminDb.collection("products").doc(id).get();
    
    if (!doc.exists) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    return NextResponse.json({ id: doc.id, ...doc.data() });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 401 });
  }
}

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    await verifyAdmin();
    const { id } = await context.params;
    const data = await request.json();

    await adminDb.collection("products").doc(id).update({
      ...data,
      updatedAt: new Date(),
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 401 });
  }
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    await verifyAdmin();
    const { id } = await context.params;

    // We toggle availability instead of hard deleting to preserve order history
    const productRef = adminDb.collection("products").doc(id);
    const doc = await productRef.get();
    
    if (!doc.exists) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    const currentData = doc.data();
    await productRef.update({
      isAvailable: !currentData?.isAvailable,
      updatedAt: new Date(),
    });

    return NextResponse.json({ success: true, isAvailable: !currentData?.isAvailable });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 401 });
  }
}
