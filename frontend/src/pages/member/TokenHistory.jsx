import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, TrendingUp, TrendingDown, Coins } from 'lucide-react'
import { getMyTokenHistory } from '../../services/tokens.service'
import { useAuth } from '../../context/AuthContext'
import { RATE } from '../../constants'

export default function TokenHistory() {
    const navigate = useNavigate()
    const { member } = useAuth()
    const [history, setHistory] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetch = async () => {
            try {
                const result = await getMyTokenHistory()
                setHistory(result.data)
            } catch (err) {
                console.error(err)
            } finally {
                setLoading(false)
            }
        }
        fetch()
    }, [])

    const totalTopups = history
        .filter(h => h.type === 'topup')
        .reduce((sum, h) => sum + parseInt(h.tokens), 0)

    const totalDeductions = history
        .filter(h => h.type === 'deduction')
        .reduce((sum, h) => sum + parseInt(h.tokens), 0)

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
                gap: '12px',
                boxShadow: '0 1px 0 #e8ece9'
            }}>
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
                        Token History
                    </div>
                    <div style={{ fontSize: '0.72rem', color: '#8fa396' }}>
                        Top-ups and deductions
                    </div>
                </div>
            </div>

            <div style={{ padding: '16px 20px 0' }}>

                {/* SUMMARY CARDS */}
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr 1fr',
                    gap: '10px',
                    marginBottom: '16px'
                }}>
                    <div style={{
                        background: '#ffffff',
                        borderRadius: '14px',
                        padding: '14px 12px',
                        boxShadow: '0 2px 12px rgba(0,0,0,0.07)',
                        textAlign: 'center'
                    }}>
                        <div style={{ fontSize: '0.6rem', fontWeight: 600, color: '#8fa396', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '6px' }}>
                            Balance
                        </div>
                        <div style={{ fontSize: '1.3rem', fontWeight: 800, color: '#008751' }}>
                            {member?.token_balance}
                        </div>
                        <div style={{ fontSize: '0.6rem', color: '#8fa396', marginTop: '2px' }}>
                            tokens
                        </div>
                    </div>
                    <div style={{
                        background: '#ffffff',
                        borderRadius: '14px',
                        padding: '14px 12px',
                        boxShadow: '0 2px 12px rgba(0,0,0,0.07)',
                        textAlign: 'center'
                    }}>
                        <div style={{ fontSize: '0.6rem', fontWeight: 600, color: '#8fa396', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '6px' }}>
                            Bought
                        </div>
                        <div style={{ fontSize: '1.3rem', fontWeight: 800, color: '#008751' }}>
                            {totalTopups}
                        </div>
                        <div style={{ fontSize: '0.6rem', color: '#8fa396', marginTop: '2px' }}>
                            ₦{(totalTopups * RATE).toLocaleString()}
                        </div>
                    </div>
                    <div style={{
                        background: '#ffffff',
                        borderRadius: '14px',
                        padding: '14px 12px',
                        boxShadow: '0 2px 12px rgba(0,0,0,0.07)',
                        textAlign: 'center'
                    }}>
                        <div style={{ fontSize: '0.6rem', fontWeight: 600, color: '#8fa396', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '6px' }}>
                            Used
                        </div>
                        <div style={{ fontSize: '1.3rem', fontWeight: 800, color: '#e53e3e' }}>
                            {totalDeductions}
                        </div>
                        <div style={{ fontSize: '0.6rem', color: '#8fa396', marginTop: '2px' }}>
                            ₦{(totalDeductions * RATE).toLocaleString()}
                        </div>
                    </div>
                </div>

                {/* HISTORY LIST */}
                <div style={{
                    fontSize: '0.75rem', fontWeight: 700, color: '#8fa396',
                    textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: '10px'
                }}>
                    Transactions
                </div>

                {loading && (
                    <div style={{ textAlign: 'center', color: '#8fa396', fontSize: '0.82rem', padding: '40px 0' }}>
                        Loading...
                    </div>
                )}

                {!loading && history.length === 0 && (
                    <div style={{
                        background: '#ffffff', borderRadius: '18px',
                        padding: '40px 20px', textAlign: 'center',
                        boxShadow: '0 2px 12px rgba(0,0,0,0.07)'
                    }}>
                        <Coins size={32} color="#c2e0cf" style={{ marginBottom: '8px' }} />
                        <div style={{ fontSize: '0.88rem', fontWeight: 600, color: '#0d1b12', marginBottom: '4px' }}>
                            No transactions yet
                        </div>
                        <div style={{ fontSize: '0.75rem', color: '#8fa396' }}>
                            Top-ups and deductions will appear here
                        </div>
                    </div>
                )}

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {history.map((item, index) => {
                        const isTopup = item.type === 'topup'
                        const date = new Date(item.created_at)

                        return (
                            <div
                                key={index}
                                style={{
                                    background: '#ffffff',
                                    borderRadius: '14px',
                                    padding: '14px 16px',
                                    boxShadow: '0 2px 12px rgba(0,0,0,0.07)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '12px'
                                }}
                            >
                                {/* ICON */}
                                <div style={{
                                    width: '40px', height: '40px',
                                    borderRadius: '12px',
                                    background: isTopup ? '#e6f4ee' : '#fff0f0',
                                    display: 'flex', alignItems: 'center',
                                    justifyContent: 'center', flexShrink: 0
                                }}>
                                    {isTopup
                                        ? <TrendingUp size={18} color="#008751" />
                                        : <TrendingDown size={18} color="#e53e3e" />
                                    }
                                </div>

                                {/* INFO */}
                                <div style={{ flex: 1 }}>
                                    <div style={{
                                        fontSize: '0.85rem', fontWeight: 600,
                                        color: '#0d1b12', marginBottom: '2px'
                                    }}>
                                        {isTopup
                                            ? `Top-up by ${item.performed_by_first} ${item.performed_by_last}`
                                            : item.meeting_title
                                        }
                                    </div>
                                    <div style={{ fontSize: '0.7rem', color: '#8fa396' }}>
                                        {isTopup
                                            ? `₦${parseInt(item.naira_value).toLocaleString()} paid`
                                            : item.deduction_type === 'excuse'
                                                ? 'Excused absence'
                                                : item.deduction_type === 'manual'
                                                    ? 'Manual marking'
                                                    : item.is_late ? 'Late attendance' : 'Attendance'
                                        }
                                        {' · '}
                                        {date.toLocaleDateString('en-GB', {
                                            day: 'numeric',
                                            month: 'short',
                                            year: 'numeric'
                                        })}
                                    </div>
                                </div>

                                {/* TOKEN AMOUNT */}
                                <div style={{
                                    fontSize: '0.95rem',
                                    fontWeight: 800,
                                    color: isTopup ? '#008751' : '#e53e3e'
                                }}>
                                    {isTopup ? '+' : '-'}{item.tokens}
                                </div>
                            </div>
                        )
                    })}
                </div>
            </div>
        </div>
    )
}