import { Link } from 'react-router-dom';

const HomePage = () => {
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(to bottom right, #0ea5e9, #4f46e5)',
      color: 'white',
      padding: '24px'
    }}>
      <div style={{
        maxWidth: '48rem',
        borderRadius: '2rem',
        background: 'rgba(255, 255, 255, 0.1)',
        padding: '40px',
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
        backdropFilter: 'blur(10px)'
      }}>
        <h1 style={{ fontSize: '36px', fontWeight: 'bold', marginBottom: '16px' }}>
          SmartCare Hospital Management System
        </h1>
        <p style={{ marginBottom: '24px', color: '#f0f9ff' }}>
          Secure patient management, appointment booking, billing, and analytics for hospitals, doctors, and reception teams.
        </p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px' }}>
          <Link to="/login" style={{
            borderRadius: '12px',
            background: 'white',
            padding: '12px 24px',
            color: '#1e293b',
            fontWeight: '600',
            textDecoration: 'none',
            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
          }}>
            Login
          </Link>
          <Link to="/register" style={{
            borderRadius: '12px',
            border: '1px solid rgba(255, 255, 255, 0.6)',
            padding: '12px 24px',
            color: 'white',
            fontWeight: '600',
            textDecoration: 'none'
          }}>
            Register
          </Link>
        </div>
      </div>
    </div>
  );
};

export default HomePage;

