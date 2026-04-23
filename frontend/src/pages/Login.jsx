import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { RefreshCw, Lock, Mail, ShieldCheck, Eye, EyeOff, ArrowLeft, CheckCircle, User as UserIcon, ShieldAlert } from 'lucide-react';
import api from '../utils/api';
import toast from 'react-hot-toast';
import '../styles/Auth.css';

const Login = () => {
    // loginType: 'user' or 'admin'
    const [loginType, setLoginType] = useState('user'); 
    // Views: 'login', 'forgot-email', 'forgot-otp', 'forgot-reset'
    const [view, setView] = useState('login'); 
    
    const [loading, setLoading] = useState(false);
    const [captcha, setCaptcha] = useState('');
    const [timer, setTimer] = useState(0);
    const [showPass, setShowPass] = useState(false);
    const [strength, setStrength] = useState({ score: 0, label: 'Weak', color: '#ff4d4d' });
    
    const [formData, setFormData] = useState({
        email: '', password: '', captchaInput: '', otp: '', newPassword: '', confirmPassword: ''
    });

    const otpRefs = useRef([]);
    const [otpArray, setOtpArray] = useState(new Array(6).fill(""));
    const navigate = useNavigate();

    // Timer Logic for OTP Resend
    useEffect(() => {
        let interval;
        if (timer > 0) interval = setInterval(() => setTimer((t) => t - 1), 1000);
        return () => clearInterval(interval);
    }, [timer]);

    // Fetch Captcha from Backend
    const fetchCaptcha = async () => {
        try {
            const res = await api.get('/auth/captcha');
            setCaptcha(res.data.captcha);
        } catch (err) { toast.error('Captcha load failed'); }
    };

    useEffect(() => { 
        if (view === 'login') fetchCaptcha(); 
    }, [view]);

    // 6-Box OTP Navigation logic
    const handleOtpChange = (element, index) => {
        if (isNaN(element.value)) return false;
        const newOtp = [...otpArray];
        newOtp[index] = element.value;
        setOtpArray(newOtp);
        setFormData({ ...formData, otp: newOtp.join("") });
        if (element.value !== "" && index < 5) otpRefs.current[index + 1].focus();
    };

    // Password Strength Evaluator
    const handlePasswordChange = (val) => {
        setFormData({ ...formData, newPassword: val });
        let score = 0;
        if (val.length >= 8) score++;
        if (/[A-Z]/.test(val)) score++;
        if (/[0-9]/.test(val)) score++;
        if (/[^A-Za-z0-9]/.test(val)) score++;
        const levels = [
            { label: 'Very Weak', color: '#ff4d4d' }, { label: 'Weak', color: '#ffa500' },
            { label: 'Medium', color: '#ffff00' }, { label: 'Strong', color: '#00ff00' }, { label: 'Excellent', color: '#00e6e6' }
        ];
        setStrength({ score, ...levels[score] });
    };

    // --- MAIN API HANDLERS ---

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await api.post('/auth/login', { ...formData, actualCaptcha: captcha });
            const userRole = res.data.role;

            // CROSS-ROLE VALIDATION
            if (loginType === 'admin' && userRole !== 'admin') {
                toast.error("Access Denied: You are not authorized as an Administrator.");
                setLoading(false);
                return;
            }

            if (loginType === 'user' && userRole === 'admin') {
                toast.error("Admin account detected. Please use the Admin Login tab.");
                setLoading(false);
                return;
            }

            // Persistence
            sessionStorage.setItem('token', res.data.token);
            sessionStorage.setItem('user', JSON.stringify({ email: formData.email, role: userRole }));
            
            toast.success(`Welcome Back, ${userRole === 'admin' ? 'Administrator' : 'User'}`);
            
            // ROLE-BASED REDIRECTION
            if (userRole === 'admin') {
                navigate('/admin');
            } else {
                navigate('/dashboard');
            }
            window.location.reload();

        } catch (err) {
            toast.error(err.response?.data?.message || 'Login failed');
            fetchCaptcha();
        } finally { setLoading(false); }
    };

    const handleForgotStart = async (e) => {
        if (e) e.preventDefault();
        setLoading(true);
        try {
            await api.post('/auth/forgot-password', { email: formData.email });
            toast.success('Reset code sent to your email');
            setView('forgot-otp');
            setTimer(120);
        } catch (err) { 
            toast.error(err.response?.data?.message || 'Account not found'); 
        } finally { setLoading(false); }
    };

    const handleVerifyOTP = async (e) => {
        e.preventDefault();
        const fullOtp = otpArray.join("");
        if (fullOtp.length !== 6) return toast.error("Enter 6-digit code");
        
        setLoading(true);
        try {
            // STRICT SERVER-SIDE VERIFICATION (NO BYPASS)
            await api.post('/auth/verify-otp', { 
                email: formData.email, 
                otp: fullOtp 
            });
            toast.success("Identity Verified");
            setFormData(prev => ({ ...prev, otp: fullOtp }));
            setView('forgot-reset');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Invalid or Expired OTP');
        } finally { setLoading(false); }
    };

    const handleResetPassword = async (e) => {
        e.preventDefault();
        if (formData.newPassword !== formData.confirmPassword) return toast.error("Passwords do not match");
        setLoading(true);
        try {
            await api.post('/auth/reset-password', { 
                email: formData.email, 
                otp: formData.otp, 
                newPassword: formData.newPassword 
            });
            toast.success('Credentials updated! Please login.');
            setView('login');
            setOtpArray(new Array(6).fill(""));
        } catch (err) { 
            toast.error(err.response?.data?.message || 'Reset failed'); 
        } finally { setLoading(false); }
    };

    return (
        <div className="auth-container">
            <div className="auth-card glass-card">
                
                {/* LOGIN VIEW */}
                {view === 'login' && (
                    <>
                        <div className="auth-header">
                            <h2>{loginType === 'admin' ? 'Admin Portal' : 'Login'}</h2>
                            <p>Manage your <span className="gradient-text">Scalable APIs</span></p>
                        </div>

                        {/* SIDE-BY-SIDE TABS */}
                        <div className="login-tabs">
                            <button 
                                className={`tab-btn ${loginType === 'user' ? 'active' : ''}`}
                                onClick={() => setLoginType('user')}
                            >
                                <UserIcon size={14} /> User Login
                            </button>
                            <button 
                                className={`tab-btn ${loginType === 'admin' ? 'active' : ''}`}
                                onClick={() => setLoginType('admin')}
                            >
                                <ShieldAlert size={14} /> Admin Login
                            </button>
                        </div>

                        <form className="auth-form" onSubmit={handleLogin}>
                            <div className="input-group">
                                <label><Mail size={14}/> Email Address</label>
                                <input type="email" required placeholder="user@domain.com" onChange={(e) => setFormData({...formData, email: e.target.value})} />
                            </div>
                            <div className="input-group">
                                <label><Lock size={14}/> Password</label>
                                <input type="password" required placeholder="••••••••" onChange={(e) => setFormData({...formData, password: e.target.value})} />
                                <small className="resend-link" style={{textAlign: 'right', marginTop: '5px'}} onClick={() => setView('forgot-email')}>Forgot Password?</small>
                            </div>
                            <div className="input-group">
                                <label>Security Check</label>
                                <div className="captcha-container">
                                    <div className="captcha-box">{captcha}</div>
                                    <RefreshCw size={20} className="refresh-captcha" onClick={fetchCaptcha} />
                                </div>
                                <input type="text" required placeholder="Type the code above" onChange={(e) => setFormData({...formData, captchaInput: e.target.value})} />
                            </div>
                            <button className="btn btn-primary" disabled={loading}>
                                {loading ? <RefreshCw className="rotate" size={18}/> : `Authorize as ${loginType === 'admin' ? 'Admin' : 'User'}`}
                            </button>
                        </form>
                        <div className="auth-footer">New to platform? <span onClick={() => navigate('/register')}>Join Now</span></div>
                    </>
                )}

                {/* FORGOT PASSWORD: EMAIL STEP */}
                {view === 'forgot-email' && (
                    <>
                        <div className="auth-header">
                            <h2>Password Recovery</h2>
                            <p>Enter your registered account email</p>
                        </div>
                        <form className="auth-form" onSubmit={handleForgotStart}>
                            <div className="input-group">
                                <label><Mail size={14}/> Registered Email</label>
                                <input type="email" required placeholder="name@domain.com" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} />
                            </div>
                            <button className="btn btn-primary" disabled={loading}>{loading ? 'Checking...' : 'Send Recovery OTP'}</button>
                            <button type="button" className="btn-text" onClick={() => setView('login')}><ArrowLeft size={14}/> Back to Selection</button>
                        </form>
                    </>
                )}

                {/* FORGOT PASSWORD: OTP STEP */}
                {view === 'forgot-otp' && (
                    <>
                        <div className="auth-header">
                            <h2>Verify Identity</h2>
                            <p>Enter the 6-digit reset code</p>
                        </div>
                        <form className="auth-form" onSubmit={handleVerifyOTP}>
                            <div className="otp-container">
                                {otpArray.map((data, index) => (
                                    <input 
                                        key={index} 
                                        type="text" 
                                        maxLength="1" 
                                        className="otp-box" 
                                        ref={(el) => (otpRefs.current[index] = el)} 
                                        value={data}
                                        onChange={(e) => handleOtpChange(e.target, index)} 
                                        onKeyDown={(e) => e.key === "Backspace" && !otpArray[index] && index > 0 && otpRefs.current[index - 1].focus()} 
                                    />
                                ))}
                            </div>
                            <div className="timer-wrapper">
                                {timer > 0 ? (
                                    <p className="timer-text">Request new code in: <span>{Math.floor(timer / 60)}:{String(timer % 60).padStart(2, '0')}</span></p>
                                ) : (
                                    <p className="resend-text">Didn't get it? <span className="resend-link" onClick={handleForgotStart}>Resend</span></p>
                                )}
                            </div>
                            <button className="btn btn-primary" disabled={loading}>
                                {loading ? <RefreshCw className="rotate" size={18}/> : 'Confirm & Next'}
                            </button>
                        </form>
                    </>
                )}

                {/* FORGOT PASSWORD: NEW PASSWORD STEP */}
                {view === 'forgot-reset' && (
                    <>
                        <div className="auth-header">
                            <h2>Set Credentials</h2>
                            <p>Update to a secure new password</p>
                        </div>
                        <form className="auth-form" onSubmit={handleResetPassword}>
                            <div className="input-group">
                                <label><Lock size={14}/> New Password</label>
                                <div className="pass-wrapper">
                                    <input 
                                        type={showPass ? "text" : "password"} 
                                        required 
                                        placeholder="Min. 8 characters" 
                                        onChange={(e) => handlePasswordChange(e.target.value)} 
                                    />
                                    <div className="pass-eye" onClick={() => setShowPass(!showPass)}>
                                        {showPass ? <EyeOff size={18}/> : <Eye size={18}/>}
                                    </div>
                                </div>
                                <div className="strength-meter">
                                    <div className="strength-bar" style={{ width: `${(strength.score / 4) * 100}%`, background: strength.color }}></div>
                                </div>
                                <small style={{color: strength.color}}>{strength.label}</small>
                            </div>
                            <div className="input-group">
                                <label><CheckCircle size={14}/> Confirm New Password</label>
                                <input 
                                    type="password" 
                                    required 
                                    placeholder="Repeat new password" 
                                    onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})} 
                                />
                            </div>
                            <button className="btn btn-primary" disabled={loading}>Update Account</button>
                        </form>
                    </>
                )}
            </div>
        </div>
    );
};

export default Login;