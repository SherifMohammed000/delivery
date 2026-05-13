import { User } from "firebase/auth";

/**
 * Returns the redirect path for a user based on their role.
 * 
 * @param role - The user's role (admin, delivery, customer)
 * @returns The path to redirect to.
 */
export const getRedirectPath = (role: string | null | undefined): string => {
  if (!role) return "/";
  
  const normalizedRole = role.toLowerCase();
  
  switch (normalizedRole) {
    case "admin":
      return "/admin";
    case "delivery":
      return "/delivery";
    case "customer":
      return "/products"; 
    default:
      return "/";
  }
};

/**
 * Synchronizes the user's session by sending the ID token to the server.
 * 
 * @param user - The authenticated Firebase user or null to clear session
 */
export const syncSession = async (user: User | null): Promise<void> => {
  try {
    if (user) {
      const token = await user.getIdToken();
      const response = await fetch("/api/auth/session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ token }),
      });
      
      if (!response.ok) {
        console.error("Failed to sync session:", await response.text());
      }
    } else {
      await fetch("/api/auth/session", { method: "DELETE" });
    }
  } catch (error) {
    console.error("Error syncing session:", error);
  }
};
