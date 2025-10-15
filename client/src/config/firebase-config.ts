import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyDWJ-GETcAdkDQI_3yAgtZR2UCFhj1eHgE",
  authDomain: "hr-management-monitor.firebaseapp.com",
  projectId: "hr-management-monitor",
  storageBucket: "hr-management-monitor.firebasestorage.app",
  messagingSenderId: "177385052507",
  appId: "1:177385052507:web:3721b402344ab9c9a7627e",
  measurementId: "G-0HPGTG0KCJ",
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
