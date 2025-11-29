import React from 'react'

const AdminHeader = ({ onNavigate }) => {
    return (
        <header className="admin-header">
            <div className="brand">Admin Panel</div>
            <nav className="admin-nav">
                <button onClick={() => onNavigate('articles')} className="link">Articles</button>
                <button onClick={() => onNavigate('editor')} className="link">Create</button>
                <button onClick={() => onNavigate('users')} className="link">Users</button>
            </nav>
        </header>
    )
}

export default AdminHeader
