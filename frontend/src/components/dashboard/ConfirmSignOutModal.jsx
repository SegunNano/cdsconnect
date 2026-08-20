export function ConfirmSignOutModal({
  confirming,
  form,
  setForm,
  signingOut,
  error,
  onCancel,
  onSubmit
}) {
  if (!confirming) return null

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
      onClick={onCancel} // Close on backdrop click
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
        onClick={(e) => e.stopPropagation()} // Prevent backdrop click when clicking inside content
      >
        <div
          style={{
            fontSize: '0.95rem',
            fontWeight: 700,
            color: '#0d1b12',
            marginBottom: '4px'
          }}
        >
          Verify Member — No. {confirming.sequence_number || confirming.id}
        </div>
        <div
          style={{
            fontSize: '0.75rem',
            color: '#8fa396',
            marginBottom: '16px'
          }}
        >
          Confirm manual details
        </div>

        {error && (
          <div
            style={{
              background: '#fff0f0',
              color: '#e53e3e',
              fontSize: '0.8rem',
              padding: '10px 12px',
              borderRadius: '10px',
              marginBottom: '12px'
            }}
          >
            {error}
          </div>
        )}

        <div style={{ marginBottom: '16px' }}>
          <input
            type="text"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="Full name"
            style={{
              width: '100%',
              background: '#f2f4f7',
              border: 'none',
              borderRadius: '10px',
              padding: '12px 14px',
              fontSize: '0.85rem',
              outline: 'none',
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              marginBottom: '8px',
              boxSizing: 'border-box'
            }}
          />
          <input
            type="text"
            value={form.stateCode}
            onChange={(e) =>
              setForm({ ...form, stateCode: e.target.value.toUpperCase() })
            }
            placeholder="State code"
            style={{
              width: '100%',
              background: '#f2f4f7',
              border: 'none',
              borderRadius: '10px',
              padding: '12px 14px',
              fontSize: '0.85rem',
              outline: 'none',
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              boxSizing: 'border-box'
            }}
          />
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '10px'
          }}
        >
          <button
            type="button"
            onClick={onCancel}
            style={{
              background: '#f2f4f7',
              border: 'none',
              borderRadius: '10px',
              padding: '12px',
              cursor: 'pointer',
              fontSize: '0.82rem',
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
            disabled={signingOut || !form.name || !form.stateCode}
            style={{
              background: '#008751',
              border: 'none',
              borderRadius: '10px',
              padding: '12px',
              cursor: signingOut || !form.name || !form.stateCode ? 'not-allowed' : 'pointer',
              fontSize: '0.82rem',
              fontWeight: 600,
              color: 'white',
              opacity: signingOut || !form.name || !form.stateCode ? 0.6 : 1,
              fontFamily: "'Plus Jakarta Sans', sans-serif"
            }}
          >
            {signingOut ? 'Verifying...' : 'Confirm'}
          </button>
        </div>
      </div>
    </div>
  )
}