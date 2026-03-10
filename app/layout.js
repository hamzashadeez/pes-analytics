import './globals.css';

export const metadata = {
  title: 'PES 2025 Analytics',
  description: 'Track and analyze your PES 2025 match performance',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
