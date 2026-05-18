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

(async () => {
  try {
    console.log("Starting purge operation...");
    // 1. Delete from Firestore users collection
    const usersSnapshot = await admin.firestore().collection("users").get();
    let deletedCount = 0;
    
    for (const doc of usersSnapshot.docs) {
      if (doc.data().email !== adminEmail) {
        await doc.ref.delete();
        deletedCount++;
        console.log(`Deleted from Firestore: ${doc.data().email}`);
      }
    }
    
    // 2. Delete from Auth
    const listUsersResult = await admin.auth().listUsers(1000);
    let authDeletedCount = 0;
    
    for (const userRecord of listUsersResult.users) {
      if (userRecord.email !== adminEmail) {
        await admin.auth().deleteUser(userRecord.uid);
        authDeletedCount++;
        console.log(`Deleted from Auth: ${userRecord.email}`);
      }
    }

    console.log(`Successfully deleted ${deletedCount} users from Firestore and ${authDeletedCount} users from Auth.`);
    process.exit(0);
  } catch (error) {
    console.error("Error purging users:", error);
    process.exit(1);
  }
})();
