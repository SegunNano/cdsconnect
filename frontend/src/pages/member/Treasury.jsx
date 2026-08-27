import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import {
    ArrowLeft, TrendingUp, TrendingDown, Plus, AlertCircle
} from 'lucide-react'
import api from '../../services/api'

const CAN_LOG = ['coordinator', 'treasurer', 'financial_secretary']

export default function Treasury() {
    const { member } = useAuth()
    const navigate = useNavigate()
    const [summary, setSummary] = useState(null)
    const [loading, setLoading] = useState(true)
    const [showForm, setShowForm] = useState(false)
    const [form, setForm] = useState({ amount: '', description: '' })
    const [submitting, setSubmitting] = useState(false)
    const [error, setError] = useState('')

    const canLog = CAN_LOG.includes(member?.role) || member?.is_dev

    useEffect(() => {
        const fetch = async () => {
            try {
                const result = await api.get('/expenses/summary')
                setSummary(result.data.data)
            } catch (err) {
                console.error(err)
            } finally {
                setLoading(false)
            }
        }
        fetch()
    }, [])

    const handleSubmit = async (e) => {
        e.preventDefault()
        setSubmitting(true)
        setError('')
        try {
            const result = await api.post('/expenses', {
                amount: parseInt(form.amount),
                description: form.description
            })
            // Update summary
            setSummary(prev => ({
                ...prev,
                total_expenses: prev.total_expenses + parseInt(form.amount),
                balance: prev.balance - parseInt(form.amount),
                expenses: [result.data.data.expense, ...prev.expenses]
            }))
            setForm({ amount: '', description: '' })
            setShowForm(false)
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to log expense')
        } finally {
            setSubmitting(false)
        }
    }

    const inputStyle = {
        width: '100%',
        background: '#f2f4f7',
        border: 'none',
        borderRadius: '12px',
        padding: '13px 14px',
        fontSize: '0.85rem',
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
        letterSpacing: '0.5px',
        marginBottom: '6px'
    }

    return (
        <div style={{
            minHeight: '100vh',
            background: '#f2f4f7',
            fontFamily: "'Plus Jakarta Sans', sans-serif",
            maxWidth: '390px',
            margin: '0 auto',
            paddingBottom: '100px'
        }}>

            {/* HEADER */}
            <div style={{
                background: '#ffffff',
                padding: '52px 20px 16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                boxShadow: '0 1px 0 #e8ece9'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div
                        onClick={() => navigate('/')}
                        style={{
                            width: '36px', height: '36px',
                            background: '#f2f4f7', borderRadius: '50%',
                            display: 'flex', alignItems: 'center',
                            justifyContent: 'center', cursor: 'pointer'
                        }}
                    >
                        <ArrowLeft size={18} color="#4a5e52" />
                    </div>
                    <div>
                        <div style={{ fontSize: '1rem', fontWeight: 700, color: '#0d1b12' }}>
                            Treasury
                        </div>
                        <div style={{ fontSize: '0.72rem', color: '#8fa396' }}>
                            Group finances
                        </div>
                    </div>
                </div>

                {canLog && (
                    <button
                        onClick={() => setShowForm(!showForm)}
                        style={{
                            background: showForm ? '#f2f4f7' : '#008751',
                            border: 'none', borderRadius: '10px',
                            padding: '8px 14px', cursor: 'pointer',
                            display: 'flex', alignItems: 'center',
                            gap: '6px', fontSize: '0.78rem',
                            fontWeight: 600,
                            color: showForm ? '#4a5e52' : 'white',
                            fontFamily: "'Plus Jakarta Sans', sans-serif"
                        }}
                    >
                        <Plus size={14} color={showForm ? '#4a5e52' : 'white'} />
                        {showForm ? 'Cancel' : 'Log Expense'}
                    </button>
                )}
            </div>

            <div style={{ padding: '16px 20px 0' }}>

                {/* LOG EXPENSE FORM */}
                {showForm && canLog && (
                    <div style={{
                        background: '#ffffff',
                        borderRadius: '18px',
                        padding: '20px',
                        boxShadow: '0 2px 12px rgba(0,0,0,0.07)',
                        marginBottom: '16px'
                    }}>
                        {error && (
                            <div style={{
                                background: '#fff0f0', color: '#e53e3e',
                                fontSize: '0.8rem', padding: '10px 14px',
                                borderRadius: '10px', marginBottom: '12px',
                                display: 'flex', alignItems: 'center', gap: '6px'
                            }}>
                                <AlertCircle size={14} color="#e53e3e" />
                                {error}
                            </div>
                        )}
                        <form onSubmit={handleSubmit}>
                            <div style={{ marginBottom: '12px' }}>
                                <label style={labelStyle}>Amount (₦)</label>
                                <input
                                    type="number"
                                    value={form.amount}
                                    onChange={e => setForm({ ...form, amount: e.target.value })}
                                    placeholder="e.g. 5000"
                                    required
                                    min="1"
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
                                disabled={submitting}
                                style={{
                                    width: '100%',
                                    background: submitting ? '#c2e0cf' : '#008751',
                                    border: 'none', borderRadius: '12px',
                                    padding: '13px', cursor: submitting ? 'not-allowed' : 'pointer',
                                    fontSize: '0.88rem', fontWeight: 700,
                                    color: 'white',
                                    fontFamily: "'Plus Jakarta Sans', sans-serif"
                                }}
                            >
                                {submitting ? 'Logging...' : 'Log Expense'}
                            </button>
                        </form>
                    </div>
                )}

                {loading ? (
                    <div style={{ textAlign: 'center', color: '#8fa396', padding: '40px 0', fontSize: '0.82rem' }}>
                        Loading...
                    </div>
                ) : summary && (
                    <>
                        {/* BALANCE CARD */}
                        <div style={{
                            background: '#008751',
                            borderRadius: '18px',
                            padding: '20px',
                            marginBottom: '12px',
                            boxShadow: '0 4px 20px rgba(0,135,81,0.25)'
                        }}>
                            <div style={{
                                fontSize: '0.72rem', color: 'rgba(255,255,255,0.7)',
                                textTransform: 'uppercase', letterSpacing: '0.8px',
                                marginBottom: '6px'
                            }}>
                                Current Balance
                            </div>
                            <div style={{
                                fontSize: '2.2rem', fontWeight: 800,
                                color: 'white', lineHeight: 1, marginBottom: '6px'
                            }}>
                                ₦{summary.balance.toLocaleString()}
                            </div>
                            <div style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.6)' }}>
                                Treasurer should be holding this amount
                            </div>
                        </div>

                        {/* INCOME + EXPENSES */}
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: '1fr 1fr',
                            gap: '10px',
                            marginBottom: '16px'
                        }}>
                            <div style={{
                                background: '#ffffff', borderRadius: '14px',
                                padding: '16px', boxShadow: '0 2px 12px rgba(0,0,0,0.07)'
                            }}>
                                <div style={{
                                    display: 'flex', alignItems: 'center',
                                    gap: '6px', marginBottom: '8px'
                                }}>
                                    <TrendingUp size={14} color="#008751" />
                                    <div style={{ fontSize: '0.68rem', fontWeight: 600, color: '#8fa396', textTransform: 'uppercase' }}>
                                        Total Income
                                    </div>
                                </div>
                                <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#008751' }}>
                                    ₦{summary.total_income.toLocaleString()}
                                </div>
                                <div style={{ fontSize: '0.68rem', color: '#8fa396', marginTop: '3px' }}>
                                    From token purchases
                                </div>
                            </div>
                            <div style={{
                                background: '#ffffff', borderRadius: '14px',
                                padding: '16px', boxShadow: '0 2px 12px rgba(0,0,0,0.07)'
                            }}>
                                <div style={{
                                    display: 'flex', alignItems: 'center',
                                    gap: '6px', marginBottom: '8px'
                                }}>
                                    <TrendingDown size={14} color="#e53e3e" />
                                    <div style={{ fontSize: '0.68rem', fontWeight: 600, color: '#8fa396', textTransform: 'uppercase' }}>
                                        Total Spent
                                    </div>
                                </div>
                                <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#e53e3e' }}>
                                    ₦{summary.total_expenses.toLocaleString()}
                                </div>
                                <div style={{ fontSize: '0.68rem', color: '#8fa396', marginTop: '3px' }}>
                                    Logged expenses
                                </div>
                            </div>
                        </div>

                        {/* EXPENSE LIST */}
                        <div style={{
                            fontSize: '0.75rem', fontWeight: 700, color: '#8fa396',
                            textTransform: 'uppercase', letterSpacing: '0.8px',
                            marginBottom: '10px'
                        }}>
                            Expense History
                        </div>

                        {summary.expenses.length === 0 ? (
                            <div style={{
                                background: '#ffffff', borderRadius: '14px',
                                padding: '24px', textAlign: 'center',
                                color: '#8fa396', fontSize: '0.82rem',
                                boxShadow: '0 2px 12px rgba(0,0,0,0.07)'
                            }}>
                                No expenses logged yet
                            </div>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                {summary.expenses.map(expense => (
                                    <div
                                        key={expense.id}
                                        style={{
                                            background: '#ffffff',
                                            borderRadius: '12px',
                                            padding: '14px 16px',
                                            boxShadow: '0 2px 12px rgba(0,0,0,0.07)',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '12px'
                                        }}
                                    >
                                        <div style={{
                                            width: '40px', height: '40px',
                                            background: '#fff0f0', borderRadius: '12px',
                                            display: 'flex', alignItems: 'center',
                                            justifyContent: 'center', flexShrink: 0
                                        }}>
                                            <TrendingDown size={18} color="#e53e3e" />
                                        </div>
                                        <div style={{ flex: 1 }}>
                                            <div style={{
                                                fontSize: '0.85rem', fontWeight: 600,
                                                color: '#0d1b12', marginBottom: '2px'
                                            }}>
                                                {expense.description}
                                            </div>
                                            <div style={{ fontSize: '0.7rem', color: '#8fa396' }}>
                                                By {expense.first_name} {expense.last_name} · {new Date(expense.created_at).toLocaleDateString('en-GB', {
                                                    day: 'numeric', month: 'short', year: 'numeric'
                                                })}
                                            </div>
                                        </div>
                                        <div style={{
                                            fontSize: '0.95rem', fontWeight: 800,
                                            color: '#e53e3e'
                                        }}>
                                            -₦{expense.amount_naira.toLocaleString()}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* TOPUPS LIST */}
                        <div style={{
                            fontSize: '0.75rem', fontWeight: 700, color: '#8fa396',
                            textTransform: 'uppercase', letterSpacing: '0.8px',
                            marginBottom: '10px', marginTop: '16px'
                        }}>
                            Income History
                        </div>

                        {summary.topups.length === 0 ? (
                            <div style={{
                                background: '#ffffff', borderRadius: '14px',
                                padding: '24px', textAlign: 'center',
                                color: '#8fa396', fontSize: '0.82rem',
                                boxShadow: '0 2px 12px rgba(0,0,0,0.07)'
                            }}>
                                No income recorded yet
                            </div>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                {summary.topups.map(topup => (
                                    <div
                                        key={topup.id}
                                        style={{
                                            background: '#ffffff',
                                            borderRadius: '12px',
                                            padding: '14px 16px',
                                            boxShadow: '0 2px 12px rgba(0,0,0,0.07)',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '12px'
                                        }}
                                    >
                                        <div style={{
                                            width: '40px', height: '40px',
                                            background: '#e6f4ee', borderRadius: '12px',
                                            display: 'flex', alignItems: 'center',
                                            justifyContent: 'center', flexShrink: 0
                                        }}>
                                            <TrendingUp size={18} color="#008751" />
                                        </div>
                                        <div style={{ flex: 1 }}>
                                            <div style={{
                                                fontSize: '0.85rem', fontWeight: 600,
                                                color: '#0d1b12', marginBottom: '2px'
                                            }}>
                                                {topup.member_first_name} {topup.member_last_name}
                                            </div>
                                            <div style={{ fontSize: '0.7rem', color: '#8fa396' }}>
                                                By {topup.treasurer_first_name} {topup.treasurer_last_name} · {new Date(topup.created_at).toLocaleDateString('en-GB', {
                                                    day: 'numeric', month: 'short', year: 'numeric'
                                                })}
                                            </div>
                                        </div>
                                        <div style={{
                                            fontSize: '0.95rem', fontWeight: 800,
                                            color: '#008751'
                                        }}>
                                            +₦{topup.naira_value.toLocaleString()}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    )
}