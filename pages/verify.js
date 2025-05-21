// pages/verify.js
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../lib/firebase';
import { getNFTDetails } from '../lib/nft';

export default function Verify() {
  const [nrc, setNrc] = useState('');
  const [nftData, setNftData] = useState(null);
  const [error, setError] = useState('');
  const [checkingAuth, setCheckingAuth] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, user => {
      if (!user) {
        setTimeout(() => router.push('/login'), 1500); // Delay for animation
      } else {
        setCheckingAuth(false);
      }
    });
    return () => unsubscribe();
  }, []);

  const handleVerify = async () => {
    try {
      const data = await getNFTDetails(nrc);
      setNftData(data);
      setError('');
    } catch (err) {
      setNftData(null);
      setError('No NFT found for that NRC/Token ID');
    }
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
    <div className="flex flex-col items-center justify-center min-h-screen px-4 py-10 bg-gray-100">
      <div className="bg-white shadow-lg rounded-xl w-full max-w-md p-8">
        <h2 className="text-2xl font-semibold text-center mb-6 text-black">Verify Your NRC NFT</h2>

        <input
          type="text"
          placeholder="Enter NRC or Token ID"
          value={nrc}
          onChange={(e) => setNrc(e.target.value)}
          className="w-full px-4 py-2 border rounded-md mb-4 focus:outline-none focus:ring-2 focus:ring-black"
        />

        <button
          onClick={handleVerify}
          className="w-full bg-black text-white py-2 rounded-md hover:bg-gray-900 transition"
        >
          Verify
        </button>

        {error && <p className="mt-4 text-red-500 text-sm">{error}</p>}

        {nftData && (
          <div className="mt-6 p-4 bg-gray-50 border rounded-md">
            <p><strong>Token ID:</strong> {nftData.tokenId}</p>
            <p><strong>Name:</strong> {nftData.name}</p>
            <p><strong>NRC:</strong> {nftData.nrc}</p>
            <p><strong>Issued:</strong> {nftData.issuedAt}</p>
          </div>
        )}
      </div>
    </div>
  );
}
