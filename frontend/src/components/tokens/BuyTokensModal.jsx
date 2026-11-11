import { useState } from 'react'
import { Wallet, Upload, CheckCircle } from 'lucide-react'
import ModalShell from '../common/ModalShell'
import { TokenCounter } from './TokenCounter'
import CopyButton from './CopyButton'
import { RATE, MAX_TOKENS_PER_TOPUP } from '../../constants'
import { PAYMENT_ACCOUNT, hasPaymentAccount } from '../../config/paymentAccount'
import { useAuth } from '../../context/AuthContext'
import { submitTopUpRequest } from '../../services/tokens.service'
import { FONT, card, labelStyle, inputStyle, btn, errorBox } from './styles'

const MAX_FILE = 5 * 1024 * 1024

const chip = (active) => ({
    flex: 1, padding: '9px', borderRadius: '10px', cursor: 'pointer', fontFamily: FONT,
    fontSize: '0.82rem', fontWeight: 700, border: active ? '2px solid #008751' : '2px solid transparent',
    background: active ? '#e6f4ee' : '#f2f4f7', color: active ? '#008751' : '#4a5e52'
})

const PayRow = ({ label, value, copy }) => (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px', padding: '9px 0', borderBottom: '1px solid #f2f4f7' }}>
        <div>
            <div style={{ fontSize: '0.65rem', color: '#8fa396', fontWeight: 600, textTransform: 'uppercase' }}>{label}</div>
            <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#0d1b12' }}>{value}</div>
        </div>
        {copy && <CopyButton text={copy} />}
    </div>
)

export default function BuyTokensModal({ onClose, onSubmitted }) {
    const { member } = useAuth()
    const [step, setStep] = useState('amount')   // amount | pay | details | done
    const [tokens, setTokens] = useState(2)
    const [form, setForm] = useState({
        senderName: `${member?.first_name || ''} ${member?.last_name || ''}`.trim(),
        reference: ''
    })
    const [proof, setProof] = useState(null)
    const [submitting, setSubmitting] = useState(false)
    const [error, setError] = useState('')

    const amount = tokens * RATE
    const tooMany = tokens > MAX_TOKENS_PER_TOPUP

    const pickFile = (e) => {
        const file = e.target.files?.[0]
        if (!file) return
        if (file.size > MAX_FILE) {
            setError('Proof must be 5MB or smaller.')
            e.target.value = ''
            return
        }
        setError('')
        setProof(file)
    }

    const submit = async (e) => {
        e.preventDefault()
        setError('')
        if (form.senderName.trim().length < 2) return setError('Enter the name on the account you paid from.')
        if (form.reference.trim().length < 4) return setError('Enter the transfer reference from your bank.')

        setSubmitting(true)
        try {
            await submitTopUpRequest({
                tokensRequested: tokens,
                senderName: form.senderName.trim(),
                transferReference: form.reference.trim(),
                proof
            })
            setStep('done')
            onSubmitted?.()
        } catch (err) {
            setError(err.response?.data?.message || 'Could not submit your request.')
        } finally {
            setSubmitting(false)
        }
    }

    const stepNo = { amount: 1, pay: 2, details: 3 }[step]

    return (
        <ModalShell
            title="Buy Tokens" icon={<Wallet size={18} color="#008751" />}
            onClose={onClose} dismissOnBackdrop={false}
        >
            {stepNo && (
                <div style={{ fontSize: '0.68rem', fontWeight: 600, color: '#8fa396', marginBottom: '14px' }}>
                    STEP {stepNo} OF 3
                </div>
            )}

            {error && <div style={errorBox}>{error}</div>}

            {/* STEP 1: AMOUNT */}
            {step === 'amount' && (
                <>
                    <label style={labelStyle}>How many tokens?</label>
                    <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
                        {[2, 5, 10].map(n => (
                            <button key={n} type="button" onClick={() => setTokens(n)} style={chip(tokens === n)}>{n}</button>
                        ))}
                    </div>
                    <TokenCounter tokens={tokens} rate={RATE} onChange={setTokens} />
                    {tooMany && (
                        <div style={{ ...errorBox, marginTop: '10px', marginBottom: 0 }}>
                            Maximum is {MAX_TOKENS_PER_TOPUP} tokens per request.
                        </div>
                    )}
                    <button
                        onClick={() => setStep('pay')} disabled={tokens < 1 || tooMany}
                        style={{ ...btn('#008751', 'white', tokens < 1 || tooMany), marginTop: '16px' }}
                    >
                        Continue · ₦{amount.toLocaleString()}
                    </button>
                </>
            )}

            {/* STEP 2: PAY */}
            {step === 'pay' && (
                <>
                    {hasPaymentAccount ? (
                        <div style={{ ...card, background: '#f8fdf9', padding: '4px 14px', marginBottom: '14px' }}>
                            {PAYMENT_ACCOUNT.bankName && <PayRow label="Bank" value={PAYMENT_ACCOUNT.bankName} />}
                            <PayRow label="Account number" value={PAYMENT_ACCOUNT.accountNumber} copy={PAYMENT_ACCOUNT.accountNumber} />
                            <PayRow label="Account name" value={PAYMENT_ACCOUNT.accountName} />
                            <PayRow label="Amount to send" value={`₦${amount.toLocaleString()}`} copy={amount} />
                        </div>
                    ) : (
                        <div style={errorBox}>
                            Payment details are not available yet. Please contact the treasurer.
                        </div>
                    )}
                    <div style={{ fontSize: '0.75rem', color: '#4a5e52', lineHeight: 1.5, marginBottom: '14px' }}>
                        Send exactly <b>₦{amount.toLocaleString()}</b> from your bank app, then tap the button below.
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.4fr', gap: '10px' }}>
                        <button onClick={() => setStep('amount')} style={btn('#f2f4f7', '#4a5e52')}>Back</button>
                        <button
                            onClick={() => setStep('details')} disabled={!hasPaymentAccount}
                            style={btn('#008751', 'white', !hasPaymentAccount)}
                        >
                            I have paid
                        </button>
                    </div>
                </>
            )}

            {/* STEP 3: DETAILS */}
            {step === 'details' && (
                <form onSubmit={submit}>
                    <div style={{ marginBottom: '14px' }}>
                        <label style={labelStyle}>Name on the account you paid from</label>
                        <input
                            value={form.senderName} maxLength={100}
                            onChange={e => setForm({ ...form, senderName: e.target.value })}
                            style={inputStyle}
                        />
                    </div>
                    <div style={{ marginBottom: '14px' }}>
                        <label style={labelStyle}>Transfer reference / session ID</label>
                        <input
                            value={form.reference} maxLength={64} placeholder="From your bank's receipt"
                            onChange={e => setForm({ ...form, reference: e.target.value })}
                            style={inputStyle}
                        />
                    </div>
                    <div style={{ marginBottom: '16px' }}>
                        <label style={labelStyle}>Screenshot (optional)</label>
                        <label style={{
                            display: 'flex', alignItems: 'center', gap: '8px', background: '#f2f4f7',
                            borderRadius: '12px', padding: '12px 14px', cursor: 'pointer',
                            border: proof ? '2px solid #008751' : '2px dashed #c2e0cf'
                        }}>
                            <Upload size={16} color={proof ? '#008751' : '#8fa396'} />
                            <span style={{ fontSize: '0.8rem', color: proof ? '#008751' : '#8fa396', fontWeight: proof ? 600 : 400 }}>
                                {proof ? proof.name : 'Tap to attach (max 5MB)'}
                            </span>
                            <input type="file" accept="image/*,.pdf" onChange={pickFile} style={{ display: 'none' }} />
                        </label>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.4fr', gap: '10px' }}>
                        <button type="button" onClick={() => setStep('pay')} disabled={submitting} style={btn('#f2f4f7', '#4a5e52', submitting)}>
                            Back
                        </button>
                        <button type="submit" disabled={submitting} style={btn('#008751', 'white', submitting)}>
                            {submitting ? 'Sending...' : 'Submit request'}
                        </button>
                    </div>
                </form>
            )}

            {/* DONE */}
            {step === 'done' && (
                <div style={{ textAlign: 'center', padding: '8px 0' }}>
                    <CheckCircle size={40} color="#008751" style={{ marginBottom: '10px' }} />
                    <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#0d1b12', marginBottom: '6px' }}>
                        Request sent
                    </div>
                    <div style={{ fontSize: '0.8rem', color: '#4a5e52', lineHeight: 1.5, marginBottom: '16px' }}>
                        The treasurer will check the payment. You'll get a notification when your
                        {' '}{tokens} token{tokens !== 1 ? 's are' : ' is'} added or if there's a problem.
                    </div>
                    <button onClick={onClose} style={btn('#008751', 'white')}>Done</button>
                </div>
            )}
        </ModalShell>
    )
}