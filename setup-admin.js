const admin = require("firebase-admin");
const fs = require("fs");
const path = require("path");

const envVars = fs.readFileSync(path.join(__dirname, ".env"), "utf8").split('\n');
let saKey = "";
let dbUrl = "";
for (const line of envVars) {
  if (line.startsWith("FIREBASE_SERVICE_ACCOUNT_KEY=")) saKey = line.substring("FIREBASE_SERVICE_ACCOUNT_KEY=".length).trim();
  if (line.startsWith("NEXT_PUBLIC_FIREBASE_DATABASE_URL=")) dbUrl = line.substring("NEXT_PUBLIC_FIREBASE_DATABASE_URL=".length).trim();
}

const serviceAccount = JSON.parse(saKey);

admin.initializeApp({
  credential: admin.credential.cert({
    projectId: serviceAccount.project_id,
    clientEmail: serviceAccount.client_email,
    privateKey: serviceAccount.private_key.replace(/\\n/g, '\n'),
  }),
  databaseURL: dbUrl
});

const adminEmail = "0557138306@ghova.com";
const adminPassword = "Ghova000";
const adminPhone = "0557138306";

(async () => {
  let user;
  try {
    user = await admin.auth().getUserByEmail(adminEmail);
    // If password needs update to ensure it matches 'ghova'
    await admin.auth().updateUser(user.uid, { password: adminPassword });
    console.log("Admin auth user exists, password ensured. UID:", user.uid);
  } catch (e) {
    user = await admin.auth().createUser({
      email: adminEmail,
      password: adminPassword,
      displayName: "System Admin"
    });
    console.log("Created newly seeded admin auth user:", user.uid);
  }
  
  await admin.firestore().collection("users").doc(user.uid).set({
    email: adminEmail,
    name: "System Admin",
    phone: adminPhone,
    role: "admin",
    isActive: true,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp()
  });

  console.log("Admin Firestore document recorded securely!");
  process.exit(0);
})().catch(e => {
  console.error("Error setting up admin:", e);
  process.exit(1);
});
