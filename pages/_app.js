import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import { WalletProvider } from '@solana/wallet-adapter-react';
import { PhantomWalletAdapter } from '@solana/wallet-adapter-wallets';
import { ConnectionProvider } from '@solana/wallet-adapter-react';
import { clusterApiUrl } from '@solana/web3.js';
import '../styles/globals.css';

export default function App({ Component, pageProps }) {
  const network = WalletAdapterNetwork.Devnet;
  const endpoint = clusterApiUrl(network);
  const wallets = [new PhantomWalletAdapter()];
  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={walts} autoConnect>
        <Component {...pageProps} />
      </WalletProvider>
    </ConnectionProvider>
  );
}
