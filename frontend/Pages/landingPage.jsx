import React, { useState, useEffect } from 'react';
import { ShoppingCart, Users, TrendingUp, Shield, Clock, Package, Zap, Globe, Check } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import "../Components/landingPage.css";
import Header from './Navbar.jsx';

const MarketMateLanding = () => {
  const [activeSection, setActiveSection] = useState(0);
  const [isVisible, setIsVisible] = useState({});

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          setIsVisible(prev => ({
            ...prev,
            [entry.target.id]: entry.isIntersecting
          }));
        });
      },
      { threshold: 0.1 }
    );

    document.querySelectorAll('[id]').forEach((el) => {
      observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  const FloatingOrb = ({ className, size = "small", delay = 0 }) => (
    <div className={`floating-orb-landingpage ${className} ${size}`} 
         style={{ animationDelay: `${delay}s` }}>
      <div className="orb-inner-landingpage"></div>
    </div>
  );

  const StarIcon = ({ className }) => (
    <div className={`star-icon-landingpage ${className}`}>
      <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
        <path d="M10 0l2 8h8l-6 4 2 8-6-4-6 4 2-8-6-4h8z"/>
      </svg>
    </div>
  );

  return (
    <div className="main-wrapper-landingpage">
      {/* Floating Elements */}
      <FloatingOrb className="orb-1-landingpage" size="large" />
      <FloatingOrb className="orb-2-landingpage" size="medium" delay={1} />
      <FloatingOrb className="orb-3-landingpage" size="xlarge" delay={2} />
      <FloatingOrb className="orb-4-landingpage" size="medium" delay={0.5} />
      <StarIcon className="star-1-landingpage" />
      <StarIcon className="star-2-landingpage" />
      <StarIcon className="star-3-landingpage" />

      {/* Header */}
      <Header/>

      {/* Hero Section */}
      <section id="hero" className="hero-section-landingpage">
        <div className="container-landingpage">
          <div className="hero-content-landingpage">
            <h1 className="hero-title-landingpage">
              Smart Sourcing for 
              <br />
              <span className="gradient-text-landingpage">
                Street Food Vendors
              </span>
            </h1>
            <p className="hero-subtitle-landingpage">
              Connect buyers and suppliers on MarketMate, the platform dedicated 
              to every trader at every level.
            </p>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', marginTop: 20 }}>
              <NavLink to="/login">
                <button className="btn-landingpage btn-outline-landingpage">
                  Sign in
                </button>
              </NavLink>
              <NavLink to="/register">
                <button className="btn-landingpage btn-primary-landingpage">
                  Sign up
                </button>
              </NavLink>
            </div>
          </div>
          {/* Floating Icons */}
          <div className="floating-icon-landingpage icon-1-landingpage">
            <Package className="icon-landingpage" />
          </div>
          <div className="floating-icon-landingpage icon-2-landingpage">
            <TrendingUp className="icon-landingpage" />
          </div>
          <div className="floating-icon-landingpage icon-3-landingpage">
            <Users className="icon-landingpage" />
          </div>
        </div>
      </section>

      {/* Features Cards */}
      <section id="features" className="features-section-landingpage">
        <div className="container-landingpage">
          <div className="features-grid-landingpage">
            <div className="feature-card-landingpage">
              <div className="feature-icon-landingpage blue-gradient-landingpage">
                <ShoppingCart className="icon-landingpage" />
              </div>
              <h3 className="feature-title-landingpage">Buyer Dashboard</h3>
              <p className="feature-description-landingpage">
                Advanced tools for buyers to discover, compare, and purchase products from verified suppliers worldwide.
              </p>
            </div>
            <div className="feature-card-landingpage">
              <div className="feature-icon-landingpage green-gradient-landingpage">
                <Package className="icon-landingpage" />
              </div>
              <h3 className="feature-title-landingpage">Supplier Hub</h3>
              <p className="feature-description-landingpage">
                Comprehensive platform for suppliers to showcase products, manage inventory, and connect with global buyers.
              </p>
            </div>
            <div className="feature-card-landingpage">
              <div className="feature-icon-landingpage orange-gradient-landingpage">
                <Shield className="icon-landingpage" />
              </div>
              <h3 className="feature-title-landingpage">Secure Wallet</h3>
              <p className="feature-description-landingpage">
                Protected payment system with escrow services, ensuring safe transactions for both parties.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Investment Platform Section */}
      <section id="platform" className="platform-section-landingpage">
        <div className="container-landingpage">
          <div className="platform-content-landingpage">
            <h2 className="section-title-landingpage">
              A marketplace platform
              <br />
              <span className="gradient-text-landingpage">
                that connects with you
              </span>
            </h2>
            <p className="section-subtitle-landingpage">
              Join thousands of buyers and suppliers building successful businesses on MarketMate
            </p>
            <button className="btn-landingpage btn-primary-landingpage">
              Start Trading
            </button>
          </div>
        </div>
      </section>

      {/* Customer Support Section */}
      <section id="support" className="support-section-landingpage">
        <div className="container-landingpage">
          <div className="support-content-landingpage">
            <div className="support-left-landingpage">
              <div className="support-icon-landingpage">
                <Clock className="icon-landingpage" />
              </div>
              <h2 className="support-title-landingpage">
                24/7 access to full
                <br />
                service customer
                <br />
                <span className="gradient-text-landingpage">support</span>
              </h2>
              <button className="btn-landingpage btn-primary-landingpage">
                Contact Us
              </button>
            </div>
            <div className="support-right-landingpage">
              <div className="stats-card-landingpage">
                <div className="stat-item-landingpage">
                  <span className="stat-label-landingpage">Average Response Time</span>
                  <span className="stat-value-landingpage success">2 mins</span>
                </div>
                <div className="stat-item-landingpage">
                  <span className="stat-label-landingpage">Customer Satisfaction</span>
                  <span className="stat-value-landingpage success">99.8%</span>
                </div>
                <div className="stat-item-landingpage">
                  <span className="stat-label-landingpage">Issues Resolved</span>
                  <span className="stat-value-landingpage success">First Contact</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trading Fees Section */}
      <section id="fees" className="fees-section-landingpage">
        <div className="container-landingpage">
          <div className="fees-header-landingpage">
            <h2 className="section-title-landingpage">
              Buy and sell with the lowest
              <br />
              <span className="gradient-text-landingpage">fees in the industry</span>
            </h2>
          </div>
          <div className="fees-card-landingpage">
            <div className="fees-grid-landingpage">
              <div className="fee-item-landingpage">
                <div className="fee-value-landingpage green">0.1%</div>
                <div className="fee-label-landingpage">Transaction Fee</div>
              </div>
              <div className="fee-item-landingpage">
                <div className="fee-value-landingpage blue">Free</div>
                <div className="fee-label-landingpage">Account Setup</div>
              </div>
              <div className="fee-item-landingpage">
                <div className="fee-value-landingpage purple">24/7</div>
                <div className="fee-label-landingpage">Trading Hours</div>
              </div>
              <div className="fee-item-landingpage">
                <div className="fee-value-landingpage orange">Global</div>
                <div className="fee-label-landingpage">Market Access</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Getting Started Section */}
      <section id="start" className="start-section-landingpage">
        <div className="container-landingpage">
          <div className="start-content-landingpage">
            <div className="start-left-landingpage">
              <h2 className="section-title-landingpage">
                Take your first step
                <br />
                into safe, secure
                <br />
                <span className="gradient-text-landingpage">marketplace trading</span>
              </h2>
              <div className="benefits-list-landingpage">
                <div className="benefit-item-landingpage">
                  <Check className="check-icon-landingpage" />
                  <span>Verified suppliers and buyers</span>
                </div>
                <div className="benefit-item-landingpage">
                  <Check className="check-icon-landingpage" />
                  <span>Secure escrow payments</span>
                </div>
                <div className="benefit-item-landingpage">
                  <Check className="check-icon-landingpage" />
                  <span>Global shipping solutions</span>
                </div>
              </div>
              <button className="btn-landingpage btn-hero-landingpage">
                Join MarketMate
              </button>
            </div>
            <div className="start-right-landingpage">
              <div className="globe-container-landingpage">
                <div className="globe-main-landingpage">
                  <Globe className="globe-icon-landingpage" />
                </div>
                <div className="globe-accent-landingpage">
                  <Zap className="icon-landingpage" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer-landingpage">
        <div className="container-landingpage">
          <div className="footer-content-landingpage">
            <div className="footer-logo-landingpage">
              <div className="logo-icon-landingpage">
                <ShoppingCart className="icon-landingpage" />
              </div>
              <span className="logo-text-landingpage">MARKETMATE</span>
            </div>
            <div className="footer-links-landingpage">
              <a href="#" className="footer-link-landingpage">Privacy</a>
              <a href="#" className="footer-link-landingpage">Terms</a>
              <a href="#" className="footer-link-landingpage">Support</a>
              <a href="#" className="footer-link-landingpage">About</a>
            </div>
          </div>
          <div className="footer-copyright-landingpage">
            © 2025 MarketMate. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default MarketMateLanding;