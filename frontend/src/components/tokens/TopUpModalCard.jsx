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
        <div
          style={{
            fontSize: '0.92rem',
            fontWeight: 700,
            color: '#0d1b12',
            marginBottom: '2px'
          }}
        >
          {selected.first_name} {selected.last_name}
        </div>
        <div
          style={{
            fontSize: '0.72rem',
            color: '#8fa396',
            marginBottom: '16px'
          }}
        >
          {selected.state_code} · Current balance: {selected.token_balance} tokens
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

        <TokenCounter tokens={tokens} rate={rate} onChange={setTokens} />

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
              opacity: topping ? 0.7 : 1,
              fontFamily: "'Plus Jakarta Sans', sans-serif"
            }}
          >
            {topping ? 'Adding...' : 'Add Tokens'}
          </button>
        </div>
      </div>
    </div>
  )
}