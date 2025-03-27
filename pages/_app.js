// pages/_app.js
import { SessionProvider } from 'next-auth/react';
import { AuthProvider } from '../components/auth/AuthProvider';
import '../styles/globals.css';

function MyApp({ Component, pageProps }) {
  return (
    <SessionProvider session={pageProps.session}>
      <AuthProvider>
        <Component {...pageProps} />
      </AuthProvider>
    </SessionProvider>
  );
}

export default MyApp;