import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import {
    ClipboardList, DollarSign,
    CheckCircle, XCircle, Clock,
    LogOut, TrendingUp, TrendingDown
} from 'lucide-react'
import api from '../../services/api'

export default function CoordinatorDashboard() {
    const { member, logout } = useAuth()
    const navigate = useNavigate()
    const [summary, setSummary] = useState(null)
    const [pending, setPending] = useState([])
    const [loading, setLoading] = useState(true)
    const [activeTab, setActiveTab] = useState('home')
    const [reviewing, setReviewing] = useState(null)

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [summaryRes, pendingRes] = await Promise.all([
                    api.get('/expenses/summary'),
                    api.get('/excuses/pending')
                ])
                setSummary(summaryRes.data.data)
                setPending(pendingRes.data.data)
            } catch (err) {
                console.error(err)
            } finally {
                setLoading(false)
            }
        }
        fetchData()
    }, [])

    const handleReview = async (excuseId, decision) => {
        setReviewing(excuseId)
        try {
            await api.post('/excuses/review', { excuseId, decision })
            setPending(prev => prev.filter(e => e.id !== excuseId))
        } catch (err) {
            console.error(err)
        } finally {
            setReviewing(null)
        }
    }

    const handleLogout = () => {
        logout()
        navigate('/login')
    }

    const tabs = [
        { key: 'home', label: 'Overview', icon: TrendingUp },
        { key: 'excuses', label: 'Excuses', icon: ClipboardList },
        { key: 'expenses', label: 'Expenses', icon: DollarSign },
    ]

    if (loading) {
        return (
            <div style={{
                minHeight: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                color: '#8fa396'
            }}>
                Loading...
            </div>
        )
    }

    return (
        <div style={{
            minHeight: '100vh',
            background: '#f2f4f7',
            fontFamily: "'Plus Jakarta Sans', sans-serif",
            maxWidth: '390px',
            margin: '0 auto',
            paddingBottom: '90px'
        }}>

            {/* TOP BAR */}
            <div style={{
                background: '#ffffff',
                padding: '52px 20px 16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
            }}>
                <div>
                    <div style={{ fontSize: '0.78rem', color: '#8fa396', marginBottom: '2px' }}>
                        Coordinator Portal
                    </div>
                    <div style={{ fontSize: '1.2rem', fontWeight: 700, color: '#0d1b12' }}>
                        Hello, <span style={{ color: '#008751' }}>{member?.first_name}</span>
                    </div>
                </div>
                <button
                    onClick={handleLogout}
                    style={{
                        background: '#fff0f0',
                        border: 'none',
                        borderRadius: '10px',
                        padding: '8px 12px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        color: '#e53e3e',
                        fontFamily: "'Plus Jakarta Sans', sans-serif"
                    }}
                >
                    <LogOut size={14} color="#e53e3e" />
                    Sign Out
                </button>
            </div>

            <div style={{ padding: '16px 20px 0' }}>

                {/* OVERVIEW TAB */}
                {activeTab === 'home' && summary && (
                    <>
                        {/* TREASURY SUMMARY */}
                        <div style={{ marginBottom: '14px' }}>
                            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#8fa396', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: '10px' }}>
                                Treasury
                            </div>

                            {/* BALANCE */}
                            <div style={{
                                background: '#008751',
                                borderRadius: '18px',
                                padding: '20px',
                                marginBottom: '10px'
                            }}>
                                <div style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.7)', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: '6px' }}>
                                    Current Balance
                                </div>
                                <div style={{ fontSize: '2rem', fontWeight: 800, color: 'white', lineHeight: 1 }}>
                                    ₦{summary.balance.toLocaleString()}
                                </div>
                                <div style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.6)', marginTop: '6px' }}>
                                    Treasurer should be holding this amount
                                </div>
                            </div>

                            {/* INCOME + EXPENSES */}
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                                <div style={{
                                    background: '#ffffff',
                                    borderRadius: '14px',
                                    padding: '16px',
                                    boxShadow: '0 2px 12px rgba(0,0,0,0.07)'
                                }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
                                        <TrendingUp size={14} color="#008751" />
                                        <div style={{ fontSize: '0.68rem', fontWeight: 600, color: '#8fa396', textTransform: 'uppercase' }}>
                                            Income
                                        </div>
                                    </div>
                                    <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#008751' }}>
                                        ₦{summary.total_income.toLocaleString()}
                                    </div>
                                </div>
                                <div style={{
                                    background: '#ffffff',
                                    borderRadius: '14px',
                                    padding: '16px',
                                    boxShadow: '0 2px 12px rgba(0,0,0,0.07)'
                                }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
                                        <TrendingDown size={14} color="#e53e3e" />
                                        <div style={{ fontSize: '0.68rem', fontWeight: 600, color: '#8fa396', textTransform: 'uppercase' }}>
                                            Expenses
                                        </div>
                                    </div>
                                    <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#e53e3e' }}>
                                        ₦{summary.total_expenses.toLocaleString()}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* PENDING EXCUSES SUMMARY */}
                        <div style={{
                            background: '#ffffff',
                            borderRadius: '14px',
                            padding: '16px',
                            boxShadow: '0 2px 12px rgba(0,0,0,0.07)',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px',
                            cursor: 'pointer'
                        }}
                            onClick={() => setActiveTab('excuses')}
                        >
                            <div style={{
                                width: '44px',
                                height: '44px',
                                background: pending.length > 0 ? '#fff8e6' : '#e6f4ee',
                                borderRadius: '12px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}>
                                <ClipboardList size={20} color={pending.length > 0 ? '#d4900a' : '#008751'} />
                            </div>
                            <div style={{ flex: 1 }}>
                                <div style={{ fontSize: '0.88rem', fontWeight: 600, color: '#0d1b12' }}>
                                    Excuse Requests
                                </div>
                                <div style={{ fontSize: '0.72rem', color: '#8fa396' }}>
                                    {pending.length} pending review
                                </div>
                            </div>
                            <div style={{
                                background: pending.length > 0 ? '#fff8e6' : '#e6f4ee',
                                color: pending.length > 0 ? '#d4900a' : '#008751',
                                fontSize: '0.8rem',
                                fontWeight: 700,
                                padding: '4px 10px',
                                borderRadius: '20px'
                            }}>
                                {pending.length}
                            </div>
                        </div>
                    </>
                )}

                {/* EXCUSES TAB */}
                {activeTab === 'excuses' && (
                    <>
                        <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#8fa396', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: '10px' }}>
                            Pending Excuse Requests
                        </div>

                        {pending.length === 0 && (
                            <div style={{
                                background: '#ffffff',
                                borderRadius: '18px',
                                padding: '40px 20px',
                                textAlign: 'center',
                                boxShadow: '0 2px 12px rgba(0,0,0,0.07)'
                            }}>
                                <CheckCircle size={32} color="#c2e0cf" style={{ marginBottom: '8px' }} />
                                <div style={{ fontSize: '0.88rem', fontWeight: 600, color: '#0d1b12' }}>
                                    All caught up
                                </div>
                                <div style={{ fontSize: '0.75rem', color: '#8fa396', marginTop: '4px' }}>
                                    No pending excuse requests
                                </div>
                            </div>
                        )}

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                            {pending.map(excuse => (
                                <div
                                    key={excuse.id}
                                    style={{
                                        background: '#ffffff',
                                        borderRadius: '14px',
                                        padding: '16px',
                                        boxShadow: '0 2px 12px rgba(0,0,0,0.07)'
                                    }}
                                >
                                    {/* MEMBER INFO */}
                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                                        <div>
                                            <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#0d1b12' }}>
                                                {excuse.first_name} {excuse.last_name}
                                            </div>
                                            <div style={{ fontSize: '0.72rem', color: '#8fa396' }}>
                                                {excuse.state_code}
                                            </div>
                                        </div>
                                        <div style={{
                                            background: '#fff8e6',
                                            color: '#d4900a',
                                            fontSize: '0.65rem',
                                            fontWeight: 600,
                                            padding: '4px 8px',
                                            borderRadius: '20px'
                                        }}>
                                            Pending
                                        </div>
                                    </div>

                                    {/* MEETING */}
                                    <div style={{ fontSize: '0.75rem', color: '#4a5e52', marginBottom: '8px' }}>
                                        📅 {excuse.meeting_title} · {excuse.meeting_date}
                                    </div>

                                    {/* REASON */}
                                    <div style={{
                                        background: '#f2f4f7',
                                        borderRadius: '10px',
                                        padding: '10px 12px',
                                        fontSize: '0.8rem',
                                        color: '#4a5e52',
                                        marginBottom: '12px',
                                        lineHeight: 1.5
                                    }}>
                                        {excuse.reason}
                                    </div>

                                    {/* EVIDENCE LINK */}
                                    {excuse.evidence_url && (
                                        <a
                                            href={excuse.evidence_url}
                                            target="_blank"
                                            rel="noreferrer"
                                            style={{
                                                display: 'inline-flex',
                                                alignItems: 'center',
                                                gap: '4px',
                                                fontSize: '0.72rem',
                                                color: '#008751',
                                                fontWeight: 600,
                                                textDecoration: 'none',
                                                marginBottom: '12px'
                                            }}
                                        >
                                            View Evidence →
                                        </a>
                                    )}

                                    {/* ACTIONS */}
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                                        <button
                                            onClick={() => handleReview(excuse.id, 'approved')}
                                            disabled={reviewing === excuse.id}
                                            style={{
                                                background: '#e6f4ee',
                                                border: 'none',
                                                borderRadius: '10px',
                                                padding: '10px',
                                                cursor: 'pointer',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                gap: '6px',
                                                fontSize: '0.78rem',
                                                fontWeight: 600,
                                                color: '#008751',
                                                fontFamily: "'Plus Jakarta Sans', sans-serif"
                                            }}
                                        >
                                            <CheckCircle size={14} color="#008751" />
                                            Approve
                                        </button>
                                        <button
                                            onClick={() => handleReview(excuse.id, 'rejected')}
                                            disabled={reviewing === excuse.id}
                                            style={{
                                                background: '#fff0f0',
                                                border: 'none',
                                                borderRadius: '10px',
                                                padding: '10px',
                                                cursor: 'pointer',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                gap: '6px',
                                                fontSize: '0.78rem',
                                                fontWeight: 600,
                                                color: '#e53e3e',
                                                fontFamily: "'Plus Jakarta Sans', sans-serif"
                                            }}
                                        >
                                            <XCircle size={14} color="#e53e3e" />
                                            Reject
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </>
                )}

                {/* EXPENSES TAB */}
                {activeTab === 'expenses' && (
                    <ExpensesTab summary={summary} />
                )}

            </div>

            {/* BOTTOM NAV */}
            <nav style={{
                position: 'fixed',
                bottom: 0,
                left: '50%',
                transform: 'translateX(-50%)',
                width: '100%',
                maxWidth: '390px',
                background: '#ffffff',
                borderTop: '1px solid #e8ece9',
                display: 'flex',
                padding: '10px 0 24px',
                zIndex: 100,
                boxShadow: '0 -4px 20px rgba(0,0,0,0.06)'
            }}>
                {tabs.map(tab => {
                    const Icon = tab.icon
                    const isActive = activeTab === tab.key
                    return (
                        <div
                            key={tab.key}
                            onClick={() => setActiveTab(tab.key)}
                            style={{
                                flex: 1,
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                gap: '4px',
                                cursor: 'pointer'
                            }}
                        >
                            <div style={{
                                width: '32px',
                                height: '32px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                background: isActive ? '#e6f4ee' : 'transparent',
                                borderRadius: '8px'
                            }}>
                                <Icon size={18} color={isActive ? '#008751' : '#8fa396'} />
                            </div>
                            <div style={{
                                fontSize: '0.58rem',
                                fontWeight: 600,
                                color: isActive ? '#008751' : '#8fa396',
                                textTransform: 'uppercase',
                                letterSpacing: '0.5px'
                            }}>
                                {tab.label}
                            </div>
                        </div>
                    )
                })}
            </nav>
        </div>
    )
}

function ExpensesTab({ summary }) {
    const [form, setForm] = useState({ amount: '', description: '' })
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [expenses, setExpenses] = useState(summary?.expenses || [])

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)
        setError('')
        try {
            const result = await api.post('/expenses', {
                amount: parseInt(form.amount),
                description: form.description
            })
            setExpenses(prev => [result.data.data.expense, ...prev])
            setForm({ amount: '', description: '' })
        } catch (err) {
            setError(err.response?.data?.message || 'Something went wrong')
        } finally {
            setLoading(false)
        }
    }

    const inputStyle = {
        width: '100%',
        background: '#f2f4f7',
        border: 'none',
        borderRadius: '12px',
        padding: '14px 16px',
        fontSize: '0.88rem',
        color: '#0d1b12',
        outline: 'none',
        fontFamily: "'Plus Jakarta Sans', sans-serif"
    }

    const labelStyle = {
        display: 'block',
        fontSize: '0.68rem',
        fontWeight: 600,
        color: '#4a5e52',
        textTransform: 'uppercase',
        letterSpacing: '0.8px',
        marginBottom: '8px'
    }

    return (
        <>
            {/* LOG EXPENSE FORM */}
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#8fa396', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: '10px' }}>
                Log Expense
            </div>

            <div style={{
                background: '#ffffff',
                borderRadius: '18px',
                padding: '20px',
                boxShadow: '0 2px 12px rgba(0,0,0,0.07)',
                marginBottom: '14px'
            }}>
                {error && (
                    <div style={{
                        background: '#fff0f0',
                        color: '#e53e3e',
                        fontSize: '0.8rem',
                        padding: '12px 16px',
                        borderRadius: '12px',
                        marginBottom: '16px',
                        fontWeight: 500
                    }}>
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <div style={{ marginBottom: '14px' }}>
                        <label style={labelStyle}>Amount (₦)</label>
                        <input
                            type="number"
                            value={form.amount}
                            onChange={e => setForm({ ...form, amount: e.target.value })}
                            placeholder="e.g. 5000"
                            required
                            style={inputStyle}
                        />
                    </div>
                    <div style={{ marginBottom: '16px' }}>
                        <label style={labelStyle}>Description</label>
                        <input
                            type="text"
                            value={form.description}
                            onChange={e => setForm({ ...form, description: e.target.value })}
                            placeholder="e.g. Printing — clearance slips"
                            required
                            style={inputStyle}
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={loading}
                        style={{
                            width: '100%',
                            background: loading ? '#c2e0cf' : '#008751',
                            color: 'white',
                            border: 'none',
                            borderRadius: '12px',
                            padding: '14px',
                            fontSize: '0.88rem',
                            fontWeight: 700,
                            cursor: loading ? 'not-allowed' : 'pointer',
                            fontFamily: "'Plus Jakarta Sans', sans-serif"
                        }}
                    >
                        {loading ? 'Logging...' : 'Log Expense'}
                    </button>
                </form>
            </div>

            {/* EXPENSE LIST */}
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#8fa396', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: '10px' }}>
                Expense History
            </div>

            {expenses.length === 0 && (
                <div style={{
                    background: '#ffffff',
                    borderRadius: '14px',
                    padding: '24px',
                    textAlign: 'center',
                    boxShadow: '0 2px 12px rgba(0,0,0,0.07)',
                    fontSize: '0.82rem',
                    color: '#8fa396'
                }}>
                    No expenses logged yet
                </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {expenses.map(expense => (
                    <div
                        key={expense.id}
                        style={{
                            background: '#ffffff',
                            borderRadius: '12px',
                            padding: '14px 16px',
                            boxShadow: '0 2px 12px rgba(0,0,0,0.07)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between'
                        }}
                    >
                        <div>
                            <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#0d1b12', marginBottom: '2px' }}>
                                {expense.description}
                            </div>
                            <div style={{ fontSize: '0.7rem', color: '#8fa396' }}>
                                {new Date(expense.created_at).toLocaleDateString()}
                            </div>
                        </div>
                        <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#e53e3e' }}>
                            -₦{expense.amount_naira.toLocaleString()}
                        </div>
                    </div>
                ))}
            </div>
        </>
    )
}