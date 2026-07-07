import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  // Paste ONLY the values from Firebase here
  apiKey: "AIzaSyDUGcoqbgcyArXcPSoFr4NhSUhjq-_3AD4",
  authDomain: "slotwise-b3ed9.firebaseapp.com",
  projectId: "slotwise-b3ed9",
  storageBucket: "slotwise-b3ed9.firebasestorage.app",
  messagingSenderId: "446953512844",
  appId: "1:446953512844:web:4b04d834223718a76cc0a9",
  measurementId: "G-384EE3XVVB"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);