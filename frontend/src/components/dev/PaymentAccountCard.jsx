import { useState, useEffect } from 'react'
import { Landmark, Pencil, ShieldCheck, CheckCircle } from 'lucide-react'
import { getPaymentAccount, updatePaymentAccount } from '../../services/paymentAccount.service'
import { formatDate } from '../../utils/dates'
import { labelStyle, inputStyle, btn, errorBox } from '../tokens/styles'

const EMPTY = { bankName: '', accountNumber: '', accountName: '' }

const Detail = ({ label, value }) => (
    <div style={{ padding: '7px 0', borderBottom: '1px solid #f2f4f7' }}>
        <div style={{ fontSize: '0.65rem', color: '#8fa396', fontWeight: 600, textTransform: 'uppercase' }}>{label}</div>
        <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#0d1b12' }}>{value}</div>
    </div>
)

export default function PaymentAccountCard({ card, sectionHead }) {
    const [account, setAccount] = useState(undefined)   // undefined = loading, null = none set
    const [mode, setMode] = useState('view')            // view | edit | confirm
    const [form, setForm] = useState(EMPTY)
    const [pin, setPin] = useState('')
    const [saving, setSaving] = useState(false)
    const [error, setError] = useState('')
    const [done, setDone] = useState(false)

    useEffect(() => {
        getPaymentAccount()
            .then(res => setAccount(res?.data || null))
            .catch(() => setAccount(null))
    }, [])

    const startEdit = () => {
        setForm(account
            ? { bankName: account.bank_name, accountNumber: account.account_number, accountName: account.account_name }
            : EMPTY)
        setPin(''); setError(''); setDone(false); setMode('edit')
    }

    const next = () => {
        setError('')
        if (form.bankName.trim().length < 2) return setError('Enter the bank name.')
        if (!/^\d{10}$/.test(form.accountNumber)) return setError('Account number must be exactly 10 digits.')
        if (form.accountName.trim().length < 2) return setError('Enter the account name.')
        if (account
            && account.bank_name === form.bankName.trim()
            && account.account_number === form.accountNumber
            && account.account_name === form.accountName.trim()) {
            return setError('Nothing has changed.')
        }
        setMode('confirm')
    }

    const save = async () => {
        setSaving(true)
        setError('')
        try {
            const res = await updatePaymentAccount({ ...form, pin })
            setAccount(res.data)          // the screen updates straight away, no refresh needed
            setMode('view')
            setDone(true)
        } catch (err) {
            setError(err.response?.data?.message || 'Could not update the account.')
            setPin('')
        } finally {
            setSaving(false)
        }
    }

    return (
        <>
            <div style={{ ...sectionHead, marginTop: '16px' }}>Payment account</div>
            <div style={card}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                    <Landmark size={16} color="#008751" />
                    <span style={{ fontSize: '0.8rem', color: '#4a5e52' }}>Where members send token payments</span>
                </div>

                {error && <div style={errorBox}>{error}</div>}

                {done && (
                    <div style={{
                        background: '#e6f4ee', color: '#008751', fontSize: '0.78rem', fontWeight: 600,
                        padding: '10px 12px', borderRadius: '10px', marginBottom: '10px',
                        display: 'flex', alignItems: 'center', gap: '6px'
                    }}>
                        <CheckCircle size={14} /> Updated. The treasurer and coordinator were notified.
                    </div>
                )}

                {account === undefined && <div style={{ fontSize: '0.8rem', color: '#8fa396' }}>Loading...</div>}

                {mode === 'view' && account !== undefined && (
                    <>
                        {account ? (
                            <>
                                <Detail label="Bank" value={account.bank_name} />
                                <Detail label="Account number" value={account.account_number} />
                                <Detail label="Account name" value={account.account_name} />
                                {account.updated_at && (
                                    <div style={{ fontSize: '0.68rem', color: '#8fa396', margin: '8px 0 12px' }}>
                                        Last changed {formatDate(account.updated_at)}
                                        {account.updated_by_first ? ` by ${account.updated_by_first}` : ''}
                                    </div>
                                )}
                            </>
                        ) : (
                            <div style={{ fontSize: '0.8rem', color: '#8fa396', marginBottom: '12px' }}>
                                No account set yet. Members can't buy tokens until you add one.
                            </div>
                        )}
                        <button onClick={startEdit} style={btn('#eaf2fb', '#2b6cb0')}>
                            <Pencil size={14} /> {account ? 'Change account' : 'Add account'}
                        </button>
                    </>
                )}

                {mode === 'edit' && (
                    <>
                        <div style={{ marginBottom: '12px' }}>
                            <label style={labelStyle}>Bank name</label>
                            <input
                                value={form.bankName} maxLength={60}
                                onChange={e => setForm({ ...form, bankName: e.target.value })}
                                style={inputStyle}
                            />
                        </div>
                        <div style={{ marginBottom: '12px' }}>
                            <label style={labelStyle}>Account number</label>
                            <input
                                value={form.accountNumber} inputMode="numeric" placeholder="10 digits"
                                onChange={e => setForm({ ...form, accountNumber: e.target.value.replace(/\D/g, '').slice(0, 10) })}
                                style={inputStyle}
                            />
                        </div>
                        <div style={{ marginBottom: '14px' }}>
                            <label style={labelStyle}>Account name</label>
                            <input
                                value={form.accountName} maxLength={100}
                                onChange={e => setForm({ ...form, accountName: e.target.value })}
                                style={inputStyle}
                            />
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.4fr', gap: '10px' }}>
                            <button onClick={() => setMode('view')} style={btn('#f2f4f7', '#4a5e52')}>Cancel</button>
                            <button onClick={next} style={btn('#008751', 'white')}>Continue</button>
                        </div>
                    </>
                )}

                {mode === 'confirm' && (
                    <>
                        {account && (
                            <div style={{ background: '#f2f4f7', borderRadius: '10px', padding: '10px 12px', marginBottom: '8px', fontSize: '0.78rem', color: '#8fa396' }}>
                                <div style={{ fontWeight: 700, marginBottom: '2px' }}>Current</div>
                                {account.bank_name} · {account.account_number} · {account.account_name}
                            </div>
                        )}
                        <div style={{ background: '#e6f4ee', borderRadius: '10px', padding: '10px 12px', marginBottom: '14px', fontSize: '0.82rem', color: '#0d1b12' }}>
                            <div style={{ fontWeight: 700, color: '#008751', marginBottom: '2px' }}>New</div>
                            {form.bankName.trim()} · {form.accountNumber} · {form.accountName.trim()}
                        </div>

                        <label style={{ ...labelStyle, display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <ShieldCheck size={13} /> Enter your PIN to confirm
                        </label>
                        <input
                            type="password" inputMode="numeric" autoComplete="off"
                            maxLength={6} value={pin}
                            onChange={e => setPin(e.target.value.replace(/\D/g, ''))}
                            style={{ ...inputStyle, marginBottom: '14px', letterSpacing: '4px' }}
                        />
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.4fr', gap: '10px' }}>
                            <button onClick={() => { setMode('edit'); setError('') }} disabled={saving} style={btn('#f2f4f7', '#4a5e52', saving)}>
                                Back
                            </button>
                            <button onClick={save} disabled={saving || pin.length < 4} style={btn('#008751', 'white', saving || pin.length < 4)}>
                                {saving ? 'Saving...' : 'Confirm change'}
                            </button>
                        </div>
                    </>
                )}
            </div>
        </>
    )
}