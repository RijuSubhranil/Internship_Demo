import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; // Changed Navigate to useNavigate
import { ArrowUp, Shield, Database, Zap, Code, Lock } from 'lucide-react';
import '../styles/LandingPage.css';

const LandingPage = () => {
    const [showScroll, setShowScroll] = useState(false);
    const navigate = useNavigate(); // Initialize the navigate function

    useEffect(() => {
        const toggleScroll = () => {
            if (window.scrollY > 400) setShowScroll(true);
            else setShowScroll(false);
        };
        window.addEventListener('scroll', toggleScroll);
        return () => window.removeEventListener('scroll', toggleScroll);
    }, []);

    const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });

    // Corrected navigation handler
    const handleLaunchDemo = () => {
        navigate('/login'); 
    };

    const handleOpenDocs = () => {
        // Opens Swagger UI in a new tab
        window.open('https://internship-demo-backend.onrender.com/api-docs', '_blank'); 
    };

    return (
        <div className="landing">
            {/* BACKGROUND ANIMATED ORBS */}
            <div className="orb orb1"></div>
            <div className="orb orb2"></div>
            <div className="orb orb3"></div>

            {/* HERO SECTION */}
            <section className="hero">
                <div className="hero-content glass-card">
                    <span className="hero-badge">Backend Developer Internship 2026</span>
                    <h1>
                        Scalable REST API with <br />
                        <span className="gradient-text">Authentication & RBAC</span>
                    </h1>
                    <p>
                        High-performance system engineering featuring multi-layered JWT security, 
                        dynamic role permissions, and an interactive React interface.
                    </p>
                    <div className="hero-actions">
                        <button className="btn btn-primary" onClick={handleLaunchDemo}>
                            Launch Project Demo
                        </button>
                        <button className="btn btn-outline" onClick={handleOpenDocs}>
                            API Documentation
                        </button>
                    </div>
                </div>
            </section>

            {/* CORE FEATURES SECTION */}
            <section className="features-section">
                <div className="section-head">
                    <h2 className="gradient-text">Core Implementation</h2>
                    <p>Technological pillars of the assignment architecture</p>
                </div>

                <div className="features-grid">
                    <div className="feature-card glass-card">
                        <Lock className="feat-icon" size={32} />
                        <h3>Secure Auth</h3>
                        <p>Password hashing with Bcrypt and alphanumeric captcha integration.</p>
                    </div>

                    <div className="feature-card glass-card">
                        <Shield className="feat-icon" size={32} />
                        <h3>RBAC Logic</h3>
                        <p>Role-based middleware ensuring strict data isolation between roles.</p>
                    </div>

                    <div className="feature-card glass-card">
                        <Database className="feat-icon" size={32} />
                        <h3>Modular CRUD</h3>
                        <p>Clean controller-service architecture for scalable entity management.</p>
                    </div>

                    <div className="feature-card glass-card">
                        <Zap className="feat-icon" size={32} />
                        <h3>Real-time OTP</h3>
                        <p>High-speed email delivery using Brevo API for user verification.</p>
                    </div>

                    <div className="feature-card glass-card">
                        <Code className="feat-icon" size={32} />
                        <h3>React UI</h3>
                        <p>Responsive frontend with state-driven dynamic user experiences.</p>
                    </div>
                </div>
            </section>

            {/* REQUIREMENTS OVERVIEW SECTION */}
            <section className="requirements">
                <div className="section-head">
                    <h2 className="gradient-text">Deliverables Status</h2>
                </div>
                <div className="req-grid">
                    <div className="req-card glass-card">
                        <div className="req-header">Backend</div>
                        <ul>
                            <li>JWT & Password Hashing</li>
                            <li>Middleware Authorization</li>
                            <li>API Versioning (v1)</li>
                            <li>Swagger Documentation</li>
                        </ul>
                    </div>
                    <div className="req-card glass-card">
                        <div className="req-header">Frontend</div>
                        <ul>
                            <li>Dynamic Session Handling</li>
                            <li>Protected Dashboards</li>
                            <li>Responsive UI (Mobile)</li>
                            <li>Vanilla CSS Styling</li>
                        </ul>
                    </div>
                    <div className="req-card glass-card">
                        <div className="req-header">Scalability</div>
                        <ul>
                            <li>Database Indexing</li>
                            <li>Input Sanitization</li>
                            <li>Microservice Ready</li>
                            <li>Professional README</li>
                        </ul>
                    </div>
                </div>
            </section>

            {/* BACK TO TOP BUTTON */}
            {showScroll && (
                <button className="scroll-up" onClick={scrollToTop} aria-label="Scroll to top">
                    <ArrowUp size={24} />
                </button>
            )}
        </div>
    );
};

export default LandingPage;