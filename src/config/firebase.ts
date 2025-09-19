// Firebase configuration
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyBUPsx5jXbdrP7t1O9uqwVYeLIzhxHPsxU",
  authDomain: "rialconnect-1881f.firebaseapp.com",
  projectId: "rialconnect-1881f",
  storageBucket: "rialconnect-1881f.firebasestorage.app",
  messagingSenderId: "1067040998361",
  appId: "1:1067040998361:web:6245ce5f660887ff52cfc8",
  measurementId: "G-TNZTM7M3PK"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const analytics = getAnalytics(app);

export default app;