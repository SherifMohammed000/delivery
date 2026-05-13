export interface Product {
  id: string;
  name: string;
  size: string; // e.g., "14.5kg", "52kg"
  priceInPesewas: number; // Stored as integer (GHS 1.00 = 100 pesewas)
  stock: number;
  isAvailable: boolean;
  imageUrl: string;
  category: "domestic" | "commercial" | "industrial";
  description?: string;
  createdAt: any; // Firestore Timestamp
  updatedAt: any; // Firestore Timestamp
}

export type ProductInput = Omit<Product, "id" | "createdAt" | "updatedAt">;
