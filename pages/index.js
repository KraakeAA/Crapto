import { useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import Link from 'next/link';
import axios from 'axios';

export default function Home() {
  const { publicKey } = useWallet();
  const [tokenName, setTokenName] = useState('');
  const [ticker, setTicker] = useState('');
  const [image, setImage] = useState(null);

  const handleCreateToken = async () => {
    if (!publicKey) {
      alert('Connect your Crapto wallet!');
      return;
    }
    const formData = new FormData();
    formData.append('name', tokenName);
    formData.append('ticker', ticker);
    if (image) formData.append('image', image);
    formData.append('creator', publicKey.toString());

    try {
      const response = await axios.post('/api/create-token', formData);
      alert(`Crapto token created: ${response.data.tokenId}`);
    } catch (error) {
      console.error(error);
      alert('Error creating token');
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-crapto-brown p-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold">Crapto 💩</h1>
        <WalletMultiButton className="bg-crapto-light-brown text-crapto-dark-brown px-4 py-2 rounded hover:bg-white" />
      </header>
      <section className="bg-crapto-dark-brown py-12 text-center">
        <h2 className="text-4xl font-bold mb-4">Create Your Crapto Coin</h2>
        <p className="text-crapto-light-brown mb-8">Launch your own craptastic currency in seconds!</p>
        <div className="max-w-md mx-auto bg-crapto-brown p-6 rounded-lg shadow-lg">
          <input type="text" placeholder="Token Name (e.g., PoopCoin)" value={tokenName} onChange={(e) => setTokenName(e.target.value)} className="w-full p-3 mb-4 bg-crapto-light-brown text-crapto-dark-brown rounded" />
          <input type="text" placeholder="Ticker (e.g., POOP)" value={ticker} onChange={(e) => setTicker(e.target.value)} className="w-full p-3 mb-4 bg-crapto-light-brown text-crapto-dark-brown rounded" />
          <input type="file" accept="image/*" onChange={(e) => setImage(e.target.files?.[0] || null)} className="w-full p-3 mb-4 bg-crapto-light-brown text-crapto-dark-brown rounded" />
          <button onClick={handleCreateToken} disabled={!publicKey} className="w-full p-3 bg-crapto-light-brown text-crapto-dark-brown rounded hover:bg-white disabled:bg-gray-500">Launch Crapto Coin</button>
        </div>
      </section>
      <section className="py-12 px-4">
        <h2 className="text-3xl font-bold text-center mb-8">Top Crapto Coins</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
          {['PoopCoin', 'DungToken', 'StinkBux', 'MudPie'].map((name, index) => (
            <Link href={`/token/${name}`} key={index}>
              <div className="bg-crapto-brown p-4 rounded-lg shadow hover:bg-crapto-light-brown cursor-pointer">
                <img src={`/placeholder-${index + 1}.png`} alt={name} className="w-full h-32 object-cover rounded mb-4" />
                <h3 className="text-xl font-bold">{name}</h3>
                <p className="text-crapto-light-brown">Ticker: {name.slice(0, 4).toUpperCase()}</p>
                <p className="text-crapto-light-brown">Market Cap: ${Math.floor(Math.random() * 10000)}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>
      <footer className="bg-crapto-brown p-4 text-center">
        <p>&copy; 2025 Crapto. The smelliest coins on Solana. 💩</p>
      </footer>
    </div>
  );
}
