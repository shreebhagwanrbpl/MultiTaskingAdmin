import './globals.css';

export const metadata = {
  title: 'Super-Admin Network Hub | Raj Biosis & 70 Multi-Site Engine',
  description: 'Centralized multi-tenant management portal for 70 biomedical websites, themes, domain routing, and central hospital RFQ inquiries.',
  robots: 'noindex, nofollow',
  icons: {
    icon: '/favicon.png',
  },
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#0f172a',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-slate-900 text-slate-100 font-sans antialiased selection:bg-red-600 selection:text-white">
        {children}
      </body>
    </html>
  );
}
