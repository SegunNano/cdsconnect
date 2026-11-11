import { useState } from 'react'
import { Copy, Check } from 'lucide-react'
import { FONT } from './styles'

export default function CopyButton({ text }) {
    const [copied, setCopied] = useState(false)

    const copy = async () => {
        try {
            await navigator.clipboard.writeText(String(text))
            setCopied(true)
            setTimeout(() => setCopied(false), 1500)
        } catch { /* clipboard blocked: the text can still be selected by hand */ }
    }

    return (
        <button
            type="button" onClick={copy}
            style={{
                background: '#e6f4ee', border: 'none', borderRadius: '8px', padding: '5px 9px',
                cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '4px',
                fontSize: '0.68rem', fontWeight: 700, color: '#008751', fontFamily: FONT
            }}
        >
            {copied ? <Check size={12} /> : <Copy size={12} />}
            {copied ? 'Copied' : 'Copy'}
        </button>
    )
}