import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { collection, getDocs, query, limit } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import Link from 'next/link';
import Head from 'next/head';

export default function Home() {
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [users, setUsers] = useState([]);
  const router = useRouter();

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      if (!user) {
        router.push('/login'); // Redirect to login if not authenticated
      } else {
        setCheckingAuth(false);
      }
    });

    return () => unsubscribeAuth();
  }, [router]);

  useEffect(() => {
    const fetchUsers = async () => {
      const q = query(collection(db, 'nrc_submissions'), limit(3));
      const querySnapshot = await getDocs(q);
      const usersList = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
      setUsers(usersList);
    };

    fetchUsers();
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
    <>
      <Head>
        <title>NRC NFT App</title>
      </Head>

      <div className="min-h-screen bg-gray-100 py-10">
        <div className="max-w-6xl mx-auto px-6">
          <h1 className="text-3xl font-bold text-center text-gray-800 mb-8">
            Welcome to the NRC NFT App
          </h1>
          <p className="text-center text-gray-600 mb-12">
            Use this platform to verify and manage your NRC on the blockchain.
          </p>

          {/* Flashcards Section */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mb-12">
            {users.map((user) => (
              <div key={user.id} className="bg-white p-6 rounded-lg shadow-md">
                <h2 className="text-xl font-semibold mb-2">{user.fullName}</h2>
                <p><strong>NRC:</strong> {user.nrcNumber}</p>
                <p><strong>DOB:</strong> {user.dateOfBirth}</p>
                <p><strong>Address:</strong> {user.address}</p>
              </div>
            ))}
          </div>

          {/* See More Button */}
          <div className="text-center">
            <Link
              href="/mint"
              className="bg-black text-white py-2 px-4 rounded hover:bg-gray-800"
            >
              See More
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
