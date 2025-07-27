import React from 'react';
import '../../styles/Dashboard/Footer.css';

const Footer = () => {
  return (
    <footer className="dashboard-footer">
      <div className="footer-content">
        <div className="footer-left">
          <a href="/" className="footer-logo">MarketMate</a>
        </div>
        <div className="footer-center">
          <p className="footer-text">&copy; 2024 MarketMate. All rights reserved.</p>
        </div>
        <div className="footer-right">
          <a href="/privacy" className="footer-link">Privacy</a>
          <span className="footer-divider">|</span>
          <a href="/terms" className="footer-link">Terms</a>
        </div>
      </div>
    </footer>
  );
};

export default Footer; 