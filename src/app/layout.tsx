import type { Metadata } from 'next';
import './globals.css';
import { ThemeProvider } from '@/components/ThemeProvider';
import { CartProvider } from '@/lib/cart-context';
import { I18nProvider } from '@/lib/i18n';
import { SettingsProvider } from '@/lib/settings-context';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { LayoutWrapper } from '@/components/LayoutWrapper';
import PageTransition from '@/components/PageTransition';

export const metadata: Metadata = {
  title: 'Service Hub - Premium Digital Subscriptions',
  description: 'Get premium digital subscriptions at the best prices. ChatGPT, Gemini, Canva, LinkedIn Premium, and more.',
  keywords: 'digital subscriptions, ChatGPT, Gemini, Canva, LinkedIn Premium, Spotify, Notion',
  openGraph: {
    title: 'Service Hub - Premium Digital Subscriptions',
    description: 'Get premium digital subscriptions at the best prices.',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning data-scroll-behavior="smooth">
      <body className="font-sans antialiased">
        <ThemeProvider>
          <I18nProvider>
            <SettingsProvider>
              <CartProvider>
                <LayoutWrapper>
                  <div className="animated-bg" aria-hidden="true">
                    <div className="animated-bg-orb animated-bg-orb--1" />
                    <div className="animated-bg-orb animated-bg-orb--2" />
                    <div className="animated-bg-orb animated-bg-orb--3" />
                  </div>
                  <Navbar />
                  <main className="relative z-10 min-h-screen pt-16">
                    <PageTransition>{children}</PageTransition>
                  </main>
                  <div className="relative z-10">
                    <Footer />
                  </div>
                </LayoutWrapper>
              </CartProvider>
            </SettingsProvider>
          </I18nProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
