// app/layout.tsx
import './globals.css';
import { SessionProvider } from '../components/SessionContext';
import { ReflexAgentProvider } from '../components/ReflexAgentContext';

export const metadata = {
  title: 'Hookah+ Dashboard',
  description: 'POS System for Hookah Lounge',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <ReflexAgentProvider>
          <SessionProvider>
            {children}
          </SessionProvider>
        </ReflexAgentProvider>
      </body>
    </html>
  );
}
