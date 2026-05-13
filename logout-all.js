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

(async () => {
  let nextPageToken;
  let userCount = 0;
  try {
    do {
      const listUsersResult = await admin.auth().listUsers(1000, nextPageToken);
      for (const userRecord of listUsersResult.users) {
        await admin.auth().revokeRefreshTokens(userRecord.uid);
        console.log(`Revoked tokens for user: ${userRecord.uid} (${userRecord.email})`);
        userCount++;
      }
      nextPageToken = listUsersResult.pageToken;
    } while (nextPageToken);

    console.log(`Successfully revoked tokens for ${userCount} users.`);
    process.exit(0);
  } catch (e) {
    console.error("Error logging out users:", e);
    process.exit(1);
  }
})();
