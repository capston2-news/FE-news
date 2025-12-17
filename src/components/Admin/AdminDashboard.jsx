import React, { useState, useMemo } from 'react'
import AdminHeader from './AdminHeader'
import ArticleList from './ArticleList'
import ArticleEditor from './ArticleEditor'
import UsersList from './UsersList'
import AdminSummary from './AdminSummary'
import './Admin.css'

const initialArticles = [
    { id: 1, title: 'Khoa học và công nghệ trong năm 2025', author: 'Nguyen A', status: 'published', views: 1200 },
    { id: 2, title: 'Kinh tế thế giới: Triển vọng', author: 'Tran B', status: 'draft', views: 300 },
    { id: 3, title: 'Thể thao: Vòng loại', author: 'Le C', status: 'published', views: 780 },
]

const initialUsers = [
    { id: 1, name: 'Nguyen A', role: 'editor' },
    { id: 2, name: 'Tran B', role: 'author' },
    { id: 3, name: 'Le C', role: 'admin' },
]

const AdminDashboard = () => {
    const [articles, setArticles] = useState(initialArticles)
    const [users, setUsers] = useState(initialUsers)
    const [selectedArticle, setSelectedArticle] = useState(null)
    const [view, setView] = useState('dashboard') // 'dashboard' | 'articles' | 'users' | 'editor'

    // article list controls
    const [search, setSearch] = useState('')
    const [page, setPage] = useState(1)
    const perPage = 5

    const handleDeleteArticle = (id) => {
        setArticles(prev => prev.filter(a => a.id !== id))
    }

    const handleSaveArticle = (data) => {
        if (data.id) {
            setArticles(prev => prev.map(a => a.id === data.id ? { ...a, ...data } : a))
        } else {
            const nextId = Math.max(0, ...articles.map(a => a.id)) + 1
            setArticles(prev => [{ id: nextId, ...data }, ...prev])
        }
        setSelectedArticle(null)
        setView('articles')
    }

    const handleDeleteUser = (id) => {
        setUsers(prev => prev.filter(u => u.id !== id))
    }

    const handleChangeUserRole = (id, role) => {
        setUsers(prev => prev.map(u => u.id === id ? { ...u, role } : u))
    }

    const totalViews = useMemo(() => articles.reduce((s, a) => s + (a.views || 0), 0), [articles])

    const filteredArticles = useMemo(() => {
        const q = search.trim().toLowerCase()
        if (!q) return articles
        return articles.filter(a => a.title.toLowerCase().includes(q) || (a.author || '').toLowerCase().includes(q))
    }, [articles, search])

    const totalPages = Math.max(1, Math.ceil(filteredArticles.length / perPage))
    const paginatedArticles = filteredArticles.slice((page - 1) * perPage, page * perPage)

    return (
        <div className="admin-root">
            <AdminHeader onNavigate={setView} />

            <div className="admin-body">
                <aside className="admin-sidebar">
                    <button onClick={() => setView('dashboard')} className="btn">Dashboard</button>
                    <button onClick={() => setView('articles')} className="btn">Articles</button>
                    <button onClick={() => { setSelectedArticle(null); setView('editor') }} className="btn">New Article</button>
                    <button onClick={() => setView('users')} className="btn">Users</button>
                </aside>

                <main className="admin-main">
                    {view === 'dashboard' && (
                        <>
                            <div className="dashboard-grid">
                                <div className="panel summary">
                                    <h3>Overview</h3>
                                    <div className="metrics">
                                        <div className="metric">
                                            <div className="label">Articles</div>
                                            <div className="value">{articles.length}</div>
                                        </div>
                                        <div className="metric">
                                            <div className="label">Users</div>
                                            <div className="value">{users.length}</div>
                                        </div>
                                        <div className="metric">
                                            <div className="label">Total Views</div>
                                            <div className="value">{totalViews}</div>
                                        </div>
                                    </div>
                                </div>

                                <div className="panel chart-panel">
                                    <AdminSummary articles={articles} />
                                </div>
                            </div>
                        </>
                    )}

                    {view === 'articles' && (
                        <>
                            <div className="flex-between" style={{ marginBottom: 12 }}>
                                <h2>Articles</h2>
                                <div>
                                    <input value={search} onChange={e => { setSearch(e.target.value); setPage(1) }} placeholder="Search title or author" style={{ padding: '6px 8px', borderRadius: 6, border: '1px solid #e5e7eb' }} />
                                    <button onClick={() => { setSearch(''); setPage(1) }} className="btn small" style={{ marginLeft: 8 }}>Clear</button>
                                </div>
                            </div>

                            <ArticleList articles={paginatedArticles} onEdit={(a) => { setSelectedArticle(a); setView('editor') }} onDelete={handleDeleteArticle} />

                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 12 }}>
                                <div className="muted">Showing {filteredArticles.length} result(s)</div>
                                <div>
                                    <button className="btn small" onClick={() => setPage(p => Math.max(1, p-1))} disabled={page === 1}>Prev</button>
                                    <span style={{ margin: '0 8px' }}>{page} / {totalPages}</span>
                                    <button className="btn small" onClick={() => setPage(p => Math.min(totalPages, p+1))} disabled={page === totalPages}>Next</button>
                                </div>
                            </div>
                        </>
                    )}

                    {view === 'editor' && (
                        <ArticleEditor article={selectedArticle} onSave={handleSaveArticle} />
                    )}

                    {view === 'users' && (
                        <UsersList users={users} onDelete={handleDeleteUser} onChangeRole={handleChangeUserRole} />
                    )}
                </main>
            </div>
        </div>
    )
}

export default AdminDashboard
