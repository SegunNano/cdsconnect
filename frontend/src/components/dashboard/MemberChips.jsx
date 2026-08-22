import { Users } from 'lucide-react'

export function MemberChips({ stateCode, breakoutSession }) {
    const chipStyle = (color = '#008751', bg = '#e6f4ee') => ({
        display: 'inline-flex',
        alignItems: 'center',
        gap: '5px',
        background: bg,
        color: color,
        fontSize: '0.72rem',
        fontWeight: 600,
        padding: '5px 10px',
        borderRadius: '20px'
    })

    return (
        <div style={{
            background: '#ffffff',
            padding: '0 20px 16px',
            display: 'flex',
            gap: '6px'
        }}>
            <div style={chipStyle()}>
                <div style={{ width: '6px', height: '6px', background: '#008751', borderRadius: '50%' }} />
                {stateCode}
            </div>
            <div style={chipStyle('#d4900a', '#fff8e6')}>
                <Users size={10} color="#d4900a" />
                {breakoutSession}
            </div>
        </div>
    )
}