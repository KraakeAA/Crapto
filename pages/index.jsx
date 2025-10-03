import React, { useState, useContext, useCallback, useMemo } from 'react';

// --- CONFIGURATION AND INITIAL STATE ---

// Mock data to populate the market on initial load
const initialMockTokens = [
    { id: '1', name: 'Original Poop', ticker: 'OPOOP', marketCap: 8500, createdAt: Date.now() - 100000, creatorId: 'mock-user-1' },
    { id: '2', name: 'Damp Dirt', ticker: 'DDIRT', marketCap: 3200, createdAt: Date.now() - 50000, creatorId: 'mock-user-2' },
    { id: '3', name: 'Slimy Sludge', ticker: 'SLUDG', marketCap: 15000, createdAt: Date.now() - 10000, creatorId: 'mock-user-3' },
];

// --- 1. MOCK SOLANA WALLET CONTEXT (For UI Functionality) ---
const MockWalletContext = React.createContext(null);

const MockWalletProvider = ({ children }) => {
    const [publicKey, setPublicKey] = useState(null);
    const [userId] = useState(crypto.randomUUID()); // Simple anonymous ID for the current session
    const connected = !!publicKey;

    const connect = () => {
        // Simulate a successful wallet connection
        const mockKey = `Crapto${Math.random().toString(36).substring(2, 10)}...`;
        setPublicKey(mockKey);
    };

    const disconnect = () => {
        setPublicKey(null);
    };

    const value = { publicKey, connected, connect, disconnect, userId };

    return (
        <MockWalletContext.Provider value={value}>
            {children}
        </MockWalletContext.Provider>
    );
};

const useMockWallet = () => useContext(MockWalletContext);

const WalletMultiButton = () => {
    const { connected, connect, disconnect, userId } = useMockWallet();

    return (
        <div className="flex flex-col items-end space-y-1">
            <button
                onClick={connected ? disconnect : connect}
                className={`
                    w-full px-6 py-2 font-bold rounded-full shadow-lg transition duration-300 transform hover:scale-[1.02]
                    ${connected ? 'bg-red-600 text-white hover:bg-red-700' : 'bg-crapto-poop-yellow text-crapto-dark-brown hover:bg-white'}
                `}
            >
                {connected ? "Disconnect Wallet" : "Connect Solana Wallet"}
            </button>
            {userId && (
                <p className="text-xs text-crapto-light-brown/80 font-mono hidden sm:block">
                    Session ID: {userId.substring(0, 8)}...
                </p>
            )}
        </div>
    );
};

// --- 2. CORE APPLICATION COMPONENTS ---

const LaunchForm = ({ onLaunchToken }) => {
    const { connected, userId } = useMockWallet();

    const [tokenName, setTokenName] = useState('');
    const [ticker, setTicker] = useState('');
    const [message, setMessage] = useState('');
    const [isLaunching, setIsLaunching] = useState(false);

    const handleCreateToken = useCallback(() => {
        if (!connected) {
            setMessage('🚨 Connect your wallet first!');
            return;
        }
        if (!tokenName || !ticker) {
            setMessage('🚨 Token Name and Ticker are required!');
            return;
        }

        setIsLaunching(true);
        setMessage('Processing launch... smell the profits!');

        // Simulate network delay
        setTimeout(() => {
            const newToken = {
                id: crypto.randomUUID(),
                name: tokenName.trim(),
                ticker: ticker.trim().toUpperCase(),
                marketCap: Math.floor(Math.random() * 5000) + 1000, // Initial small market cap
                creatorId: userId,
                createdAt: Date.now(),
            };

            onLaunchToken(newToken); // Add to parent state

            setMessage(`✅ ${newToken.ticker} successfully launched!`);
            setTokenName('');
            setTicker('');
            setIsLaunching(false);
            setTimeout(() => setMessage(''), 5000); // Clear message
        }, 1500); // 1.5 second launch simulation
    }, [tokenName, ticker, connected, userId, onLaunchToken]);

    const isButtonDisabled = !connected || !tokenName || !ticker || isLaunching;

    return (
        <div className="max-w-xl w-full mx-auto bg-crapto-brown p-6 sm:p-8 rounded-2xl shadow-[0_10px_30px_rgba(0,0,0,0.5)] border-4 border-crapto-light-brown/50">
            <h2 className="text-3xl font-extrabold mb-6 text-crapto-poop-yellow text-center">
                Launch Your Crapto Coin
            </h2>
            
            <input
                type="text"
                placeholder="Token Name (e.g., PoopCoin)"
                value={tokenName}
                onChange={(e) => setTokenName(e.target.value)}
                className="w-full p-4 mb-4 bg-white/10 text-white placeholder-crapto-light-brown/70 rounded-xl border border-crapto-light-brown focus:outline-none focus:ring-4 focus:ring-crapto-poop-yellow transition duration-200"
                disabled={isLaunching}
            />
            <input
                type="text"
                placeholder="Ticker (e.g., POOP)"
                value={ticker}
                onChange={(e) => setTicker(e.target.value.replace(/[^a-zA-Z]/g, '').toUpperCase().slice(0, 5))}
                className="w-full p-4 mb-6 bg-white/10 text-white placeholder-crapto-light-brown/70 rounded-xl border border-crapto-light-brown focus:outline-none focus:ring-4 focus:ring-crapto-poop-yellow transition duration-200"
                disabled={isLaunching}
                maxLength={5}
            />

            <button
                onClick={handleCreateToken}
                disabled={isButtonDisabled}
                className={`w-full p-4 font-extrabold text-xl rounded-xl shadow-lg transition duration-300 
                    ${!isButtonDisabled 
                        ? 'bg-crapto-poop-yellow text-crapto-dark-brown hover:bg-white hover:scale-[1.01]' 
                        : 'bg-gray-500 text-gray-300 cursor-not-allowed'}
                `}
            >
                {isLaunching ? (
                    <span className="flex items-center justify-center">
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-crapto-dark-brown" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Launching...
                    </span>
                ) : (
                    'Launch Coin & Start Liquidity! 💩'
                )}
            </button>
            
            {message && (
                <div className={`mt-4 p-3 font-semibold rounded-lg text-center ${message.startsWith('✅') ? 'bg-green-900/50 border border-green-400 text-green-300' : 'bg-red-900/50 border border-red-400 text-red-300'}`}>
                    {message}
                </div>
            )}
        </div>
    );
};

const TokenList = ({ tokenList }) => {
    const { userId } = useMockWallet();

    const sortedTokenList = useMemo(() => {
        // Sort by creation time, newest first
        return [...tokenList].sort((a, b) => b.createdAt - a.createdAt);
    }, [tokenList]);

    return (
        <section className="mt-16">
            <h2 className="text-4xl font-extrabold text-center mb-10 text-crapto-light-brown">
                Live Crapto Market
            </h2>

            <div className="max-w-4xl mx-auto space-y-4">
                {sortedTokenList.length === 0 ? (
                    <p className="text-center text-crapto-light-brown/70 text-lg p-10 bg-crapto-brown/30 rounded-xl border-2 border-crapto-light-brown/50">
                        No tokens launched yet. Be the first to drop the stinkiest coin!
                    </p>
                ) : (
                    sortedTokenList.map((token) => (
                        <div 
                            key={token.id} 
                            className="bg-crapto-brown p-5 rounded-xl shadow-lg flex flex-wrap sm:flex-nowrap items-center justify-between transition duration-300 hover:bg-crapto-brown/80 border-l-8 border-crapto-poop-yellow relative"
                            // Mock click handler for 'buy/sell'
                            onClick={() => console.log(`Attempting to buy ${token.ticker}`)}
                        >
                            <div className="flex-1 min-w-[150px] mb-3 sm:mb-0">
                                <p className="text-xs text-crapto-light-brown/80">TOKEN NAME</p>
                                <h3 className="text-2xl font-extrabold text-white">{token.name}</h3>
                            </div>
                            
                            <div className="flex-1 min-w-[100px] mb-3 sm:mb-0 text-center">
                                <p className="text-xs text-crapto-light-brown/80">TICKER</p>
                                <p className="text-3xl font-mono font-black text-crapto-poop-yellow">{token.ticker}</p>
                            </div>

                            <div className="flex-1 min-w-[150px] mb-3 sm:mb-0 text-right">
                                <p className="text-xs text-crapto-light-brown/80">MARKET CAP</p>
                                <p className="text-2xl font-bold text-green-400">
                                    ${token.marketCap.toLocaleString()}
                                </p>
                            </div>
                            
                            <div className="w-full sm:w-auto sm:ml-6 flex justify-end">
                                <button
                                    className="px-4 py-2 bg-crapto-poop-yellow text-crapto-dark-brown font-bold rounded-full hover:bg-white transition duration-200"
                                >
                                    Buy Now
                                </button>
                            </div>

                            {/* Creator ID indicator (Only visible if you launched it this session) */}
                            {token.creatorId === userId && (
                                <span className="absolute top-1 right-2 text-xs text-crapto-poop-yellow/70">
                                    (Yours)
                                </span>
                            )}
                        </div>
                    ))
                )}
            </div>
        </section>
    );
};

// --- 3. MAIN APP COMPONENT (Manages local state) ---

// We rename the component to 'Home' which is often expected in Next.js's pages/index.jsx
const Home = () => {
    const [tokenList, setTokenList] = useState(initialMockTokens);

    const handleLaunchToken = useCallback((newToken) => {
        // Adds the new token to the front of the list
        setTokenList(prevList => [newToken, ...prevList]);
    }, []);

    return (
        <div className="min-h-screen flex flex-col bg-crapto-dark-brown text-white font-sans">
            <header className="p-4 flex flex-wrap justify-between items-center border-b-4 border-crapto-brown bg-crapto-brown/70 backdrop-blur-sm sticky top-0 z-10 shadow-xl">
                <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-crapto-poop-yellow rounded-full flex items-center justify-center text-4xl shadow-lg animate-bounce">💩</div> 
                    <h1 className="text-3xl sm:text-4xl font-extrabold text-crapto-light-brown tracking-tighter">
                        Crapto.<span className="text-red-500">fun</span>
                    </h1>
                </div>
                <div className='mt-3 sm:mt-0'>
                    <WalletMultiButton />
                </div>
            </header>

            <main className="flex-grow p-4 sm:p-8">
                {/* Intro Section */}
                <section className="text-center mb-16 max-w-4xl mx-auto">
                    <h1 className="text-5xl sm:text-7xl font-black mb-4 text-crapto-poop-yellow tracking-tight">
                        The Solana Sh*tcoin Factory
                    </h1>
                    <p className="text-xl text-crapto-light-brown/90">
                        Launch your SPL token instantly, get immediate liquidity, and track the stinkiest coins in real-time.
                    </p>
                </section>

                <LaunchForm onLaunchToken={handleLaunchToken} />
                <TokenList tokenList={tokenList} />
            </main>

            <footer className="p-4 text-center bg-crapto-brown border-t-4 border-crapto-light-brown shadow-inner">
                <p className='text-sm sm:text-base'>&copy; 2025 Crapto.fun. Local Session Mode.</p>
            </footer>
        </div>
    );
};

// --- 4. TOP LEVEL EXPORT & TAILWIND CONFIG ---

// We need to use <style> tags here because we cannot rely on a global CSS file or build process
const GlobalStylesAndConfig = () => (
    <React.Fragment>
        {/* Step 1: Include Tailwind CSS CDN */}
        <script src="https://cdn.tailwindcss.com"></script>

        {/* Step 2: Define Custom Tailwind Colors and Configuration */}
        <script dangerouslySetInnerHTML={{ __html: `
            tailwind.config = {
                theme: {
                    extend: {
                        colors: {
                            'crapto-dark-brown': '#4F2C0B', // Base Background
                            'crapto-brown': '#8B4513',       // Card/Footer Background
                            'crapto-light-brown': '#DAA06D', // Secondary Text/Borders
                            'crapto-poop-yellow': '#F4D03F', // Accent/Primary CTA
                        },
                        animation: {
                            'bounce': 'bounce 1s infinite',
                        }
                    },
                },
            }
        `}} />
        
        {/* Step 3: Set Global Font (Inter) for better styling */}
        <style dangerouslySetInnerHTML={{ __html: `
            body { 
                font-family: 'Inter', sans-serif; 
            }
        `}} />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@100..900&display=swap" rel="stylesheet" />
    </React.Fragment>
);


// Export a wrapper component that includes the necessary scripts and Context provider
export default function AppWrapper() {
    return (
        <React.Fragment>
            <GlobalStylesAndConfig />
            <MockWalletProvider>
                <Home />
            </MockWalletProvider>
        </React.Fragment>
    );
}
