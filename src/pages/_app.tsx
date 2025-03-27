import '@/styles/global.css'; // Keep existing global styles import
import type { AppProps } from 'next/app';
import Head from 'next/head'; // Import Head for managing <head> elements
import MainLayout from '@/components/layouts/MainLayout'; // Import the MainLayout

export default function App({ Component, pageProps }: AppProps) {
  // Pages like login might not need the MainLayout.
  // We can add logic here later to conditionally apply the layout.
  // For now, apply it to all pages.

  // Check if the component has a specific layout defined
  // const getLayout = Component.getLayout || ((page) => <MainLayout>{page}</MainLayout>)
  // For MVP, we'll wrap everything in MainLayout

  return (
    <>
      <Head>
        {/* Add Google Fonts */}
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Nunito:wght@400;600;700&display=swap"
          rel="stylesheet"
        />
        {/* Add Font Awesome */}
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css"
          integrity="sha512-iecdLmaskl7CVkqkXNQ/ZH/XLlvWZOJyj7Yy7tcenmpD1ypASozpmT/E0iPtmFIB46ZmdtAc9eNBvH0H/ZpiBw==" // Added integrity hash for security
          crossOrigin="anonymous"
          referrerPolicy="no-referrer"
        />
         <title>Mountain Care HR</title> {/* Default title */}
      </Head>
      <MainLayout>
        <Component {...pageProps} />
      </MainLayout>
    </>
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