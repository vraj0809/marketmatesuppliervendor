import React from "react";
import { Link, NavLink, useLocation } from 'react-router-dom';
import { ShoppingCart } from "lucide-react"; // Make sure lucide-react is installed
import "../Components/Navbar.css"; // Your CSS file

const Header = () => {
  const location = useLocation();
  const isLoginPage = location.pathname === '/login';
  const isRegisterPage = location.pathname === '/register';

  return (
    <header className="header-landingpage">
      <div className="container-landingpage">
          <div className="header-content-landingpage">
            <div className="logo-landingpage">
              <div className="logo-icon-landingpage">
                <ShoppingCart className="icon-landingpage" />
              </div>
              <span className="logo-text-landingpage">MARKETMATE</span>
            </div>
            
            <nav className="nav-landingpage">
              <a href="#" className="nav-link-landingpage">Buy</a>
              <a href="#" className="nav-link-landingpage">Sell</a>
              <a href="#" className="nav-link-landingpage">Markets</a>
              <a href="#" className="nav-link-landingpage">Business</a>
              <a href="#" className="nav-link-landingpage">Support</a>
            </nav>
            
            <div className="auth-buttons-landingpage">
              {!isLoginPage && (
                <NavLink to="/login">
                  <button className={`btn-landingpage ${isRegisterPage ? 'btn-primary-landingpage' : 'btn-outline-landingpage'}`}>
                    {isRegisterPage ? 'Login' : 'Sign in'}
                  </button>
                </NavLink>
              )}
              {!isRegisterPage && (
                <NavLink to="/register">
                  <button className="btn-landingpage btn-primary-landingpage">
                    Sign up
                  </button>
                </NavLink>
              )}
            </div>
          </div>
        </div>
    </header>
  );
};

export default Header;
