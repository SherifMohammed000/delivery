import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase/config";

/**
 * Calculates the Haversine distance between two points in kilometers.
 */
export function getHaversineDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Finds potential riders sorted by distance, excluding those who already ignored the order.
 */
export async function findPotentialRiders(
  customerLat: number,
  customerLng: number,
  ignoredRiders: string[] = []
) {
  const usersRef = collection(db, "users");
  
  // 1. Query online, active delivery partners
  const q = query(
    usersRef, 
    where("role", "==", "delivery"), 
    where("status", "==", "active"),
    where("isOnline", "==", true)
  );

  const snapshot = await getDocs(q);
  const riders = snapshot.docs
    .map(doc => ({
      uid: doc.id,
      ...doc.data()
    }))
    .filter((rider: any) => 
      rider.currentLocation && 
      !ignoredRiders.includes(rider.uid)
    );

  // 2. Calculate distances and sort
  const ridersWithDistance = riders.map((rider: any) => {
    const distance = getHaversineDistance(
      customerLat,
      customerLng,
      rider.currentLocation.lat,
      rider.currentLocation.lng
    );
    return { ...rider, distance };
  });

  return ridersWithDistance.sort((a, b) => a.distance - b.distance);
}
