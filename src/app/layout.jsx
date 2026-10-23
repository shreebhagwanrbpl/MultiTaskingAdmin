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
  themeColor: '#ffffff',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-slate-50/60 text-slate-700 font-sans antialiased selection:bg-sky-100 selection:text-sky-800">
        {children}
      </body>
    </html>
  );
}
