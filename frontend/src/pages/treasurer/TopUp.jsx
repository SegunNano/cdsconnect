import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Coins } from 'lucide-react'
import { getAllMembers, topUpMember } from '../../services/tokens.service'
import { RATE } from '../../constants'

import { HeaderBar } from '../../components/common/HeaderBar'
import { SearchBar } from '../../components/common/SearchBar'
import { MemberListItem } from '../../components/members/MemberListItem'
import { TopUpModalCard } from '../../components/tokens/TopUpModalCard'

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
            <HeaderBar 
                title="Top Up Tokens" 
                subtitle="Add tokens to a member's account" 
                onBack={() => navigate('/dashboard')} 
            />

            <div style={{ padding: '16px 20px 0' }}>
                {/* SUCCESS NOTIFICATION */}
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

                {/* ACTIVE TOP UP CARD */}
                {selected && (
                    <TopUpModalCard
                        selected={selected}
                        tokens={tokens}
                        setTokens={setTokens}
                        rate={RATE}
                        error={error}
                        topping={topping}
                        onCancel={() => { setSelected(null); setError('') }}
                        onSubmit={handleTopUp}
                    />
                )}

                <SearchBar 
                    value={search} 
                    onChange={e => setSearch(e.target.value)} 
                    placeholder="Search by name or state code" 
                />

                {loading && (
                    <div style={{ textAlign: 'center', color: '#8fa396', fontSize: '0.82rem', marginTop: '20px' }}>
                        Loading members...
                    </div>
                )}
              {!loading && filtered.length === 0 && (
                    <div style={{
                        textAlign: 'center',
                        color: '#8fa396',
                        fontSize: '0.82rem',
                        padding: '40px 0'
                    }}>
                        {search ? 'No members match your search' : 'No members found'}
                    </div>
                )}

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {filtered.map(member => (
                        <MemberListItem
                            key={member.id}
                            member={member}
                            isSelected={selected?.id === member.id}
                            onClick={() => { setSelected(member); setSuccess(null); setError('') }}
                        />
                    ))}
                </div>
            </div>
        </div>
    )
}