'use client';

import React from 'react';
import { AuthProvider } from '../lib/AuthContext';

export default function Providers({ children }) {
  return <AuthProvider>{children}</AuthProvider>;
}

