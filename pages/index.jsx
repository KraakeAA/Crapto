import React, { useState, useContext, useCallback, useMemo } from 'react';

// --- CONFIGURATION AND INITIAL STATE ---

// Mock data to populate the market on initial load
const initialMockTokens = [
    { id: '1', name: 'Original Poop', ticker: 'OPOOP', marketCap: 15000, price: 0.00000008, change24h: 12.5, createdAt: Date.now() - 100000, creatorId: 'mock-user-1' },
    { id: '2', name: 'Damp Dirt', ticker: 'DDIRT', marketCap: 8200, price: 0.00000003, change24h: -5.1, createdAt: Date.now() - 50000, creatorId: 'mock-user-2' },
    { id: '3', name: 'Slimy Sludge', ticker: 'SLUDG', marketCap: 35000, price: 0.00000015, change24h: 22.9, createdAt: Date.now() - 10000, creatorId: 'mock-user-3' },
];

const initialPortfolio = {
    solBalance: 5.0, // Mock Solana balance
    holdings: {},    // { TICKER: { amount: 10000000, cost: 0.5 } }
};

// --- 1. MOCK SOLANA WALLET CONTEXT ---
const MockWalletContext = React.createContext(null);

const MockWalletProvider = ({ children }) => {
    const [publicKey, setPublicKey] = useState(null);
    const [userId] = useState(crypto.randomUUID());
    const connected = !!publicKey;

    const connect = () => {
        const mockKey = `Crapto${Math.random().toString(36).substring(2, 10)}...`;
        setPublicKey(mockKey);
    };

    const disconnect = () => {
        setPublicKey(null);
        // NOTE: We do not clear the portfolio on disconnect in this simplified mock
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

// --- 2. PORTFOLIO COMPONENT ---

const Portfolio = ({ portfolio, tokens }) => {
    const { connected } = useMockWallet();
    const holdings = Object.values(portfolio.holdings);

    if (!connected) return null;

    const totalValue = holdings.reduce((sum, holding) => {
        const token = tokens.find(t => t.ticker === holding.ticker);
        if (token) {
            // Calculate value based on current mock price
            return sum + (holding.amount * token.price) / 100000000;
        }
        return sum;
    }, 0);

    const formatPrice = (price) => price ? price.toFixed(8) : 'N/A';
    const formatValue = (value) => value.toLocaleString('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2 });
    
    return (
        <section className="max-w-4xl mx-auto mt-12 mb-16 p-6 bg-crapto-brown/70 rounded-2xl shadow-xl border-4 border-crapto-light-brown/50">
            <h2 className="text-3xl font-extrabold mb-4 text-crapto-poop-yellow">Your Crapto Portfolio</h2>
            
            <div className="grid grid-cols-2 gap-4 text-center mb-6 border-b border-crapto-light-brown/30 pb-4">
                <div className="p-3 bg-crapto-dark-brown rounded-lg shadow-inner">
                    <p className="text-sm text-crapto-light-brown/80">SOL Balance</p>
                    <p className="text-2xl font-bold text-white">{portfolio.solBalance.toFixed(4)} SOL</p>
                </div>
                <div className="p-3 bg-crapto-dark-brown rounded-lg shadow-inner">
                    <p className="text-sm text-crapto-light-brown/80">Total Token Value</p>
                    <p className="text-2xl font-bold text-green-400">{formatValue(totalValue)}</p>
                </div>
            </div>

            {holdings.length === 0 ? (
                <p className="text-center text-crapto-light-brown/70">No holdings yet. Buy a coin to start!</p>
            ) : (
                <div className="space-y-3">
                    {holdings.map(h => {
                        const token = tokens.find(t => t.ticker === h.ticker);
                        const currentPrice = token?.price || 0;
                        const usdValue = (h.amount * currentPrice) / 100000000;
                        
                        return (
                            <div key={h.ticker} className="flex justify-between items-center p-3 bg-crapto-dark-brown/50 rounded-lg">
                                <div>
                                    <p className="text-xl font-bold text-crapto-poop-yellow">{h.ticker}</p>
                                    <p className="text-xs text-crapto-light-brown/80">{h.amount.toLocaleString()} Tokens</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-md font-semibold text-white">{formatValue(usdValue)}</p>
                                    <p className="text-xs text-crapto-light-brown/80">@{formatPrice(currentPrice)} SOL</p>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </section>
    );
};


// --- 3. LAUNCH FORM & TOKEN LIST COMPONENTS ---

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

        setTimeout(() => {
            const initialPrice = 0.00000001; // $1e-8
            const newToken = {
                id: crypto.randomUUID(),
                name: tokenName.trim(),
                ticker: ticker.trim().toUpperCase(),
                marketCap: 1000, 
                price: initialPrice,
                change24h: 0,
                createdAt: Date.now(),
                creatorId: userId,
            };

            onLaunchToken(newToken); 

            setMessage(`✅ ${newToken.ticker} successfully launched at ${initialPrice} SOL!`);
            setTokenName('');
            setTicker('');
            setIsLaunching(false);
            setTimeout(() => setMessage(''), 5000); 
        }, 1500); 
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

const TokenList = ({ tokenList, handleBuy, handleSell }) => {
    const { userId, connected } = useMockWallet();

    const sortedTokenList = useMemo(() => {
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
                    sortedTokenList.map((token) => {
                        const isPositive = token.change24h >= 0;
                        const changeColor = isPositive ? 'text-green-400' : 'text-red-400';
                        const formatPrice = (price) => price.toFixed(8);

                        return (
                            <div 
                                key={token.id} 
                                className="bg-crapto-brown p-5 rounded-xl shadow-lg flex flex-wrap gap-4 items-center justify-between transition duration-300 hover:bg-crapto-brown/80 border-l-8 border-crapto-poop-yellow relative"
                            >
                                <div className="w-full sm:w-auto flex-1 min-w-[150px]">
                                    <p className="text-xs text-crapto-light-brown/80">TICKER / NAME</p>
                                    <h3 className="text-2xl font-extrabold text-crapto-poop-yellow">
                                        {token.ticker}
                                        <span className="text-base text-white/70 ml-2">({token.name})</span>
                                    </h3>
                                </div>
                                
                                <div className="flex-1 min-w-[100px] text-center">
                                    <p className="text-xs text-crapto-light-brown/80">PRICE (SOL)</p>
                                    <p className="text-xl font-mono font-bold text-white">{formatPrice(token.price)}</p>
                                </div>

                                <div className="flex-1 min-w-[100px] text-center">
                                    <p className="text-xs text-crapto-light-brown/80">24H CHANGE</p>
                                    <p className={`text-xl font-mono font-bold ${changeColor}`}>
                                        {token.change24h.toFixed(1)}%
                                    </p>
                                </div>

                                <div className="flex-1 min-w-[100px] text-right">
                                    <p className="text-xs text-crapto-light-brown/80">MARKET CAP</p>
                                    <p className="text-xl font-bold text-white">
                                        ${(token.marketCap).toLocaleString()}
                                    </p>
                                </div>
                                
                                <div className="w-full sm:w-auto sm:ml-6 flex space-x-2 justify-end">
                                    <button
                                        onClick={() => handleBuy(token)}
                                        disabled={!connected}
                                        className="px-4 py-2 bg-green-600 text-white font-bold rounded-full hover:bg-green-700 transition duration-200 disabled:bg-gray-500 disabled:cursor-not-allowed"
                                    >
                                        Buy
                                    </button>
                                    <button
                                        onClick={() => handleSell(token)}
                                        disabled={!connected}
                                        className="px-4 py-2 bg-red-600 text-white font-bold rounded-full hover:bg-red-700 transition duration-200 disabled:bg-gray-500 disabled:cursor-not-allowed"
                                    >
                                        Sell
                                    </button>
                                </div>

                                {/* Creator ID indicator */}
                                {token.creatorId === userId && (
                                    <span className="absolute top-1 right-2 text-xs text-crapto-poop-yellow/70">
                                        (Yours)
                                    </span>
                                )}
                            </div>
                        );
                    })
                )}
            </div>
        </section>
    );
};

// --- 4. MAIN APP COMPONENT (Manages local state) ---

const Home = () => {
    const { connected } = useMockWallet();
    const [tokenList, setTokenList] = useState(initialMockTokens);
    const [portfolio, setPortfolio] = useState(initialPortfolio);

    const handleLaunchToken = useCallback((newToken) => {
        setTokenList(prevList => [newToken, ...prevList]);
    }, []);

    const handleTrade = useCallback((token, type) => {
        if (!connected) return;

        const { ticker, price } = token;
        const tradeAmount = 10000000; // Mock trade amount in tokens
        const solCost = price * (tradeAmount / 100000000); // Cost/Receive in SOL

        setTokenList(prevList => prevList.map(t => {
            if (t.id === token.id) {
                // Simulate price fluctuation and market cap change
                const factor = type === 'BUY' ? 1.001 : 0.999;
                return {
                    ...t,
                    marketCap: Math.round(t.marketCap + (type === 'BUY' ? 100 : -100)),
                    price: t.price * factor,
                    change24h: Math.min(Math.max(t.change24h + (type === 'BUY' ? 0.5 : -0.5), -50), 200) // Keep change bounded
                };
            }
            return t;
        }));

        setPortfolio(prevPortfolio => {
            const currentHolding = prevPortfolio.holdings[ticker] || { amount: 0, cost: 0, ticker };
            const newPortfolio = { ...prevPortfolio };

            if (type === 'BUY' && newPortfolio.solBalance >= solCost) {
                newPortfolio.solBalance -= solCost;
                currentHolding.amount += tradeAmount;
                // Simple average cost calculation
                currentHolding.cost = (currentHolding.cost * (currentHolding.amount - tradeAmount) + solCost * 1) / currentHolding.amount;
                
            } else if (type === 'SELL' && currentHolding.amount >= tradeAmount) {
                newPortfolio.solBalance += solCost; // Receive SOL
                currentHolding.amount -= tradeAmount;
            } else {
                // Not enough SOL or Tokens
                return prevPortfolio;
            }
            
            if (currentHolding.amount > 0) {
                 newPortfolio.holdings[ticker] = currentHolding;
            } else {
                delete newPortfolio.holdings[ticker];
            }

            return newPortfolio;
        });

    }, [connected]);

    const handleBuy = useCallback((token) => handleTrade(token, 'BUY'), [handleTrade]);
    const handleSell = useCallback((token) => handleTrade(token, 'SELL'), [handleTrade]);

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
                <Portfolio portfolio={portfolio} tokens={tokenList} />
                <TokenList 
                    tokenList={tokenList} 
                    handleBuy={handleBuy} 
                    handleSell={handleSell} 
                />
            </main>

            <footer className="p-4 text-center bg-crapto-brown border-t-4 border-crapto-light-brown shadow-inner">
                <p className='text-sm sm:text-base'>&copy; 2025 Crapto.fun. Local Session Mode. Click Buy/Sell to see prices and portfolio update.</p>
            </footer>
        </div>
    );
};

// --- 5. TOP LEVEL EXPORT & STYLING CONFIG ---

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
                            'crapto-dark-brown': '#4F2C0B', 
                            'crapto-brown': '#8B4513',       
                            'crapto-light-brown': '#DAA06D', 
                            'crapto-poop-yellow': '#F4D03F', 
                        },
                        animation: {
                            'bounce': 'bounce 1s infinite',
                            'spin-slow': 'spin 3s linear infinite', // Add spin-slow
                        }
                    },
                },
            }
        `}} />
        
        {/* Step 3: Set Global Font (Inter) for better styling */}
        <style dangerouslySetInnerHTML={{ __html: `
            /* Use a darker background color for the body if needed */
            body { 
                font-family: 'Inter', sans-serif; 
                background-color: #4F2C0B; /* Ensures background is correct if root element doesn't cover all */
            }
        `}} />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@100..900&display=swap" rel="stylesheet" />
    </React.Fragment>
);


// Export the wrapper component
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
```eof
