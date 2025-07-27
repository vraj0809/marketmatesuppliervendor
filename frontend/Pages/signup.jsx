import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import "../Components/sign-up.css";
import { AuthContext } from '../src/App.jsx';

function Signup() {
  const [role, setRole] = useState("vendor");
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    companyName: '' // Only for supplier
  });
  const [error, setError] = useState("");
  const { setAuth } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    let payload = {
      name: form.name,
      email: form.email,
      password: form.password,
      role
    };
    if (role === "supplier") {
      payload.companyName = form.companyName;
    }
    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.msg || 'Signup failed');
      localStorage.setItem('user', JSON.stringify(data.user));
      setAuth({ user: data.user });
      navigate(role === 'vendor' ? '/vendor' : '/supplier');
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="container-signup">
      <h2 className="signup-title">Create Account</h2>
      {/* Role Selection Buttons */}
      <div className="role-toggle-signup">
        <button
          className={`btn-role-signup ${role === "vendor" ? "active" : ""}`}
          onClick={() => setRole("vendor")}
          type="button"
        >
          Vendor
        </button>
        <button
          className={`btn-role-signup ${role === "supplier" ? "active" : ""}`}
          onClick={() => setRole("supplier")}
          type="button"
        >
          Supplier
        </button>
      </div>
      {/* Signup Form */}
      <form onSubmit={handleSubmit} className="form-signup">
        {role === "vendor" && (
          <>
            <div className="form-group-signup">
              <label className="label-signup" htmlFor="name">
                Vendor Name
              </label>
              <input
                className="input-signup"
                type="text"
                id="name"
                name="name"
                value={form.name}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group-signup">
              <label className="label-signup" htmlFor="email">
                Email
              </label>
              <input
                className="input-signup"
                type="email"
                id="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group-signup">
              <label className="label-signup" htmlFor="password">
                Password
              </label>
              <input
                className="input-signup"
                type="password"
                id="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                required
              />
            </div>
          </>
        )}
        {role === "supplier" && (
          <>
            <div className="form-group-signup">
              <label className="label-signup" htmlFor="name">
                Supplier Name
              </label>
              <input
                className="input-signup"
                type="text"
                id="name"
                name="name"
                value={form.name}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group-signup">
              <label className="label-signup" htmlFor="email">
                Email
              </label>
              <input
                className="input-signup"
                type="email"
                id="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group-signup">
              <label className="label-signup" htmlFor="password">
                Password
              </label>
              <input
                className="input-signup"
                type="password"
                id="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group-signup">
              <label className="label-signup" htmlFor="companyName">
                Company Name
              </label>
              <input
                className="input-signup"
                type="text"
                id="companyName"
                name="companyName"
                value={form.companyName}
                onChange={handleChange}
                required
              />
            </div>
          </>
        )}
        <button className="btn-signup" type="submit">
          Sign Up as {role === "vendor" ? "Vendor" : "Supplier"}
        </button>
        {error && <div style={{ color: 'red', marginTop: 10 }}>{error}</div>}
      </form>
    </div>
  );
}

export default Signup;
