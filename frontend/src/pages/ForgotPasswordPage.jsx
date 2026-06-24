import { useState } from 'react';
import authService from '../services/authService';

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState('idle');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('loading');
    try {
      await authService.forgotPassword({ email });
      alert('Password reset email sent');
      setStatus('succeeded');
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to send email');
      setStatus('failed');
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#f1f5f9',
      padding: '24px'
    }}>
      <div style={{
        width: '100%',
        maxWidth: '28rem',
        borderRadius: '24px',
        background: 'white',
        padding: '32px',
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)'
      }}>
        <h2 style={{ fontSize: '24px', fontWeight: '600', marginBottom: '24px' }}>
          Forgot Password
        </h2>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            type="email"
            placeholder="Email"
            required
            style={{
              width: '100%',
              borderRadius: '16px',
              border: '1px solid #cbd5e1',
              padding: '12px 16px',
              fontSize: '16px'
            }}
          />
          <button
            type="submit"
            style={{
              borderRadius: '16px',
              background: '#0f172a',
              color: 'white',
              padding: '12px 16px',
              fontWeight: '600',
              border: 'none',
              cursor: 'pointer',
              fontSize: '16px'
            }}
          >
            {status === 'loading' ? 'Sending...' : 'Send reset link'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
