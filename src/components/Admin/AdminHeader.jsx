import React from 'react'
import { useAuth } from '../../context/AuthContext'
import { useNavigate } from 'react-router-dom'

const AdminHeader = ({ onNavigate }) => {
    const { user, logout } = useAuth()
    const navigate = useNavigate()

    const handleLogout = () => {
        logout()
        navigate('/login')
    }

    return (
        <header className="admin-header">
            <div className="brand">Admin Panel</div>
            <nav className="admin-nav">
                <button onClick={() => onNavigate('articles')} className="link">Articles</button>
                <button onClick={() => onNavigate('editor')} className="link">Create</button>
                <button onClick={() => onNavigate('users')} className="link">Users</button>
            </nav>

            <div className="admin-actions">
                <span className="username">Hi, {user?.username || 'Guest'}</span>
                <button onClick={handleLogout} className="link">Logout</button>
            </div>
        </header>
    )
}

export default AdminHeader
