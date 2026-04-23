import React, { useState, useEffect } from 'react';
import { User, Mail, ShieldCheck, RefreshCw, Save, Phone, Fingerprint, Loader2 } from 'lucide-react'; // Added Loader2 here
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';
import api from '../utils/api';
import toast from 'react-hot-toast';
import '../styles/Profile.css';

const Profile = () => {
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);
    const [formData, setFormData] = useState({
        name: '', email: '', phoneNumber: '', countryCode: 'in'
    });

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            const res = await api.get('/auth/me');
            const user = res.data.data.user;
            setFormData({
                name: user.name,
                email: user.email,
                phoneNumber: user.phoneNumber || '',
                countryCode: (user.countryCode || 'in').toLowerCase()
            });
        } catch (err) {
            toast.error("Failed to load profile data");
        } finally {
            setLoading(false);
        }
    };

    const handleUpdate = async (e) => {
        e.preventDefault();
        setUpdating(true);
        try {
            const res = await api.patch('/auth/update-me', {
                name: formData.name,
                phoneNumber: formData.phoneNumber,
                countryCode: formData.countryCode.toUpperCase()
            });
            // Update session storage to sync with Header UI
            sessionStorage.setItem('user', JSON.stringify(res.data.data.user));
            toast.success("Identity Updated Successfully");
        } catch (err) {
            toast.error(err.response?.data?.message || "Update failed");
        } finally {
            setUpdating(false);
        }
    };

    // This is where the Loader2 error was happening
    if (loading) {
        return (
            <div className="loader-zone">
                <Loader2 className="rotate" size={40} color="#6366f1" />
                <p style={{ marginTop: '10px', color: '#888' }}>Syncing Profile Data...</p>
            </div>
        );
    }

    return (
        <div className="dashboard-container">
            <div className="dashboard-header" style={{ marginBottom: '40px' }}>
                <div>
                    <h2 className="gradient-text">Account Settings</h2>
                    <p style={{ color: '#888' }}>Securely manage your professional profile</p>
                </div>
            </div>

            <div className="profile-layout">
                {/* LEFT: INFO CARD */}
                <div className="glass-card profile-sidebar">
                    <div className="profile-avatar-large">
                        <User size={50} color="#6366f1" />
                    </div>
                    <h3>{formData.name}</h3>
                    <span className="role-badge">Verified Account</span>
                    <div className="info-stack">
                        <div className="info-item"><Mail size={14} /> {formData.email}</div>
                        <div className="info-item"><ShieldCheck size={14} /> Encryption: AES-256</div>
                    </div>
                </div>

                {/* RIGHT: EDIT FORM */}
                <div className="glass-card profile-main">
                    <form className="auth-form" onSubmit={handleUpdate}>
                        <div className="form-section-title">
                            <Fingerprint size={18} /> Basic Information
                        </div>
                        
                        <div className="input-group">
                            <label>Full Name</label>
                            <input 
                                type="text" 
                                required 
                                value={formData.name} 
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })} 
                            />
                        </div>

                        <div className="input-group">
                            <label>Registered Email (Read Only)</label>
                            <input 
                                type="email" 
                                value={formData.email} 
                                disabled 
                                className="disabled-input" 
                            />
                            <small style={{ color: '#666' }}>Email modification is disabled for security.</small>
                        </div>

                        <div className="form-section-title" style={{ marginTop: '20px' }}>
                            <Phone size={18} /> Contact Details
                        </div>
                        
                        <div className="input-group">
                            <label>Mobile Number</label>
                            <PhoneInput
                                country={formData.countryCode}
                                value={formData.phoneNumber}
                                onChange={(phone, country) => setFormData({
                                    ...formData, 
                                    phoneNumber: phone, 
                                    countryCode: country.countryCode 
                                })}
                                containerClass="phone-container-custom"
                                inputClass="phone-input-custom"
                                dropdownClass="phone-dropdown-custom"
                            />
                        </div>

                        <button className="btn btn-primary" disabled={updating} style={{ marginTop: '30px' }}>
                            {updating ? (
                                <RefreshCw className="rotate" size={18} />
                            ) : (
                                <><Save size={18} style={{ marginRight: '8px' }} /> Update Identity</>
                            )}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Profile;