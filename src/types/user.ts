export type UserRole = "customer" | "delivery" | "admin";
export type PartnerStatus = "pending" | "active" | "rejected";

export interface User {
  uid: string;
  email: string;
  name: string;
  phone?: string;
  role: UserRole;
  // Operational status
  currentLocation?: { lat: number; lng: number };
  isOnline?: boolean;
  lastLocationUpdate?: any; // Firestore Timestamp
  
  // Verification documents for partners
  verificationDocs?: {
    idCardUrl?: string;
    licenseUrl?: string;
    bikeRegUrl?: string;
    residentialAddress?: string;
    facialPhotoUrl?: string; // Facial verification photo
  };

  createdAt: any; // Firestore Timestamp
  updatedAt: any; // Firestore Timestamp
}
