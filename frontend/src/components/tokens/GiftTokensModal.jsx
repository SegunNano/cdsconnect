import { useState } from 'react'
import { Gift, PartyPopper } from 'lucide-react'
import ModalShell from '../common/ModalShell'
import StateCodeInput from '../common/StateCodeInput'
import { TokenCounter } from './TokenCounter'
import { transferTokens } from '../../services/tokens.service'
import { RATE } from '../../constants'
import { labelStyle, btn, errorBox } from './styles'

export default function GiftTokensModal({ onClose, onSent }) {
    const [stateCode, setStateCode] = useState('')
    const [amount, setAmount] = useState(1)
    const [sending, setSending] = useState(false)
    const [error, setError] = useState('')
    const [success, setSuccess] = useState('')

    const submit = async (e) => {
        e.preventDefault()
        setError('')
        const tokens = parseInt(amount, 10)
        if (isNaN(tokens) || tokens < 1) return setError('Please enter a valid number of tokens.')

        setSending(true)
        try {
            const res = await transferTokens(stateCode.trim(), tokens)
            const data = res?.data || res
            setSuccess(`Sent ${tokens} token(s) to ${data?.recipient_name || 'member'}!`)
            await onSent?.()
            setTimeout(onClose, 1200)
        } catch (err) {
            setError(err.response?.data?.message || err.message || 'Transfer failed.')
        } finally {
            setSending(false)
        }
    }

    return (
        <ModalShell title="Gift Tokens" icon={<Gift size={18} color="#008751" />} onClose={onClose}>
            {error && <div style={errorBox}>{error}</div>}
            {success && (
                <div style={{
                    background: '#e6f4ee', color: '#008751', fontSize: '0.8rem', fontWeight: 600,
                    padding: '10px 14px', borderRadius: '10px', marginBottom: '12px',
                    display: 'flex', alignItems: 'center', gap: '8px'
                }}>
                    <PartyPopper size={16} color="#008751" />
                    {success}
                </div>
            )}
            <form onSubmit={submit}>
                <div style={{ marginBottom: '16px' }}>
                    <label style={labelStyle}>Recipient State Code</label>
                    <StateCodeInput value={stateCode} onChange={setStateCode} disabled={sending} />
                </div>
                <div style={{ marginBottom: '20px' }}>
                    <label style={labelStyle}>Number of Tokens</label>
                    <TokenCounter tokens={amount} rate={RATE} onChange={setAmount} />
                </div>
                <button type="submit" disabled={sending || !!success} style={btn('#008751', 'white', sending || !!success)}>
                    {sending ? 'Sending...' : 'Send Tokens'}
                </button>
            </form>
        </ModalShell>
    )
}