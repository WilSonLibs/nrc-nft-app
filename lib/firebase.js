// lib/firebase.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyCczhPZFIhQvs1nvrW9XCuP_fVtIKXP6H0",
  authDomain: "nrc-nft.firebaseapp.com",
  projectId: "nrc-nft",
  storageBucket: "nrc-nft.appspot.com",  // FIXED: was incorrect earlier
  messagingSenderId: "567816381012",
  appId: "1:567816381012:web:ef193b79e641aa994c83c1",
  measurementId: "G-24CEHB501B"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { auth, db };
