import type { Metadata } from 'next';
import { Inter, Changa } from 'next/font/google';
import './globals.css';
import { ThemeProvider } from '@/components/ThemeProvider';
import { CartProvider } from '@/lib/cart-context';
import { I18nProvider } from '@/lib/i18n';
import { SettingsProvider } from '@/lib/settings-context';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { LayoutWrapper } from '@/components/LayoutWrapper';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
});

const changa = Changa({
  subsets: ['arabic', 'latin'],
  weight: ['200', '300', '400', '500', '600', '700', '800'],
  variable: '--font-changa',
  display: 'swap',
});

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
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} ${changa.variable} font-sans antialiased`}>
        <ThemeProvider>
          <I18nProvider>
            <SettingsProvider>
              <CartProvider>
                <LayoutWrapper>
                  <Navbar />
                  <main className="min-h-screen pt-16">{children}</main>
                  <Footer />
                </LayoutWrapper>
              </CartProvider>
            </SettingsProvider>
          </I18nProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
