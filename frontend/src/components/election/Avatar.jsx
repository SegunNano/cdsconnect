export default function Avatar({ url, name = '', size = 56 }) {
    const initials = name.split(' ').filter(Boolean).slice(0, 2).map(s => s[0]).join('').toUpperCase()
    const box = { width: size, height: size, borderRadius: Math.round(size * 0.22), flexShrink: 0 }
    return url
        ? <img src={url} alt={name} style={{ ...box, objectFit: 'cover' }} />
        : <div style={{
            ...box, background: '#e6f4ee', color: '#008751', display: 'flex',
            alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: size * 0.32
        }}>{initials}</div>
}