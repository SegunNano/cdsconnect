import { Search, Shield, Smartphone, UserX, ChevronDown, ChevronUp } from 'lucide-react'

export default function MembersTab({
    members,
    search,
    setSearch,
    loading,
    selectedMember,
    setSelectedMember,
    onRoleUpdate,
    onToggleDev,
    onResetDevice,
    onDeactivate,
    currentMemberId
}) {
    const card = {
        background: '#ffffff',
        borderRadius: '14px',
        padding: '16px',
        boxShadow: '0 2px 12px rgba(0,0,0,0.07)',
        marginBottom: '10px'
    }

    const badgeStyle = (bgColor, textColor) => ({
        padding: '2px 8px',
        borderRadius: '12px',
        fontSize: '0.65rem',
        fontWeight: 700,
        textTransform: 'uppercase',
        background: bgColor,
        color: textColor
    })

    const actionBtnStyle = {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '6px',
        width: '100%',
        padding: '10px',
        borderRadius: '10px',
        border: 'none',
        fontSize: '0.75rem',
        fontWeight: 600,
        cursor: 'pointer',
        fontFamily: "'Plus Jakarta Sans', sans-serif",
        marginBottom: '8px'
    }

    return (
        <>
            {/* SEARCH INPUT */}
            <div style={{ position: 'relative', marginBottom: '14px' }}>
                <Search
                    size={16}
                    color="#8fa396"
                    style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }}
                />
                <input
                    type="text"
                    placeholder="Search by name or state code..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    style={{
                        width: '100%',
                        background: '#ffffff',
                        border: '1px solid #e8ece9',
                        borderRadius: '12px',
                        padding: '12px 14px 12px 40px',
                        fontSize: '0.85rem',
                        color: '#0d1b12',
                        outline: 'none',
                        fontFamily: "'Plus Jakarta Sans', sans-serif"
                    }}
                />
            </div>

            {loading ? (
                <div style={{ ...card, textAlign: 'center', color: '#8fa396', fontSize: '0.82rem' }}>
                    Loading members...
                </div>
            ) : members.length === 0 ? (
                <div style={{ ...card, textAlign: 'center', color: '#8fa396', fontSize: '0.82rem' }}>
                    No members found
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {members.map(m => {
                        const isExpanded = selectedMember === m.id
                        const isSelf = m.id === currentMemberId

                        return (
                            <div key={m.id} style={card}>
                                {/* MEMBER ROW SUMMARY */}
                                <div
                                    onClick={() => setSelectedMember(isExpanded ? null : m.id)}
                                    style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }}
                                >
                                    <div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '2px' }}>
                                            <span style={{ fontSize: '0.9rem', fontWeight: 700, color: '#0d1b12' }}>
                                                {m.first_name} {m.last_name}
                                            </span>
                                            {m.is_dev && (
                                                <span style={badgeStyle('#e6f4ee', '#008751')}>DEV</span>
                                            )}
                                            {!m.is_active && (
                                                <span style={badgeStyle('#fff0f0', '#e53e3e')}>INACTIVE</span>
                                            )}
                                        </div>
                                        <div style={{ fontSize: '0.72rem', color: '#8fa396' }}>
                                            {m.state_code} · <span style={{ textTransform: 'capitalize' }}>{m.role}</span>
                                        </div>
                                    </div>
                                    <div>
                                        {isExpanded ? <ChevronUp size={18} color="#8fa396" /> : <ChevronDown size={18} color="#8fa396" />}
                                    </div>
                                </div>

                                {/* EXPANDED DETAILS & ACTIONS */}
                                {isExpanded && (
                                    <div style={{ marginTop: '14px', paddingTop: '14px', borderTop: '1px solid #e8ece9' }}>
                                        {/* ROLE SELECTION */}
                                        <div style={{ marginBottom: '12px' }}>
                                            <label style={{ display: 'block', fontSize: '0.68rem', fontWeight: 600, color: '#4a5e52', uppercase: 'true', marginBottom: '6px' }}>
                                                CHANGE ROLE
                                            </label>
                                            <select
                                                value={m.role}
                                                disabled={isSelf}
                                                onChange={e => onRoleUpdate(m.id, e.target.value)}
                                                style={{
                                                    width: '100%',
                                                    padding: '10px',
                                                    borderRadius: '10px',
                                                    border: '1px solid #e8ece9',
                                                    background: '#f2f4f7',
                                                    fontSize: '0.8rem',
                                                    fontWeight: 600,
                                                    color: '#0d1b12',
                                                    outline: 'none'
                                                }}
                                            >
                                                <option value="member">Member</option>
                                                <option value="exco">EXCO</option>
                                                <option value="admin">Admin</option>
                                            </select>
                                        </div>

                                        {/* ACTION BUTTONS */}
                                        <button
                                            onClick={() => onToggleDev(m.id)}
                                            disabled={isSelf}
                                            style={{
                                                ...actionBtnStyle,
                                                background: m.is_dev ? '#fef3c7' : '#e6f4ee',
                                                color: m.is_dev ? '#b45309' : '#008751',
                                                opacity: isSelf ? 0.5 : 1
                                            }}
                                        >
                                            <Shield size={14} />
                                            {m.is_dev ? 'Revoke Dev Access' : 'Grant Dev Access'}
                                        </button>

                                        <button
                                            onClick={() => onResetDevice(m.id)}
                                            style={{
                                                ...actionBtnStyle,
                                                background: '#f3f4f6',
                                                color: '#374151'
                                            }}
                                        >
                                            <Smartphone size={14} />
                                            Reset Bound Device
                                        </button>

                                        {m.is_active && (
                                            <button
                                                onClick={() => onDeactivate(m.id)}
                                                disabled={isSelf}
                                                style={{
                                                    ...actionBtnStyle,
                                                    background: '#fff0f0',
                                                    color: '#e53e3e',
                                                    marginBottom: 0,
                                                    opacity: isSelf ? 0.5 : 1
                                                }}
                                            >
                                                <UserX size={14} />
                                                Deactivate Member
                                            </button>
                                        )}
                                    </div>
                                )}
                            </div>
                        )
                    })}
                </div>
            )}
        </>
    )
}