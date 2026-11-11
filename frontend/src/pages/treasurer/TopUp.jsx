import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { HeaderBar } from '../../components/common/HeaderBar'
import DirectTopUp from '../../components/tokens/DirectTopUp'
import TopUpRequests from '../../components/tokens/TopUpRequests'
import usePendingTopUpCount from '../../hooks/usePendingTopUpCount'
import { FONT } from '../../components/tokens/styles'

const TABS = [
    { key: 'direct', label: 'Direct Top Up' },
    { key: 'requests', label: 'Requests' }
]

export default function TopUp() {
    const navigate = useNavigate()
    const [tab, setTab] = useState('direct')
    const { count, refresh } = usePendingTopUpCount()

    return (
        <div style={{
            minHeight: '100vh', background: '#f2f4f7', fontFamily: FONT,
            maxWidth: '390px', margin: '0 auto', paddingBottom: '40px'
        }}>
            <HeaderBar
                title="Top Up Tokens"
                subtitle="Cash top-ups and member requests"
                onBack={() => navigate('/')}
            />

            <div style={{ padding: '16px 20px 0' }}>
                <div style={{
                    display: 'flex', background: '#ffffff', borderRadius: '14px', padding: '4px',
                    gap: '4px', marginBottom: '14px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
                }}>
                    {TABS.map(t => (
                        <button
                            key={t.key} onClick={() => setTab(t.key)}
                            style={{
                                flex: 1, padding: '10px 6px', border: 'none', borderRadius: '10px',
                                cursor: 'pointer', fontSize: '0.78rem', fontWeight: 700, fontFamily: FONT,
                                background: tab === t.key ? '#008751' : 'transparent',
                                color: tab === t.key ? 'white' : '#8fa396',
                                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px'
                            }}
                        >
                            {t.label}
                            {t.key === 'requests' && count > 0 && (
                                <span style={{
                                    background: '#e53e3e', color: 'white', borderRadius: '10px',
                                    fontSize: '0.62rem', padding: '1px 6px', fontWeight: 800
                                }}>
                                    {count}
                                </span>
                            )}
                        </button>
                    ))}
                </div>

                {tab === 'direct' ? <DirectTopUp /> : <TopUpRequests onChanged={refresh} />}
            </div>
        </div>
    )
}