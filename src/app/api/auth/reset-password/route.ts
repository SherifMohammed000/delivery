import { NextRequest, NextResponse } from "next/server";
import admin from "firebase-admin";
import emailjs from "@emailjs/nodejs";

// Initialize Admin SDK
if (!admin.apps.length) {
  const serviceAccountEnv = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;

  if (!serviceAccountEnv) {
    throw new Error("FIREBASE_SERVICE_ACCOUNT_KEY is missing");
  }

  const serviceAccount = JSON.parse(serviceAccountEnv);
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: serviceAccount.project_id,
      clientEmail: serviceAccount.client_email,
      privateKey: serviceAccount.private_key.replace(/\\n/g, "\n"),
    }),
  });
}

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    // 1. Generate the Firebase Password Reset Link
    // Note: This link will point to the default Firebase Auth reset page
    const resetLink = await admin.auth().generatePasswordResetLink(email);

    // 2. Send via EmailJS
    const serviceId = process.env.EMAILJS_SERVICE_ID;
    const publicKey = process.env.EMAILJS_PUBLIC_KEY;
    const privateKey = process.env.EMAILJS_PRIVATE_KEY;
    const templateId = process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_PASSWORD_RESET || "password_reset_template";

    if (!serviceId || !publicKey || !privateKey) {
      return NextResponse.json({ error: "Email service not configured" }, { status: 500 });
    }

    await emailjs.send(
      serviceId,
      templateId,
      {
        customer_email: email,
        user_email: email,
        reset_link: resetLink,
      },
      {
        publicKey,
        privateKey,
      }
    );

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Password reset error:", error);

    // For security, return success if user not found
    if (error.code === 'auth/user-not-found') {
      return NextResponse.json({ success: true });
    }

    const errorMessage = error?.text || error?.message || "Unknown Error";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
