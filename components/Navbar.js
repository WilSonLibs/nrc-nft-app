import Link from 'next/link';
import { useState, useEffect } from 'react';
import { auth, db } from '../lib/firebase';
import { signOut, onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { Menu, X } from 'lucide-react';

export default function Navbar() {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState('');
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);
        // Fetch role from Firestore
        const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
        if (userDoc.exists()) {
          setRole(userDoc.data().role || '');
        }
      } else {
        setUser(null);
        setRole('');
      }
    });
    return () => unsub();
  }, []);

  const handleLogout = async () => {
    await signOut(auth);
    setUser(null);
    setRole('');
  };

  const renderLinks = () => (
    <>
      <li><Link href="/" className="hover:text-gray-300">Home</Link></li>
      <li><Link href="/register" className="hover:text-gray-300">Register</Link></li>
      <li><Link href="/verify" className="hover:text-gray-300">Verify</Link></li>
      {role === 'admin' && (
        <>
          <li><Link href="/mint" className="hover:text-gray-300">Mint</Link></li>
          <li><Link href="/my-nfts" className="hover:text-gray-300">My NFTs</Link></li>
        </>
      )}
      {!user ? (
        <li><Link href="/login" className="hover:text-gray-300">Login</Link></li>
      ) : (
        <li>
          <button onClick={handleLogout} className="hover:text-red-400">Logout</button>
        </li>
      )}
    </>
  );

  return (
    <nav className="bg-black text-white shadow-md">
      <div className="max-w-6xl mx-auto px-4 py-3 flex justify-between items-center">
        <Link href="/" className="text-2xl font-bold">NRC NFT</Link>

        <div className="md:hidden">
          <button onClick={() => setIsOpen(!isOpen)} aria-label="Toggle Menu">
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        <ul className="hidden md:flex gap-6 text-sm font-medium items-center">
          {renderLinks()}
        </ul>
      </div>

      {isOpen && (
        <div className="md:hidden px-4 pb-4">
          <ul className="flex flex-col gap-4 text-sm font-medium">
            {renderLinks()}
          </ul>
        </div>
      )}
    </nav>
  );
}
