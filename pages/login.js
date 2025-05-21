// pages/login.js
import { useRouter } from 'next/router';
import { useState } from 'react';
import { auth, provider } from '../lib/firebase';
import { signInWithPopup } from "firebase/auth";
import { doc, getFirestore, setDoc } from "firebase/firestore";

const db = getFirestore();

export default function Login() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async () => {
    setLoading(true);
    setError('');

    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      // Save user info to Firestore
      await setDoc(doc(db, "users", user.uid), {
        uid: user.uid,
        name: user.displayName,
        email: user.email,
        photoURL: user.photoURL,
      }, { merge: true });

      console.log("Logged in:", user);

      // Redirect to homepage
      router.push('/');
    } catch (err) {
      console.error("Login error:", err.message);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Loading spinner UI
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-black">
        <div className="w-10 h-10 border-4 border-white border-dashed rounded-full animate-spin"></div>
      </div>
    );
  }

  // Login UI
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 px-4">
      <div className="bg-white p-8 rounded shadow-md w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6 text-center">Login to NRC Vault</h2>

        {error && <p className="text-red-500 text-sm mb-4 text-center">{error}</p>}

        <button
          onClick={handleLogin}
          className="w-full bg-black text-white hover:bg-gray-800 font-semibold py-2 px-4 rounded"
          disabled={loading}
        >
          Sign in with Google
        </button>
      </div>
    </div>
  );
}
