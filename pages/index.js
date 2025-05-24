import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { collection, getDocs, query, limit } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../lib/AuthContext';
import Link from 'next/link';
import Head from 'next/head';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';

export default function Home() {
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [users, setUsers] = useState([]);
  const { user, walletAddress } = useAuth();
  const router = useRouter();

  // Authentication check
  useEffect(() => {
    if (!user) {
      router.push('/login');
    } else {
      setCheckingAuth(false);
    }
  }, [user]);

  // Fetch users from Firestore
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

  // Mint NFT
  const handleMint = async (user) => {
    if (!walletAddress) {
      alert('Connect your wallet first');
      return;
    }

    try {
      const res = await fetch('/api/mint', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: user.fullName,
          nrcNumber: user.nrcNumber,
          dateOfBirth: user.dateOfBirth,
          address: user.address
        }),
      });

      const data = await res.json();
      if (data.success) {
        alert(`NFT Minted! View on explorer:\nhttps://solscan.io/token/${data.nftAddress}?cluster=devnet`);
      } else {
        alert('Minting failed');
      }
    } catch (error) {
      console.error(error);
      alert('Something went wrong during minting.');
    }
  };

  // Helpers to mask user data
  const maskNRC = (nrc) => {
    if (!nrc || nrc.length < 3) return '***';
    return '*'.repeat(nrc.length - 3) + nrc.slice(-3);
  };

  const maskDOB = () => '****-**-**';

  const maskAddress = (address) => {
    if (!address || address.length < 5) return '***';
    return address.slice(0, 3) + '****' + address.slice(-2);
  };

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
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-gray-800">Make Your NRC An NFT</h1>
          </div>

          <p className="text-center text-gray-600 mb-4">
            Use this platform to verify and manage your NRC on the blockchain.
          </p>

          <div className="text-center mb-12">
            <WalletMultiButton />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mb-12">
            {users.map((user) => (
              <div key={user.id} className="bg-white p-6 rounded-lg shadow-md">
                <h2 className="text-xl font-semibold mb-2">{user.fullName}</h2>
                <p><strong>NRC:</strong> {maskNRC(user.nrcNumber)}</p>
                <p><strong>DOB:</strong> {maskDOB()}</p>
                <p><strong>Address:</strong> {maskAddress(user.address)}</p>

                {walletAddress && (
                  <button
                    onClick={() => handleMint(user)}
                    className="mt-4 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                  >
                    Mint as NFT
                  </button>
                )}
              </div>
            ))}
          </div>

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
