// pages/_app.js
import '../styles/globals.css';
import { AuthProvider } from '../lib/AuthContext';
import Navbar from '../components/Navbar';

import {
  ConnectionProvider,
  WalletProvider,
} from '@solana/wallet-adapter-react';
import {
  WalletModalProvider,
} from '@solana/wallet-adapter-react-ui';
import { PhantomWalletAdapter } from '@solana/wallet-adapter-phantom';
import { clusterApiUrl } from '@solana/web3.js';

import '@solana/wallet-adapter-react-ui/styles.css'; // Ensure wallet UI styles are applied

const endpoint = clusterApiUrl('devnet');
const wallets = [new PhantomWalletAdapter()];

export default function App({ Component, pageProps }) {
  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>
          <AuthProvider>
            <Navbar />
            <Component {...pageProps} />
          </AuthProvider>
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
}
