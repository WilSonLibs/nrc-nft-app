// pages/mint.js
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { auth, db } from '../lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, collection, getDocs } from 'firebase/firestore';
import { motion } from 'framer-motion';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { Metaplex } from '@metaplex-foundation/js';
import { Connection, clusterApiUrl } from '@solana/web3.js';
import { mintFlashcardNFT } from '../lib/mintFlashcardNFT';

export default function MintPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const router = useRouter();
  const { publicKey, signTransaction } = useWallet();

  const connection = new Connection(clusterApiUrl('devnet'));
  const metaplex = Metaplex.make(connection);

  useEffect(() => {
    const checkUser = async (user) => {
      try {
        const roleDoc = await getDoc(doc(db, 'users', user.uid));
        if (roleDoc.exists() && roleDoc.data().role === 'admin') {
          setIsAdmin(true);
        } else {
          alert('Access denied: Admins only.');
          router.push('/');
        }
      } catch (error) {
        console.error('Error checking role:', error);
        alert('Error checking role. Please try again later.');
        router.push('/');
      } finally {
        setCheckingAuth(false);
      }
    };

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) {
        router.push('/login');
      } else {
        checkUser(user);
      }
    });

    return () => unsubscribe();
  }, [router]);

  useEffect(() => {
    const fetchAllUsers = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'nrc_submissions'));
        const allUsers = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));
        setUsers(allUsers);
      } catch (err) {
        console.error('Error fetching users:', err);
      } finally {
        setLoading(false);
      }
    };

    if (isAdmin) fetchAllUsers();
  }, [isAdmin]);

  const handleMint = async (user) => {
    if (!publicKey || !signTransaction) {
      alert("Please connect your wallet first.");
      return;
    }

    try {
      const elementId = `nrc-card-${user.id}`;

      const nft = await mintFlashcardNFT({
        elementId,
        title: `${user.fullName} - NRC Card`,
        userData: user,
        wallet: { publicKey },
        metaplex,
      });

      alert(`Minted NFT for ${user.fullName}\nAddress: ${nft.address.toBase58()}`);
    } catch (error) {
      console.error('Mint failed:', error);
      alert('Minting failed. Check console.');
    }
  };

  const filteredUsers = users.filter(
    user =>
      user.fullName.toLowerCase().includes(search.toLowerCase()) ||
      user.nrcNumber.toLowerCase().includes(search.toLowerCase())
  );

  if (checkingAuth || loading) {
    return <p className="text-center mt-10 text-gray-700">Loading...</p>;
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6 text-center">Registered NRC Users</h1>

      <div className="flex justify-center mb-6">
        <WalletMultiButton />
      </div>

      <div className="mb-6 flex justify-center">
        <input
          type="text"
          placeholder="Search by name or NRC..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full max-w-md px-4 py-2 border rounded shadow"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {filteredUsers.map((user, index) => (
          <motion.div
            key={user.id}
            id={`nrc-card-${user.id}`} // This is used to capture DOM element for NFT image
            className="border shadow-lg rounded-xl p-4 bg-white"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <h2 className="text-xl font-semibold mb-2">{user.fullName}</h2>
            <p><strong>NRC:</strong> ****{user.nrcNumber?.slice(-3)}</p>
            <p><strong>DOB:</strong> ****-**-**</p>
            <p><strong>Address:</strong> {user.address?.slice(0, 4)}****</p>
            <p className="text-sm text-gray-500 mt-2">UserID: {user.userId}</p>

            <button
              className={`mt-4 py-1 px-3 rounded font-semibold ${
                publicKey ? 'bg-green-600' : 'bg-gray-400'
              } text-white`}
              onClick={() => handleMint(user)}
              disabled={!publicKey}
            >
              Mint NFT
            </button>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
