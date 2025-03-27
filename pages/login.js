// pages/login.js
import { useState, useEffect } from 'react';
import { signIn, useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import styles from '../styles/Login.module.css';
import Image from 'next/image';
import Link from 'next/link';

export default function Login() {
  const [credentials, setCredentials] = useState({
    username: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { data: session, status } = useSession();

  // Extract error message from URL if provided
  useEffect(() => {
    if (router.query.error) {
      setError(
        router.query.error === 'CredentialsSignin' 
          ? 'Invalid username or password'
          : 'Authentication failed. Please try again.'
      );
    }
  }, [router.query]);

  // If already authenticated, redirect to dashboard
  useEffect(() => {
    if (session) {
      router.push(router.query.callbackUrl || '/dashboard');
    }
  }, [session, router]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCredentials({
      ...credentials,
      [name]: value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!credentials.username || !credentials.password) {
      setError('Please enter both username and password');
      return;
    }
    
    try {
      setIsLoading(true);
      setError('');
      
      // Send authentication request to NextAuth
      const result = await signIn('credentials', {
        redirect: false,
        username: credentials.username,
        password: credentials.password
      });
      
      if (result.error) {
        setError(
          result.error === 'CredentialsSignin' 
            ? 'Invalid username or password'
            : result.error || 'Authentication failed. Please check your credentials.'
        );
        console.error('Auth error:', result);
      } else {
        // Successful login, redirect to dashboard or callback URL
        router.push(router.query.callbackUrl || '/dashboard');
      }
    } catch (err) {
      console.error('Login error:', err);
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // If still checking authentication, show loading
  if (status === 'loading') {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.loadingSpinner}></div>
        <p>Loading...</p>
      </div>
    );
  }

  // Only show login if not authenticated
  if (session) {
    return null; // Will redirect in useEffect
  }

  return (
    <div className={styles.container}>
      <Head>
        <title>Login | Mountain Care HR Platform</title>
        <meta name="description" content="Login to access Mountain Care HR Platform" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className={styles.loginCard}>
        <div className={styles.logoContainer}>
          {/* Logo can be added here */}
          <h1 className={styles.title}>Mountain Care HR Platform</h1>
        </div>
        
        <div className={styles.formContainer}>
          <h2 className={styles.subtitle}>Sign in to access your dashboard</h2>
          
          {error && (
            <div className={styles.errorMessage} role="alert">
              {error}
            </div>
          )}
          
          <div className={styles.testCredentials}>
            <p>Test with: fcalkins | password</p>
          </div>
          
          <form className={styles.form} onSubmit={handleSubmit}>
            <div className={styles.formGroup}>
              <label htmlFor="username" className={styles.formLabel}>Username</label>
              <input
                id="username"
                name="username"
                type="text"
                value={credentials.username}
                onChange={handleChange}
                className={styles.formControl}
                placeholder="Your username"
                required
                autoComplete="username"
              />
            </div>
            
            <div className={styles.formGroup}>
              <label htmlFor="password" className={styles.formLabel}>Password</label>
              <input
                id="password"
                name="password"
                type="password"
                value={credentials.password}
                onChange={handleChange}
                className={styles.formControl}
                placeholder="Your password"
                required
                autoComplete="current-password"
              />
            </div>
            
            <button 
              type="submit" 
              className={styles.button}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <span className={styles.spinnerSmall}></span>
                  Signing in...
                </>
              ) : 'Sign in'}
            </button>
            
            <div className={styles.forgotPassword}>
              <Link href="/forgot-password">Forgot password?</Link>
            </div>
          </form>
        </div>
      </div>
      
      <footer className={styles.footer}>
        <p>&copy; {new Date().getFullYear()} Mountain Care. All rights reserved.</p>
      </footer>
    </div>
  );
}