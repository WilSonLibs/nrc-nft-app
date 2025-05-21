// lib/firebase.js
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore'; // ADD THIS

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCczhPZFIhQvs1nvrW9XCuP_fVtIKXP6H0",
  authDomain: "nrc-nft.firebaseapp.com",
  projectId: "nrc-nft",
  storageBucket: "nrc-nft.appspot.com",
  messagingSenderId: "567816381012",
  appId: "1:567816381012:web:ef193b79e641aa994c83c1",
  measurementId: "G-24CEHB501B"
};

// Prevent re-initialization
const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

const auth = getAuth(app);
const provider = new GoogleAuthProvider();
const db = getFirestore(app); // ADD THIS

export { auth, provider, db }; // EXPORT db
