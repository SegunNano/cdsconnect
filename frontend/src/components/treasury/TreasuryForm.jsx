import { AlertCircle } from 'lucide-react'

export function TreasuryForm({
    showForm,
    canLog,
    logType,
    setLogType,
    setError,
    error,
    form,
    setForm,
    submitting,
    onSubmit,
    inputStyle,
    labelStyle
}) {
    if (!showForm || !canLog) return null

    return (
        <div style={{
            background: '#ffffff', borderRadius: '18px',
            padding: '20px', boxShadow: '0 2px 12px rgba(0,0,0,0.07)',
            marginBottom: '16px'
        }}>
            {/* TYPE TOGGLE */}
            <div style={{
                display: 'flex', background: '#f2f4f7',
                borderRadius: '12px', padding: '4px',
                marginBottom: '16px', gap: '4px'
            }}>
                {['expense', 'income'].map(type => (
                    <button
                        key={type}
                        onClick={() => { setLogType(type); setError('') }}
                        style={{
                            flex: 1, padding: '9px',
                            background: logType === type ? '#ffffff' : 'transparent',
                            border: 'none', borderRadius: '10px',
                            cursor: 'pointer', fontSize: '0.82rem',
                            fontWeight: 600,
                            color: logType === type
                                ? type === 'expense' ? '#e53e3e' : '#008751'
                                : '#8fa396',
                            boxShadow: logType === type ? '0 1px 4px rgba(0,0,0,0.08)' : 'none',
                            fontFamily: "'Plus Jakarta Sans', sans-serif",
                            transition: 'all 0.15s'
                        }}
                    >
                        {type === 'expense' ? 'Log Expense' : 'Log Income'}
                    </button>
                ))}
            </div>

            {error && (
                <div style={{
                    background: '#fff0f0', color: '#e53e3e',
                    fontSize: '0.8rem', padding: '10px 14px',
                    borderRadius: '10px', marginBottom: '12px',
                    display: 'flex', alignItems: 'center', gap: '6px'
                }}>
                    <AlertCircle size={14} color="#e53e3e" />
                    {error}
                </div>
            )}

            <form onSubmit={onSubmit}>
                <div style={{ marginBottom: '12px' }}>
                    <label style={labelStyle}>Amount (₦)</label>
                    <input
                        type="number" min="1"
                        value={form.amount}
                        onChange={e => setForm({ ...form, amount: e.target.value })}
                        placeholder="e.g. 5000"
                        required style={inputStyle}
                    />
                </div>
                <div style={{ marginBottom: logType === 'income' ? '12px' : '16px' }}>
                    <label style={labelStyle}>Description</label>
                    <input
                        type="text"
                        value={form.description}
                        onChange={e => setForm({ ...form, description: e.target.value })}
                        placeholder={logType === 'expense' ? 'e.g. Printing — clearance slips' : 'e.g. LGA sponsorship'}
                        required style={inputStyle}
                    />
                </div>
                {logType === 'income' && (
                    <div style={{ marginBottom: '16px' }}>
                        <label style={labelStyle}>Source</label>
                        <input
                            type="text"
                            value={form.source}
                            onChange={e => setForm({ ...form, source: e.target.value })}
                            placeholder="e.g. LGA, External sponsor"
                            required style={inputStyle}
                        />
                    </div>
                )}
                <button
                    type="submit" disabled={submitting}
                    style={{
                        width: '100%',
                        background: submitting ? '#c2e0cf'
                            : logType === 'expense' ? '#e53e3e' : '#008751',
                        border: 'none', borderRadius: '12px',
                        padding: '13px', cursor: submitting ? 'not-allowed' : 'pointer',
                        fontSize: '0.88rem', fontWeight: 700,
                        color: 'white',
                        fontFamily: "'Plus Jakarta Sans', sans-serif"
                    }}
                >
                    {submitting ? 'Logging...'
                        : logType === 'expense' ? 'Log Expense' : 'Log Income'}
                </button>
            </form>
        </div>
    )
}