import { useState } from 'react'
import { Coins } from 'lucide-react'
import { getItemConfig } from '../../utils/tokenHistory'
import { formatDate } from '../../utils/dates'
import { card, sectionTitle, FONT } from './styles'

const PAGE = 15

export default function HistoryList({ history, loading }) {
    const [visible, setVisible] = useState(PAGE)

    return (
        <>
            <div style={sectionTitle}>Transactions</div>

            {loading && (
                <div style={{ textAlign: 'center', color: '#8fa396', fontSize: '0.82rem', padding: '40px 0' }}>Loading...</div>
            )}

            {!loading && history.length === 0 && (
                <div style={{ ...card, borderRadius: '18px', padding: '40px 20px', textAlign: 'center' }}>
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
                {history.slice(0, visible).map((item, i) => {
                    const c = getItemConfig(item)
                    return (
                        <div key={`${item.type}-${item.created_at}-${i}`} style={{ ...card, display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <div style={{
                                width: '40px', height: '40px', borderRadius: '12px', background: c.iconBg,
                                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
                            }}>
                                {c.icon}
                            </div>
                            <div style={{ flex: 1, minWidth: 0 }}>
                                <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#0d1b12', marginBottom: '2px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                    {c.title}
                                </div>
                                <div style={{ fontSize: '0.7rem', color: '#8fa396' }}>
                                    {c.subtitle} · {formatDate(item.created_at)}
                                </div>
                            </div>
                            <div style={{ fontSize: '0.95rem', fontWeight: 800, color: c.color, flexShrink: 0 }}>
                                {c.amount}
                            </div>
                        </div>
                    )
                })}
            </div>

            {history.length > visible && (
                <button
                    onClick={() => setVisible(v => v + PAGE)}
                    style={{
                        width: '100%', marginTop: '10px', background: '#ffffff', border: '1px solid #e8ece9',
                        borderRadius: '12px', padding: '11px', fontSize: '0.78rem', fontWeight: 600,
                        color: '#4a5e52', cursor: 'pointer', fontFamily: FONT
                    }}
                >
                    Show more ({history.length - visible} remaining)
                </button>
            )}
        </>
    )
}