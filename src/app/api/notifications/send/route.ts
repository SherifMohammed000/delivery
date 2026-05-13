import { NextRequest, NextResponse } from "next/server";
import admin from "firebase-admin";

// Initialize Admin SDK once
if (!admin.apps.length) {
  const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY!);
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
    const { token, title, body, data } = await req.json();

    if (!token || !title) {
      return NextResponse.json({ error: "Missing token or title" }, { status: 400 });
    }

    const message = {
      token,
      notification: { title, body: body || "" },
      data: data || {},
      webpush: {
        notification: {
          title,
          body: body || "",
          icon: "/icons/icon-192.png",
          badge: "/icons/icon-192.png",
          vibrate: [200, 100, 200],
        },
        fcmOptions: {
          link: data?.url || "/orders",
        },
      },
    };

    const response = await admin.messaging().send(message);
    return NextResponse.json({ success: true, messageId: response });
  } catch (error: any) {
    console.error("FCM send error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
