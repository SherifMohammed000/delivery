"use client";

import { CustomerNavbar } from "@/components/customer/CustomerNavbar";
import { useAuth } from "@/lib/contexts/auth-context";
import { usePathname } from "next/navigation";
import { useFCMToken } from "@/lib/hooks/useFCMToken";

// Routes where the customer navbar should NOT appear
const AUTH_ROUTES = ["/login", "/signup", "/reset-password"];

export default function CustomerLayout({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const pathname = usePathname();

  // Register FCM token for push notifications when user is logged in
  useFCMToken(user?.uid);

  const isAuthPage = AUTH_ROUTES.some((route) => pathname === route || pathname.startsWith(route));
  const showNavbar = user && !isAuthPage;

  return (
    <div className="min-h-screen bg-zinc-50">
      {showNavbar && <CustomerNavbar />}
      <div className={showNavbar ? "pb-24 md:pb-0" : ""}>
        {children}
      </div>
    </div>
  );
}
