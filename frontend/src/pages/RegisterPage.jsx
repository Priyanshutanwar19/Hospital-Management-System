import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { register } from '../features/auth/authSlice';
import { useNavigate } from 'react-router-dom';

const RegisterPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { status } = useSelector((state) => state.auth);
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'patient' });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await dispatch(register(form));
    if (result.meta.requestStatus === 'fulfilled') {
      alert('Account created successfully');
      navigate('/login');
    } else {
      alert(result.payload || 'Registration failed');
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
        maxWidth: '32rem',
        borderRadius: '24px',
        background: 'white',
        padding: '32px',
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)'
      }}>
        <h2 style={{ fontSize: '24px', fontWeight: '600', marginBottom: '24px' }}>
          Create your account
        </h2>
        <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '16px' }}>
          <input
            name="name"
            value={form.name}
            onChange={handleChange}
            placeholder="Full name"
            required
            style={{
              borderRadius: '16px',
              border: '1px solid #cbd5e1',
              padding: '12px 16px',
              fontSize: '16px'
            }}
          />
          <input
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            placeholder="Email"
            required
            style={{
              borderRadius: '16px',
              border: '1px solid #cbd5e1',
              padding: '12px 16px',
              fontSize: '16px'
            }}
          />
          <input
            type="password"
            name="password"
            value={form.password}
            onChange={handleChange}
            placeholder="Password"
            required
            style={{
              borderRadius: '16px',
              border: '1px solid #cbd5e1',
              padding: '12px 16px',
              fontSize: '16px'
            }}
          />
          <select
            name="role"
            value={form.role}
            onChange={handleChange}
            style={{
              borderRadius: '16px',
              border: '1px solid #cbd5e1',
              padding: '12px 16px',
              fontSize: '16px'
            }}
          >
            <option value="patient">Patient</option>
            <option value="doctor">Doctor</option>
            <option value="receptionist">Receptionist</option>
          </select>
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
            {status === 'loading' ? 'Creating account...' : 'Register'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default RegisterPage;
