// components/Navbar.js
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { auth } from '../lib/firebase';
import { signOut, onAuthStateChanged } from 'firebase/auth';
import { Menu, X } from 'lucide-react';

export default function Navbar() {
  const [user, setUser] = useState(null);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      setUser(user);
    });
    return () => unsub();
  }, []);

  const handleLogout = async () => {
    await signOut(auth);
    setUser(null);
  };

  return (
    <nav className="bg-black text-white shadow-md">
      <div className="max-w-6xl mx-auto px-4 py-3 flex justify-between items-center">
        <Link href="/" className="text-2xl font-bold">NRC NFT</Link>

        {/* Hamburger Menu */}
        <div className="md:hidden">
          <button onClick={() => setIsOpen(!isOpen)} aria-label="Toggle Menu">
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Desktop Nav Links */}
        <ul className="hidden md:flex gap-6 text-sm font-medium items-center">
          <li><Link href="/" className="hover:text-gray-300">Home</Link></li>
          <li><Link href="/register" className="hover:text-gray-300">Register</Link></li>
          <li><Link href="/verify" className="hover:text-gray-300">Verify</Link></li>
          <li><Link href="/mint" className="hover:text-gray-300">Mint</Link></li>
          {!user ? (
            <li><Link href="/login" className="hover:text-gray-300">Login</Link></li>
          ) : (
            <li>
              <button onClick={handleLogout} className="hover:text-red-400">Logout</button>
            </li>
          )}
        </ul>
      </div>

      {/* Mobile Nav Links */}
      {isOpen && (
        <div className="md:hidden px-4 pb-4">
          <ul className="flex flex-col gap-4 text-sm font-medium">
            <li><Link href="/" onClick={() => setIsOpen(false)}>Home</Link></li>
            <li><Link href="/register" onClick={() => setIsOpen(false)}>Register</Link></li>
            <li><Link href="/verify" onClick={() => setIsOpen(false)}>Verify</Link></li>
            <li><Link href="/mint" onClick={() => setIsOpen(false)}>Mint</Link></li>
            {!user ? (
              <li><Link href="/login" onClick={() => setIsOpen(false)}>Login</Link></li>
            ) : (
              <li>
                <button
                  onClick={() => {
                    handleLogout();
                    setIsOpen(false);
                  }}
                  className="text-red-400"
                >
                  Logout
                </button>
              </li>
            )}
          </ul>
        </div>
      )}
    </nav>
  );
}
