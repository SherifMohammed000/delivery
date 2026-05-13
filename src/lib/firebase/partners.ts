import { 
  collection, 
  query, 
  where, 
  getDocs, 
  doc, 
  updateDoc, 
  serverTimestamp 
} from "firebase/firestore";
import { db } from "./config";
import { PartnerStatus } from "@/types/user";

export const fetchPartnersByStatus = async (status?: PartnerStatus) => {
  const usersRef = collection(db, "users");
  let q;
  
  if (status) {
    q = query(usersRef, where("role", "==", "delivery"), where("status", "==", status));
  } else {
    q = query(usersRef, where("role", "==", "delivery"));
  }
  
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({
    uid: doc.id,
    ...doc.data()
  }));
};

export const updatePartnerStatus = async (
  uid: string, 
  status: PartnerStatus, 
  rejectionReason?: string
) => {
  const userRef = doc(db, "users", uid);
  const updateData: any = {
    status,
    isActive: status === "active",
    updatedAt: serverTimestamp()
  };
  
  if (rejectionReason) {
    updateData.rejectionReason = rejectionReason;
  }
  
  await updateDoc(userRef, updateData);
};

export const deletePartner = async (uid: string) => {
  const { deleteDoc } = await import("firebase/firestore");
  const userRef = doc(db, "users", uid);
  await deleteDoc(userRef);
};
