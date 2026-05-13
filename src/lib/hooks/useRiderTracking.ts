"use client";

import { useEffect, useState } from "react";
import { doc, updateDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import { useAuth } from "@/lib/contexts/auth-context";

export const useRiderTracking = () => {
  const { user, role } = useAuth();
  const [locationError, setLocationError] = useState<string | null>(null);

  useEffect(() => {
    if (!user || role !== "delivery") return;

    // 1. Set Initial Online Status
    const userRef = doc(db, "users", user.uid);
    
    const setOnlineStatus = async (online: boolean) => {
      try {
        await updateDoc(userRef, {
          isOnline: online,
          updatedAt: serverTimestamp()
        });
      } catch (error) {
        console.error("Error updating online status:", error);
      }
    };

    setOnlineStatus(true);

    // 2. Watch Position
    if (!navigator.geolocation) {
      setLocationError("Geolocation not supported");
      return;
    }

    const watchId = navigator.geolocation.watchPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          await updateDoc(userRef, {
            currentLocation: {
              lat: latitude,
              lng: longitude
            },
            lastLocationUpdate: serverTimestamp()
          });
          setLocationError(null);
        } catch (error) {
          console.error("Error updating rider location:", error);
        }
      },
      (error) => {
        console.error("Geolocation error:", error);
        setLocationError(error.message);
        setOnlineStatus(false);
      },
      {
        enableHighAccuracy: true,
        maximumAge: 30000,
        timeout: 27000
      }
    );

    // 3. Cleanup: Set Offline
    return () => {
      navigator.geolocation.clearWatch(watchId);
      setOnlineStatus(false);
    };
  }, [user, role]);

  return { locationError };
};
