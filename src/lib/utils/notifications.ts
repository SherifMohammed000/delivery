/**
 * Sends a push notification to a user by looking up their FCM token
 * from Firestore and calling the notification API route.
 */
export async function sendPushNotification({
  userId,
  title,
  body,
  data,
}: {
  userId: string;
  title: string;
  body: string;
  data?: Record<string, string>;
}) {
  try {
    // Fetch the user's FCM token from Firestore (server-side safe)
    const { db } = await import("@/lib/firebase/config");
    const { doc, getDoc } = await import("firebase/firestore");

    const userDoc = await getDoc(doc(db, "users", userId));
    const token = userDoc.data()?.fcmToken;

    if (!token) {
      console.log(`No FCM token for user ${userId}`);
      return;
    }

    await fetch("/api/notifications/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, title, body, data }),
    });
  } catch (err) {
    console.error("sendPushNotification error:", err);
  }
}
