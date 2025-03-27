import React, { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/router';
import Head from 'next/head';

const LoginPage: React.FC = () => {
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

  // Basic styling for the login form - can be moved to CSS modules later
  const styles: { [key: string]: React.CSSProperties } = {
    container: {
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '100vh',
      backgroundColor: 'var(--gray-100)',
    },
    form: {
      padding: '2rem',
      backgroundColor: 'white',
      borderRadius: 'var(--radius)',
      boxShadow: 'var(--shadow-md)',
      width: '100%',
      maxWidth: '400px',
      textAlign: 'center',
    },
    title: {
      marginBottom: '1.5rem',
      color: 'var(--primary)',
    },
    inputGroup: {
      marginBottom: '1rem',
      textAlign: 'left',
    },
    label: {
      display: 'block',
      marginBottom: '0.5rem',
      fontWeight: '600',
      fontSize: '0.875rem',
      color: 'var(--gray-700)',
    },
    input: {
      width: '100%',
      padding: '0.75rem',
      border: '1px solid var(--gray-300)',
      borderRadius: 'var(--radius)',
      fontSize: '1rem',
    },
    button: {
      width: '100%',
      padding: '0.75rem',
      backgroundColor: 'var(--primary)',
      color: 'white',
      border: 'none',
      borderRadius: 'var(--radius)',
      fontSize: '1rem',
      fontWeight: '600',
      cursor: 'pointer',
      transition: 'background-color 0.2s ease',
      marginTop: '1rem',
    },
    error: {
      color: 'var(--danger)',
      marginTop: '1rem',
      fontSize: '0.875rem',
    },
  };

  return (
    <>
      <Head>
        <title>Login - Mountain Care HR</title>
      </Head>
      <div style={styles.container}>
        <form onSubmit={handleSubmit} style={styles.form}>
          <h1 style={styles.title}>Mountain Care HR Login</h1>
          {error && <p style={styles.error}>{error}</p>}
          <div style={styles.inputGroup}>
            <label htmlFor="username" style={styles.label}>Username</label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              style={styles.input}
              disabled={loading}
            />
          </div>
          <div style={styles.inputGroup}>
            <label htmlFor="password" style={styles.label}>Password</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={styles.input}
              disabled={loading}
            />
          </div>
          <button type="submit" style={styles.button} disabled={loading}>
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>
      </div>
    </>
  );
};

// This page should not use the MainLayout
// We can define this explicitly if using per-page layouts later
// LoginPage.getLayout = function getLayout(page: React.ReactElement) {
//   return page;
// };

export default LoginPage;