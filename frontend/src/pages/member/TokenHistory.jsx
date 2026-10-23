import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, TrendingUp, TrendingDown, Coins, ArrowRightLeft, Send, X } from 'lucide-react'
import { getMyTokenHistory, transferTokens } from '../../services/tokens.service'
import { useAuth } from '../../context/AuthContext'
import { RATE } from '../../constants'

export default function TokenHistory() {
    const navigate = useNavigate()
    const { member, setMember } = useAuth() // Assuming setMember or a refresh function exists to update balance
    const [history, setHistory] = useState([])
    const [loading, setLoading] = useState(true)

    // Modal state for gifting tokens
    const [showGiftModal, setShowGiftModal] = useState(false)
    const [recipientStateCode, setRecipientStateCode] = useState('')
    const [transferAmount, setTransferAmount] = useState(1)
    const [transferring, setTransferring] = useState(false)
    const [transferError, setTransferError] = useState('')
    const [transferSuccess, setTransferSuccess] = useState('')

    const fetchHistory = async () => {
        try {
            const result = await getMyTokenHistory()
            setHistory(result.data)
        } catch (err) {
            console.error(err)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchHistory()
    }, [])

    const handleTransfer = async (e) => {
        e.preventDefault()
        setTransferError('')
        setTransferSuccess('')

        const parsedTokens = parseInt(transferAmount, 10)
        
        if (isNaN(parsedTokens) || parsedTokens < 1) {
            setTransferError('Please enter a valid number of tokens (at least 1).')
            return
        }

        setTransferring(true)

        try {
            const res = await transferTokens(recipientStateCode.trim(), parsedTokens)
            setTransferSuccess(`Successfully sent ${parsedTokens} token(s) to ${res.recipient_name}!`)
            
            // 1. Immediately update local member state balance if setMember is available
            if (setMember && member) {
                setMember(prev => ({
                    ...prev,
                    token_balance: prev.token_balance - parsedTokens
                }))
            }

            // 2. Clear form, close modal, and refresh history list
            setTimeout(() => {
                setShowGiftModal(false)
                setRecipientStateCode('')
                setTransferAmount(1)
                setTransferSuccess('')
                fetchHistory() // Pulls latest history from backend including the new transfer
            }, 1200)

        } catch (err) {
            setTransferError(err.response?.data?.message || err.message || 'Transfer failed.')
        } finally {
            setTransferring(false)
        }
    }

    const totalTopups = history
        .filter(h => h.type === 'topup')
        .reduce((sum, h) => sum + parseInt(h.tokens), 0)

    const totalDeductions = history
        .filter(h => h.type === 'deduction')
        .reduce((sum, h) => sum + parseInt(h.tokens), 0)

    const totalTransfersSent = history
        .filter(h => h.type === 'transfer_sent')
        .reduce((sum, h) => sum + parseInt(h.tokens), 0)

    const totalTransfersReceived = history
        .filter(h => h.type === 'transfer_received')
        .reduce((sum, h) => sum + parseInt(h.tokens), 0)

    const getItemConfig = (item) => {
        switch (item.type) {
            case 'topup':
                return {
                    icon: <TrendingUp size={18} color="#008751" />,
                    iconBg: '#e6f4ee',
                    title: `Top-up by ${item.performed_by_first} ${item.performed_by_last}`,
                    subtitle: `₦${parseInt(item.naira_value).toLocaleString()} paid`,
                    amount: `+${item.tokens}`,
                    color: '#008751'
                }
            case 'transfer_sent':
                return {
                    icon: <ArrowRightLeft size={18} color="#e53e3e" />,
                    iconBg: '#fff0f0',
                    title: `Sent to ${item.recipient_name} ${item.recipient_last || ''}`,
                    subtitle: item.recipient_state_code,
                    amount: `-${item.tokens}`,
                    color: '#e53e3e'
                }
            case 'transfer_received':
                return {
                    icon: <ArrowRightLeft size={18} color="#4f46e5" />,
                    iconBg: '#eef2ff',
                    title: `Received from ${item.sender_name} ${item.sender_last || ''}`,
                    subtitle: item.sender_state_code,
                    amount: `+${item.tokens}`,
                    color: '#4f46e5'
                }
            case 'deduction':
            default:
                return {
                    icon: <TrendingDown size={18} color="#e53e3e" />,
                    iconBg: '#fff0f0',
                    title: item.meeting_title,
                    subtitle: item.deduction_type === 'excuse' ? 'Excused absence'
                        : item.deduction_type === 'manual' ? 'Manual marking'
                        : item.is_late ? 'Late attendance' : 'Attendance',
                    amount: `-${item.tokens}`,
                    color: '#e53e3e'
                }
        }
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
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                boxShadow: '0 1px 0 #e8ece9'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div
                        onClick={() => navigate('/')}
                        style={{
                            width: '36px', height: '36px', background: '#f2f4f7',
                            borderRadius: '50%', display: 'flex', alignItems: 'center',
                            justifyContent: 'center', cursor: 'pointer'
                        }}
                    >
                        <ArrowLeft size={18} color="#4a5e52" />
                    </div>
                    <div>
                        <div style={{ fontSize: '1rem', fontWeight: 700, color: '#0d1b12' }}>Token History</div>
                        <div style={{ fontSize: '0.72rem', color: '#8fa396' }}>Top-ups, deductions & transfers</div>
                    </div>
                </div>

                {/* GIFT BUTTON */}
                <button
                    onClick={() => { setShowGiftModal(true); setTransferError(''); setTransferSuccess('') }}
                    style={{
                        background: '#008751', border: 'none', borderRadius: '10px',
                        padding: '8px 12px', cursor: 'pointer', display: 'flex',
                        alignItems: 'center', gap: '6px', fontSize: '0.75rem',
                        fontWeight: 700, color: 'white', fontFamily: "'Plus Jakarta Sans', sans-serif"
                    }}
                >
                    <Send size={13} color="white" />
                    Gift
                </button>
            </div>

            <div style={{ padding: '16px 20px 0' }}>

                {/* SUMMARY CARDS */}
                <div style={{
                    display: 'grid', gridTemplateColumns: '1fr 1fr',
                    gap: '10px', marginBottom: '10px'
                }}>
                    <div style={{
                        background: '#ffffff', borderRadius: '14px',
                        padding: '14px 12px', boxShadow: '0 2px 12px rgba(0,0,0,0.07)',
                        textAlign: 'center'
                    }}>
                        <div style={{ fontSize: '0.6rem', fontWeight: 600, color: '#8fa396', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '6px' }}>
                            Balance
                        </div>
                        <div style={{ fontSize: '1.3rem', fontWeight: 800, color: '#008751' }}>
                            {member?.token_balance ?? 0}
                        </div>
                        <div style={{ fontSize: '0.6rem', color: '#8fa396', marginTop: '2px' }}>tokens</div>
                    </div>

                    <div style={{
                        background: '#ffffff', borderRadius: '14px',
                        padding: '14px 12px', boxShadow: '0 2px 12px rgba(0,0,0,0.07)',
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
                </div>

                <div style={{
                    display: 'grid', gridTemplateColumns: '1fr 1fr 1fr',
                    gap: '10px', marginBottom: '16px'
                }}>
                    <div style={{
                        background: '#ffffff', borderRadius: '14px',
                        padding: '14px 12px', boxShadow: '0 2px 12px rgba(0,0,0,0.07)',
                        textAlign: 'center'
                    }}>
                        <div style={{ fontSize: '0.6rem', fontWeight: 600, color: '#8fa396', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '6px' }}>
                            Used
                        </div>
                        <div style={{ fontSize: '1.3rem', fontWeight: 800, color: '#e53e3e' }}>
                            {totalDeductions}
                        </div>
                        <div style={{ fontSize: '0.6rem', color: '#8fa396', marginTop: '2px' }}>tokens</div>
                    </div>

                    <div style={{
                        background: '#ffffff', borderRadius: '14px',
                        padding: '14px 12px', boxShadow: '0 2px 12px rgba(0,0,0,0.07)',
                        textAlign: 'center'
                    }}>
                        <div style={{ fontSize: '0.6rem', fontWeight: 600, color: '#8fa396', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '6px' }}>
                            Sent
                        </div>
                        <div style={{ fontSize: '1.3rem', fontWeight: 800, color: '#e53e3e' }}>
                            {totalTransfersSent}
                        </div>
                        <div style={{ fontSize: '0.6rem', color: '#8fa396', marginTop: '2px' }}>tokens</div>
                    </div>

                    <div style={{
                        background: '#ffffff', borderRadius: '14px',
                        padding: '14px 12px', boxShadow: '0 2px 12px rgba(0,0,0,0.07)',
                        textAlign: 'center'
                    }}>
                        <div style={{ fontSize: '0.6rem', fontWeight: 600, color: '#8fa396', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '6px' }}>
                            Received
                        </div>
                        <div style={{ fontSize: '1.3rem', fontWeight: 800, color: '#4f46e5' }}>
                            {totalTransfersReceived}
                        </div>
                        <div style={{ fontSize: '0.6rem', color: '#8fa396', marginTop: '2px' }}>tokens</div>
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
                            Top-ups, deductions and transfers will appear here
                        </div>
                    </div>
                )}

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {history.map((item, index) => {
                        const config = getItemConfig(item)
                        const date = new Date(item.created_at)

                        return (
                            <div
                                key={index}
                                style={{
                                    background: '#ffffff', borderRadius: '14px',
                                    padding: '14px 16px',
                                    boxShadow: '0 2px 12px rgba(0,0,0,0.07)',
                                    display: 'flex', alignItems: 'center', gap: '12px'
                                }}
                            >
                                <div style={{
                                    width: '40px', height: '40px', borderRadius: '12px',
                                    background: config.iconBg, display: 'flex',
                                    alignItems: 'center', justifyContent: 'center', flexShrink: 0
                                }}>
                                    {config.icon}
                                </div>

                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <div style={{
                                        fontSize: '0.85rem', fontWeight: 600,
                                        color: '#0d1b12', marginBottom: '2px',
                                        whiteSpace: 'nowrap', overflow: 'hidden',
                                        textOverflow: 'ellipsis'
                                    }}>
                                        {config.title}
                                    </div>
                                    <div style={{ fontSize: '0.7rem', color: '#8fa396' }}>
                                        {config.subtitle}
                                        {' · '}
                                        {date.toLocaleDateString('en-GB', {
                                            day: 'numeric', month: 'short', year: 'numeric'
                                        })}
                                    </div>
                                </div>

                                <div style={{
                                    fontSize: '0.95rem', fontWeight: 800,
                                    color: config.color, flexShrink: 0
                                }}>
                                    {config.amount}
                                </div>
                            </div>
                        )
                    })}
                </div>
            </div>

            {/* GIFT TOKENS MODAL OVERLAY */}
            {showGiftModal && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    backgroundColor: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(3px)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    zIndex: 1000, padding: '20px'
                }} onClick={() => setShowGiftModal(false)}>
                    <div style={{
                        background: '#ffffff', borderRadius: '18px', padding: '24px',
                        width: '100%', maxWidth: '350px', boxShadow: '0 10px 25px rgba(0,0,0,0.15)',
                        border: '1px solid #e8ece9'
                    }} onClick={e => e.stopPropagation()}>
                        
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                            <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#0d1b12' }}>
                                Gift Tokens 🎁
                            </div>
                            <button onClick={() => setShowGiftModal(false)} style={{
                                background: '#f2f4f7', border: 'none', borderRadius: '50%',
                                width: '28px', height: '28px', display: 'flex', alignItems: 'center',
                                justifyContent: 'center', cursor: 'pointer'
                            }}>
                                <X size={16} color="#4a5e52" />
                            </button>
                        </div>

                        {transferError && (
                            <div style={{
                                background: '#fff0f0', color: '#e53e3e', fontSize: '0.8rem',
                                padding: '10px 14px', borderRadius: '10px', marginBottom: '12px'
                            }}>
                                {transferError}
                            </div>
                        )}

                        {transferSuccess && (
                            <div style={{
                                background: '#e6f4ee', color: '#008751', fontSize: '0.8rem',
                                padding: '10px 14px', borderRadius: '10px', marginBottom: '12px', fontWeight: 600
                            }}>
                                {transferSuccess}
                            </div>
                        )}

                        <form onSubmit={handleTransfer}>
                            <div style={{ marginBottom: '12px' }}>
                                <label style={{ display: 'block', fontSize: '0.68rem', fontWeight: 600, color: '#4a5e52', textTransform: 'uppercase', marginBottom: '6px' }}>
                                    Recipient State Code
                                </label>
                                <input
                                    type="text"
                                    value={recipientStateCode}
                                    onChange={e => setRecipientStateCode(e.target.value)}
                                    placeholder="e.g. LA/26A/1234"
                                    required
                                    style={{
                                        width: '100%', background: '#f2f4f7', border: 'none',
                                        borderRadius: '12px', padding: '12px 14px', fontSize: '0.85rem',
                                        color: '#0d1b12', outline: 'none', fontFamily: "'Plus Jakarta Sans', sans-serif"
                                    }}
                                />
                            </div>

                            <div style={{ marginBottom: '20px' }}>
                                <label style={{ display: 'block', fontSize: '0.68rem', fontWeight: 600, color: '#4a5e52', textTransform: 'uppercase', marginBottom: '6px' }}>
                                    Number of Tokens
                                </label>
                                <input
                                    type="number"
                                    min="1"
                                    value={transferAmount}
                                    onChange={e => setTransferAmount(e.target.value)}
                                    required
                                    style={{
                                        width: '100%', background: '#f2f4f7', border: 'none',
                                        borderRadius: '12px', padding: '12px 14px', fontSize: '0.85rem',
                                        color: '#0d1b12', outline: 'none', fontFamily: "'Plus Jakarta Sans', sans-serif"
                                    }}
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={transferring}
                                style={{
                                    width: '100%', background: transferring ? '#c2e0cf' : '#008751',
                                    border: 'none', borderRadius: '12px', padding: '13px',
                                    cursor: transferring ? 'not-allowed' : 'pointer', fontSize: '0.88rem',
                                    fontWeight: 700, color: 'white', fontFamily: "'Plus Jakarta Sans', sans-serif"
                                }}
                            >
                                {transferring ? 'Sending...' : 'Send Tokens'}
                            </button>
                        </form>

                    </div>
                </div>
            )}
        </div>
    )
}