import { Plus, Minus } from 'lucide-react'

export function TokenCounter({ tokens, rate, onChange }) {
    return (
        <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: '#f2f4f7',
            borderRadius: '14px',
            padding: '12px 16px',
            marginBottom: '8px'
        }}>
            <button
                type="button"
                onClick={() => onChange(Math.max(1, tokens - 1))}
                style={{
                    width: '36px',
                    height: '36px',
                    background: '#ffffff',
                    border: 'none',
                    borderRadius: '10px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                }}
            >
                <Minus size={16} color="#4a5e52" />
            </button>

            <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#008751', lineHeight: 1 }}>
                    {tokens}
                </div>
                <div style={{ fontSize: '0.68rem', color: '#8fa396', marginTop: '2px' }}>
                    token{tokens !== 1 ? 's' : ''} = ₦{(tokens * rate).toLocaleString()}
                </div>
            </div>

            <button
                type="button"
                onClick={() => onChange(tokens + 1)}
                style={{
                    width: '36px',
                    height: '36px',
                    background: '#008751',
                    border: 'none',
                    borderRadius: '10px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                }}
            >
                <Plus size={16} color="white" />
            </button>
        </div>
    )
}