import './globals.css';
import Providers from './providers';
import type { Metadata } from 'next';
import { Inter, Space_Grotesk } from 'next/font/google';
import { AppLayout } from '@/components/layout/AppLayout';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const space = Space_Grotesk({ subsets: ['latin'], weight: ['400', '600', '700'], variable: '--font-space' });

export const metadata: Metadata = {
  title: 'Esta Todo',
  description: 'Auditoría Antifraude Inmutable para Logística',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={`${inter.variable} ${space.variable}`}>
      <body style={{ display: 'flex', height: '100vh', overflow: 'hidden', background: 'var(--bg)', margin: 0, fontFamily: 'var(--font-inter), system-ui, sans-serif' }}>
        <Providers>
          <AppLayout>
            {children}
          </AppLayout>
        </Providers>
      </body>
    </html>
  );
}
