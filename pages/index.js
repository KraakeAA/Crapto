import { useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import Link from 'next/link';

export default function Home() {
  const { publicKey } = useWallet();
  const [tokenName, setTokenName] = useState('');
  const [ticker, setTicker] = useState('');
  const [image, setImage] = useState(null);
  const [message, setMessage] = useState('');

  const handleCreateToken = () => {
    if (!publicKey) {
      setMessage('Connect your Crapto wallet to launch!');
      return;
    }
    setMessage(`🎉 ${tokenName} (${ticker}) launched successfully! (Mock)`);
    setTimeout(() => setMessage(''), 3000); // Clear message after 3s
  };

  const tokens = [
    { name: 'PoopCoin', ticker: 'POOP', marketCap: 5000 },
    { name: 'DungToken', ticker: 'DUNG', marketCap: 3200 },
    { name: 'StinkBux', ticker: 'STNK', marketCap: 7800 },
    { name: 'MudPie', ticker: 'MUDP', marketCap: 4200 },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-crapto-dark-brown to-crapto-brown text-white font-sans">
      <header className="p-4 flex justify-between items-center border-b-4 border-crapto-light-brown">
        <div className="flex items-center">
          <div className="w-10 h-10 bg-crapto-light-brown rounded-full mr-2"></div> {/* Logo placeholder */}
          <h1 className="text-3xl font-bold text-crapto-light-brown">Crapto 💩</h1>
        </div>
        <WalletMultiButton className="bg-crapto-light-brown text-crapto-dark-brown px-6 py-2 rounded-full hover:bg-white transition duration-300" />
      </header>
      <main className="flex-grow p-6">
        <section className="text-center mb-12">
          <h2 className="text-5xl font-extrabold mb-4 text-crapto-light-brown animate-pulse">Create Your Crapto Coin</h2>
          <p className="text-lg mb-6 text-crapto-light-brown">Drop the stinkiest meme coin on Solana!</p>
          <div className="max-w-md mx-auto bg-crapto-dark-brown p-8 rounded-xl shadow-lg border-2 border-crapto-brown">
            <input
              type="text"
              placeholder="Token Name (e.g., PoopCoin)"
              value={tokenName}
              onChange={(e) => setTokenName(e.target.value)}
              className="w-full p-4 mb-4 bg-crapto-light-brown text-crapto-dark-brown rounded-lg focus:outline-none focus:ring-2 focus:ring-crapto-brown"
            />
            <input
              type="text"
              placeholder="Ticker (e.g., POOP)"
              value={ticker}
              onChange={(e) => setTicker(e.target.value)}
              className="w-full p-4 mb-4 bg-crapto-light-brown text-crapto-dark-brown rounded-lg focus:outline-none focus:ring-2 focus:ring-crapto-brown"
            />
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setImage(e.target.files?.[0] || null)}
              className="w-full p-4 mb-4 bg-crapto-light-brown text-crapto-dark-brown rounded-lg focus:outline-none"
            />
            <button
              onClick={handleCreateToken}
              disabled={!publicKey}
              className="w-full p-4 bg-crapto-light-brown text-crapto-dark-brown rounded-lg hover:bg-white transition duration-300 disabled:bg-gray-500 disabled:cursor-not-allowed"
            >
              Launch Crapto Coin 🚀
            </button>
            {message && <p className="mt-4 text-green-400 animate-bounce">{message}</p>}
          </div>
        </section>
        <section className="mb-12">
          <h2 className="text-4xl font-bold text-center mb-6 text-crapto-light-brown">Top Crapto Coins</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            {tokens.map((token, index) => (
              <Link href={`/token/${token.name}`} key={index}>
                <div className="bg-crapto-dark-brown p-6 rounded-xl shadow-lg hover:bg-crapto-brown transition duration-300 cursor-pointer border-2 border-crapto-light-brown">
                  <img
                    src={`https://via.placeholder.com/150/8B4513/FFFFFF?text=${token.name}`}
                    alt={token.name}
                    className="w-full h-32 object-cover rounded-lg mb-4"
                  />
                  <h3 className="text-xl font-bold">{token.name}</h3>
                  <p className="text-crapto-light-brown">Ticker: {token.ticker}</p>
                  <p className="text-crapto-light-brown">Market Cap: ${token.marketCap}</p>
                </div>
              </Link>
            ))}
          </div>
        </section>
        <section className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4 text-crapto-light-brown">Market Trend</h2>
          <div className="max-w-2xl mx-auto">
            <canvas-panel>
              ```chartjs
              {
                "type": "line",
                "data": {
                  "labels": ["Day 1", "Day 2", "Day 3", "Day 4", "Day 5"],
                  "datasets": [{
                    "label": "Crapto Market Cap ($)",
                    "data": [5000, 3200, 7800, 4200, 6000],
                    "borderColor": "#D2B48C",
                    "backgroundColor": "rgba(210, 180, 140, 0.2)",
                    "tension": 0.4,
                    "fill": true
                  }]
                },
                "options": {
                  "responsive": true,
                  "scales": {
                    "y": {
                      "beginAtZero": true
                    }
                  }
                }
              }
              ```
            </canvas-panel>
          </div>
        </section>
      </main>
      <footer className="p-4 text-center bg-crapto-brown">
        <p>&copy; 2025 Crapto. Smell the profits on Solana! 💩</p>
      </footer>
    </div>
  );
}
