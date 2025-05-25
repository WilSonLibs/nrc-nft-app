// lib/AuthContext.js
import { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from './firebase';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [walletAddress, setWalletAddress] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);

      if (firebaseUser) {
        // Fetch role from Firestore
        const docRef = doc(db, 'users', firebaseUser.uid);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          setRole(docSnap.data().role);
        } else {
          setRole(null); // or default role if you want
        }
      } else {
        setRole(null);
      }

      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Load wallet from localStorage on mount
  useEffect(() => {
    const storedAddress = localStorage.getItem('walletAddress');
    if (storedAddress) setWalletAddress(storedAddress);
  }, []);

  // Store wallet in localStorage whenever it changes
  useEffect(() => {
    if (walletAddress) {
      localStorage.setItem('walletAddress', walletAddress);
    }
  }, [walletAddress]);

  return (
    <AuthContext.Provider value={{ user, role, loading, walletAddress, setWalletAddress }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
