import '@/styles/globals.css'; // Adjust path if src directory is not used
import type { AppProps } from 'next/app';

export default function App({ Component, pageProps }: AppProps) {
  return <Component {...pageProps} />;
}