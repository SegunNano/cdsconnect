import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { ArrowLeft, Plus } from 'lucide-react'
import api from '../../services/api'

import { TreasuryForm } from '../../components/treasury/TreasuryForm'
import { TabContentRenderer } from '../../components/treasury/TreasuryLists'

const CAN_LOG = ['coordinator', 'treasurer', 'financial_secretary']
const PAGE_SIZE = 5

export default function Treasury() {
    const { member } = useAuth()
    const navigate = useNavigate()
    const [summary, setSummary] = useState(null)
    const [loading, setLoading] = useState(true)
    const [activeTab, setActiveTab] = useState('general')
    const [showForm, setShowForm] = useState(false)
    const [logType, setLogType] = useState('expense')
    const [form, setForm] = useState({ amount: '', description: '', source: '' })
    const [submitting, setSubmitting] = useState(false)
    const [error, setError] = useState('')

    // Pagination per tab
    const [visibleCounts, setVisibleCounts] = useState({
        tokens: PAGE_SIZE,
        income: PAGE_SIZE,
        expenses: PAGE_SIZE
    })

    // Date filters per tab
    const [dateFilters, setDateFilters] = useState({
        tokens: '',
        income: '',
        expenses: ''
    })

    const canLog = CAN_LOG.includes(member?.role)

    useEffect(() => {
        api.get('/expenses/summary')
            .then(res => setSummary(res.data.data))
            .catch(console.error)
            .finally(() => setLoading(false))
    }, [])

    const handleSubmit = async (e) => {
        e.preventDefault()
        setSubmitting(true)
        setError('')
        try {
            if (logType === 'expense') {
                const result = await api.post('/expenses', {
                    amount: parseInt(form.amount),
                    description: form.description
                })
                setSummary(prev => ({
                    ...prev,
                    total_expenses: prev.total_expenses + parseInt(form.amount),
                    balance: prev.balance - parseInt(form.amount),
                    expenses: [result.data.data.expense, ...prev.expenses]
                }))
            } else {
                const result = await api.post('/income', {
                    amount: parseInt(form.amount),
                    description: form.description,
                    source: form.source
                })
                setSummary(prev => ({
                    ...prev,
                    external_income: prev.external_income + parseInt(form.amount),
                    total_income: prev.total_income + parseInt(form.amount),
                    balance: prev.balance + parseInt(form.amount),
                    external_income_list: [result.data.data, ...prev.external_income_list]
                }))
            }
            setForm({ amount: '', description: '', source: '' })
            setShowForm(false)
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to log')
        } finally {
            setSubmitting(false)
        }
    }

    const inputStyle = {
        width: '100%', background: '#f2f4f7', border: 'none',
        borderRadius: '12px', padding: '13px 14px', fontSize: '0.85rem',
        color: '#0d1b12', outline: 'none',
        fontFamily: "'Plus Jakarta Sans', sans-serif"
    }

    const labelStyle = {
        display: 'block', fontSize: '0.68rem', fontWeight: 600,
        color: '#4a5e52', textTransform: 'uppercase',
        letterSpacing: '0.5px', marginBottom: '6px'
    }

    const tabs = [
        { key: 'general', label: 'General' },
        { key: 'tokens', label: 'Tokens' },
        { key: 'income', label: 'Income' },
        { key: 'expenses', label: 'Expenses' }
    ]

    const loadMore = (tab) => {
        setVisibleCounts(prev => ({ ...prev, [tab]: prev[tab] + PAGE_SIZE }))
    }

    return (
        <div style={{
            minHeight: '100vh', background: '#f2f4f7',
            fontFamily: "'Plus Jakarta Sans', sans-serif",
            maxWidth: '390px', margin: '0 auto', paddingBottom: '100px'
        }}>
            {/* HEADER */}
            <div style={{
                background: '#ffffff', padding: '52px 20px 16px',
                display: 'flex', alignItems: 'center',
                justifyContent: 'space-between', boxShadow: '0 1px 0 #e8ece9'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div onClick={() => navigate('/')} style={{
                        width: '36px', height: '36px', background: '#f2f4f7',
                        borderRadius: '50%', display: 'flex', alignItems: 'center',
                        justifyContent: 'center', cursor: 'pointer'
                    }}>
                        <ArrowLeft size={18} color="#4a5e52" />
                    </div>
                    <div>
                        <div style={{ fontSize: '1rem', fontWeight: 700, color: '#0d1b12' }}>Treasury</div>
                        <div style={{ fontSize: '0.72rem', color: '#8fa396' }}>Group finances</div>
                    </div>
                </div>
                {canLog && (
                    <button
                        onClick={() => { setShowForm(!showForm); setError('') }}
                        style={{
                            background: showForm ? '#f2f4f7' : '#008751',
                            border: 'none', borderRadius: '10px',
                            padding: '8px 14px', cursor: 'pointer',
                            display: 'flex', alignItems: 'center', gap: '6px',
                            fontSize: '0.78rem', fontWeight: 600,
                            color: showForm ? '#4a5e52' : 'white',
                            fontFamily: "'Plus Jakarta Sans', sans-serif"
                        }}
                    >
                        <Plus size={14} color={showForm ? '#4a5e52' : 'white'} />
                        {showForm ? 'Cancel' : 'Log'}
                    </button>
                )}
            </div>

            <div style={{ padding: '16px 20px 0' }}>

                {/* LOG FORM */}
                <TreasuryForm
                    showForm={showForm}
                    canLog={canLog}
                    logType={logType}
                    setLogType={setLogType}
                    setError={setError}
                    error={error}
                    form={form}
                    setForm={setForm}
                    submitting={submitting}
                    onSubmit={handleSubmit}
                    inputStyle={inputStyle}
                    onClose={() => { setShowForm(false); setError('') }}
                    labelStyle={labelStyle}
                />

                {loading ? (
                    <div style={{ textAlign: 'center', color: '#8fa396', padding: '40px 0', fontSize: '0.82rem' }}>
                        Loading...
                    </div>
                ) : summary && (
                    <>
                        {/* BALANCE CARD */}
                        <div style={{
                            background: '#008751', borderRadius: '18px',
                            padding: '20px', marginBottom: '12px',
                            boxShadow: '0 4px 20px rgba(0,135,81,0.25)'
                        }}>
                            <div style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.7)', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: '6px' }}>
                                Current Balance
                            </div>
                            <div style={{ fontSize: '2.2rem', fontWeight: 800, color: 'white', lineHeight: 1, marginBottom: '6px' }}>
                                ₦{summary.balance.toLocaleString()}
                            </div>
                            <div style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.6)' }}>
                                All income minus expenses
                            </div>
                        </div>

                        {/* SUMMARY CHIPS */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px', marginBottom: '16px' }}>
                            {[
                                { label: 'Token Income', value: summary.token_income, color: '#008751', bg: '#e6f4ee' },
                                { label: 'External', value: summary.external_income, color: '#4f46e5', bg: '#eef2ff' },
                                { label: 'Spent', value: summary.total_expenses, color: '#e53e3e', bg: '#fff0f0' }
                            ].map(item => (
                                <div key={item.label} style={{
                                    background: '#ffffff', borderRadius: '12px',
                                    padding: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
                                }}>
                                    <div style={{ fontSize: '0.58rem', fontWeight: 600, color: '#8fa396', textTransform: 'uppercase', marginBottom: '5px' }}>
                                        {item.label}
                                    </div>
                                    <div style={{ fontSize: '0.92rem', fontWeight: 800, color: item.color }}>
                                        ₦{item.value.toLocaleString()}
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* TABS */}
                        <div style={{
                            display: 'flex', background: '#ffffff',
                            borderRadius: '14px', padding: '4px',
                            marginBottom: '14px', gap: '2px',
                            boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
                        }}>
                            {tabs.map(tab => (
                                <button
                                    key={tab.key}
                                    onClick={() => setActiveTab(tab.key)}
                                    style={{
                                        flex: 1, padding: '8px 4px',
                                        background: activeTab === tab.key ? '#008751' : 'transparent',
                                        border: 'none', borderRadius: '10px',
                                        cursor: 'pointer', fontSize: '0.68rem',
                                        fontWeight: 600,
                                        color: activeTab === tab.key ? 'white' : '#8fa396',
                                        fontFamily: "'Plus Jakarta Sans', sans-serif",
                                        transition: 'all 0.15s'
                                    }}
                                >
                                    {tab.label}
                                </button>
                            ))}
                        </div>

                        {/* TAB CONTENT RENDERER */}
                        <TabContentRenderer
                            activeTab={activeTab}
                            summary={summary}
                            dateFilters={dateFilters}
                            setDateFilters={setDateFilters}
                            visibleCounts={visibleCounts}
                            setVisibleCounts={setVisibleCounts}
                            pageSize={PAGE_SIZE}
                            loadMore={loadMore}
                        />
                    </>
                )}
            </div>
        </div>
    )
}