// pages/api/mint.js
import { metaplex } from '../../lib/solana';
import { NFTStorage, File } from 'nft.storage';

const NFT_STORAGE_TOKEN = 'c77e9eb5.ee2295aa6862495eb61d45cf30d22a30'; // Get from nft.storage

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const { fullName, nrcNumber, dateOfBirth, address } = req.body;

  try {
    const nftStorage = new NFTStorage({ token: NFT_STORAGE_TOKEN });

    const metadata = {
      name: `NRC NFT - ${fullName}`,
      description: `NRC NFT for ${fullName}`,
      attributes: [
        { trait_type: "NRC Number", value: nrcNumber },
        { trait_type: "Date of Birth", value: dateOfBirth },
        { trait_type: "Address", value: address }
      ]
    };

    const cid = await nftStorage.store({
      ...metadata,
      image: new File(
        [Buffer.from(`${fullName} | ${nrcNumber} | ${dateOfBirth} | ${address}`)],
        'nrc.txt',
        { type: 'text/plain' }
      )
    });

    const { uri } = await metaplex.nfts().uploadMetadata({
      uri: `https://${cid.ipnft}.ipfs.nftstorage.link/metadata.json`
    });

    const { nft } = await metaplex.nfts().create({
      uri,
      name: metadata.name,
      sellerFeeBasisPoints: 0,
    });

    res.status(200).json({ success: true, nftAddress: nft.address.toString() });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: err.message });
  }
}
