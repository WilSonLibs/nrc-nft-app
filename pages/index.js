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
  const [walletAddress, setWalletAddress] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      if (!user) {
        router.push('/login');
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

  const connectWallet = async () => {
    if (typeof window !== 'undefined') {
      const isPhantomInstalled = window.solana?.isPhantom;

      if (!isPhantomInstalled) {
        const isMobile = /Mobi|Android/i.test(navigator.userAgent);
        if (isMobile) {
          alert("Phantom Wallet not detected. Open this site inside the Phantom app’s browser.");
        } else {
          alert("Phantom Wallet not found. Please install it from https://phantom.app/");
        }
        return;
      }

      try {
        const resp = await window.solana.connect();
        setWalletAddress(resp.publicKey.toString());
      } catch (err) {
        console.error("Wallet connection failed:", err);
      }
    }
  };

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

        {/* Connect button positioned below the paragraph */}
        <div className="text-center mb-12">
          {!walletAddress ? (
            <button
              onClick={connectWallet}
              className="bg-black text-white px-4 py-2 rounded hover:bg-gray-900 transition duration-200"
            >
              Connect Wallet
            </button>
          ) : (
            <p className="text-sm text-gray-600 truncate max-w-xs mx-auto">
              Connected: {walletAddress}
            </p>
          )}
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
