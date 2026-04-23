import React, { useState, useEffect } from 'react';
import { ShieldCheck, Users, Database, Loader2, Trash2, LayoutGrid, UserPlus } from 'lucide-react';
import api from '../utils/api';
import toast from 'react-hot-toast';
import '../styles/Dashboard.css';

const AdminDashboard = () => {
    const [allTasks, setAllTasks] = useState([]);
    const [allUsers, setAllUsers] = useState([]);
    const [activeTab, setActiveTab] = useState('tasks'); // 'tasks' or 'users'
    const [loading, setLoading] = useState(true);
    const [deleteConfirmId, setDeleteConfirmId] = useState(null);

    useEffect(() => {
        fetchAllData();
    }, []);

    const fetchAllData = async () => {
        setLoading(true);
        try {
            const [taskRes, userRes] = await Promise.all([
                api.get('/tasks/admin/all-tasks'),
                api.get('/auth/all-users')
            ]);
            setAllTasks(taskRes.data.data);
            setAllUsers(userRes.data.data);
        } catch (err) {
            toast.error("Restricted: Admin JWT required");
        } finally {
            setLoading(false);
        }
    };

    const handleUserDelete = async (userId) => {
        try {
            await api.delete(`/auth/${userId}`);
            setAllUsers(allUsers.filter(u => u._id !== userId));
            toast.success("User removed from system");
            setDeleteConfirmId(null);
        } catch (err) {
            toast.error("Failed to delete user");
        }
    };

    const handleTaskDelete = async (taskId) => {
        try {
            await api.delete(`/tasks/${taskId}`);
            setAllTasks(allTasks.filter(t => t._id !== taskId));
            toast.success("Record purged");
            setDeleteConfirmId(null);
        } catch (err) {
            toast.error("Action failed");
        }
    };

    return (
        <div className="dashboard-container">
            <div className="dashboard-header">
                <div>
                    <h2 className="gradient-text">Administrator Console</h2>
                    <p style={{ color: '#888' }}>System oversight and account management</p>
                </div>
            </div>

            {/* ADMIN STATS */}
            <div className="stats-grid">
                <div className="stat-card glass-card">
                    <ShieldCheck size={24} color="#6366f1" />
                    <h3>Global Records</h3>
                    <div className="count">{allTasks.length}</div>
                </div>
                <div className="stat-card glass-card">
                    <Users size={24} color="#ec4899" />
                    <h3>Registered Users</h3>
                    <div className="count">{allUsers.length}</div>
                </div>
            </div>

            {/* TAB SYSTEM */}
            <div className="login-tabs" style={{ marginBottom: '20px', maxWidth: '400px' }}>
                <button className={`tab-btn ${activeTab === 'tasks' ? 'active' : ''}`} onClick={() => setActiveTab('tasks')}>
                    <LayoutGrid size={14} /> Task Monitor
                </button>
                <button className={`tab-btn ${activeTab === 'users' ? 'active' : ''}`} onClick={() => setActiveTab('users')}>
                    <Users size={14} /> Manage Users
                </button>
            </div>

            {loading ? (
                <div className="loader-zone"><Loader2 className="rotate" size={40} color="#ec4899" /></div>
            ) : (
                <div className="table-container glass-card">
                    {activeTab === 'tasks' ? (
                        <table className="admin-table">
                            <thead>
                                <tr>
                                    <th>Account Holder</th>
                                    <th>Task Title</th>
                                    <th>Status</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {allTasks.map(task => (
                                    <tr key={task._id}>
                                        <td>
                                            <div className="owner-cell">
                                                <span className="owner-name">{task.user?.name || 'Unknown'}</span>
                                                <span className="owner-email">{task.user?.email}</span>
                                            </div>
                                        </td>
                                        <td>{task.title}</td>
                                        <td><span className={`status-badge status-${task.status}`}>{task.status}</span></td>
                                        <td>
                                            {deleteConfirmId === task._id ? (
                                                <div className="inline-confirm">
                                                    <button onClick={() => handleTaskDelete(task._id)} className="confirm-yes">Purge</button>
                                                    <button onClick={() => setDeleteConfirmId(null)} className="confirm-no">X</button>
                                                </div>
                                            ) : (
                                                <Trash2 size={16} className="action-icon delete-icon" onClick={() => setDeleteConfirmId(task._id)} />
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    ) : (
                        <table className="admin-table">
                            <thead>
                                <tr>
                                    <th>User Identity</th>
                                    <th>Contact</th>
                                    <th>Verified</th>
                                    <th>Work Count</th>
                                    <th>Management</th>
                                </tr>
                            </thead>
                            <tbody>
                                {allUsers.map(user => (
                                    <tr key={user._id}>
                                        <td>
                                            <div className="owner-cell">
                                                <span className="owner-name">{user.name}</span>
                                                <span className="role-badge" style={{ padding: '2px 8px', fontSize: '0.6rem' }}>{user.role}</span>
                                            </div>
                                        </td>
                                        <td>{user.email}</td>
                                        <td>{user.isEmailVerified ? <span style={{ color: '#10b981' }}>Yes</span> : <span style={{ color: '#ef4444' }}>No</span>}</td>
                                        <td>
                                            <div className="count-pill">
                                                {allTasks.filter(t => t.user?._id === user._id).length} Tasks
                                            </div>
                                        </td>
                                        <td>
                                            {user.role !== 'admin' && (
                                                deleteConfirmId === user._id ? (
                                                    <div className="inline-confirm">
                                                        <button onClick={() => handleUserDelete(user._id)} className="confirm-yes">Confirm</button>
                                                        <button onClick={() => setDeleteConfirmId(null)} className="confirm-no">X</button>
                                                    </div>
                                                ) : (
                                                    <Trash2 size={16} className="action-icon delete-icon" onClick={() => setDeleteConfirmId(user._id)} />
                                                )
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            )}
        </div>
    );
};

export default AdminDashboard;