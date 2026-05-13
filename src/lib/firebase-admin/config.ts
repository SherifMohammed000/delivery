import * as admin from "firebase-admin";

const getAdminApp = () => {
  if (admin.apps.length > 0) {
    return admin.app();
  }

  const serviceAccountKey = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
  
  if (!serviceAccountKey) {
    console.warn("FIREBASE_SERVICE_ACCOUNT_KEY is not defined. Firebase Admin initialization may fail.");
    // Return a proxy or throw error based on app needs. Here we throw to be explicit.
    throw new Error("FIREBASE_SERVICE_ACCOUNT_KEY is missing from environment variables.");
  }

  try {
    const serviceAccount = JSON.parse(serviceAccountKey);
    
    return admin.initializeApp({
      credential: admin.credential.cert({
        projectId: serviceAccount.project_id,
        clientEmail: serviceAccount.client_email,
        // The most robust way to handle both real newlines and \n escape sequences
        privateKey: serviceAccount.private_key.replace(/\\n/g, '\n'),
      }),
      databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL,
    });
  } catch (error: any) {
    console.error("Firebase Admin initialization error:", error.message);
    throw error;
  }
};

/**
 * Lazy-loaded Firebase Admin instances to prevent build-time crashes
 * when environment variables are unavailable.
 */
const getDb = () => admin.firestore(getAdminApp());
const getAuth = () => admin.auth(getAdminApp());
const getStorage = () => admin.storage(getAdminApp());

export const adminDb = new Proxy({} as admin.firestore.Firestore, {
  get(_, prop) {
    const instance = getDb();
    const value = (instance as any)[prop];
    return typeof value === "function" ? value.bind(instance) : value;
  },
});

export const adminAuth = new Proxy({} as admin.auth.Auth, {
  get(_, prop) {
    const instance = getAuth();
    const value = (instance as any)[prop];
    return typeof value === "function" ? value.bind(instance) : value;
  },
});

export const adminStorage = new Proxy({} as admin.storage.Storage, {
  get(_, prop) {
    const instance = getStorage();
    const value = (instance as any)[prop];
    return typeof value === "function" ? value.bind(instance) : value;
  },
});

