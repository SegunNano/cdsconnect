import { useRef, useEffect } from 'react'

export default function StateCodeInput({ value, onChange, disabled }) {
    const ref1 = useRef()
    const ref2 = useRef()
    const ref3 = useRef()

    const parts = value ? value.split('/') : ['', '', '']
    const part1 = parts[0] || ''
    const part2 = parts[1] || ''
    const part3 = parts[2] || ''

    // Automatically focus Part 3 when Batch & Stream populates part1 and part2
    useEffect(() => {
        if (disabled) return

        if (part1 && part2 && !part3) {
            ref3.current?.focus()
        } else if (!part1) {
            ref1.current?.focus()
        }
    }, [part1, part2, disabled])

    const handleChange = (part, val, nextRef) => {
        let newParts = [part1, part2, part3]

        if (part === 1) newParts[0] = val.toUpperCase().slice(0, 2)
        if (part === 2) newParts[1] = val.toUpperCase().slice(0, 3)
        if (part === 3) {
            // Strictly enforce numbers only by stripping any non-numeric characters
            newParts[2] = val.replace(/\D/g, '').slice(0, 5)
        }

        // Auto-advance cursor when max length reached during manual typing
        if (nextRef && val.length >= (part === 1 ? 2 : part === 2 ? 3 : 4)) {
            nextRef.current?.focus()
        }

        onChange(newParts.join('/'))
    }

    const handleKeyDown = (part, e, prevRef) => {
        if (e.key === 'Backspace') {
            if (part === 2 && part2 === '') prevRef.current?.focus()
            if (part === 3 && part3 === '') prevRef.current?.focus()
        }
    }

    const inputStyle = {
        background: disabled ? '#f8f9fa' : '#f2f4f7',
        border: 'none',
        borderRadius: '12px',
        padding: '14px 0',
        fontSize: '0.95rem',
        color: '#0d1b12',
        outline: 'none',
        fontFamily: "'Plus Jakarta Sans', sans-serif",
        textAlign: 'center',
        fontWeight: 600,
        letterSpacing: '1px',
        width: '100%',
        cursor: disabled ? 'not-allowed' : 'text'
    }

    return (
        <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr auto 1fr auto 1fr',
            alignItems: 'center',
            gap: '6px'
        }}>
            {/* Part 1 — State code prefix (e.g. LA) */}
            <input
                ref={ref1}
                type="text"
                value={part1}
                disabled={disabled}
                onChange={e => handleChange(1, e.target.value, ref2)}
                onKeyDown={e => handleKeyDown(1, e, null)}
                placeholder="LA"
                maxLength={2}
                style={inputStyle}
            />

            <div style={{ color: '#8fa396', fontWeight: 700, fontSize: '1.1rem', textAlign: 'center' }}>/</div>

            {/* Part 2 — Year + Batch (e.g. 26B) */}
            <input
                ref={ref2}
                type="text"
                value={part2}
                disabled={disabled}
                onChange={e => handleChange(2, e.target.value, ref3)}
                onKeyDown={e => handleKeyDown(2, e, ref1)}
                placeholder="26B"
                maxLength={3}
                style={inputStyle}
            />

            <div style={{ color: '#8fa396', fontWeight: 700, fontSize: '1.1rem', textAlign: 'center' }}>/</div>

            {/* Part 3 — Serial Number (Strictly Numeric) */}
            <input
                ref={ref3}
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                value={part3}
                disabled={disabled}
                onChange={e => handleChange(3, e.target.value, null)}
                onKeyDown={e => handleKeyDown(3, e, ref2)}
                placeholder="4658"
                maxLength={5}
                style={inputStyle}
            />
        </div>
    )
}