import '@/styles/global.css'; // Keep existing global styles import
import type { AppProps } from 'next/app';
import Head from 'next/head'; // Import Head for managing <head> elements
import { SessionProvider } from 'next-auth/react'; // Import SessionProvider
import MainLayout from '@/components/layouts/MainLayout'; // Import the MainLayout

export default function App({ Component, pageProps: { session, ...pageProps } }: AppProps) {
  // Pages like login might not need the MainLayout.
  // We can add logic here later to conditionally apply the layout.
  // For now, apply it to all pages.

  // Check if the component has a specific layout defined
  // const getLayout = Component.getLayout || ((page) => <MainLayout>{page}</MainLayout>)
  // For MVP, we'll wrap everything in MainLayout

  return (
    <SessionProvider session={session}>
      <>
        <Head>
          {/* Font links moved to _document.tsx */}
          <title>Mountain Care HR</title> {/* Default title */}
        </Head>
      <MainLayout>
        <Component {...pageProps} />
      </MainLayout>
    </>
  </SessionProvider>
  );
}

// Example for per-page layouts (can be implemented later if needed)
// App.getLayout = function getLayout(page: React.ReactElement) {
//   return (
//     <MainLayout>
//       {page}
//     </MainLayout>
//   )
// }