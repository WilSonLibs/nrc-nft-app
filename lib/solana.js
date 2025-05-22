// lib/solana.js
import { Connection, clusterApiUrl, Keypair } from "@solana/web3.js";
import { Metaplex, bundlrStorage } from "@metaplex-foundation/js";

// Connect to Solana Devnet
export const connection = new Connection(clusterApiUrl("devnet"), "confirmed");

// Initialize Metaplex
export const metaplex = Metaplex.make(connection)
  .use(bundlrStorage());
