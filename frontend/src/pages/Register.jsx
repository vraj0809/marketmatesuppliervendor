import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import styles from '../styles/Register.module.css';
import Header from './Navbar.jsx';

const Register = () => {
  const { login } = useContext(AuthContext);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('vendor');
  const [error, setError] = useState('');
  const [company, setCompany] = useState('');
  const [phone, setPhone] = useState('');
  const [street, setStreet] = useState('');
  const [city, setCity] = useState('');
  const [stateVal, setStateVal] = useState('');
  const [zip, setZip] = useState('');
  const [country, setCountry] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      let body = { username, email, password, role };
      if (role === 'supplier') {
        body.profile = {
          company,
          phone,
          address: { street, city, state: stateVal, zip, country },
        };
      }
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(body)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.msg || 'Registration failed');
      login(data.user);
      if (data.user.role === 'vendor') navigate('/vendor/dashboard');
      else if (data.user.role === 'supplier') navigate('/supplier/dashboard');
      else navigate('/');
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className={styles.register}>
      {/* Navbar */}
      <Header />
      
      {/* Animated Background Elements */}
      <div className={styles.register__bg_element}></div>
      <div className={styles.register__bg_element}></div>
      <div className={styles.register__bg_element}></div>
      
      <form className={styles.register__form} onSubmit={handleSubmit}>
        <h2 className={styles.register__title}>Register</h2>
        {error && <div className={styles.register__error}>{error}</div>}
        <input
          className={styles.register__input}
          type="text"
          placeholder="Username"
          value={username}
          onChange={e => setUsername(e.target.value)}
          required
        />
        <input
          className={styles.register__input}
          type="email"
          placeholder="Email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
        />
        <input
          className={styles.register__input}
          type="password"
          placeholder="Password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
        />
        <select
          className={styles.register__input}
          value={role}
          onChange={e => setRole(e.target.value)}
        >
          <option value="vendor">Vendor</option>
          <option value="supplier">Supplier</option>
        </select>
        {role === 'supplier' && (
          <>
            <input
              className={styles.register__input}
              type="text"
              placeholder="Company Name"
              value={company}
              onChange={e => setCompany(e.target.value)}
              required
            />
            <input
              className={styles.register__input}
              type="text"
              placeholder="Phone"
              value={phone}
              onChange={e => setPhone(e.target.value)}
              required
            />
            <input
              className={styles.register__input}
              type="text"
              placeholder="Street Address"
              value={street}
              onChange={e => setStreet(e.target.value)}
              required
            />
            <input
              className={styles.register__input}
              type="text"
              placeholder="City"
              value={city}
              onChange={e => setCity(e.target.value)}
              required
            />
            <input
              className={styles.register__input}
              type="text"
              placeholder="State"
              value={stateVal}
              onChange={e => setStateVal(e.target.value)}
              required
            />
            <input
              className={styles.register__input}
              type="text"
              placeholder="Zip Code"
              value={zip}
              onChange={e => setZip(e.target.value)}
              required
            />
            <input
              className={styles.register__input}
              type="text"
              placeholder="Country"
              value={country}
              onChange={e => setCountry(e.target.value)}
              required
            />
          </>
        )}
        <button className={styles.register__button} type="submit">Register</button>
        <div className={styles.register__footer}>
          <span>Already have an account?</span>
          <a href="/login">Login</a>
        </div>
      </form>
    </div>
  );
};

export default Register;
