import { cookies } from "next/headers";
import { adminAuth, adminDb } from "./config";

export async function verifyAdmin() {
  const session = (await cookies()).get("session")?.value;

  if (!session) {
    throw new Error("No session found");
  }

  try {
    const decodedToken = await adminAuth.verifyIdToken(session);
    const uid = decodedToken.uid;
    
    // Fetch user role from Firestore instead of relying on custom claims
    const userDoc = await adminDb.collection("users").doc(uid).get();
    
    if (!userDoc.exists) {
      throw new Error("User record not found");
    }

    const userData = userDoc.data();
    const normalizedRole = userData?.role?.toLowerCase();
    
    if (normalizedRole !== "admin") {
      throw new Error("Unauthorized: Admin access required");
    }

    return { ...decodedToken, role: normalizedRole };
  } catch (error: any) {
    console.error("Admin verification failed:", error.message);
    throw new Error(error.message || "Invalid session or unauthorized");
  }
}
