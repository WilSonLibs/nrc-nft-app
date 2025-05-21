// pages/register.js
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../lib/firebase';
import RegisterForm from '../components/RegisterForm';

export default function RegisterPage() {
  const [checkingAuth, setCheckingAuth] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) {
        setTimeout(() => router.push('/login'), 1500); // Optional delay
      } else {
        setCheckingAuth(false);
      }
    });

    return () => unsubscribe();
  }, []);

if (checkingAuth) {
  return (
    <div className="flex items-center justify-center h-screen bg-white">
      <div className="flex items-center space-x-4">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-black"></div>
        <p className="ml-4 text-lg font-medium text-gray-800">Checking authentication...</p>
      </div>
    </div>
  );
  }

  return (
    <div className="p-8 min-h-screen bg-gray-50">
      <div className="max-w-xl mx-auto bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-2xl font-bold text-black mb-4">Register a New NRC</h2>
        <RegisterForm />
      </div>
    </div>
  );
}
