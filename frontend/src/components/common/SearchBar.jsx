import { Search } from 'lucide-react'

export function SearchBar({ value, onChange, placeholder = 'Search...' }) {
    return (
        <div style={{
            background: '#ffffff',
            borderRadius: '14px',
            padding: '12px 16px',
            boxShadow: '0 2px 12px rgba(0,0,0,0.07)',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            marginBottom: '12px'
        }}>
            <Search size={16} color="#8fa396" />
            <input
                type="text"
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                style={{
                    flex: 1,
                    border: 'none',
                    outline: 'none',
                    fontSize: '0.85rem',
                    color: '#0d1b12',
                    fontFamily: "'Plus Jakarta Sans', sans-serif",
                    background: 'transparent'
                }}
            />
        </div>
    )
}