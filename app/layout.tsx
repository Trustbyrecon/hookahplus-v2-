import './globals.css';
import { SessionProvider } from '../components/SessionContext';

export const metadata = {
  title: 'Hookah+ Dashboard',
  description: 'POS System for Hookah Lounge',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <SessionProvider>
          {children}
        </SessionProvider>
      </body>
    </html>
  );
}
