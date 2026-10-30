'use client';

import React from 'react';
import AuthScreen from '../components/AuthScreen';

export default function SignupPage() {
  return <AuthScreen initialMode="signup" redirectTo="/" />;
}

