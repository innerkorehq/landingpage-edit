import React from 'react';
import { AuthProvider } from '@/contexts/AuthContext';
import './globals.css';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          <div id="__next">
            {children}
          </div>
        </AuthProvider>
      </body>
    </html>
  );
}