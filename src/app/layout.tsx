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
import ScrollToTop from '@/components/ScrollToTop';
import CartDrawer from '@/components/CartDrawer';

export const metadata: Metadata = {
  title: 'Service Hub - Premium Digital Subscriptions',
  description: 'Buy ChatGPT, Gemini, Canva, LinkedIn Premium and more at the best prices. No account required — order in minutes via WhatsApp.',
  keywords: 'digital subscriptions, ChatGPT, Gemini, Canva, LinkedIn Premium, Spotify, Notion, WhatsApp order',
  openGraph: {
    title: 'Service Hub - Premium Digital Subscriptions',
    description: 'Buy ChatGPT, Gemini, Canva, LinkedIn Premium and more. No account required — order via WhatsApp.',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Service Hub - Premium Digital Subscriptions',
    description: 'Buy ChatGPT, Gemini, Canva & more. No account required — order via WhatsApp.',
  },
  robots: { index: true, follow: true },
  manifest: '/manifest.json',
  appleWebApp: { capable: true, statusBarStyle: 'black-translucent', title: 'Service Hub' },
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
                  <ScrollToTop />
                  <CartDrawer />
                </LayoutWrapper>
              </CartProvider>
            </SettingsProvider>
          </I18nProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
