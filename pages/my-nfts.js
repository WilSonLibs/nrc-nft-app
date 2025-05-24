// pages/my-nfts.js
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { Connection, PublicKey, clusterApiUrl } from '@solana/web3.js';
import { Metaplex } from '@metaplex-foundation/js';
import Head from 'next/head';
import { useAuth } from '../lib/AuthContext';

export default function MyNFTs() {
  const { user, role, loading: authLoading } = useAuth();
  const [walletAddress, setWalletAddress] = useState(null);
  const [nfts, setNfts] = useState([]);
  const [isWalletLoading, setIsWalletLoading] = useState(true);
  const router = useRouter();

  // Role check + redirect
  useEffect(() => {
    if (!authLoading && (!user || role !== 'admin')) {
      router.replace('/unauthorized'); // or show a custom message below
    }
  }, [user, role, authLoading, router]);

  // Connect to Phantom wallet
  useEffect(() => {
    const connectWallet = async () => {
      if (window.solana && window.solana.isPhantom) {
        try {
          const { publicKey } = await window.solana.connect({ onlyIfTrusted: true });
          setWalletAddress(publicKey.toString());
        } catch (err) {
          console.error(err);
        }
      } else {
        alert('Phantom Wallet not found. Please install it.');
        router.push('/');
      }
      setIsWalletLoading(false);
    };

    if (!authLoading && user && role === 'admin') {
      connectWallet();
    }
  }, [authLoading, user, role, router]);

  // Fetch NFTs
  useEffect(() => {
    const fetchNFTs = async () => {
      if (!walletAddress) return;

      const connection = new Connection(clusterApiUrl('devnet'));
      const metaplex = new Metaplex(connection);
      const owner = new PublicKey(walletAddress);

      const nftList = await metaplex.nfts().findAllByOwner({ owner });

      setNfts(nftList);
    };

    if (walletAddress) fetchNFTs();
  }, [walletAddress]);

  // Handle loading
  if (authLoading || isWalletLoading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <p className="text-xl animate-pulse">Loading your NFTs...</p>
      </div>
    );
  }

  // Handle unauthorized access gracefully (fallback if redirect fails)
  if (!user || role !== 'admin') {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center text-center p-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">403 – Unauthorized</h1>
          <p className="mb-4">You don't have access to view this page.</p>
          <button
            className="bg-white text-black px-4 py-2 rounded"
            onClick={() => router.push('/')}
          >
            Return to Home
          </button>
        </div>
      </div>
    );
  }

  // Main NFT Display
  return (
    <>
      <Head>
        <title>My NFTs | NRC NFT</title>
      </Head>
      <div className="min-h-screen bg-black text-white p-6">
        <h1 className="text-2xl font-bold mb-4">My NFTs</h1>
        {!walletAddress ? (
          <p>Connecting to wallet...</p>
        ) : nfts.length === 0 ? (
          <p>No NFTs found in your wallet.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {nfts.map((nft, idx) => (
              <div key={idx} className="bg-gray-800 rounded p-4">
                <h2 className="text-lg font-semibold mb-2">{nft.name}</h2>
                {nft.json?.image && (
                  <img
                    src={nft.json.image}
                    alt={nft.name}
                    className="w-full h-auto rounded mb-2"
                  />
                )}
                <p className="text-sm">{nft.symbol}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
