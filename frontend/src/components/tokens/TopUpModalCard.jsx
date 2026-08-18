import { TokenCounter } from './TokenCounter'

export function TopUpModalCard({
    selected,
    tokens,
    setTokens,
    rate,
    error,
    topping,
    onCancel,
    onSubmit
}) {
    return (
        <div style={{
            background: '#ffffff',
            borderRadius: '18px',
            padding: '20px',
            boxShadow: '0 2px 12px rgba(0,0,0,0.07)',
            marginBottom: '14px',
            border: '2px solid #008751'
        }}>
            <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#0d1b12', marginBottom: '2px' }}>
                {selected.first_name} {selected.last_name}
            </div>
            <div style={{ fontSize: '0.72rem', color: '#8fa396', marginBottom: '16px' }}>
                {selected.state_code} · Current balance: {selected.token_balance} tokens
            </div>

            {error && (
                <div style={{
                    background: '#fff0f0',
                    color: '#e53e3e',
                    fontSize: '0.8rem',
                    padding: '10px 14px',
                    borderRadius: '10px',
                    marginBottom: '12px'
                }}>
                    {error}
                </div>
            )}

            <TokenCounter tokens={tokens} rate={rate} onChange={setTokens} />

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                <button
                    onClick={onCancel}
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
                    onClick={onSubmit}
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
                        fontFamily: "'Plus Jakarta Sans', sans-serif"
                    }}
                >
                    {topping ? 'Adding...' : 'Add Tokens'}
                </button>
            </div>
        </div>
    )
}