import React, { useState, useEffect } from 'react'

const ArticleEditor = ({ article, onSave }) => {
    const [title, setTitle] = useState('')
    const [author, setAuthor] = useState('')
    const [content, setContent] = useState('')

    useEffect(() => {
        if (article) {
            setTitle(article.title || '')
            setAuthor(article.author || '')
            setContent(article.content || '')
        } else {
            setTitle('')
            setAuthor('')
            setContent('')
        }
    }, [article])

    const save = () => {
        const payload = { id: article?.id, title, author, content, status: 'published', views: article?.views || 0 }
        // In a real app: call API to save. Here we notify parent.
        if (onSave) onSave(payload)
    }

    return (
        <div className="panel article-editor">
            <h2>{article ? 'Edit Article' : 'Create Article'}</h2>

            <div className="form-row">
                <label>Title</label>
                <input value={title} onChange={(e) => setTitle(e.target.value)} />
            </div>

            <div className="form-row">
                <label>Author</label>
                <input value={author} onChange={(e) => setAuthor(e.target.value)} />
            </div>

            <div className="form-row">
                <label>Content</label>
                <textarea value={content} onChange={(e) => setContent(e.target.value)} rows={8} />
            </div>

            <div className="form-actions">
                <button className="btn" onClick={save}>Save</button>
            </div>
        </div>
    )
}

export default ArticleEditor
