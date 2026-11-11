import { RATE } from '../../constants'
import { sumTokens } from '../../utils/tokenHistory'
import { card } from './styles'

const Stat = ({ label, value, sub, color }) => (
    <div style={{ ...card, padding: '14px 12px', textAlign: 'center' }}>
        <div style={{ fontSize: '0.6rem', fontWeight: 600, color: '#8fa396', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '6px' }}>
            {label}
        </div>
        <div style={{ fontSize: '1.3rem', fontWeight: 800, color }}>{value}</div>
        <div style={{ fontSize: '0.6rem', color: '#8fa396', marginTop: '2px' }}>{sub}</div>
    </div>
)

export default function WalletSummary({ balance, history }) {
    const bought = sumTokens(history, 'topup')
    return (
        <>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '10px' }}>
                <Stat label="Balance" value={balance ?? 0} sub="tokens" color="#008751" />
                <Stat label="Bought" value={bought} sub={`₦${(bought * RATE).toLocaleString()}`} color="#008751" />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px', marginBottom: '14px' }}>
                <Stat label="Used" value={sumTokens(history, 'deduction')} sub="tokens" color="#e53e3e" />
                <Stat label="Sent" value={sumTokens(history, 'transfer_sent')} sub="tokens" color="#e53e3e" />
                <Stat label="Received" value={sumTokens(history, 'transfer_received')} sub="tokens" color="#4f46e5" />
            </div>
        </>
    )
}