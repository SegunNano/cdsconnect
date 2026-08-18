export function MemberListItem({ member, isSelected, onClick }) {
    const initials = `${member.first_name?.[0] || ''}${member.last_name?.[0] || ''}`
    const isZeroBalance = member.token_balance === 0

    return (
        <div
            onClick={onClick}
            style={{
                background: '#ffffff',
                borderRadius: '12px',
                padding: '14px 16px',
                boxShadow: '0 2px 12px rgba(0,0,0,0.07)',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                cursor: 'pointer',
                border: isSelected ? '2px solid #008751' : '2px solid transparent'
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
                {initials}
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
                background: isZeroBalance ? '#fff0f0' : '#e6f4ee',
                color: isZeroBalance ? '#e53e3e' : '#008751',
                fontSize: '0.72rem',
                fontWeight: 700,
                padding: '4px 10px',
                borderRadius: '20px'
            }}>
                {member.token_balance} token{member.token_balance !== 1 ? 's' : ''}
            </div>
        </div>
    )
}