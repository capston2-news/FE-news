import React from 'react'

const UsersList = ({ users = [], onDelete }) => {
    return (
        <div className="panel users-list">
            <div className="flex-between">
                <h2>Users</h2>
                <div className="muted">{users.length} members</div>
            </div>
            <ul>
                {users.map(u => (
                    <li key={u.id} className="user-item">
                        <div>
                            <strong>{u.name}</strong>
                            <div className="muted">{u.role}</div>
                        </div>

                        <div className="user-actions">
                            <select value={u.role} onChange={(e) => onChangeRole && onChangeRole(u.id, e.target.value)} style={{ padding: '6px 8px', borderRadius: 6 }}>
                                <option value="admin">admin</option>
                                <option value="editor">editor</option>
                                <option value="author">author</option>
                                <option value="user">user</option>
                            </select>
                            <button className="btn small danger" onClick={() => onDelete && onDelete(u.id)} style={{ marginLeft: 8 }}>Remove</button>
                        </div>
                    </li>
                ))}
            </ul>
        </div>
    )
}

export default UsersList
