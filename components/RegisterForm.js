// components/RegisterForm.js
import { useState } from 'react';
import { db, auth } from '../lib/firebase';
import { collection, addDoc, Timestamp } from 'firebase/firestore';
import { useRouter } from 'next/router';

export default function RegisterForm() {
  const [formData, setFormData] = useState({
    fullName: '',
    nrcNumber: '',
    dateOfBirth: '',
    address: '',
  });

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) throw new Error("User not authenticated.");

      await addDoc(collection(db, 'nrc_submissions'), {
        ...formData,
        userId: currentUser.uid,
        createdAt: Timestamp.now(),
      });

      setSuccess(true);
      setTimeout(() => router.push('/mint'), 1500); // redirect to mint page
    } catch (err) {
      console.error(err);
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <input
        type="text"
        name="fullName"
        placeholder="Full Name"
        value={formData.fullName}
        onChange={handleChange}
        className="w-full border p-2 rounded"
        required
      />
      <input
        type="text"
        name="nrcNumber"
        placeholder="NRC Number"
        value={formData.nrcNumber}
        onChange={handleChange}
        className="w-full border p-2 rounded"
        required
      />
      <input
        type="date"
        name="dateOfBirth"
        placeholder="Date of Birth"
        value={formData.dateOfBirth}
        onChange={handleChange}
        className="w-full border p-2 rounded"
        required
      />
      <input
        type="text"
        name="address"
        placeholder="Address"
        value={formData.address}
        onChange={handleChange}
        className="w-full border p-2 rounded"
        required
      />

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-black text-white py-2 rounded hover:bg-gray-800"
      >
        {loading ? 'Submitting...' : 'Submit'}
      </button>

      {success && <p className="text-green-600 mt-2">Submission successful!</p>}
      {error && <p className="text-red-600 mt-2">{error}</p>}
    </form>
  );
}
