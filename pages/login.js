// pages/login.js
import { useRouter } from 'next/router';
import { useState } from 'react';
import { auth, provider } from '../lib/firebase';
import { signInWithPopup, signInWithEmailAndPassword } from "firebase/auth";
import { doc, getFirestore, setDoc } from "firebase/firestore";

const db = getFirestore();

export default function Login() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleGoogleLogin = async () => {
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
      router.push('/');
    } catch (err) {
      console.error("Login error:", err.message);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEmailLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      const user = result.user;

      await setDoc(doc(db, "users", user.uid), {
        uid: user.uid,
        email: user.email,
      }, { merge: true });

      console.log("Email login successful:", user);
      router.push('/');
    } catch (err) {
      console.error("Email login error:", err.message);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-black">
        <div className="w-10 h-10 border-4 border-white border-dashed rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 px-4">
      <div className="bg-white p-8 rounded shadow-md w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6 text-center">Login to NRC Vault</h2>

        {error && <p className="text-red-500 text-sm mb-4 text-center">{error}</p>}

        {/* Email Login Form */}
        <form onSubmit={handleEmailLogin} className="mb-6">
          <input
            type="email"
            placeholder="Email"
            className="w-full mb-4 p-2 border rounded"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Password"
            className="w-full mb-4 p-2 border rounded"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button
            type="submit"
            className="w-full bg-blue-600 text-white hover:bg-blue-700 font-semibold py-2 px-4 rounded"
          >
            Sign in with Email
          </button>
        </form>

        {/* Google Sign-In Button */}
        <button
          onClick={handleGoogleLogin}
          className="w-full bg-black text-white hover:bg-gray-800 font-semibold py-2 px-4 rounded"
        >
          Sign in with Google
        </button>
<p className="text-sm text-center mt-4">
  Don’t have an account?{" "}
  <a href="/signup" className="text-blue-600 hover:underline">
    Sign up here
  </a>
</p>
      </div>
    </div>
  );
}
