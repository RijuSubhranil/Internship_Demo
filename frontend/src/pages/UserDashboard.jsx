import React, { useState, useEffect, useMemo } from 'react';
import { 
    Plus, Trash2, Loader2, X, LayoutGrid, Clock, 
    CheckCircle2, Activity, Search, Filter, AlertCircle 
} from 'lucide-react';
import api from '../utils/api';
import toast from 'react-hot-toast';
import '../styles/Dashboard.css';

const UserDashboard = () => {
    // Core States
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [deleteConfirmId, setDeleteConfirmId] = useState(null);
    
    // UI Functional States (Makes the code "Bigger" and Professional)
    const [searchQuery, setSearchQuery] = useState("");
    const [filterStatus, setFilterStatus] = useState("all");
    const [newTask, setNewTask] = useState({ title: '', description: '', status: 'pending' });

    useEffect(() => {
        fetchTasks();
    }, []);

    const fetchTasks = async () => {
        try {
            const res = await api.get('/tasks/my-tasks');
            setTasks(res.data.data);
        } catch (err) {
            toast.error("Cloud synchronization failed");
        } finally {
            setLoading(false);
        }
    };

    // --- LOGIC: STATUS CYCLING (THE CLICK HANDLER) ---
    const handleStatusCycle = async (task, e) => {
        // Stop event if clicking delete button or currently in delete mode
        if (e.target.closest('.delete-icon') || deleteConfirmId) return;

        const statusOrder = ['pending', 'in-progress', 'completed'];
        const currentIndex = statusOrder.indexOf(task.status);
        const nextStatus = statusOrder[(currentIndex + 1) % statusOrder.length];
        
        const loadToast = toast.loading(`Transitioning to ${nextStatus.replace('-', ' ')}...`);
        
        try {
            const res = await api.patch(`/tasks/${task._id}`, { status: nextStatus });
            setTasks(tasks.map(t => t._id === task._id ? res.data.data : t));
            toast.success(`Task is now ${nextStatus.toUpperCase()}`, { id: loadToast });
        } catch (err) {
            toast.error("Server synchronization error", { id: loadToast });
        }
    };

    const handleCreateTask = async (e) => {
        e.preventDefault();
        try {
            const res = await api.post('/tasks', newTask);
            setTasks([res.data.data, ...tasks]);
            toast.success("New record encrypted and stored!");
            setIsModalOpen(false);
            setNewTask({ title: '', description: '', status: 'pending' });
        } catch (err) {
            toast.error("Database write error");
        }
    };

    const finalDelete = async (id) => {
        try {
            await api.delete(`/tasks/${id}`);
            setTasks(tasks.filter(t => t._id !== id));
            toast.success("Record purged from system");
            setDeleteConfirmId(null);
        } catch (err) {
            toast.error("Unauthorized deletion attempt");
        }
    };

    // --- SEARCH & FILTER LOGIC ---
    const filteredTasks = useMemo(() => {
        return tasks.filter(task => {
            const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                                 task.description.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesFilter = filterStatus === "all" || task.status === filterStatus;
            return matchesSearch && matchesFilter;
        });
    }, [tasks, searchQuery, filterStatus]);

    const stats = {
        total: tasks.length,
        pending: tasks.filter(t => t.status === 'pending').length,
        active: tasks.filter(t => t.status === 'in-progress').length,
        done: tasks.filter(t => t.status === 'completed').length
    };

    return (
        <div className="dashboard-container">
            {/* 1. TOP LEVEL STATS PANEL */}
            <div className="stats-grid">
                <div className="stat-card glass-card">
                    <div className="stat-header"><h3>Storage Objects</h3><LayoutGrid size={18} color="#6366f1" /></div>
                    <div className="count gradient-text">{stats.total}</div>
                </div>
                <div className="stat-card glass-card">
                    <div className="stat-header"><h3>In Progress</h3><Activity size={18} color="#f59e0b" /></div>
                    <div className="count" style={{color: '#f59e0b'}}>{stats.active}</div>
                </div>
                <div className="stat-card glass-card">
                    <div className="stat-header"><h3>Completion</h3><CheckCircle2 size={18} color="#10b981" /></div>
                    <div className="count" style={{color: '#10b981'}}>
                        {stats.total > 0 ? Math.round((stats.done / stats.total) * 100) : 0}%
                    </div>
                </div>
            </div>

            {/* 2. CONTROL BAR (SEARCH & FILTER) */}
            <div className="control-bar glass-card">
                <div className="search-box">
                    <Search size={18} className="search-icon" />
                    <input 
                        type="text" 
                        placeholder="Search tasks or metadata..." 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                <div className="filter-group">
                    <Filter size={16} />
                    <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
                        <option value="all">All Records</option>
                        <option value="pending">Pending</option>
                        <option value="in-progress">In Progress</option>
                        <option value="completed">Completed</option>
                    </select>
                    <button className="btn btn-primary" onClick={() => setIsModalOpen(true)}>
                        <Plus size={18} /> New Record
                    </button>
                </div>
            </div>

            {/* 3. MAIN CONTENT GRID */}
            {loading ? (
                <div className="loader-zone">
                    <Loader2 className="rotate" size={45} color="#6366f1" />
                    <p>Securing Backend Connection...</p>
                </div>
            ) : (
                <>
                    {filteredTasks.length === 0 ? (
                        <div className="empty-state glass-card">
                            <AlertCircle size={40} />
                            <h3>No data found</h3>
                            <p>Try adjusting your search filters or add a new entry.</p>
                        </div>
                    ) : (
                        <div className="task-grid">
                            {filteredTasks.map(task => (
                                <div 
                                    key={task._id} 
                                    className={`task-card glass-card clickable-card status-border-${task.status} ${deleteConfirmId === task._id ? 'card-confirming' : ''}`}
                                    onClick={(e) => handleStatusCycle(task, e)}
                                >
                                    {/* DELETE CONFIRMATION OVERLAY */}
                                    {deleteConfirmId === task._id && (
                                        <div className="delete-overlay animate-fade-in">
                                            <p>Permanently Purge Record?</p>
                                            <div className="confirm-btns">
                                                <button className="confirm-yes" onClick={(e) => { e.stopPropagation(); finalDelete(task._id); }}>Delete</button>
                                                <button className="confirm-no" onClick={(e) => { e.stopPropagation(); setDeleteConfirmId(null); }}>Abort</button>
                                            </div>
                                        </div>
                                    )}

                                    <div className="task-info">
                                        <div className="card-top">
                                            <span className={`status-pill status-${task.status}`}>
                                                {task.status.replace('-', ' ')}
                                            </span>
                                            <span className="timestamp">ID: {task._id.slice(-6)}</span>
                                        </div>
                                        <h4>{task.title}</h4>
                                        <p>{task.description}</p>
                                    </div>
                                    
                                    <div className="task-footer">
                                        <div className="footer-left">
                                            <Clock size={12} /> {new Date(task.createdAt).toLocaleDateString()}
                                        </div>
                                        <div className="task-actions">
                                            <Trash2 
                                                size={18} 
                                                className="action-icon delete-icon" 
                                                onClick={(e) => { e.stopPropagation(); setDeleteConfirmId(task._id); }} 
                                            />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </>
            )}

            {/* 4. MODAL SYSTEM (FIXED DROPDOWN) */}
            {isModalOpen && (
                <div className="modal-overlay">
                    <div className="modal-card glass-card animate-slide-up">
                        <div className="modal-header">
                            <h3>Initialize New Record</h3>
                            <X className="close-x" onClick={() => setIsModalOpen(false)} />
                        </div>
                        <form className="auth-form" onSubmit={handleCreateTask}>
                            <div className="input-group">
                                <label>Record Name</label>
                                <input required placeholder="Task title..." onChange={e => setNewTask({...newTask, title: e.target.value})} />
                            </div>
                            <div className="input-group">
                                <label>Deployment Status</label>
                                <select className="glass-select" onChange={e => setNewTask({...newTask, status: e.target.value})}>
                                    <option value="pending">Pending</option>
                                    <option value="in-progress">In Progress</option>
                                    <option value="completed">Completed</option>
                                </select>
                            </div>
                            <div className="input-group">
                                <label>Technical Description</label>
                                <textarea className="task-textarea" rows="4" placeholder="Context details..." onChange={e => setNewTask({...newTask, description: e.target.value})} />
                            </div>
                            <button className="btn btn-primary full-width">Deploy to System</button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UserDashboard;