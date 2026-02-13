import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './AuthErrorBoundary.css';

/**
 * Auth Error Boundary Component
 * Handles authentication errors globally and shows user-friendly messages
 */
const AuthErrorBoundary = ({ children }) => {
  const [error, setError] = useState(null);
  const [countdown, setCountdown] = useState(3);
  const navigate = useNavigate();

  useEffect(() => {
    // Listen for auth errors
    const handleAuthError = (event) => {
      const { message, status } = event.detail;
      
      if (status === 401) {
        setError({
          message: message || 'Your session has expired',
          type: 'session-expired'
        });
      }
    };

    window.addEventListener('auth-error', handleAuthError);
    
    return () => {
      window.removeEventListener('auth-error', handleAuthError);
    };
  }, []);

  useEffect(() => {
    if (error && countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);
      
      return () => clearTimeout(timer);
    }
    
    if (error && countdown === 0) {
      // Clear auth data
      localStorage.removeItem('token');
      localStorage.removeItem('role');
      localStorage.removeItem('userId');
      localStorage.removeItem('userEmail');
      
      // Redirect to login
      navigate('/', { 
        state: { 
          message: error.message,
          from: window.location.pathname 
        } 
      });
    }
  }, [error, countdown, navigate]);

  if (error) {
    return (
      <div className="auth-error-overlay">
        <div className="auth-error-modal">
          <div className="auth-error-icon">
            {error.type === 'session-expired' ? '🔒' : '⚠️'}
          </div>
          <h2 className="auth-error-title">
            {error.type === 'session-expired' ? 'Session Expired' : 'Authentication Error'}
          </h2>
          <p className="auth-error-message">{error.message}</p>
          <p className="auth-error-countdown">
            Redirecting to login in {countdown} seconds...
          </p>
          <button 
            className="auth-error-button"
            onClick={() => {
              localStorage.clear();
              navigate('/');
            }}
          >
            Go to Login Now
          </button>
        </div>
      </div>
    );
  }

  return children;
};

export default AuthErrorBoundary;
