import { Connection, clusterApiUrl, Keypair } from "@solana/web3.js";
import { Metaplex, bundlrStorage, keypairIdentity } from "@metaplex-foundation/js";

// Load keypair from environment
const secretArray = JSON.parse(process.env.NEXT_PUBLIC_SOLANA_SECRET);
const keypair = Keypair.fromSecretKey(Uint8Array.from(secretArray));

// Connect to the Solana Devnet
export const connection = new Connection(clusterApiUrl("devnet"), "confirmed");

// Initialize Metaplex with keypair and bundlr storage
export const metaplex = Metaplex.make(connection)
  .use(keypairIdentity(keypair)) // Correctly inject wallet
  .use(bundlrStorage({
    address: 'https://devnet.bundlr.network',
    providerUrl: clusterApiUrl('devnet'),
    timeout: 60000,
  }));
