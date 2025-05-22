// pages/my-nfts.js
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { Connection, PublicKey, clusterApiUrl } from '@solana/web3.js';
import { Metaplex } from '@metaplex-foundation/js';
import Head from 'next/head';

export default function MyNFTs() {
  const [walletAddress, setWalletAddress] = useState(null);
  const [nfts, setNfts] = useState([]);
  const router = useRouter();

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
    };

    connectWallet();
  }, [router]);

  useEffect(() => {
    const fetchNFTs = async () => {
      if (!walletAddress) return;

      const connection = new Connection(clusterApiUrl('devnet'));
      const metaplex = new Metaplex(connection);
      const owner = new PublicKey(walletAddress);

      const nftList = await metaplex.nfts().findAllByOwner({ owner });

      setNfts(nftList);
    };

    fetchNFTs();
  }, [walletAddress]);

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
