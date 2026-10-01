import type { Metadata, Viewport } from 'next';
import './globals.css';
import { FinancialDataProvider } from '@/context/FinancialDataContext';

export const metadata: Metadata = {
  title: 'Finlytics AI — Client Financial Dashboard',
  description: 'Autonomous financial intelligence and monthly verified reports for small and mid-sized businesses.',
  icons: {
    icon: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><rect width='100' height='100' rx='25' fill='%2335577d'/><text y='.9em' x='50%' text-anchor='middle' font-size='65' fill='white'>X</text></svg>",
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <FinancialDataProvider>
          {children}
        </FinancialDataProvider>
      </body>
    </html>
  );
}
