import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Search, Coins, Plus, Minus } from 'lucide-react'
import { getAllMembers, topUpMember } from '../../services/tokens.service'
import { RATE } from '../../constants'

export default function TopUp() {
    const navigate = useNavigate()
    const [members, setMembers] = useState([])
    const [filtered, setFiltered] = useState([])
    const [search, setSearch] = useState('')
    const [loading, setLoading] = useState(true)
    const [selected, setSelected] = useState(null)
    const [tokens, setTokens] = useState(1)
    const [topping, setTopping] = useState(false)
    const [success, setSuccess] = useState(null)
    const [error, setError] = useState('')

    useEffect(() => {
        const fetch = async () => {
            try {
                const result = await getAllMembers()
                const corps = result.data.filter(m => m.member_type === 'corps_member')
                setMembers(corps)
                setFiltered(corps)
            } catch (err) {
                console.error(err)
            } finally {
                setLoading(false)
            }
        }
        fetch()
    }, [])

    useEffect(() => {
        const q = search.toLowerCase()
        setFiltered(members.filter(m =>
            `${m.first_name} ${m.last_name}`.toLowerCase().includes(q) ||
            m.state_code.toLowerCase().includes(q)
        ))
    }, [search, members])

    const handleTopUp = async () => {
        setTopping(true)
        setError('')
        try {
            const result = await topUpMember(selected.id, tokens)
            setSuccess(result.data)
            setSelected(null)
            setTokens(1)
            // Update member balance in list
            setMembers(prev => prev.map(m =>
                m.id === selected.id
                    ? { ...m, token_balance: result.data.new_balance }
                    : m
            ))
        } catch (err) {
            setError(err.response?.data?.message || 'Something went wrong')
        } finally {
            setTopping(false)
        }
    }

    return (
        <div style={{
            minHeight: '100vh',
            background: '#f2f4f7',
            fontFamily: "'Plus Jakarta Sans', sans-serif",
            maxWidth: '390px',
            margin: '0 auto',
            paddingBottom: '40px'
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
                    onClick={() => navigate('/dashboard')}
                    style={{
                        width: '36px',
                        height: '36px',
                        background: '#f2f4f7',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer'
                    }}
                >
                    <ArrowLeft size={18} color="#4a5e52" />
                </div>
                <div>
                    <div style={{ fontSize: '1rem', fontWeight: 700, color: '#0d1b12' }}>Top Up Tokens</div>
                    <div style={{ fontSize: '0.72rem', color: '#8fa396' }}>Add tokens to a member's account</div>
                </div>
            </div>

            <div style={{ padding: '16px 20px 0' }}>

                {/* SUCCESS */}
                {success && (
                    <div style={{
                        background: '#e6f4ee',
                        borderRadius: '14px',
                        padding: '14px 16px',
                        marginBottom: '14px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px'
                    }}>
                        <Coins size={18} color="#008751" />
                        <div>
                            <div style={{ fontSize: '0.82rem', fontWeight: 600, color: '#008751' }}>
                                {success.tokens_added} token{success.tokens_added !== 1 ? 's' : ''} added — ₦{success.naira_value.toLocaleString()} collected
                            </div>
                            <div style={{ fontSize: '0.72rem', color: '#4a5e52' }}>
                                New balance: {success.new_balance} tokens
                            </div>
                        </div>
                    </div>
                )}

                {/* TOP UP FORM */}
                {selected && (
                    <div style={{
                        background: '#ffffff',
                        borderRadius: '18px',
                        padding: '20px',
                        boxShadow: '0 2px 12px rgba(0,0,0,0.07)',
                        marginBottom: '14px',
                        border: '2px solid #008751'
                    }}>
                        <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#0d1b12', marginBottom: '2px' }}>
                            {selected.first_name} {selected.last_name}
                        </div>
                        <div style={{ fontSize: '0.72rem', color: '#8fa396', marginBottom: '16px' }}>
                            {selected.state_code} · Current balance: {selected.token_balance} tokens
                        </div>

                        {error && (
                            <div style={{
                                background: '#fff0f0',
                                color: '#e53e3e',
                                fontSize: '0.8rem',
                                padding: '10px 14px',
                                borderRadius: '10px',
                                marginBottom: '12px'
                            }}>
                                {error}
                            </div>
                        )}

                        {/* TOKEN COUNTER */}
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            background: '#f2f4f7',
                            borderRadius: '14px',
                            padding: '12px 16px',
                            marginBottom: '8px'
                        }}>
                            <button
                                onClick={() => setTokens(t => Math.max(1, t - 1))}
                                style={{
                                    width: '36px',
                                    height: '36px',
                                    background: '#ffffff',
                                    border: 'none',
                                    borderRadius: '10px',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}
                            >
                                <Minus size={16} color="#4a5e52" />
                            </button>
                            <div style={{ textAlign: 'center' }}>
                                <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#008751', lineHeight: 1 }}>
                                    {tokens}
                                </div>
                                <div style={{ fontSize: '0.68rem', color: '#8fa396', marginTop: '2px' }}>
                                    token{tokens !== 1 ? 's' : ''} = ₦{(tokens * RATE).toLocaleString()}
                                </div>
                            </div>
                            <button
                                onClick={() => setTokens(t => t + 1)}
                                style={{
                                    width: '36px',
                                    height: '36px',
                                    background: '#008751',
                                    border: 'none',
                                    borderRadius: '10px',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}
                            >
                                <Plus size={16} color="white" />
                            </button>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                            <button
                                onClick={() => { setSelected(null); setError('') }}
                                style={{
                                    background: '#f2f4f7',
                                    border: 'none',
                                    borderRadius: '12px',
                                    padding: '13px',
                                    cursor: 'pointer',
                                    fontSize: '0.85rem',
                                    fontWeight: 600,
                                    color: '#4a5e52',
                                    fontFamily: "'Plus Jakarta Sans', sans-serif"
                                }}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleTopUp}
                                disabled={topping}
                                style={{
                                    background: '#008751',
                                    border: 'none',
                                    borderRadius: '12px',
                                    padding: '13px',
                                    cursor: topping ? 'not-allowed' : 'pointer',
                                    fontSize: '0.85rem',
                                    fontWeight: 600,
                                    color: 'white',
                                    fontFamily: "'Plus Jakarta Sans', sans-serif"
                                }}
                            >
                                {topping ? 'Adding...' : 'Add Tokens'}
                            </button>
                        </div>
                    </div>
                )}

                {/* SEARCH */}
                <div style={{
                    background: '#ffffff',
                    borderRadius: '14px',
                    padding: '12px 16px',
                    boxShadow: '0 2px 12px rgba(0,0,0,0.07)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    marginBottom: '12px'
                }}>
                    <Search size={16} color="#8fa396" />
                    <input
                        type="text"
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        placeholder="Search by name or state code"
                        style={{
                            flex: 1,
                            border: 'none',
                            outline: 'none',
                            fontSize: '0.85rem',
                            color: '#0d1b12',
                            fontFamily: "'Plus Jakarta Sans', sans-serif",
                            background: 'transparent'
                        }}
                    />
                </div>

                {/* MEMBER LIST */}
                {loading && (
                    <div style={{ textAlign: 'center', color: '#8fa396', fontSize: '0.82rem', marginTop: '20px' }}>
                        Loading members...
                    </div>
                )}

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {filtered.map(member => (
                        <div
                            key={member.id}
                            onClick={() => { setSelected(member); setSuccess(null); setError('') }}
                            style={{
                                background: '#ffffff',
                                borderRadius: '12px',
                                padding: '14px 16px',
                                boxShadow: '0 2px 12px rgba(0,0,0,0.07)',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '12px',
                                cursor: 'pointer',
                                border: selected?.id === member.id ? '2px solid #008751' : '2px solid transparent'
                            }}
                        >
                            <div style={{
                                width: '40px',
                                height: '40px',
                                borderRadius: '50%',
                                background: '#e6f4ee',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontWeight: 700,
                                fontSize: '0.78rem',
                                color: '#008751',
                                flexShrink: 0
                            }}>
                                {member.first_name[0]}{member.last_name[0]}
                            </div>
                            <div style={{ flex: 1 }}>
                                <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#0d1b12', marginBottom: '2px' }}>
                                    {member.first_name} {member.last_name}
                                </div>
                                <div style={{ fontSize: '0.7rem', color: '#8fa396' }}>
                                    {member.state_code}
                                </div>
                            </div>
                            <div style={{
                                background: member.token_balance === 0 ? '#fff0f0' : '#e6f4ee',
                                color: member.token_balance === 0 ? '#e53e3e' : '#008751',
                                fontSize: '0.72rem',
                                fontWeight: 700,
                                padding: '4px 10px',
                                borderRadius: '20px'
                            }}>
                                {member.token_balance} token{member.token_balance !== 1 ? 's' : ''}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}