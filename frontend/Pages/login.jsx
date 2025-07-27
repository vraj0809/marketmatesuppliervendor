import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../src/App.jsx';
import '../Components/login.css';

const Login = () => {
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const { setAuth } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async e => {
    e.preventDefault();
    setError('');
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.msg || 'Login failed');
      localStorage.setItem('user', JSON.stringify(data.user));
      setAuth({ user: data.user });
      if (data.user.role === 'vendor') navigate('/vendor');
      else if (data.user.role === 'supplier') navigate('/supplier');
      else navigate('/');
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="container-login">
      <h2 className="login-title">Login</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group-login">
          <label className="label-login" htmlFor="email">Email</label>
          <input
            className="input-login"
            id="email"
            name="email"
            type="email"
            placeholder="Email"
            value={form.email}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group-login">
          <label className="label-login" htmlFor="password">Password</label>
          <input
            className="input-login"
            id="password"
            name="password"
            type="password"
            placeholder="Password"
            value={form.password}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-options-login">
          <label>
            <input type="checkbox" />
            Remember Me
          </label>
          <a href="#" className="forgot-link-login">Forgot Password?</a>
        </div>
        <button type="submit" className="btn-login">Login</button>
        {error && <div style={{ color: 'red', marginTop: 10 }}>{error}</div>}
      </form>
      <div className="signup-prompt-login">
        Don’t have an account?{' '}
        <a href="/signup" className="signup-link-login">Sign Up</a>
      </div>
    </div>
  );
};

export default Login;