import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import styles from '../styles/Login.module.css';
import Header from './Navbar.jsx';

const Login = () => {
  const { login } = useContext(AuthContext);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.msg || 'Login failed');
      login(data.user);
      if (data.user.role === 'vendor') navigate('/vendor/dashboard');
      else if (data.user.role === 'supplier') navigate('/supplier/dashboard');
      else navigate('/');
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className={styles.login}>
      {/* Navbar */}
      <Header />
      
      {/* Animated Background Elements */}
      <div className={styles.login__bg_element}></div>
      <div className={styles.login__bg_element}></div>
      <div className={styles.login__bg_element}></div>
      
      <form className={styles.login__form} onSubmit={handleSubmit}>
        <h2 className={styles.login__title}>Sign In</h2>
        {error && <div className={styles.login__error}>{error}</div>}
        <input
          className={styles.login__input}
          type="email"
          placeholder="Email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
        />
        <input
          className={styles.login__input}
          type="password"
          placeholder="Password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
        />
        <button className={styles.login__button} type="submit">Login</button>
        <div className={styles.login__footer}>
          <span>Don't have an account?</span>
          <a href="/register">Register</a>
        </div>
      </form>
    </div>
  );
};

export default Login; 