import { Search, X } from 'lucide-react'

export function SearchBar({
    value,
    onChange,
    placeholder = 'Search...'
}) {
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
                onChange={e => onChange(e.target.value)}
                placeholder={placeholder}
                style={{
                    flex: 1,
                    minWidth: 0,
                    border: 'none',
                    outline: 'none',
                    fontSize: '0.85rem',
                    color: '#0d1b12',
                    fontFamily: "'Plus Jakarta Sans', sans-serif",
                    background: 'transparent'
                }}
            />

            {value && (
                <button
                    type="button"
                    onClick={() => onChange('')}
                    aria-label="Clear search"
                    title="Clear search"
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        border: 'none',
                        background: 'transparent',
                        color: '#8fa396',
                        cursor: 'pointer',
                        padding: '4px',
                        borderRadius: '6px'
                    }}
                >
                    <X size={16} />
                </button>
            )}
        </div>
    )
}