import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, LogOut, ChevronDown, LayoutDashboard, Menu, X, Shield, Settings } from 'lucide-react';
import '../styles/Header.css';

const Header = ({ isLoggedIn, user }) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 30);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = () => {
    sessionStorage.clear();
    navigate('/');
    window.location.reload();
  };

  const closeMobile = () => {
    setIsMobileNavOpen(false);
    setIsMenuOpen(false);
  };

  // Determine dashboard path based on role
  const dashboardPath = user?.role === 'admin' ? '/admin' : '/dashboard';

  return (
    <header className={`header ${isScrolled ? 'header-scrolled' : ''}`}>
      <div className="header-container">
        <Link to="/" className="logo" onClick={closeMobile}>
          Internship<span className="gradient-text">Demo</span>
        </Link>

        {/* DESKTOP NAVIGATION */}
        <nav className="desktop-nav">
          {!isLoggedIn ? (
            <div className="auth-group">
              <Link to="/login" className="btn btn-outline">Login</Link>
              <Link to="/register" className="btn btn-primary">Get Started</Link>
            </div>
          ) : (
            <div className="user-zone">
              <div 
                className={`user-trigger ${isMenuOpen ? 'active' : ''}`} 
                onClick={() => setIsMenuOpen(!isMenuOpen)}
              >
                <div className="avatar">
                  <User size={16} />
                </div>
                <span className="user-name-text">{user?.name?.split(' ')[0]}</span>
                <ChevronDown size={14} className={`arrow-icon ${isMenuOpen ? 'rotate' : ''}`} />
              </div>

              {isMenuOpen && (
                <div className="profile-dropdown glass-card animate-slide-in">
                  <div className="dropdown-profile-header">
                    <div className="header-avatar">
                      <User size={24} />
                    </div>
                    <div className="header-info">
                      <h4>{user?.name}</h4>
                      <p>{user?.email}</p>
                      {user?.role === 'admin' && <span className="admin-badge">Admin Access</span>}
                    </div>
                  </div>

                  <div className="dropdown-divider"></div>

                  <div className="dropdown-body">
                    <Link to={dashboardPath} className="drop-link" onClick={() => setIsMenuOpen(false)}>
                      <LayoutDashboard size={18}/> 
                      <span>Dashboard</span>
                    </Link>
                    <Link to="/profile" className="drop-link" onClick={() => setIsMenuOpen(false)}>
                      <Settings size={18}/> 
                      <span>Update Profile</span>
                    </Link>
                  </div>

                  <div className="dropdown-divider"></div>

                  <button onClick={handleLogout} className="drop-link logout-btn">
                    <LogOut size={18}/> 
                    <span>Sign Out</span>
                  </button>
                </div>
              )}
            </div>
          )}
        </nav>

        {/* MOBILE BUTTON */}
        <button className="mobile-toggle" onClick={() => setIsMobileNavOpen(!isMobileNavOpen)}>
          {isMobileNavOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
      </div>

      {/* MOBILE OVERLAY */}
      <div className={`mobile-overlay ${isMobileNavOpen ? 'show' : ''}`} onClick={closeMobile}></div>

      {/* MOBILE DRAWER */}
      <aside className={`mobile-drawer ${isMobileNavOpen ? 'open' : ''}`}>
        <div className="drawer-content">
          {!isLoggedIn ? (
            <div className="mobile-auth-stack">
              <div className="drawer-welcome">
                <h2>Welcome</h2>
                <p>Access your internship workspace</p>
              </div>
              <Link to="/login" onClick={closeMobile} className="btn btn-outline full-width">Login</Link>
              <Link to="/register" onClick={closeMobile} className="btn btn-primary full-width">Get Started</Link>
            </div>
          ) : (
            <>
              <div className="mobile-profile-card">
                <div className="mobile-avatar-large">
                  <User size={40} />
                </div>
                <h3>{user?.name}</h3>
                <p>{user?.email}</p>
              </div>

              <nav className="mobile-menu-links">
                <Link to={dashboardPath} className="mobile-link" onClick={closeMobile}>
                  <LayoutDashboard size={20} /> Dashboard
                </Link>
                <Link to="/profile" className="mobile-link" onClick={closeMobile}>
                  <Settings size={20} /> Update Profile
                </Link>
                <button onClick={handleLogout} className="mobile-link logout-text">
                  <LogOut size={20} /> Sign Out
                </button>
              </nav>
            </>
          )}
        </div>
      </aside>
    </header>
  );
};

export default Header;