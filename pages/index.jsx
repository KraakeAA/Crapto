import React, { useState, useContext, useCallback, useMemo, useEffect } from 'react';

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

// --- HELPER COMPONENTS ---

const ToastNotification = ({ toast, onClose }) => {
    if (!toast) return null;

    const baseClasses = "fixed bottom-5 right-5 p-4 rounded-lg shadow-xl text-white font-semibold transform transition-transform duration-300 z-50";
    let typeClasses = '';

    switch (toast.type) {
        case 'success':
            typeClasses = 'bg-green-600';
            break;
        case 'error':
            typeClasses = 'bg-red-600';
            break;
        case 'info':
        default:
            typeClasses = 'bg-crapto-poop-yellow text-crapto-dark-brown';
            break;
    }

    return (
        <div className={`${baseClasses} ${typeClasses}`}>
            {toast.message}
            <button onClick={onClose} className="ml-3 text-sm font-bold opacity-80 hover:opacity-100">
                &times;
            </button>
        </div>
    );
};

const TransactionHistory = ({ transactions }) => {
    const formatTime = (timestamp) => {
        return new Date(timestamp).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    };

    return (
        <section className="mt-12 max-w-4xl mx-auto">
            <h2 className="text-3xl font-extrabold mb-4 text-crapto-light-brown">Transaction Log</h2>
            <div className="h-64 overflow-y-scroll p-4 bg-crapto-brown rounded-xl border-4 border-crapto-light-brown/50 shadow-inner space-y-2">
                {transactions.length === 0 ? (
                    <p className="text-crapto-light-brown/70 text-center pt-8">No trades recorded yet. Get in the market!</p>
                ) : (
                    transactions.slice().reverse().map((tx, index) => {
                        const isBuy = tx.type === 'BUY';
                        const color = isBuy ? 'text-green-400' : 'text-red-400';

                        return (
                            <div key={index} className="flex justify-between text-sm font-mono p-2 bg-crapto-dark-brown/50 rounded-lg">
                                <span className="text-crapto-light-brown/80">{formatTime(tx.timestamp)}</span>
                                <span className={color}>
                                    {tx.type} {tx.amount.toLocaleString()} {tx.ticker} 
                                </span>
                                <span className="text-white">
                                    for {tx.solCost.toFixed(4)} SOL
                                </span>
                            </div>
                        );
                    })
                )}
            </div>
        </section>
    );
};


// --- MOCK CONTEXT & WALLET COMPONENTS ---
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

// --- TOKEN DETAIL MODAL COMPONENT ---

const TokenModal = ({ modalState, onClose, onTrade, portfolio }) => {
    const { token, type } = modalState;
    const { solBalance, holdings } = portfolio;
    
    const isBuy = type === 'BUY';

    const [inputAmount, setInputAmount] = useState(0);
    const [calculatedAmount, setCalculatedAmount] = useState(0);
    const [message, setMessage] = useState('');
    const [isExecuting, setIsExecuting] = useState(false);

    const tokenHolding = holdings[token?.ticker] || { amount: 0 };
    const maxInput = isBuy ? solBalance : (tokenHolding.amount / 100000000); // Max SOL to spend or max Tokens to sell (in SOL equivalent for UX)

    // Reset state when modal opens/changes token
    useEffect(() => {
        if (token) {
            setInputAmount(0.01); // Default to small amount
            setMessage('');
            setCalculatedAmount(0);
        }
    }, [token, type]);

    // Recalculate token/SOL amount whenever input or token price changes
    useEffect(() => {
        if (!token || inputAmount <= 0) {
            setCalculatedAmount(0);
            return;
        }

        const priceInDecimals = token.price / 100000000;

        if (isBuy) {
            // Input is SOL amount, calculate Token amount (in whole units)
            const tokensReceived = Math.floor(inputAmount / priceInDecimals);
            setCalculatedAmount(tokensReceived);

            if (inputAmount > solBalance) {
                setMessage('🚨 Insufficient SOL balance.');
            } else {
                setMessage('');
            }

        } else {
            // Input is Token amount (in whole units), calculate SOL received
            const solReceived = inputAmount * priceInDecimals;
            setCalculatedAmount(solReceived);

            if (inputAmount > tokenHolding.amount) {
                setMessage(`🚨 Insufficient ${token.ticker} balance.`);
            } else {
                setMessage('');
            }
        }
    }, [inputAmount, token, isBuy, solBalance, tokenHolding.amount]);


    const handleExecuteTrade = () => {
        if (inputAmount <= 0 || message) return;

        let solToSpend = 0;
        let tokenAmount = 0;

        if (isBuy) {
            // Buy: Input is SOL amount (inputAmount), calculated is Token amount (calculatedAmount)
            solToSpend = inputAmount;
            tokenAmount = calculatedAmount;
            if (solToSpend > solBalance) {
                 setMessage('🚨 Trade failed: Not enough SOL.');
                 return;
            }
        } else {
            // Sell: Input is Token amount (inputAmount), calculated is SOL amount (calculatedAmount)
            solToSpend = -calculatedAmount; // Negative cost means receiving SOL
            tokenAmount = -inputAmount; // Negative token amount means selling tokens
            if (inputAmount > tokenHolding.amount) {
                setMessage('🚨 Trade failed: Not enough tokens.');
                return;
            }
        }

        setIsExecuting(true);
        setMessage(`Executing ${isBuy ? 'Buy' : 'Sell'} trade...`);

        setTimeout(() => {
            onTrade(token, isBuy ? 'BUY' : 'SELL', tokenAmount, solToSpend);
            onClose();
        }, 1000);
    };
    
    if (!token) return null;

    const actionText = isBuy ? 'BUY' : 'SELL';
    const inputLabel = isBuy ? 'SOL to Spend' : `${token.ticker} to Sell`;
    const outputLabel = isBuy ? `${token.ticker} to Receive` : 'SOL to Receive';
    const buttonDisabled = inputAmount <= 0 || !!message || isExecuting;

    return (
        <div className="fixed inset-0 bg-crapto-dark-brown/90 backdrop-blur-sm flex items-center justify-center p-4 z-40">
            <div className="bg-crapto-brown p-8 rounded-2xl w-full max-w-lg shadow-[0_15px_40px_rgba(0,0,0,0.8)] border-4 border-crapto-poop-yellow">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-3xl font-extrabold text-white">{actionText} <span className="text-crapto-poop-yellow">{token.ticker}</span></h3>
                    <button onClick={onClose} className="text-3xl text-crapto-light-brown hover:text-white transition">&times;</button>
                </div>

                {/* Mock Chart Area */}
                <div className="h-24 bg-crapto-dark-brown p-3 mb-6 rounded-lg border border-crapto-light-brown/30 relative">
                    <p className="text-sm font-mono text-crapto-light-brown/70">Price Chart (Mock)</p>
                    {/* Simplified rising/falling line chart */}
                    <svg viewBox="0 0 100 20" className="w-full h-12">
                        <polyline fill="none" stroke={isBuy ? "#4ade80" : "#f87171"} strokeWidth="1" 
                                points="0,15 25,5 50,15 75,5 100,10" />
                    </svg>
                    <p className="text-white text-lg font-bold absolute bottom-3 right-3">{token.price.toFixed(8)} SOL</p>
                </div>
                
                {/* Inputs */}
                <div className="mb-4">
                    <label className="block text-sm font-semibold mb-2 text-crapto-light-brown">{inputLabel}</label>
                    <input
                        type="number"
                        step={isBuy ? "0.01" : "1"}
                        min="0"
                        max={maxInput}
                        value={inputAmount}
                        onChange={(e) => setInputAmount(parseFloat(e.target.value) || 0)}
                        className="w-full p-4 text-xl font-mono bg-white/10 text-white rounded-xl border border-crapto-light-brown focus:outline-none focus:ring-4 focus:ring-crapto-poop-yellow"
                        disabled={isExecuting}
                    />
                </div>

                {/* Output */}
                <div className="mb-6">
                    <label className="block text-sm font-semibold mb-2 text-crapto-light-brown">{outputLabel}</label>
                    <div className="w-full p-4 text-xl font-mono bg-crapto-dark-brown/50 text-crapto-poop-yellow rounded-xl border border-crapto-light-brown/70">
                        {calculatedAmount.toLocaleString(undefined, { maximumFractionDigits: 8 })}
                    </div>
                </div>

                {message && (
                    <div className="mb-4 p-3 font-semibold rounded-lg text-center bg-red-900/50 border border-red-400 text-red-300">
                        {message}
                    </div>
                )}

                <button
                    onClick={handleExecuteTrade}
                    disabled={buttonDisabled}
                    className={`w-full p-4 font-extrabold text-xl rounded-xl shadow-lg transition duration-300 
                        ${!buttonDisabled 
                            ? (isBuy ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700') + ' text-white'
                            : 'bg-gray-500 text-gray-300 cursor-not-allowed'}
                    `}
                >
                    {isExecuting ? (
                        <span className="flex items-center justify-center">
                            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Confirming...
                        </span>
                    ) : (
                        `${actionText} ${token.ticker}`
                    )}
                </button>
            </div>
        </div>
    );
};


// --- CORE APPLICATION COMPONENTS ---

const Portfolio = ({ portfolio, tokens }) => {
    const { connected } = useMockWallet();
    const holdings = Object.values(portfolio.holdings).filter(h => h.amount > 0);

    if (!connected) return null;

    const totalTokenValue = holdings.reduce((sum, holding) => {
        const token = tokens.find(t => t.ticker === holding.ticker);
        if (token) {
            // Calculate value based on current mock price
            return sum + (holding.amount / 100000000 * token.price);
        }
        return sum;
    }, 0);
    
    const totalAssetValue = totalTokenValue + portfolio.solBalance;

    const formatValue = (value) => value.toLocaleString('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2 });
    
    return (
        <section className="max-w-4xl mx-auto mt-12 mb-16 p-6 bg-crapto-brown/70 rounded-2xl shadow-xl border-4 border-crapto-light-brown/50">
            <h2 className="text-3xl font-extrabold mb-4 text-crapto-poop-yellow">Your Crapto Portfolio</h2>
            
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-center mb-6 border-b border-crapto-light-brown/30 pb-4">
                <div className="p-3 bg-crapto-dark-brown rounded-lg shadow-inner">
                    <p className="text-sm text-crapto-light-brown/80">Total Assets</p>
                    <p className="text-xl font-bold text-green-400">{totalAssetValue.toFixed(4)} SOL</p>
                </div>
                <div className="p-3 bg-crapto-dark-brown rounded-lg shadow-inner col-span-2 md:col-span-1">
                    <p className="text-sm text-crapto-light-brown/80">SOL Balance</p>
                    <p className="text-xl font-bold text-white">{portfolio.solBalance.toFixed(4)} SOL</p>
                </div>
                <div className="p-3 bg-crapto-dark-brown rounded-lg shadow-inner col-span-2 md:col-span-1">
                    <p className="text-sm text-crapto-light-brown/80">Token Holdings Value</p>
                    <p className="text-xl font-bold text-white">{totalTokenValue.toFixed(4)} SOL</p>
                </div>
            </div>

            {holdings.length === 0 ? (
                <p className="text-center text-crapto-light-brown/70">No active token holdings yet. Start buying!</p>
            ) : (
                <div className="space-y-3">
                    {holdings.map(h => {
                        const token = tokens.find(t => t.ticker === h.ticker);
                        const currentPrice = token?.price || 0;
                        const solValue = (h.amount / 100000000 * currentPrice);
                        const pnl = solValue > h.cost ? 'text-green-400' : 'text-red-400';
                        
                        return (
                            <div key={h.ticker} className="flex justify-between items-center p-3 bg-crapto-dark-brown/50 rounded-lg">
                                <div>
                                    <p className="text-xl font-bold text-crapto-poop-yellow">{h.ticker}</p>
                                    <p className="text-xs text-crapto-light-brown/80">{h.amount.toLocaleString()} Tokens</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-md font-semibold text-white">{solValue.toFixed(4)} SOL</p>
                                    <p className={`text-xs ${pnl}`}>Cost: {h.cost.toFixed(4)} SOL</p>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </section>
    );
};


const LaunchForm = ({ onLaunchToken, showToast }) => {
    const { connected, userId } = useMockWallet();
    const [tokenName, setTokenName] = useState('');
    const [ticker, setTicker] = useState('');
    const [isLaunching, setIsLaunching] = useState(false);

    const handleCreateToken = useCallback(() => {
        if (!connected) {
            showToast('Connect your wallet first!', 'error');
            return;
        }
        if (!tokenName || !ticker) {
            showToast('Token Name and Ticker are required!', 'error');
            return;
        }

        setIsLaunching(true);

        setTimeout(() => {
            const initialPrice = 0.00000001;
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

            showToast(`${newToken.ticker} successfully launched at ${initialPrice.toFixed(8)} SOL!`, 'success');
            setTokenName('');
            setTicker('');
            setIsLaunching(false);
        }, 1500); 
    }, [tokenName, ticker, connected, userId, onLaunchToken, showToast]);

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
                placeholder="Ticker (e.g., POOP, max 5 chars)"
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
                        Deploying SPL Program...
                    </span>
                ) : (
                    'Launch Coin & Start Liquidity! 💩'
                )}
            </button>
        </div>
    );
};

const TokenList = ({ tokenList, onOpenModal }) => {
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
                                        onClick={() => onOpenModal(token, 'BUY')}
                                        disabled={!connected}
                                        className="px-4 py-2 bg-green-600 text-white font-bold rounded-full hover:bg-green-700 transition duration-200 disabled:bg-gray-500 disabled:cursor-not-allowed"
                                    >
                                        Buy
                                    </button>
                                    <button
                                        onClick={() => onOpenModal(token, 'SELL')}
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

// --- 4. MAIN APP COMPONENT (Manages all state) ---

const Home = () => {
    const { connected } = useMockWallet();
    const [tokenList, setTokenList] = useState(initialMockTokens);
    const [portfolio, setPortfolio] = useState(initialPortfolio);
    const [transactions, setTransactions] = useState([]);
    const [toast, setToast] = useState(null);
    const [modalState, setModalState] = useState({ isOpen: false, token: null, type: null }); // type: 'BUY' | 'SELL'

    // Toast Handler
    const showToast = useCallback((message, type = 'info') => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 4000);
    }, []);

    // Token Launch Handler (from LaunchForm)
    const handleLaunchToken = useCallback((newToken) => {
        setTokenList(prevList => [newToken, ...prevList]);
    }, []);
    
    // Modal Open/Close Handlers
    const onOpenModal = useCallback((token, type) => {
        if (!connected) {
            showToast('Please connect your wallet to trade.', 'error');
            return;
        }
        setModalState({ isOpen: true, token, type });
    }, [connected, showToast]);

    const onCloseModal = useCallback(() => {
        setModalState({ isOpen: false, token: null, type: null });
    }, []);


    // Complex Trade Handler (from TokenModal)
    const handleComplexTrade = useCallback((token, type, tokenAmount, solChange) => {
        
        // 1. Update Token Market Metrics (Price, Cap, 24h Change)
        setTokenList(prevList => prevList.map(t => {
            if (t.id === token.id) {
                // Determine fluctuation based on trade size (solChange magnitude)
                const priceFactor = 1 + (solChange > 0 ? 0.005 : -0.005) * Math.abs(solChange);
                return {
                    ...t,
                    marketCap: Math.round(t.marketCap + (solChange * 100)), // Mock market cap proportional to SOL volume
                    price: t.price * priceFactor,
                    change24h: Math.min(Math.max(t.change24h + (solChange > 0 ? 0.8 : -0.8), -50), 200) 
                };
            }
            return t;
        }));


        // 2. Update Portfolio
        const solCost = -solChange; // Cost in SOL (positive for buy, negative for sell)
        
        setPortfolio(prevPortfolio => {
            const currentHolding = prevPortfolio.holdings[token.ticker] || { amount: 0, cost: 0, ticker: token.ticker };
            const newPortfolio = { ...prevPortfolio };

            newPortfolio.solBalance -= solChange; // If buying, solChange > 0, so subtract. If selling, solChange < 0, so add.
            currentHolding.amount += tokenAmount;

            if (type === 'BUY') {
                // Calculate new average cost
                const newTotalCost = (currentHolding.cost * (currentHolding.amount - tokenAmount) + solCost);
                currentHolding.cost = newTotalCost / currentHolding.amount;
            }
            
            if (currentHolding.amount > 0) {
                 newPortfolio.holdings[token.ticker] = currentHolding;
            } else {
                delete newPortfolio.holdings[token.ticker];
            }

            return newPortfolio;
        });

        // 3. Add to Transaction History
        const transaction = {
            type,
            ticker: token.ticker,
            amount: Math.abs(tokenAmount),
            solCost: Math.abs(solChange),
            timestamp: Date.now(),
        };
        setTransactions(prev => [...prev, transaction]);
        
        // 4. Show Notification
        showToast(`Successfully executed ${type} of ${Math.abs(tokenAmount).toLocaleString()} ${token.ticker}!`, 'success');

    }, [showToast]);


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
                
                <LaunchForm onLaunchToken={handleLaunchToken} showToast={showToast} />
                <Portfolio portfolio={portfolio} tokens={tokenList} />
                <TokenList 
                    tokenList={tokenList} 
                    onOpenModal={onOpenModal}
                />
                <TransactionHistory transactions={transactions} />
            </main>

            <footer className="p-4 text-center bg-crapto-brown border-t-4 border-crapto-light-brown shadow-inner">
                <p className='text-sm sm:text-base'>&copy; 2025 Crapto.fun. Local Session Mode. Connect wallet and click Buy/Sell to open the trading modal.</p>
            </footer>

            {/* Modals and Toasts */}
            {modalState.isOpen && (
                <TokenModal 
                    modalState={modalState} 
                    onClose={onCloseModal} 
                    onTrade={handleComplexTrade} 
                    portfolio={portfolio}
                />
            )}
            <ToastNotification toast={toast} onClose={() => setToast(null)} />
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
                            'spin-slow': 'spin 3s linear infinite', 
                        }
                    },
                },
            }
        `}} />
        
        {/* Step 3: Set Global Font (Inter) for better styling */}
        <style dangerouslySetInnerHTML={{ __html: `
            body { 
                font-family: 'Inter', sans-serif; 
                background-color: #4F2C0B;
            }
            /* Custom scrollbar for transaction history */
            ::-webkit-scrollbar {
                width: 8px;
            }
            ::-webkit-scrollbar-track {
                background: #8B4513; 
                border-radius: 10px;
            }
            ::-webkit-scrollbar-thumb {
                background: #F4D03F; 
                border-radius: 10px;
            }
            ::-webkit-scrollbar-thumb:hover {
                background: #DAA06D; 
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
