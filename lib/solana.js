// lib/solana.js
import { Connection, clusterApiUrl, Keypair } from "@solana/web3.js";
import { Metaplex, bundlrStorage, keypairIdentity } from "@metaplex-foundation/js";
import secret from "./secret.json"; // Exported from your Phantom wallet as a secret key array

// 1. Connect to Solana Devnet
export const connection = new Connection(clusterApiUrl("devnet"), "confirmed");

// 2. Create a keypair from the secret JSON file
const keypair = Keypair.fromSecretKey(Uint8Array.from(secret));

// 3. Initialize Metaplex with the identity and storage
export const metaplex = Metaplex.make(connection)
  .use(keypairIdentity(keypair)) // Automatically handles publicKey and signing
  .use(bundlrStorage());
