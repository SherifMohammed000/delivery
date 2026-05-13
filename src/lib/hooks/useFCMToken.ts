"use client";

import { useEffect } from "react";
import { getToken, onMessage } from "firebase/messaging";
import { doc, setDoc } from "firebase/firestore";
import { getMessagingInstance, db } from "@/lib/firebase/config";

const VAPID_KEY = process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY;

export function useFCMToken(userId: string | undefined) {
  useEffect(() => {
    if (!userId || !VAPID_KEY) return;

    const setup = async () => {
      try {
        // Register the dedicated FCM service worker
        const registration = await navigator.serviceWorker.register(
          "/firebase-messaging-sw.js",
          { scope: "/" }
        );

        const messaging = await getMessagingInstance();
        if (!messaging) return;

        // Request permission
        const permission = await Notification.requestPermission();
        if (permission !== "granted") {
          console.log("Notification permission denied.");
          return;
        }

        // Get FCM token
        const token = await getToken(messaging, {
          vapidKey: VAPID_KEY,
          serviceWorkerRegistration: registration,
        });

        if (token) {
          // Save token to Firestore under the user's document
          await setDoc(
            doc(db, "users", userId),
            { fcmToken: token, fcmUpdatedAt: new Date() },
            { merge: true }
          );
          console.log("FCM token saved:", token.slice(0, 20) + "...");
        }

        // Handle foreground messages (app is open)
        onMessage(messaging, (payload) => {
          console.log("Foreground FCM message:", payload);
          const { title, body } = payload.notification || {};

          // Show a browser notification even if app is open
          if (Notification.permission === "granted") {
            new Notification(title || "GHo-VA", {
              body: body || "You have an update.",
              icon: "/icons/icon-192.png",
              badge: "/icons/icon-192.png",
            });
          }
        });
      } catch (err) {
        console.error("FCM setup error:", err);
      }
    };

    if ("serviceWorker" in navigator && "Notification" in window) {
      setup();
    }
  }, [userId]);
}
