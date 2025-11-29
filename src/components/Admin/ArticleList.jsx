import React from 'react'

const ArticleList = ({ articles = [], onEdit, onDelete }) => {
    return (
        <div className="panel article-list">
            <div className="flex-between">
                <h2>Articles</h2>
                <div className="muted">{articles.length} items</div>
            </div>

            <table className="table">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Title</th>
                        <th>Author</th>
                        <th>Status</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {articles.map(a => (
                        <tr key={a.id}>
                            <td>{a.id}</td>
                            <td>{a.title}</td>
                            <td>{a.author}</td>
                            <td>{a.status}</td>
                            <td>
                                <button className="btn small" onClick={() => onEdit && onEdit(a)}>Edit</button>
                                <button className="btn small danger" onClick={() => onDelete && onDelete(a.id)}>Delete</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    )
}

export default ArticleList
