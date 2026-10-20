import { AlertTriangle } from 'lucide-react'

export function TopUpConfirmModal({
    selected,
    tokens,
    rate,
    topping,
    error,
    onCancel,
    onConfirm
}) {
    if (!selected) return null

    return (
        <div
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: 'rgba(0, 0, 0, 0.55)',
                backdropFilter: 'blur(3px)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 1000,
                padding: '20px'
            }}
            onClick={onCancel}
        >
            <div
                style={{
                    background: '#ffffff',
                    borderRadius: '18px',
                    padding: '24px',
                    boxShadow: '0 10px 25px rgba(0,0,0,0.15)',
                    width: '100%',
                    maxWidth: '350px',
                    border: '1px solid #e8ece9'
                }}
                onClick={(e) => e.stopPropagation()}
            >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
                    <div style={{
                        width: '38px', height: '38px', background: '#fffbf0',
                        borderRadius: '10px', display: 'flex', alignItems: 'center',
                        justifyContent: 'center', flexShrink: 0
                    }}>
                        <AlertTriangle size={20} color="#d4900a" />
                    </div>
                    <div>
                        <div style={{ fontSize: '0.92rem', fontWeight: 700, color: '#0d1b12' }}>
                            Confirm Top-Up
                        </div>
                        <div style={{ fontSize: '0.72rem', color: '#8fa396' }}>
                            Please verify details before proceeding
                        </div>
                    </div>
                </div>

                {error && (
                    <div
                        style={{
                            background: '#fff0f0',
                            color: '#e53e3e',
                            fontSize: '0.8rem',
                            padding: '10px 14px',
                            borderRadius: '10px',
                            marginBottom: '12px'
                        }}
                    >
                        {error}
                    </div>
                )}

                <div style={{
                    background: '#f8fdf9', borderRadius: '12px',
                    padding: '14px', marginBottom: '16px', fontSize: '0.82rem',
                    display: 'flex', flexDirection: 'column', gap: '6px', color: '#0d1b12'
                }}>
                    <div><strong>Member:</strong> {selected.first_name} {selected.last_name}</div>
                    <div><strong>State Code:</strong> {selected.state_code}</div>
                    <div><strong>Tokens to Add:</strong> <span style={{ color: '#008751', fontWeight: 700 }}>{tokens} Token{tokens !== 1 ? 's' : ''}</span></div>
                    <div><strong>Cash Equivalent:</strong> <span style={{ color: '#d4900a', fontWeight: 700 }}>₦{(tokens * rate).toLocaleString()}</span></div>
                </div>

                <div
                    style={{
                        display: 'grid',
                        gridTemplateColumns: '1fr 1fr',
                        gap: '10px',
                        marginTop: '16px'
                    }}
                >
                    <button
                        type="button"
                        onClick={onCancel}
                        disabled={topping}
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
                        type="button"
                        onClick={onConfirm}
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
                            opacity: topping ? 0.7 : 1,
                            fontFamily: "'Plus Jakarta Sans', sans-serif"
                        }}
                    >
                        {topping ? 'Processing...' : 'Confirm'}
                    </button>
                </div>
            </div>
        </div>
    )
}