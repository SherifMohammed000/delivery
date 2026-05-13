import { Timestamp } from "firebase/firestore";

export type OrderStatus = 
  | "pending"     // Customer requested, no rider accepted yet
  | "assigned"    // System has assigned to a specific rider, waiting for response
  | "accepted"    // Rider accepted the job
  | "at_station"  // Rider is at the gas station
  | "refilling"   // Gas is being refilled
  | "en_route"    // Rider is returning to customer
  | "delivered"   // Delivered but not confirmed
  | "completed"   // Customer confirmed with OTP
  | "cancelled"   // Order cancelled
  | "disputed";    // There is an issue

export type PaymentMethod = "online" | "cash";
export type PaymentStatus = "paid" | "pending" | "failed";

export interface Order {
  id: string;
  customerId: string;
  customerName: string;
  customerEmail?: string;
  customerPhone: string;
  serviceId: string;
  serviceSize: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  address: string;
  location?: { lat: number; lng: number }; 
  ignoredRiders?: string[]; 
  zone: string;
  status: OrderStatus;
  // Payment
  paymentMethod: PaymentMethod; // "online" | "cash"
  paymentStatus: PaymentStatus; // "paid" | "pending" | "failed"
  paymentRef?: string;          // Paystack transaction reference
  paidAt?: Timestamp;
  // Delivery
  otp?: string;
  riderId?: string;
  riderName?: string;
  riderPhone?: string;
  photos?: {
    atPickup?: string;
    atStation?: string;
    atDelivery?: string;
  };
  createdAt: Timestamp;
  updatedAt: Timestamp;
  completedAt?: Timestamp;
}

export type OrderInput = Omit<Order, "id" | "createdAt" | "updatedAt" | "status" | "otp">;
