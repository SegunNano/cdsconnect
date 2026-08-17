import { useRef } from 'react'

export default function PinInput({ value = '', onChange }) {
    const inputs = useRef([])

    // Always maintain exactly 4 PIN slots
    const pins = Array.from(
        { length: 4 },
        (_, index) => value[index] || ''
    )

    const focusInput = (index) => {
        if (index >= 0 && index < 4) {
            inputs.current[index]?.focus()
        }
    }

    const handleChange = (index, val) => {
        // Only allow numbers
        if (!/^\d*$/.test(val)) return

        const digit = val.slice(-1)

        const newPins = [...pins]
        newPins[index] = digit

        onChange(newPins.join(''))

        // Move to the next input after entering a digit
        if (digit && index < 3) {
            focusInput(index + 1)
        }
    }

    const handleKeyDown = (index, e) => {
        if (e.key === 'Backspace') {
            // If current input has a value, clear it
            if (pins[index]) {
                const newPins = [...pins]
                newPins[index] = ''

                onChange(newPins.join(''))
                return
            }

            // If current input is empty, move backwards
            if (index > 0) {
                focusInput(index - 1)
            }
        }

        // Move backwards with ArrowLeft
        if (e.key === 'ArrowLeft' && index > 0) {
            focusInput(index - 1)
        }

        // Move forwards with ArrowRight
        if (e.key === 'ArrowRight' && index < 3) {
            focusInput(index + 1)
        }
    }

    const handlePaste = (e) => {
        e.preventDefault()

        const pasted = e.clipboardData
            .getData('text')
            .replace(/\D/g, '')
            .slice(0, 4)

        if (!pasted) return

        onChange(pasted)

        // Focus the next empty input,
        // or the last input if all four are filled
        const focusIndex = Math.min(pasted.length, 3)

        focusInput(focusIndex)
    }

    return (
        <div
            style={{
                display: 'flex',
                gap: '12px',
                justifyContent: 'center'
            }}
        >
            {pins.map((pin, index) => (
                <input
                    key={index}
                    ref={(element) => {
                        inputs.current[index] = element
                    }}
                    type="password"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    maxLength={1}
                    value={pin}
                    onChange={(e) => {
                        handleChange(index, e.target.value)
                    }}
                    onKeyDown={(e) => {
                        handleKeyDown(index, e)
                    }}
                    onPaste={handlePaste}
                    autoComplete={
                        index === 0 ? 'one-time-code' : 'off'
                    }
                    aria-label={`PIN digit ${index + 1}`}
                    style={{
                        width: '56px',
                        height: '56px',
                        background: '#f2f4f7',
                        border: pin
                            ? '2px solid #008751'
                            : '2px solid transparent',
                        borderRadius: '14px',
                        fontSize: '1.4rem',
                        fontWeight: 700,
                        color: '#0d1b12',
                        textAlign: 'center',
                        outline: 'none',
                        fontFamily: "'Plus Jakarta Sans', sans-serif",
                        transition: 'border 0.15s',
                        caretColor: 'transparent'
                    }}
                />
            ))}
        </div>
    )
}