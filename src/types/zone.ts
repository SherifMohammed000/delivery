export interface Zone {
  id: string;
  name: string;
  description: string; // Landmarks or boundaries
  deliveryFee: number;
  active: boolean;
  createdAt?: any;
  updatedAt?: any;
}
