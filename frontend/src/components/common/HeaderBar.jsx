import { ArrowLeft } from 'lucide-react'

export function HeaderBar({ title, subtitle, onBack }) {
    return (
        <div style={{
            background: '#ffffff',
            padding: '52px 20px 16px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            boxShadow: '0 1px 0 #e8ece9'
        }}>
            <div
                onClick={onBack}
                style={{
                    width: '36px',
                    height: '36px',
                    background: '#f2f4f7',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer'
                }}
            >
                <ArrowLeft size={18} color="#4a5e52" />
            </div>
            <div>
                <div style={{ fontSize: '1rem', fontWeight: 700, color: '#0d1b12' }}>{title}</div>
                {subtitle && <div style={{ fontSize: '0.72rem', color: '#8fa396' }}>{subtitle}</div>}
            </div>
        </div>
    )
}