import admin from "firebase-admin";
import serviceAccount from "../../service.accounts.json";

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

export default admin;
