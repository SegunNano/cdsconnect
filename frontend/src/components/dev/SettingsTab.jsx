import { ShieldAlert, CheckCircle2, XCircle } from 'lucide-react'

export default function SettingsTab({ regStatus, card, sectionHead, onToggle }) {
    const isRegOpen = regStatus?.registration_open

    return (
        <>
            <div style={sectionHead}>System Controls</div>

            <div style={card}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                    <div>
                        <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#0d1b12' }}>
                            Member Registration
                        </div>
                        <div style={{ fontSize: '0.75rem', color: '#8fa396', marginTop: '2px' }}>
                            Allow new users to create accounts
                        </div>
                    </div>

                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        padding: '4px 10px',
                        borderRadius: '20px',
                        fontSize: '0.72rem',
                        fontWeight: 700,
                        background: isRegOpen ? '#e6f4ee' : '#fff0f0',
                        color: isRegOpen ? '#008751' : '#e53e3e'
                    }}>
                        {isRegOpen ? (
                            <>
                                <CheckCircle2 size={12} /> OPEN
                            </>
                        ) : (
                            <>
                                <XCircle size={12} /> CLOSED
                            </>
                        )}
                    </div>
                </div>

                <button
                    onClick={onToggle}
                    style={{
                        width: '100%',
                        background: isRegOpen ? '#fff0f0' : '#e6f4ee',
                        color: isRegOpen ? '#e53e3e' : '#008751',
                        border: `1px solid ${isRegOpen ? '#fecaca' : '#a7f3d0'}`,
                        borderRadius: '12px',
                        padding: '12px',
                        cursor: 'pointer',
                        fontSize: '0.82rem',
                        fontWeight: 700,
                        fontFamily: "'Plus Jakarta Sans', sans-serif"
                    }}
                >
                    {isRegOpen ? 'Close Registration' : 'Open Registration'}
                </button>
            </div>

            <div style={{ ...card, background: '#fefce8', border: '1px solid #fef08a' }}>
                <div style={{ display: 'flex', gap: '10px' }}>
                    <ShieldAlert size={20} color="#ca8a04" style={{ flexShrink: 0 }} />
                    <div style={{ fontSize: '0.75rem', color: '#854d0e', lineHeight: 1.4 }}>
                        <strong>Security Policy:</strong> Closing registration prevents unauthorized passkey registrations and device locks while meetings are active.
                    </div>
                </div>
            </div>
        </>
    )
}