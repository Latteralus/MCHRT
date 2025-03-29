import React, { useState, ReactElement } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Image from 'next/image'; // Import the Image component
import type { NextPageWithLayout } from './_app';

const LoginPage: NextPageWithLayout = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const result = await signIn('credentials', {
        redirect: false, // Prevent NextAuth from redirecting automatically
        username: username,
        password: password,
      });

      if (result?.error) {
        // Handle sign-in errors (e.g., invalid credentials)
        setError('Invalid username or password.');
        console.error('Sign-in error:', result.error);
      } else if (result?.ok) {
        // Sign-in successful, redirect to the dashboard or intended page
        console.log('Sign-in successful, redirecting...');
        // Use router.query.callbackUrl if provided, otherwise default to '/'
        const callbackUrl = (router.query.callbackUrl as string) || '/';
        router.push(callbackUrl);
      }
    } catch (err) {
      console.error('Unexpected error during sign-in:', err);
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Head>
        <title>Login - Mountain Care</title>
      </Head>
      
      <div className="login-container">
        <form onSubmit={handleSubmit} className="login-form">
          <div className="login-logo">
            <Image src="/logo.png" alt="Mountain Care Logo" width={150} height={50} priority /> {/* Use next/image */}
          </div>
          <h1 className="login-title">Mountain Care</h1>
          
          {error && (
            <div className="alert alert-danger" style={{ marginBottom: '1.5rem' }}>
              {error}
            </div>
          )}
          
          <div className="input-group">
            <label htmlFor="username" className="form-label">Username</label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              className="form-input"
              disabled={loading}
              placeholder="Enter your username"
            />
          </div>
          
          <div className="input-group">
            <label htmlFor="password" className="form-label">Password</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="form-input"
              disabled={loading}
              placeholder="Enter your password"
            />
          </div>
          
          <button type="submit" className="btn btn-primary btn-login" disabled={loading}>
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
      </div>
    </>
  );
};

// This page should not use the MainLayout
LoginPage.getLayout = function getLayout(page: ReactElement) {
  return page; // Return the page without any layout wrapper
};

export default LoginPage;