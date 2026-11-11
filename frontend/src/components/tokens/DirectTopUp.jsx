import { useState, useEffect, useMemo } from 'react'
import { Coins, ChevronDown } from 'lucide-react'
import { getAllMembers, topUpMember } from '../../services/tokens.service'
import { RATE, MAX_TOKENS_PER_TOPUP } from '../../constants'
import { SearchBar } from '../common/SearchBar'
import { MemberListItem } from '../members/MemberListItem'
import { TopUpModalCard } from './TopUpModalCard'
import { TopUpConfirmModal } from './TopUpConfirmModal'

export default function DirectTopUp() {
    const [members, setMembers] = useState([])
    const [search, setSearch] = useState('')
    const [loading, setLoading] = useState(true)
    const [selected, setSelected] = useState(null)
    const [tokens, setTokens] = useState(1)
    const [confirming, setConfirming] = useState(false)
    const [topping, setTopping] = useState(false)
    const [success, setSuccess] = useState(null)
    const [error, setError] = useState('')

    // Pagination limit when not searching
    const [visibleCount, setVisibleCount] = useState(10)

    useEffect(() => {
        getAllMembers()
            .then(res => setMembers(res.data.filter(m => m.member_type === 'corps_member')))
            .catch(console.error)
            .finally(() => setLoading(false))
    }, [])

    const filtered = useMemo(() => {
        const q = search.toLowerCase()
        return members.filter(m =>
            `${m.first_name} ${m.last_name}`.toLowerCase().includes(q) ||
            m.state_code.toLowerCase().includes(q)
        )
    }, [members, search])

    // If search is active, show all matches. If not, slice up to visibleCount (default 10)
    const displayedMembers = useMemo(() => {
        if (search.trim()) {
            return filtered
        }
        return filtered.slice(0, visibleCount)
    }, [filtered, search, visibleCount])

    const select = (member) => {
        setSelected(member); setConfirming(false); setSuccess(null); setError('')
    }

    const askConfirm = () => {
        if (!Number.isInteger(tokens) || tokens < 1) return setError('Please enter a valid token amount.')
        if (tokens > MAX_TOKENS_PER_TOPUP) return setError(`Maximum is ${MAX_TOKENS_PER_TOPUP} tokens per top-up.`)
        setError('')
        setConfirming(true)
    }

    const confirm = async () => {
        const memberId = selected.id
        setTopping(true)
        setError('')
        try {
            const result = await topUpMember(memberId, tokens)
            setSuccess(result.data)
            setMembers(prev => prev.map(m =>
                m.id === memberId ? { ...m, token_balance: result.data.new_balance } : m
            ))
            setSelected(null)
            setTokens(1)
        } catch (err) {
            setError(err.response?.data?.message || 'Something went wrong')
        } finally {
            setConfirming(false)
            setTopping(false)
        }
    }

    return (
        <>
            {success && (
                <div style={{
                    background: '#e6f4ee', borderRadius: '14px', padding: '14px 16px',
                    marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '10px'
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

            {selected && !confirming && (
                <TopUpModalCard
                    selected={selected} tokens={tokens} setTokens={setTokens} rate={RATE}
                    error={error} topping={topping}
                    onCancel={() => { setSelected(null); setError('') }}
                    onSubmit={askConfirm}
                />
            )}

            {confirming && selected && (
                <TopUpConfirmModal
                    selected={selected} tokens={tokens} rate={RATE}
                    topping={topping} error={error}
                    onCancel={() => setConfirming(false)} onConfirm={confirm}
                />
            )}

            <SearchBar value={search} onChange={setSearch} placeholder="Search by name or state code" />

            {loading && (
                <div style={{ textAlign: 'center', color: '#8fa396', fontSize: '0.82rem', marginTop: '20px' }}>
                    Loading members...
                </div>
            )}
            {!loading && filtered.length === 0 && (
                <div style={{ textAlign: 'center', color: '#8fa396', fontSize: '0.82rem', padding: '40px 0' }}>
                    {search ? 'No members match your search' : 'No members found'}
                </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {displayedMembers.map(member => (
                    <MemberListItem
                        key={member.id} member={member}
                        isSelected={selected?.id === member.id}
                        onClick={() => select(member)}
                    />
                ))}
            </div>

            {/* SHOW MORE BUTTON (Only visible when not actively searching and more members exist) */}
            {!search.trim() && visibleCount < filtered.length && (
                <button
                    onClick={() => setVisibleCount(prev => prev + 10)}
                    style={{
                        width: '100%', marginTop: '14px', padding: '12px',
                        background: '#ffffff', border: '1px solid #d0dcd4',
                        borderRadius: '12px', fontSize: '0.78rem', fontWeight: 700,
                        color: '#008751', cursor: 'pointer', display: 'flex',
                        alignItems: 'center', justifyContent: 'center', gap: '6px',
                        boxShadow: '0 2px 6px rgba(0,0,0,0.04)',
                        fontFamily: "'Plus Jakarta Sans', sans-serif"
                    }}
                >
                    <ChevronDown size={16} color="#008751" />
                    Show More ({filtered.length - visibleCount} remaining)
                </button>
            )}
        </>
    )
}