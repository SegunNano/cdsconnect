export function ServiceProgressCard({ member }) {
    const cardSmStyle = {
        background: '#ffffff',
        borderRadius: '12px',
        padding: '16px',
        boxShadow: '0 2px 12px rgba(0,0,0,0.07)',
    }

    const start = new Date(member?.callup_date)
    const end = new Date(member?.service_end)
    const now = new Date()
    const total = end - start
    const elapsed = now - start
    const percent = Math.min(Math.max(Math.round((elapsed / total) * 100), 0), 100)
    const monthsLeft = Math.max(0, Math.round((end - now) / (1000 * 60 * 60 * 24 * 30)))

    return (
        <div style={cardSmStyle}>
            <div style={{ fontSize: '0.68rem', fontWeight: 600, color: '#8fa396', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '6px' }}>
                Service Year
            </div>
            <div style={{ fontSize: '1rem', fontWeight: 800, color: '#0d1b12', lineHeight: 1, marginBottom: '2px' }}>
                {member?.stream_year} Batch {member?.stream_batch}
            </div>
            <div style={{ fontSize: '0.7rem', color: '#8fa396', marginBottom: '10px' }}>
                Ends {new Date(member?.service_end).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
            </div>

            {/* PROGRESS BAR */}
            <div style={{
                width: '100%',
                height: '6px',
                background: '#f2f4f7',
                borderRadius: '3px',
                overflow: 'hidden',
                marginBottom: '6px'
            }}>
                <div style={{
                    height: '100%',
                    width: `${percent}%`,
                    background: percent >= 90
                        ? '#e53e3e'
                        : percent >= 70
                            ? '#d4900a'
                            : '#008751',
                    borderRadius: '3px',
                    transition: 'width 0.5s ease'
                }} />
            </div>
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                fontSize: '0.65rem',
                color: '#8fa396'
            }}>
                <span>{monthsLeft} month{monthsLeft !== 1 ? 's' : ''} left</span>
            </div>
        </div>
    )
}