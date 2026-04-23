import React from 'react';
import { Mail } from 'lucide-react';
import '../styles/Footer.css';

const Footer = () => {
  return (
    <footer className="footer">

      <div className="footer-container">

        <div className="footer-grid">

          {/* MAIN */}
          <div className="footer-col-main">
            <h2 className="logo">
              Internship<span className="gradient-text">Demo</span>
            </h2>

            <p>
              Backend Developer Internship Project demonstrating scalable APIs,
              authentication, and role-based access control.
            </p>

            <div className="social-row">

              {/* GitHub */}
              <a href="#" aria-label="GitHub">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
                  stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5
                  .08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5
                  0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2
                  c-.28 1.15-.28 2.35 0 3.5-.73 1.02-1.08 2.25-1
                  3.5 0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85
                  1.65-.17.6-.22 1.23-.15 1.85v4"/>
                  <path d="M9 18c-4.51 2-5-2-7-2"/>
                </svg>
              </a>

              {/* LinkedIn */}
              <a href="#" aria-label="LinkedIn">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
                  stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2
                  2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/>
                  <rect width="4" height="12" x="2" y="9"/>
                  <circle cx="4" cy="4" r="2"/>
                </svg>
              </a>

              {/* Mail */}
              <a href="mailto:support@example.com" aria-label="Mail">
                <Mail size={20}/>
              </a>

            </div>
          </div>

          {/* COLUMN 1 */}
          <div className="footer-col">
            <h4>Assignment</h4>
            <p>JWT Authentication</p>
            <p>Role-Based Access</p>
            <p>CRUD APIs</p>
            <p>API Documentation</p>
          </div>

          {/* COLUMN 2 */}
          <div className="footer-col">
            <h4>Tech Stack</h4>
            <p>Node.js / Express</p>
            <p>MongoDB / SQL</p>
            <p>React.js</p>
            <p>JWT Security</p>
          </div>

          {/* COLUMN 3 */}
          <div className="footer-col">
            <h4>Developer</h4>
            <p><strong>Subhranil Biswas</strong></p>
            
          </div>

        </div>

        {/* BOTTOM */}
        <div className="footer-bottom">
          <p>
            © {new Date().getFullYear()} Backend Developer Internship Project Demo
          </p>
        </div>

      </div>
    </footer>
  );
};

export default Footer;