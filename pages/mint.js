// pages/mint.js
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { auth, db } from '../lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { collection, getDocs } from 'firebase/firestore';
import { motion } from 'framer-motion';

export default function MintPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const router = useRouter();
  const usersPerPage = 6;

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, user => {
      if (!user) {
        router.push('/login');
      } else {
        setCheckingAuth(false);
      }
    });
    return () => unsubscribe();
  }, []);

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

    fetchAllUsers();
  }, []);

  const filteredUsers = users.filter(
    user =>
      user.fullName.toLowerCase().includes(search.toLowerCase()) ||
      user.nrcNumber.toLowerCase().includes(search.toLowerCase())
  );

  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);
  const totalPages = Math.ceil(filteredUsers.length / usersPerPage);

  const paginate = pageNumber => setCurrentPage(pageNumber);

  const maskNRC = nrc => {
    if (!nrc || nrc.length < 3) return '***';
    return '*'.repeat(nrc.length - 3) + nrc.slice(-3);
  };

  const maskDOB = () => '****-**-**';
  const maskAddress = address => {
    if (!address || address.length < 5) return '***';
    return address.slice(0, 3) + '****' + address.slice(-2);

  };

  if (checkingAuth || loading) {
    return (
      <p className="text-center mt-10 text-gray-700">
        {checkingAuth ? 'Checking authentication...' : 'Loading registered users...'}
      </p>
    );
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6 text-center">
        Registered NRC Users
      </h1>

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
        {currentUsers.map((user, index) => (
          <motion.div
            key={user.id}
            className="border shadow-lg rounded-xl p-4 bg-white hover:shadow-2xl transition duration-300"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <h2 className="text-xl font-semibold mb-2">{user.fullName}</h2>
            <p><strong>NRC:</strong> {maskNRC(user.nrcNumber)}</p>
            <p><strong>DOB:</strong> {maskDOB()}</p>
            <p><strong>Address:</strong> {maskAddress(user.address)}</p>
            <p className="text-sm text-gray-500 mt-2">UserID: {user.userId}</p>

            <button
              className="mt-4 bg-black text-white py-1 px-3 rounded hover:bg-gray-800"
              onClick={() => alert(`Minting NFT for ${user.fullName}`)}
            >
              Mint NFT
            </button>
          </motion.div>
        ))}
      </div>

      {totalPages > 1 && (
        <div className="flex justify-center mt-8 space-x-2">
          {Array.from({ length: totalPages }, (_, idx) => (
            <button
              key={idx + 1}
              onClick={() => paginate(idx + 1)}
              className={`px-3 py-1 rounded border ${
                currentPage === idx + 1
                  ? 'bg-black text-white'
                  : 'bg-white text-black'
              }`}
            >
              {idx + 1}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
