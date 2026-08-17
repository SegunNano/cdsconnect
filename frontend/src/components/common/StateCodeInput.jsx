import { useRef } from 'react'

export default function StateCodeInput({ value, onChange }) {
    const ref1 = useRef()
    const ref2 = useRef()
    const ref3 = useRef()

    // Split existing value back into parts
    const parts = value ? value.split('/') : ['', '', '']
    const part1 = parts[0] || ''
    const part2 = parts[1] || ''
    const part3 = parts[2] || ''

    const handleChange = (part, val, nextRef) => {
        let newParts = [part1, part2, part3]

        if (part === 1) newParts[0] = val.toUpperCase().slice(0, 2)
        if (part === 2) newParts[1] = val.toUpperCase().slice(0, 3)
        if (part === 3) newParts[2] = val.toUpperCase().slice(0, 4)

        // Auto advance to next input
        if (nextRef && val.length >= (part === 1 ? 2 : part === 2 ? 3 : 4)) {
            nextRef.current?.focus()
        }

        onChange(newParts.join('/'))
    }

    const handleKeyDown = (part, e, prevRef) => {
        // Go back on backspace if empty
        if (e.key === 'Backspace') {
            if (part === 2 && part2 === '') prevRef.current?.focus()
            if (part === 3 && part3 === '') prevRef.current?.focus()
        }
    }

    const inputStyle = {
        background: '#f2f4f7',
        border: 'none',
        borderRadius: '12px',
        padding: '14px 0',
        fontSize: '0.95rem',
        color: '#0d1b12',
        outline: 'none',
        fontFamily: "'Plus Jakarta Sans', sans-serif",
        textAlign: 'center',
        fontWeight: 600,
        letterSpacing: '2px',
        width: '100%'
    }

    return (
        <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr auto 1fr auto 1fr',
            alignItems: 'center',
            gap: '6px'
        }}>
            {/* Part 1 — e.g. LA */}
            <input
                ref={ref1}
                type="text"
                value={part1}
                onChange={e => handleChange(1, e.target.value, ref2)}
                onKeyDown={e => handleKeyDown(1, e, null)}
                placeholder="LA"
                maxLength={2}
                style={inputStyle}
            />

            <div style={{ color: '#8fa396', fontWeight: 700, fontSize: '1.1rem', textAlign: 'center' }}>/</div>

            {/* Part 2 — e.g. 26B */}
            <input
                ref={ref2}
                type="text"
                value={part2}
                onChange={e => handleChange(2, e.target.value, ref3)}
                onKeyDown={e => handleKeyDown(2, e, ref1)}
                placeholder="26B"
                maxLength={3}
                style={inputStyle}
            />

            <div style={{ color: '#8fa396', fontWeight: 700, fontSize: '1.1rem', textAlign: 'center' }}>/</div>

            {/* Part 3 — e.g. 4658 */}
            <input
                ref={ref3}
                type="text"
                value={part3}
                onChange={e => handleChange(3, e.target.value, null)}
                onKeyDown={e => handleKeyDown(3, e, ref2)}
                placeholder="4658"
                maxLength={4}
                style={inputStyle}
            />
        </div>
    )
}