import React, { useState, useContext } from 'react';

// 1. Tailwind CSS Setup with Custom Colors (Required for single-file apps)
// The Tailwind configuration must be added globally via a script tag.
const TailwindConfig = () => (
  <script dangerouslySetInnerHTML={{ __html: `
    tailwind.config = {
      theme: {
        extend: {
          colors: {
            // Defined custom colors for the 'Crapto' theme
            'crapto-dark-brown': '#4F2C0B',
            'crapto-brown': '#8B4513',
            'crapto-light-brown': '#DAA06D',
            'crapto-poop-yellow': '#F4D03F', // For the poop emoji look
          },
          animation: {
            'spin-slow': 'spin 10s linear infinite',
            'bounce-slow': 'bounce 2s infinite',
          }
        },
      },
    }
  `}} />
);

// 2. Mock Wallet/Context Setup for Single File (Simulates Solana Wallet Adapter)
const MockWalletContext = React.createContext({
  publicKey: null,
  connected: false,
  connect: () => { console.log("Connect called"); },
  disconnect: () => { console.log("Disconnect called"); }
});

const MockWalletProvider = ({ children }) => {
  const [publicKey, setPublicKey] = useState(null);
  const connected = !!publicKey;

  const connect = () => {
    // Simulate a successful wallet connection
    const mockKey = "897c...FakePubKey...4dGf";
    setPublicKey(mockKey);
  };

  const disconnect = () => {
    setPublicKey(null);
  };

  const value = { publicKey, connected, connect, disconnect };

  return (
    <MockWalletContext.Provider value={value}>
      {children}
    </MockWalletContext.Provider>
  );
};

// Mock useWallet hook
const useWallet = () => useContext(MockWalletContext);

// Mock WalletMultiButton component
const WalletMultiButton = ({ className }) => {
  const { connected, connect, disconnect } = useWallet();

  return (
    <button
      onClick={connected ? disconnect : connect}
      className={`
        ${className} 
        transition-all duration-300 transform hover:scale-105 
        font-bold rounded-full shadow-xl 
        ${connected ? 'bg-red-600 text-white hover:bg-red-700' : 'bg-crapto-light-brown text-crapto-dark-brown hover:bg-white'}
      `}
    >
      {connected ? "Disconnect Wallet" : "Connect Crapto Wallet"}
    </button>
  );
};


// 3. Main App Component
const CraptoApp = () => {
  const { publicKey } = useWallet();
  const [tokenName, setTokenName] = useState('');
  const [ticker, setTicker] = useState('');
  const [image, setImage] = useState(null);
  const [message, setMessage] = useState('');

  const handleCreateToken = () => {
    if (!publicKey) {
      setMessage('Connect your wallet to launch!');
      return;
    }
    if (!tokenName || !ticker) {
      setMessage('Token Name and Ticker are required!');
      setTimeout(() => setMessage(''), 3000);
      return;
    }

    setMessage(`🎉 ${tokenName.toUpperCase()} (${ticker.toUpperCase()}) Launched! Now go pump it! 🚀`);
    setTimeout(() => setMessage(''), 5000); // Clear message after 5s
    setTokenName('');
    setTicker('');
    setImage(null);
    // Note: In a real app, this is where you'd call a Solana Token Program instruction.
  };

  const tokens = [
    { name: 'PoopCoin', ticker: 'POOP', marketCap: 5000, color: 'text-yellow-600', icon: '💩' },
    { name: 'DungToken', ticker: 'DUNG', marketCap: 3200, color: 'text-green-600', icon: '🤢' },
    { name: 'StinkBux', ticker: 'STNK', marketCap: 7800, color: 'text-red-600', icon: '🔥' },
    { name: 'MudPie', ticker: 'MUDP', marketCap: 4200, color: 'text-blue-600', icon: '💧' },
  ];
  
  // Data for the SVG line chart
  const marketData = [
    { label: "Day 1", value: 5000 },
    { label: "Day 2", value: 3200 },
    { label: "Day 3", value: 7800 },
    { label: "Day 4", value: 4200 },
    { label: "Day 5", value: 6000 },
  ];

  const maxVal = Math.max(...marketData.map(d => d.value));
  const height = 150;
  const width = 600;
  const padding = 30;

  const points = marketData.map((d, i) => {
    const x = padding + (i * (width - 2 * padding)) / (marketData.length - 1);
    const y = height - padding - (d.value / maxVal) * (height - 2 * padding);
    return `${x},${y}`;
  }).join(' ');
  
  const pathData = `M ${points.split(' ').map(p => p.split(',')).join(' L ')}`;

  return (
    <div className="min-h-screen flex flex-col bg-crapto-dark-brown text-white font-sans">
      <header className="p-4 flex flex-wrap justify-between items-center border-b-4 border-crapto-brown bg-crapto-brown/30 backdrop-blur-sm sticky top-0 z-10">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-crapto-poop-yellow rounded-full flex items-center justify-center text-4xl shadow-lg">💩</div> 
          <h1 className="text-4xl sm:text-5xl font-extrabold text-crapto-light-brown tracking-tighter">
            Crapto <span className="text-red-500 animate-pulse text-2xl sm:text-4xl">MAJOR UPDATE!</span>
          </h1>
        </div>
        <div className='mt-2 sm:mt-0'>
            <WalletMultiButton className="px-6 py-2 transition duration-300 animate-spin-slow-hover" />
        </div>
      </header>

      <main className="flex-grow p-4 sm:p-8">
        {/* Token Creation Section */}
        <section className="text-center mb-16">
          <h2 className="text-4xl sm:text-5xl font-extrabold mb-4 text-crapto-light-brown animate-bounce-slow">
            Create Your Crapto Coin
          </h2>
          <p className="text-lg mb-6 text-crapto-light-brown/90">
            Drop the stinkiest, best-smelling meme coin on Solana today!
          </p>
          <div className="max-w-xl mx-auto bg-crapto-brown p-8 rounded-2xl shadow-[0_10px_30px_rgba(0,0,0,0.5)] border-4 border-crapto-light-brown">
            <input
              type="text"
              placeholder="Token Name (e.g., PoopCoin)"
              value={tokenName}
              onChange={(e) => setTokenName(e.target.value)}
              className="w-full p-4 mb-4 bg-white/10 text-white placeholder-crapto-light-brown/70 rounded-xl border border-crapto-light-brown focus:outline-none focus:ring-4 focus:ring-crapto-poop-yellow transition duration-200"
            />
            <input
              type="text"
              placeholder="Ticker (e.g., POOP)"
              value={ticker}
              onChange={(e) => setTicker(e.target.value.toUpperCase().slice(0, 5))}
              className="w-full p-4 mb-4 bg-white/10 text-white placeholder-crapto-light-brown/70 rounded-xl border border-crapto-light-brown focus:outline-none focus:ring-4 focus:ring-crapto-poop-yellow transition duration-200"
            />
            {/* File input needs custom styling since default file inputs are ugly */}
            <label className="block mb-6 w-full cursor-pointer">
              <span className="sr-only">Choose token image</span>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setImage(e.target.files?.[0] || null)}
                className="block w-full text-sm text-crapto-light-brown file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-crapto-light-brown file:text-crapto-dark-brown hover:file:bg-white transition duration-200"
              />
              {image && <p className="text-xs mt-2 text-crapto-poop-yellow">Image selected: {image.name}</p>}
            </label>

            <button
              onClick={handleCreateToken}
              disabled={!publicKey || !tokenName || !ticker}
              className={`w-full p-4 font-extrabold text-xl rounded-xl shadow-lg transition duration-300 
                ${publicKey ? 'bg-crapto-poop-yellow text-crapto-dark-brown hover:bg-white hover:scale-[1.01]' : 'bg-gray-500 text-gray-300 cursor-not-allowed'}
              `}
            >
              Launch Crapto Coin 
              <span className="inline-block ml-2 transition-transform duration-300 group-hover:rotate-45">🚀</span>
            </button>
            {message && (
                <div className="mt-4 p-3 bg-green-900/50 border border-green-400 rounded-lg text-green-300 font-semibold animate-bounce-slow">
                    {message}
                </div>
            )}
            {!publicKey && (
                <p className="mt-4 text-red-400/80 font-medium">
                    Please connect your wallet to enable launching.
                </p>
            )}
          </div>
        </section>

        {/* Top Tokens Section (Replaced Link with div) */}
        <section className="mb-16">
          <h2 className="text-4xl font-bold text-center mb-10 text-crapto-poop-yellow">Top Crapto Coins</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
            {tokens.map((token, index) => (
              // Replaced Link with a div with a click handler (mock navigation)
              <div 
                key={index} 
                className="bg-crapto-dark-brown p-6 rounded-2xl shadow-xl hover:bg-crapto-brown transition duration-300 cursor-pointer border-4 border-crapto-light-brown/50 transform hover:scale-[1.03]"
                onClick={() => console.log(`Navigating to ${token.name}`)}
              >
                <div className={`w-full h-32 flex items-center justify-center rounded-xl mb-4 text-6xl bg-crapto-brown border border-crapto-light-brown`}>
                    {token.icon}
                </div>
                <h3 className={`text-3xl font-extrabold ${token.color} mb-1`}>{token.name}</h3>
                <p className="text-crapto-light-brown text-lg">Ticker: <span className="font-mono font-bold">{token.ticker}</span></p>
                <p className="text-crapto-poop-yellow font-bold text-xl mt-2">
                    Market Cap: <span className='text-white'>${token.marketCap.toLocaleString()}</span>
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Market Trend Section (Replaced chartjs with SVG) */}
        <section className="text-center mb-12">
          <h2 className="text-4xl font-bold mb-6 text-crapto-poop-yellow">Market Trend (Last 5 Days)</h2>
          <div className="max-w-3xl mx-auto bg-crapto-dark-brown/70 p-6 rounded-2xl shadow-inner border border-crapto-light-brown">
            <svg 
                viewBox={`0 0 ${width} ${height}`} 
                className="w-full h-auto" 
                preserveAspectRatio="xMidYMid meet"
                style={{ overflow: 'visible' }}
            >
              {/* Y-Axis Line */}
              <line x1={padding} y1={height - padding} x2={padding} y2={padding} stroke="#DAA06D" strokeWidth="2" />
              {/* X-Axis Line */}
              <line x1={padding} y1={height - padding} x2={width - padding} y2={height - padding} stroke="#DAA06D" strokeWidth="2" />
              
              {/* Line Path */}
              <path 
                d={pathData} 
                fill="none" 
                stroke="#F4D03F" // Poop Yellow for the line
                strokeWidth="4" 
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              
              {/* Data Points and Labels */}
              {marketData.map((d, i) => {
                const x = padding + (i * (width - 2 * padding)) / (marketData.length - 1);
                const y = height - padding - (d.value / maxVal) * (height - 2 * padding);
                return (
                  <React.Fragment key={i}>
                    {/* Circle Point */}
                    <circle cx={x} cy={y} r="6" fill="#F4D03F" stroke="#4F2C0B" strokeWidth="2" />
                    
                    {/* Label */}
                    <text 
                      x={x} 
                      y={height - padding + 20} 
                      textAnchor="middle" 
                      fontSize="14" 
                      fill="#DAA06D"
                    >
                      {d.label}
                    </text>
                    
                    {/* Value */}
                    <text 
                      x={x} 
                      y={y - 10} 
                      textAnchor="middle" 
                      fontSize="14" 
                      fill="#F4D03F" 
                      fontWeight="bold"
                    >
                      ${(d.value / 1000).toFixed(1)}K
                    </text>
                  </React.Fragment>
                );
              })}
              
              {/* Axis Label */}
              <text x={width / 2} y={height} textAnchor="middle" fontSize="16" fill="#DAA06D">
                Crapto Market Cap Trend
              </text>

            </svg>
          </div>
        </section>
      </main>

      <footer className="p-4 text-center bg-crapto-brown border-t-4 border-crapto-light-brown shadow-inner">
        <p className='text-sm sm:text-base'>&copy; 2025 Crapto. Smell the profits on Solana! 💩</p>
      </footer>
    </div>
  );
}

// Default export of the main component wrapped in the mock provider
export default function App() {
    return (
        <React.Fragment>
            <TailwindConfig />
            <MockWalletProvider>
                <CraptoApp />
            </MockWalletProvider>
        </React.Fragment>
    );
}
