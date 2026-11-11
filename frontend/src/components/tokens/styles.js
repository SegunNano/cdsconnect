export const FONT = "'Plus Jakarta Sans', sans-serif"

export const card = {
    background: '#ffffff', borderRadius: '14px', padding: '14px 16px',
    boxShadow: '0 2px 12px rgba(0,0,0,0.07)'
}

export const sectionTitle = {
    fontSize: '0.75rem', fontWeight: 700, color: '#8fa396',
    textTransform: 'uppercase', letterSpacing: '0.8px', margin: '0 0 10px'
}

export const labelStyle = {
    display: 'block', fontSize: '0.68rem', fontWeight: 600, color: '#4a5e52',
    textTransform: 'uppercase', marginBottom: '8px'
}

export const inputStyle = {
    width: '100%', background: '#f2f4f7', border: 'none', borderRadius: '12px',
    padding: '13px 14px', fontSize: '0.88rem', color: '#0d1b12', outline: 'none',
    fontFamily: FONT, boxSizing: 'border-box'
}

export const errorBox = {
    background: '#fff0f0', color: '#e53e3e', fontSize: '0.8rem',
    padding: '10px 14px', borderRadius: '10px', marginBottom: '12px'
}

export const btn = (bg, color, disabled = false) => ({
    background: bg, color, border: 'none', borderRadius: '12px', padding: '13px',
    fontSize: '0.88rem', fontWeight: 700, fontFamily: FONT, width: '100%',
    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
    cursor: disabled ? 'not-allowed' : 'pointer', opacity: disabled ? 0.6 : 1
})