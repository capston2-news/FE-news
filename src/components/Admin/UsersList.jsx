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
                            <button className="btn small">Edit</button>
                            <button className="btn small danger" onClick={() => onDelete && onDelete(u.id)}>Remove</button>
                        </div>
                    </li>
                ))}
            </ul>
        </div>
    )
}

export default UsersList
