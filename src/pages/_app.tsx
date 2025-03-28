import '@/styles/global.css'; // Keep existing global styles import
import type { AppProps } from 'next/app';
import type { ReactElement, ReactNode } from 'react'; // Import React types
import type { NextPage } from 'next'; // Import NextPage type
import Head from 'next/head'; // Import Head for managing <head> elements
import { SessionProvider } from 'next-auth/react'; // Import SessionProvider
import MainLayout from '@/components/layouts/MainLayout'; // Import the MainLayout

// Define a type for pages that might have a custom layout
export type NextPageWithLayout<P = {}, IP = P> = NextPage<P, IP> & {
  getLayout?: (page: ReactElement) => ReactNode;
};

type AppPropsWithLayout = AppProps & {
  Component: NextPageWithLayout;
};

export default function App({ Component, pageProps: { session, ...pageProps } }: AppPropsWithLayout) { // Use updated AppProps type
  // Pages like login might not need the MainLayout.
  // We can add logic here later to conditionally apply the layout.
  // For now, apply it to all pages.

  // Check if the component has a specific layout defined
  // Use the layout defined at the page level, if available. Otherwise, default to MainLayout.
  const getLayout = Component.getLayout ?? ((page) => <MainLayout>{page}</MainLayout>);

  return (
    <SessionProvider session={session}>
      {/* Head can be here or within the layout */}
      <Head>
        <title>Mountain Care HR</title> {/* Default title */}
      </Head>
      {/* Apply the determined layout */}
      {getLayout(<Component {...pageProps} />)}
    </SessionProvider>
  );
}

// Remove old example comment block