import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { RefreshCw, CheckCircle, Mail, ShieldCheck, UserCircle, Lock, Eye, EyeOff, ArrowLeft } from 'lucide-react';
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css'; 
import api from '../utils/api';
import toast from 'react-hot-toast';
import '../styles/Auth.css';

const Register = () => {
    const [step, setStep] = useState(1); // 1: Email, 2: OTP, 3: Profile
    const [loading, setLoading] = useState(false);
    const [timer, setTimer] = useState(0);
    const [showPass, setShowPass] = useState(false);
    const [strength, setStrength] = useState({ score: 0, label: 'Weak', color: '#ff4d4d' });
    const navigate = useNavigate();

    const otpRefs = useRef([]);
    const [otpArray, setOtpArray] = useState(new Array(6).fill(""));
    const [formData, setFormData] = useState({
        email: '', otp: '', name: '', password: '', countryCode: 'in', phoneNumber: ''
    });

    // Countdown Timer Logic
    useEffect(() => {
        let interval;
        if (timer > 0) {
            interval = setInterval(() => setTimer((prev) => prev - 1), 1000);
        }
        return () => clearInterval(interval);
    }, [timer]);

    // Password Strength Logic
    const handlePasswordChange = (val) => {
        setFormData({ ...formData, password: val });
        let score = 0;
        if (val.length >= 8) score++;
        if (/[A-Z]/.test(val)) score++;
        if (/[0-9]/.test(val)) score++;
        if (/[^A-Za-z0-9]/.test(val)) score++;

        const levels = [
            { label: 'Very Weak', color: '#ff4d4d' },
            { label: 'Weak', color: '#ffa500' },
            { label: 'Medium', color: '#ffff00' },
            { label: 'Strong', color: '#00ff00' },
            { label: 'Excellent', color: '#00e6e6' }
        ];
        setStrength({ score, ...levels[score] });
    };

    // OTP Navigation Logic
    const handleOtpChange = (element, index) => {
        if (isNaN(element.value)) return false;
        const newOtp = [...otpArray];
        newOtp[index] = element.value;
        setOtpArray(newOtp);
        setFormData({ ...formData, otp: newOtp.join("") });
        if (element.value !== "" && index < 5) otpRefs.current[index + 1].focus();
    };

    // STEP 1: START REGISTRATION
    const handleEmailSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await api.post('/auth/register-start', { email: formData.email });
            toast.success('OTP sent to your inbox');
            setStep(2);
            setTimer(120); // 2 Minute countdown
        } catch (err) {
            toast.error(err.response?.data?.message || 'Verification failed');
        } finally { setLoading(false); }
    };

    // STEP 2: VERIFY OTP
    const handleVerifyOTP = async (e) => {
        e.preventDefault();
        const fullOtp = otpArray.join("");
        if (fullOtp.length !== 6) return toast.error("Please enter 6-digit code");
        
        setLoading(true);
        try {
            await api.post('/auth/verify-otp', { email: formData.email, otp: fullOtp });
            toast.success("Identity Verified");
            setStep(3);
        } catch (err) {
            toast.error(err.response?.data?.message || 'Invalid or Expired OTP');
        } finally { setLoading(false); }
    };

    // RESEND OTP LOGIC
    const handleResendOTP = async () => {
        if (timer > 0) return;
        try {
            await api.post('/auth/resend-otp', { email: formData.email });
            toast.success('New code sent');
            setTimer(120);
            setOtpArray(new Array(6).fill(""));
        } catch (err) { toast.error('Error resending OTP'); }
    };

    // STEP 3: COMPLETE PROFILE
    const handleFinalSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await api.post('/auth/register-complete', {
                ...formData,
                countryCode: formData.countryCode.toUpperCase()
            });
            sessionStorage.setItem('token', res.data.token);
            sessionStorage.setItem('user', JSON.stringify({ email: formData.email, name: formData.name }));
            toast.success('Registration Complete!');
            navigate('/dashboard');
            window.location.reload();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Profile setup failed');
        } finally { setLoading(false); }
    };

    return (
        <div className="auth-container">
            <div className="auth-card glass-card">
                
                {/* STEP INDICATOR */}
                <div className="step-indicator">
                    <div className={`step ${step >= 1 ? 'active' : ''}`}>
                        <div className="step-num">{step > 1 ? <CheckCircle size={14}/> : 1}</div>
                        <span>Email</span>
                    </div>
                    <div className="step-line"></div>
                    <div className={`step ${step >= 2 ? 'active' : ''}`}>
                        <div className="step-num">{step > 2 ? <CheckCircle size={14}/> : 2}</div>
                        <span>Verify</span>
                    </div>
                    <div className="step-line"></div>
                    <div className={`step ${step >= 3 ? 'active' : ''}`}>
                        <div className="step-num">3</div>
                        <span>Profile</span>
                    </div>
                </div>

                {/* STEP 1: EMAIL */}
                {step === 1 && (
                    <form className="auth-form" onSubmit={handleEmailSubmit}>
                        <div className="auth-header"><h2>Welcome</h2><p>Verify your email to continue</p></div>
                        <div className="input-group">
                            <label><Mail size={14}/> Business Email</label>
                            <input type="email" required placeholder="name@company.com" 
                                value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} />
                        </div>
                        <button className="btn btn-primary" disabled={loading}>
                            {loading ? <RefreshCw className="rotate" size={18}/> : 'Get OTP'}
                        </button>
                    </form>
                )}

                {step === 2 && (
                    <form className="auth-form" onSubmit={handleVerifyOTP}>
                        <div className="auth-header"><h2>Security Check</h2><p>Enter the 6-digit code</p></div>
                        <div className="otp-container">
                            {otpArray.map((data, index) => (
                                <input key={index} type="text" maxLength="1" className="otp-box" 
                                    ref={(el) => (otpRefs.current[index] = el)} value={data}
                                    onChange={(e) => handleOtpChange(e.target, index)}
                                    onKeyDown={(e) => e.key === "Backspace" && !otpArray[index] && index > 0 && otpRefs.current[index - 1].focus()}
                                />
                            ))}
                        </div>
                        
                        {/* TIMER DISPLAY */}
                        <div className="timer-wrapper">
                            {timer > 0 ? (
                                <p className="timer-text">Code expires in <span>{Math.floor(timer / 60)}:{String(timer % 60).padStart(2, '0')}</span></p>
                            ) : (
                                <p className="resend-text">Didn't receive code? <span className="resend-link" onClick={handleResendOTP}>Resend OTP</span></p>
                            )}
                        </div>

                        <button className="btn btn-primary" disabled={loading}>
                            {loading ? <RefreshCw className="rotate" size={18}/> : 'Verify & Continue'}
                        </button>
                        <button type="button" className="btn-text" onClick={() => setStep(1)}><ArrowLeft size={14}/> Change Email</button>
                    </form>
                )}

                {step === 3 && (
                    <form className="auth-form" onSubmit={handleFinalSubmit}>
                        <div className="auth-header"><h2>Setup Profile</h2><p>Finalize your account access</p></div>
                        
                        <div className="input-group">
                            <label><UserCircle size={14}/> Full Name</label>
                            <input type="text" required placeholder="Enter full name" 
                                onChange={(e) => setFormData({...formData, name: e.target.value})} />
                        </div>

                        <div className="input-group">
                            <label><Lock size={14}/> Password</label>
                            <div className="pass-wrapper">
                                <input type={showPass ? "text" : "password"} required placeholder="••••••••" 
                                    value={formData.password} onChange={(e) => handlePasswordChange(e.target.value)} />
                                <div className="pass-eye" onClick={() => setShowPass(!showPass)}>
                                    {showPass ? <EyeOff size={18}/> : <Eye size={18}/>}
                                </div>
                            </div>
                            <div className="strength-meter">
                                <div className="strength-bar" style={{ width: `${(strength.score / 4) * 100}%`, background: strength.color }}></div>
                            </div>
                            <small style={{ color: strength.color }}>Strength: {strength.label}</small>
                        </div>

                        <div className="input-group">
                            <label>Mobile Number</label>
                            <PhoneInput
                                country={'in'}
                                value={formData.phoneNumber}
                                onChange={(phone, country) => setFormData({
                                    ...formData, 
                                    phoneNumber: phone, 
                                    countryCode: country.countryCode
                                })}
                                containerClass="phone-container-custom"
                                inputClass="phone-input-custom"
                                buttonClass="phone-button-custom"
                                dropdownClass="phone-dropdown-custom"
                            />
                        </div>

                        <button className="btn btn-primary" disabled={loading}>Finish Registration</button>
                    </form>
                )}
                <div className="auth-footer">Already have an account? <span onClick={() => navigate('/login')}>Sign In</span></div>
            </div>
        </div>
    );
};

export default Register;