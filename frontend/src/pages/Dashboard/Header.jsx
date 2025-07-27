import React, { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from "../../context/AuthContext";
import '../../styles/Dashboard/Header.css';

const Header = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include'
      });
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      logout();
      navigate('/login');
    }
  };

  return (
    <header className="dashboard-header">
      <div className="header-left">
        <a href="/" className="header-logo">
          MarketMate
        </a>
        <h1 className="header-title">
          {user?.role === 'vendor' ? 'Vendor Dashboard' : 'Supplier Dashboard'}
        </h1>
      </div>
      
      <div className="header-right">
        <div className="user-info">
          <div className="user-avatar">
            {user?.name?.charAt(0)?.toUpperCase() || 'U'}
          </div>
          <span className="user-name">{user?.name}</span>
        </div>
        <button onClick={handleLogout} className="logout-btn">
          Logout
        </button>
      </div>
    </header>
  );
};

export default Header; 