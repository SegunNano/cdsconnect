import { X } from 'lucide-react'
import { FONT } from '../tokens/styles'

export default function ModalShell({ title, icon, onClose, maxWidth = 350, dismissOnBackdrop = true, children }) {
    return (
        <div
            onClick={dismissOnBackdrop ? onClose : undefined}
            style={{
                position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.55)',
                backdropFilter: 'blur(3px)', display: 'flex', alignItems: 'center',
                justifyContent: 'center', zIndex: 1000, padding: '20px'
            }}
        >
            <div
                onClick={e => e.stopPropagation()}
                style={{
                    background: '#ffffff', borderRadius: '18px', padding: '24px',
                    width: '100%', maxWidth, maxHeight: '90vh', overflowY: 'auto',
                    boxShadow: '0 10px 25px rgba(0,0,0,0.15)', border: '1px solid #e8ece9',
                    fontFamily: FONT, boxSizing: 'border-box'
                }}
            >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.95rem', fontWeight: 700, color: '#0d1b12' }}>
                        {icon}{title}
                    </div>
                    <button
                        onClick={onClose} aria-label="Close"
                        style={{
                            background: '#f2f4f7', border: 'none', borderRadius: '50%',
                            width: '28px', height: '28px', display: 'flex',
                            alignItems: 'center', justifyContent: 'center', cursor: 'pointer'
                        }}
                    >
                        <X size={16} color="#4a5e52" />
                    </button>
                </div>
                {children}
            </div>
        </div>
    )
}