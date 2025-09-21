
"use client"
import React, { useState } from 'react';
import axios from 'axios';

const AuroraLogin: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetMessage, setResetMessage] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
    
      const response = await axios.post('/api/auth/login', {
        email,
        password
      });

      console.log('Login successful:', response.data);
    
      localStorage.setItem('authToken', response.data.token);

      alert('Login successful! Redirecting to dashboard...');
    } catch (err: any) {
     
      if (err.response) {
        switch (err.response.status) {
          case 400:
            setError('Invalid input format');
            break;
          case 401:
            setError('Invalid credentials');
            break;
          case 404:
            setError('User not found');
            break;
          case 500:
            setError('Server error. Please try again later.');
            break;
          default:
            setError('An unexpected error occurred');
        }
      } else {
        setError('Network error. Please check your connection.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setResetMessage('');

    try {

      await axios.post('/api/auth/forgot-password', {
        email: resetEmail
      });

      
      setResetMessage('Password reset instructions have been sent to your email.');
      setResetEmail('');
    } catch (err: any) {
      if (err.response) {
        switch (err.response.status) {
          case 404:
            setError('No account found with this email address');
            break;
          case 500:
            setError('Server error. Please try again later.');
            break;
          default:
            setError('An unexpected error occurred');
        }
      } else {
        setError('Network error. Please check your connection.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.loginBox}>
        <div style={styles.logoSection}>
          <h2 style={styles.logoText}>Aurora</h2>
          <p style={styles.subtitle}>
            {isForgotPassword ? 'Reset your password' : 'Login to continue to your dashboard'}
          </p>
        </div>

        {!isForgotPassword ? (
          <>
            {/* <button style={styles.googleButton}>
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" style={styles.googleIcon}>
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Continue with Google
            </button>

            <div style={styles.divider}>
              <span>OR CONTINUE WITH</span>
            </div> */}

            <form onSubmit={handleLogin} style={styles.form}>
              <div style={styles.inputGroup}>
                <label htmlFor="email" style={styles.label}>Email</label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  style={styles.input}
                  placeholder="Enter your email"
                  required
                />
              </div>

              <div style={styles.inputGroup}>
                <div style={styles.passwordLabelContainer}>
                  <label htmlFor="password" style={styles.label}>Password</label>
                  <button 
                    type="button" 
                    style={styles.forgotPasswordButton}
                    onClick={() => setIsForgotPassword(true)}
                  >
                    Forgot password?
                  </button>
                </div>
                <input
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  style={styles.input}
                  placeholder="Enter your password"
                  required
                />
              </div>

              {error && <div style={styles.errorMessage}>{error}</div>}

              <button 
                type="submit" 
                style={isLoading ? {...styles.loginButton, ...styles.loadingButton} : styles.loginButton}
                disabled={isLoading}
              >
                {isLoading ? 'Logging in...' : 'Login'}
              </button>
            </form>

            <div style={styles.registerSection}>
              Don't have an account? <a href="#" style={styles.registerLink}>Register</a>
            </div>
          </>
        ) : (
          <>
            <form onSubmit={handlePasswordReset} style={styles.form}>
              <div style={styles.inputGroup}>
                <label htmlFor="resetEmail" style={styles.label}>Email</label>
                <input
                  type="email"
                  id="resetEmail"
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                  style={styles.input}
                  placeholder="Enter your email"
                  required
                />
              </div>

              {error && <div style={styles.errorMessage}>{error}</div>}
              {resetMessage && <div style={styles.successMessage}>{resetMessage}</div>}

              <div style={styles.buttonGroup}>
                <button 
                  type="submit" 
                  style={isLoading ? {...styles.loginButton, ...styles.loadingButton} : styles.loginButton}
                  disabled={isLoading}
                >
                  {isLoading ? 'Sending...' : 'Send Reset Instructions'}
                </button>

                <button 
                  type="button" 
                  style={styles.backButton}
                  onClick={() => {
                    setIsForgotPassword(false);
                    setError('');
                    setResetMessage('');
                  }}
                >
                  Back to Login
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
};

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '100vh',
    backgroundColor: '#f9fafb',
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
    padding: '20px'
  },
  loginBox: {
    backgroundColor: 'white',
    borderRadius: '12px',
    boxShadow: '0 5px 20px rgba(0, 0, 0, 0.08)',
    padding: '40px',
    width: '100%',
    maxWidth: '400px'
  },
  logoSection: {
    textAlign: 'center',
    marginBottom: '30px'
  },
  logoText: {
    fontSize: '28px',
    color: '#2563eb',
    fontWeight: 600,
    marginBottom: '8px'
  },
  subtitle: {
    color: '#64748b',
    fontSize: '14px'
  },
  googleButton: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    padding: '12px',
    backgroundColor: 'white',
    border: '1px solid #e2e8f0',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: 500,
    color: '#4a5568',
    cursor: 'pointer',
    transition: 'all 0.2s',
    marginBottom: '20px'
  },
  googleIcon: {
    marginRight: '10px'
  },
  divider: {
    display: 'flex',
    alignItems: 'center',
    margin: '25px 0',
    color: '#94a3b8',
    fontSize: '14px'
  },
  form: {
    marginBottom: '25px'
  },
  inputGroup: {
    marginBottom: '20px'
  },
  passwordLabelContainer: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '8px'
  },
  label: {
    fontSize: '14px',
    fontWeight: 500,
    color: '#374151'
  },
  input: {
    width: '100%',
    padding: '12px 15px',
    border: '1px solid #d1d5db',
    borderRadius: '8px',
    fontSize: '14px',
    transition: 'border-color 0.2s'
  },
  loginButton: {
    width: '100%',
    padding: '12px',
    backgroundColor: '#2563eb',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '16px',
    fontWeight: 500,
    cursor: 'pointer',
    transition: 'background 0.2s',
    marginBottom: '10px'
  },
  loadingButton: {
    backgroundColor: '#93c5fd',
    cursor: 'not-allowed'
  },
  buttonGroup: {
    marginTop: '10px'
  },
  backButton: {
    width: '100%',
    padding: '12px',
    backgroundColor: 'transparent',
    color: '#64748b',
    border: '1px solid #d1d5db',
    borderRadius: '8px',
    fontSize: '16px',
    fontWeight: 500,
    cursor: 'pointer',
    transition: 'background 0.2s'
  },
  errorMessage: {
    color: '#dc2626',
    fontSize: '14px',
    marginTop: '10px',
    textAlign: 'center',
    marginBottom: '15px',
    padding: '10px',
    backgroundColor: '#fef2f2',
    borderRadius: '6px',
    border: '1px solid #fecaca'
  },
  successMessage: {
    color: '#059669',
    fontSize: '14px',
    marginTop: '10px',
    textAlign: 'center',
    marginBottom: '15px',
    padding: '10px',
    backgroundColor: '#f0fdf4',
    borderRadius: '6px',
    border: '1px solid #bbf7d0'
  },
  registerSection: {
    textAlign: 'center',
    fontSize: '14px',
    color: '#64748b'
  },
  registerLink: {
    color: '#2563eb',
    textDecoration: 'none',
    fontWeight: 500
  },
  forgotPasswordButton: {
    backgroundColor: 'transparent',
    border: 'none',
    color: '#2563eb',
    fontSize: '12px',
    cursor: 'pointer',
    fontWeight: 500,
    textDecoration: 'underline'
  }
};

export default AuroraLogin;