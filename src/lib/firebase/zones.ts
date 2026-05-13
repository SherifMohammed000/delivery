import { 
  collection, 
  getDocs, 
  addDoc, 
  updateDoc, 
  doc, 
  query, 
  orderBy,
  serverTimestamp
} from "firebase/firestore";
import { db } from "./config";
import { Zone } from "@/types/zone";

const ZONES_COLLECTION = "zones";

export const fetchZones = async () => {
  const q = query(collection(db, ZONES_COLLECTION), orderBy("name", "asc"));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  })) as Zone[];
};

export const addZone = async (zone: Omit<Zone, "id" | "createdAt" | "updatedAt">) => {
  const docRef = await addDoc(collection(db, ZONES_COLLECTION), {
    ...zone,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  });
  return docRef.id;
};

export const updateZoneStatus = async (id: string, active: boolean) => {
  const zoneRef = doc(db, ZONES_COLLECTION, id);
  await updateDoc(zoneRef, {
    active,
    updatedAt: serverTimestamp()
  });
};

export const updateZoneDetails = async (id: string, details: Partial<Omit<Zone, "id">>) => {
  const zoneRef = doc(db, ZONES_COLLECTION, id);
  await updateDoc(zoneRef, {
    ...details,
    updatedAt: serverTimestamp()
  });
};

export const deleteZone = async (id: string) => {
  const { deleteDoc } = await import("firebase/firestore");
  await deleteDoc(doc(db, ZONES_COLLECTION, id));
};

